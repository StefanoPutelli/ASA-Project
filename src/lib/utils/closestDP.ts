// src/lib/getClosestDeliveryPoint.ts
import type { Tile } from "@unitn-asa/deliveroo-js-client";
import { computeDistanceAStar } from "./astar.js";
import type { MyAgent } from "../../MyAgent.js";

export function getClosestDeliveryPoint(
  x: number,
  y: number,
  agent: MyAgent
): Tile | undefined {
  const points = agent.beliefs.deliveryPoints;
  let closest: Tile | undefined = undefined;
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
