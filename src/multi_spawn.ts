import dotenv from 'dotenv';
import crypto from 'crypto';
import { spawn } from 'child_process';

dotenv.config();

// Genera una stringa casuale di 32 caratteri per la chiave segreta
const secret_key = crypto.randomBytes(16).toString('hex'); // 32 caratteri esadecimali = 16 byte
var host = process.env.SERVER_URL || "https://deliveroojs25.azurewebsites.net/";

const p_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3NTA2MyIsIm5hbWUiOiJwb2xwbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ4MTkwODQ1fQ.Y1c8KqgPEfCaKK7mm-hsy4bUCrCleWtOhlQKdhb-IKQ";
const s_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdiYTQwZSIsIm5hbWUiOiJzZXBwaWEiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0ODE5MDg2NH0.Z15_nxAzUqxv_Y3ujoTAe35So8V5gQ8iWoTt4ZClWUM";

const polpo = { name: "polpo", token: p_token, showGui: false }
const seppia = { name: "seppia", token: s_token, showGui: false }

const pddl = process.argv[2] === "--pddl" ? "pddl" : "nopddl";



function spawnProcess(me : {
    name: string;
    token: string;
    showGui: boolean;
}){
    const child = spawn('node', ['dist/index_spawn.js', host, me.token, secret_key, me.showGui ? "show" : "noshow", pddl], {
        stdio: 'inherit',
        shell: true
    });

    child.on('error', (err) => {
        console.error(`Errore durante lo spawn del processo: ${err.message}`);
    });

    child.on('exit', (code) => {
        console.log(`Processo terminato con codice: ${code}`);
    });
}

spawnProcess(polpo);
spawnProcess(seppia);


