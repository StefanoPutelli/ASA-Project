import {
  DeliverooApi,
  Agent,
  Parcel,
  Tile,
  Timestamp,
  sleep
} from "@unitn-asa/deliveroo-js-client";

import { Them } from "./lib/com/commons.js";
import { lib } from "./lib/index.js";

import { encrypt, decrypt } from "./lib/utils/cryptostuff.js";
import { SingleWaySegment } from "./lib/bdi/beliefs.js";
// import inquirer from "inquirer";

const BUFFER_LENGHT = 3;

export class MyAgent {
  public api: DeliverooApi;
  public them: Them | null = null;

  // Raw data dai listeners
  public map: Map<string, Tile> = new Map();
  public you: Agent = {} as Agent;

  public agentsSensing: Agent[][] = [];
  public parcelsSensing: Parcel[] = [];
  public intentions: string[] = [];
  public whereparcelspawns = -1; // 0 = everywhere, 1 = only in specific areas
  public showGui : string | undefined;
  public avgLoopTime = 0;
  public gain_type: string = "base";
  private secret_key: string | null = null; // Chiave segreta per la crittografia, se necessaria

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
    agentsWithPredictions: Array<Agent & { direction: [number, number] }>;
    mapWithAgentObstacles: Map<string, Tile>;    // spawnerHotspots: Tile[]; // Array di tile che sono spawner
    exploreTarget: Tile | undefined;
    lastPositions: String[];
    isInLoop: boolean;
    singleWays: SingleWaySegment[] | null; // Array di singleWays
    blackListed: Map<number, {
      tile: Tile,
      expires: number // Timestamp in millisecondi quando il blocco scade
    }>
  } = {
      isOnDeliveryPoint: false,
      isOnUnpickedParcel: false,
      isCarryingParcels: false,
      canSeeParcelsOnGround: false,
      carriedScore: 0,
      parcelsCarried: [],
      parcelsOnGround: [],
      deliveryPoints: [],
      agentsWithPredictions: [],
      mapWithAgentObstacles: new Map(),
      exploreTarget: undefined,
      lastPositions: [],
      isInLoop: false,
      // spawnerHotspots: [] // Inizializza come array vuoto
      singleWays: null, // Inizializza come array vuoto
      blackListed: new Map()
    };

  constructor(host: string, token: string, secret_key: string | null = null, showgui: string | undefined = undefined) {
    this.api = new DeliverooApi(host, token);
    // if(them_id) this.them = new Them(this, them_id);
    this.secret_key = secret_key;
    this.showGui = showgui !== undefined ? showgui : undefined;

    this.api.on("map", (w: number, h: number, tiles: Tile[]) => {
      this.map.clear();
      for (const tile of tiles) {
        if (tile.type === 3)
          this.whereparcelspawns = 1;
        this.map.set(`${tile.x},${tile.y}`, tile);
      }
      if (this.whereparcelspawns === -1)
        this.whereparcelspawns = 0;
    });

    this.api.on("tile", (tile: Tile, ts: Timestamp) => {
      this.map.set(`${tile.x},${tile.y}`, tile);
    });

    this.api.on("you", (agent: Agent, ts: Timestamp) => {
      // if (!this.you || Object.keys(this.you).length === 0) { this.you = agent };
      this.you = agent;
    });

    this.api.on("agents sensing", (agents: Agent[], ts: Timestamp) => {
      this.agentsSensing.push(agents);
      if (this.agentsSensing.length > BUFFER_LENGHT) {
        this.agentsSensing.shift();
      }
    });

    this.api.on("parcels sensing", (parcels: Parcel[], ts: Timestamp) => {
      this.parcelsSensing = parcels;
    });

    this.api.on("msg", (from: string, to: string, data: any, cb?: (res: any) => void) => {
      if (data.type === "them") {
        const decripted = decrypt(data.saluto, this.secret_key as string);
        if (decripted === process.env.SALUTO) {
          this.them = new Them(this, from);
          if (cb) cb({ status: "ok" });
        }
      }
    });

  }

  async startGuiLoop() {
    while (true) {
      if (this.showGui === "show") {
        lib.gui.updateGui(this);
      }
      await sleep(500);
    }
  }

  async agentLoop(): Promise<void> {

    this.startGuiLoop();
    const lastLoopTimes = [];

    await sleep(1000); // Attendi un secondo prima di iniziare il loop principale
    console.log("Starting " + this.you.name + " loop...");

    while (true) {
      /*
      // memory usage
      const used = process.memoryUsage();
      console.log(`Heap used: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      */
      if (!this.you || this.whereparcelspawns === -1) {
        await sleep(1000);
        continue;
      }
      if (this.them === null && this.secret_key !== null) {
        console.log(this.them, this.secret_key);
        console.log("Creating Them instance");
        this.api.emit("shout", { type: "them", saluto: encrypt(process.env.SALUTO as string, this.secret_key) }, () => { })
        await sleep(1000);
        continue;
      }

      const startTime = Date.now();
      lib.bdi.updateBeliefs(this);
      //lib.utils.saveMapIfNew(this.map);

      const desire = lib.bdi.generateDesires(this);

      await lib.bdi.executeIntention(this, await desire);

      // console.log(this.you.name, desire);

      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      lastLoopTimes.push(elapsedTime);
      if (lastLoopTimes.length > 20) {
        lastLoopTimes.shift();
      }
      this.avgLoopTime = lastLoopTimes.reduce((a, b) => a + b, 0) / lastLoopTimes.length;
    };

  }
}