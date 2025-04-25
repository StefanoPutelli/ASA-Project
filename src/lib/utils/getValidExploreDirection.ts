import { MyAgent } from "../../MyAgent.js";

type Direction = "up" | "right" | "down" | "left";

const delta: Record<Direction, { x: number; y: number }> = {
  up:    { x: 0, y: 1 },
  down:  { x: 0, y: -1 },
  left:  { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

let lastPos: { x: number; y: number } | null = null;

/**
 * Restituisce una direzione casuale tra quelle che portano a una tile valida (non di tipo "0")
 * Evita di tornare sulla posizione precedente, a meno che non ci siano alternative.
 */
export function getValidExploreDirection(agent: MyAgent): Direction | null {
  const you = agent.you;
  if (!you) return null;

  const validDirs: Direction[] = [];

  for (const [dir, { x: dx, y: dy }] of Object.entries(delta) as [Direction, { x: number; y: number }][]) {
    const newX = you.x + dx;
    const newY = you.y + dy;
    const tile = agent.map.get(`${newX},${newY}`);

    if (tile && tile.type != "0") {
      // Escludi il ritorno alla posizione precedente, se possibile
      if (!lastPos || !(newX === lastPos.x && newY === lastPos.y)) {
        validDirs.push(dir);
      }
    }
  }

  // Se nessuna direzione valida escluso il ritorno, permetti comunque di tornare indietro
  if (validDirs.length === 0 && lastPos) {
    for (const [dir, { x: dx, y: dy }] of Object.entries(delta) as [Direction, { x: number; y: number }][]) {
      const newX = you.x + dx;
      const newY = you.y + dy;
      if (newX === lastPos.x && newY === lastPos.y) {
        const tile = agent.map.get(`${newX},${newY}`);
        if (tile && tile.type !== "0") {
          validDirs.push(dir);
        }
      }
    }
  }

  // Salva la posizione attuale per il prossimo turno
  lastPos = { x: you.x, y: you.y };

  // Restituisce una direzione casuale valida
  if (validDirs.length === 0) return null;
  return validDirs[Math.floor(Math.random() * validDirs.length)];
}
