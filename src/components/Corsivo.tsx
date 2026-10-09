// Il testo dei quiz: i *nomi latini* tra asterischi vanno in corsivo, e i pedici
// scritti con il trattino basso (R_H, m_s) in pedice.
import { Fragment } from "react";

const SEGNI = /\*([^*]+)\*|([A-Za-z])_([A-Za-z0-9]+)/g;

/** Toglie gli asterischi: serve dove il corsivo non si può rendere (le voci di una tendina). */
export function senzaAsterischi(t: string): string {
  return t.replace(/\*([^*]+)\*/g, "$1");
}

export function Corsivo({ t }: { t: string }) {
  const pezzi: React.ReactNode[] = [];
  let ultimo = 0;
  for (const m of t.matchAll(SEGNI)) {
    const i = m.index ?? 0;
    if (i > ultimo) pezzi.push(<Fragment key={`t${i}`}>{t.slice(ultimo, i)}</Fragment>);
    pezzi.push(m[1] !== undefined ? <em key={`e${i}`}>{m[1]}</em> : <Fragment key={`p${i}`}>{m[2]}<sub>{m[3]}</sub></Fragment>);
    ultimo = i + m[0].length;
  }
  if (ultimo < t.length) pezzi.push(<Fragment key="fine">{t.slice(ultimo)}</Fragment>);
  return <>{pezzi}</>;
}
