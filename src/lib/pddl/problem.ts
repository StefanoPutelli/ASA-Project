import { Beliefset, PddlProblem } from "@unitn-asa/pddl-client";

export function buildPddlProblem(beliefs: Beliefset, desire: string) {
  
  switch (desire) {

    case "go-to-parcel": {
      
      break;
    }

    case "go-to-deliver": {
      
      break;
    }

    case "explore": {

      break;
    }

    default:
      console.warn("Unknown intention:", desire);
  }
}
