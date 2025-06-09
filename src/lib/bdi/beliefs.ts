import { Agent, Tile } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "../../MyAgent.js";
import { getDirectionOfAgents } from "../utils/getDirOfAgents.js";

/**
 * Corridoi larghi un solo tile raggruppati in segmenti.
 * Ogni segmento ora contiene **solo** la direzione e la lista completa dei tile.
 */
export type SingleWayDirection = "vertical" | "horizontal";
export type SingleWaySegment = {
  id: number;
  direction: "vertical" | "horizontal";
  tiles: { x: number; y: number }[];
}

// se l'agente entra in una di queste vie e incontra qualcuno, quella via viene bucata e viene salvato
// un valore di x o y (orizzontale o verticale) che quando viene sorpassato resetta la mappa

export function updateBeliefs(agent: MyAgent): void {
  const you = agent.you;
  if (!you) return;

  const tileUnderYou = agent.map.get(`${you.x},${you.y}`);
  const parcelsCarried = agent.parcelsSensing.filter((p) => p.carriedBy === you.id);
  const parcelsOnGround = agent.parcelsSensing
    .filter((p) => !p.carriedBy)
    .filter((p) => !agent.them?.blacklistedParcels.includes(p.id));
  const isOnUnpickedParcel = parcelsOnGround.some((p) => p.x === you.x && p.y === you.y);
  const deliveryPoints = Array.from(agent.map.values()).filter((tile) => tile.type === 2);

  const agentsWithPredictions = getDirectionOfAgents(agent.agentsSensing);

  ///////////////////////////////
  // – Calcolo dei singleWays –
  ///////////////////////////////
  let singleWays: SingleWaySegment[] = [];
  let swIndex = 0;
  if (!agent.beliefs.singleWays) {
    const visited = new Set<string>();

    const isWalkable = (t: Tile | undefined) => !!t && t.type !== 0;

    for (const tile of agent.map.values()) {
      if (tile.type === 0) continue; // muro
      const key = `${tile.x},${tile.y}`;
      if (visited.has(key)) continue;

      const left = agent.map.get(`${tile.x - 1},${tile.y}`);
      const right = agent.map.get(`${tile.x + 1},${tile.y}`);
      const up = agent.map.get(`${tile.x},${tile.y - 1}`);
      const down = agent.map.get(`${tile.x},${tile.y + 1}`);

      const leftIsWall = !isWalkable(left);
      const rightIsWall = !isWalkable(right);
      const upIsWall = !isWalkable(up);
      const downIsWall = !isWalkable(down);

      // Possibile segmento verticale
      if (leftIsWall && rightIsWall && (!upIsWall || !downIsWall)) {
        const tiles: { x: number; y: number }[] = [];

        // estendi verso l'alto
        let yPtr = tile.y;
        while (true) {
          const t = agent.map.get(`${tile.x},${yPtr}`);
          if (!isWalkable(t)) break;
          const l = agent.map.get(`${tile.x - 1},${yPtr}`);
          const r = agent.map.get(`${tile.x + 1},${yPtr}`);
          if (!isWalkable(l) && !isWalkable(r)) {
            tiles.push({ x: tile.x, y: yPtr });
            yPtr--;
          } else break;
        }

        // estendi verso il basso
        yPtr = tile.y + 1;
        while (true) {
          const t = agent.map.get(`${tile.x},${yPtr}`);
          if (!isWalkable(t)) break;
          const l = agent.map.get(`${tile.x - 1},${yPtr}`);
          const r = agent.map.get(`${tile.x + 1},${yPtr}`);
          if (!isWalkable(l) && !isWalkable(r)) {
            tiles.push({ x: tile.x, y: yPtr });
            yPtr++;
          } else break;
        }

        tiles.sort((a, b) => a.y - b.y);
        for (const t of tiles) visited.add(`${t.x},${t.y}`);

        singleWays.push({ id: swIndex, direction: "vertical", tiles });
        swIndex++;
        continue; // non valutare come orizzontale
      }

      // Possibile segmento orizzontale
      if (upIsWall && downIsWall && (!leftIsWall || !rightIsWall)) {
        const tiles: { x: number; y: number }[] = [{ x: tile.x, y: tile.y }];

        // a sinistra
        let xPtr = tile.x - 1;
        while (true) {
          const t = agent.map.get(`${xPtr},${tile.y}`);
          if (!isWalkable(t)) break;
          const u = agent.map.get(`${xPtr},${tile.y - 1}`);
          const d = agent.map.get(`${xPtr},${tile.y + 1}`);
          if (!isWalkable(u) && !isWalkable(d)) {
            tiles.push({ x: xPtr, y: tile.y });
            xPtr--;
          } else break;
        }

        // a destra
        xPtr = tile.x + 1;
        while (true) {
          const t = agent.map.get(`${xPtr},${tile.y}`);
          if (!isWalkable(t)) break;
          const u = agent.map.get(`${xPtr},${tile.y - 1}`);
          const d = agent.map.get(`${xPtr},${tile.y + 1}`);
          if (!isWalkable(u) && !isWalkable(d)) {
            tiles.push({ x: xPtr, y: tile.y });
            xPtr++;
          } else break;
        }

        tiles.sort((a, b) => a.x - b.x);
        for (const t of tiles) visited.add(`${t.x},${t.y}`);

        singleWays.push({ id: swIndex, direction: "horizontal", tiles });
        swIndex++;
      }
    }
  } else {
    singleWays = agent.beliefs.singleWays;
  }

  ///////////////////////////////
  // – Memoria posizioni & loop –
  ///////////////////////////////
  const posKey = `${you.x},${you.y}`;
  const lastPositions = agent.beliefs?.lastPositions ?? [];
  if (lastPositions.length === 0 || lastPositions[lastPositions.length - 1] !== posKey) {
    lastPositions.push(posKey);
    if (lastPositions.length > 5) lastPositions.shift();
  }

  const isInLoop = new Set(lastPositions).size <= 2;
  let myDirection: [number, number];
  lastPositions.slice(0, -1).forEach((pos, i) => {
    const [x, y] = pos.split(',').map(Number);
    const nextPos = lastPositions[i + 1];
    if (nextPos) {
      const [nextX, nextY] = nextPos.split(',').map(Number);
      const dx = nextX - x;
      const dy = nextY - y;
      myDirection = [dx, dy]
    }
  });

  let blackListed = agent.beliefs.blackListed;
  agentsWithPredictions.forEach((other: (Agent & {
    direction: [number, number];
  })) => {
    if (other.id === you.id) return;
    const finded = singleWays.find((sw) => {
      return sw.tiles.some((t) => t.x === other.x && t.y === other.y);
    })

    const isNotSameDirection = other.direction !== myDirection || (other.direction[0] === 0 && other.direction[1] === 0);
    if (finded && isNotSameDirection) {
      blackListed.set(finded.id, {
        tile: { x: other.x, y: other.y, type: 0 },
        expires: Date.now() + 30 * agent.avgLoopTime // scade dopo 5 secondi
      });
    }

  })

  ///////////////////////////////
  // – Mappa con ostacoli agenti –
  ///////////////////////////////
  const mapWithAgentObstacles = new Map<string, Tile>();
  for (const [key, tile] of agent.map.entries()) mapWithAgentObstacles.set(key, { ...tile });
  for (const other of agent.agentsSensing[agent.agentsSensing.length - 1]) {
    if (other.id === you.id) continue;
    const key = `${other.x},${other.y}`;
    const t = mapWithAgentObstacles.get(key);
    //check if t is inside singleWay
    if (t && singleWays.some(sw => sw.tiles.some(t => t.x === other.x && t.y === other.y))) {
      // Se l'agente è in un singleWay, non lo consideriamo come ostacolo
      continue;
    }
    if (t) mapWithAgentObstacles.set(key, { ...t, type: 0 });

  }
  singleWays.forEach((sw) => {
    const tileToRemove = agent.beliefs.blackListed.get(sw.id)?.tile;
    const expires = agent.beliefs.blackListed.get(sw.id)?.expires;
    if (tileToRemove && expires && expires > Date.now()) {
      mapWithAgentObstacles.set(`${tileToRemove.x},${tileToRemove.y}`, { ...tileToRemove, type: 0 })
    } else if( tileToRemove && expires && expires <= Date.now()) {
      agent.beliefs.blackListed.delete(sw.id);
    }
  })


  // -------- Assegnazione beliefs finali --------
  agent.beliefs = {
    isOnDeliveryPoint: tileUnderYou?.type === 2,
    isOnUnpickedParcel,
    isCarryingParcels: parcelsCarried.length > 0,
    canSeeParcelsOnGround: parcelsOnGround.length > 0,
    carriedScore: parcelsCarried.reduce((s, c) => s + c.reward, 0),
    parcelsCarried,
    parcelsOnGround,
    deliveryPoints,
    agentsWithPredictions,
    mapWithAgentObstacles,
    exploreTarget: agent.beliefs?.exploreTarget,
    lastPositions,
    isInLoop,
    singleWays,
    blackListed: blackListed
  } as const;
}
