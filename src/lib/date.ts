const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

// Le date dei contenuti sono stringhe AAAA-MM-GG, senza ora e senza fuso:
// si scompongono a mano, mai `new Date(stringa)` (che le legge come UTC).
export function scomponi(iso: string): { anno: number; mese: number; giorno: number } {
  const [anno, mese, giorno] = iso.split("-").map(Number);
  return { anno, mese, giorno };
}

export function dataLunga(iso: string): string {
  const { anno, mese, giorno } = scomponi(iso);
  const d = new Date(anno, mese - 1, giorno);
  const nomeGiorno = GIORNI[d.getDay()];
  return `${nomeGiorno[0].toUpperCase()}${nomeGiorno.slice(1)} ${giorno} ${MESI[mese - 1]} ${anno}`;
}

export function dataBreve(iso: string): string {
  const { anno, mese, giorno } = scomponi(iso);
  return `${String(giorno).padStart(2, "0")}/${String(mese).padStart(2, "0")}/${anno}`;
}
