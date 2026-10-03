import { useEffect, useState } from "react";

// Il sismografo della Home: gli ultimi terremoti in Italia (M ≥ 2) dal
// servizio FDSN dell'INGV, su un tracciato che scorre. Unica chiamata di rete
// a runtime del sito: l'ultima risposta resta in localStorage, così offline
// si vede quella; se non c'è nulla, il riquadro non compare.

interface Evento {
  id: string;
  quando: string;
  magnitudo: number;
  luogo: string;
  profondita: number;
}

const CHIAVE = "unigeo.sismi.v1";
const URL_INGV = (da: string) =>
  `https://webservices.ingv.it/fdsnws/event/1/query?starttime=${da}&minmag=2&minlat=35.5&maxlat=47.5&minlon=6&maxlon=19&orderby=time&limit=40&format=text`;

function leggiCache(): { evento: Evento[]; preso: number } | null {
  try {
    const g = localStorage.getItem(CHIAVE);
    return g ? JSON.parse(g) : null;
  } catch {
    return null;
  }
}

function fa(iso: string): string {
  const ms = Date.now() - new Date(iso + "Z").getTime();
  const ore = Math.floor(ms / 3_600_000);
  if (ore < 1) return `${Math.max(1, Math.floor(ms / 60_000))} min fa`;
  if (ore < 24) return `${ore} h fa`;
  return `${Math.floor(ore / 24)} g fa`;
}

function analizza(testo: string): Evento[] {
  return testo
    .split("\n")
    .filter((r) => r && !r.startsWith("#"))
    .map((r) => r.split("|"))
    .filter((c) => c.length >= 13)
    .map((c) => ({ id: c[0], quando: c[1], profondita: Number(c[4]), magnitudo: Number(c[10]), luogo: c[12] }));
}

export function Sismografo() {
  const [eventi, setEventi] = useState<Evento[] | null>(null);
  const [vecchio, setVecchio] = useState(false);

  useEffect(() => {
    const cache = leggiCache();
    if (cache) setEventi(cache.evento);
    const da = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    fetch(URL_INGV(da), { signal: ctrl.signal })
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((t) => {
        const e = analizza(t);
        setEventi(e);
        setVecchio(false);
        try {
          localStorage.setItem(CHIAVE, JSON.stringify({ evento: e, preso: Date.now() }));
        } catch {
          /* ignorato */
        }
      })
      .catch(() => setVecchio(!!cache))
      .finally(() => clearTimeout(timer));
    return () => ctrl.abort();
  }, []);

  if (!eventi || eventi.length === 0) return null;

  // Il tracciato: 40 eventi della settimana come picchi, in proporzione alla magnitudo.
  const W = 600;
  const H = 70;
  const piu = [...eventi].reverse();
  const t0 = new Date(piu[0].quando + "Z").getTime();
  const t1 = Date.now();
  const punti: string[] = [];
  let x = 0;
  for (let k = 0; k <= W; k += 6) {
    const rumore = Math.sin(k * 0.37) * 1.4 + Math.sin(k * 1.13) * 0.9;
    punti.push(`${k},${H / 2 + rumore}`);
  }
  const picchi = piu.map((e) => {
    x = ((new Date(e.quando + "Z").getTime() - t0) / Math.max(1, t1 - t0)) * (W - 20) + 10;
    const a = Math.min(H / 2 - 2, (e.magnitudo - 1.5) * 9);
    return { x, a, e };
  });
  const forte = eventi.reduce((m, e) => (e.magnitudo > m.magnitudo ? e : m), eventi[0]);

  return (
    <div className="foglio p-4 pt-6">
      <div className="flex items-baseline justify-between">
        <p className="etichetta">Sismografo · Italia, 7 giorni</p>
        <a href="https://terremoti.ingv.it/" target="_blank" rel="noopener noreferrer" className="font-sans text-[0.65rem] text-grafite hover:text-inchiostro">
          INGV ↗
        </a>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="carta-sismo" width="20" height="10" patternUnits="userSpaceOnUse">
            <path d="M20 0V10M0 10H20" stroke="#d2c5ad" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#carta-sismo)" />
        <polyline points={punti.join(" ")} fill="none" stroke="#6b5f52" strokeWidth="0.8" />
        {picchi.map(({ x, a, e }) => (
          <path
            key={e.id}
            d={`M${x - 4} ${H / 2} L${x - 2} ${H / 2 - a} L${x} ${H / 2 + a * 0.8} L${x + 2} ${H / 2 - a * 0.5} L${x + 4} ${H / 2}`}
            fill="none"
            stroke={e.magnitudo >= 3.5 ? "#c9552a" : "#241e19"}
            strokeWidth="1"
          >
            <title>{`M${e.magnitudo} · ${e.luogo}`}</title>
          </path>
        ))}
        <line x1={W - 1} x2={W - 1} y1="0" y2={H} stroke="#c9552a" strokeWidth="2" className="pennino" />
      </svg>
      <ol className="mt-2 divide-y divide-filetto font-sans text-xs">
        {eventi.slice(0, 4).map((e) => (
          <li key={e.id}>
            <a href={`https://terremoti.ingv.it/event/${e.id}`} target="_blank" rel="noopener noreferrer" className="riga !min-h-0 py-1">
              <span className={`display w-10 shrink-0 text-sm font-semibold ${e.magnitudo >= 3.5 ? "text-lava" : ""}`}>{e.magnitudo.toFixed(1)}</span>
              <span className="min-w-0 flex-1 truncate">{e.luogo}</span>
              <span className="shrink-0 text-grafite">{fa(e.quando)}</span>
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-2 font-sans text-[0.65rem] text-grafite">
        {eventi.length} eventi M ≥ 2 · il più forte M{forte.magnitudo.toFixed(1)}, {forte.luogo.split("(")[0].trim()}
        {vecchio && " · dati dell'ultima connessione"}
      </p>
    </div>
  );
}
