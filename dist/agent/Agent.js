"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
/**
 * Wraps all event data that we want to store. The constructor
 * wires up event listeners to the provided client.
 */
class Agent {
    /**
     * Creates an instance of Agent and subscribes to the provided client’s events.
     * @param client - The client object that emits the events we want to handle.
     */
    constructor(client) {
        this.client = client;
        /**
         * Keeps the most recent "you" event’s payload and time info.
         */
        this.you = null;
        /**
         * Stores all "parcels sensing" data in chronological order (each entry is the array of parcels from that event).
         */
        this.parcelsSensing = [];
        /**
         * Stores all "EnemyAgents sensing" data in chronological order (each entry is the array of EnemyAgents from that event).
         */
        this.EnemyAgentsSensing = [];
        /**
         * Stores the latest "map" event data (could be a number, object, etc.).
         */
        this.mapData = {
            x: 0,
            y: 0,
            tile: [],
        };
        this.setupListeners();
    }
    /**
       * Wires up all of the event listeners on the client to store relevant data.
       * @private
       */
    setupListeners() {
        this.client.on('you', (you, timeInfo) => {
            this.you = { you, timeInfo };
        });
        this.client.on('parcels sensing', (parcels) => {
            this.parcelsSensing = parcels;
        });
        this.client.on('EnemyAgents sensing', (EnemyAgents) => {
            this.EnemyAgentsSensing = EnemyAgents;
        });
        this.client.on('map', (x, y, tiles) => {
            this.mapData = {
                x: x,
                y: y,
                tile: tiles,
            };
        });
    }
    displayData() {
        console.log("== Agent Data ==");
        console.log("You:");
        console.log(this.you ? this.you : "No data available");
        console.log("Parcels Sensing:");
        console.log(this.parcelsSensing, null, 2);
        console.log("Enemy Agents Sensing:");
        console.log(this.EnemyAgentsSensing, null, 2);
        console.log("GameMap Data:");
        console.log(this.mapData, null, 2);
    }
    renderMap() {
        const width = this.mapData.x;
        const height = this.mapData.y;
        // Initialize grid with '.' for empty cells.
        const grid = Array.from({ length: height }, () => Array(width).fill('.'));
        // Populate the grid with the provided tile information.
        for (const tile of this.mapData.tile) {
            if (tile.x >= 0 && tile.x < width && tile.y >= 0 && tile.y < height) {
                // Use the tile type if non-zero, otherwise default to an empty cell.
                grid[tile.y][tile.x] = tile.type === 0 ? '.' : String(tile.type);
            }
        }
        // Overlay your agent.
        if (this.you) {
            const { x, y } = this.you.you;
            if (y >= 0 && y < height && x >= 0 && x < width) {
                grid[y][x] = 'A';
            }
        }
        // Overlay enemy agents.
        for (const enemy of this.EnemyAgentsSensing) {
            const { x, y } = enemy;
            if (y >= 0 && y < height && x >= 0 && x < width) {
                grid[y][x] = 'E';
            }
        }
        // Overlay parcels.
        for (const parcel of this.parcelsSensing) {
            const { x, y } = parcel;
            if (y >= 0 && y < height && x >= 0 && x < width) {
                // Only place a parcel if the cell is still the underlying tile.
                if (grid[y][x] === '.' || !['A', 'E'].includes(grid[y][x])) {
                    grid[y][x] = 'P';
                }
            }
        }
        // Render the grid to a string for visual inspection.
        const visual = grid.map(row => row.join(' ')).join('\n');
        console.log("GameMap Visual Representation:");
        console.log(visual);
    }
    agentLoop() {
        setInterval(() => {
            this.renderMap();
        }, config_1.default.LOOP_INTERVAL);
    }
}
exports.default = Agent;
