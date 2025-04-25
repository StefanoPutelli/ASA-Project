import { MyAgent } from "../../MyAgent.js";
import type { ClientEvents } from "@unitn-asa/deliveroo-js-client";

// Estrai il tipo corretto del parametro "dir" dalla definizione della funzione `move`
type MoveDirection = Parameters<ClientEvents["move"]>[0];

export async function moveRandomly(agent: MyAgent) {
  const directions: MoveDirection[] = ["up", "down", "left", "right"];
  const dir = directions[Math.floor(Math.random() * directions.length)];

  agent.api.emit("move", dir);
}
