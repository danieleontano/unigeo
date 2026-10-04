// La carta cronostratigrafica internazionale UFFICIALE, dalla fonte: la
// Commissione Internazionale di Stratigrafia (ICS) pubblica i dati della carta
// come RDF nel repository github.com/i-c-stratigraphy/chart, versionato; la
// pagina stratigraphy.org/chart li legge da lì. Questo script prende l'ultima
// versione pubblicata (tramite jsDelivr), estrae le unità e scrive
// content/tempo/carta-ics.json con nomi italiani, età e incertezze, colori,
// GSSP ratificati.
//
//   npx tsx scripts/carta-ics.ts          aggiorna se c'è una versione nuova
//   npx tsx scripts/carta-ics.ts --forza  riscrive comunque
//
// Lo lancia anche la GitHub Action settimanale (.github/workflows/carta-ics.yml):
// se la carta cambia, il sito si ripubblica da solo.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser, Store, DataFactory } from "n3";

const RADICE = fileURLToPath(new URL("..", import.meta.url));
const USCITA = join(RADICE, "content", "tempo", "carta-ics.json");
const forza = process.argv.includes("--forza");

const NS = {
  ischart: "http://resource.geosciml.org/classifier/ics/ischart/",
  gts: "http://resource.geosciml.org/ontology/timescale/gts#",
  rank: "http://resource.geosciml.org/ontology/timescale/rank/",
  skos: "http://www.w3.org/2004/02/skos/core#",
  time: "http://www.w3.org/2006/time#",
  schema: "https://schema.org/",
  sh: "http://www.w3.org/ns/shacl#",
  owl: "http://www.w3.org/2002/07/owl#",
  dcterms: "http://purl.org/dc/terms/",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
};
const { namedNode } = DataFactory;
const n = (ns: keyof typeof NS, locale: string) => namedNode(NS[ns] + locale);

const LIVELLI: Record<string, string> = {
  "Super-Eon": "supereone",
  Eon: "eone",
  Era: "era",
  Period: "periodo",
  "Sub-Period": "sottoperiodo",
  Epoch: "epoca",
  Age: "eta",
};

// 1. Ultima versione pubblicata
const pacchetto = await (await fetch("https://data.jsdelivr.com/v1/packages/gh/i-c-stratigraphy/chart")).json();
const versioneTag: string = pacchetto.versions[0].version;
const precedente = existsSync(USCITA) ? JSON.parse(readFileSync(USCITA, "utf8")) : null;
if (precedente?.tag === versioneTag && !forza) {
  console.log(`Carta ICS già aggiornata (${versioneTag}).`);
  process.exit(0);
}

// 2. Dati RDF
const ttl = await (await fetch(`https://cdn.jsdelivr.net/gh/i-c-stratigraphy/chart@${versioneTag}/chart.ttl`)).text();
const store = new Store(new Parser().parse(ttl));

const uno = (s: ReturnType<typeof namedNode>, p: ReturnType<typeof namedNode>) => store.getObjects(s, p, null)[0];
function etichetta(s: ReturnType<typeof namedNode>, p: ReturnType<typeof namedNode>, lingua: string): string | undefined {
  return store.getObjects(s, p, null).find((o) => o.termType === "Literal" && (o as { language: string }).language === lingua)?.value;
}
function confine(s: ReturnType<typeof namedNode>, quale: "hasBeginning" | "hasEnd") {
  const nodo = uno(s, n("time", quale));
  if (!nodo) return { ma: undefined as number | undefined, errore: undefined as number | undefined };
  const ma = store.getObjects(nodo, n("ischart", "inMYA"), null)[0]?.value;
  const errore = store.getObjects(nodo, n("schema", "marginOfError"), null)[0]?.value;
  return { ma: ma !== undefined ? Number(ma) : undefined, errore: errore !== undefined ? Number(errore) : undefined };
}

// Alcune unità non hanno etichetta propria: la carta ufficiale la compone
// («Upper» + «Jurassic», «Cambrian» + «Series» + «2») con le etichette che il
// file stesso dà a quelle parole. Facciamo lo stesso, in italiano.
const STRAT = "http://resource.geosciml.org/ontology/stratigraphy/";
const parola = (iri: string, lingua: string) => etichetta(namedNode(iri), n("skos", "prefLabel"), lingua);
function composta(id: string, lingua: string): string | undefined {
  const m = /^(Upper|Middle|Lower)(.+)$/.exec(id);
  if (m) {
    const pos = parola(STRAT + m[1], lingua) ?? m[1];
    const base = parola(NS.ischart + m[2], lingua) ?? m[2];
    return lingua === "it" ? `${base} ${pos.toLowerCase()}` : `${pos} ${base}`;
  }
  const c = /^Cambrian(Series|Stage)(\d+)$/.exec(id);
  if (c) {
    const cambriano = parola(NS.ischart + "Cambrian", lingua) ?? "Cambrian";
    const tipo = parola(STRAT + c[1], lingua) ?? c[1];
    return lingua === "it" ? `${tipo} ${c[2]} del ${cambriano}` : `${cambriano} ${tipo} ${c[2]}`;
  }
  return undefined;
}

