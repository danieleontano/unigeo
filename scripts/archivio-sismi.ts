// Allunga l'archivio dei terremoti RSNI (content/terremoti/archivio.json) con
// gli eventi del feed, che ne tiene solo 20. Lo lancia GitHub Actions ogni due
// ore (.github/workflows/terremoti.yml); se ci sono eventi nuovi il file
// cambia, si fa un commit e Vercel ripubblica. Senza dipendenze: gira con
//   node scripts/archivio-sismi.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { leggiFeed, unisci, type Sisma } from "../src/lib/rsni.ts";

const FILE = join(import.meta.dirname, "..", "content", "terremoti", "archivio.json");

let salvato: { dal: string; aggiornato: string; eventi: Sisma[] };
try {
  salvato = JSON.parse(readFileSync(FILE, "utf8"));
} catch {
  salvato = { dal: new Date().toISOString(), aggiornato: new Date().toISOString(), eventi: [] };
}

const feed = await leggiFeed();
if (!feed) {
  console.log("Feed RSNI non raggiungibile: archivio invariato.");
  process.exit(0);
}
const prima = new Set(salvato.eventi.map((e) => `${e.id}|${e.magnitudo}|${e.quando}`));
const eventi = unisci(salvato.eventi, feed);
const nuovi = eventi.filter((e) => !prima.has(`${e.id}|${e.magnitudo}|${e.quando}`)).length;
if (nuovi === 0) {
  console.log(`Nessun evento nuovo (${eventi.length} in archivio).`);
  process.exit(0);
}
writeFileSync(FILE, JSON.stringify({ dal: salvato.dal, aggiornato: new Date().toISOString(), eventi }, null, 1) + "\n");
console.log(`${nuovi} eventi nuovi o rivisti, ${eventi.length} in archivio.`);
