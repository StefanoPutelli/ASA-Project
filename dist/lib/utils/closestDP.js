import { computeDistanceAStar } from "./astar.js";
export function getClosestDeliveryPoint(x, y, agent) {
    const points = agent.beliefs.deliveryPoints;
    let closest = undefined;
    let bestDist = Infinity;
    for (const pt of points) {
        const dist = computeDistanceAStar(x, y, pt.x, pt.y, agent.beliefs.mapWithAgentObstacles)?.distance;
        // controlla esplicitamente undefined, così 0 viene considerato valido
        if (dist !== undefined && dist < bestDist) {
            bestDist = dist;
            closest = pt;
        }
    }
    return closest;
}
