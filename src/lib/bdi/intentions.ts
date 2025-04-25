// src/lib/intentions.ts
import { MyAgent } from "../../MyAgent.js";
import type { Desire } from "./desires.js";
import * as utils from "../utils/z.index.js";

export async function executeIntention(agent: MyAgent, desire: Desire): Promise<void> {
  const { api } = agent;

  switch (desire) {
    case "deliver": {
      api.emit("putdown");
      console.log("Intention: putdown");
      break;
    }

    case "pickup": {
      api.emit("pickup");
      console.log("Intention: pickup");
      break;
    }

    case "go-to": {
      const direction = utils.getDirectionToClosestParcel(agent);
      if (direction) {
        api.emit("move", direction);
        console.log("Intention: go-to →", direction);
      } else {
        console.log("Intention: go-to → no parcel visible");
      }  
      break;
    }

    case "go-to-deliver": {
      const direction = utils.getDirectionToClosestDeliveryPoint(agent);
      if (direction) {
        api.emit("move", direction);
        console.log("Intention: go-to-deliver →", direction);
      } else {
        console.log("Intention: go-to-deliver → already on delivery point");
      }
      break;
    }

    case "explore": {
      const direction = utils.getValidExploreDirection(agent);
      if (direction) {
        agent.api.emit("move", direction);
        console.log("Intention: explore →", direction);
      } else {
        console.log("Intention: explore → no valid moves");
      }
      break;
    }

    default:
      console.warn("Unknown intention:", desire);
  }
}
