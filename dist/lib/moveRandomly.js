export async function moveRandomly(agent) {
    const directions = ["up", "down", "left", "right"];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    agent.api.emit("move", dir);
}
