// src/lib/printMap.ts
export function printMap(agent) {
    console.clear();
    const tiles = Array.from(agent.map.values());
    if (!tiles.length) {
        console.log("Mappa non ancora ricevuta.");
        return;
    }
    const maxX = Math.max(...tiles.map(t => t.x));
    const maxY = Math.max(...tiles.map(t => t.y));
    const width = maxX + 1;
    const height = maxY + 1;
    const typeSymbols = {
        "0": "  ",
        "1": ". ",
        "2": "# "
    };
    const grid = Array.from({ length: height }, () => Array.from({ length: width }, () => " "));
    // Popola la griglia con i tile base
    for (const tile of tiles) {
        const sym = typeSymbols[tile.type] ?? "?";
        grid[tile.y][tile.x] = sym;
    }
    // Sovrascrivi con pacchi, agenti e te stesso
    for (const parcel of agent.parcelsSensing) {
        grid[parcel.y][parcel.x] = "* ";
    }
    for (const other of agent.agentsSensing) {
        grid[other.y][other.x] = "X ";
    }
    if (agent.you) {
        grid[agent.you.y][agent.you.x] = "@ ";
    }
    // Stampa capovolgendo l'asse Y
    for (let row = height - 1; row >= 0; row--) {
        console.log(grid[row].join(""));
    }
}
