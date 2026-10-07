// L'accesso al sito con chiave, due livelli:
// - «strumenti»: solo gli strumenti (campionario, magmatiche, Mohs, tempo, …);
// - «appunti»: tutto, comprese lezioni, Libro, quiz, flashcard, ripasso, PDF.
// La pagina /accesso mette nel cookie l'impronta SHA-256 («unigeo|<chiave>»)
// della chiave; nel repo ci sono solo le impronte, non le chiavi.
// Due controlli con le stesse regole:
// - nel browser (Base.astro): su GitHub Pages è l'unico, ed è un VELO, non
//   una serratura: l'HTML e il repo restano pubblici (decisione di Daniele,
//   05/10/2026: niente servizi nuovi, si resta su Pages);
// - sul server (middleware.ts, Vercel): pronto per quando si vorrà una
//   serratura vera; lì senza cookie non esce nessun file.
// Per cambiare una chiave: nuova impronta qui (o nelle variabili d'ambiente
// UNIGEO_IMPRONTA_STRUMENTI / UNIGEO_IMPRONTA_APPUNTI su Vercel).

export type Livello = "strumenti" | "appunti";

export const COOKIE_CHIAVE = "unigeo_chiave";
export const IMPRONTE_PREDEFINITE: Record<Livello, string> = {
  strumenti: "09795a181938f6b9f553080d38080ed2098e74aab4426c022fac27c9b7f94d16",
  appunti: "ae360417448746f73082be8f19f0a9704f316b0138b078b9a1a57c1c2891d039",
};

export function impronte(env: Record<string, string | undefined> = {}): Record<Livello, string> {
  return {
    strumenti: env.UNIGEO_IMPRONTA_STRUMENTI || IMPRONTE_PREDEFINITE.strumenti,
    appunti: env.UNIGEO_IMPRONTA_APPUNTI || IMPRONTE_PREDEFINITE.appunti,
  };
}

export async function impronta(chiave: string): Promise<string> {
  // Sul telefono la tastiera mette la maiuscola e a volte uno spazio: non contano.
  const dati = new TextEncoder().encode(`unigeo|${chiave.trim().toLowerCase()}`);
  const hash = await crypto.subtle.digest("SHA-256", dati);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function livelloDa(valoreCookie: string | undefined, tabella: Record<Livello, string>): Livello | null {
  if (!valoreCookie) return null;
  if (valoreCookie === tabella.appunti) return "appunti";
  if (valoreCookie === tabella.strumenti) return "strumenti";
  return null;
}

/** Sempre raggiungibili, anche senza chiave: la pagina d'accesso e poco altro. */
const LIBERI = ["/accesso", "/robots.txt", "/favicon.svg", "/manifest.webmanifest", "/icone/app-512.png", "/icone/geologia-1.svg"];

/** Le parti con gli appunti: servono la chiave «appunti». */
export const SOLO_APPUNTI = ["/materie", "/quiz", "/flashcard", "/ripasso", "/pagine", "/pdf", "/cerca", "/cerca-indice.json"];

/** «/materie/x.html» e «/materie/x/» valgono «/materie/x». */
export function normalizza(pathname: string): string {
  return pathname.replace(/\.html$/, "").replace(/\/index$/, "").replace(/\/+$/, "") || "/";
}

export type Decisione = { tipo: "passa" } | { tipo: "accesso"; motivo?: "serve-appunti" } | { tipo: "vai"; dove: string };

export function decidi(pathname: string, livello: Livello | null): Decisione {
  const p = normalizza(pathname);
  if (LIBERI.includes(p)) return { tipo: "passa" };
  if (!livello) return { tipo: "accesso" };
  if (livello === "appunti") return { tipo: "passa" };
  // Chiave «strumenti»: la Home (che mostra lezioni e materie) diventa la pagina Strumenti.
  if (p === "/") return { tipo: "vai", dove: "/strumenti" };
  if (SOLO_APPUNTI.some((x) => p === x || p.startsWith(`${x}/`))) return { tipo: "accesso", motivo: "serve-appunti" };
  return { tipo: "passa" };
}

/** Il ritorno dopo l'accesso: solo percorsi interni. */
export function ritornoSicuro(da: string | null): string {
  return da && da.startsWith("/") && !da.startsWith("//") && !da.startsWith("/accesso") ? da : "/";
}
