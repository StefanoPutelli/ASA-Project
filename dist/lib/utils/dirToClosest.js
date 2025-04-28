const delta = {
    up: { x: 0, y: 1 },
    down: { x: 0, y: -1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};
export function getDirectionToClosestParcel(agent) {
    const you = agent.you;
    if (!you || agent.parcelsSensing.length === 0)
        return;
    // Trova solo i pacchi non ancora raccolti
    const parcelsOnGround = agent.parcelsSensing.filter(p => p.carriedBy !== you.id);
    if (parcelsOnGround.length === 0)
        return;
    // Trova il pacco più vicino (manhattan)
    let closestParcel = parcelsOnGround[0];
    let minDistance = manhattanDistance(you.x, you.y, closestParcel.x, closestParcel.y);
    for (const parcel of parcelsOnGround) {
        const dist = manhattanDistance(you.x, you.y, parcel.x, parcel.y);
        if (dist < minDistance) {
            closestParcel = parcel;
            minDistance = dist;
        }
    }
    // Calcola deltas
    const dx = closestParcel.x - you.x;
    const dy = closestParcel.y - you.y;
    // Prova direzioni in ordine di priorità (prima asse maggiore)
    const directions = [];
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx !== 0)
            directions.push(dx > 0 ? "right" : "left");
        if (dy !== 0)
            directions.push(dy > 0 ? "up" : "down");
    }
    else {
        if (dy !== 0)
            directions.push(dy > 0 ? "up" : "down");
        if (dx !== 0)
            directions.push(dx > 0 ? "right" : "left");
    }
    // Ritorna la prima direzione che porta a una tile valida
    for (const dir of directions) {
        const { x: dx, y: dy } = delta[dir];
        const tile = agent.map.get(`${you.x + dx},${you.y + dy}`);
        if (tile && tile.type != "0") {
            return dir;
        }
    }
    return; // Nessuna direzione valida
}
export function getDirectionToClosestDeliveryPoint(agent) {
    const you = agent.you;
    if (!you)
        return;
    // Filtra le tile di consegna (type === "2")
    const deliveryTiles = Array.from(agent.map.values()).filter(tile => tile.type == "2");
    if (deliveryTiles.length === 0)
        return;
    // Trova quella più vicina (Manhattan)
    let closest = deliveryTiles[0];
    let minDist = manhattanDistance(you.x, you.y, closest.x, closest.y);
    for (const tile of deliveryTiles) {
        const dist = manhattanDistance(you.x, you.y, tile.x, tile.y);
        if (dist < minDist) {
            closest = tile;
            minDist = dist;
        }
    }
    const dx = closest.x - you.x;
    const dy = closest.y - you.y;
    const directions = [];
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx !== 0)
            directions.push(dx > 0 ? "right" : "left");
        if (dy !== 0)
            directions.push(dy > 0 ? "up" : "down");
    }
    else {
        if (dy !== 0)
            directions.push(dy > 0 ? "up" : "down");
        if (dx !== 0)
            directions.push(dx > 0 ? "right" : "left");
    }
    for (const dir of directions) {
        const offset = delta[dir];
        const nextTile = agent.map.get(`${you.x + offset.x},${you.y + offset.y}`);
        if (nextTile && nextTile.type != "0") {
            return dir;
        }
    }
    return; // nessuna direzione valida trovata
}
function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
