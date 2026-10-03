// Scarica le foto del campionario da Wikimedia Commons, con autore e licenza,
// in public/campionario/. Le foto restano nel repo: il quiz funziona offline.
// Solo licenze libere (CC BY, CC BY-SA, CC0, pubblico dominio).
//
//   npx tsx scripts/campionario.ts
//
// Per ogni campione in content/campionario/campioni.json:
//   - la foto principale è `fileCommons` se c'è, altrimenti l'immagine della
//     voce di Wikipedia inglese `voce`;
//   - `altriFile` (facoltativo) sono altre foto dello stesso campione: nel
//     quiz se ne pesca una a caso, così si impara la roccia e non la foto;
//   - `autoreFoto` corregge un autore illeggibile.
// I testi (famiglia, caratteri) li scriviamo noi: lo script tocca solo le foto.
// Commons limita le richieste: lo script fa una pausa tra una e l'altra.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = fileURLToPath(new URL("..", import.meta.url));
const CARTELLA = join(RADICE, "public", "campionario");
const DATI = join(RADICE, "content", "campionario", "campioni.json");
const UA = { "User-Agent": "UniGeo/1.0 (studio personale; https://danieleontano.github.io/unigeo/)" };
const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Foto {
  file: string;
  autore: string;
  licenza: string;
  pagina: string;
}
interface Campione {
  id: string;
  voce: string;
  fileCommons?: string;
  altriFile?: string[];
  autoreFoto?: string;
  foto?: Foto;
  altre?: Foto[];
  [k: string]: unknown;
}

const pulisci = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function json(url: string) {
  for (let tentativo = 0; tentativo < 4; tentativo++) {
    const r = await fetch(url, { headers: UA });
    const testo = await r.text();
    if (r.ok && testo.startsWith("{")) return JSON.parse(testo);
    await pausa(15000 * (tentativo + 1));
  }
  throw new Error(`Commons non risponde: ${url}`);
}

async function scarica(nomeFile: string, nomeLocale: string, autoreForzato?: string): Promise<Foto | null> {
  await pausa(1500);
  const info = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&titles=${encodeURIComponent(`File:${nomeFile}`)}`);
  const pag = Object.values(info.query.pages)[0] as { imageinfo?: { thumburl: string; descriptionurl: string; extmetadata: Record<string, { value: string }> }[] };
  const ii = pag.imageinfo?.[0];
  if (!ii) {
    console.log(`✘ «${nomeFile}» non è su Commons`);
    return null;
  }
  const licenza = pulisci(ii.extmetadata.LicenseShortName?.value ?? "");
  if (!/^(CC BY|CC-BY|CC0|Public domain|PD)/i.test(licenza)) {
    console.log(`✘ «${nomeFile}»: licenza «${licenza}» non libera, scartata`);
    return null;
  }
  const autore = autoreForzato ?? pulisci(ii.extmetadata.Artist?.value ?? "autore sconosciuto");
  const est = ii.thumburl.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase().replace("jpeg", "jpg") ?? "jpg";
  const file = `${nomeLocale}.${est}`;
  if (!existsSync(join(CARTELLA, file))) {
    await pausa(1000);
    const r = await fetch(ii.thumburl, { headers: UA });
    if (!r.ok) {
      console.log(`✘ «${nomeFile}»: download ${r.status}`);
      return null;
    }
    writeFileSync(join(CARTELLA, file), Buffer.from(await r.arrayBuffer()));
  }
  return { file: `/campionario/${file}`, autore, licenza, pagina: ii.descriptionurl };
}

const campioni: Campione[] = JSON.parse(readFileSync(DATI, "utf8"));
mkdirSync(CARTELLA, { recursive: true });

// Immagini principali dalle voci di Wikipedia, per chi non ha un file forzato.
const senza = campioni.filter((c) => !c.fileCommons);
const immaginePer = new Map<string, string>();
if (senza.length) {
  const pagine = await json(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&redirects=1&titles=${encodeURIComponent(senza.map((c) => c.voce).join("|"))}`);
  const redirect = new Map<string, string>((pagine.query.redirects ?? []).map((r: { from: string; to: string }) => [r.from, r.to]));
  for (const p of Object.values(pagine.query.pages) as { title: string; pageimage?: string }[]) if (p.pageimage) immaginePer.set(p.title, p.pageimage);
  for (const c of senza) {
    const f = immaginePer.get(redirect.get(c.voce) ?? c.voce);
    if (f) c.fileCommons = f;
  }
}

for (const c of campioni) {
  if (!c.fileCommons) {
    console.log(`✘ ${c.id}: nessuna immagine`);
    continue;
  }
  if (!c.foto || !existsSync(join(RADICE, "public", c.foto.file))) {
    const f = await scarica(c.fileCommons, c.id, c.autoreFoto);
    if (f) c.foto = f;
  }
  const altre: Foto[] = [];
  for (const [k, nome] of (c.altriFile ?? []).entries()) {
    const gia = c.altre?.[k];
    if (gia && existsSync(join(RADICE, "public", gia.file))) {
      altre.push(gia);
      continue;
    }
    const f = await scarica(nome, `${c.id}-${k + 2}`);
    if (f) altre.push(f);
  }
  if (altre.length) c.altre = altre;
  console.log(`✓ ${c.id}: ${1 + altre.length} foto`);
  writeFileSync(DATI, JSON.stringify(campioni, null, 2) + "\n");
}
