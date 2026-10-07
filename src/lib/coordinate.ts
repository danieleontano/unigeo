// I calcoli di «Coordinate e fusi» (Geografia fisica e cartografia, lezione 4):
// primi e secondi dal righello, longitudine da Monte Mario a Greenwich, fusi
// Gauss-Boaga. Funzioni pure, senza React.

/** Il meridiano fondamentale delle carte IGM: Roma Monte Mario, a 12°27′08″ E di Greenwich. */
export const MONTE_MARIO = 12 * 3600 + 27 * 60 + 8;

export interface Gradi {
  g: number;
  p: number;
  s: number;
}

export const inSecondi = (g: number, p: number, s: number) => g * 3600 + p * 60 + s;
export const daSecondi = (tot: number): Gradi => {
  const t = Math.round(Math.abs(tot));
  return { g: Math.floor(t / 3600), p: Math.floor((t % 3600) / 60), s: t % 60 };
};
export const inDecimali = (tot: number) => tot / 3600;
export const dms = (tot: number) => {
  const { g, p, s } = daSecondi(tot);
  return `${g}°${String(p).padStart(2, "0")}′${String(s).padStart(2, "0")}″`;
};

/** I secondi dal righello: un primo (60″) misura L cm, il punto sta a d cm dalla tacca inferiore. */
export const secondiDaProporzione = (L: number, d: number) => (60 * d) / L;

export type Verso = "E" | "W";

/** Longitudine «ovest da Monte Mario» → rispetto a Greenwich. */
export function daMonteMarioAGreenwich(secOvestMM: number): { sec: number; verso: Verso } {
  const e = MONTE_MARIO - secOvestMM;
  return e >= 0 ? { sec: e, verso: "E" } : { sec: -e, verso: "W" };
}
/** Longitudine rispetto a Greenwich (E positivo) → «ovest da Monte Mario» (negativo = est di MM). */
export function daGreenwichAMonteMario(secEst: number): { sec: number; verso: Verso } {
  const w = MONTE_MARIO - secEst;
  return w >= 0 ? { sec: w, verso: "W" } : { sec: -w, verso: "E" };
}

export interface Fuso {
  nome: "Ovest" | "Est";
  /** Meridiano centrale di tangenza, in gradi E. */
  centrale: number;
  /** Distanza dal meridiano centrale, in gradi (negativa a ovest). */
  distanza: number;
  /** Nei 30′ di sovrapposizione attorno a 12° valgono entrambi. */
  sovrapposizione: boolean;
  /** Oltre i 3° dal meridiano centrale le deformazioni non sono più trascurabili. */
  oltre: boolean;
  /** Distanza dal meridiano centrale sul parallelo, in km. */
  km: number;
}

export function fusoDi(lonE: number, lat = 44): Fuso {
  const nome = lonE < 12 ? "Ovest" : "Est";
  const centrale = nome === "Ovest" ? 9 : 15;
  const distanza = lonE - centrale;
  return {
    nome,
    centrale,
    distanza,
    sovrapposizione: Math.abs(lonE - 12) <= 0.25,
    oltre: Math.abs(distanza) > 3,
    km: distanza * 111.32 * Math.cos((lat * Math.PI) / 180),
  };
}

export const CITTA: { nome: string; lon: number; lat: number }[] = [
  { nome: "Torino", lon: 7.686, lat: 45.07 },
  { nome: "Genova", lon: 8.934, lat: 44.407 },
  { nome: "Cagliari", lon: 9.112, lat: 39.223 },
  { nome: "Milano", lon: 9.19, lat: 45.464 },
  { nome: "Trento", lon: 11.121, lat: 46.07 },
  { nome: "Firenze", lon: 11.256, lat: 43.77 },
  { nome: "Roma", lon: 12.496, lat: 41.903 },
  { nome: "Palermo", lon: 13.361, lat: 38.116 },
  { nome: "Napoli", lon: 14.268, lat: 40.852 },
  { nome: "Bari", lon: 16.872, lat: 41.117 },
  { nome: "Lecce", lon: 18.172, lat: 40.352 },
];
