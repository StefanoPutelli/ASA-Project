import { MyAgent } from "../../MyAgent.js";

export type Desire = "deliver" | "pickup" | "go-to-deliver" | "go-to" | "explore";

export function generateDesires(agent: MyAgent): Desire[] {
  const desires: Desire[] = [];
  const b = agent.beliefs;

  if (!agent.you) return ["explore"];

  // 1. Se sto trasportando pacchi e sono sopra un punto di consegna, voglio consegnare subito
  if (b.isCarryingParcels && b.isOnDeliveryPoint) desires.push("deliver");

  // 2. Se sono sopra un pacco non ancora raccolto, voglio raccoglierlo
  if (b.isOnUnpickedParcel) desires.push("pickup");

  // 3. Se trasporto pacchi ma non sono ancora sul punto di consegna, voglio andarci
  if (b.isCarryingParcels && !b.isOnDeliveryPoint) desires.push("go-to-deliver");

  // 4. Se vedo pacchi a terra voglio andare a prenderli
  if (b.canSeeParcelsOnGround) desires.push("go-to");

  // 5. Nessuna altra attività urgente → esploro
  if (desires.length === 0) desires.push("explore");

  return desires;
}
