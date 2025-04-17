import { MyAgent } from './MyAgent.js';

const host = "https://deliveroojs25.azurewebsites.net/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI5ZmE3YyIsIm5hbWUiOiJhbm9ueW1vdXMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0NDg5MjE5NX0.7cohn3nUNsdNn-yvmzca4_WomcHO8G0jr6jt2u2MA3k";

const pippo = new MyAgent(host , token);

pippo.agentLoop();