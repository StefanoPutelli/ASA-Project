import { AgentInterface } from "../AgentInterface";

interface Command {
    direction: "up" | "down" | "left" | "right" | null;
    action: "move" | "pick" | "drop";
}

function move(agent : AgentInterface, com: Command): void {
    if(com.action === "move") {
        agent.client.emitMove(com.direction);
    } else {
        console.error("Invalid action");
    }
}

export function test(agent: AgentInterface): void {
    const com: Command = {
        direction: "up",
        action: "move"
    };
    move(agent, com);
}