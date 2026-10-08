// Il testo dei quiz con i *nomi latini* tra asterischi: li rende in corsivo.
import { Fragment } from "react";

/** Toglie gli asterischi: serve dove il corsivo non si può rendere (le voci di una tendina). */
export function senzaAsterischi(t: string): string {
  return t.replace(/\*([^*]+)\*/g, "$1");
}

export function Corsivo({ t }: { t: string }) {
  return (
    <>
      {t.split(/\*([^*]+)\*/).map((pezzo, i) => (i % 2 === 1 ? <em key={i}>{pezzo}</em> : <Fragment key={i}>{pezzo}</Fragment>))}
    </>
  );
}
