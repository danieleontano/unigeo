// Gli ultimi terremoti della RSNI, la Rete Sismica regionale dell'Italia
// Nord-Occidentale gestita da UniGe-DISTAV: il feed RSS dei 20 eventi rivisti
// a mano. Il feed non si può leggere dal browser (niente CORS), quindi si legge
// qui, al momento della pubblicazione; il sito si ripubblica da solo ogni
// mezz'ora (.github/workflows/deploy.yml), così i dati restano freschi.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface Sisma {
  id: string;
  quando: string; // ISO UTC
  magnitudo: number;
  regione: string;
  lat: number;
  lon: number;
  profondita: number;
  link: string;
}

export interface Sismi {
  eventi: Sisma[];
  letto: string; // ISO dell'ultima lettura riuscita
  /** Tutti gli eventi raccolti finora, dal più recente. */
  archivio: Sisma[];
  /** Da quando si raccoglie (ISO). */
  dal: string;
}

// L'archivio: ogni build aggiunge i 20 eventi del feed a quelli già visti.
// Il file vive in .archivio-sismi/ (fuori dal repo); su GitHub Actions passa da
// una build all'altra con la cache (vedi deploy.yml), in locale resta su disco.
const CARTELLA = join(process.cwd(), ".archivio-sismi");
const ARCHIVIO = join(CARTELLA, "archivio.json");
const GIORNI = 400;

function aggiornaArchivio(nuovi: Sisma[]): { archivio: Sisma[]; dal: string } {
  let vecchi: Sisma[] = [];
  let dal = new Date().toISOString();
  try {
    const letto = JSON.parse(readFileSync(ARCHIVIO, "utf8")) as { eventi: Sisma[]; dal: string };
    vecchi = letto.eventi;
    dal = letto.dal;
  } catch {
    // primo giro, o cache persa: si riparte
  }
  const perId = new Map(vecchi.map((e) => [e.id, e]));
  for (const e of nuovi) perId.set(e.id, e); // la revisione più recente vince
  const limite = Date.now() - GIORNI * 86400000;
  const archivio = [...perId.values()].filter((e) => Date.parse(e.quando) >= limite).sort((a, b) => b.quando.localeCompare(a.quando));
  try {
    mkdirSync(CARTELLA, { recursive: true });
    writeFileSync(ARCHIVIO, JSON.stringify({ dal, eventi: archivio }));
  } catch {
    // in sola lettura: pazienza, si mostra quello che c'è
  }
  return { archivio, dal };
}

const FEED = "https://distav.unige.it/rsni/rss-man.php";
const MESI: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };

let cache: Promise<Sismi | null> | null = null;

function campo(descrizione: string, nome: string): string | undefined {
  return new RegExp(`${nome}\\s*:\\s*([^<\\]]+)`).exec(descrizione)?.[1].trim();
}

function analizza(xml: string): Sisma[] {
  const voci = xml.split("<item>").slice(1);
  const out: Sisma[] = [];
  for (const v of voci) {
    const link = /<link>([^<]+)<\/link>/.exec(v)?.[1] ?? "";
    const d = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(v)?.[1] ?? "";
    const tempo = campo(d, "Tempo origine"); // 2026-Oct-02 GMT 08:41:54
    const t = tempo && /^(\d{4})-([A-Za-z]{3})-(\d{2}) GMT (\d{2}:\d{2}:\d{2})/.exec(tempo);
    const loc = campo(d, "Localizzazione"); // Lat 44.525 - Lon 7.251
    const ll = loc && /Lat\s*([-\d.]+)\s*-\s*Lon\s*([-\d.]+)/.exec(loc);
    if (!t || !ll) continue;
    out.push({
      id: /var1=(\d+)/.exec(link)?.[1] ?? link,
      quando: `${t[1]}-${MESI[t[2]] ?? "01"}-${t[3]}T${t[4]}Z`,
      magnitudo: Number(campo(d, "Magnitudo")),
      regione: (campo(d, "Regione") ?? "").replace(/_/g, " "),
      lat: Number(ll[1]),
      lon: Number(ll[2]),
      profondita: Number.parseFloat(campo(d, "Profondità") ?? "0"),
      link: link.replace("http://www.", "https://"),
    });
  }
  return out;
}

export function leggiSismi(): Promise<Sismi | null> {
  cache ??= (async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(FEED, { signal: ctrl.signal, headers: { "User-Agent": "UniGeo (studio, https://danieleontano.github.io/unigeo/)" } });
      clearTimeout(t);
      if (!r.ok) return null;
      const eventi = analizza(await r.text());
      return eventi.length ? { eventi, letto: new Date().toISOString(), ...aggiornaArchivio(eventi) } : null;
    } catch {
      return null;
    }
  })();
  return cache;
}
