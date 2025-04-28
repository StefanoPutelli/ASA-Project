// src/lib/pathfinding.ts
/**
 * Ritorna la distanza minima (numero di passi) tra (startX,startY) e (goalX,goalY) sulla griglia `map`,
 * usando A* con euristica Manhattan. Restituisce `undefined` se non esiste alcun percorso
 * o se start/goal sono fuori mappa o su un muro.
 *
 * @param startX – colonna di partenza
 * @param startY – riga di partenza
 * @param goalX  – colonna di destinazione
 * @param goalY  – riga di destinazione
 * @param map    – Map<"x,y", Tile> che rappresenta tutta la griglia
 */
export function computeDistanceAStar(startX, startY, goalX, goalY, map) {
    const keyFromXY = (x, y) => `${x},${y}`;
    // Lookup dei tile di start e goal
    const startKey = keyFromXY(startX, startY);
    const goalKey = keyFromXY(goalX, goalY);
    const startTile = map.get(startKey);
    const goalTile = map.get(goalKey);
    // Se partenza o arrivo non esistono o sono muri, esci
    if (!startTile || !goalTile || startTile.type == "0" || goalTile.type == "0") {
        return undefined;
    }
    // Euristica Manhattan
    const heuristic = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);
    // Vicini ortogonali non-bloccati
    const neighbors = (x, y) => {
        const deltas = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
        ];
        const result = [];
        for (const { dx, dy } of deltas) {
            const nx = x + dx, ny = y + dy, key = keyFromXY(nx, ny);
            const tile = map.get(key);
            if (tile && tile.type != "0")
                result.push({ x: nx, y: ny });
        }
        return result;
    };
    // A* data structures
    const openSet = new Set([startKey]);
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([
        [startKey, heuristic(startX, startY, goalX, goalY)]
    ]);
    const cameFrom = new Map(); // per ricostruire il percorso
    while (openSet.size > 0) {
        // seleziona il nodo con fScore più basso
        let currentKey;
        let bestF = Infinity;
        for (const k of openSet) {
            const f = fScore.get(k) ?? Infinity;
            if (f < bestF) {
                bestF = f;
                currentKey = k;
            }
        }
        if (!currentKey)
            break;
        // se siamo al goal, ricostruisci path
        if (currentKey === goalKey) {
            const dist = gScore.get(currentKey);
            const pathKeys = [];
            let k = goalKey;
            while (k) {
                pathKeys.push(k);
                if (k === startKey)
                    break;
                k = cameFrom.get(k);
            }
            pathKeys.reverse();
            const path = pathKeys.map(key => map.get(key)).filter(Boolean);
            return { distance: dist, path };
        }
        openSet.delete(currentKey);
        const [cx, cy] = currentKey.split(",").map(Number);
        for (const { x: nx, y: ny } of neighbors(cx, cy)) {
            const nKey = keyFromXY(nx, ny);
            const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
            if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
                cameFrom.set(nKey, currentKey);
                gScore.set(nKey, tentativeG);
                fScore.set(nKey, tentativeG + heuristic(nx, ny, goalX, goalY));
                openSet.add(nKey);
            }
        }
    }
    // nessun percorso trovato
    return undefined;
}
