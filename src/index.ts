import { MyAgent } from './MyAgent.js';

const host = "http://localhost:8080/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg1ZDMwYSIsIm5hbWUiOiJjYWNhIiwidGVhbUlkIjoiZjliYmY5IiwidGVhbU5hbWUiOiJ0ZXN0MkB0ZXN0LmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NDQ5MTI5fQ.dRhiQosDcuXaa3mk4bQzfR8S5i5PZMfwS7gwI0Dmf7Y";

const pippo = new MyAgent(host , token);

pippo.agentLoop();