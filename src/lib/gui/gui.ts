// src/gui.ts
import blessed from 'blessed';
import { MyAgent } from '../../MyAgent.js';
import { printMapToString } from '../utils/printMap.js';

// Inizializza Blessed
const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'Agent GUI'
});

// Box per visualizzare la mappa
const mapBox = blessed.box({
    top: '30%',
    left: '70%',
    width: '30%',
    height: '70%',
    label: ' Mappa ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' } },
    tags: true,
});

// Box per visualizzare informazioni "You"
const youBox = blessed.box({
    top: '0%',
    left: '70%',
    width: '30%',
    height: '30%',
    label: ' You ',
    border: { type: 'line' },
    style: { border: { fg: 'green' } },
    tags: true,
});

// Box per visualizzare "Parcels Sensing"
const parcelsBox = blessed.box({
    top: '0%',
    left: '0%',
    width: '35%',
    height: '50%',
    label: ' Parcels Sensing ',
    border: { type: 'line' },
    style: { border: { fg: 'yellow' } },
    tags: true,
});

// Box per visualizzare "Agents Sensing"
const agentsBox = blessed.box({
    top: '50%',
    left: '0%',
    width: '69.5%',
    height: '50%',
    label: ' Agents Sensing ',
    border: { type: 'line' },
    style: { border: { fg: 'blue' } },
    tags: true,
});

const intentionsBox = blessed.box({
    top: '0%',
    left: '35%',
    width: '35%',
    height: '50%',
    label: ' Intention ',
    border: { type: 'line' },
    style: { border: { fg: 'red' } },
    tags: true,
});

// Aggiungi i componenti allo schermo
screen.append(mapBox);
screen.append(youBox);
screen.append(parcelsBox);
screen.append(agentsBox);
screen.append(intentionsBox);


// Esci con ESC o CTRL+C
screen.key(['escape', 'C-c'], () => process.exit(0));

// Funzione che aggiorna l'interfaccia
export async function updateGui(agent: MyAgent) {
    // Update map box
    mapBox.setContent(printMapToString(agent));

    // Update "You" box content
    const youContent = agent.you ? `
    {green-fg}Name:{/green-fg} ${agent.you.name}
    {cyan-fg}Pos:{/cyan-fg} (${agent.you.x}, ${agent.you.y}) | {yellow-fg}Score:{/yellow-fg} ${agent.you.score} | {red-fg}Penalty:{/red-fg} ${agent.you.penalty}
    ` : 'No data available for you.';
    youBox.setContent(youContent);

    // Update "Parcels Sensing" box content
    const parcelsContent = agent.parcelsSensing.map(parcel => `
    {cyan-fg}Pos:{/cyan-fg} (${parcel.x}, ${parcel.y}) | {yellow-fg}By:{/yellow-fg} ${parcel.carriedBy ?? 'None'} | {magenta-fg}Reward:{/magenta-fg} ${parcel.reward}
    `).join('');
    parcelsBox.setContent(parcelsContent);

    // Update "Agents Sensing" box content
    const agentsContent = agent.agentsSensing[agent.agentsSensing.length - 1] ? agent.agentsSensing[agent.agentsSensing.length - 1].map(otherAgent => {
        const agentWithPrediction = agent.beliefs.agentsWithPredictions?.find(pred => pred.id === otherAgent.id);
        const direction = agentWithPrediction?.direction;
        const arrow = Array.isArray(direction) && direction.length === 2 ? (
            direction[0] === 0 && direction[1] === -1 ? '↑ (North)' :
            direction[0] === 0 && direction[1] === 1 ? '↓ (South)' :
            direction[0] === -1 && direction[1] === 0 ? '← (West)' :
            direction[0] === 1 && direction[1] === 0 ? '→ (East)' :
            direction[0] === 1 && direction[1] === -1 ? '↗ (North/East)' :
            direction[0] === -1 && direction[1] === -1 ? '↖ (North/West)' :
            direction[0] === 1 && direction[1] === 1 ? '↘ (South/East)' :
            direction[0] === -1 && direction[1] === 1 ? '↙ (South/West)' : ' '
        ) : ' ';
        return `
    {green-fg}Name:{/green-fg} ${otherAgent.name} | {blue-fg}Team:{/blue-fg} ${otherAgent.teamName} (ID: ${otherAgent.teamId})
    {cyan-fg}Pos:{/cyan-fg} (${otherAgent.x}, ${otherAgent.y}) | {yellow-fg}Score:{/yellow-fg} ${otherAgent.score} | {red-fg}Penalty:{/red-fg} ${otherAgent.penalty}
    {magenta-fg}Direction:{/magenta-fg} ${arrow}
    `;
    }).join('') : "";
    agentsBox.setContent(agentsContent);


    const intentionsContent = agent.intentions.slice(-Math.floor(intentionsBox.height as number) + 2)
        .join('\n') || 'No intentions available.';
    intentionsBox.setContent(intentionsContent);

    // Clear the screen before rendering
    screen.render();
}
