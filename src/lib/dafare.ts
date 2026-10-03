import type { Lezione } from "./contenuti";

export interface CosaDaFare {
  /** «materia/slug#n»: la n-esima spunta della lezione, nell'ordine del testo. */
  chiave: string;
  lezione: string;
  materia: string;
  numeroLezione: number;
  titoloLezione: string;
  data: string;
  /** Markdown inline (grassetto, corsivo). */
  testo: string;
}

// Le cose da fare nascono dalle righe «- [ ] …» delle lezioni (le sezioni «Da
// fare» dettate dai prof). L'ordine è quello del testo: lo stesso con cui il
// browser trova le caselle nella pagina, così la spunta è la stessa in lista
// e dentro gli appunti.
export function coseDaFareDi(l: Lezione): CosaDaFare[] {
  const corpo = l.body ?? "";
  const materia = l.id.split("/")[0];
  const voci: CosaDaFare[] = [];
  let n = 0;
  for (const riga of corpo.split("\n")) {
    const m = /^\s*[-*]\s+\[([ xX])\]\s+(.+?)\s*$/.exec(riga);
    if (!m) continue;
    voci.push({
      chiave: `${l.id}#${n}`,
      lezione: l.id,
      materia,
      numeroLezione: l.data.numero,
      titoloLezione: l.data.titolo,
      data: l.data.data,
      testo: m[2],
    });
    n++;
  }
  return voci;
}
