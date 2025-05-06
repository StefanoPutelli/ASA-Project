import { MyAgent } from './MyAgent.js';

const host = "https://deliveroojs.rtibdi.disi.unitn.it/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIzYzY0YiIsIm5hbWUiOiJyYWlkZXJzIiwidGVhbUlkIjoiNDFjNmZlIiwidGVhbU5hbWUiOiJyYWlkZXJzIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY1Mjk1Mjh9.d3Scu-eKJfcvIuvBSumwwFo8sIDimQwW-isdkNSB9oM";

const pippo = new MyAgent(host , token);

pippo.agentLoop();