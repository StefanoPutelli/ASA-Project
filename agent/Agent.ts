/**
 * Describes the shape of time information provided in tile/you events.
 */
interface TimeInfo {
  ms: number;
  frame: number;
}
/**
 * Describes the shape of tile data.
 */
interface Tile {
  x: number;
  y: number;
  type: number;
}

/**
 * Describes the shape of a parcel in the "parcels sensing" event.
 */
interface Parcel {
  id: string;
  x: number;
  y: number;
  carriedBy: string | null;
  reward: number;
}

/**
 * Describes the shape of an EnemyAgent in the "EnemyAgents sensing" event.
 */
interface EnemyAgent {
  id: string;
  name: string;
  x: number;
  y: number;
  score: number;
  penalty: number;
}

/**
 * Describes the shape of the "you" event payload.
 */
interface You {
  id: string;
  name: string;
  x: number;
  y: number;
  score: number;
  penalty: number;
}

interface Map {
  x: number;
  y: number;
  tile: Tile[];
}

/**
 * Generic signature for a client or event emitter that can register event handlers.
 * Adjust as needed for your actual client implementation.
 */
interface EventClient {
  on(eventName: 'tile', listener: (tile: Tile, timeInfo: TimeInfo) => void): void;
  on(eventName: 'you', listener: (you: You, timeInfo: TimeInfo) => void): void;
  on(eventName: 'parcels sensing', listener: (parcels: Parcel[], timeInfo: TimeInfo) => void): void;
  on(eventName: 'EnemyAgents sensing', listener: (EnemyAgents: EnemyAgent[], timeInfo: TimeInfo) => void): void;
  on(eventName: 'map', listener: (x: number, y: number, tiles: Tile[]) => void): void;
}

/**
 * Wraps all event data that we want to store. The constructor
 * wires up event listeners to the provided client.
 */
export default class Agent {
  /**
   * Keeps the most recent "you" event’s payload and time info.
   */
  public you: { you: You; timeInfo: TimeInfo } | null = null;

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
  public mapData: Map = {
    x: 0,
    y: 0,
    tile: [],
  };
  /**
   * Creates an instance of Agent and subscribes to the provided client’s events.
   * @param client - The client object that emits the events we want to handle.
   */
  constructor(private client: EventClient) {
    this.setupListeners();
  }

  public displayData(): void {
    console.log("== Agent Data ==");
    
    console.log("You:");
    console.log(this.you ? JSON.stringify(this.you, null, 2) : "No data available");
    
    console.log("Parcels Sensing:");
    console.log(JSON.stringify(this.parcelsSensing, null, 2));
    
    console.log("Enemy Agents Sensing:");
    console.log(JSON.stringify(this.EnemyAgentsSensing, null, 2));
    
    console.log("Map Data:");
    console.log(JSON.stringify(this.mapData, null, 2));
  }

  public renderMap(): void {
    const width = this.mapData.x;
    const height = this.mapData.y;

    // Initialize grid with '.' for empty cells.
    const grid: string[][] = Array.from({ length: height }, () =>
      Array(width).fill('.')
    );

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
    console.log("Map Visual Representation:");
    console.log(visual);
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
}
