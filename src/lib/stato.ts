import { useSyncExternalStore } from "react";
import { statoVuoto, type Stato } from "./ripasso";

// Lo stato personale (scatole di ripasso, storico, materie attive) vive nel
// browser, in localStorage, con una chiave sola e versionata. Negozio reattivo
// su useSyncExternalStore, nel modo già collaudato in Cirulla: lo snapshot è
// la stessa istanza finché nessuno scrive (altrimenti React entra in ciclo),
// lettura e scrittura sono in try/catch (storage pieno, modalità privata,
// JSON corrotto: si riparte da vuoto senza far crollare la pagina).

export const CHIAVE = "unigeo.stato.v1";
export const MATERIE_TUTTE = ["geologia-1", "paleontologia", "geografia-fisica", "chimica", "matematica"];

const disponibile = () => typeof window !== "undefined";
const VUOTO: Stato = statoVuoto(MATERIE_TUTTE);

let cache: Stato | null = null;
const ascoltatori = new Set<() => void>();

function valido(s: unknown): s is Stato {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  return typeof o.progress === "object" && Array.isArray(o.history) && typeof o.settings === "object";
}

function leggi(): Stato {
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

function iscrivi(a: () => void) {
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

export const useStato = (): Stato => useSyncExternalStore(iscrivi, leggi, () => VUOTO);

/** Vero appena si gira nel browser: prima si mostra lo scheletro, non dati vuoti. */
export const useIdratato = (): boolean => useSyncExternalStore(iscrivi, () => true, () => false);

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
