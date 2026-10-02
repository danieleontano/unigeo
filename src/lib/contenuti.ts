import { getCollection, type CollectionEntry } from "astro:content";

export type Lezione = CollectionEntry<"lezioni">;
export type Materia = CollectionEntry<"materie">;
export type Quiz = CollectionEntry<"quiz">;

// Ordine di nav delle materie: come appaiono nel piano di studi, non alfabetico.
const ORDINE_MATERIE = ["geologia-1", "paleontologia", "geografia-fisica", "chimica", "matematica"];

export function materiaDiLezione(l: Lezione): string {
  return l.id.split("/")[0];
}

export function slugDiLezione(l: Lezione): string {
  return l.id.split("/")[1];
}

export function percorsoLezione(l: Lezione): string {
  return `/materie/${materiaDiLezione(l)}/lezioni/${slugDiLezione(l)}`;
}

export function percorsoQuiz(l: Lezione): string {
  return `/quiz/${materiaDiLezione(l)}/${slugDiLezione(l)}`;
}

export async function tutteLeMaterie(): Promise<Materia[]> {
  const materie = await getCollection("materie");
  return materie.sort((a, b) => ORDINE_MATERIE.indexOf(a.id) - ORDINE_MATERIE.indexOf(b.id));
}

/** Lezioni in ordine cronologico (numero, poi data). */
export async function lezioniDi(materia?: string): Promise<Lezione[]> {
  const lezioni = await getCollection("lezioni", (l) => !materia || materiaDiLezione(l) === materia);
  return lezioni.sort((a, b) => a.data.data.localeCompare(b.data.data) || a.data.numero - b.data.numero);
}

/** Le ultime N lezioni aggiunte, in tutte le materie, dalla più recente. */
export async function ultimeLezioni(n: number): Promise<Lezione[]> {
  const tutte = await lezioniDi();
  return tutte.reverse().slice(0, n);
}

export async function quizDisponibili(): Promise<Set<string>> {
  const quiz = await getCollection("quiz");
  return new Set(quiz.map((q) => q.id));
}

/** Quante definizioni ha una lezione: servono per le flashcard. */
export function contaDefinizioni(l: Lezione): number {
  return (l.body ?? "").match(/^:::definizione/gm)?.length ?? 0;
}
