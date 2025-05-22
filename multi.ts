import { MyAgent } from './MyAgent.js';

const host = "http://192.168.23.248:8080/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMwYmNkMSIsIm5hbWUiOiJwb2xwbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NDQ4NzExfQ.PHAlkfLPFhza07ChChTwUAYKprZYZmSHpL2C-7yQbpE";

const pippo = new MyAgent(host , token);

pippo.agentLoop();


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
