// pddlPlanner.ts – PDDL‑based fallback planner using @unitn-asa/pddl-client
// ---------------------------------------------------------------------------
// Questa versione usa ESCLUSIVAMENTE le API dichiarate in src/types/pddl-api
// (onlineSolver, PddlPlanStep, ecc.).  Sostituisce l'algoritmo enumerativo
// quando il numero di parcels è elevato.
// ---------------------------------------------------------------------------

import { Parcel, Tile } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "src/MyAgent.js";
import { computeDistanceAStar } from "../utils/astar.js";
import { getClosestDeliveryPoint } from "../utils/closestDP.js";
import { GainPlan } from "../utils/gain.js";
import { onlineSolver, PddlPlanStep } from "@unitn-asa/pddl-client";

// ---------------------------------------------------------------------------
// DOMINIO PDDL (STRIPS + action‑costs)
// ---------------------------------------------------------------------------
const DOMAIN = `
(define (domain deliveroo)
  (:requirements :strips :typing :action-costs)
  (:types parcel location)

  (:predicates
    (agent-at ?l - location)
    (parcel-at ?p - parcel ?l - location)
    (carrying ?p - parcel)
    (delivered ?p - parcel)
    (connected ?from - location ?to - location)
  )

  (:functions (total-cost))

  (:action move
    :parameters (?from - location ?to - location)
    :precondition (and (agent-at ?from) (connected ?from ?to))
    :effect (and (not (agent-at ?from)) (agent-at ?to)
                 (increase (total-cost) 1)))

  (:action pickup
    :parameters (?p - parcel ?l - location)
    :precondition (and (agent-at ?l) (parcel-at ?p ?l) (not (carrying ?p)))
    :effect (and (carrying ?p) (not (parcel-at ?p ?l))))

  (:action deliver
    :parameters (?p - parcel ?l - location)
    :precondition (and (agent-at ?l) (carrying ?p))
    :effect (and (delivered ?p) (not (carrying ?p))))
)`;

/** Massimo numero di celle che inviamo al planner (per evitare istanze giganti) */
const MAX_LOCATIONS = 4000;

// Helper per nomi PDDL dei luoghi / parcels
const locId = (x: number, y: number) => `l_${x}_${y}`;
const parcelId = (i: number) => `p${i}`;

/**
 * Pianificazione PDDL.
 * Ritorna un GainPlan compatibile con gainMultiple(), oppure undefined
 * se non esiste un piano percorribile.
 */
