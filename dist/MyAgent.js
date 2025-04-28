import { DeliverooApi, sleep } from "@unitn-asa/deliveroo-js-client";
import { lib } from "./lib/index.js";
export class MyAgent {
    constructor(host, token) {
        // Raw data dai listeners
        this.map = new Map();
        this.agentsSensing = [];
        this.parcelsSensing = [];
        // Beliefs espliciti
        this.beliefs = {
            isOnDeliveryPoint: false,
            isOnUnpickedParcel: false,
            isCarryingParcels: false,
            canSeeParcelsOnGround: false,
            carriedScore: 0,
            parcelsCarried: [],
            parcelsOnGround: [],
            deliveryPoints: [],
            mapWithAgentObstacles: new Map(),
        };
        this.api = new DeliverooApi(host, token);
        this.api.on("map", (w, h, tiles) => {
            this.map.clear();
            for (const tile of tiles) {
                this.map.set(`${tile.x},${tile.y}`, tile);
            }
        });
        this.api.on("tile", (tile, ts) => {
            this.map.set(`${tile.x},${tile.y}`, tile);
        });
        this.api.on("you", (agent, ts) => {
            this.you = agent;
        });
        this.api.on("agents sensing", (agents, ts) => {
            this.agentsSensing = agents;
        });
        this.api.on("parcels sensing", (parcels, ts) => {
            this.parcelsSensing = parcels;
        });
    }
    async agentLoop() {
        while (true) {
            lib.bdi.updateBeliefs(this);
            const desire = lib.bdi.generateDesires(this);
            await lib.bdi.executeIntention(this, desire);
            await sleep(1000);
        }
    }
}
