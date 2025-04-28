"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
// import { renderMap } from './lib/displayData';
const test_1 = require("./lib/test");
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
        this.you = {
            you: {
                id: '',
                name: '',
                x: 0,
                y: 0,
                score: 0,
                penalty: 0,
            },
            timeInfo: {
                ms: 0,
                frame: 0,
            },
        };
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
    agentLoop() {
        setInterval(() => {
            (0, test_1.test)(this);
        }, config_1.default.LOOP_INTERVAL);
    }
}
exports.default = Agent;
