import * as utils from "../utils/z.index.js";
import { getDirection } from "../utils/getDirection.js";
export async function executeIntention(agent, desire) {
    const { api } = agent;
    switch (desire.type) {
        case "deliver": {
            return new Promise((resolve) => {
                agent.intentions.push("Intention: putdown");
                api.emit("putdown", undefined, () => resolve());
            });
        }
        case "pickup": {
            return new Promise((resolve) => {
                api.emit("pickup", () => {
                    agent.intentions.push("Intention: pickup");
                    resolve();
                });
            });
        }
        case "go-to-parcel": {
            return new Promise((resolve) => {
                if (!agent.you) {
                    resolve();
                    return;
                }
                const tile = utils.computeDistanceAStar(agent.you?.x, agent.you?.y, desire.parcel.x, desire.parcel.y, agent.beliefs.mapWithAgentObstacles)?.path[1];
                if (!tile) {
                    resolve();
                    return;
                }
                const direction = getDirection(agent.you?.x, agent.you?.y, tile?.x, tile?.y);
                if (direction) {
                    api.emit("move", direction, () => {
                        agent.intentions.push("Intention: go-to-parcel →" + direction);
                        resolve();
                    });
                }
                else {
                    agent.intentions.push("Intention: go-to-parcel → blocked path");
                    resolve();
                }
            });
        }
        case "go-to-deliver": {
            return new Promise((resolve) => {
                if (!agent.you) {
                    resolve();
                    return;
                }
                const tile = utils.computeDistanceAStar(agent.you?.x, agent.you?.y, desire.point.x, desire.point.y, agent.beliefs.mapWithAgentObstacles)?.path[1];
                if (!tile) {
                    resolve();
                    return;
                }
                const direction = getDirection(agent.you?.x, agent.you?.y, tile?.x, tile?.y);
                if (direction) {
                    api.emit("move", direction, () => {
                        agent.intentions.push("Intention: go-to-deliver →" + direction);
                        resolve();
                    });
                }
                else {
                    agent.intentions.push("Intention: go-to-deliver → blocked path");
                    resolve();
                }
            });
        }
        case "explore": {
            return new Promise((resolve) => {
                const direction = utils.getValidExploreDirection(agent);
                if (direction) {
                    agent.api.emit("move", direction, () => {
                        agent.intentions.push("Intention: explore →" + direction);
                        resolve();
                    });
                }
                else {
                    agent.intentions.push("Intention: explore → no valid moves");
                    resolve();
                }
            });
        }
        default:
            console.warn("Unknown intention:", desire);
            return Promise.resolve();
    }
}
