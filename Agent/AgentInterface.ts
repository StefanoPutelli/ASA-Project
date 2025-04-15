/**
 * Describes the shape of time information provided in tile/you events.
 */
export interface TimeInfo {
    ms: number;
    frame: number;
}
/**
 * Describes the shape of tile data.
 */
export interface Tile {
    x: number;
    y: number;
    type: number;
}

/**
 * Describes the shape of a parcel in the "parcels sensing" event.
 */
export interface Parcel {
    id: string;
    x: number;
    y: number;
    carriedBy: string | null;
    reward: number;
}

/**
 * Describes the shape of an EnemyAgent in the "EnemyAgents sensing" event.
 */
export interface EnemyAgent {
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
export interface You {
    id: string;
    name: string;
    x: number;
    y: number;
    score: number;
    penalty: number;
}

export interface GameMap {
    x: number;
    y: number;
    tile: Tile[];
}

export interface AgentInterface {
    client: any;
    you: {
        you: You;
        timeInfo: TimeInfo;
    };
    parcelsSensing: Parcel[];
    EnemyAgentsSensing: EnemyAgent[];
    mapData: GameMap;
}



/**
 * Generic signature for a client or event emitter that can register event handlers.
 * Adjust as needed for your actual client implementation.
 */
export interface EventClient {
    on(eventName: 'tile', listener: (tile: Tile, timeInfo: TimeInfo) => void): void;
    on(eventName: 'you', listener: (you: You, timeInfo: TimeInfo) => void): void;
    on(eventName: 'parcels sensing', listener: (parcels: Parcel[], timeInfo: TimeInfo) => void): void;
    on(eventName: 'EnemyAgents sensing', listener: (EnemyAgents: EnemyAgent[], timeInfo: TimeInfo) => void): void;
    on(eventName: 'map', listener: (x: number, y: number, tiles: Tile[]) => void): void;
}