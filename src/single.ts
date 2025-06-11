import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

var host = process.env.SERVER_URL || "https://deliveroojs25.azurewebsites.net/";

const p_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY2NWI1NiIsIm5hbWUiOiJwb2xwbyIsInRlYW1JZCI6ImU1MjViOSIsInRlYW1OYW1lIjoicmFpZGVycyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ4NDE4MzgzfQ.SuwUImEToE4ryXU4D-kAqVnvkZmrqQKcubow4BndZjU";

const polpo = { name: "polpo", token: p_token, showGui: process.env.SHOW_GUI === "true" || false  }

const pddl = process.argv[2] === "--pddl" ? "pddl" : "nopddl";

console.log(pddl)

function spawnProcess(me: {
    name: string;
    token: string;
    showGui: boolean;
}) {
    const child = spawn('node', ['dist/spawn.js', host, me.token, "none", me.showGui ? "show" : "noshow", pddl], {
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


