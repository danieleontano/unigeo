// La carta di base per i terremoti RSNI: Italia nord-occidentale con Francia
// e Svizzera vicine, confini regionali, laghi e città. Si lancia una volta sola
// (la geografia non cambia) e il risultato, piccolo, va nel repo:
//   npx tsx scripts/mappa-nordovest.ts
// Fonti: Natural Earth 1:10m (dominio pubblico) per stati e laghi,
// openpolis/geojson-italy (CC BY 4.0, dati ISTAT) per le regioni.

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const RADICE = join(import.meta.dirname, "..");
const NE = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson";
const REGIONI = "https://cdn.jsdelivr.net/gh/openpolis/geojson-italy@master/geojson/limits_IT_regions.geojson";

// Riquadro (gradi) e proiezione equirettangolare corretta per la latitudine media.
const BBOX = { ovest: 6.0, est: 10.6, sud: 43.3, nord: 46.1 };
const LARGHEZZA = 900;
const LAT_MEDIA = (BBOX.sud + BBOX.nord) / 2;
const KX = LARGHEZZA / (BBOX.est - BBOX.ovest);
const KY = KX / Math.cos((LAT_MEDIA * Math.PI) / 180);
const ALTEZZA = Math.round((BBOX.nord - BBOX.sud) * KY);
const proietta = ([lon, lat]: number[]): [number, number] => [(lon - BBOX.ovest) * KX, (BBOX.nord - lat) * KY];

type Anello = [number, number][];

