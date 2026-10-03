// Scarica una volta la scala del tempo geologico da Macrostrat (che segue la
// International Chronostratigraphic Chart dell'ICS; dati CC-BY 4.0) e scrive
// content/tempo/scala.json con i nomi in italiano. Le età sono in Ma.
//
//   npx tsx scripts/scala-tempo.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = fileURLToPath(new URL("..", import.meta.url));
const API = "https://macrostrat.org/api/v2/defs/intervals?timescale=";
const LIVELLI = [
  ["eone", "international eons"],
  ["era", "international eras"],
  ["periodo", "international periods"],
  ["epoca", "international epochs"],
] as const;

const ITALIANO: Record<string, string> = {
  Phanerozoic: "Fanerozoico", Proterozoic: "Proterozoico", Archean: "Archeano", Hadean: "Adeano",
  Cenozoic: "Cenozoico", Mesozoic: "Mesozoico", Paleozoic: "Paleozoico",
  Neoproterozoic: "Neoproterozoico", Mesoproterozoic: "Mesoproterozoico", Paleoproterozoic: "Paleoproterozoico",
  Neoarchean: "Neoarcheano", Mesoarchean: "Mesoarcheano", Paleoarchean: "Paleoarcheano", Eoarchean: "Eoarcheano",
  Quaternary: "Quaternario", Neogene: "Neogene", Paleogene: "Paleogene", Cretaceous: "Cretaceo", Jurassic: "Giurassico",
  Triassic: "Triassico", Permian: "Permiano", Carboniferous: "Carbonifero", Devonian: "Devoniano", Silurian: "Siluriano",
  Ordovician: "Ordoviciano", Cambrian: "Cambriano", Ediacaran: "Ediacarano", Cryogenian: "Criogeniano", Tonian: "Toniano",
  Stenian: "Steniano", Ectasian: "Ectasiano", Calymmian: "Calimmiano", Statherian: "Stateriano", Orosirian: "Orosiriano",
  Rhyacian: "Riaciano", Siderian: "Sideriano",
  Holocene: "Olocene", Pleistocene: "Pleistocene", Pliocene: "Pliocene", Miocene: "Miocene", Oligocene: "Oligocene",
  Eocene: "Eocene", Paleocene: "Paleocene",
  Pennsylvanian: "Pennsylvaniano", Mississippian: "Mississippiano",
  Lopingian: "Lopingiano", Guadalupian: "Guadalupiano", Cisuralian: "Cisuraliano", Pridoli: "Pridoli", Ludlow: "Ludlow",
  Wenlock: "Wenlock", Llandovery: "Llandovery", Furongian: "Furongiano", Miaolingian: "Miaolingiano", "Series 2": "Serie 2", Terreneuvian: "Terreneuviano",
};
function italiano(nome: string): string {
  if (ITALIANO[nome]) return ITALIANO[nome];
  const m = /^(Early|Middle|Late|Lower|Upper)\s+(.+)$/.exec(nome);
  if (m) {
    const pos = { Early: "inferiore", Lower: "inferiore", Middle: "medio", Late: "superiore", Upper: "superiore" }[m[1]]!;
    const base = ITALIANO[m[2]] ?? m[2];
    return `${base} ${pos}`;
  }
  const n = /^(Terreneuvian|Series \d|Furongian|Llandovery|Wenlock|Ludlow|Pridoli|Cisuralian|Guadalupian|Lopingian)$/.exec(nome);
  return n ? nome : nome;
}

interface Unita {
  nome: string;
  inglese: string;
  livello: string;
  da: number;
  a: number;
  colore: string;
}

const unita: Unita[] = [];
for (const [livello, scala] of LIVELLI) {
  const r = await fetch(API + encodeURIComponent(scala));
  const j = await r.json();
  for (const x of j.success.data as { name: string; t_age: number; b_age: number; color: string }[]) {
    unita.push({ nome: italiano(x.name), inglese: x.name, livello, da: x.b_age, a: x.t_age, colore: x.color });
  }
  console.log(`✓ ${livello}: ${j.success.data.length}`);
}
// L'Adeano è informale nella carta ICS (dalla formazione della Terra, 4567 Ma,
// all'Archeano): Macrostrat non lo elenca, lo aggiungiamo segnato come tale.
if (!unita.some((u) => u.inglese === "Hadean")) unita.push({ nome: "Adeano (informale)", inglese: "Hadean", livello: "eone", da: 4567, a: 4031, colore: "#AE027E" });
unita.sort((a, b) => a.a - b.a || b.da - a.da);

mkdirSync(join(RADICE, "content", "tempo"), { recursive: true });
writeFileSync(
  join(RADICE, "content", "tempo", "scala.json"),
  JSON.stringify({ fonte: "Macrostrat API v2 (macrostrat.org), su International Chronostratigraphic Chart ICS · CC-BY 4.0", scaricato: new Date().toISOString().slice(0, 10), unita }, null, 1) + "\n",
);
console.log(`${unita.length} unità → content/tempo/scala.json`);
