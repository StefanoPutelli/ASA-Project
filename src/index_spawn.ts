import { MyAgent } from './MyAgent.js';

const host = process.argv[2] || process.env.SERVER_URL || "http://localhost:8080/";

// Recupera il token dal terzo argomento (index 2)
const token = process.argv[3];

if (!token) {
    console.error("❌ Errore: nessun token fornito.");
    process.exit(1);
}

const secret_key = process.argv[4] || null;

const agent = new MyAgent(host, token, secret_key);
agent.agentLoop();
