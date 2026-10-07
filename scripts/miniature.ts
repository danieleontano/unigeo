// Le miniature del campionario: public/campionario/mini/<nome>.jpg, larghe 640 px.
// Servono ai riquadri, ai mosaici e al campione del giorno: gli originali (anche
// 1 MB l'uno) restano per il riconoscimento a tutto schermo.
// Si lancia da solo (npx tsx scripts/miniature.ts) e alla fine di campionario.ts;
// salta quelle già fatte, quindi costa poco.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const RADICE = join(import.meta.dirname, "..");
const DATI = join(RADICE, "content", "campionario", "campioni.json");
const USCITA = join(RADICE, "public", "campionario", "mini");

interface Foto {
  file: string;
}

export async function generaMiniature(): Promise<number> {
  const campioni = JSON.parse(readFileSync(DATI, "utf8")) as { foto?: Foto; altre?: Foto[] }[];
  mkdirSync(USCITA, { recursive: true });
  let fatte = 0;
  for (const c of campioni) {
    for (const f of [c.foto, ...(c.altre ?? [])]) {
      if (!f) continue;
      const da = join(RADICE, "public", f.file);
      const a = join(USCITA, basename(f.file));
      if (!existsSync(da) || existsSync(a)) continue;
      // Si legge il file in memoria: su Windows sharp lo terrebbe aperto.
      const buffer = await sharp(readFileSync(da)).rotate().resize({ width: 640, withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toBuffer();
      writeFileSync(a, buffer);
      fatte++;
    }
  }
  return fatte;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const n = await generaMiniature();
  console.log(`Miniature: ${n} nuove.`);
}
