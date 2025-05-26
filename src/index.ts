import { MyAgent } from './MyAgent.js';
import dotenv from 'dotenv';

dotenv.config();

var host = process.env.SERVER_URL || "http://192.168.23.242:8080/";

host = "http://localhost:8080/";

// Recupera il token dal terzo argomento (index 2)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3NTA2MyIsIm5hbWUiOiJwb2xwbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ4MTkwODQ1fQ.Y1c8KqgPEfCaKK7mm-hsy4bUCrCleWtOhlQKdhb-IKQ";

// if (!token) {
//     console.error("❌ Errore: nessun token fornito. Usa: npm start -- <TOKEN>");
//     process.exit(1);
// }

const agent = new MyAgent(host, token);
agent.agentLoop();
