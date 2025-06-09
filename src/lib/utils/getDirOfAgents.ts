import { Agent } from '@unitn-asa/deliveroo-js-client'; // Adjust the path as needed

const HISTORY_LENGTH_TO_CONSIDER = 2;

export function getDirectionOfAgents(agents: Agent[][]): Array<Agent & { direction: [number, number] }> {
    const directions: Array<Agent & { direction: [number, number] }> = [];
    
    if (agents.length < HISTORY_LENGTH_TO_CONSIDER) return directions;
    
    const latestAgents = agents[agents.length - 1];
    const previousAgents = agents[agents.length - HISTORY_LENGTH_TO_CONSIDER];
    
    for (const agent of latestAgents) {
        const previousAgent = previousAgents.find((a) => a.id === agent.id);
        if (!previousAgent) continue;
        const direction: [number, number] = [
        Math.floor(agent.x) - Math.floor(previousAgent.x),
        Math.floor(agent.y) - Math.floor(previousAgent.y)
        ];
        directions.push({ ...agent, direction });
    }
    
    return directions;
}