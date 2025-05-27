import dotenv from 'dotenv';
import crypto from 'crypto';
import { spawn } from 'child_process';

dotenv.config();

// Genera una stringa casuale di 32 caratteri per la chiave segreta
const secret_key = crypto.randomBytes(16).toString('hex'); // 32 caratteri esadecimali = 16 byte
var host = process.env.SERVER_URL || "https://deliveroojs25.azurewebsites.net/";

host = "http://192.168.23.242:8080/";

const p_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ2NGRhYyIsIm5hbWUiOiJjYW5lIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDgxOTEwNTR9.oQJOmKrJEkvoqNqn-CYyCzODVXxQtAonnjO7tuyEQRw";
const s_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwOWIyYyIsIm5hbWUiOiJnYXR0byIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ4MTkxMDY2fQ.1Upx-K_ba4kFOzPF1N3vD0CStEx8DfWhvzXDTPlkCqE";

const polpo = { name: "cane", token: p_token}
const seppia = { name: "gatto", token: s_token}

function spawnProcess(me : {
    name: string;
    token: string;
}){
    const child = spawn('node', ['dist/index_spawn.js', host, me.token, secret_key], {
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


