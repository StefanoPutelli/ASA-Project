import * as utils from "../utils/z.index.js";
import { getDirection } from "../utils/getDirection.js";
export async function executeIntention(agent, desire) {
    const { api } = agent;
    switch (desire.type) {
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
        case "go-to-parcel": {
            if (!agent.you) {
                break;
            }
            ;
            const tile = utils.computeDistanceAStar(agent.you?.x, agent.you?.y, desire.parcel.x, desire.parcel.y, agent.beliefs.mapWithAgentObstacles)?.path[1];
            if (!tile) {
                break;
            }
            ;
            const direction = getDirection(agent.you?.x, agent.you?.y, tile?.x, tile?.y);
            if (direction) {
                api.emit("move", direction);
                console.log("Intention: go-to-parcel →", direction);
            }
            else {
                console.log("Intention: go-to-parcel → blocked path");
            }
            break;
        }
        case "go-to-deliver": {
            if (!agent.you) {
                break;
            }
            ;
            const tile = utils.computeDistanceAStar(agent.you?.x, agent.you?.y, desire.point.x, desire.point.y, agent.beliefs.mapWithAgentObstacles)?.path[1];
            if (!tile) {
                break;
            }
            ;
            const direction = getDirection(agent.you?.x, agent.you?.y, tile?.x, tile?.y);
            if (direction) {
                api.emit("move", direction);
                console.log("Intention: go-to-deliver →", direction);
            }
            else {
                console.log("Intention: go-to-deliver → blocked path");
            }
            break;
        }
        case "explore": {
            const direction = utils.getValidExploreDirection(agent);
            if (direction) {
                agent.api.emit("move", direction);
                console.log("Intention: explore →", direction);
            }
            else {
                console.log("Intention: explore → no valid moves");
            }
            break;
        }
        default:
            console.warn("Unknown intention:", desire);
    }
}
