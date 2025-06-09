import dotenv from 'dotenv';
import crypto from 'crypto';
import { spawn } from 'child_process';

dotenv.config();

// Genera una stringa casuale di 32 caratteri per la chiave segreta
const secret_key = crypto.randomBytes(16).toString('hex'); // 32 caratteri esadecimali = 16 byte
const host = process.env.SERVER_URL || "https://deliveroojs25.azurewebsites.net/";

const p_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY2NWI1NiIsIm5hbWUiOiJwb2xwbyIsInRlYW1JZCI6ImU1MjViOSIsInRlYW1OYW1lIjoicmFpZGVycyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ4NDE4MzgzfQ.SuwUImEToE4ryXU4D-kAqVnvkZmrqQKcubow4BndZjU";
const s_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYzZTVkZSIsIm5hbWUiOiJzZXBwaWEiLCJ0ZWFtSWQiOiI5MWMwZmQiLCJ0ZWFtTmFtZSI6InJhaWRlcnMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0ODQxODM4OH0.0lImxPecY3gtGdFNASxbuJ4Z5u1OEAUJ5p0xGodxOQM";

const polpo = { name: "polpo", token: p_token, showGui : false}
const seppia = { name: "seppia", token: s_token, showGui : false}

function spawnProcess(me : {
    name: string;
    token: string;
    showGui: boolean;
}){
    const child = spawn('node', ['dist/index_spawn.js', host, me.token, secret_key, me.showGui ? "show" : ""], {
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


