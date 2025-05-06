import { Tile } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "../../MyAgent.js";
import { computeDistanceAStar } from "./astar.js";
import { getDirection } from "./getDirection.js";
import findSpawners from "./findSpawners.js";
import { getValidExploreDirection } from "./getValidExploreDirection.js";

/**
 * Trova il tile valido più centrale del quadrante opposto a quello in cui si trova l'agente.
 */
export function getCentralTileInOppositeQuadrant(agent: MyAgent): Tile | undefined {
  const you = agent.you;
  if (!you) return undefined;

  const mapTiles = Array.from(agent.map.values()).filter(tile => tile.type !== 0);

  // Trova i limiti della mappa
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const tile of mapTiles) {
    if (tile.x < minX) minX = tile.x;
    if (tile.x > maxX) maxX = tile.x;
    if (tile.y < minY) minY = tile.y;
    if (tile.y > maxY) maxY = tile.y;
  }

  const midX = Math.floor((minX + maxX) / 2);
  const midY = Math.floor((minY + maxY) / 2);

  // Determina il quadrante corrente
  const isLeft = you.x <= midX;
  const isTop = you.y <= midY;

  // Opposto
  const targetQuadrant = {
    xRange: isLeft ? [midX + 1, maxX] : [minX, midX],
    yRange: isTop ? [midY + 1, maxY] : [minY, midY],
  };

  const centerX = (targetQuadrant.xRange[0] + targetQuadrant.xRange[1]) / 2;
  const centerY = (targetQuadrant.yRange[0] + targetQuadrant.yRange[1]) / 2;

  // Filtra i tile validi nel quadrante opposto
  const candidates = mapTiles.filter(t =>
    t.x >= targetQuadrant.xRange[0] &&
    t.x <= targetQuadrant.xRange[1] &&
    t.y >= targetQuadrant.yRange[0] &&
    t.y <= targetQuadrant.yRange[1]
  );

  // Seleziona quello più vicino al centro geometrico del quadrante
  let bestTile: Tile | undefined = undefined;
  let bestDist = Infinity;

  for (const tile of candidates) {
    const dist = Math.abs(tile.x - centerX) + Math.abs(tile.y - centerY);
    if (dist < bestDist) {
      bestDist = dist;
      bestTile = tile;
    }
  }

  return bestTile;
}

export function explore(agent: MyAgent): "up" | "down" | "left" | "right" | undefined {

  if (agent.whereparcelspawns === 0) {

    if (agent.beliefs.exploreTarget === undefined) {
      const bestTile = getCentralTileInOppositeQuadrant(agent);
      if (bestTile) {
        agent.beliefs.exploreTarget = bestTile;
      }
    }

    if (agent.you && agent.beliefs.exploreTarget) {
      const nextTile = computeDistanceAStar(agent.you.x, agent.you.y, agent.beliefs.exploreTarget?.x, agent.beliefs.exploreTarget?.y, agent.beliefs
        .mapWithAgentObstacles
      );
      if (nextTile) {
        if (nextTile.distance > 0) {
          return getDirection(agent.you.x, agent.you.y, nextTile.path[1].x, nextTile.path[1].y);
        } else {
          agent.beliefs.exploreTarget = undefined;
        }  
      }
    }
  } else {
    if (agent.beliefs.exploreTarget === undefined) {
      const bestTile = findSpawners(agent)[0];
      if (bestTile) {
        agent.beliefs.exploreTarget = bestTile;
      }
    }

    if (agent.beliefs.exploreTarget && agent.you) {
      const nextTile = computeDistanceAStar(agent.you?.x, agent.you?.y, agent.beliefs.exploreTarget?.x, agent.beliefs.exploreTarget?.y, agent.beliefs.mapWithAgentObstacles);
      if (nextTile) {
        if (nextTile.distance > 0)
          return getDirection(agent.you?.x, agent.you?.y, nextTile.path[1].x, nextTile.path[1].y);
        else
          agent.beliefs.exploreTarget = findSpawners(agent)[1];
        {
          const spawnerTiles = findSpawners(agent);
          const rand = Math.random();
          let chosenIndex: number;
          if (rand > 0.7 && spawnerTiles.length > 2) {
            chosenIndex = 2;
          } else {
            chosenIndex = 1;
          }
          if (spawnerTiles[chosenIndex]) {
            agent.beliefs.exploreTarget = spawnerTiles[chosenIndex];
          }
        }
      }
    }

  }
  return undefined;

}