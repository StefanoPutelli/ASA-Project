import { MyAgent } from './MyAgent.js';
const host = "https://deliveroojs25.azurewebsites.net/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIyN2JiOCIsIm5hbWUiOiJwb2xwbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ1NTczNzE1fQ.1gv6E1xv-oBmxzXb_Bsp9Vd0vYqZZsMThLEA2CSNxEo";
const pippo = new MyAgent(host, token);
pippo.agentLoop();
