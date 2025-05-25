// src/lib/intentions.ts
import { MyAgent } from "../../MyAgent.js";
import type { Desire } from "./desires.js";
import * as utils from "../utils/z.index.js";
import { getDirection } from "../utils/getDirection.js";
import { sleep } from "@unitn-asa/deliveroo-js-client";
import move from "../utils/move.js";

export async function executeIntention(agent: MyAgent, desire: Desire): Promise<void> {
  const { api } = agent;

  if (desire.type !== "explore") {
    agent.beliefs.exploreTarget = undefined;
  }

  switch (desire.type) {
    case "deliver": {
      return new Promise((resolve) => {
        agent.intentions.push("Intention: putdown");
        api.emit("putdown", undefined, (response) => {
          //console.log(response);
          resolve();
        });
      });
    }

    case "pickup": {
      return new Promise((resolve) => {
        api.emit("pickup", (response) => {
          agent.intentions.push("Intention: pickup");
          //console.log(response);
          resolve();
        });
      });
    }

    case "exit-loop": {
      return new Promise(async (resolve) => {
        const direction = utils.getValidExploreDirection(agent);
        if (direction) {
          move(agent, direction, () => {
            agent.intentions.push("Intention: exit-loop → " + direction);
            resolve();
          });
        } else {
          //console.log("blocked, sleep");
          await sleep(300);
          resolve();
          return;
        }
      });
    }

    case "go-to-parcel": {
      return new Promise((resolve) => {
        if (!agent.you) {
          //console.log("no agent");
          resolve();
          return;
        }

        const tile = utils.computeDistanceAStar(agent.you?.x, agent.you?.y, desire.parcel.x, desire.parcel.y, agent.beliefs.mapWithAgentObstacles)?.path[1];
        if (!tile) {
          //console.log("no tile");
          resolve();
          return;
        }
        const direction = getDirection(agent.you?.x, agent.you?.y, tile?.x, tile?.y);
        if (direction) {
          move(agent, direction, () => {
            agent.intentions.push("Intention: go-to-parcel → " + direction);
            //console.log("move response");
            resolve();
          });
        } else {
          agent.intentions.push("Intention: go-to-parcel → blocked path");
          //console.log("no direction");
          resolve();
        }
      });
    }

    case "go-to-deliver": {
      return new Promise((resolve) => {
        if (!agent.you) {
          //console.log("no agent");
          resolve();
          return;
        }
        const tile = utils.computeDistanceAStar(agent.you?.x, agent.you?.y, desire.point.x, desire.point.y, agent.beliefs.mapWithAgentObstacles)?.path[1];
        if (!tile) {
          //console.log("no tile");
          resolve();
          return;
        }
        const direction = getDirection(agent.you?.x, agent.you?.y, tile?.x, tile?.y);
        if (direction) {
          move(agent, direction, () => {
            agent.intentions.push("Intention: go-to-deliver → " + direction);
            //console.log("move response");
            resolve();
          });
        } else {
          agent.intentions.push("Intention: go-to-deliver → blocked path");
          //console.log("no direction");
          resolve();
        }
      });
    }

    case "explore": {
      return new Promise((resolve) => {

        const direction = utils.explore(agent);
        if (direction) {
          move(agent, direction, () => {
            agent.intentions.push("Intention: explore → " + direction);
            //console.log("move response");
            resolve();
          });
        } else {
          agent.intentions.push("Intention: explore → no valid moves");
          //console.log("no direction");
          resolve();
        }

        // if(agent.whereparcelspawns === 1){

        // }
        // const direction = utils.getValidExploreDirection(agent);
        // if (direction) {
        //   agent.api.emit("move", direction, () => {
        //     agent.intentions.push("Intention: explore →" + direction);
        //     resolve();
        //   });
        // } else {
        //   agent.intentions.push("Intention: explore → no valid moves");
        //   resolve();
        // }
      });
    }

    default:
      console.warn("Unknown intention:", desire);
      return Promise.resolve();
  }
}
