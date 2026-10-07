// Le proiezioni di «Proiezioni deformate» (Geografia fisica, lezioni 3 e 4):
// formule, cerchietti di Tissot, confronto delle aree. Funzioni pure.
// Coordinate: lon e lat in gradi; x cresce a est, y a nord (si capovolge solo nel disegno).

export type IdProiezione = "centrale" | "equidistante" | "mercatore" | "peters" | "sinusoidale" | "mollweide" | "equalearth" | "polare";

export interface Proprieta {
  /** Isogonica (conforme): conserva gli angoli e le forme piccole. */
  isogonica: boolean;
  /** Equivalente: conserva le aree. */
  equivalente: boolean;
  /** Equidistante: conserva le distanze (almeno lungo certe direzioni). */
  equidistante: boolean;
}

export interface Proiezione {
  id: IdProiezione;
  nome: string;
  famiglia: "Vera (di sviluppo)" | "Vera (prospettica)" | "Modificata" | "Convenzionale";
  proprieta: Proprieta;
  /** Dove si taglia la carta (gradi di latitudine), perché le formule esplodono ai poli. */
  latMin: number;
  latMax: number;
  nota: string;
  proietta: (lon: number, lat: number) => [number, number];
}

const R = Math.PI / 180;
const clampLat = (lat: number, p: { latMin: number; latMax: number }) => Math.max(p.latMin, Math.min(p.latMax, lat));

function mollweideTheta(lat: number): number {
  const f = lat * R;
  if (Math.abs(Math.abs(f) - Math.PI / 2) < 1e-6) return Math.sign(f) * (Math.PI / 2);
  let t = f;
  for (let i = 0; i < 25; i++) {
    const dt = (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(f)) / (2 + 2 * Math.cos(2 * t));
    t -= dt;
    if (Math.abs(dt) < 1e-9) break;
  }
  return t;
}

function equalEarth(lon: number, lat: number): [number, number] {
  const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
  const t = Math.asin((Math.sqrt(3) / 2) * Math.sin(lat * R));
  const t2 = t * t, t6 = t2 * t2 * t2;
  const x = (2 * Math.sqrt(3) * lon * R * Math.cos(t)) / (3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1));
  const y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, y];
}

export const PROIEZIONI: Proiezione[] = [
  {
    id: "centrale",
    nome: "Cilindrica centrale",
    famiglia: "Vera (di sviluppo)",
    proprieta: { isogonica: false, equivalente: false, equidistante: false },
    latMin: -70,
    latMax: 70,
    nota: "Una lampadina al centro del globo proietta meridiani e paralleli su un cilindro tangente all'equatore, poi srotolato: i meridiani sono linee verticali equidistanti, i paralleli orizzontali. Vicino all'equatore (entro circa ±15°) i cerchietti restano cerchi; verso i poli si allungano in senso nord-sud e si ingrandiscono. I territori sono deformati oltre che dilatati.",
    proietta: (lon, lat) => [lon * R, Math.tan(lat * R)],
  },
  {
    id: "equidistante",
    nome: "Cilindrica equidistante",
    famiglia: "Convenzionale",
    proprieta: { isogonica: false, equivalente: false, equidistante: true },
    latMin: -90,
    latMax: 90,
    nota: "Il planisfero più semplice: longitudine e latitudine diventano x e y. Conserva le distanze lungo i meridiani, ma i cerchietti si stirano in senso est-ovest andando verso i poli: forme e aree deformate.",
    proietta: (lon, lat) => [lon * R, lat * R],
  },
  {
    id: "mercatore",
    nome: "Mercatore",
    famiglia: "Modificata",
    proprieta: { isogonica: true, equivalente: false, equidistante: false },
    latMin: -80,
    latMax: 80,
    nota: "La cilindrica con i paralleli distanziati in modo che i cerchietti restino cerchi: è isogonica (conforme), mantiene angoli e forme. Non è né equivalente né equidistante: le aree si dilatano verso i poli. Per questo si usa in navigazione: la rotta tra due punti è una retta, la lossodromia, con angolo costante rispetto al Nord.",
    proietta: (lon, lat) => [lon * R, Math.log(Math.tan(Math.PI / 4 + (lat * R) / 2))],
  },
  {
    id: "peters",
    nome: "Gall-Peters",
    famiglia: "Convenzionale",
    proprieta: { isogonica: false, equivalente: true, equidistante: false },
    latMin: -90,
    latMax: 90,
    nota: "Cilindrica equivalente (paralleli standard a 45°): le aree sono giuste, ma le forme si schiacciano vicino ai poli e si allungano all'equatore. È la «mappa giusta» delle discussioni sull'Africa.",
    proietta: (lon, lat) => [lon * R * Math.SQRT1_2, Math.sin(lat * R) / Math.SQRT1_2],
  },
  {
    id: "sinusoidale",
    nome: "Sinusoidale",
    famiglia: "Convenzionale",
    proprieta: { isogonica: false, equivalente: true, equidistante: false },
    latMin: -90,
    latMax: 90,
    nota: "Equivalente: i paralleli sono rette equidistanti, i meridiani curve sinusoidali. Le aree sono giuste, ma ai bordi i continenti si deformano molto (i cerchietti diventano ellissi inclinate).",
    proietta: (lon, lat) => [lon * R * Math.cos(lat * R), lat * R],
  },
  {
    id: "mollweide",
    nome: "Mollweide",
    famiglia: "Convenzionale",
    proprieta: { isogonica: false, equivalente: true, equidistante: false },
    latMin: -90,
    latMax: 90,
    nota: "Equivalente, con il globo racchiuso in un'ellisse: una delle convenzionali degli atlanti. Rappresenta i continenti più vicini alle loro dimensioni reali, deformando ai bordi.",
    proietta: (lon, lat) => {
      const t = mollweideTheta(lat);
      return [((2 * Math.SQRT2) / Math.PI) * lon * R * Math.cos(t), Math.SQRT2 * Math.sin(t)];
    },
  },
  {
    id: "equalearth",
    nome: "Equal Earth",
    famiglia: "Convenzionale",
    proprieta: { isogonica: false, equivalente: true, equidistante: false },
    latMin: -90,
    latMax: 90,
    nota: "Del 2018 (Patterson, Šavrič, Jenny): equivalente e con forme meno deformate delle altre. È la proiezione che la risoluzione ONU «Correct the Map» (4 settembre 2026) raccomanda quando contano le superfici; non è vincolante e non vieta Mercatore.",
    proietta: equalEarth,
  },
  {
    id: "polare",
    nome: "Centrografica polare",
    famiglia: "Vera (prospettica)",
    proprieta: { isogonica: false, equivalente: false, equidistante: false },
    latMin: 25,
    latMax: 90,
    nota: "Per le zone polari (oltre gli 80° di latitudine): un piano tangente al polo, la lampadina al centro del globo. I paralleli sono cerchi concentrici, i meridiani raggi. Qui è tagliata a 25° di latitudine: più ci si allontana dal polo più la deformazione esplode.",
    proietta: (lon, lat) => {
      const r = Math.tan((90 - lat) * R);
      return [r * Math.sin(lon * R), r * Math.cos(lon * R)];
    },
  },
];

