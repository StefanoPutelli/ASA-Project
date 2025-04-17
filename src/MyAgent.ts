import {
  DeliverooApi,
  Agent,
  Parcel,
  Tile,
  Timestamp
} from "@unitn-asa/deliveroo-js-client";

import * as lib from "./lib/index.js";

export class MyAgent {
  public api: DeliverooApi;

  // Stato interno aggiornato dagli eventi
  public map: Map<string, Tile> = new Map();
  public you?: Agent;
  public agentsSensing: Agent[] = [];
  public parcelsSensing: Parcel[] = [];

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
      lib.printMap(this);
      await lib.moveRandomly(this);
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}