// monteCarloPlanner.ts – Planner ottimizzato con Beam Search + penalità di carico
// Penalità temporale cresce linearmente con il numero di pacchi già caricati.

import type { Parcel, Tile } from "@unitn-asa/deliveroo-js-client";
import { computeDistanceAStar } from "./astar.js";
import { getClosestDeliveryPoint } from "./closestDP.js";
import type { MyAgent } from "src/MyAgent.js";

/**************** CONFIG ****************/

const DECAY_LAMBDA = 1;        // punti persi per secondo di viaggio
const LOAD_MULTIPLIER = 100;     // incremento percentuale di penalità per OGNI pacco già a bordo
const BEAM_WIDTH = 6;          // stati mantenuti per profondità
const MAX_EXPANSIONS = 120;    // limite globale di espansioni

/************* DISTANCE CACHE ***********/

class DistanceCache {
  private readonly cache = new Map<string, number>();
  constructor(private readonly map: Map<string, Tile>) {}

  get(x1: number, y1: number, x2: number, y2: number): number | undefined {
    const key = `${x1},${y1}|${x2},${y2}`;
    let d = this.cache.get(key);
    if (d === undefined) {
      d = computeDistanceAStar(x1, y1, x2, y2, this.map)?.distance;
      if (d !== undefined) this.cache.set(key, d);
    }
    return d;
  }
}

/************** TYPES *******************/

export interface GainPlan {
  gain: number;
  sequence: Parcel[];
  deliveryPoint: Tile;
}

interface PartialState {
  x: number;
  y: number;
  t: number;            // ms trascorsi
  reward: number;       // valore complessivo (valore pacchi consegnati - penalità)
  valueSum: number;     // somma reward base consegnati
  remaining: Parcel[];
  seq: Parcel[];        // pacchi già consegnati (ordine)
}

/************ MAIN FUNCTION *************/

export function bestPlanMonteCarlo(
  parcels: Parcel[],
  agent: MyAgent,
  _iterations = 64 // lasciato per compatibilità, non usato
): GainPlan | undefined {
  const you = agent.you;
  if (!you || parcels.length === 0) return undefined;

  const map = agent.beliefs.mapWithAgentObstacles ?? agent.map;
  const cache = new DistanceCache(map);

  const totalBaseReward = parcels.reduce((s, p) => s + p.reward, 0);

  let best: PartialState | undefined;
  let bestScore = -Infinity;
  let expansions = 0;

  let beam: PartialState[] = [
    {
      x: you.x,
      y: you.y,
      t: 0,
      reward: 0,
      valueSum: 0,
      remaining: parcels.slice(),
      seq: []
    }
  ];

  while (beam.length && expansions < MAX_EXPANSIONS) {
    const newBeam: PartialState[] = [];

    for (const state of beam) {
      // upper‑bound ottimistico (ignora carico futuro per massimizzare pruning)
      const optimistic = state.valueSum + (totalBaseReward - state.valueSum) - DECAY_LAMBDA * (state.t / 1000);
      if (optimistic <= bestScore) continue;

      for (const p of state.remaining) {
        if (expansions++ >= MAX_EXPANSIONS) break;

        const dPick = cache.get(state.x, state.y, p.x, p.y);
        if (dPick === undefined) continue;

        const dp = getClosestDeliveryPoint(p.x, p.y, agent);
        if (!dp) continue;
        const dDrop = cache.get(p.x, p.y, dp.x, dp.y);
        if (dDrop === undefined) continue;

                const travelTiles = dPick + dDrop;
        const currentLoad = state.seq.length + 1; // pacchi che avrai a bordo durante questo tragitto
        const loadFactor = 1 + currentLoad * LOAD_MULTIPLIER;
        // viaggio "più lento" se carichi
        const travelMs = travelTiles * agent.avgLoopTime * loadFactor;
        const newTime = state.t + travelMs;

        const newValueSum = state.valueSum + p.reward;
        const newReward = newValueSum - DECAY_LAMBDA * (newTime / 1000);

        const remaining = state.remaining.filter(q => q.id !== p.id);
        const newState: PartialState = {
          x: dp.x,
          y: dp.y,
          t: newTime,
          reward: newReward,
          valueSum: newValueSum,
          remaining,
          seq: [...state.seq, p]
        };

        if (newReward > bestScore) {
          bestScore = newReward;
          best = newState;
        }
        newBeam.push(newState);
      }
      if (expansions >= MAX_EXPANSIONS) break;
    }

    newBeam.sort((a, b) => b.reward - a.reward);
    beam = newBeam.slice(0, BEAM_WIDTH);
  }

  if (!best || bestScore <= 0) return undefined;
  const last = best.seq[best.seq.length - 1];
  const dp = getClosestDeliveryPoint(last.x, last.y, agent);
  return {
    gain: bestScore,
    sequence: best.seq,
    deliveryPoint: dp!
  };
}
