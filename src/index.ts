import { MyAgent } from './MyAgent.js';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.SERVER_URL || "https://deliveroojs25.azurewebsites.net/";

// Recupera il token dal terzo argomento (index 2)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkOTM1NyIsIm5hbWUiOiJwb2xwbyIsInRlYW1JZCI6IjExZjBmYiIsInRlYW1OYW1lIjoidGVzdDJAdGVzdC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0ODEwMjQ3MX0._OZbWDqbta2D4a-mv8Oy0wwSbfYn2b2pMeRt1OIMcLQ";

// if (!token) {
//     console.error("❌ Errore: nessun token fornito. Usa: npm start -- <TOKEN>");
//     process.exit(1);
// }

const agent = new MyAgent(host, token);
agent.agentLoop();
