import { Agent, Parcel } from "@unitn-asa/deliveroo-js-client";
import { MyAgent } from "src/MyAgent.js";

export class Them {
    public parcelsOnGround: Parcel[] = [];
    public agentsSensing: Agent[][] = [];
    public agent: Agent | null = null;
    public them_id: string;

    public blacklistedParcels: string[] = [];

    private blacklistMyParcel(parcels: Parcel[], me: MyAgent) {
        this.blacklistedParcels = parcels.map(p => p.id);
        console.log(me.you.name, "Them: blacklisted parcels", this.blacklistedParcels);
    }

    public bookMyParcels(parcels: Parcel[], me: MyAgent) {
        me.api.emit("say", me.them?.them_id as string, { type: "book-parcel", parcels: parcels}, (res: any) => {
            console.log(res);
        });
    }

    constructor(me: MyAgent, them_id: string) {
        this.them_id = them_id;

        me.api.on("msg", (from: string, to: string, data: any, cb?: (res: any) => void) => {
            if (data.type === "book-parcel" && from === this.them_id) {
                if (me.them) {
                    me.them.blacklistMyParcel(data.parcels, me);
                    if (cb) cb({ status: "ok" });
                } else {
                    console.error("Them not initialized or not talking");
                    if (cb) cb({ status: "error", message: "Them not initialized or not talking" });
                }
            }
        });
    }
}
