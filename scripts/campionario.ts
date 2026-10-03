// Scarica una volta le foto del campionario da Wikimedia Commons (l'immagine
// principale della voce di Wikipedia inglese di ogni roccia/minerale), con
// autore e licenza, e le salva in public/campionario/. Le foto restano nel
// repo: il quiz funziona offline. Solo licenze libere (CC BY, CC BY-SA, CC0,
// pubblico dominio); le altre si scartano e si segnalano.
//
//   npx tsx scripts/campionario.ts
//
// I testi (famiglia, caratteri) li scriviamo noi in content/campionario/campioni.json:
// lo script aggiorna solo i campi foto.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = fileURLToPath(new URL("..", import.meta.url));
const CARTELLA = join(RADICE, "public", "campionario");
const DATI = join(RADICE, "content", "campionario", "campioni.json");
const UA = { "User-Agent": "UniGeo/1.0 (studio personale; https://danieleontano.github.io/unigeo/)" };

interface Campione {
  id: string;
  voce: string;
  foto?: { file: string; autore: string; licenza: string; pagina: string };
  [k: string]: unknown;
}

const pulisci = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function json(url: string) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

const campioni: Campione[] = JSON.parse(readFileSync(DATI, "utf8"));
mkdirSync(CARTELLA, { recursive: true });

const titoli = campioni.map((c) => c.voce).join("|");
const pagine = await json(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&redirects=1&titles=${encodeURIComponent(titoli)}`);
const redirect = new Map<string, string>((pagine.query.redirects ?? []).map((r: { from: string; to: string }) => [r.from, r.to]));
const immaginePer = new Map<string, string>();
for (const p of Object.values(pagine.query.pages) as { title: string; pageimage?: string }[]) if (p.pageimage) immaginePer.set(p.title, p.pageimage);

for (const c of campioni) {
  const titolo = redirect.get(c.voce) ?? c.voce;
  const forzata = typeof c.fileCommons === "string" ? (c.fileCommons as string) : undefined;
  const nomeFile = forzata ?? immaginePer.get(titolo);
  if (!nomeFile) {
    console.log(`✘ ${c.id}: nessuna immagine per «${titolo}»`);
    continue;
  }
  const info = await json(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&titles=${encodeURIComponent(`File:${nomeFile}`)}`,
  );
  const pag = Object.values(info.query.pages)[0] as { imageinfo?: { thumburl: string; descriptionurl: string; extmetadata: Record<string, { value: string }> }[] };
  const ii = pag.imageinfo?.[0];
  if (!ii) {
    console.log(`✘ ${c.id}: «${nomeFile}» non è su Commons`);
    continue;
  }
  const licenza = pulisci(ii.extmetadata.LicenseShortName?.value ?? "");
  if (!/^(CC BY|CC-BY|CC0|Public domain|PD)/i.test(licenza)) {
    console.log(`✘ ${c.id}: licenza «${licenza}» non libera, scartata`);
    continue;
  }
  const autore = typeof c.autoreFoto === "string" ? (c.autoreFoto as string) : pulisci(ii.extmetadata.Artist?.value ?? "autore sconosciuto");
  const est = ii.thumburl.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase().replace("jpeg", "jpg") ?? "jpg";
  const file = `${c.id}.${est}`;
  if (!existsSync(join(CARTELLA, file))) {
    const r = await fetch(ii.thumburl, { headers: UA });
    writeFileSync(join(CARTELLA, file), Buffer.from(await r.arrayBuffer()));
  }
  c.foto = { file: `/campionario/${file}`, autore, licenza, pagina: ii.descriptionurl };
  console.log(`✓ ${c.id}: ${nomeFile} · ${licenza} · ${autore.slice(0, 40)}`);
}

writeFileSync(DATI, JSON.stringify(campioni, null, 2) + "\n");
