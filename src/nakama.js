import { Client } from "@heroiclabs/nakama-js";
import { v4 as uuidv4 } from "uuid";

class Nakama {
    constructor() {
        this.client
        this.session
        this.socket // ep4
        this.matchID // ep4
    }

    async authenticate() {
        const useSSL = true
        this.client = new Client("defaultkey", "6j75ftk5-7350.use.devtunnels.ms", "443", useSSL);
        // this.client.ssl = true;

        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem("deviceId", deviceId);
        }

        this.session = await this.client.authenticateDevice(deviceId, true);
        localStorage.setItem("user_id", this.session.user_id);

        // ep4
        const trace = false;
        this.socket = this.client.createSocket(useSSL, trace);
        await this.socket.connect(this.session);

    }

    async findMatch(ai=false) { // ep4
        const rpcid = "find_match";
        const matches = await this.client.rpc(this.session, rpcid, {ai: ai});

        this.matchID = matches.payload.matchIds[0]
        await this.socket.joinMatch(this.matchID);
        console.log("Matched joined!")
    }

    async makeMove(index) { // ep4
        var data = { "position": index };
        await this.socket.sendMatchState(this.matchID, 4, JSON.stringify(data));
        console.log("Match data sent")
    }

    async inviteAI() {
        await this.socket.sendMatchState(this.matchID, 7, "");
        console.log("AI player invited")
    }
}

export default new Nakama()
