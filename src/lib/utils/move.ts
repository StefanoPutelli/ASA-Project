import { MyAgent } from "src/MyAgent.js";

export default function move(agent: MyAgent, direction: "up" | "down" | "left" | "right", cb: () => void) {
    agent.api.emit("move", direction, (response: any) => {
        agent.you.x = response.x;
        agent.you.y = response.y;
        cb();
    });
}