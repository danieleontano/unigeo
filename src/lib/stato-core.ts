import { statoVuoto, type Stato } from "./ripasso";

// Il negozio dello stato personale SENZA React: lettura/scrittura su
// localStorage con cache stabile e ascoltatori. Lo usano gli hook di
// stato.ts e gli script Astro che non devono trascinarsi React
// (SpunteVive): due copie di React nella stessa pagina rompono gli hook.

export const CHIAVE = "unigeo.stato.v1";
export const MATERIE_TUTTE = ["geologia-1", "paleontologia", "geografia-fisica", "chimica", "matematica"];

const disponibile = () => typeof window !== "undefined";
export const VUOTO: Stato = statoVuoto(MATERIE_TUTTE);

let cache: Stato | null = null;
const ascoltatori = new Set<() => void>();

export function valido(s: unknown): s is Stato {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  return typeof o.progress === "object" && Array.isArray(o.history) && typeof o.settings === "object";
}

export function leggi(): Stato {
  if (cache) return cache;
  let letto: Stato | null = null;
  if (disponibile()) {
    try {
      const grezzo = window.localStorage.getItem(CHIAVE);
      const parsato = grezzo ? JSON.parse(grezzo) : null;
      if (valido(parsato)) letto = parsato;
    } catch {
      letto = null;
    }
  }
  cache = letto ?? VUOTO;
  return cache;
}

function notifica() {
  for (const a of [...ascoltatori]) a();
}

export function iscrivi(a: () => void) {
  ascoltatori.add(a);
  const daAltraScheda = (e: StorageEvent) => {
    if (e.key === null || e.key === CHIAVE) {
      cache = null;
      notifica();
    }
  };
  window.addEventListener("storage", daAltraScheda);
  return () => {
    ascoltatori.delete(a);
    window.removeEventListener("storage", daAltraScheda);
  };
}

export function scriviStato(nuovo: Stato) {
  cache = nuovo;
  if (disponibile()) {
    try {
      window.localStorage.setItem(CHIAVE, JSON.stringify(nuovo));
    } catch {
      // storage pieno o negato: lo stato resta in memoria per questa sessione
    }
  }
  notifica();
}

export function aggiornaStato(fn: (s: Stato) => Stato) {
  scriviStato(fn(leggi()));
}

export function azzeraStato() {
  scriviStato(VUOTO);
}

// --- Export / import ---------------------------------------------------------

export function esportaStato(): string {
  return JSON.stringify({ versione: 1, esportato: new Date().toISOString(), stato: leggi() }, null, 2);
}

export function importaStato(json: string): { ok: true; lezioni: number } | { ok: false; errore: string } {
  try {
    const dati = JSON.parse(json);
    const stato = valido(dati?.stato) ? dati.stato : valido(dati) ? dati : null;
    if (!stato) return { ok: false, errore: "Il file non è un'esportazione di UniGeo." };
    scriviStato(stato);
    return { ok: true, lezioni: Object.keys(stato.progress).length };
  } catch {
    return { ok: false, errore: "File non leggibile." };
  }
}
