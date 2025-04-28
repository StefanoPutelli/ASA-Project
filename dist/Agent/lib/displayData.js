"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMap = renderMap;
function renderMap(agent) {
    const width = agent.mapData.x;
    const height = agent.mapData.y;
    // Initialize grid with '.' for empty cells.
    const grid = Array.from({ length: height }, () => Array(width).fill('.'));
    // Populate the grid with the provided tile information.
    for (const tile of agent.mapData.tile) {
        if (tile.x >= 0 && tile.x < width && tile.y >= 0 && tile.y < height) {
            // Use the tile type if non-zero, otherwise default to an empty cell.
            grid[tile.y][tile.x] = tile.type === 0 ? '.' : String(tile.type);
        }
    }
    // Overlay your agent.
    if (agent.you) {
        const { x, y } = agent.you;
        if (y >= 0 && y < height && x >= 0 && x < width) {
            grid[y][x] = 'A';
        }
    }
    // Overlay enemy agents.
    for (const enemy of agent.EnemyAgentsSensing) {
        const { x, y } = enemy;
        if (y >= 0 && y < height && x >= 0 && x < width) {
            grid[y][x] = 'E';
        }
    }
    // Overlay parcels.
    for (const parcel of agent.parcelsSensing) {
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
    console.log("GameMap Visual Representation:");
    console.log(visual);
}
