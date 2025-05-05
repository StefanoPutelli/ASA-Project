import { MyAgent } from './MyAgent.js';

const host = "http://localhost:8080/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ0YjU2NyIsIm5hbWUiOiJhbm9ueW1vdXMiLCJ0ZWFtSWQiOiI4YmI4OGQiLCJ0ZWFtTmFtZSI6InRlc3QyQHRlc3QuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTE4NTZ9.zWSmiOdjFFWG6DvgWLg8SQS02XbvmZXWPPT1TF2pJ9o";

const pippo = new MyAgent(host , token);

pippo.agentLoop();