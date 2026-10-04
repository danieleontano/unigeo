import { useMemo, useState } from "react";
import type { Sisma } from "@/lib/sismi";

// La mappa dei terremoti RSNI: carta di base dell'Italia nord-occidentale
// (scripts/mappa-nordovest.ts) con gli eventi dell'archivio. Cerchio grande =
// magnitudo alta; colore = profondità. Gli eventi delle ultime 24 ore pulsano.

export interface Mappa {
  bbox: { ovest: number; est: number; sud: number; nord: number };
  larghezza: number;
  altezza: number;
  kx: number;
  ky: number;
  estero: string;
  italia: string;
  confini: string;
  liguria: string;
  laghi: string;
  citta: { nome: string; x: number; y: number }[];
  fonte: string;
}

type Periodo = "7" | "30" | "tutto";
type Ordine = { colonna: "quando" | "magnitudo" | "regione" | "profondita"; verso: "asc" | "desc" } | null;

const PROFONDITA = [
  { fino: 10, colore: "#f2c46b", nome: "0–10 km" },
  { fino: 30, colore: "#e07a4a", nome: "10–30 km" },
  { fino: Infinity, colore: "#b8433a", nome: "oltre 30 km" },
];
const colorePer = (km: number) => PROFONDITA.find((p) => km <= p.fino)!.colore;
const raggio = (m: number) => 2.5 + Math.max(0, m + 0.5) * 2.6;

