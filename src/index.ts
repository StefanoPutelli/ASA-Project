import { MyAgent } from './MyAgent.js';

const host = "https://deliveroojs25.azurewebsites.net/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE5NmM2NCIsIm5hbWUiOiJhbm9ueW1vdXMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0NTg0MjM3NX0.Rc2L_gJGwdWXV9ZhXKwB8Vqxb5pY-kAuJ5XHLF7FdxA";

const pippo = new MyAgent(host , token);

pippo.agentLoop();