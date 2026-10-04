// I terremoti per le pagine, letti al momento della pubblicazione: gli ultimi
// eventi del feed RSNI più l'archivio che sta nel repo
// (content/terremoti/archivio.json, allungato ogni due ore da GitHub Actions
// con scripts/archivio-sismi.ts). Su Vercel la mappa aggiunge in diretta gli
// eventi arrivati dopo la pubblicazione (api/sismi.ts).
import archivioRepo from "../../content/terremoti/archivio.json";
import { leggiFeed, unisci, type Sisma } from "@/lib/rsni";

export type { Sisma };

export interface Sismi {
  /** Gli ultimi del feed (o dell'archivio, se la RSNI non risponde). */
  eventi: Sisma[];
  /** Quando si sono letti (ISO). */
  letto: string;
  /** Tutti gli eventi raccolti, dal più recente. */
  archivio: Sisma[];
  /** Da quando si raccoglie (ISO). */
  dal: string;
}

let cache: Promise<Sismi | null> | null = null;

export function leggiSismi(): Promise<Sismi | null> {
  cache ??= (async () => {
    const salvato = archivioRepo as { dal: string; aggiornato: string; eventi: Sisma[] };
    const feed = await leggiFeed();
    const archivio = unisci(salvato.eventi, feed ?? []);
    if (!archivio.length) return null;
    return { eventi: feed ?? archivio.slice(0, 20), letto: feed ? new Date().toISOString() : salvato.aggiornato, archivio, dal: salvato.dal };
  })();
  return cache;
}
