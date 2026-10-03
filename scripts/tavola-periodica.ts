// I 118 elementi: dati da PubChem (NIH, «Periodic Table» in JSON), nomi
// italiani da Wikidata. Lo script calcola anche gruppo e periodo dal numero
// atomico per disegnare la tavola. Scrive content/chimica/elementi.json.
//
//   npx tsx scripts/tavola-periodica.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = fileURLToPath(new URL("..", import.meta.url));
const UA = { "User-Agent": "UniGeo/1.0 (studio personale)" };

const pub = await (await fetch("https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON", { headers: UA })).json();
const colonne: string[] = pub.Table.Columns.Column;
const righe: string[][] = pub.Table.Row.map((r: { Cell: string[] }) => r.Cell);
const col = (r: string[], nome: string) => r[colonne.indexOf(nome)];

const query = 'SELECT ?z ?it WHERE { ?e wdt:P31 wd:Q11344; wdt:P1086 ?z; rdfs:label ?it FILTER(lang(?it)="it") } ORDER BY ?z';
const wd = await (await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`, { headers: { ...UA, Accept: "application/sparql-results+json" } })).json();
const nomeIt = new Map<number, string>(wd.results.bindings.map((b: { z: { value: string }; it: { value: string } }) => [Number(b.z.value), b.it.value]));

// Posizione nella tavola a 18 colonne; lantanidi e attinidi nelle righe 9 e 10.
function posizione(z: number): { periodo: number; gruppo: number | null; riga: number; colonna: number } {
  const limiti = [2, 10, 18, 36, 54, 86, 118];
  const periodo = limiti.findIndex((l) => z <= l) + 1;
  if (z >= 57 && z <= 71) return { periodo: 6, gruppo: null, riga: 9, colonna: z - 57 + 3 };
  if (z >= 89 && z <= 103) return { periodo: 7, gruppo: null, riga: 10, colonna: z - 89 + 3 };
  const inizio = [1, 3, 11, 19, 37, 55, 87][periodo - 1];
  const i = z - inizio;
  let gruppo: number;
  if (periodo === 1) gruppo = z === 1 ? 1 : 18;
  else if (periodo <= 3) gruppo = i < 2 ? i + 1 : i + 11;
  else if (periodo <= 5) gruppo = i + 1;
  // 6-7: Cs/Ba (i 0-1), poi La…Lu / Ac…Lr (i 2-16) nella riga a parte, poi dal gruppo 4 (Hf, i 17)
  else gruppo = i < 2 ? i + 1 : i - 13;
  return { periodo, gruppo, riga: periodo, colonna: gruppo };
}

const CATEGORIE: Record<string, string> = {
  "Alkali metal": "Metallo alcalino",
  "Alkaline earth metal": "Metallo alcalino-terroso",
  "Transition metal": "Metallo di transizione",
  "Post-transition metal": "Metallo del blocco p",
  Metalloid: "Semimetallo",
  Nonmetal: "Non metallo",
  Halogen: "Alogeno",
  "Noble gas": "Gas nobile",
  Lanthanide: "Lantanide",
  Actinide: "Attinide",
};
const STATI: Record<string, string> = { Solid: "solido", Liquid: "liquido", Gas: "gassoso", "Expected to be a Solid": "solido (previsto)", "Expected to be a Gas": "gassoso (previsto)" };

const elementi = righe.map((r) => {
  const z = Number(col(r, "AtomicNumber"));
  const num = (k: string) => (col(r, k) ? Number(col(r, k)) : null);
  return {
    z,
    simbolo: col(r, "Symbol"),
    nome: nomeIt.get(z) ?? col(r, "Name"),
    inglese: col(r, "Name"),
    massa: num("AtomicMass"),
    configurazione: col(r, "ElectronConfiguration") || null,
    elettronegativita: num("Electronegativity"),
    stato: STATI[col(r, "StandardState")] ?? col(r, "StandardState"),
    categoria: CATEGORIE[col(r, "GroupBlock")] ?? col(r, "GroupBlock"),
    ossidazione: col(r, "OxidationStates") || null,
    scoperta: col(r, "YearDiscovered") === "Ancient" ? "antichità" : col(r, "YearDiscovered"),
    ...posizione(z),
  };
});

// Controlli: 118 elementi, posizioni tutte diverse.
const occupate = new Set(elementi.map((e) => `${e.riga}-${e.colonna}`));
if (elementi.length !== 118 || occupate.size !== 118) throw new Error(`Tavola incoerente: ${elementi.length} elementi, ${occupate.size} caselle`);

mkdirSync(join(RADICE, "content", "chimica"), { recursive: true });
writeFileSync(
  join(RADICE, "content", "chimica", "elementi.json"),
  JSON.stringify({ fonte: "PubChem Periodic Table (NIH) · nomi italiani da Wikidata", scaricato: new Date().toISOString().slice(0, 10), elementi }, null, 1) + "\n",
);
console.log(`✓ ${elementi.length} elementi, ${occupate.size} caselle`);
