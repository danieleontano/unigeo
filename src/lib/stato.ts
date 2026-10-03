import { useSyncExternalStore } from "react";
import type { Stato } from "./ripasso";
import { iscrivi, leggi, VUOTO } from "./stato-core";

// Gli hook React sopra il negozio di stato-core.ts. Lo snapshot è la stessa
// istanza finché nessuno scrive (requisito di useSyncExternalStore); il
// server rende sempre lo stato vuoto e il browser si allinea dopo
// l'idratazione, senza errori di mismatch.

export { CHIAVE, MATERIE_TUTTE, aggiornaStato, azzeraStato, esportaStato, importaStato, scriviStato } from "./stato-core";

export const useStato = (): Stato => useSyncExternalStore(iscrivi, leggi, () => VUOTO);

/** Vero appena si gira nel browser: prima si mostra lo scheletro, non dati vuoti. */
export const useIdratato = (): boolean => useSyncExternalStore(iscrivi, () => true, () => false);
