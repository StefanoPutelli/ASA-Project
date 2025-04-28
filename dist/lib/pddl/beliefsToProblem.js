import { PddlProblem, Beliefset } from "@unitn-asa/pddl-client";
/**
 * Dato l'agente, costruisce un PddlProblem con
 * - oggetti (agent, tile_*, parcel_*)
 * - init (fatti correnti)
 * - goal (esempio: consegnare tutti i pacchi)
 */
export function buildProblem(agent) {
    const bs = new Beliefset();
    // 1) Oggetti
    bs.addObject(`agent_${agent.you.id}`);
    for (const tile of agent.map.values()) {
        bs.addObject(`tile_${tile.x}_${tile.y}`);
    }
    for (const p of agent.parcelsSensing) {
        bs.addObject(`parcel_${p.id}`);
    }
    // 2) Fatti iniziali
    const [you] = [agent.you];
    bs.declare(`at agent_${you.id} tile_${you.x}_${you.y}`);
    // tile adjacenti
    for (const t1 of agent.map.values()) {
        for (const t2 of agent.map.values()) {
            const dx = Math.abs(t1.x - t2.x), dy = Math.abs(t1.y - t2.y);
            if ((dx + dy) === 1) {
                bs.declare(`adjacent tile_${t1.x}_${t1.y} tile_${t2.x}_${t2.y}`);
            }
        }
    }
    // parcel_at / carrying / delivery_point
    for (const p of agent.parcelsSensing) {
        const loc = `tile_${p.x}_${p.y}`;
        if (p.carriedBy === you.id) {
            bs.declare(`carrying agent_${you.id} parcel_${p.id}`);
        }
        else {
            bs.declare(`parcel_at parcel_${p.id} ${loc}`);
        }
    }
    // assumiamo delivery tiles hanno type === "2"
    for (const tile of agent.map.values()) {
        if (tile.type == "2") {
            bs.declare(`delivery_point tile_${tile.x}_${tile.y}`);
        }
    }
    // 3) Goal: es. “tutti i pacchi delivered”
    const goalLits = agent.parcelsSensing
        .map(p => `(delivered parcel_${p.id})`)
        .join(" ");
    const goal = `(and ${goalLits})`;
    // 4) Serializzo Problem PDDL
    const objects = bs.objects.join(" ");
    const init = bs.toPddlString();
    return new PddlProblem(`deliveroo-problem-${you.id}`, objects, init, goal);
}
