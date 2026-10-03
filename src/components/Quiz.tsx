import { useMemo, useState } from "react";
import { aggiornaStato, useIdratato, useStato } from "@/lib/stato";
import { dopoQuiz, oggiIso } from "@/lib/ripasso";
import type { Domanda } from "@/content.config";
import { Eruzione } from "./Eruzione";

interface Props {
  idLezione: string;
  titolo: string;
  colore: string;
  domande: Domanda[];
  percorsoLezione: string;
  base: string;
}

type Fase = "domanda" | "esito" | "fine";

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// La scala di Mohs come punteggio: la durezza della tua conoscenza.
const MOHS = ["Talco", "Gesso", "Calcite", "Fluorite", "Apatite", "Ortoclasio", "Quarzo", "Topazio", "Corindone", "Diamante"];
function durezza(quota: number): number {
  return Math.max(1, Math.min(10, Math.round(quota * 10)));
}

// Il riconoscimento del campione: una domanda alla volta su un cartellino
// che entra girando; la risposta sbagliata crepa il cartellino, quella
// giusta lo fa risuonare. Alla fine la durezza di Mohs e, sopra l'80%,
// l'eruzione.
export function Quiz({ idLezione, titolo, colore, domande, percorsoLezione, base }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const sbagliatePrima = stato.progress[idLezione]?.wrongIds ?? [];

  const [ordine, setOrdine] = useState<Domanda[] | null>(null);
  const [i, setI] = useState(0);
  const [fase, setFase] = useState<Fase>("domanda");
  const [esiti, setEsiti] = useState<Record<string, boolean>>({});
  const [scelta, setScelta] = useState<number | null>(null);
  const [vf, setVf] = useState<boolean | null>(null);
  const [abbinate, setAbbinate] = useState<Record<number, string>>({});
  const [mostraSoluzione, setMostraSoluzione] = useState(false);
  const [giro, setGiro] = useState(0);

  const lista = useMemo(() => {
    if (ordine) return ordine;
    const prima = domande.filter((d) => sbagliatePrima.includes(d.id));
    const dopo = domande.filter((d) => !sbagliatePrima.includes(d.id));
    return [...prima, ...dopo];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordine, domande]);

  const d = lista[i];
  const destre = useMemo(() => (d?.tipo === "abbinamento" ? mescola(d.coppie.map((c) => c[1])) : []), [d]);

  if (!idratato) return <div className="h-24" aria-hidden="true" />;

  function azzeraRisposta() {
    setScelta(null);
    setVf(null);
    setAbbinate({});
    setMostraSoluzione(false);
  }

  function registra(giusta: boolean) {
    setEsiti((e) => ({ ...e, [d.id]: giusta }));
    setFase("esito");
  }

  function conferma() {
    if (d.tipo === "scelta" && scelta !== null) registra(scelta === d.corretta);
    if (d.tipo === "verofalso" && vf !== null) registra(vf === d.corretta);
    if (d.tipo === "abbinamento") registra(d.coppie.every((c, k) => abbinate[k] === c[1]));
  }

  function avanti() {
    azzeraRisposta();
    setGiro((g) => g + 1);
    if (i + 1 < lista.length) {
      setI(i + 1);
      setFase("domanda");
    } else chiudi();
  }

  function chiudi() {
    const corrette = Object.values(esiti).filter(Boolean).length;
    const sbagliate = lista.filter((q) => esiti[q.id] === false).map((q) => q.id);
    const oggi = oggiIso();
    aggiornaStato((s) => ({
      ...s,
      progress: { ...s.progress, [idLezione]: dopoQuiz(s.progress[idLezione], corrette, lista.length, sbagliate, oggi) },
      history: [...s.history, { date: oggi, lesson: idLezione, correct: corrette, total: lista.length }],
    }));
    setFase("fine");
  }

  function rifaiSbagliate() {
    setOrdine(lista.filter((q) => esiti[q.id] === false));
    setEsiti({});
    setI(0);
    azzeraRisposta();
    setGiro((g) => g + 1);
    setFase("domanda");
  }

  const stile = { ["--materia" as string]: colore } as React.CSSProperties;
  const bottone = "sans rounded-lg px-3 py-1.5 text-sm font-medium";
  const pieno = `${bottone} bg-lava text-white disabled:opacity-40`;
  const vuoto = `${bottone} border border-filetto text-inchiostro hover:bg-sabbia`;

  if (fase === "fine") {
    const corrette = Object.values(esiti).filter(Boolean).length;
    const quota = lista.length ? corrette / lista.length : 0;
    const grado = durezza(quota);
    const p = stato.progress[idLezione];
    const sbagliate = lista.filter((q) => esiti[q.id] === false);
    return (
      <div style={stile} className="entra-girando">
        <Eruzione attiva={quota >= 0.8} />
        <p className="etichetta">Durezza della conoscenza · scala di Mohs</p>
        <div className="mt-3 flex items-end gap-4">
          <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0" style={{ color: quota >= 0.8 ? "var(--color-ocra)" : "var(--grafite)" }} aria-hidden="true">
            <use href="#cristallo" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="display text-4xl font-semibold leading-none">
              {grado} <span className="text-xl text-grafite">· {MOHS[grado - 1]}</span>
            </p>
            <p className="mt-1 font-sans text-sm text-grafite">
              {corrette} su {lista.length} · {Math.round(quota * 100)}%
            </p>
          </div>
        </div>
        <div className="mohs mt-4" aria-hidden="true">
          {MOHS.map((m, k) => (
            <span key={m} className={k < grado ? "acceso" : ""} title={m} />
          ))}
        </div>
        {p && (
          <p className="mt-3 font-sans text-sm text-grafite">
            Scatola {p.box} · prossimo ripasso {p.nextReview.split("-").reverse().join("/")}
          </p>
        )}
        {sbagliate.length > 0 && (
          <ul className="mt-5 divide-y divide-filetto border-y border-filetto text-sm">
            {sbagliate.map((q) => (
              <li key={q.id} className="py-1.5">
                <span>{q.testo}</span>
                {q.ref && (
                  <a href={`${base}${percorsoLezione}${q.ref}`} className="sans ml-2 text-xs text-materia hover:underline">
                    appunti →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {sbagliate.length > 0 && (
            <button type="button" onClick={rifaiSbagliate} className={pieno}>
              Rifai le sbagliate
            </button>
          )}
          <a href={`${base}${percorsoLezione}`} className={vuoto}>
            Torna agli appunti
          </a>
          <a href={`${base}/`} className={vuoto}>
            Taccuino
          </a>
        </div>
      </div>
    );
  }

  const giusta = esiti[d.id];
  const classeCartellino = fase === "esito" ? (giusta ? "bagliore" : "crepa") : "entra-girando";

  return (
    <div style={stile}>
      <p className="sans flex items-center justify-between text-xs text-grafite">
        <span>
          Campione {i + 1} / {lista.length}
        </span>
        <span className="truncate pl-4">{titolo}</span>
      </p>
      <div className="mt-1 h-1 w-full rounded bg-sabbia">
        <div className="h-1 rounded bg-materia transition-[width] duration-500" style={{ width: `${((i + (fase === "esito" ? 1 : 0)) / lista.length) * 100}%` }} />
      </div>

      <div key={`${d.id}-${giro}-${fase}`} className={`relative mt-5 rounded-xl border border-filetto bg-sabbia/60 p-4 sm:p-5 ${classeCartellino}`}>
        <p className="text-lg leading-snug">{d.testo}</p>

        {d.tipo === "scelta" && (
          <ol className="mt-4 space-y-1.5">
            {d.opzioni.map((o, k) => {
              const st = fase === "esito" ? (k === d.corretta ? "giusta" : k === scelta ? "sbagliata" : "") : k === scelta ? "scelta" : "";
              return (
                <li key={k}>
                  <button
                    type="button"
                    disabled={fase === "esito"}
                    onClick={() => setScelta(k)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-[0.95rem] transition ${
                      st === "giusta" ? "border-muschio bg-muschio/15" : st === "sbagliata" ? "border-lava bg-lava/15" : st === "scelta" ? "border-inchiostro bg-sabbia" : "border-filetto hover:border-grafite"
                    }`}
                  >
                    {o}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {d.tipo === "verofalso" && (
          <div className="mt-4 flex gap-2">
            {[true, false].map((v) => {
              const st = fase === "esito" ? (v === d.corretta ? "giusta" : v === vf ? "sbagliata" : "") : v === vf ? "scelta" : "";
              return (
                <button
                  key={String(v)}
                  type="button"
                  disabled={fase === "esito"}
                  onClick={() => setVf(v)}
                  className={`sans flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    st === "giusta" ? "border-muschio bg-muschio/15" : st === "sbagliata" ? "border-lava bg-lava/15" : st === "scelta" ? "border-inchiostro bg-sabbia" : "border-filetto"
                  }`}
                >
                  {v ? "Vero" : "Falso"}
                </button>
              );
            })}
          </div>
        )}

        {d.tipo === "aperta" && (
          <div className="mt-4">
            {!mostraSoluzione ? (
              <button type="button" onClick={() => setMostraSoluzione(true)} className={vuoto}>
                Mostra la soluzione
              </button>
            ) : (
              <div className="rounded-lg border border-filetto bg-carta p-3 text-[0.95rem]">{d.soluzione}</div>
            )}
            {mostraSoluzione && fase === "domanda" && (
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => registra(true)} className={`${bottone} border border-muschio text-muschio hover:bg-muschio/15`}>
                  La sapevo
                </button>
                <button type="button" onClick={() => registra(false)} className={`${bottone} border border-lava text-lava hover:bg-lava/15`}>
                  Non la sapevo
                </button>
              </div>
            )}
          </div>
        )}

        {d.tipo === "abbinamento" && (
          <ol className="mt-4 space-y-2">
            {d.coppie.map((c, k) => (
              <li key={k} className="flex items-center gap-2">
                <span className="w-2/5 shrink-0 text-[0.95rem] font-semibold">{c[0]}</span>
                <select
                  disabled={fase === "esito"}
                  value={abbinate[k] ?? ""}
                  onChange={(e) => setAbbinate((a) => ({ ...a, [k]: e.target.value }))}
                  className={`sans w-3/5 rounded-lg border px-2 py-1.5 text-sm ${fase === "esito" ? (abbinate[k] === c[1] ? "border-muschio" : "border-lava") : "border-filetto"}`}
                >
                  <option value="">…</option>
                  {destre.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </li>
            ))}
            {fase === "esito" && !giusta && <li className="sans text-xs text-grafite">Giusto: {d.coppie.map((c) => `${c[0]} → ${c[1]}`).join(" · ")}</li>}
          </ol>
        )}
      </div>

      {fase === "domanda" && d.tipo !== "aperta" && (
        <div className="mt-4">
          <button
            type="button"
            onClick={conferma}
            disabled={(d.tipo === "scelta" && scelta === null) || (d.tipo === "verofalso" && vf === null) || (d.tipo === "abbinamento" && Object.keys(abbinate).length < d.coppie.length)}
            className={pieno}
          >
            Riconosci
          </button>
        </div>
      )}

      {fase === "esito" && (
        <div className="mt-4 border-t border-filetto pt-4">
          <p className={`sans text-xs font-semibold uppercase tracking-[0.18em] ${giusta ? "text-muschio" : "text-lava"}`}>{giusta ? "Riconosciuto" : "Crepato"}</p>
          {d.spiegazione && <p className="mt-1.5 text-[0.95rem]">{d.spiegazione}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={avanti} className={pieno}>
              {i + 1 < lista.length ? "Prossimo campione" : "Chiudi"}
            </button>
            {d.ref && (
              <a href={`${base}${percorsoLezione}${d.ref}`} className="sans text-sm text-materia hover:underline">
                Vai al paragrafo →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
