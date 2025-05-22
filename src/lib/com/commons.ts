import { Agent, Parcel } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "src/MyAgent.js";

export class Them {
    public parcelsOnGround : Parcel[] = [];
    public agentsSensing : Agent[][] = [];
    public agent : Agent | null = null; 

    constructor(me: MyAgent, them_id: string) {

        me.api.on('msg', (from, to, data, cb) => {
            console.log(data);
        });
    }
}

