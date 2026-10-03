import type { Root } from "mdast";
import { visit } from "unist-util-visit";

// I quattro riquadri degli appunti (più «nota») scritti in Markdown come
// direttive container:
//
//   :::definizione
//   **Dunite**: roccia ultrafemica con olivina ≥ 90%.
//   :::
//
// diventano <div class="box def"><div class="lab">Definizione</div>…</div>,
// la stessa struttura degli HTML di partenza, così il CSS è uno solo.
// Un'etichetta diversa da quella predefinita si passa tra graffe:
// :::disegna{etichetta="Disegnare, sempre"}.
const RIQUADRI: Record<string, { classe: string; etichetta: string }> = {
  definizione: { classe: "def", etichetta: "Definizione" },
  esame: { classe: "exam", etichetta: "All'esame" },
  disegna: { classe: "draw", etichetta: "Da disegnare" },
  ndr: { classe: "warn", etichetta: "Ndr" },
  nota: { classe: "warn", etichetta: "Nota" },
};

type Direttiva = {
  type: "containerDirective" | "leafDirective" | "textDirective";
  name: string;
  attributes?: Record<string, string | null | undefined> | null;
  children: unknown[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
};

export function remarkRiquadri() {
  return (albero: Root) => {
    visit(albero, (nodo) => {
      if (nodo.type !== "containerDirective") return;
      const direttiva = nodo as unknown as Direttiva;
      const riquadro = RIQUADRI[direttiva.name];
      if (!riquadro) return;

      const etichetta = direttiva.attributes?.etichetta ?? riquadro.etichetta;
      const dati = (direttiva.data ??= {});
      dati.hName = "div";
      dati.hProperties = { className: ["box", riquadro.classe] };
      direttiva.children.unshift({
        type: "paragraph",
        data: { hName: "div", hProperties: { className: ["lab"] } },
        children: [{ type: "text", value: etichetta }],
      });
    });
  };
}

// Un paragrafo fatto solo di un'immagine con testo alternativo diventa una
// <figure> con <figcaption>: è così che le figure SVG degli appunti portano
// la loro didascalia (il convertitore la mette nell'alt).
export function remarkFigure() {
  return (albero: Root) => {
    visit(albero, "paragraph", (nodo) => {
      if (nodo.children.length !== 1 || nodo.children[0].type !== "image") return;
      const img = nodo.children[0];
      if (!img.alt) return;
      const dati = (nodo.data ??= {}) as { hName?: string };
      dati.hName = "figure";
      nodo.children.push({
        type: "strong",
        data: { hName: "figcaption" },
        children: [{ type: "text", value: img.alt }],
      } as never);
    });
  };
}

// Ogni cella di tabella riceve l'intestazione della sua colonna in
// data-etichetta: sul telefono la tabella si impila (una riga = una scheda)
// e l'etichetta dice di che colonna era il dato. Senza, quattro colonne in
// 360 px sono illeggibili.
export function remarkTabelleEtichettate() {
  return (albero: Root) => {
    visit(albero, "table", (tabella) => {
      const [testa, ...righe] = tabella.children;
      if (!testa) return;
      const etichette = testa.children.map((cella) => testoDi(cella));
      for (const riga of righe) {
        riga.children.forEach((cella, i) => {
          const dati = (cella.data ??= {}) as { hProperties?: Record<string, unknown> };
          dati.hProperties = { ...dati.hProperties, "data-etichetta": etichette[i] ?? "" };
        });
      }
    });
  };
}

function testoDi(nodo: unknown): string {
  const n = nodo as { value?: string; children?: unknown[] };
  if (typeof n.value === "string") return n.value;
  return (n.children ?? []).map(testoDi).join("");
}
