// src/lib/utils/printMap.ts
import type { MyAgent } from "../../MyAgent.js";

export function printMapToString(agent: MyAgent): string {
  const tiles = Array.from(agent.map.values());
  if (!tiles.length) {
    return "Mappa non ancora ricevuta.";
  }

  const maxX = Math.max(...tiles.map(t => t.x));
  const maxY = Math.max(...tiles.map(t => t.y));
  const width = (maxX + 1) * 2; // Double the width
  const height = (maxY + 1) * 2; // Double the height

  const typeSymbols: Record<string, string> = {
    "0": "  ",
    "1": ". ",
    "2": "# "
  };

  const grid: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "  ")
  );

  try {
    for (const tile of tiles) {
      const symbol = typeSymbols[tile.type] ?? "? ";
      grid[tile.y * 2][tile.x * 2] = symbol;
      grid[tile.y * 2][tile.x * 2 + 1] = symbol;
      grid[tile.y * 2 + 1][tile.x * 2] = symbol;
      grid[tile.y * 2 + 1][tile.x * 2 + 1] = symbol;
    }

    for (const parcel of agent.parcelsSensing) {
      grid[parcel.y * 2][parcel.x * 2] = "* ";
      grid[parcel.y * 2][parcel.x * 2 + 1] = "* ";
      grid[parcel.y * 2 + 1][parcel.x * 2] = "* ";
      grid[parcel.y * 2 + 1][parcel.x * 2 + 1] = "* ";
    }
    for (const other of agent.agentsSensing[agent.agentsSensing.length - 1]) {
      grid[other.y * 2][other.x * 2] = "X ";
      grid[other.y * 2][other.x * 2 + 1] = "X ";
      grid[other.y * 2 + 1][other.x * 2] = "X ";
      grid[other.y * 2 + 1][other.x * 2 + 1] = "X ";
    }
    if (agent.you) {
      grid[agent.you.y * 2][agent.you.x * 2] = "@ ";
      grid[agent.you.y * 2][agent.you.x * 2 + 1] = "@ ";
      grid[agent.you.y * 2 + 1][agent.you.x * 2] = "@ ";
      grid[agent.you.y * 2 + 1][agent.you.x * 2 + 1] = "@ ";
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
