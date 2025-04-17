// src/types/@unitn-asa__deliveroo-js-client/index.d.ts

declare module "@unitn-asa/deliveroo-js-client" {

import { Socket } from "socket.io-client";

/////////////////////
// – Entity types – //
/////////////////////

export interface Agent {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  x: number;
  y: number;
  score: number;
  penalty: number;
}

export interface Parcel {
  id: string;
  x: number;
  y: number;
  carriedBy?: string;
  reward: number;
}

export interface Tile {
  x: number;
  y: number;
  type: string;
}

export interface Timestamp {
  ms: number;
  frame: number;
}

//////////////////////////
// – Event definitions – //
//////////////////////////

export interface ClientEvents {
  disconnect: () => void;
  move: (
    dir: "up" | "right" | "left" | "down" | { x: number; y: number },
    cb?: (pos: { x: number; y: number } | false) => void
  ) => { x: number; y: number } | false;
  pickup: (cb?: (arr: { id: string }[]) => void) => { id: string }[];
  putdown: (
    ids?: string[],
    cb?: (arr: { id: string }[]) => void
  ) => { id: string }[];
  say: (msg: string, data: any, cb: (status: "successful") => void) => void;
  ask: (msg: string, data: any, cb: (res: any) => void) => void;
  shout: (data: any, cb: (res: any) => void) => void;
  parcel: (
    action: "create" | "dispose" | "set",
    payload: { x: number; y: number } | { id: string; reward?: number }
  ) => void;
  restart: () => void;
  tile: (t: Tile) => void;
  log: (...args: any[]) => void;
}

export interface ServerEvents {
  connect: () => void;
  disconnect: () => void;
  config: (cfg: any) => void;
  map: (w: number, h: number, tiles: Tile[]) => void;
  tile: (t: Tile, ts: Timestamp) => void;
  controller: (
    status: "connected" | "disconnected",
    info: Pick<Agent, "id" | "name" | "teamId" | "teamName" | "score">
  ) => void;
  you: (agent: Agent, ts: Timestamp) => void;
  "agents sensing": (agents: Agent[], ts: Timestamp) => void;
  "parcels sensing": (parcels: Parcel[], ts: Timestamp) => void;
  msg: (
    from: string,
    to: string,
    data: any,
    cb?: (res: any) => void
  ) => any;
  log: (
    info: {
      src: "server" | "client";
      ms: number;
      frame: number;
      socket: string;
      id: string;
      name: string;
    },
    ...args: any[]
  ) => void;
}

////////////////////////////////////////////////
// – Generic ioTypedSocket class declaration – //
////////////////////////////////////////////////

export class ioTypedSocket<
  onEv extends Record<string, (...args: any[]) => void> = any,
  emitEv extends Record<string, (...args: any[]) => void> = any
> {
  constructor(socket: Socket);
  readonly id: string;
  disconnect(): void;
  on<K extends keyof onEv>(event: K, listener: onEv[K]): void;
  once<K extends keyof onEv>(event: K, listener: onEv[K]): void;
  emit<K extends keyof emitEv>(event: K, ...args: Parameters<emitEv[K]>): void;
  emitAndResolveOnAck<K extends keyof emitEv>(
    event: K,
    ...args: Parameters<emitEv[K]>
  ): Promise<any>;
  to(room: string): {
    emit<K extends keyof emitEv>(
      event: K,
      ...args: Parameters<emitEv[K]>
    ): Promise<any>;
    fetchSockets(): Promise<any>;
  };
  readonly broadcast: {
    emit<K extends keyof emitEv>(
      event: K,
      ...args: Parameters<emitEv[K]>
    ): void;
  };
}

////////////////////////////////////
// – DeliverooApi & helpers –     //
////////////////////////////////////

export  class DeliverooApi extends ioTypedSocket<
  ServerEvents,
  ClientEvents
> {
  /**
   * @param host  – URL del server (es. "http://localhost:3000")
   * @param token – token di autenticazione (facoltativo)
   * @param autoconnect – se true chiama subito .connect()
   */
  constructor(
    host: string,
    token?: string | null,
    autoconnect?: boolean
  );
}

export function sleep(ms: number): Promise<void>;
export const ioClientSocket: any;


}