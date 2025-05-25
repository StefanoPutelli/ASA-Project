// monteCarloPlanner.ts – Valutazione di piani pickup‑&‑delivery tramite Monte‑Carlo
// Dipendenze:
//   - computeDistanceAStar  : funzione che restituisce { distance: number } | undefined
//   - getClosestDeliveryPoint: trova il Tile di consegna più vicino a (x,y)
//   - MyAgent (tipi Deliveroo)
// Usa TypeScript ma compila anche in JS (rimuovi i tipi se necessario)

import { Parcel, Tile } from "@unitn-asa/deliveroo-js-client";
import { computeDistanceAStar } from "./astar.js";
import { getClosestDeliveryPoint } from "./closestDP.js";
import { MyAgent } from "src/MyAgent.js";

/*******************
 * CONFIGURAZIONE  *
 *******************/

/** Velocità di decadimento del reward [punti / sec].
 *  Se λ=1, un pacco da 30 vale 0 dopo 30 s. */
const LAMBDA = 1; // tuning!

/** Numero di rollout Monte‑Carlo per piano */
const DEFAULT_ITERATIONS = 64;

/** Rumore gaussiano (σ proporzionale alla distanza) per simulare congestione */
const STD_CONGESTION = 0.25; // 0 = disattivato

/** Numero massimo di pacchi presi in considerazione in una sequenza */
const MAX_SEQUENCE_LEN = 3;

/** Numero massimo di pacchi candidati (beam width) */
const TOP_K = 5;

/*******************
 *  TIPI & HELPERS *
 *******************/

interface SimParcel {
  id: string;
  x: number;
  y: number;
  reward0: number;
  /** Tempo già trascorso (ms) prima dell'inizio della simulazione */
  livedMs: number;
}

/**
 * Cache per le distanze A* (immutevole finché la mappa non cambia).
 * Chiave = "x1,y1|x2,y2".
 */
class DistanceCache {
  private readonly map = new Map<string, number>();
  private readonly gameMap: Map<string, Tile>;

  constructor(gameMapArr: Tile[]) {
    this.gameMap = new Map<string, Tile>();
    for (const t of gameMapArr) this.gameMap.set(`${t.x},${t.y}`, t);
  }

  get(x1: number, y1: number, x2: number, y2: number): number | undefined {
    const k = `${x1},${y1}|${x2},${y2}`;
    let d = this.map.get(k);
    if (d === undefined) {
      d = computeDistanceAStar(x1, y1, x2, y2, this.gameMap)?.distance;
      if (d !== undefined) this.map.set(k, d);
    }
    return d;
  }
}

/*******************
 *  MONTE-CARLO SIM *
 *******************/

function gaussianNoise(std: number): number {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Simula una corsa (rollout) per un piano pickup→DP e restituisce il reward. */
function simulatePlanOnce(
  startX: number,
  startY: number,
  carried: SimParcel[],
  pickupSeq: SimParcel[],
  deliveryPoint: Tile,
  cache: DistanceCache,
  stepMs: number
): number {
  let timeMs = 0;
  let cx = startX;
  let cy = startY;

  const dist = (tx: number, ty: number): number => {
    const d = cache.get(cx, cy, tx, ty);
    if (d === undefined) return Infinity;
    const noisy = d + gaussianNoise(d * STD_CONGESTION);
    return Math.max(1, Math.round(noisy));
  };

  // 1) pickup programmati
  for (const p of pickupSeq) {
    const d = dist(p.x, p.y);
    if (!Number.isFinite(d)) return 0; // percorso bloccato
    timeMs += d * stepMs;
    cx = p.x;
    cy = p.y;
    carried.push({ ...p });
  }

  // 2) vai al delivery point
  const dDP = dist(deliveryPoint.x, deliveryPoint.y);
  if (!Number.isFinite(dDP)) return 0;
  timeMs += dDP * stepMs;

  // 3) reward residuo
  let reward = 0;
  for (const p of carried) {
    const lifeSec = (p.livedMs + timeMs) / 1000;
    reward += Math.max(0, p.reward0 - LAMBDA * lifeSec);
  }
  return reward;
}

/*******************
 *  GENERATORE SEQUENZE  *
 *******************/

/**
 *  Restituisce un insieme limitato di sequenze (permutazioni) di pickup.
 *  Invece di enumerare *tutti* i sotto‑insiemi (O(n!)), applichiamo:
 *    1.  Selezione dei TOP_K pacchi col miglior rapporto (reward / distanza)
 *    2.  Permutazioni fino a MAX_SEQUENCE_LEN per tenere l'esplosione sotto controllo.
 */
function generateCandidateSequences(
  parcels: Parcel[],
  youX: number,
  youY: number,
  cache: DistanceCache
): Parcel[][] {
  /* 1) ranking per reward / distanza dalla posizione attuale */
  const scored = parcels.map(p => {
    const d = cache.get(youX, youY, p.x, p.y) ?? Infinity;
    return { p, score: p.reward / (d + 1) };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, TOP_K).map(o => o.p);

  /* 2) generazione permutazioni limitate */
  const res: Parcel[][] = [[]];

  function backtrack(path: Parcel[], remaining: Parcel[]) {
    if (path.length === MAX_SEQUENCE_LEN) return;
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      const newPath = [...path, next];
      res.push(newPath);
      backtrack(newPath, remaining.filter((_, idx) => idx !== i));
    }
  }
  backtrack([], top);
  return res;
}

/*******************
 *  API PRINCIPALE  *
 *******************/

export interface GainPlan {
  gain: number;
  sequence: Parcel[];
  deliveryPoint: Tile;
}

export function bestPlanMonteCarlo(
  parcels: Parcel[],
  agent: MyAgent,
  iterations: number = DEFAULT_ITERATIONS
): GainPlan | undefined {
  const you = agent.you;
  if (!you) return undefined;

  const cache = new DistanceCache(Array.from(agent.map.values()));

  const carriedInit: SimParcel[] = agent.beliefs.parcelsCarried.map(p => ({
    id: p.id,
    x: you.x,
    y: you.y,
    reward0: p.reward,
    livedMs: 0
  }));

  const sequences = generateCandidateSequences(parcels, you.x, you.y, cache);

  let best: GainPlan | undefined;
  for (const seq of sequences) {
    const last = seq.length ? seq[seq.length - 1] : undefined;
    const dp = getClosestDeliveryPoint(last?.x ?? you.x, last?.y ?? you.y, agent);
    if (!dp) continue;

    const simSeq: SimParcel[] = seq.map(p => ({
      id: p.id,
      x: p.x,
      y: p.y,
      reward0: p.reward,
      livedMs: 0
    }));

    let acc = 0;
    for (let i = 0; i < iterations; i++) {
      acc += simulatePlanOnce(
        you.x,
        you.y,
        [...carriedInit],
        simSeq,
        dp,
        cache,
        agent.avgLoopTime
      );
    }
    const avg = acc / iterations;

    if (!best || avg > best.gain) {
      best = { gain: avg, sequence: seq, deliveryPoint: dp };
    }
  }
  return best;
}

/*******************
 *  ESEMPIO USO    *
 *******************/
/*
import { bestPlanMonteCarlo } from "./monteCarloPlanner.js";

const plan = bestPlanMonteCarlo(visibleParcels, myAgent, 64);
if (plan) {
  console.log("Miglior piano MC:", plan.gain, plan.sequence.map(p => p.id));
  // muoviti verso plan.sequence[0] … ecc.
}
*/
