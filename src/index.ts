import { MyAgent } from './MyAgent.js';

const host = "http://192.168.23.242:8080/";

// Recupera il token dal terzo argomento (index 2)
const token = process.argv[2];
const them_id = process.argv[3];

if (!token || !them_id) {
    console.error("❌ Errore: nessun token fornito. Usa: npm start -- <TOKEN>");
    process.exit(1);
}

const agent = new MyAgent(host, token, them_id);
agent.agentLoop();
