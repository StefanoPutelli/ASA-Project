import { Tile, Agent } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "src/MyAgent.js";

function findType1Groups(grid: Map<string, Tile>, you: Agent | undefined): Tile[] {
    const visited: Set<string> = new Set();   // celle già esplorate
    const reps: Tile[] = [];                  // rappresentanti dei gruppi

    // Quattro direzioni ortogonali (N-S-E-W)
    const dirs: [number, number][] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ];

    for (const [key, cell] of grid) {
        // salta se la cella non è di type 1 oppure è già stata visitata
        if (cell.type !== 1 || visited.has(key)) continue;

        // Nuovo gruppo: salva la cella come rappresentante
        reps.push(cell);
        visited.add(key);

        // DFS usando uno stack (puoi usare una queue per BFS se preferisci)
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
            const distA = Math.abs(a.x - you.x) + Math.abs(a.y - you.y);
            const distB = Math.abs(b.x - you.x) + Math.abs(b.y - you.y);
            return distA - distB;
        });
    }
    return reps;
}


export default function findSpawners(agent: MyAgent): Tile[] {
    const res = findType1Groups(agent.map, agent.you);
    return res;
}