import fs from 'fs';
import { Tile } from '@unitn-asa/deliveroo-js-client';

const MAPS_FILE = './maps.json';

const AVAILABLE_CODES = [
  '24c1_1', '24c1_2', '24c1_3', '24c1_4', '24c1_5', '24c1_6', '24c1_7', '24c1_8', '24c1_9',
  '24c2_1', '24c2_2', '24c2_3', '24c2_4', '24c2_5', '24c2_6', '24c2_7', '24c2_8', '24c2_9', '25c1_2', '25c1_3', '25c1_4', '25c1_5', '25c1_7', '25c1_8', '25c1_9',
  '25c2_hallway', 'challenge_21', 'challenge_22', 'challenge_23', 'challenge_24',
  'challenge_31', 'challenge_33', 'default_map', 'empty_10',
  'empty_map', 'level_5', 'loops', 'map_20', 'map_60', 'map_random'
];

type SavedMaps = Record<string, string>;

function serializeMap(map: Map<string, Tile>): string {
  const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(sorted));
}

export function saveMapIfNew(map: Map<string, Tile>): string | null {
  const serialized = serializeMap(map);
  let savedMaps: SavedMaps = {};

  if (fs.existsSync(MAPS_FILE)) {
    savedMaps = JSON.parse(fs.readFileSync(MAPS_FILE, 'utf-8'));
  }

  // Controlla se la mappa è già presente
  for (const existing of Object.values(savedMaps)) {
    if (existing === serialized) {
      console.log('✔️ Mappa già presente, non salvata.');
      return null;
    }
  }

  // Trova il primo nome libero
  const usedNames = new Set(Object.keys(savedMaps));
  const newCode = AVAILABLE_CODES.find(code => !usedNames.has(code));

  if (!newCode) {
    throw new Error("❌ Nessun nome disponibile in AVAILABLE_CODES.");
  }

  // Salva la nuova mappa
  savedMaps[newCode] = serialized;
  fs.writeFileSync(MAPS_FILE, JSON.stringify(savedMaps, null, 0), 'utf-8');
  console.log(`💾 Mappa salvata come "${newCode}".`);
  return newCode;
}
