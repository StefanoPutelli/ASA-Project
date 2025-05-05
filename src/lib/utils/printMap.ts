// src/lib/utils/printMap.ts
import type { MyAgent } from "../../MyAgent.js";

export function printMapToString(agent: MyAgent): string {
  const tiles = Array.from(agent.map.values());
  if (!tiles.length) {
    return "Mappa non ancora ricevuta.";
  }

  const maxX = Math.max(...tiles.map(t => t.x));
  const maxY = Math.max(...tiles.map(t => t.y));
  const width = maxX + 1;
  const height = maxY + 1;

  const typeSymbols: Record<string, string> = {
    "0": " ",
    "1": ".",
    "2": "#",
    "3": "o",
  };

  const grid: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => " ")
  );

  try {
    for (const tile of tiles) {
      const symbol = typeSymbols[tile.type] ?? "?";
      grid[tile.y][tile.x] = symbol;
    }

    for (const parcel of agent.parcelsSensing) {
      grid[parcel.y][parcel.x] = "*";
    }
    for (const other of agent.agentsSensing[agent.agentsSensing.length - 1]) {
      grid[other.y][other.x] = "X";
    }
    if (agent.you) {
      grid[agent.you.y][agent.you.x] = "@";
    }

    let output = "";
    for (let row = height - 1; row >= 0; row--) {
      output += grid[row].join('') + '\n';
    }

    return output;
  } catch (error) {
    return `Errore durante la stampa della mappa: ${error}`;
  }
}
