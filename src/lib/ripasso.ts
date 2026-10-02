// Ripasso spaziato a cinque scatole, come da docs/SPEC.md. Funzioni pure:
// niente React, niente localStorage, niente Date.now(): «oggi» arriva da fuori,
// così si prova a tavolino e lo stesso codice gira in pagina e nei test.

export type Box = 1 | 2 | 3 | 4 | 5;

export interface Progresso {
  box: Box;
  /** Prossimo ripasso, AAAA-MM-GG nel fuso del telefono. */
  nextReview: string;
  /** Quota di risposte corrette all'ultimo quiz, 0..1. */
  lastScore?: number;
  /** Id delle domande sbagliate l'ultima volta: si ripropongono per prime. */
  wrongIds: string[];
  /** Flashcard che l'ultima volta «non sapevo» (indice della definizione). */
  cartePendenti?: number[];
}

export interface VoceStorico {
  date: string;
  lesson: string;
  correct: number;
  total: number;
}

export interface Stato {
  progress: Record<string, Progresso>;
  history: VoceStorico[];
  settings: { materieAttive: string[] };
}

export const INTERVALLI: Record<Box, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

export function oggiIso(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function aggiungiGiorni(iso: string, n: number): string {
  const [a, m, g] = iso.split("-").map(Number);
  return oggiIso(new Date(a, m - 1, g + n));
}

export function giorniTra(da: string, a: string): number {
  const [a1, m1, g1] = da.split("-").map(Number);
  const [a2, m2, g2] = a.split("-").map(Number);
  return Math.round((new Date(a2, m2 - 1, g2).getTime() - new Date(a1, m1 - 1, g1).getTime()) / 86_400_000);
}

export function nuovoProgresso(oggi: string): Progresso {
  return { box: 1, nextReview: oggi, wrongIds: [] };
}

/** ≥ 80% → scatola su; < 50% → si torna alla prima; altrimenti si resta. */
export function dopoQuiz(p: Progresso | undefined, corrette: number, totale: number, sbagliate: string[], oggi: string): Progresso {
  const prima = p ?? nuovoProgresso(oggi);
  const quota = totale > 0 ? corrette / totale : 0;
  let box: Box = prima.box;
  if (quota >= 0.8) box = Math.min(5, prima.box + 1) as Box;
  else if (quota < 0.5) box = 1;
  return { ...prima, box, lastScore: quota, wrongIds: sbagliate, nextReview: aggiungiGiorni(oggi, INTERVALLI[box]) };
}

/** «Segna come ripassata» senza quiz: la scatola non cambia, la data sì. */
export function dopoRipassoManuale(p: Progresso | undefined, oggi: string): Progresso {
  const prima = p ?? nuovoProgresso(oggi);
  return { ...prima, nextReview: aggiungiGiorni(oggi, INTERVALLI[prima.box]) };
}

export function rimanda(p: Progresso, oggi: string, giorni = 1): Progresso {
  const base = p.nextReview > oggi ? p.nextReview : oggi;
  return { ...p, nextReview: aggiungiGiorni(base, giorni) };
}

export function anticipa(p: Progresso, oggi: string): Progresso {
  return { ...p, nextReview: oggi };
}

export function inScadenza(p: Progresso | undefined, oggi: string): boolean {
  return !p || p.nextReview <= oggi;
}

export function statoVuoto(materie: string[]): Stato {
  return { progress: {}, history: [], settings: { materieAttive: materie } };
}

/** Domande fatte e quota corrette negli ultimi 7 giorni. */
export function riepilogoSettimana(storico: VoceStorico[], oggi: string): { domande: number; quota: number } {
  const da = aggiungiGiorni(oggi, -6);
  const voci = storico.filter((v) => v.date >= da && v.date <= oggi);
  const domande = voci.reduce((s, v) => s + v.total, 0);
  const corrette = voci.reduce((s, v) => s + v.correct, 0);
  return { domande, quota: domande ? corrette / domande : 0 };
}
