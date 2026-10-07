// La ricerca negli appunti: tipi del record, pulizia del testo e algoritmo.
// Puro, senza dipendenze: lo usano sia l'indice (pages/cerca-indice.json.ts, al
// momento della pubblicazione) sia la pagina /cerca (nel browser).

export type TipoRecord = "lezione" | "definizione" | "campione" | "elemento" | "strumento";

export interface Voce {
  /** Tipo di risultato. */
  t: TipoRecord;
  /** Id della materia (per i filtri e il colore); vuoto se non appartiene a una materia. */
  m: string;
  /** Titolo breve: l'intestazione della sezione, il nome del campione… */
  h: string;
  /** Di dove viene: «Lezione 5 · Classificare le rocce magmatiche». */
  l: string;
  /** Indirizzo (senza base), con l'ancora della sezione. */
  u: string;
  /** Il testo da cercare, già pulito. */
  x: string;
}

const ACCENTI: { [k: string]: string } = { à: "a", á: "a", â: "a", ä: "a", è: "e", é: "e", ê: "e", ë: "e", ì: "i", í: "i", î: "i", ï: "i", ò: "o", ó: "o", ô: "o", ö: "o", ù: "u", ú: "u", û: "u", ü: "u", ç: "c", ñ: "n", "′": "'", "’": "'" };

/** Minuscolo e senza accenti, mantenendo la lunghezza (serve per trovare le parole nel testo originale). */
export function piano(s: string): string {
  return s.toLowerCase().replace(/[àáâäèéêëìíîïòóôöùúûüçñ′’]/g, (c) => ACCENTI[c] ?? c);
}

/** Le parole della ricerca: almeno 2 caratteri, senza segni. */
export function parole(q: string): string[] {
  return piano(q)
    .split(/[^a-z0-9°]+/)
    .filter((p) => p.length >= 2);
}

/**
 * La radice di una parola italiana: toglie la desinenza (una o due vocali finali), così
 * «fenocristallo» trova «fenocristalli», «roccia» trova «rocce».
 */
export function radice(p: string): string {
  if (p.length < 5) return p;
  let r = p;
  if (/[aeiou]$/.test(r)) r = r.slice(0, -1);
  if (r.length >= 5 && /[aeiou]$/.test(r)) r = r.slice(0, -1);
  return r;
}

/** Toglie la sintassi Markdown e i riquadri: resta il testo che si legge. */
export function pulisci(md: string): string {
  return md
    .replace(/^:::.*$/gm, " ")
    .replace(/^::campioni\{.*\}\s*$/gm, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<\/?(sup|sub|b|i|em|strong|br)\s*\/?>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/gm, " ")
    .replace(/^\s*\|\s*/gm, "")
    .replace(/\s*\|\s*$/gm, "")
    .replace(/\|/g, " · ")
    .replace(/^\s*[-*]\s+(\[[ xX]\]\s+)?/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*|\*|`/g, "")
    .replace(/\\\[/g, "[")
    .replace(/\s+/g, " ")
    .trim();
}

const LETTERA = /[a-z0-9°]/;

/**
 * Dove inizia il riscontro di una radice in un testo «piano», o -1. Le radici corte
 * (meno di 6 lettere) devono cominciare una parola («ioni» non trova «nazioni»);
 * le lunghe possono stare anche dentro («cristallo» trova «fenocristallo»).
 */
export function trova(testo: string, radice: string, da = 0): number {
  let i = testo.indexOf(radice, da);
  if (radice.length >= 6) return i;
  while (i > 0 && LETTERA.test(testo[i - 1])) i = testo.indexOf(radice, i + 1);
  return i;
}

export interface Risultato {
  r: Voce;
  punti: number;
  /** Dove nel testo sta il primo riscontro. */
  da: number;
}

/**
 * Cerca: tutte le parole devono comparire (nel titolo, nell'origine o nel testo).
 * Il titolo conta più dell'origine, che conta più del testo; una parola intera vale più di un pezzo.
 */
export function cerca(records: { r: Voce; nh: string; nl: string; nx: string }[], q: string): Risultato[] {
  const ps = parole(q);
  if (ps.length === 0) return [];
  const out: Risultato[] = [];
  for (const { r, nh, nl, nx } of records) {
    let punti = 0;
    let da = -1;
    let tutte = true;
    for (const parola of ps) {
      const p = radice(parola);
      const inH = trova(nh, p) >= 0;
      const inL = trova(nl, p) >= 0;
      const k = trova(nx, p);
      if (!inH && !inL && k < 0) {
        tutte = false;
        break;
      }
      if (inH) punti += nh.split(/[^a-z0-9°]+/).includes(parola) ? 12 : 7;
      if (inL) punti += 2;
      if (k >= 0) {
        let n = 0;
        let i = k;
        while (i >= 0 && n < 6) {
          n++;
          i = trova(nx, p, i + p.length);
        }
        punti += n + (new RegExp(`(^|[^a-z0-9°])${parola.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9°]|$)`).test(nx) ? 3 : 0);
        if (da < 0 || k < da) da = k;
      }
    }
    if (tutte) out.push({ r, punti: punti + (r.t === "definizione" ? 4 : 0), da });
  }
  return out.sort((a, b) => b.punti - a.punti);
}

/** Prepara i record per la ricerca: aggiunge le versioni «piane» dei testi. */
export function preparaRecord(records: Voce[]) {
  return records.map((r) => ({ r, nh: piano(r.h), nl: piano(r.l), nx: piano(r.x) }));
}

/** Un pezzo di testo attorno al primo riscontro, diviso in parti normali ed evidenziate. */
export function frammento(x: string, da: number, ps: string[], larghezza = 170): { testo: string; evidenzia: boolean }[] {
  const inizio = da <= 0 ? 0 : Math.max(0, x.lastIndexOf(" ", Math.max(0, da - 50)));
  const fine = Math.min(x.length, inizio + larghezza);
  const pezzo = (inizio > 0 ? "… " : "") + x.slice(inizio, fine).trim() + (fine < x.length ? " …" : "");
  const np = piano(pezzo);
  const marcati = new Array<boolean>(pezzo.length).fill(false);
  for (const p of ps) {
    let i = trova(np, p);
    while (i >= 0) {
      // Si evidenzia fino a fine parola: «fenocristall» + «i».
      let fine = i + p.length;
      while (fine < np.length && LETTERA.test(np[fine])) fine++;
      for (let k = i; k < fine; k++) marcati[k] = true;
      i = trova(np, p, fine);
    }
  }
  const out: { testo: string; evidenzia: boolean }[] = [];
  for (let k = 0; k < pezzo.length; k++) {
    const ultimo = out[out.length - 1];
    if (ultimo && ultimo.evidenzia === marcati[k]) ultimo.testo += pezzo[k];
    else out.push({ testo: pezzo[k], evidenzia: marcati[k] });
  }
  return out;
}
