"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = test;
function move(agent, com) {
    if (com.action === "move") {
        agent.client.emitMove(com.direction);
    }
    else {
        console.error("Invalid action");
    }
}
function test(agent) {
    const com = {
        direction: "up",
        action: "move"
    };
    move(agent, com);
}
