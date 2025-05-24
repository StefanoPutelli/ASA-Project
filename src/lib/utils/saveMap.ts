import fs from 'fs';
import path from 'path';
import { Tile } from '@unitn-asa/deliveroo-js-client';


type SavedMaps = Record<string, Record<string, Tile>>;

const MAPS_FILE = './maps.json';
const AVAILABLE_CODES = ['24c1_1', '24c1_2', '24c1_3', '24c1_4', '24c1_5', '24c1_6', '24c1_7', '24c1_8', '24c1_9', '24c2_1', '24c2_2', '24c2_3', '24c2_4', '24c2_5', '24c2_6', '24c2_7', '24c2_8', '24c2_9', '25c1_1', '25c1_2', '25c1_3', '25c1_4', '25c1_5', '25c1_6', '25c1_7', '25c1_8', '25c1_9', '25c2_hallway', 'challenge_21', 'challenge_22', 'challenge_23', 'challenge_24', 'challenge_31', 'challenge_32', 'challenge_33', 'default_map', 'empty_10', 'empty_map', 'level_5', 'loops', 'map_20', 'map_30', 'map_60', 'map_random']; // ecc.

function serializeMap(map: Map<string, Tile>): string {
  // Ordina le entry per chiave per una rappresentazione deterministica
  const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(sorted));
}

export function saveMapIfNew(map: Map<string, Tile>): string | null {
  const serialized = serializeMap(map);
  let savedMaps: SavedMaps = {};

  if (fs.existsSync(MAPS_FILE)) {
    savedMaps = JSON.parse(fs.readFileSync(MAPS_FILE, 'utf-8'));
  }

  // Controlla se la mappa esiste già
  for (const [code, saved] of Object.entries(savedMaps)) {
    const savedSerialized = JSON.stringify(saved);
    if (serialized === savedSerialized) {
      console.log(`Mappa già presente con codice: ${code}`);
      return null;
    }
  }

  // Trova primo codice libero
  const usedCodes = new Set(Object.keys(savedMaps));
  const newCode = AVAILABLE_CODES.find(code => !usedCodes.has(code));

  if (!newCode) {
    throw new Error("Codici terminati.");
  }

  // Salva la nuova mappa
  savedMaps[newCode] = Object.fromEntries(map.entries());
  fs.writeFileSync(MAPS_FILE, JSON.stringify(savedMaps, null, 2), 'utf-8');
  console.log(`Mappa salvata con codice: ${newCode}`);
  return newCode;
}
