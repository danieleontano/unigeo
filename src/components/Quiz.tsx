import { useMemo, useState } from "react";
import { aggiornaStato, useIdratato, useStato } from "@/lib/stato";
import { dopoQuiz, oggiIso } from "@/lib/ripasso";
import type { Domanda } from "@/content.config";

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

// Una domanda alla volta. Le sbagliate dell'ultima volta vengono per prime;
// dopo ogni risposta la spiegazione e il link al paragrafo degli appunti;
// alla fine il punteggio, la scatola aggiornata e le sbagliate da rifare.
export function Quiz({ idLezione, titolo, colore, domande, percorsoLezione, base }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const sbagliatePrima = stato.progress[idLezione]?.wrongIds ?? [];

  const [ordine, setOrdine] = useState<Domanda[] | null>(null);
  const [i, setI] = useState(0);
  const [fase, setFase] = useState<Fase>("domanda");
  const [esiti, setEsiti] = useState<Record<string, boolean>>({});
  // risposta corrente, per tipo
  const [scelta, setScelta] = useState<number | null>(null);
  const [vf, setVf] = useState<boolean | null>(null);
  const [abbinate, setAbbinate] = useState<Record<number, string>>({});
  const [mostraSoluzione, setMostraSoluzione] = useState(false);

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
    if (i + 1 < lista.length) {
      setI(i + 1);
      setFase("domanda");
    } else {
      chiudi();
    }
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
    const sbagliate = lista.filter((q) => esiti[q.id] === false);
    setOrdine(sbagliate);
    setEsiti({});
    setI(0);
    azzeraRisposta();
    setFase("domanda");
  }

  const stile = { ["--materia" as string]: colore } as React.CSSProperties;
  const bottone = "sans rounded-lg px-3 py-1.5 text-sm font-medium";
  const pieno = `${bottone} bg-materia text-white disabled:opacity-40`;
  const vuoto = `${bottone} border border-line text-slate hover:bg-sand/60`;

  if (fase === "fine") {
    const corrette = Object.values(esiti).filter(Boolean).length;
    const p = stato.progress[idLezione];
    const sbagliate = lista.filter((q) => esiti[q.id] === false);
    return (
      <div style={stile}>
        <p className="sans text-xs font-semibold uppercase tracking-[0.18em] text-muted">Fine</p>
        <p className="mt-2 text-3xl font-semibold text-slate">
          {corrette} <span className="text-lg text-muted">su {lista.length}</span>
        </p>
        {p && (
          <p className="sans mt-1 text-sm text-muted">
            Scatola {p.box} · prossimo ripasso {p.nextReview.split("-").reverse().join("/")}
          </p>
        )}
        {sbagliate.length > 0 && (
          <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
            {sbagliate.map((q) => (
              <li key={q.id} className="py-1.5">
                <span className="text-slate">{q.testo}</span>
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
            Oggi
          </a>
        </div>
      </div>
    );
  }

  const giusta = esiti[d.id];

  return (
    <div style={stile}>
      <p className="sans flex items-center justify-between text-xs text-muted">
        <span>
          {i + 1} / {lista.length}
        </span>
        <span className="truncate pl-4">{titolo}</span>
      </p>
      <div className="mt-1 h-1 w-full rounded bg-sand">
        <div className="h-1 rounded bg-materia" style={{ width: `${((i + (fase === "esito" ? 1 : 0)) / lista.length) * 100}%` }} />
      </div>

      <p className="mt-5 text-lg leading-snug text-ink">{d.testo}</p>

      {d.tipo === "scelta" && (
        <ol className="mt-4 space-y-1.5">
          {d.opzioni.map((o, k) => {
            const stato = fase === "esito" ? (k === d.corretta ? "giusta" : k === scelta ? "sbagliata" : "") : k === scelta ? "scelta" : "";
            return (
              <li key={k}>
                <button
                  type="button"
                  disabled={fase === "esito"}
                  onClick={() => setScelta(k)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-[0.95rem] ${
                    stato === "giusta" ? "border-moss bg-moss/10" : stato === "sbagliata" ? "border-materia bg-materia/10" : stato === "scelta" ? "border-slate bg-sand" : "border-line"
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
            const stato = fase === "esito" ? (v === d.corretta ? "giusta" : v === vf ? "sbagliata" : "") : v === vf ? "scelta" : "";
            return (
              <button
                key={String(v)}
                type="button"
                disabled={fase === "esito"}
                onClick={() => setVf(v)}
                className={`sans flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  stato === "giusta" ? "border-moss bg-moss/10" : stato === "sbagliata" ? "border-materia bg-materia/10" : stato === "scelta" ? "border-slate bg-sand" : "border-line"
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
            <div className="rounded-lg border border-line bg-sand/50 p-3 text-[0.95rem]">{d.soluzione}</div>
          )}
          {mostraSoluzione && fase === "domanda" && (
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => registra(true)} className={`${bottone} border border-moss text-moss hover:bg-moss/10`}>
                La sapevo
              </button>
              <button type="button" onClick={() => registra(false)} className={`${bottone} border border-materia text-materia hover:bg-materia/10`}>
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
              <span className="w-2/5 shrink-0 text-[0.95rem] font-semibold text-slate">{c[0]}</span>
              <select
                disabled={fase === "esito"}
                value={abbinate[k] ?? ""}
                onChange={(e) => setAbbinate((a) => ({ ...a, [k]: e.target.value }))}
                className={`sans w-3/5 rounded-lg border px-2 py-1.5 text-sm ${fase === "esito" ? (abbinate[k] === c[1] ? "border-moss bg-moss/10" : "border-materia bg-materia/10") : "border-line"}`}
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
          {fase === "esito" && !giusta && (
            <li className="sans text-xs text-muted">Giusto: {d.coppie.map((c) => `${c[0]} → ${c[1]}`).join(" · ")}</li>
          )}
        </ol>
      )}

      {fase === "domanda" && d.tipo !== "aperta" && (
        <div className="mt-5">
          <button
            type="button"
            onClick={conferma}
            disabled={(d.tipo === "scelta" && scelta === null) || (d.tipo === "verofalso" && vf === null) || (d.tipo === "abbinamento" && Object.keys(abbinate).length < d.coppie.length)}
            className={pieno}
          >
            Conferma
          </button>
        </div>
      )}

      {fase === "esito" && (
        <div className="mt-5 border-t border-line pt-4">
          <p className={`sans text-xs font-semibold uppercase tracking-[0.18em] ${giusta ? "text-moss" : "text-materia"}`}>{giusta ? "Giusto" : "Sbagliato"}</p>
          {d.spiegazione && <p className="mt-1.5 text-[0.95rem]">{d.spiegazione}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={avanti} className={pieno}>
              {i + 1 < lista.length ? "Avanti" : "Fine"}
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
