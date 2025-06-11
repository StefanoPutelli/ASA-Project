import { Parcel, Tile } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "../../MyAgent.js";
import { gainMultiple } from "../utils/gain.js";
import { GainPlan } from "../utils/gain.js";
import { gainMultiplePddl } from "../pddl/pddl.js";

export type Desire =
  | { type: "deliver" }
  | { type: "pickup" }
  | { type: "exit-loop" }
  | { type: "go-to-parcel"; parcel: Parcel }
  | { type: "go-to-deliver"; point: Tile }
  | { type: "explore" };

export async function generateDesires(agent: MyAgent): Promise<Desire> {
  const b = agent.beliefs;

  if (!agent.you) return { type: "explore" };

  // 1. Se sto trasportando pacchi e sono sopra un punto di consegna, voglio consegnare subito
  if (b.isCarryingParcels && b.isOnDeliveryPoint) return { type: "deliver" };

  // 2. Se sono sopra un pacco non ancora raccolto, voglio raccoglierlo
  if (b.isOnUnpickedParcel) return { type: "pickup" };

  if (b.isInLoop) return { type: "exit-loop" };
  
  if (b.parcelsOnGround.length > 0) {
    var plan: GainPlan | undefined = await gainMultiplePddl(b.parcelsOnGround, agent);
    console.log("Gain plan:", plan);
  } else {
    var plan: GainPlan | undefined = gainMultiple(b.parcelsOnGround, agent);
  }

  if (plan && plan?.gain > 0) {
    if (plan.sequence.length > 0) {
      agent.them?.bookMyParcels(plan.sequence, agent);
      return {
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
  return { type: "explore" };
}