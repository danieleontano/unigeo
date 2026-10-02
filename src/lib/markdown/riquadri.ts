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
