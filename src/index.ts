import { MyAgent } from './MyAgent.js';

const host = "http://192.168.23.248:8080/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMwYmNkMSIsIm5hbWUiOiJwb2xwbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NDQ4NzExfQ.PHAlkfLPFhza07ChChTwUAYKprZYZmSHpL2C-7yQbpE";

const pippo = new MyAgent(host , token);

pippo.agentLoop();