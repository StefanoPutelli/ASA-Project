import { Parcel, Tile } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "../../MyAgent.js";
import { gainMultiple, GainPlan } from "../utils/gain.js";

export type Desire = 
  | { type: "deliver" }
  | { type: "pickup"}
  | { type: "go-to-parcel"; parcel: Parcel }
  | { type: "go-to-deliver"; point: Tile }
  | { type: "explore" };

export function generateDesires(agent: MyAgent): Desire {
  const b = agent.beliefs;

  if (!agent.you) return {type: "explore"};

  // 1. Se sto trasportando pacchi e sono sopra un punto di consegna, voglio consegnare subito
  if (b.isCarryingParcels && b.isOnDeliveryPoint) return {type: "deliver"};

  // 2. Se sono sopra un pacco non ancora raccolto, voglio raccoglierlo
  if (b.isOnUnpickedParcel) return {type: "pickup"};

  const plan: GainPlan | undefined = gainMultiple(b.parcelsOnGround, agent);

  if (plan && plan?.gain > 0) {
    if (plan.sequence.length > 0) {
      return  {
          type: "go-to-parcel",
          parcel: plan.sequence[0],
        };
    }
    return {
      type: "go-to-deliver",
      point: plan.deliveryPoint,
    };
  }
  // 5. Nessuna altra attività urgente → esploro
  return {type: "explore"};
}