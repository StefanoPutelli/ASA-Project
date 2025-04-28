import { getDirectionOfAgents } from "../utils/getDirOfAgents.js";
export function updateBeliefs(agent) {
    const you = agent.you;
    if (!you)
        return;
    const tileUnderYou = agent.map.get(`${you.x},${you.y}`);
    const parcelsCarried = agent.parcelsSensing.filter(p => p.carriedBy === you.id);
    const parcelsOnGround = agent.parcelsSensing.filter(p => !p.carriedBy);
    const isOnUnpickedParcel = parcelsOnGround.some(p => p.x === you.x && p.y === you.y);
    const deliveryPoints = Array.from(agent.map.values()).filter(tile => tile.type == "2");
    const agentsWithPredictions = getDirectionOfAgents(agent.agentsSensing);
    const mapWithAgentObstacles = new Map();
    // copia tutti i tile originali
    for (const [key, tile] of agent.map.entries()) {
        mapWithAgentObstacles.set(key, { ...tile });
    }
    // per ogni agente NON io, marca il tile come muro ("0")
    for (const other of agent.agentsSensing[agent.agentsSensing.length - 1]) {
        if (other.id === you.id)
            continue;
        const key = `${other.x},${other.y}`;
        const t = mapWithAgentObstacles.get(key);
        if (t) {
            mapWithAgentObstacles.set(key, { ...t, type: "0" });
        }
    }
    // Aggiungiamo questi beliefs come proprietà dell'agente
    agent.beliefs = {
        isOnDeliveryPoint: tileUnderYou?.type == "2",
        isOnUnpickedParcel,
        isCarryingParcels: parcelsCarried.length > 0,
        canSeeParcelsOnGround: parcelsOnGround.length > 0,
        carriedScore: parcelsCarried.reduce((sum, current) => sum + current.reward, 0),
        parcelsCarried,
        parcelsOnGround,
        deliveryPoints,
        agentsWithPredictions,
        mapWithAgentObstacles,
    };
}
