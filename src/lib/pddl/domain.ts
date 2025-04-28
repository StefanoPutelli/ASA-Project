import { PddlAction, PddlDomain } from "@unitn-asa/pddl-client";

export async function buildPddlDomain() {

    const moveUp = new PddlAction(
        'moveUp',
        '?me ?from ?to',
        'and (me ?me) (at ?me ?from) (up ?from ?to)',
        'and (at ?me ?to) (not (at ?me ?from))',
        async (l) => console.log('moveUp', l)
    );

    const moveDown = new PddlAction(
        'moveDown',
        '?me ?from ?to',
        'and (me ?me) (at ?me ?from) (down ?from ?to)',
        'and (at ?me ?to) (not (at ?me ?from))',
        async (...args) => console.log('moveDown', args)
    );

    const moveLeft = new PddlAction(
        'moveLeft',
        '?me ?from ?to',
        'and (me ?me) (at ?me ?from) (left ?from ?to)',
        'and (at ?me ?to) (not (at ?me ?from))',
        async (...args) => console.log('moveLeft', args)
    );

    const moveRight = new PddlAction(
        'moveRight',
        '?me ?from ?to',
        'and (me ?me) (at ?me ?from) (right ?from ?to)',
        'and (at ?me ?to) (not (at ?me ?from))',
        async (...args) => console.log('moveRight', args)
    );

    const domain = new PddlDomain("deliveroo", moveUp, moveDown, moveLeft, moveRight)

    console.log(domain.toPddlString());
    const path = await domain.saveToFile();
    console.log(`Domain saved to ${path}`);

    return domain;

}