// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import remarkDirective from "remark-directive";
import { remarkCampioni, remarkFigure, remarkRiquadri, remarkTabelleEtichettate } from "./src/lib/markdown/riquadri.ts";
import { fileURLToPath } from "node:url";

// Sito statico. Su Vercel (variabile VERCEL presente in build) vive alla
// radice; su GitHub Pages sotto /unigeo. `base` entra in ogni link interno: si usa sempre `percorso()` di src/lib/percorsi.ts,
// mai un href scritto a mano che parte da "/".
//
// Markdown: Astro 7 di default usa il suo processore nativo (satteri), che non
// esegue plugin remark. Qui si tiene il pipeline remark/rehype perché i riquadri
// `:::definizione` passano da remark-directive, e gli id dei titoli li genera
// Astro con github-slugger (gli stessi che i quiz usano nei `ref`).
const SU_VERCEL = Boolean(process.env.VERCEL);
const BASE = SU_VERCEL ? "/" : "/unigeo";
const SITO = SU_VERCEL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "unigeo.vercel.app"}` : "https://danieleontano.github.io";

export default defineConfig({
  site: SITO,
  base: BASE,
  // "ignore": con e senza barra finale valgono entrambi.
  trailingSlash: "ignore",
  output: "static",
  // La barra degli strumenti di Astro in basso nelle pagine locali: Daniele la vede e confonde.
  devToolbar: { enabled: false },
  // Un file per pagina (materie/x.html): così «/materie/x» senza barra finale
  // viene servito senza redirect (su Vercel con cleanUrls, vedi vercel.json).
  build: { format: "file" },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    processor: unified({ remarkPlugins: [
      remarkDirective,
      remarkRiquadri,
      remarkFigure,
      remarkTabelleEtichettate,
      [remarkCampioni, { base: BASE === "/" ? "" : BASE, dati: fileURLToPath(new URL("./content/campionario/campioni.json", import.meta.url)) }],
    ] }),
  },
});
