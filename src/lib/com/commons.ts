import { Agent, Parcel } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "src/MyAgent.js";

export class Them {
    public parcelsOnGround: Parcel[] = [];
    public agentsSensing: Agent[][] = [];
    public agent: Agent | null = null;
    public them_id: string;
    public isTalking: boolean = false;

    constructor(me: MyAgent, them_id: string) {
        this.them_id = them_id;

        me.api.on("msg", (from, to, data, cb) => {
            //console.log(data, from);
            if (from === them_id) {
                if (!this.isTalking) {
                    this.isTalking = true;
                }

                // Risposta con un altro ask
                me.api.emit("say", them_id, { type: "say", risposta: "ollare" }, (response) => {
                    //console.log("Risposta ricevuta da", them_id, ":", response);
                });
            }
        });
    }
}