const fmt = (iso: string, opz: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", ...opz }).format(new Date(iso));
const quandoBreve = (iso: string) => fmt(iso, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function Terremoti({ mappa, eventi, letto }: { mappa: Mappa; eventi: Sisma[]; letto: string }) {
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [minimo, setMinimo] = useState(0);
  const [scelto, setScelto] = useState<string | null>(null);
  const [ordine, setOrdine] = useState<Ordine>(null);

  const adesso = Date.parse(letto);
  const visibili = useMemo(() => {
    const limite = periodo === "tutto" ? -Infinity : adesso - Number(periodo) * 86400000;
    return eventi.filter((e) => Date.parse(e.quando) >= limite && e.magnitudo >= minimo);
  }, [eventi, periodo, minimo, adesso]);

  const righe = useMemo(() => {
    if (!ordine) return visibili;
    const segno = ordine.verso === "asc" ? 1 : -1;
    return [...visibili].sort((a, b) => {
      const x = a[ordine.colonna];
      const y = b[ordine.colonna];
      return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y))) * segno;
    });
  }, [visibili, ordine]);

  const xy = (e: Sisma) => ({ x: (e.lon - mappa.bbox.ovest) * mappa.kx, y: (mappa.bbox.nord - e.lat) * mappa.ky });
  const evento = eventi.find((e) => e.id === scelto);
  const forte = visibili.reduce<Sisma | undefined>((m, e) => (!m || e.magnitudo > m.magnitudo ? e : m), undefined);
  // I più deboli sotto, i più forti sopra.
  const ordinatiPerDisegno = [...visibili].sort((a, b) => a.magnitudo - b.magnitudo);

  function cicla(colonna: NonNullable<Ordine>["colonna"]) {
    setOrdine((o) => (!o || o.colonna !== colonna ? { colonna, verso: "asc" } : o.verso === "asc" ? { colonna, verso: "desc" } : null));
  }
  const freccia = (c: NonNullable<Ordine>["colonna"]) => (ordine?.colonna === c ? (ordine.verso === "asc" ? " ↑" : " ↓") : "");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="segmentato">
          {(["7", "30", "tutto"] as Periodo[]).map((p) => (
            <button key={p} type="button" onClick={() => setPeriodo(p)} aria-pressed={periodo === p}>
              {p === "tutto" ? "Tutto l'archivio" : `${p} giorni`}
            </button>
          ))}
        </div>
        <div className="segmentato">
          {[0, 1, 2].map((m) => (
            <button key={m} type="button" onClick={() => setMinimo(m)} aria-pressed={minimo === m}>
              {m === 0 ? "Ogni magnitudo" : `M ≥ ${m}`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        <div className="pannello relative overflow-hidden p-0">
          <svg viewBox={`0 0 ${mappa.larghezza} ${mappa.altezza}`} className="block h-auto w-full" role="img" aria-label="Mappa dei terremoti nell'Italia nord-occidentale">
            <rect width={mappa.larghezza} height={mappa.altezza} fill="#1b2326" />
            <path d={mappa.estero} fill="#2c2520" stroke="#4a3d33" strokeWidth="0.8" />
            <path d={mappa.italia} fill="#352c25" stroke="#5c4c3f" strokeWidth="0.9" />
            <path d={mappa.liguria} fill="#4a3426" />
            <path d={mappa.confini} fill="none" stroke="#6b5847" strokeWidth="0.7" strokeDasharray="3 3" />
            <path d={mappa.laghi} fill="#1b2326" stroke="#2e3a3e" strokeWidth="0.5" />
            {mappa.citta.map((c) => (
              <g key={c.nome} fontFamily="Poppins, sans-serif" fontSize="11" fill="#b3a48e">
                <circle cx={c.x} cy={c.y} r="2.2" fill="#d8c9b0" />
                <text x={c.x + 5} y={c.y + 4}>{c.nome}</text>
              </g>
            ))}
            <text x={mappa.larghezza - 12} y={mappa.altezza - 12} textAnchor="end" fontFamily="Poppins, sans-serif" fontSize="12" letterSpacing="2" fill="#4f6166">
              MAR LIGURE
            </text>
            {ordinatiPerDisegno.map((e) => {
              const p = xy(e);
              const recente = adesso - Date.parse(e.quando) < 86400000;
              const attivo = e.id === scelto;
              return (
                <g key={e.id} className="cursor-pointer" onClick={() => setScelto(e.id)}>
                  {recente && <circle cx={p.x} cy={p.y} r={raggio(e.magnitudo)} fill="none" stroke={colorePer(e.profondita)} strokeWidth="1.5" className="onda-sismica" />}
                  <circle cx={p.x} cy={p.y} r={raggio(e.magnitudo)} fill={colorePer(e.profondita)} fillOpacity={attivo ? 1 : 0.72} stroke={attivo ? "#fff" : "#1a1411"} strokeWidth={attivo ? 2 : 0.8}>
                    <title>{`M${e.magnitudo} · ${e.regione} · ${quandoBreve(e.quando)}`}</title>
                  </circle>
                </g>
              );
            })}
          </svg>
          <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-x-3 gap-y-1 rounded-md bg-[#1a1411]/85 px-2.5 py-1.5 font-sans text-[0.68rem] text-grafite">
            {PROFONDITA.map((p) => (
              <span key={p.nome} className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.colore }} />
                {p.nome}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="pannello p-4">
            {evento ? (
              <>
                <p className="pannello-titolo">{fmt(evento.quando, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
                <p className="display mt-1 text-3xl leading-none">
                  M {evento.magnitudo.toLocaleString("it-IT")} <span className="text-lg text-grafite">· {evento.regione}</span>
                </p>
                <p className="mt-2 font-sans text-sm tabular-nums text-grafite">
                  Profondità {evento.profondita.toLocaleString("it-IT", { maximumFractionDigits: 1 })} km · {evento.lat.toFixed(3)}° N {evento.lon.toFixed(3)}° E
                </p>
                <a href={evento.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-sans text-xs text-grafite underline hover:text-inchiostro">
                  Scheda RSNI ↗
                </a>
              </>
            ) : (
              <>
                <p className="pannello-titolo">Nel periodo</p>
                <p className="display mt-1 text-3xl leading-none">
                  {visibili.length} <span className="text-lg text-grafite">eventi</span>
                </p>
                {forte && (
                  <p className="mt-2 font-sans text-sm text-grafite">
                    Il più forte: M {forte.magnitudo.toLocaleString("it-IT")}, {forte.regione}, {quandoBreve(forte.quando)}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="pannello p-0">
            <div className="grid grid-cols-[4.6rem_2.6rem_1fr_3rem] gap-2 border-b border-filetto px-3 py-2 font-sans text-[0.62rem] font-semibold uppercase tracking-wider text-grafite">
              <button type="button" className="text-left hover:text-inchiostro" onClick={() => cicla("quando")}>Quando{freccia("quando")}</button>
              <button type="button" className="text-left hover:text-inchiostro" onClick={() => cicla("magnitudo")}>M{freccia("magnitudo")}</button>
              <button type="button" className="text-left hover:text-inchiostro" onClick={() => cicla("regione")}>Zona{freccia("regione")}</button>
              <button type="button" className="text-right hover:text-inchiostro" onClick={() => cicla("profondita")}>km{freccia("profondita")}</button>
            </div>
            <ol className="max-h-[440px] overflow-y-auto">
              {righe.length === 0 && <li className="px-3 py-3 text-sm text-grafite">Nessun evento con questi filtri.</li>}
              {righe.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setScelto(e.id === scelto ? null : e.id)}
                    className={`grid w-full grid-cols-[4.6rem_2.6rem_1fr_3rem] items-center gap-2 px-3 py-1 text-left font-sans text-[0.8rem] tabular-nums transition hover:bg-white/5 ${e.id === scelto ? "bg-white/10" : ""}`}
                  >
                    <span className="text-grafite">{quandoBreve(e.quando).replace(",", "")}</span>
                    <span className="display font-semibold" style={{ color: colorePer(e.profondita) }}>{e.magnitudo.toLocaleString("it-IT")}</span>
                    <span className="truncate">{e.regione}</span>
                    <span className="text-right text-grafite">{Math.round(e.profondita)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
