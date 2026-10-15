// Il marchio di UniGeo: il sasso a tre strati (ruggine, ocra, ardesia) con le
// due venature chiare. Genera public/favicon.svg, public/icone/unigeo.svg e le
// versioni PNG: icona dell'app (192, 512), mascherabile (512), apple-touch (180),
// favicon (32, trasparente).
// Uso: npx tsx scripts/marchio.ts
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const FONDO = "#1b1512";

// Il disegno originale (riquadro 100 × 100, centro a 50,51).
const SASSO = `<path d="M14,62 C8,42 26,22 50,20 C72,18 92,32 90,54 C88,74 68,84 46,84 C28,84 18,76 14,62 Z" fill="#B5552A"/>
<path d="M22,58 C20,44 34,30 52,29 C68,28 82,38 80,54 C78,68 64,76 48,76 C34,76 24,70 22,58 Z" fill="#C9A227" opacity=".85"/>
<path d="M30,55 C30,46 40,38 52,38 C62,38 72,44 70,54 C68,63 60,68 50,68 C40,68 30,64 30,55 Z" fill="#3E4A52" opacity=".9"/>
<path d="M24,52 L82,46" stroke="#F4EEE3" stroke-width="2" opacity=".7"/>
<path d="M28,62 L80,58" stroke="#F4EEE3" stroke-width="1.6" opacity=".5"/>`;

/** Il sasso su fondo scuro, a scala `scala` e al centro del riquadro. */
function suFondo(scala: number, angoli: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="${angoli}" fill="${FONDO}"/>
<g transform="translate(50 50) scale(${scala}) translate(-50 -51)">
${SASSO}
</g>
</svg>
`;
}

const trasparente = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
${SASSO}
</svg>
`;

async function png(svg: string, lato: number, file: string) {
  await sharp(Buffer.from(svg), { density: 384 }).resize(lato, lato).png().toFile(file);
}

mkdirSync("public/icone", { recursive: true });
writeFileSync("public/favicon.svg", trasparente);
writeFileSync("public/icone/unigeo.svg", trasparente);
await png(trasparente, 32, "public/icone/unigeo-32.png");
await png(suFondo(0.84, 22), 192, "public/icone/unigeo-192.png");
await png(suFondo(0.84, 22), 512, "public/icone/unigeo-512.png");
await png(suFondo(0.62, 0), 512, "public/icone/unigeo-maskable-512.png"); // dentro l'80% centrale
await png(suFondo(0.8, 0), 180, "public/icone/unigeo-apple-180.png");
console.log("Marchio generato.");
