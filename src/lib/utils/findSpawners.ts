import { Tile, Agent } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "src/MyAgent.js";
import { computeDistanceAStar } from "./astar.js";

/**
 * Raggruppa celle di type 1 assicurandosi che ogni gruppo
 * sia contenuto al massimo in un quadrato 4×4.
 * Due celle sono considerate connesse se la loro distanza
 * di Manhattan è ≤ 2 (come nella logica originale).
 */
function findType1Groups(grid: Map<string, Tile>, you?: Agent): Tile[] {
  const visited = new Set<string>();
  const reps: Tile[] = [];

  // Vettore dei vicini entro distanza di Manhattan ≤ 2
  const dirs: [number, number][] = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
    [2, 0], [-2, 0], [0, 2], [0, -2]
  ];

  for (const [, start] of grid) {
    if (start.type !== 1 || visited.has(`${start.x},${start.y}`)) continue;

    // Inizia un nuovo gruppo
    const queue: Tile[] = [start];
    visited.add(`${start.x},${start.y}`);

    // Bounding box corrente
    let minX = start.x, maxX = start.x;
    let minY = start.y, maxY = start.y;

    const group: Tile[] = [];

    while (queue.length) {
      const cell = queue.shift() as Tile;
      group.push(cell);

      for (const [dx, dy] of dirs) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        const nKey = `${nx},${ny}`;

        if (visited.has(nKey)) continue;

        const neighbour = grid.get(nKey);
        if (!neighbour || neighbour.type !== 1) continue;

        // Calcola i nuovi estremi provvisori
        const newMinX = Math.min(minX, nx);
        const newMaxX = Math.max(maxX, nx);
        const newMinY = Math.min(minY, ny);
        const newMaxY = Math.max(maxY, ny);

        // Verifica che il bounding box 4×4 non venga superato
        const width = newMaxX - newMinX + 1;
        const height = newMaxY - newMinY + 1;

        if (width <= 4 && height <= 4) {
          // OK, possiamo inserire la cella nel gruppo
          minX = newMinX;
          maxX = newMaxX;
          minY = newMinY;
          maxY = newMaxY;

          visited.add(nKey);
          queue.push(neighbour);
        }
        // Altrimenti la cella verrà considerata in un gruppo successivo
      }
    }

    // Elegge come rappresentante la prima cella del gruppo
    reps.push(group[0]);
  }

  // Ordina i rappresentanti per vicinanza all'agente "you", se presente
  if (you) {
    reps.sort((a, b) => {
      const distA = computeDistanceAStar(you.x, you.y, a.x, a.y, grid)?.distance ?? 0;
      const distB = computeDistanceAStar(you.x, you.y, b.x, b.y, grid)?.distance ?? 0;
      return distA - distB;
    });
  }
  return reps;
}

export default function findSpawners(agent: MyAgent): Tile[] {
  return findType1Groups(agent.map, agent.you);
}
