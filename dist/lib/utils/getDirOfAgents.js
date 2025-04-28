const HISTORY_LENGTH_TO_CONSIDER = 5;
export function getDirectionOfAgents(agents) {
    return agents.slice(-HISTORY_LENGTH_TO_CONSIDER).map((agentGroup) => {
        return agentGroup.map((agent) => {
            const prev = agentGroup[agentGroup.length - 1];
            const direction = [0, 0];
            if (prev.x !== agent.x) {
                direction[0] = prev.x < agent.x ? 1 : -1;
            }
            if (prev.y !== agent.y) {
                direction[1] = prev.y < agent.y ? 1 : -1;
            }
            return { ...agent, direction };
        });
    }).reduce((acc, curr) => {
        curr.forEach((agent) => {
            const existingAgent = acc.find(a => a.id === agent.id);
            if (existingAgent) {
                existingAgent.direction[0] += agent.direction[0];
                existingAgent.direction[1] += agent.direction[1];
            }
            else {
                acc.push(agent);
            }
        });
        return acc;
    }).map((agent) => {
        return {
            ...agent,
            direction: [
                Math.sign(agent.direction[0]),
                Math.sign(agent.direction[1])
            ]
        };
    });
}
