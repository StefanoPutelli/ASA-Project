import { Agent, Parcel, Tile } from "@unitn-asa/deliveroo-js-client";
import { computeDistanceAStar } from "./astar.js";
import { MyAgent } from "src/MyAgent.js";
import { getClosestDeliveryPoint } from "./closestDP.js";

export interface GainPlan {
    gain: number;
    sequence: Parcel[];        // l’ordine in cui raccogliere i parcels
    deliveryPoint: Tile;       // il punto di consegna finale
}

export function gain(
    parcel: Parcel,
    agent: MyAgent,
): number | undefined {

    const carriedScore = agent.beliefs.carriedScore;
    const parcelsCarried = agent.beliefs.parcelsCarried;
    const you = agent.you;
    if (!you) { return undefined };

    const d1 = computeDistanceAStar(you.x, you.y, parcel.x, parcel.y, agent.map)?.distance;
    const closestDP = getClosestDeliveryPoint(parcel.x, parcel.y, agent);

    if (!closestDP) { return undefined };


    const d2 = computeDistanceAStar(parcel.x, parcel.y, closestDP?.x, closestDP?.y, agent.map)?.distance;

    if (!d1 || !d2) { return undefined };

    return Math.max(0, carriedScore + parcel.reward - (1 + parcelsCarried.length) * (d1 + d2));

}


/**
 * Valuta tutte le sotto‐sequenze ordinate di parcels (incl. quella vuota),
 * e sceglie il piano che massimizza:
 *
 *   gain = ∑ reward_p  –  ∑ min(reward_p, totalDist)
 *
 * Dove totalDist è la lunghezza del percorso:
 *   you → pickup1 → … → pickupN → deliveryPoint
 *
 * @returns il piano con { gain, sequence, deliveryPoint } oppure undefined
 *          se nessuna sequenza è percorribile.
 */
export function gainMultiple(
    parcelsList: Parcel[],
    agent: MyAgent
): GainPlan | undefined {
    const you = agent.you;
    if (!you) return undefined;

    const startX = you.x, startY = you.y;

    // Parcels già caricati all’inizio
    const initialCarried = agent.beliefs.parcelsCarried;
    const initialRewards = initialCarried.map(p => p.reward);

    if (agent.whereparcelspawns === 1) {
        if(parcelsList.length >3){
            parcelsList.sort((a, b) => {
                const d1 = computeDistanceAStar(startX, startY, a.x, a.y, agent.map)?.distance;
                const d2 = computeDistanceAStar(startX, startY, b.x, b.y, agent.map)?.distance;
                if (d1 === undefined || d2 === undefined) return 0;
                return d1 - d2;
            });
            parcelsList = parcelsList.slice(0,3)
        }
    }

    // tutte le possibili sotto-sequenze ordinate (incl. [])
    const sequences = generateOrderedSubsets(parcelsList);
    let bestPlan: GainPlan | undefined = undefined;

    for (const seq of sequences) {

        let totalDist = 0;
        let px = startX, py = startY;
        let blocked = false;

        // 1) percorri tutti i pickup scelti
        for (const p of seq) {
            const d = computeDistanceAStar(px, py, p.x, p.y, agent.beliefs.mapWithAgentObstacles)?.distance;
            if (d === undefined) { blocked = true; break; }
            totalDist += d;
            px = p.x; py = p.y;
        }
        if (blocked) continue;

        // 2) vai al delivery point più vicino dall’ultima tappa
        const dp = getClosestDeliveryPoint(px, py, agent);
        if (!dp) continue;
        const d2 = computeDistanceAStar(px, py, dp.x, dp.y, agent.beliefs.mapWithAgentObstacles)?.distance;
        if (d2 === undefined) continue;
        totalDist += d2;

        // 3) calcola reward totale e penalty dinamico
        const pickupRewards = seq.map(p => p.reward);
        const allRewards = [...initialRewards, ...pickupRewards];

        const totalReward = allRewards.reduce((sum, r) => sum + r, 0);
        const penalty = allRewards
            .map(r => Math.min(r, totalDist))
            .reduce((sum, m) => sum + m, 0);

        const netGain = totalReward - (penalty * agent.avgLoopTime / 1000);

        // 4) aggiorna il miglior piano
        if (
            bestPlan === undefined ||
            netGain > bestPlan.gain
        ) {
            bestPlan = {
                gain: Math.max(0, netGain),
                sequence: seq,
                deliveryPoint: dp
            };
        }
    }
    return bestPlan;
}

function generateOrderedSubsets<T>(items: T[]): T[][] {
    const results: T[][] = [];
    const used = new Array<boolean>(items.length).fill(false);
    const current: T[] = [];

    function backtrack() {
        // ogni volta che entriamo qui, “current” è una nuova sequenza valida
        results.push([...current]);

        for (let i = 0; i < items.length; i++) {
            if (used[i]) continue;

            used[i] = true;
            current.push(items[i]);

            backtrack();          // esplora con items[i] in “current”

            current.pop();
            used[i] = false;
        }
    }

    backtrack();
    return results;
}