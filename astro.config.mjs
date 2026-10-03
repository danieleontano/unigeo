// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import remarkDirective from "remark-directive";
import { remarkFigure, remarkRiquadri } from "./src/lib/markdown/riquadri.ts";

// Sito statico su GitHub Pages: https://danieleontano.github.io/unigeo/
// `base` entra in ogni link interno: si usa sempre `percorso()` di src/lib/percorsi.ts,
// mai un href scritto a mano che parte da "/".
//
// Markdown: Astro 7 di default usa il suo processore nativo (satteri), che non
// esegue plugin remark. Qui si tiene il pipeline remark/rehype perché i riquadri
// `:::definizione` passano da remark-directive, e gli id dei titoli li genera
// Astro con github-slugger (gli stessi che i quiz usano nei `ref`).
export default defineConfig({
  site: "https://danieleontano.github.io",
  base: "/unigeo",
  // "ignore": /unigeo e /unigeo/ valgono entrambi, in locale come su Pages.
  trailingSlash: "ignore",
  output: "static",
  // Un file per pagina (materie/x.html): così «/materie/x» senza barra finale
  // viene servito da GitHub Pages senza redirect.
  build: { format: "file" },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    processor: unified({ remarkPlugins: [remarkDirective, remarkRiquadri, remarkFigure] }),
  },
});
