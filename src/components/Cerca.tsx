import { useEffect, useMemo, useRef, useState } from "react";
import { cerca, frammento, parole, preparaRecord, radice, type TipoRecord, type Voce } from "@/lib/ricerca";

// La ricerca in tutti gli appunti: lezioni (per sezione), definizioni, glossario,
// campionario, elementi e strumenti. L'indice (cerca-indice.json) si scarica la
// prima volta e poi si cerca nel browser, mentre si scrive.

export interface MateriaCerca {
  id: string;
  nome: string;
  colore: string;
}

const TIPI: { id: TipoRecord | "tutti"; nome: string }[] = [
  { id: "tutti", nome: "Tutto" },
  { id: "lezione", nome: "Lezioni" },
  { id: "definizione", nome: "Definizioni" },
  { id: "campione", nome: "Campioni" },
  { id: "elemento", nome: "Elementi" },
  { id: "strumento", nome: "Strumenti" },
];
const ETICHETTA: Record<TipoRecord, string> = { lezione: "Lezione", definizione: "Definizione", campione: "Campione", elemento: "Elemento", strumento: "Strumento" };
const SUGGERIMENTI = ["fenocristallo", "isotopi", "Mercatore", "UTM", "Streckeisen", "ioni", "scala", "granito", "fotone"];
const PAGINA = 30;

export function Cerca({ materie, base }: { materie: MateriaCerca[]; base: string }) {
  const [indice, setIndice] = useState<ReturnType<typeof preparaRecord> | null>(null);
  const [errore, setErrore] = useState(false);
  const [q, setQ] = useState("");
  const [materia, setMateria] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoRecord | "tutti">("tutti");
  const [quanti, setQuanti] = useState(PAGINA);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQ(new URLSearchParams(location.search).get("q") ?? "");
    fetch(`${base}/cerca-indice.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((v: Voce[]) => setIndice(preparaRecord(v)))
      .catch(() => setErrore(true));
    campo.current?.focus();
  }, [base]);

  // La ricerca resta nell'indirizzo (?q=…): si può ricaricare o condividere.
  useEffect(() => {
    const url = new URL(location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    history.replaceState(history.state, "", url);
    setQuanti(PAGINA);
  }, [q, materia, tipo]);

  const ps = useMemo(() => parole(q), [q]);
  const radici = useMemo(() => ps.map(radice), [ps]);
  const tutti = useMemo(() => (indice && ps.length ? cerca(indice, q) : []), [indice, q, ps.length]);
  const perTipo = useMemo(() => {
    const n: Partial<Record<TipoRecord | "tutti", number>> = { tutti: tutti.length };
    for (const x of tutti) n[x.r.t] = (n[x.r.t] ?? 0) + 1;
    return n;
  }, [tutti]);
  const perMateria = useMemo(() => {
    const n = new Map<string, number>();
    for (const x of tutti) if (x.r.m) n.set(x.r.m, (n.get(x.r.m) ?? 0) + 1);
    return n;
  }, [tutti]);
  const risultati = useMemo(() => tutti.filter((x) => (tipo === "tutti" || x.r.t === tipo) && (!materia || x.r.m === materia)), [tutti, tipo, materia]);
  const dati = new Map(materie.map((m) => [m.id, m]));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative">
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-grafite" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
        <input
          ref={campo}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca nelle lezioni, nelle definizioni, nel campionario…"
          autoComplete="off"
          autoFocus
          aria-label="Cerca negli appunti"
          className="w-full rounded-xl border border-filetto bg-[#241c17] py-3.5 pl-12 pr-4 font-sans text-lg outline-none transition focus:border-[#a8643c]"
        />
      </div>

      {errore && <p className="mt-4 text-sm text-lava">L'indice non si carica: ricarica la pagina.</p>}
      {!indice && !errore && <p className="mt-4 text-sm text-grafite">Carico l'indice…</p>}

      {indice && ps.length === 0 && (
        <div className="mt-6">
          <p className="pannello-titolo">Prova con</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGERIMENTI.map((s) => (
              <button key={s} type="button" onClick={() => setQ(s)} className="rounded-md border border-filetto px-3 py-1.5 font-sans text-sm transition hover:border-grafite">
                {s}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-grafite">{indice.length.toLocaleString("it-IT")} voci: ogni sezione delle lezioni, le definizioni, i 141 campioni, gli elementi e gli strumenti. Premi «/» da qualunque pagina per arrivare qui.</p>
        </div>
      )}

      {indice && ps.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {TIPI.filter((t) => t.id === "tutti" || perTipo[t.id]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                aria-pressed={tipo === t.id}
                className={`rounded-md border px-2.5 py-1 font-sans text-sm transition ${tipo === t.id ? "border-[#a8643c] bg-[#a8643c]/20 text-[#e3b08c]" : "border-filetto hover:border-grafite"}`}
              >
                {t.nome} <span className="opacity-60">{perTipo[t.id] ?? 0}</span>
              </button>
            ))}
          </div>
          {perMateria.size > 1 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {materie
                .filter((m) => perMateria.has(m.id))
                .map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMateria(materia === m.id ? null : m.id)}
                    aria-pressed={materia === m.id}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-xs transition ${materia === m.id ? "border-[#a8643c] bg-[#a8643c]/20 text-[#e3b08c]" : "border-filetto hover:border-grafite"}`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: m.colore }} />
                    {m.nome.replace(" e cartografia", "")} <span className="opacity-60">{perMateria.get(m.id)}</span>
                  </button>
                ))}
            </div>
          )}

          <p className="mt-4 font-sans text-xs text-grafite">
            {risultati.length === 0 ? "Nessun risultato." : `${risultati.length.toLocaleString("it-IT")} ${risultati.length === 1 ? "risultato" : "risultati"}`}
          </p>
          <ol className="mt-2 space-y-2.5">
            {risultati.slice(0, quanti).map(({ r, da }) => {
              const m = dati.get(r.m);
              return (
                <li key={`${r.u}|${r.h}|${r.t}`}>
                  <a href={`${base}${r.u}`} className="pannello block p-4 transition hover:border-[#6b4a35]">
                    <p className="flex flex-wrap items-center gap-x-2 font-sans text-[0.68rem] uppercase tracking-[0.12em] text-grafite">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[#e3b08c]">{ETICHETTA[r.t]}</span>
                      {m && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: m.colore }} />
                          {m.nome.replace(" e cartografia", "")}
                        </span>
                      )}
                      <span className="normal-case tracking-normal">{r.l}</span>
                    </p>
                    <p className="display mt-1 text-[1.15rem] leading-snug">{r.h}</p>
                    <p className="mt-1 text-[0.9rem] leading-snug text-grafite">
                      {frammento(r.x, da, radici).map((p, k) =>
                        p.evidenzia ? (
                          <mark key={k} className="rounded-sm bg-[#a8643c]/35 px-0.5 text-inchiostro">
                            {p.testo}
                          </mark>
                        ) : (
                          <span key={k}>{p.testo}</span>
                        ),
                      )}
                    </p>
                  </a>
                </li>
              );
            })}
          </ol>
          {risultati.length > quanti && (
            <button type="button" onClick={() => setQuanti((n) => n + PAGINA)} className="sans mt-4 rounded-md border border-filetto px-3 py-1.5 text-sm hover:bg-white/5">
              Mostra altri {Math.min(PAGINA, risultati.length - quanti)}
            </button>
          )}
        </>
      )}
    </div>
  );
}
