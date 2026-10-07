import { defineCollection } from "astro:content";
import { z } from "zod";
import { glob } from "astro/loaders";

// Gli id sono «materia/slug» per lezioni e quiz (così si incrociano senza
// cercare) e «materia» per le schede materia. Lo slug è il nome del file.
// Il percorso che arriva dal loader glob usa sempre "/", anche su Windows.
function idMateriaSlug({ entry }: { entry: string }) {
  const parti = entry.split("/");
  const materia = parti[0];
  const file = parti[parti.length - 1].replace(/\.(md|json)$/, "");
  return `${materia}/${file}`;
}

// YAML trasforma `data: 2026-10-02` in un Date (mezzanotte UTC): si riporta a
// stringa AAAA-MM-GG prendendo le parti UTC, così il giorno non scivola.
const dataIso = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data nel formato AAAA-MM-GG"),
  z.date().transform((d) => d.toISOString().slice(0, 10)),
]);

const lezioni = defineCollection({
  loader: glob({ pattern: "*/lezioni/*.md", base: "./content", generateId: idMateriaSlug }),
  schema: z.object({
    materia: z.string(),
    numero: z.number().int().positive(),
    data: dataIso,
    titolo: z.string(),
    docente: z.string().optional(),
    modulo: z.string().optional(),
    fonte: z.string().optional(),
    nota: z.string().optional(),
    dispense: z.array(z.object({ titolo: z.string(), file: z.string() })).default([]),
    pdf: z.string().optional(),
    tag: z.array(z.string()).default([]),
  }),
});

const domandaBase = { id: z.string(), testo: z.string(), spiegazione: z.string().optional(), ref: z.string().optional() };

const domanda = z.discriminatedUnion("tipo", [
  z.object({ ...domandaBase, tipo: z.literal("scelta"), opzioni: z.array(z.string()).min(2), corretta: z.number().int().nonnegative() }),
  z.object({ ...domandaBase, tipo: z.literal("verofalso"), corretta: z.boolean() }),
  z.object({ ...domandaBase, tipo: z.literal("aperta"), soluzione: z.string() }),
  z.object({ ...domandaBase, tipo: z.literal("abbinamento"), coppie: z.array(z.tuple([z.string(), z.string()])).min(2) }),
]);

const quiz = defineCollection({
  loader: glob({ pattern: "*/quiz/*.json", base: "./content", generateId: idMateriaSlug }),
  schema: z.object({
    lezione: z.string(),
    domande: z.array(domanda).min(1),
  }),
});

const materie = defineCollection({
  loader: glob({
    pattern: "*/materia.json",
    base: "./content",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: z.object({
    slug: z.string(),
    nome: z.string(),
    colore: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    icona: z.string(),
    /** Id del campione (campionario) la cui foto rappresenta la materia nei riquadri. */
    campione: z.string().optional(),
    docenti: z.array(z.string()).default([]),
    moduli: z.array(z.string()).optional(),
    esame: z.string().optional(),
  }),
});

// Pagine sciolte (libri di testo, …): Markdown con lo stesso dialetto delle lezioni.
const pagine = defineCollection({
  loader: glob({ pattern: "pagine/*.md", base: "./content", generateId: ({ entry }) => entry.split("/").pop()!.replace(/\.md$/, "") }),
  schema: z.object({
    titolo: z.string(),
    sottotitolo: z.string().optional(),
    nota: z.string().optional(),
  }),
});

export const collections = { lezioni, quiz, materie, pagine };
export type Domanda = z.infer<typeof domanda>;
