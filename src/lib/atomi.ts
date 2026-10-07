// I calcoli di «Atomi e luce» (Chimica, lezione 2): particelle di atomi e ioni,
// isotopi e massa atomica media, luce come onda e come fotone, effetto
// fotoelettrico. Funzioni pure, senza React: si provano da sole.
// Costanti come le usa il prof: c = 3,00 × 10⁸ m/s, h = 6,63 × 10⁻³⁴ J·s.

export const C = 3.0e8;
export const H = 6.63e-34;
export const EV = 1.602e-19;

// ---------------------------------------------------------------------------
// Particelle
// ---------------------------------------------------------------------------

export interface ElementoBase {
  z: number;
  simbolo: string;
  nome: string;
  massa: number | null;
  ossidazione: string | null;
}

export interface Specie {
  el: ElementoBase;
  /** Numero di massa. */
  a: number;
  /** Carica: +2 = catione 2+, −1 = anione 1−. */
  q: number;
}

export const protoni = (s: Specie) => s.el.z;
export const neutroni = (s: Specie) => s.a - s.el.z;
export const elettroni = (s: Specie) => s.el.z - s.q;

/** Il primo stato di ossidazione «da libro» fino a ±3 (come nell'aula: niente 10− o 20−). */
export function caricaTipica(e: ElementoBase): number {
  const tutti = (e.ossidazione ?? "")
    .split(/[,;]/)
    .map((t) => Number(t.replace("−", "-").replace("+", "").trim()))
    .filter((q) => Number.isInteger(q) && q !== 0 && Math.abs(q) <= 3);
  return tutti[0] ?? 0;
}

