import { MyAgent } from './MyAgent.js';

const host = "http://localhost:8080/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFlODcyMSIsIm5hbWUiOiJ3b2x3ZXdpbiIsInRlYW1JZCI6ImNkMTk2MSIsInRlYW1OYW1lIjoidGVzdDJAdGVzdC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0NjQ1NTExOH0.HxsDKp19hou0J1KBR9eab0ihg9T3ImM615OQNHNvqTI";

const pippo = new MyAgent(host , token);

pippo.agentLoop();