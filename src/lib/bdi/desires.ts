import { Parcel, Tile } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "../../MyAgent.js";
import { bestPlanMonteCarlo } from "../utils/gain_montecarlo.js";
import { gainMultiple } from "../utils/gain.js";
import { GainPlan } from "../utils/gain.js";

export type Desire = 
  | { type: "deliver" }
  | { type: "pickup"}
  | { type: "exit-loop"}
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

  if (b.isInLoop) return {type: "exit-loop"};

  if ( agent.gain_type === "monteCarlo" ) {
    var plan: GainPlan | undefined = bestPlanMonteCarlo(b.parcelsOnGround, agent);
  } else {
    var plan: GainPlan | undefined = gainMultiple(b.parcelsOnGround, agent);
  }

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