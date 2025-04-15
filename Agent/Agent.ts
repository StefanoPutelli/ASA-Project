
import {
  Tile,
  You,
  TimeInfo,
  Parcel,
  EnemyAgent,
  GameMap,
  EventClient,
  AgentInterface,
} from './AgentInterface';

import config from '../config';

// import { renderMap } from './lib/displayData';
import { test } from './lib/test';
/**
 * Wraps all event data that we want to store. The constructor
 * wires up event listeners to the provided client.
 */
export default class Agent implements AgentInterface {
  /**
   * Keeps the most recent "you" event’s payload and time info.
   */
  public you: { you: You; timeInfo: TimeInfo } = {
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
  public parcelsSensing: Parcel[] = [];

  /**
   * Stores all "EnemyAgents sensing" data in chronological order (each entry is the array of EnemyAgents from that event).
   */
  public EnemyAgentsSensing: EnemyAgent[] = [];
  /**
   * Stores the latest "map" event data (could be a number, object, etc.).
   */
  public mapData: GameMap = {
    x: 0,
    y: 0,
    tile: [],
  };
  /**
   * Creates an instance of Agent and subscribes to the provided client’s events.
   * @param client - The client object that emits the events we want to handle.
   */
  constructor(public client: EventClient) {
    this.setupListeners();
  }

  /**
     * Wires up all of the event listeners on the client to store relevant data.
     * @private
     */
  private setupListeners(): void {
    this.client.on('you', (you, timeInfo) => {
      this.you = { you, timeInfo };
    });

    this.client.on('parcels sensing', (parcels) => {
      this.parcelsSensing = parcels;
    });

    this.client.on('EnemyAgents sensing', (EnemyAgents) => {
      this.EnemyAgentsSensing = EnemyAgents;
    });
    this.client.on('map', (x: number, y: number, tiles: Tile[]) => {
      this.mapData = {
        x: x,
        y: y,
        tile: tiles,
      };
    });
  }

  public agentLoop(): void {
    setInterval(() => {
      test(this);
    }, config.LOOP_INTERVAL);
  }

}