const unita = [];
for (const q of store.getQuads(null, n("gts", "rank"), null, null)) {
  const s = q.subject as ReturnType<typeof namedNode>;
  if (!s.value.startsWith(NS.ischart)) continue;
  const rango = q.object.value.replace(NS.rank, "");
  const livello = LIVELLI[rango];
  if (!livello) continue;
  const inizio = confine(s, "hasBeginning");
  const fine = confine(s, "hasEnd");
  const sopra = uno(s, n("skos", "broader"))?.value.replace(NS.ischart, "");
  const id = s.value.replace(NS.ischart, "");
  unita.push({
    id,
    livello,
    nome: etichetta(s, n("skos", "prefLabel"), "it") ?? composta(id, "it") ?? etichetta(s, n("skos", "prefLabel"), "en") ?? id,
    inglese: etichetta(s, n("skos", "prefLabel"), "en") ?? composta(id, "en") ?? id,
    sopra,
    da: inizio.ma,
    daErrore: inizio.errore,
    a: fine.ma,
    aErrore: fine.errore,
    gssp: uno(s, n("gts", "ratifiedGSSP"))?.value === "true",
    colore: uno(s, n("schema", "color"))?.value,
    ordine: Number(uno(s, n("sh", "order"))?.value ?? 0),
    sigla: uno(s, n("skos", "notation"))?.value,
  });
}
// Il Pridoli è sia serie sia piano (non ha piani propri) e compare due volte
// con lo stesso id: si tiene il rango più alto.
const RANGHI = ["supereone", "eone", "era", "periodo", "sottoperiodo", "epoca", "eta"];
const perId = new Map<string, (typeof unita)[number]>();
for (const u of unita) {
  const gia = perId.get(u.id);
  if (!gia || RANGHI.indexOf(u.livello) < RANGHI.indexOf(gia.livello)) perId.set(u.id, u);
}
unita.length = 0;
unita.push(...perId.values());
// Tra fratelli dello stesso livello il tetto del più antico è la base del più
// giovane: dove il file non torna (Ludlow finiva a 419,62 come il Pridoli) si
// allinea e lo si dice.
for (const u of unita) {
  const piuGiovane = unita
    .filter((x) => x.sopra === u.sopra && x.livello === u.livello && x.id !== u.id && x.da !== undefined && u.da !== undefined && x.da < u.da)
    .sort((x, y) => y.da! - x.da!)[0];
  if (piuGiovane && u.a !== piuGiovane.da) {
    console.log(`Corretto il tetto di ${u.id}: ${u.a} → ${piuGiovane.da} (base di ${piuGiovane.id})`);
    u.a = piuGiovane.da;
    u.aErrore = piuGiovane.daErrore;
  }
}
unita.sort((x, y) => (x.a ?? 0) - (y.a ?? 0) || (y.da ?? 0) - (x.da ?? 0));

// Versione e data di modifica dichiarate nel file
const schema = store.getSubjects(n("owl", "versionInfo"), null, null)[0];
const versione = schema ? uno(schema as ReturnType<typeof namedNode>, n("owl", "versionInfo"))?.value : versioneTag;
const modificata = schema ? uno(schema as ReturnType<typeof namedNode>, n("dcterms", "modified"))?.value : undefined;

mkdirSync(join(RADICE, "content", "tempo"), { recursive: true });
writeFileSync(
  USCITA,
  JSON.stringify(
    {
      versione,
      tag: versioneTag,
      modificata,
      fonte: "International Commission on Stratigraphy · International Chronostratigraphic Chart (github.com/i-c-stratigraphy/chart)",
      pdf: `https://stratigraphy.org/chart`,
      scaricato: new Date().toISOString().slice(0, 10),
      unita,
    },
    null,
    1,
  ) + "\n",
);
const conteggio = Object.entries(Object.groupBy(unita, (u) => u.livello)).map(([k, v]) => `${k} ${v!.length}`).join(" · ");
console.log(`Carta ICS ${versione} (${versioneTag}, modificata ${modificata}) → ${unita.length} unità: ${conteggio}`);
if (precedente && precedente.tag !== versioneTag) console.log(`AGGIORNATA da ${precedente.tag} a ${versioneTag}`);