export const proiezione = (id: IdProiezione) => PROIEZIONI.find((p) => p.id === id)!;

/** Proietta un punto tagliando la latitudine ai limiti della proiezione. */
export const punto = (p: Proiezione, lon: number, lat: number): [number, number] => p.proietta(lon, clampLat(lat, p));

/** Il rettangolo che contiene tutta la carta, in coordinate proiettate. */
export function limiti(p: Proiezione): { x0: number; x1: number; y0: number; y1: number } {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let lat = p.latMin; lat <= p.latMax; lat += 2.5)
    for (let lon = -180; lon <= 180; lon += 15) {
      const [x, y] = punto(p, lon, lat);
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  return { x0, x1, y0, y1 };
}

/** Un cerchio piccolo sulla sfera (raggio in gradi), come 48 punti lon/lat. */
export function cerchio(lon0: number, lat0: number, raggio: number, n = 48): [number, number][] {
  const d = raggio * R, f0 = lat0 * R, l0 = lon0 * R;
  return Array.from({ length: n }, (_, k) => {
    const b = (2 * Math.PI * k) / n;
    const f = Math.asin(Math.sin(f0) * Math.cos(d) + Math.cos(f0) * Math.sin(d) * Math.cos(b));
    const l = l0 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(f0), Math.cos(d) - Math.sin(f0) * Math.sin(f));
    return [l / R, f / R];
  });
}

/** I centri dei cerchietti di Tissot: un reticolo regolare, adatto alla proiezione. */
export function centriCerchietti(p: Proiezione): [number, number][] {
  const lats = p.id === "polare" ? [35, 55, 75] : [-60, -30, 0, 30, 60];
  const lons = p.id === "polare" ? Array.from({ length: 12 }, (_, k) => k * 30 - 180) : [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  return lats.flatMap((la) => lons.map((lo) => [lo, la] as [number, number]));
}

/**
 * Sposta un punto lungo il meridiano di lonCentro di `gradi` d'arco (positivo = verso sud),
 * ruotando la sfera: una forma spostata così conserva la sua vera grandezza.
 */
export function spostaSullaSfera(lon: number, lat: number, lonCentro: number, gradi: number): [number, number] {
  const l = lon * R, f = lat * R, c = lonCentro * R, t = gradi * R;
  const v = [Math.cos(f) * Math.cos(l), Math.cos(f) * Math.sin(l), Math.sin(f)];
  // Asse perpendicolare al piano del meridiano di lonCentro.
  const n = [Math.sin(c), -Math.cos(c), 0];
  const dot = n[0] * v[0] + n[1] * v[1] + n[2] * v[2];
  const cr = [n[1] * v[2] - n[2] * v[1], n[2] * v[0] - n[0] * v[2], n[0] * v[1] - n[1] * v[0]];
  const cos = Math.cos(t), sin = Math.sin(t);
  const w = [0, 1, 2].map((k) => v[k] * cos + cr[k] * sin + n[k] * dot * (1 - cos));
  return [Math.atan2(w[1], w[0]) / R, Math.asin(Math.max(-1, Math.min(1, w[2]))) / R];
}

/** Area col metodo dei trapezi (formula di Gauss) di un anello proiettato. */
export function areaAnello(pts: [number, number][]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
}

/** Decodifica un anello salvato come [lon0, lat0, dlon, dlat, …] in decimi di grado. */
export function decodifica(a: number[]): [number, number][] {
  const out: [number, number][] = [];
  let l = 0, f = 0;
  for (let i = 0; i < a.length; i += 2) {
    l = i === 0 ? a[0] : l + a[i];
    f = i === 0 ? a[1] : f + a[i + 1];
    out.push([l / 10, f / 10]);
  }
  return out;
}

/** Superfici vere, in milioni di km². */
export const AREA_AFRICA = 30.37;
export const AREA_GROENLANDIA = 2.166;
