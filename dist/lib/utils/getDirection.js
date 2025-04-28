// src/lib/getDirection.ts
/**
 * Data una tile di partenza e una di arrivo adiacenti,
 * ritorna la direzione da usare: "up", "down", "left" o "right".
 * Se le due tile non sono adiacenti, restituisce undefined.
 */
export function getDirection(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    // spostamento orizzontale
    if (dx === 1 && dy === 0)
        return "right";
    if (dx === -1 && dy === 0)
        return "left";
    // spostamento verticale
    if (dx === 0 && dy === -1)
        return "down";
    if (dx === 0 && dy === 1)
        return "up";
    // non adiacenti
    return undefined;
}
