// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Sito statico su GitHub Pages: https://danieleontano.github.io/unigeo/
// `base` entra in ogni link interno: si usa sempre `percorso()` di src/lib/percorsi.ts,
// mai un href scritto a mano che parte da "/".
export default defineConfig({
  site: "https://danieleontano.github.io",
  base: "/unigeo",
  trailingSlash: "never",
  output: "static",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
