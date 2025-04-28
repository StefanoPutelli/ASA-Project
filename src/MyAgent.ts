import {
  DeliverooApi,
  Agent,
  Parcel,
  Tile,
  Timestamp,
  sleep
} from "@unitn-asa/deliveroo-js-client";

import { lib } from "./lib/index.js";

export class MyAgent {
  public api: DeliverooApi;

  // Raw data dai listeners
  public map: Map<string, Tile> = new Map();
  public you?: Agent;
  public agentsSensing: Agent[] = [];
  public parcelsSensing: Parcel[] = [];

  // Beliefs espliciti
  public beliefs: {
    isOnDeliveryPoint: boolean;
    isOnUnpickedParcel: boolean;
    isCarryingParcels: boolean;
    canSeeParcelsOnGround: boolean;
    carriedScore: number; 
    parcelsCarried: Parcel[];
    parcelsOnGround: Parcel[];
    deliveryPoints: Tile[];  
    mapWithAgentObstacles: Map<string, Tile>;
  } = {
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


  constructor(host: string, token?: string) {
    this.api = new DeliverooApi(host, token);

    this.api.on("map", (w: number, h: number, tiles: Tile[]) => {
      this.map.clear();
      for (const tile of tiles) {
        this.map.set(`${tile.x},${tile.y}`, tile);
      }
    });

    this.api.on("tile", (tile: Tile, ts: Timestamp) => {
      this.map.set(`${tile.x},${tile.y}`, tile);
    });

    this.api.on("you", (agent: Agent, ts: Timestamp) => {
      this.you = agent;
    });

    this.api.on("agents sensing", (agents: Agent[], ts: Timestamp) => {
      this.agentsSensing = agents;
    });

    this.api.on("parcels sensing", (parcels: Parcel[], ts: Timestamp) => {
      this.parcelsSensing = parcels;
    });
  }

  async agentLoop(): Promise<void> {

    while (true) {
      
      lib.bdi.updateBeliefs(this);

      const desire = lib.bdi.generateDesires(this);
      await lib.bdi.executeIntention(this, desire);
      
      await sleep(1000);
    }
  }
}