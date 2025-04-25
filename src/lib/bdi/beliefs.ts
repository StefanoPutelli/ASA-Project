// src/lib/beliefs.ts
import { MyAgent } from "../../MyAgent.js";

export function updateBeliefs(agent: MyAgent): void {
  const you = agent.you;
  if (!you) return;

  const tileUnderYou = agent.map.get(`${you.x},${you.y}`);
  const parcelsCarried = agent.parcelsSensing.filter(p => p.carriedBy === you.id);
  const parcelsOnGround = agent.parcelsSensing.filter(p => p.carriedBy !== you.id);
  const isOnUnpickedParcel = parcelsOnGround.some(p => p.x === you.x && p.y === you.y);

  // Aggiungiamo questi beliefs come proprietà dell'agente
  agent.beliefs = {
    isOnDeliveryPoint: tileUnderYou?.type == "2",
    isOnUnpickedParcel,
    isCarryingParcels: parcelsCarried.length > 0,
    canSeeParcelsOnGround: parcelsOnGround.length > 0,
  };
}
