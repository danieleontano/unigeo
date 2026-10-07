// La navigazione come in Minerva: nel menu laterale solo i MODULI (Home,
// Materie, Ripasso, Strumenti); le sezioni di un modulo stanno nella barra
// di schede sotto l'intestazione. Qui, dall'indirizzo, si ricava il modulo
// attivo e le sue schede: li usano Menu.astro e Intestazione.astro.
import { STRUMENTI } from "@/lib/strumenti";

export interface Modulo {
  href: string;
  titolo: string;
  simbolo: string;
  /** Visibile solo con la chiave degli appunti (vedi lib/accesso.ts). */
  soloAppunti?: boolean;
}

export interface Scheda {
  href: string;
  titolo: string;
  attiva: boolean;
  /** Pallino colorato prima del nome (le materie). */
  colore?: string;
}

export const MODULI: Modulo[] = [
  { href: "/", titolo: "Home", simbolo: "casa", soloAppunti: true },
  { href: "/materie", titolo: "Materie", simbolo: "strati", soloAppunti: true },
  { href: "/ripasso", titolo: "Ripasso", simbolo: "ripasso", soloAppunti: true },
  { href: "/strumenti", titolo: "Strumenti", simbolo: "martello" },
];

export const IMPOSTAZIONI: Modulo = { href: "/impostazioni", titolo: "Impostazioni", simbolo: "ingranaggio" };

/** L'indirizzo senza base, senza .html e senza barra finale: «/materie/geologia-1». */
export function percorsoPagina(pathname: string, base: string): string {
  // Nel sito pubblicato la Home arriva come «/index» (o «/unigeo/index.html»): è la Home.
  return pathname.replace(base.replace(/\/$/, ""), "").replace(/\.html$/, "").replace(/\/index$/, "").replace(/\/$/, "") || "/";
}

export function moduloDi(p: string): Modulo | typeof IMPOSTAZIONI {
  if (p === "/") return MODULI[0];
  if (p.startsWith("/materie") || p.startsWith("/quiz") || p.startsWith("/flashcard") || p.startsWith("/pagine")) return MODULI[1];
  if (p.startsWith("/ripasso")) return MODULI[2];
  if (p.startsWith("/impostazioni")) return IMPOSTAZIONI;
  return MODULI[3];
}

/** Le schede del modulo. Le pagine di lettura (lezione, Libro) non le hanno: più spazio al testo. */
export function schedeDi(p: string, materie: { id: string; nome: string; colore: string }[], lettura: boolean): Scheda[] {
  if (lettura) return [];
  const modulo = moduloDi(p);
  if (modulo.href === "/materie") {
    const materia = materie.find((m) => p.startsWith(`/materie/${m.id}`) || p.startsWith(`/quiz/${m.id}`) || p.startsWith(`/flashcard/${m.id}`));
    return [
      { href: "/materie", titolo: "Tutte", attiva: !materia },
      ...materie.map((m) => ({ href: `/materie/${m.id}`, titolo: m.nome.replace(" e cartografia", ""), attiva: materia?.id === m.id, colore: m.colore })),
    ];
  }
  if (modulo.href === "/strumenti") {
    return [{ href: "/strumenti", titolo: "Tutti", attiva: p === "/strumenti" }, ...STRUMENTI.map((s) => ({ href: s.href, titolo: s.breve, attiva: p === s.href }))];
  }
  return [];
}