export async function gainMultiplePddl(
  parcelsList: Parcel[],
  agent: MyAgent
): Promise<GainPlan | undefined> {
  const you = agent.you;
  if (!you) return undefined;

  // -------------------------------------------------------------------------
  // 1) Costruiamo l'insieme delle location da includere nel problema.
  // -------------------------------------------------------------------------
  const startLoc = locId(you.x, you.y);

  // Ogni parcel ottiene il DP più vicino in base all'euristica corrente.
  const parcels = parcelsList.map((p, i) => ({
    parcel: p,
    id: parcelId(i),
    loc: locId(p.x, p.y),
    delivery: getClosestDeliveryPoint(p.x, p.y, agent) as Tile,
  }));

  // Raccogliamo tutte le celle dei percorsi A* tra start ↔ pickups ↔ deliveries
  const locationSet = new Map<string, { x: number; y: number }>();
  const addPath = (sx: number, sy: number, gx: number, gy: number) => {
    const a = computeDistanceAStar(sx, sy, gx, gy, agent.map);
    if (!a || !('path' in a)) return;
    // @ts-ignore – assumiamo che .path sia presente (array di nodi {x,y})
    for (const n of a.path) {
      locationSet.set(locId(n.x, n.y), { x: n.x, y: n.y });
    }
  };

  for (const { parcel, delivery } of parcels) {
    addPath(you.x, you.y, parcel.x, parcel.y);
    addPath(parcel.x, parcel.y, delivery.x, delivery.y);
  }

  // Troppe celle → abortiamo
  if (locationSet.size > MAX_LOCATIONS) return undefined;

  // -------------------------------------------------------------------------
  // 2) Connettività grid 4‑neighbours
  // -------------------------------------------------------------------------
  const connected: string[] = [];
  const isFree = (x: number, y: number) => agent.map.get(`${x},${y}`)?.type !== 0;
  const moves = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const [id, { x, y }] of locationSet) {
    for (const [dx, dy] of moves) {
      const nx = x + dx,
        ny = y + dy;
      if (!isFree(nx, ny)) continue;
      const nid = locId(nx, ny);
      if (!locationSet.has(nid)) continue;
      connected.push(`(connected ${id} ${nid})`);
    }
  }

  // -------------------------------------------------------------------------
  // 3) Assemblaggio del problema PDDL
  // -------------------------------------------------------------------------
  const locationObjects = [...locationSet.keys()].join(" ");
  const parcelObjects = parcels.map(p => p.id).join(" ");

  const parcelInits = parcels
    .map(p => `(parcel-at ${p.id} ${p.loc})`)
    .join("\n        ");

  const goalDelivered = parcels
    .map(p => `(delivered ${p.id})`)
    .join("\n            ");

  const PROBLEM = `
(define (problem deliveroo-instance)
  (:domain deliveroo)
  (:objects ${locationObjects} - location
           ${parcelObjects}   - parcel)
  (:init (agent-at ${startLoc})
         ${parcelInits}
         ${connected.join("\n         ")}
         (= (total-cost) 0))
  (:goal (and ${goalDelivered}))
  (:metric minimize (total-cost))
)`;

  // -------------------------------------------------------------------------
  // 4) Richiesta al planner remoto
  // -------------------------------------------------------------------------
  let steps: PddlPlanStep[];
  try {
    steps = await onlineSolver(DOMAIN, PROBLEM);
  } catch (err) {
    console.error("onlineSolver error", err);
    return undefined;
  }
  if (!steps || !steps.length) return undefined;

  // -------------------------------------------------------------------------
  // 5) Parsing del piano in sequence/deliveryPoint
  // -------------------------------------------------------------------------
  const pickSequence: Parcel[] = [];
  for (const s of steps) {
    if (s.action === "pickup") {
      const pid = s.args[0];
      const pObj = parcels.find(p => p.id === pid)?.parcel;
      if (pObj) pickSequence.push(pObj);
    }
  }
  const lastDeliver = [...steps].reverse().find(s => s.action === "deliver");
  if (!lastDeliver) return undefined;
  const locToken = lastDeliver.args[1]; // es. l_5_9
  const [, lx, ly] = locToken.split("_");
  const deliveryPoint: Tile = { x: parseInt(lx), y: parseInt(ly) } as Tile;

  // -------------------------------------------------------------------------
  // 6) Calcolo del gain per restituire un GainPlan perfettamente compatibile
  // -------------------------------------------------------------------------
  let totalDist = 0;
  let px = you.x,
    py = you.y;
  for (const p of pickSequence) {
    const d = computeDistanceAStar(px, py, p.x, p.y, agent.beliefs.mapWithAgentObstacles)?.distance;
    if (d === undefined) return undefined;
    totalDist += d;
    px = p.x;
    py = p.y;
  }
  const d2 = computeDistanceAStar(px, py, deliveryPoint.x, deliveryPoint.y, agent.beliefs.mapWithAgentObstacles)?.distance;
  if (d2 === undefined) return undefined;
  totalDist += d2;

  const initialRewards = agent.beliefs.parcelsCarried.map(p => p.reward);
  const pickupRewards = pickSequence.map(p => p.reward);
  const allRewards = [...initialRewards, ...pickupRewards];

  const totalReward = allRewards.reduce((s, r) => s + r, 0);
  const penalty = allRewards
    .map(r => Math.min(r, totalDist))
    .reduce((s, m) => s + m, 0);

  const netGain = totalReward - (penalty * agent.avgLoopTime) / 1000;
  return {
    gain: Math.max(0, netGain),
    sequence: pickSequence,
    deliveryPoint,
  } as GainPlan;
}
