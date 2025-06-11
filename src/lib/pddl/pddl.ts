import { Parcel, Tile } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "src/MyAgent.js";
import { computeDistanceAStar } from "../utils/astar.js";
import { getClosestDeliveryPoint } from "../utils/closestDP.js";
import { GainPlan } from "../utils/gain.js";
import { onlineSolver, PddlPlanStep } from "@unitn-asa/pddl-client";

// ---------------------------------------------------------------------------
// Dominio PDDL con vincolo: si può consegnare solo su un delivery‑point.
// ---------------------------------------------------------------------------
const DOMAIN = `
(define (domain deliveroo)
  (:requirements :strips :typing :action-costs)
  (:types parcel location)

  (:predicates (agent-at ?l - location)
               (parcel-at ?p - parcel ?l - location)
               (carrying ?p - parcel)
               (delivered ?p - parcel)
               (is-dp ?l - location)
               (connected ?from - location ?to - location))

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
    :precondition (and (agent-at ?l) (is-dp ?l) (carrying ?p))
    :effect (and (delivered ?p) (not (carrying ?p))))
)`;

const MAX_LOCATIONS = 4000;
const locId = (x: number, y: number) => `l_${x}_${y}`;
const parcelId = (i: number) => `p${i}`;

export async function gainMultiplePddl(parcelsList: Parcel[], agent: MyAgent): Promise<GainPlan | undefined> {
  const you = agent.you;
  if (!you) return undefined;

  const startLoc = locId(you.x, you.y);

  // ---------------------- build parcels array con DP validi --------------
  const parcels = parcelsList.flatMap((p, i) => {
    const dp = getClosestDeliveryPoint(p.x, p.y, agent);
    if (!dp) return []; // scarta pacco se non c'è delivery point raggiungibile
    return [{
      parcel: p,
      id: parcelId(i),
      loc: locId(p.x, p.y),
      delivery: dp as Tile,
    }];
  });
  if (parcels.length === 0) return undefined;

  // ----------------- costruisci sotto‑grafo rilevante --------------------
  const locationSet = new Map<string, { x: number; y: number }>();
  const addPath = (sx: number, sy: number, gx: number, gy: number) => {
    const a = computeDistanceAStar(sx, sy, gx, gy, agent.map);
    if (!a || !("path" in a)) return;
    // @ts-ignore path array
    for (const n of a.path) locationSet.set(locId(n.x, n.y), { x: n.x, y: n.y });
  };
  for (const { parcel, delivery } of parcels) {
    addPath(you.x, you.y, parcel.x, parcel.y);
    addPath(parcel.x, parcel.y, delivery.x, delivery.y);
  }
  if (locationSet.size > MAX_LOCATIONS) return undefined;

  // ----------------- connected facts ------------------------------------
  const isFree = (x: number, y: number) => agent.map.get(`${x},${y}`)?.type !== 0;
  const moves = [ [1,0], [-1,0], [0,1], [0,-1] ];
  const connected: string[] = [];
  for (const [id, { x, y }] of locationSet) {
    for (const [dx, dy] of moves) {
      const nx = x + dx, ny = y + dy;
      if (!isFree(nx, ny)) continue;
      const nid = locId(nx, ny);
      if (!locationSet.has(nid)) continue;
      connected.push(`(connected ${id} ${nid})`);
    }
  }

  // --------------------- INIT & GOAL ------------------------------------
  const locationObjects = [...locationSet.keys()].join(" ");
  const parcelObjects = parcels.map(p => p.id).join(" ");
  const parcelInits = parcels.map(p => `(parcel-at ${p.id} ${p.loc})`).join("\n         ");

  const dpSet = new Set<string>();
  parcels.forEach(p => dpSet.add(locId(p.delivery.x, p.delivery.y)));
  const dpFacts = [...dpSet].map(id => `(is-dp ${id})`).join("\n         ");

  const goalDelivered = parcels.map(p => `(delivered ${p.id})`).join("\n            ");

  const PROBLEM = `
(define (problem deliveroo-instance)
  (:domain deliveroo)
  (:objects ${locationObjects} - location
           ${parcelObjects}   - parcel)
  (:init (agent-at ${startLoc})
         ${parcelInits}
         ${dpFacts}
         ${connected.join("\n         ")}
         (= (total-cost) 0))
  (:goal (and ${goalDelivered}))
  (:metric minimize (total-cost))
)`;

  // ------------------- chiamata planner ---------------------------------
  let steps: PddlPlanStep[];
  try {
    steps = await onlineSolver(DOMAIN, PROBLEM);
  } catch (err) {
    console.error("[PDDL] onlineSolver error", err);
    return undefined;
  }
  if (!steps?.length) return undefined;

  // --------------- parsing pickup & delivery ----------------------------
  const pickSequence: Parcel[] = [];
  for (const s of steps) {
    if (s.action.toLowerCase() === "pickup") {
      const pid = s.args[0].toLowerCase();
      const found = parcels.find(p => p.id === pid)?.parcel;
      if (found) pickSequence.push(found);
    }
  }
  const lastDeliver = [...steps].reverse().find(s => s.action.toLowerCase() === "deliver");
  if (!lastDeliver) return undefined;
  const dpId = lastDeliver.args[1]; // location arg
  const nums = dpId.match(/\d+/g);
  if (!nums || nums.length < 2) return undefined;
  const deliveryPoint: Tile = { x: parseInt(nums[0]), y: parseInt(nums[1]) } as Tile;

  // ------------------- gain --------------------------------------------
  let totalDist = 0; let px = you.x, py = you.y;
  for (const p of pickSequence) {
    const d = computeDistanceAStar(px, py, p.x, p.y, agent.beliefs.mapWithAgentObstacles)?.distance;
    if (d === undefined) return undefined;
    totalDist += d; px = p.x; py = p.y;
  }
  const d2 = computeDistanceAStar(px, py, deliveryPoint.x, deliveryPoint.y, agent.beliefs.mapWithAgentObstacles)?.distance;
  if (d2 === undefined) return undefined;
  totalDist += d2;

  const rewards = [...agent.beliefs.parcelsCarried.map(p => p.reward), ...pickSequence.map(p => p.reward)];
  const totalReward = rewards.reduce((s, r) => s + r, 0);
  const penalty = rewards.reduce((s, r) => s + Math.min(r, totalDist), 0);
  const netGain = totalReward - (penalty * agent.avgLoopTime) / 1000;

  return { gain: Math.max(0, netGain), sequence: pickSequence, deliveryPoint } as GainPlan;
}
