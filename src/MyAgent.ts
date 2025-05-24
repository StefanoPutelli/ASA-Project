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
// import inquirer from "inquirer";

const BUFFER_LENGHT = 100;
const SHOW_GUI = false;

export class MyAgent {
  public api: DeliverooApi;
  public them : Them | null = null;

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
    lastPositions: String[];
    isInLoop: boolean;
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
    };


  constructor(host: string, token: string, them_id: string) {
    this.api = new DeliverooApi(host, token);
    this.them = new Them(this, them_id);

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
      console.log(this.you.name);
      /*
      // memory usage
      const used = process.memoryUsage();
      console.log(`Heap used: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      */

      if(!this.you || this.whereparcelspawns === -1){ 
        await sleep(1000);
        continue;
      }
      const startTime = Date.now();
      lib.bdi.updateBeliefs(this);
      // lib.utils.saveMapIfNew(this.map);

      const desire = lib.bdi.generateDesires(this);

      await lib.bdi.executeIntention(this, desire);
      
      // console.log(this.you.name, desire);

      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      lastLoopTimes.push(elapsedTime);
      if (lastLoopTimes.length > 20) {
        lastLoopTimes.shift();
      }
      this.avgLoopTime = lastLoopTimes.reduce((a, b) => a + b, 0) / lastLoopTimes.length;    
      
      if (this.them?.isTalking === false && Math.random() < 0.1) {
            this.api.emit("say", this.them.them_id, { type: "ask", saluto: "ciaone" }, (response) => {
                //console.log("Inizio conversazione con", this.them?.them_id, ":", response);
            });
      }
    };

  }
}