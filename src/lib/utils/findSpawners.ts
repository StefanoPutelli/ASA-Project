import { Tile, Agent } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "src/MyAgent.js";
import { computeDistanceAStar } from "./astar.js";

function findType1Groups(grid: Map<string, Tile>, you: Agent | undefined): Tile[] {
    const visited: Set<string> = new Set();   // celle già esplorate
    const reps: Tile[] = [];                  // rappresentanti dei gruppi

    // Considera tutte le celle entro una distanza di Manhattan <= 2
    const dirs: [number, number][] = [
        [1, 0], [-1, 0], [0, 1], [0, -1],          // distanza 1
        [1, 1], [1, -1], [-1, 1], [-1, -1],          // distanza 2 (diagonali)
        [2, 0], [-2, 0], [0, 2], [0, -2]             // distanza 2 (orizzontali/verticali)
    ];

    for (const [key, cell] of grid) {
        // Salta se la cella non è di type 1 oppure è già stata visitata
        if (cell.type !== 1 || visited.has(key)) continue;

        // Nuovo gruppo: salva la cella come rappresentante
        reps.push(cell);
        visited.add(key);

        // DFS usando uno stack
        const stack: Tile[] = [cell];

        while (stack.length) {
            const { x, y } = stack.pop() as Tile;

            for (const [dx, dy] of dirs) {
                const nx = x + dx;
                const ny = y + dy;
                const nKey = `${nx},${ny}`;

                if (visited.has(nKey)) continue;

                const neighbour = grid.get(nKey);
                if (neighbour && neighbour.type === 1) {
                    visited.add(nKey);
                    stack.push(neighbour);
                }
            }
        }
    }

    // Ordina i rappresentanti per vicinanza a "you"
    if (you) {
        reps.sort((a, b) => {
            const distA = computeDistanceAStar(you.x, you.y, a.x, a.y, grid)?.distance || 0;
            const distB = computeDistanceAStar(you.x, you.y, b.x, b.y, grid)?.distance || 0;
            return distA - distB;
        });
    }
    return reps;
}


export default function findSpawners(agent: MyAgent): Tile[] {
    const res = findType1Groups(agent.map, agent.you);
    return res;
}