import type { Lezione } from "./contenuti";

export interface Carta {
  /** «materia/slug#indice»: stabile finché la lezione non cambia. */
  chiave: string;
  lezione: string;
  numeroLezione: number;
  titoloLezione: string;
  /** Il termine: il primo grassetto del blocco, o l'etichetta del riquadro. */
  fronte: string;
  /** Il testo del blocco, Markdown inline (grassetto, corsivo) incluso. */
  retro: string;
}

// Le flashcard nascono dai blocchi :::definizione delle lezioni: fronte = il
// termine, retro = la definizione. Niente file a parte: la fonte è la lezione.
export function carteDiLezione(l: Lezione): Carta[] {
  const corpo = l.body ?? "";
  const carte: Carta[] = [];
  const blocco = /^:::definizione(?:\{etichetta="([^"]*)"\})?\s*\n([\s\S]*?)\n:::\s*$/gm;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = blocco.exec(corpo))) {
    const etichetta = m[1];
    const testo = m[2].trim();
    // Il termine è il grassetto con cui il blocco COMINCIA («**Dunite**: …»);
    // se il blocco parte con una frase, vale l'etichetta del riquadro.
    const inizio = /^\*\*([^*]+)\*\*/.exec(testo)?.[1];
    const grassetto = /\*\*([^*]+)\*\*/.exec(testo)?.[1];
    const fronte = (inizio ?? etichetta ?? grassetto ?? `Definizione ${i + 1}`).replace(/[:.]\s*$/, "");
    carte.push({
      chiave: `${l.id}#${i}`,
      lezione: l.id,
      numeroLezione: l.data.numero,
      titoloLezione: l.data.titolo,
      fronte,
      retro: testo,
    });
    i++;
  }
  return carte;
}
