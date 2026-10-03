import { useMemo, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";

interface Concetto {
  termine: string;
  definizione: string;
}
interface Gruppo {
  titolo: string;
  concetti: Concetto[];
}
interface Props {
  gruppi: Gruppo[];
}

type Modo = "concetti" | "prova" | "calcoli" | "allenati";

const fmt = (x: number, cifre = 2) => (Number.isFinite(x) ? x.toLocaleString("it-IT", { maximumFractionDigits: cifre }) : "—");
const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const RAD = Math.PI / 180;

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const campo = "w-full rounded-sm border border-filetto bg-white px-2 py-1.5 font-sans text-sm tabular-nums outline-none focus:border-inchiostro";
const bottone = "sans rounded-sm px-3 py-1.5 text-sm font-medium";

function Riquadro({ titolo, children }: { titolo: string; children: React.ReactNode }) {
  return (
    <section className="foglio p-4 pt-6">
      <h3 className="display text-lg leading-tight">{titolo}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 rounded-sm bg-sabbia px-3 py-2 font-sans text-[0.8rem] leading-relaxed">{children}</p>;
}

// ---------------------------------------------------------------------------
// I calcolatori: gli stessi conti dell'esame, con il procedimento in chiaro
// ---------------------------------------------------------------------------

function Calcoli() {
  const [scala, setScala] = useState("25000");
  const [cm, setCm] = useState("4");
  const [dh, setDh] = useState("150");
  const [dCm, setDCm] = useState("3,2");
  const [g, setG] = useState("44");
  const [p, setP] = useState("20");
  const [s, setS] = useState("51");
  const [dec, setDec] = useState("44,4056");
  const [aCm, setACm] = useState("12");

  const S = num(scala);
  const m = (num(cm) * S) / 100;
  const dOrizz = (num(dCm) * S) / 100;
  const pend = (num(dh) / dOrizz) * 100;
  const incl = Math.atan(num(dh) / dOrizz) / RAD;
  const decimali = num(g) + num(p) / 60 + num(s) / 3600;
  const D = num(dec);
  const gg = Math.floor(D);
  const pp = Math.floor((D - gg) * 60);
  const ss = ((D - gg) * 60 - pp) * 60;
  const area = (num(aCm) * S * S) / 1e10;

  return (
    <div>
      <label className="mb-4 flex max-w-xs items-center gap-2 font-sans text-sm">
        <span className="shrink-0">Scala 1:</span>
        <input className={campo} value={scala} onChange={(e) => setScala(e.target.value)} inputMode="numeric" />
      </label>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Riquadro titolo="Distanza: dalla carta al terreno">
          <label className="flex items-center gap-2 font-sans text-sm">
            <input className={campo} value={cm} onChange={(e) => setCm(e.target.value)} inputMode="decimal" />
            <span className="shrink-0">cm sulla carta</span>
          </label>
          <p className="display mt-3 text-2xl">
            {fmt(m)} m <span className="text-base text-grafite">· {fmt(m / 1000, 3)} km</span>
          </p>
          <Formula>
            {cm} cm × {fmt(S, 0)} = {fmt(num(cm) * S, 0)} cm = {fmt(m)} m. Distanza planimetrica: sul terreno in pendenza è di più.
          </Formula>
        </Riquadro>

        <Riquadro titolo="Pendenza e inclinazione di un versante">
          <div className="grid grid-cols-2 gap-2 font-sans text-sm">
            <label>
              Dislivello Δh (m)
              <input className={campo} value={dh} onChange={(e) => setDh(e.target.value)} inputMode="decimal" />
            </label>
            <label>
              Distanza sulla carta (cm)
              <input className={campo} value={dCm} onChange={(e) => setDCm(e.target.value)} inputMode="decimal" />
            </label>
          </div>
          <p className="display mt-3 text-2xl">
            {fmt(pend, 1)}% <span className="text-base text-grafite">· {fmt(incl, 1)}°</span>
          </p>
          <Formula>
            d = {dCm} cm × {fmt(S, 0)} = {fmt(dOrizz)} m · pendenza = Δh / d × 100 = {dh} / {fmt(dOrizz)} × 100 = {fmt(pend, 1)}% · inclinazione = arctan(Δh / d) = {fmt(incl, 1)}°. Il Δh si conta con le isoipse: numero di intervalli × equidistanza.
          </Formula>
        </Riquadro>

        <Riquadro titolo="Coordinate: da sessagesimali a decimali">
          <div className="grid grid-cols-3 gap-2 font-sans text-sm">
            <label>
              Gradi °
              <input className={campo} value={g} onChange={(e) => setG(e.target.value)} inputMode="numeric" />
            </label>
            <label>
              Primi ′
              <input className={campo} value={p} onChange={(e) => setP(e.target.value)} inputMode="numeric" />
            </label>
            <label>
              Secondi ″
              <input className={campo} value={s} onChange={(e) => setS(e.target.value)} inputMode="decimal" />
            </label>
          </div>
          <p className="display mt-3 text-2xl">{fmt(decimali, 5)}°</p>
          <Formula>
            {g} + {p}/60 + {s}/3600 = {fmt(decimali, 5)}°
          </Formula>
          <label className="mt-4 block font-sans text-sm">
            E al contrario: gradi decimali
            <input className={campo} value={dec} onChange={(e) => setDec(e.target.value)} inputMode="decimal" />
          </label>
          <p className="display mt-2 text-2xl">
            {gg}° {pp}′ {fmt(ss, 1)}″
          </p>
        </Riquadro>

        <Riquadro titolo="Area: dalla carta al terreno">
          <label className="flex items-center gap-2 font-sans text-sm">
            <input className={campo} value={aCm} onChange={(e) => setACm(e.target.value)} inputMode="decimal" />
            <span className="shrink-0">cm² sulla carta</span>
          </label>
          <p className="display mt-3 text-2xl">
            {fmt(area, 3)} km² <span className="text-base text-grafite">· {fmt(area * 100, 1)} ha</span>
          </p>
          <Formula>
            Le aree scalano con il quadrato: {aCm} cm² × {fmt(S, 0)}² = {fmt(num(aCm) * S * S, 0)} cm² = {fmt(area, 3)} km² (1 km² = 10¹⁰ cm²). È l'area planimetrica.
          </Formula>
        </Riquadro>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Allenamento sui calcoli: problemi a numeri casuali, risposta con tolleranza
// ---------------------------------------------------------------------------

interface Problema {
  testo: string;
  risposta: number;
  unita: string;
  tolleranza: number;
  soluzione: string;
}

function nuovoProblema(): Problema {
  const scale = [5000, 10000, 25000, 50000, 100000];
  const S = scale[Math.floor(Math.random() * scale.length)];
  const tipo = Math.floor(Math.random() * 5);
  const r1 = (a: number, b: number, dec = 1) => Number((a + Math.random() * (b - a)).toFixed(dec));
  if (tipo === 0) {
    const cm = r1(1.5, 12);
    const m = (cm * S) / 100;
    return { testo: `Su una carta 1:${fmt(S, 0)} due punti distano ${fmt(cm)} cm. Quanti metri sul terreno?`, risposta: m, unita: "m", tolleranza: 0.01, soluzione: `${fmt(cm)} × ${fmt(S, 0)} = ${fmt(cm * S, 0)} cm = ${fmt(m)} m` };
  }
  if (tipo === 1) {
    const km = r1(0.5, 4, 2);
    const cm = (km * 100000) / S;
    return { testo: `Sulla carta 1:${fmt(S, 0)}, quanti cm misurano ${fmt(km)} km sul terreno?`, risposta: cm, unita: "cm", tolleranza: 0.02, soluzione: `${fmt(km)} km = ${fmt(km * 100000, 0)} cm; ÷ ${fmt(S, 0)} = ${fmt(cm)} cm` };
  }
  if (tipo === 2) {
    const intervalli = 2 + Math.floor(Math.random() * 7);
    const eq = S >= 25000 ? 25 : S >= 10000 ? 10 : 5;
    const cm = r1(1, 6);
    const d = (cm * S) / 100;
    const pend = ((intervalli * eq) / d) * 100;
    return { testo: `Carta 1:${fmt(S, 0)}, equidistanza ${eq} m. Tra A e B ci sono ${intervalli} intervalli di isoipse e ${fmt(cm)} cm. Pendenza in %?`, risposta: pend, unita: "%", tolleranza: 0.03, soluzione: `Δh = ${intervalli} × ${eq} = ${intervalli * eq} m; d = ${fmt(cm)} × ${fmt(S, 0)} / 100 = ${fmt(d)} m; ${intervalli * eq} / ${fmt(d)} × 100 = ${fmt(pend, 1)}%` };
  }
  if (tipo === 3) {
    const pend = r1(10, 120, 0);
    const incl = Math.atan(pend / 100) / RAD;
    return { testo: `Un versante ha pendenza ${pend}%. Quanti gradi di inclinazione?`, risposta: incl, unita: "°", tolleranza: 0.02, soluzione: `arctan(${pend} / 100) = ${fmt(incl, 1)}°` };
  }
  const g = 43 + Math.floor(Math.random() * 3);
  const p = Math.floor(Math.random() * 60);
  const s = Math.floor(Math.random() * 60);
  const d = g + p / 60 + s / 3600;
  return { testo: `Trasforma in gradi decimali: ${g}° ${p}′ ${s}″`, risposta: d, unita: "°", tolleranza: 0.00005, soluzione: `${g} + ${p}/60 + ${s}/3600 = ${fmt(d, 5)}°` };
}

function Allenati() {
  const TOT = 8;
  const [problemi, setProblemi] = useState(() => Array.from({ length: TOT }, nuovoProblema));
  const [i, setI] = useState(0);
  const [valore, setValore] = useState("");
  const [esito, setEsito] = useState<boolean | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const pr = problemi[i];

  function verifica() {
    const v = num(valore);
    const ok = Math.abs(v - pr.risposta) <= Math.max(pr.tolleranza * Math.abs(pr.risposta), pr.unita === "°" && pr.tolleranza < 0.001 ? 0.0003 : 0.05);
    setEsito(ok);
    setEsiti((e) => [...e, ok]);
  }
  function avanti() {
    if (i + 1 >= TOT) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "cartografia/calcoli", correct: esiti.filter(Boolean).length, total: TOT }] }));
    setI(i + 1);
    setValore("");
    setEsito(null);
  }

  if (i >= TOT) {
    return (
      <div className="foglio entra-girando p-5 pt-7">
        <p className="etichetta">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {TOT}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setProblemi(Array.from({ length: TOT }, nuovoProblema));
            setI(0);
            setEsiti([]);
          }}
          className={`${bottone} mt-4 bg-lava text-white`}
        >
          Altri {TOT} calcoli
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="sans text-xs text-grafite">
        {i + 1} / {TOT} · tieni a portata la calcolatrice, come all'esame
      </p>
      <div key={i} className={`foglio entra-girando relative mt-2 p-4 pt-6 ${esito === null ? "" : esito ? "bagliore" : "crepa"}`}>
        <p className="text-lg leading-snug">{pr.testo}</p>
        <form
          className="mt-3 flex max-w-sm items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (esito === null && valore) verifica();
          }}
        >
          <input className={campo} value={valore} onChange={(e) => setValore(e.target.value)} inputMode="decimal" placeholder="risposta" disabled={esito !== null} />
          <span className="font-sans text-sm">{pr.unita}</span>
          {esito === null && (
            <button type="submit" className={`${bottone} bg-lava text-white`} disabled={!valore}>
              Verifica
            </button>
          )}
        </form>
      </div>
      {esito !== null && (
        <div className="mt-3">
          <p className={`sans text-xs font-semibold uppercase tracking-[0.18em] ${esito ? "text-muschio" : "text-lava"}`}>{esito ? "Giusto" : `Era ${fmt(pr.risposta, pr.tolleranza < 0.001 ? 5 : 2)} ${pr.unita}`}</p>
          <p className="mt-1 font-sans text-sm">{pr.soluzione}</p>
          <button type="button" onClick={avanti} className={`${bottone} mt-3 bg-lava text-white`}>
            {i + 1 < TOT ? "Avanti" : "Chiudi"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// I concetti: glossario e prova (definizione → termine)
// ---------------------------------------------------------------------------

function Prova({ gruppi }: Props) {
  const tutti = useMemo(() => gruppi.flatMap((g) => g.concetti.map((c) => ({ ...c, gruppo: g.titolo }))), [gruppi]);
  const genera = () =>
    mescola(tutti)
      .slice(0, 10)
      .map((c) => {
        const stesso = tutti.filter((x) => x.gruppo === c.gruppo && x.termine !== c.termine);
        const altri = mescola(stesso.length >= 3 ? stesso : tutti.filter((x) => x.termine !== c.termine)).slice(0, 3);
        return { c, opzioni: mescola([c.termine, ...altri.map((x) => x.termine)]) };
      });
  const [domande, setDomande] = useState(genera);
  const [i, setI] = useState(0);
  const [r, setR] = useState<string | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];

  if (i >= domande.length) {
    return (
      <div className="foglio entra-girando p-5 pt-7">
        <p className="etichetta">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {domande.length}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setDomande(genera());
            setI(0);
            setEsiti([]);
            setR(null);
          }}
          className={`${bottone} mt-4 bg-lava text-white`}
        >
          Altri {domande.length}
        </button>
      </div>
    );
  }
  return (
    <div>
      <p className="sans flex justify-between text-xs text-grafite">
        <span>
          {i + 1} / {domande.length}
        </span>
        <span>{d.c.gruppo}</span>
      </p>
      <div key={i} className={`foglio entra-girando relative mt-2 p-4 pt-6 ${r ? (r === d.c.termine ? "bagliore" : "crepa") : ""}`}>
        <p className="text-[1.05rem] leading-snug">«{d.c.definizione}»</p>
        <p className="mt-2 font-sans text-xs text-grafite">Di che cosa si parla?</p>
        <ol className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {d.opzioni.map((o) => (
            <li key={o}>
              <button
                type="button"
                disabled={!!r}
                onClick={() => {
                  setR(o);
                  setEsiti((e) => [...e, o === d.c.termine]);
                }}
                className={`w-full rounded-sm border px-3 py-2 text-left ${r ? (o === d.c.termine ? "border-muschio bg-muschio/15" : o === r ? "border-lava bg-lava/15" : "border-filetto") : "border-filetto hover:border-grafite"}`}
              >
                {o}
              </button>
            </li>
          ))}
        </ol>
      </div>
      {r && (
        <button
          type="button"
          onClick={() => {
            if (i + 1 >= domande.length) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "cartografia/concetti", correct: esiti.filter(Boolean).length, total: domande.length }] }));
            setI(i + 1);
            setR(null);
          }}
          className={`${bottone} mt-3 bg-lava text-white`}
        >
          {i + 1 < domande.length ? "Avanti" : "Chiudi"}
        </button>
      )}
    </div>
  );
}

