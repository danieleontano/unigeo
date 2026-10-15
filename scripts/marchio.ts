// Il marchio di UniGeo: un blocco di roccia in isometrica, con gli strati nei
// colori delle cinque materie (gli stessi della striscia sotto la barra).
// Genera public/favicon.svg, public/icone/unigeo.svg e le versioni PNG:
// icona dell'app (192, 512), mascherabile (512), apple-touch (180), favicon (32).
// Uso: npx tsx scripts/marchio.ts
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const STRATI = ["#B5552A", "#1F6F78", "#3F6E3A", "#6A4C93", "#3E4A52"];
const SABBIA = "#e6d3b3";
const FONDO = "#1b1512";
const INK = "#1a110c";

/**
 * Il disegno in un riquadro 100 × 100.
 * @param scala 1 = il blocco occupa circa i due terzi del riquadro
 * @param angoli raggio dei lati dello sfondo (0 = a tutto campo, per le icone mascherabili)
 */
function marchio(scala: number, angoli: number): string {
  const A = 26 * scala;
  const B = 15 * scala;
  const H = 36 * scala;
  const cx = 50;
  const cy = 50 - (H + 2 * B) / 2 + B; // lo spigolo di sopra: il blocco sta al centro
  const P = (x: number, y: number, z: number) => `${(cx + (x - y) * A).toFixed(2)},${(cy - B + (x + y) * B + z).toFixed(2)}`;
  // x e y corrono lungo i due spigoli della base; z scende (verso il basso dello schermo).
  const sinistra = (z0: number, z1: number) => [P(0, 1, z0), P(1, 1, z0), P(1, 1, z1), P(0, 1, z1)].join(" ");
  const destra = (z0: number, z1: number) => [P(1, 1, z0), P(1, 0, z0), P(1, 0, z1), P(1, 1, z1)].join(" ");
  const sopra = [P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)].join(" ");
  const passo = H / STRATI.length;
  const bande = STRATI.map((c, i) => {
    const z0 = i * passo;
    const z1 = (i + 1) * passo;
    return `<polygon points="${sinistra(z0, z1)}" fill="${c}"/><polygon points="${destra(z0, z1)}" fill="${c}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="${angoli}" fill="${FONDO}"/>
${bande}
<polygon points="${sinistra(0, H)}" fill="${INK}" fill-opacity="0.32"/>
<polygon points="${destra(0, H)}" fill="${INK}" fill-opacity="0.1"/>
<polygon points="${sopra}" fill="${SABBIA}"/>
</svg>
`;
}

async function png(svg: string, lato: number, file: string) {
  await sharp(Buffer.from(svg), { density: 384 }).resize(lato, lato).png().toFile(file);
}

mkdirSync("public/icone", { recursive: true });
const tondo = marchio(1.18, 22);
const pieno = marchio(1.18, 0);
const sicuro = marchio(0.92, 0); // dentro il 80% centrale, come chiede «maskable»
writeFileSync("public/favicon.svg", tondo);
writeFileSync("public/icone/unigeo.svg", tondo);
await png(tondo, 32, "public/icone/unigeo-32.png");
await png(tondo, 192, "public/icone/unigeo-192.png");
await png(tondo, 512, "public/icone/unigeo-512.png");
await png(sicuro, 512, "public/icone/unigeo-maskable-512.png");
await png(pieno, 180, "public/icone/unigeo-apple-180.png");
console.log("Marchio generato.");
