// I confini degli stati per «Proiezioni»: Natural Earth 1:110m (dominio pubblico),
// ridotti a numeri interi (decimi di grado) e salvati in
// content/proiezioni/mondo.json. Si lancia una volta sola:
//   npx tsx scripts/mondo.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL_PAESI = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";
const RADICE = join(import.meta.dirname, "..");

interface Feature {
  properties: Record<string, unknown>;
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
}

const r = await fetch(URL_PAESI);
if (!r.ok) throw new Error(`${URL_PAESI}: ${r.status}`);
const { features } = (await r.json()) as { features: Feature[] };

const CONTINENTI: Record<string, string> = { Africa: "A", Asia: "S", Europe: "E", "North America": "N", "South America": "M", Oceania: "O", Antarctica: "X", "Seven seas (open ocean)": "Z" };

// Ogni anello diventa [lon0, lat0, dlon1, dlat1, …]: il primo punto assoluto, poi le differenze (in decimi di grado).
const anello = (pts: number[][]) => {
  const out: number[] = [];
  let pl = 0, pa = 0;
  pts.forEach(([lon, lat], i) => {
    const l = Math.round(lon * 10), a = Math.round(lat * 10);
    out.push(i === 0 ? l : l - pl, i === 0 ? a : a - pa);
    [pl, pa] = [l, a];
  });
  return out;
};

const paesi = features
  .map((f) => {
    const poligoni = (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates) as number[][][][];
    return {
      n: String(f.properties.NAME_IT ?? f.properties.NAME),
      c: CONTINENTI[String(f.properties.CONTINENT)] ?? "Z",
      // Solo l'anello esterno di ogni poligono (i laghi interni non servono).
      a: poligoni.map((p) => anello(p[0])),
    };
  })
;

mkdirSync(join(RADICE, "content", "proiezioni"), { recursive: true });
const testo = JSON.stringify({
  fonte: "Natural Earth 1:110m, paesi (dominio pubblico)",
  nota: "Ogni anello: [lon, lat, …differenze] in decimi di grado. Continenti: A Africa, S Asia, E Europa, N Nord America, M Sud America, O Oceania, X Antartide, Z altro.",
  paesi,
});
writeFileSync(join(RADICE, "content", "proiezioni", "mondo.json"), testo + "\n");
console.log(`${paesi.length} stati, ${(testo.length / 1024).toFixed(0)} KB`);
console.log(paesi.filter((p) => p.n.startsWith("Groen") || p.n === "Italia").map((p) => `${p.n} (${p.c})`).join(", "));
