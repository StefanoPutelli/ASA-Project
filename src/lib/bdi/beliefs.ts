// src/lib/beliefs.ts
import { Tile } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "../../MyAgent.js";
import { getDirectionOfAgents } from "../utils/getDirOfAgents.js";

export function updateBeliefs(agent: MyAgent): void {
  const you = agent.you;
  if (!you) return;

  const tileUnderYou = agent.map.get(`${you.x},${you.y}`);
  const parcelsCarried = agent.parcelsSensing.filter(p => p.carriedBy === you.id);
  const parcelsOnGround = agent.parcelsSensing.filter(p => !p.carriedBy);
  const isOnUnpickedParcel = parcelsOnGround.some(p => p.x === you.x && p.y === you.y);
  const deliveryPoints = Array.from(agent.map.values()).filter(tile => tile.type == 2);

  const agentsWithPredictions = getDirectionOfAgents(agent.agentsSensing);

  const mapWithAgentObstacles = new Map<string, Tile>();
  // copia tutti i tile originali
  for (const [key, tile] of agent.map.entries()) {
    mapWithAgentObstacles.set(key, { ...tile });
  }
  // per ogni agente NON io, marca il tile come muro ("0")
  for (const other of agent.agentsSensing[agent.agentsSensing.length - 1]) {
    if (other.id === you.id) continue;
    const key = `${other.x},${other.y}`;
    const t = mapWithAgentObstacles.get(key);
    if (t) {
      mapWithAgentObstacles.set(key, { ...t, type: 0 });
    }
  }

  // --- Memoria ultime 5 posizioni ---
  const posKey = `${you.x},${you.y}`;
  const lastPositions = agent.beliefs?.lastPositions ?? [];
  if (lastPositions.length === 0 || lastPositions[lastPositions.length - 1] !== posKey) {
    lastPositions.push(posKey);
    if (lastPositions.length > 5) lastPositions.shift();
  }

  // --- Loop detection ---
  const uniquePositions = new Set(lastPositions);
  const isInLoop = uniquePositions.size <= 2;

  // Aggiungiamo questi beliefs come proprietà dell'agente
  agent.beliefs = {
    isOnDeliveryPoint: tileUnderYou?.type == 2,
    isOnUnpickedParcel,
    isCarryingParcels: parcelsCarried.length > 0,
    canSeeParcelsOnGround: parcelsOnGround.length > 0,
    carriedScore: parcelsCarried.reduce((sum, current) => sum + current.reward, 0),
    parcelsCarried,
    parcelsOnGround,
    deliveryPoints,
    agentsWithPredictions,
    mapWithAgentObstacles,
    exploreTarget: agent.beliefs.exploreTarget,
    lastPositions,
    isInLoop,
    // spawnerHotspots : agent.whereparcelspawns === 1 ? (agent.beliefs.spawnerHotspots.length === 0 ? findSpawners(agent) : agent.beliefs.spawnerHotspots) : [], // Se non sono in modalità spawner, mantieni l'array vuoto
  };
}