export function Cartografia({ gruppi }: Props) {
  const [modo, setModo] = useState<Modo>("concetti");
  const MODI: { id: Modo; nome: string }[] = [
    { id: "concetti", nome: "Concetti" },
    { id: "prova", nome: "Mettiti alla prova" },
    { id: "calcoli", nome: "Calcolatori" },
    { id: "allenati", nome: "Allenati sui calcoli" },
  ];
  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-sm border border-filetto p-0.5 font-sans text-sm">
        {MODI.map((m) => (
          <button key={m.id} type="button" onClick={() => setModo(m.id)} className={`rounded-sm px-3 py-1 ${modo === m.id ? "bg-lava text-white" : "text-grafite hover:text-inchiostro"}`}>
            {m.nome}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {modo === "concetti" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {gruppi.map((g) => (
              <section key={g.titolo} className="foglio p-4 pt-6">
                <h3 className="display text-xl">{g.titolo}</h3>
                <dl className="mt-2 divide-y divide-filetto">
                  {g.concetti.map((c) => (
                    <div key={c.termine} className="py-2">
                      <dt className="font-sans text-sm font-semibold">{c.termine}</dt>
                      <dd className="mt-0.5 text-[0.92rem] leading-snug text-grafite">{c.definizione}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
        {modo === "prova" && <Prova gruppi={gruppi} />}
        {modo === "calcoli" && <Calcoli />}
        {modo === "allenati" && <Allenati />}
      </div>
    </div>
  );
}
