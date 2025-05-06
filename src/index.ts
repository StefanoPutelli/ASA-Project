import { MyAgent } from './MyAgent.js';

const host = "https://deliveroojs2.rtibdi.disi.unitn.it/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE2MDQyMCIsIm5hbWUiOiJyYWlkZXJzIiwidGVhbUlkIjoiMzIzNGJjIiwidGVhbU5hbWUiOiJyYWlkZXJzIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY1MjU0Nzl9.07z_LFl3pegBZ7W01NqHVILhHLlTpNak44QvjalD5W4";

const pippo = new MyAgent(host , token);

pippo.agentLoop();