// Sutherland–Hodgman su un rettangolo con margine: quello che sta fuori non pesa.
function ritaglia(anello: Anello): Anello {
  const m = 30;
  const lati: [(p: number[]) => boolean, (a: number[], b: number[]) => [number, number]][] = [
    [(p) => p[0] >= -m, (a, b) => [-m, a[1] + ((b[1] - a[1]) * (-m - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= LARGHEZZA + m, (a, b) => [LARGHEZZA + m, a[1] + ((b[1] - a[1]) * (LARGHEZZA + m - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= -m, (a, b) => [a[0] + ((b[0] - a[0]) * (-m - a[1])) / (b[1] - a[1]), -m]],
    [(p) => p[1] <= ALTEZZA + m, (a, b) => [a[0] + ((b[0] - a[0]) * (ALTEZZA + m - a[1])) / (b[1] - a[1]), ALTEZZA + m]],
  ];
  let out = anello;
  for (const [dentro, incrocio] of lati) {
    const entrata = out;
    out = [];
    for (let i = 0; i < entrata.length; i++) {
      const a = entrata[i];
      const b = entrata[(i + 1) % entrata.length];
      if (dentro(b)) {
        if (!dentro(a)) out.push(incrocio(a, b));
        out.push(b);
      } else if (dentro(a)) out.push(incrocio(a, b));
    }
    if (out.length === 0) break;
  }
  return out;
}

// Douglas–Peucker
function semplifica(punti: Anello, tolleranza: number): Anello {
  if (punti.length < 4) return punti;
  const [a, b] = [punti[0], punti[punti.length - 1]];
  let massimo = 0;
  let indice = 0;
  for (let i = 1; i < punti.length - 1; i++) {
    const p = punti[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lung = Math.hypot(dx, dy) || 1;
    const d = Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / lung;
    if (d > massimo) [massimo, indice] = [d, i];
  }
  if (massimo <= tolleranza) return [a, b];
  return [...semplifica(punti.slice(0, indice + 1), tolleranza).slice(0, -1), ...semplifica(punti.slice(indice), tolleranza)];
}

// Un anello chiuso ha primo e ultimo punto uguali: si spezza nel punto più
// lontano dal primo e si semplificano le due metà.
function semplificaAnello(punti: Anello, tolleranza: number): Anello {
  let lontano = 0;
  let distanza = 0;
  punti.forEach((p, i) => {
    const d = Math.hypot(p[0] - punti[0][0], p[1] - punti[0][1]);
    if (d > distanza) [distanza, lontano] = [d, i];
  });
  if (lontano === 0) return punti;
  return [...semplifica(punti.slice(0, lontano + 1), tolleranza).slice(0, -1), ...semplifica(punti.slice(lontano), tolleranza)];
}

function percorso(geometria: { type: string; coordinates: unknown }, tolleranza = 0.7): string {
  const poligoni = (geometria.type === "Polygon" ? [geometria.coordinates] : geometria.coordinates) as number[][][][];
  let d = "";
  for (const poligono of poligoni)
    for (const anello of poligono) {
      const r = ritaglia(semplificaAnello(anello.map(proietta), tolleranza));
      if (r.length < 3) continue;
      // Anelli tutti fuori dal riquadro diventano schiacciati sul bordo: si saltano.
      const xs = r.map((p) => p[0]);
      const ys = r.map((p) => p[1]);
      if (Math.max(...xs) - Math.min(...xs) < 1 || Math.max(...ys) - Math.min(...ys) < 1) continue;
      d += "M" + r.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L") + "Z";
    }
  return d;
}

async function geojson(url: string) {
  console.log("scarico", url.split("/").pop());
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return (await r.json()) as { features: { properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } }[] };
}

const stati = await geojson(`${NE}/ne_10m_admin_0_countries.geojson`);
const laghi = await geojson(`${NE}/ne_10m_lakes.geojson`);
const regioni = await geojson(REGIONI);

const VICINI = ["France", "Switzerland", "Monaco", "Austria", "Liechtenstein"];
const estero = stati.features.filter((f) => VICINI.includes(String(f.properties.ADMIN))).map((f) => percorso(f.geometry)).join("");
const italia = stati.features.filter((f) => f.properties.ADMIN === "Italy").map((f) => percorso(f.geometry)).join("");
const nomeRegione = (f: { properties: Record<string, unknown> }) => String(f.properties.reg_name ?? f.properties.name ?? "");
const regioniNw = regioni.features.filter((f) => /Liguria|Piemonte|Valle d'Aosta|Lombardia|Emilia|Toscana/i.test(nomeRegione(f)));
const confini = regioniNw.map((f) => percorso(f.geometry, 0.9)).join("");
const liguria = regioniNw.filter((f) => /Liguria/i.test(nomeRegione(f))).map((f) => percorso(f.geometry, 0.6)).join("");
const acque = laghi.features.map((f) => percorso(f.geometry, 0.5)).filter(Boolean).join("");

const CITTA: [string, number, number][] = [
  ["Genova", 8.934, 44.407],
  ["Savona", 8.481, 44.309],
  ["Imperia", 8.027, 43.889],
  ["La Spezia", 9.824, 44.102],
  ["Torino", 7.686, 45.07],
  ["Cuneo", 7.548, 44.384],
  ["Alessandria", 8.615, 44.913],
  ["Milano", 9.19, 45.464],
  ["Aosta", 7.315, 45.737],
  ["Piacenza", 9.693, 45.052],
  ["Parma", 10.328, 44.801],
  ["Nizza", 7.262, 43.71],
];

const uscita = {
  fonte: "Natural Earth 1:10m (pubblico dominio); regioni: openpolis/geojson-italy, CC BY 4.0 (ISTAT)",
  bbox: BBOX,
  larghezza: LARGHEZZA,
  altezza: ALTEZZA,
  kx: KX,
  ky: KY,
  estero,
  italia,
  confini,
  liguria,
  laghi: acque,
  citta: CITTA.map(([nome, lon, lat]) => {
    const [x, y] = proietta([lon, lat]);
    return { nome, x: Math.round(x), y: Math.round(y) };
  }),
};
mkdirSync(join(RADICE, "content", "terremoti"), { recursive: true });
const testo = JSON.stringify(uscita);
writeFileSync(join(RADICE, "content", "terremoti", "mappa.json"), testo + "\n");
console.log(`mappa ${LARGHEZZA}×${ALTEZZA}, ${(testo.length / 1024).toFixed(0)} KB, regioni NW: ${regioniNw.map(nomeRegione).join(", ")}`);
