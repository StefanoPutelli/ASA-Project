import { MyAgent } from './MyAgent.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Genera una stringa casuale di 32 caratteri per la chiave segreta
const secret_key = crypto.randomBytes(16).toString('hex'); // 32 caratteri esadecimali = 16 byte


const host = process.env.SERVER_URL || "https://deliveroojs25.azurewebsites.net/";

const p_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkOTM1NyIsIm5hbWUiOiJwb2xwbyIsInRlYW1JZCI6IjExZjBmYiIsInRlYW1OYW1lIjoidGVzdDJAdGVzdC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0ODEwMjQ3MX0._OZbWDqbta2D4a-mv8Oy0wwSbfYn2b2pMeRt1OIMcLQ";

const polpo = new MyAgent(host , p_token, secret_key);
polpo.agentLoop();

const s_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5ZmE0YiIsIm5hbWUiOiJzZXBwaWEiLCJ0ZWFtSWQiOiI0NDg4MGYiLCJ0ZWFtTmFtZSI6InRlc3QyQHRlc3QuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDgxMDI1NjR9.E__p1wdvCBZ0Yc811L617mijDfod2-WqAOxTmzBEXlU";

const seppia = new MyAgent(host , s_token, secret_key);
seppia.agentLoop();


/*

const token_list = [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMDliNiIsIm5hbWUiOiIxIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTcyNTF9.Nps5cxjd81cvtZqtH-SyauqMScBNGiK4hJf2R6KHuso",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFkNzcyOSIsIm5hbWUiOiIyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTcyNTR9.UhwEDHBJ3B4dceAYG8f8RwvU9ZztEPN6nR6kceAPaCA",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQyNjk5MyIsIm5hbWUiOiIzIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTcyNTZ9.sN81At7gMZqm5NXoPhA1V-dYZdRHbG2Tww8yQMNctWk",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJmNjVmMCIsIm5hbWUiOiI0Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTcyNTl9.d5dwShNfXz9I87qHa70t9HhnXvPRp-yRkM1IEXMd2Fc",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVmYmJlNCIsIm5hbWUiOiI1Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTcyNjN9.ji-gC1PAKfXbQCovKpWaBZP_yqIBY50-2Vc9YrQeS2w",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjNzg2NiIsIm5hbWUiOiI2Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTcyNjV9.6-s6Lg_vDPqEDb5MfBbPBSvZUlI6PF239HqZ51AZKI8",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA3YTI2MiIsIm5hbWUiOiI3Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTcyNjl9.1bJh5Z4aDniMbaNThJvY1G3Xo4oGeTPk123vy8khhcw",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI2YThhNiIsIm5hbWUiOiI4Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDY0NTcyNzF9.DPEovfanJOsG1QTe7-3yQccy_PCnu-JpudnaYlxFBpw"
]

const q = new MyAgent(host , token_list[0]);
q.agentLoop();

const w = new MyAgent(host , token_list[1]);
w.agentLoop();

const r = new MyAgent(host , token_list[2]);
r.agentLoop();

const t = new MyAgent(host , token_list[3]);
t.agentLoop();

const y = new MyAgent(host , token_list[4]);
y.agentLoop();

const u = new MyAgent(host , token_list[5]);
u.agentLoop();

const i = new MyAgent(host , token_list[6]);
i.agentLoop();

const o = new MyAgent(host , token_list[7]);
o.agentLoop();

*/