const SUPER: Record<string, string> = { "−": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻" };
export const apice = (s: string | number) => String(s).replace(/[0-9+\-−]/g, (c) => SUPER[c]);
/** Carica come si scrive: «3+», «2−», «+», «−», «» se neutro. */
export const testoCarica = (q: number) => (q === 0 ? "" : `${Math.abs(q) > 1 ? Math.abs(q) : ""}${q > 0 ? "+" : "−"}`);

// ---------------------------------------------------------------------------
// Isotopi
// ---------------------------------------------------------------------------

export interface Isotopo {
  a: number;
  /** Massa in u. */
  massa: number;
  /** Abbondanza naturale in %; 0 se solo in tracce o radioattivo. */
  ab: number;
  radioattivo?: boolean;
}

/** Isotopi naturali di alcuni elementi (IUPAC/NIST, arrotondati). */
export const ISOTOPI: Record<string, Isotopo[]> = {
  H: [
    { a: 1, massa: 1.00783, ab: 99.9885 },
    { a: 2, massa: 2.0141, ab: 0.0115 },
    { a: 3, massa: 3.01605, ab: 0, radioattivo: true },
  ],
  Li: [
    { a: 6, massa: 6.01512, ab: 7.59 },
    { a: 7, massa: 7.016, ab: 92.41 },
  ],
  B: [
    { a: 10, massa: 10.01294, ab: 19.9 },
    { a: 11, massa: 11.00931, ab: 80.1 },
  ],
  C: [
    { a: 12, massa: 12.0, ab: 98.93 },
    { a: 13, massa: 13.00335, ab: 1.07 },
    { a: 14, massa: 14.00324, ab: 0, radioattivo: true },
  ],
  N: [
    { a: 14, massa: 14.00307, ab: 99.636 },
    { a: 15, massa: 15.00011, ab: 0.364 },
  ],
  O: [
    { a: 16, massa: 15.99491, ab: 99.757 },
    { a: 17, massa: 16.99913, ab: 0.038 },
    { a: 18, massa: 17.99916, ab: 0.205 },
  ],
  Ne: [
    { a: 20, massa: 19.99244, ab: 90.48 },
    { a: 21, massa: 20.99385, ab: 0.27 },
    { a: 22, massa: 21.99139, ab: 9.25 },
  ],
  Mg: [
    { a: 24, massa: 23.98504, ab: 78.99 },
    { a: 25, massa: 24.98584, ab: 10.0 },
    { a: 26, massa: 25.98259, ab: 11.01 },
  ],
  Si: [
    { a: 28, massa: 27.97693, ab: 92.223 },
    { a: 29, massa: 28.97649, ab: 4.685 },
    { a: 30, massa: 29.97377, ab: 3.092 },
  ],
  Cl: [
    { a: 35, massa: 34.96885, ab: 75.76 },
    { a: 37, massa: 36.9659, ab: 24.24 },
  ],
  Ar: [
    { a: 36, massa: 35.96755, ab: 0.3336 },
    { a: 38, massa: 37.96273, ab: 0.0629 },
    { a: 40, massa: 39.96238, ab: 99.6035 },
  ],
  Cu: [
    { a: 63, massa: 62.9296, ab: 69.15 },
    { a: 65, massa: 64.92779, ab: 30.85 },
  ],
  Br: [
    { a: 79, massa: 78.91834, ab: 50.69 },
    { a: 81, massa: 80.91629, ab: 49.31 },
  ],
  U: [
    { a: 234, massa: 234.04095, ab: 0.0054, radioattivo: true },
    { a: 235, massa: 235.04393, ab: 0.7204, radioattivo: true },
    { a: 238, massa: 238.05079, ab: 99.2742, radioattivo: true },
  ],
};

/** Massa atomica media pesata sulle abbondanze (gli isotopi in tracce non contano). */
export function massaMedia(isotopi: Isotopo[]): number {
  const totale = isotopi.reduce((s, i) => s + i.ab, 0);
  return isotopi.reduce((s, i) => s + i.massa * i.ab, 0) / totale;
}

// ---------------------------------------------------------------------------
// Luce
// ---------------------------------------------------------------------------

export const frequenza = (lambda: number) => C / lambda;
export const lunghezzaOnda = (nu: number) => C / nu;
export const energiaFotone = (nu: number) => H * nu;
export const energiaDaLambda = (lambda: number) => (H * C) / lambda;

export interface Banda {
  nome: string;
  /** Lunghezza d'onda minima e massima in m. */
  da: number;
  a: number;
  colore: string;
}
export const BANDE: Banda[] = [
  { nome: "Raggi gamma", da: 1e-14, a: 1e-11, colore: "#7b5ea7" },
  { nome: "Raggi X", da: 1e-11, a: 1e-8, colore: "#5b7fb5" },
  { nome: "Ultravioletto", da: 1e-8, a: 4e-7, colore: "#8a6bd1" },
  { nome: "Visibile", da: 4e-7, a: 7e-7, colore: "#e3b08c" },
  { nome: "Infrarosso", da: 7e-7, a: 1e-3, colore: "#c9552a" },
  { nome: "Microonde", da: 1e-3, a: 1e-1, colore: "#b0793d" },
  { nome: "Onde radio", da: 1e-1, a: 1e4, colore: "#6f8f5a" },
];
export const bandaDi = (lambda: number) => BANDE.find((b) => lambda >= b.da && lambda < b.a) ?? BANDE[BANDE.length - 1];

/** Colore approssimato di una lunghezza d'onda visibile (in nm). */
export function coloreVisibile(nm: number): string {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) [r, g, b] = [-(nm - 440) / 60, 0, 1];
  else if (nm < 490) [r, g, b] = [0, (nm - 440) / 50, 1];
  else if (nm < 510) [r, g, b] = [0, 1, -(nm - 510) / 20];
  else if (nm < 580) [r, g, b] = [(nm - 510) / 70, 1, 0];
  else if (nm < 645) [r, g, b] = [1, -(nm - 645) / 65, 0];
  else if (nm <= 780) [r, g, b] = [1, 0, 0];
  const f = nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : nm > 700 ? 0.3 + (0.7 * (780 - nm)) / 80 : 1;
  const c = (x: number) => Math.round(255 * Math.pow(Math.max(0, x) * f, 0.8));
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

/** Numero come si scrive in chimica: 4,3 × 10¹⁴. */
export function scientifico(x: number, cifre = 3): string {
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / Math.pow(10, e);
  const mm = Number(m.toPrecision(cifre));
  const testo = mm.toLocaleString("it-IT", { maximumFractionDigits: cifre - 1 });
  return e === 0 ? testo : `${testo} × 10${apice(e)}`;
}

/** Lunghezza d'onda con l'unità giusta (pm, nm, µm, mm, cm, m, km). */
export function formattaLambda(m: number): string {
  const f = (x: number) => Number(x.toPrecision(3)).toLocaleString("it-IT", { maximumFractionDigits: 3 });
  if (m < 1e-9) return `${f(m * 1e12)} pm`;
  if (m < 1e-6) return `${f(m * 1e9)} nm`;
  if (m < 1e-3) return `${f(m * 1e6)} µm`;
  if (m < 1e-2) return `${f(m * 1e3)} mm`;
  if (m < 1) return `${f(m * 1e2)} cm`;
  if (m < 1e3) return `${f(m)} m`;
  return `${f(m / 1e3)} km`;
}

/** Legge «4,3e14», «4.3 x 10^14», «4,3×10^14», «430000000000000». */
export function leggiNumero(testo: string): number | null {
  const t = testo
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".")
    .replace(/[x×*]10\^?([+-−]?\d+)/i, "e$1")
    .replace("−", "-");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Vero se il valore sta entro la tolleranza relativa dal giusto. */
export const vicino = (dato: number | null, giusto: number, tol = 0.03) => dato !== null && Math.abs(dato - giusto) <= Math.abs(giusto) * tol;

// ---------------------------------------------------------------------------
// Effetto fotoelettrico
// ---------------------------------------------------------------------------

/** Funzione lavoro (energia minima per strappare un elettrone), in eV: valori indicativi. */
export const METALLI = [
  { nome: "Cesio", simbolo: "Cs", phi: 2.1 },
  { nome: "Sodio", simbolo: "Na", phi: 2.3 },
  { nome: "Calcio", simbolo: "Ca", phi: 2.9 },
  { nome: "Zinco", simbolo: "Zn", phi: 4.3 },
  { nome: "Rame", simbolo: "Cu", phi: 4.7 },
  { nome: "Platino", simbolo: "Pt", phi: 5.6 },
];

/** Energia cinetica degli elettroni espulsi, in eV (0 sotto la soglia). */
export const energiaCinetica = (lambdaM: number, phiEv: number) => Math.max(0, energiaDaLambda(lambdaM) / EV - phiEv);
/** Lunghezza d'onda massima che strappa elettroni, in m. */
export const lambdaSoglia = (phiEv: number) => (H * C) / (phiEv * EV);
