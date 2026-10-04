// Il feed della RSNI, la Rete Sismica regionale dell'Italia Nord-Occidentale
// (UniGe-DISTAV): gli ultimi 20 eventi rivisti a mano. Modulo senza
// dipendenze, usato in tre posti: la build (lib/sismi.ts), la funzione Vercel
// che lo legge in diretta (api/sismi.ts) e lo script che allunga l'archivio
// (scripts/archivio-sismi.ts, lanciato da GitHub Actions).

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

export const FEED = "https://distav.unige.it/rsni/rss-man.php";
const MESI: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };

function campo(descrizione: string, nome: string): string | undefined {
  return new RegExp(`${nome}\\s*:\\s*([^<\\]]+)`).exec(descrizione)?.[1].trim();
}

export function analizza(xml: string): Sisma[] {
  const voci = xml.split("<item>").slice(1);
  const out: Sisma[] = [];
  for (const v of voci) {
    const link = /<link>([^<]+)<\/link>/.exec(v)?.[1] ?? "";
    const d = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(v)?.[1] ?? "";
    const tempo = campo(d, "Tempo origine"); // 2026-Oct-02 GMT 08:41:54
    const t = tempo ? /^(\d{4})-([A-Za-z]{3})-(\d{2}) GMT (\d{2}:\d{2}:\d{2})/.exec(tempo) : null;
    const loc = campo(d, "Localizzazione"); // Lat 44.525 - Lon 7.251
    const ll = loc ? /Lat\s*([-\d.]+)\s*-\s*Lon\s*([-\d.]+)/.exec(loc) : null;
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

/** Legge il feed; null se la RSNI non risponde entro 15 secondi. */
export async function leggiFeed(): Promise<Sisma[] | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(FEED, { signal: ctrl.signal, headers: { "User-Agent": "UniGeo (app di studio personale)" } });
    clearTimeout(t);
    if (!r.ok) return null;
    const eventi = analizza(await r.text());
    return eventi.length ? eventi : null;
  } catch {
    return null;
  }
}

/** Unisce eventi nuovi e vecchi per id (vince il più recente), dal più recente al più vecchio. */
export function unisci(vecchi: Sisma[], nuovi: Sisma[], giorni = 400): Sisma[] {
  const perId = new Map(vecchi.map((e) => [e.id, e]));
  for (const e of nuovi) perId.set(e.id, e);
  const limite = Date.now() - giorni * 86400000;
  return [...perId.values()].filter((e) => Date.parse(e.quando) >= limite).sort((a, b) => b.quando.localeCompare(a.quando));
}
