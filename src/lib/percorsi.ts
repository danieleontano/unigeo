// Il sito vive sotto /unigeo su GitHub Pages: ogni link interno passa da qui,
// così il prefisso sta in un posto solo e in locale (base diversa) non si rompe nulla.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function percorso(p: string): string {
  return `${BASE}${p.startsWith("/") ? p : `/${p}`}`;
}
