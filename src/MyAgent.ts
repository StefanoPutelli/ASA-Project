import {
  DeliverooApi,
  Agent,
  Parcel,
  Tile,
  Timestamp,
  sleep
} from "@unitn-asa/deliveroo-js-client";

import { lib } from "./lib/index.js";
// import inquirer from "inquirer";

const BUFFER_LENGHT = 100;
const SHOW_GUI = false;

export class MyAgent {
  public api: DeliverooApi;

  // Raw data dai listeners
  public map: Map<string, Tile> = new Map();
  public you: Agent = {} as Agent;
  public agentsSensing: Agent[][] = [];
  public parcelsSensing: Parcel[] = [];
  public intentions : string[] = [];
  public whereparcelspawns = -1; // 0 = everywhere, 1 = only in specific areas
  public showGui = true;
  public avgLoopTime = 0;

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
      exploreTarget: undefined
      // spawnerHotspots: [] // Inizializza come array vuoto
    };


  constructor(host: string, token?: string) {
    this.api = new DeliverooApi(host, token);

    this.api.on("map", (w: number, h: number, tiles: Tile[]) => {
      this.map.clear();
      for (const tile of tiles) {
        if(tile.type === 3)
          this.whereparcelspawns = 1;
        this.map.set(`${tile.x},${tile.y}`, tile);
      }
      if(this.whereparcelspawns === -1)
        this.whereparcelspawns = 0;
    });

    this.api.on("tile", (tile: Tile, ts: Timestamp) => {
      this.map.set(`${tile.x},${tile.y}`, tile);
    });

    this.api.on("you", (agent: Agent, ts: Timestamp) => {
      this.you = agent;
    });

    this.api.on("agents sensing", (agents: Agent[], ts: Timestamp) => {
      this.agentsSensing.push(agents);
      if(this.agentsSensing.length > BUFFER_LENGHT){
        this.agentsSensing.shift();
      }
    });

    this.api.on("parcels sensing", (parcels: Parcel[], ts: Timestamp) => {
      this.parcelsSensing = parcels;
    });
  }

  async startGuiLoop(){
    while(true){
      if(this.showGui){
        lib.gui.updateGui(this);
      }
      await sleep(500);
    }
  }

  async agentLoop(): Promise<void> {

    // const {whereparcelspawns, showGui} = await inquirer.prompt([
    //   {
    //     type: 'list',
    //     name: 'whereparcelspawns',
    //     message: 'Where the parcels spawn?',
    //     choices: [
    //       { name: 'Everywhere', value: 0 },
    //       { name: 'Only in specific areas', value: 1 }
    //     ],
    //     default: 0
    //   },
    //   {
    //     type: 'confirm',
    //     name: 'showGui',
    //     message: 'Do you want to show the GUI?',
    //     default: true
    //   }
    // ]);
    // this.whereparcelspawns = whereparcelspawns;
    this.showGui = SHOW_GUI;

    this.startGuiLoop();
    const lastLoopTimes = [];

    while(true) {

      if(!this.you || this.whereparcelspawns === -1){ 
        await sleep(1000);
        continue;
      }
      const startTime = Date.now();
      lib.bdi.updateBeliefs(this);
      const desire = lib.bdi.generateDesires(this);
      await lib.bdi.executeIntention(this, desire);
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