import { useMemo, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";

export interface UnitaICS {
  id: string;
  livello: "supereone" | "eone" | "era" | "periodo" | "sottoperiodo" | "epoca" | "eta";
  nome: string;
  inglese?: string;
  sopra?: string;
  da?: number;
  daErrore?: number;
  a?: number;
  aErrore?: number;
  gssp: boolean;
  colore?: string;
}

interface Props {
  unita: UnitaICS[];
  versione: string;
  modificata?: string;
}

type Modo = "carta" | "base" | "dettaglio";

// ---------------------------------------------------------------------------
// Utilità
// ---------------------------------------------------------------------------

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const prendi = <T,>(xs: T[], k: number) => mescola(xs).slice(0, k);

function eta(ma: number | undefined, errore?: number): string {
  if (ma === undefined) return "—";
  const f = (x: number) => x.toLocaleString("it-IT", { maximumFractionDigits: 3 });
  const testo = ma === 0 ? "oggi" : ma < 0.1 ? `${f(ma * 1000)} ka` : ma >= 1000 ? `${f(ma / 1000)} Ga` : `${f(ma)} Ma`;
  return errore ? `${testo} ± ${f(errore)}` : testo;
}

// ---------------------------------------------------------------------------
// La carta: colonne affiancate, altezza in radice quadrata dell'età
// ---------------------------------------------------------------------------

const COLONNE = [
  { livello: "eone", nome: "Eone" },
  { livello: "era", nome: "Era" },
  { livello: "periodo", nome: "Periodo" },
  { livello: "epoca", nome: "Epoca" },
  { livello: "eta", nome: "Età / Piano" },
] as const;

function Carta({ unita, onScegli, scelta }: { unita: UnitaICS[]; onScegli: (u: UnitaICS) => void; scelta?: UnitaICS }) {
  const [vista, setVista] = useState<"fanerozoico" | "tutto">("fanerozoico");
  const MAX = vista === "fanerozoico" ? 538.8 : 4567;
  const H = vista === "fanerozoico" ? 2600 : 2200;
  const y = (t: number) => (Math.sqrt(Math.min(t, MAX)) / Math.sqrt(MAX)) * H;
  const colonne = vista === "fanerozoico" ? COLONNE : COLONNE.slice(0, 3);
  const tacche = vista === "fanerozoico" ? [1, 10, 23, 66, 145, 252, 299, 359, 419, 443, 487, 539] : [66, 252, 539, 1000, 1600, 2500, 3000, 4031, 4567];

  return (
    <div>
      <div className="mb-3 flex gap-1 font-sans text-xs">
        {(["fanerozoico", "tutto"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setVista(v)} className={`rounded-sm border px-2.5 py-1 ${vista === v ? "border-inchiostro bg-sabbia" : "border-filetto text-grafite"}`}>
            {v === "fanerozoico" ? "Fanerozoico, con i piani" : "Tutta la storia, 4,567 Ga"}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-sm border border-filetto">
        <div className="grid border-b border-filetto font-sans text-[0.6rem] uppercase tracking-wider text-grafite" style={{ gridTemplateColumns: `40px repeat(${colonne.length}, 1fr)` }}>
          <span className="px-1 py-1.5">Ma</span>
          {colonne.map((c) => (
            <span key={c.livello} className="truncate px-1.5 py-1.5">
              {c.nome}
            </span>
          ))}
        </div>
        <div className="relative grid" style={{ gridTemplateColumns: `40px repeat(${colonne.length}, 1fr)`, height: H }}>
          <div className="relative border-r border-filetto">
            {tacche.map((t) => (
              <span key={t} className="absolute right-1 -translate-y-1/2 font-sans text-[0.55rem] tabular-nums text-grafite" style={{ top: y(t) }}>
                {t >= 1000 ? `${(t / 1000).toLocaleString("it-IT")} Ga` : t}
              </span>
            ))}
          </div>
          {colonne.map((c) => (
            <div key={c.livello} className="relative border-r border-black/10">
              {unita
                .filter((u) => (u.livello === c.livello || (c.livello === "periodo" && u.livello === "sottoperiodo" && false)) && u.a !== undefined && u.da !== undefined && u.a < MAX)
                .map((u) => {
                  const alto = y(u.a!);
                  const h = Math.max(1, y(u.da!) - alto);
                  const attiva = scelta?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onScegli(u)}
                      title={`${u.nome}: ${eta(u.da)} – ${eta(u.a)}`}
                      className={`absolute left-0 right-0 overflow-hidden border-b border-black/20 px-1 text-left font-sans text-[0.62rem] leading-tight text-black/80 transition hover:brightness-110 ${attiva ? "z-10 outline outline-2 outline-lava" : ""}`}
                      style={{ top: alto, height: h, background: u.colore ?? "#ccc" }}
                    >
                      {h > 12 && <span className="block truncate pt-0.5 font-medium">{u.nome}</span>}
                      {u.gssp && h > 12 && <span className="absolute bottom-0.5 right-0.5 text-[0.55rem]" aria-label="GSSP ratificato" title="GSSP ratificato">▼</span>}
                    </button>
                  );
                })}
            </div>
          ))}
          <div className="pointer-events-none absolute left-10 right-0 top-0 h-0.5 bg-lava" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-2 font-sans text-[0.65rem] text-grafite">▼ = limite inferiore definito da un GSSP ratificato (il «chiodo d'oro»). Altezze in radice quadrata dell'età.</p>
    </div>
  );
}

function Scheda({ u, perId }: { u?: UnitaICS; perId: Map<string, UnitaICS> }) {
  if (!u) return null;
  const catena: UnitaICS[] = [];
  let p = u.sopra ? perId.get(u.sopra) : undefined;
  while (p) {
    catena.unshift(p);
    p = p.sopra ? perId.get(p.sopra) : undefined;
  }
  const figli = [...perId.values()].filter((x) => x.sopra === u.id).sort((a, b) => (a.a ?? 0) - (b.a ?? 0));
  const LIV: Record<string, string> = { supereone: "Supereone", eone: "Eone", era: "Era", periodo: "Periodo", sottoperiodo: "Sottoperiodo", epoca: "Epoca", eta: "Età (piano)" };
  return (
    <div key={u.id} className="foglio entra-girando p-4 pt-6">
      <p className="etichetta">{LIV[u.livello]}</p>
      <p className="display mt-1 flex items-center gap-2 text-2xl leading-tight">
        <span className="inline-block h-4 w-4 shrink-0 rounded-sm border border-black/20" style={{ background: u.colore }} />
        {u.nome}
      </p>
      {u.inglese && u.inglese !== u.nome && <p className="font-sans text-xs text-grafite">{u.inglese}</p>}
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-sans text-sm">
        <dt className="text-grafite">Inizio</dt>
        <dd>{eta(u.da, u.daErrore)}</dd>
        <dt className="text-grafite">Fine</dt>
        <dd>{eta(u.a, u.aErrore)}</dd>
        <dt className="text-grafite">Durata</dt>
        <dd>{u.da !== undefined && u.a !== undefined ? eta(u.da - u.a) : "—"}</dd>
        <dt className="text-grafite">GSSP</dt>
        <dd>{u.gssp ? "ratificato" : "non ancora"}</dd>
      </dl>
      {catena.length > 0 && <p className="mt-3 font-sans text-xs text-grafite">{catena.map((x) => x.nome).join(" › ")}</p>}
      {figli.length > 0 && (
        <p className="mt-2 font-sans text-xs">
          <span className="text-grafite">Contiene: </span>
          {figli.map((x) => x.nome).join(", ")}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Esercizi
// ---------------------------------------------------------------------------

type Domanda =
  | { tipo: "scelta"; testo: string; opzioni: string[]; giusta: string; spiega: string }
  | { tipo: "ordina"; testo: string; voci: string[]; giusto: string[]; spiega: string };

function genera(unita: UnitaICS[], livello: "base" | "dettaglio"): Domanda[] {
  const fan = unita.filter((u) => u.a !== undefined && u.da !== undefined && u.da <= 538.8);
  const periodi = fan.filter((u) => u.livello === "periodo");
  const ere = unita.filter((u) => u.livello === "era");
  const epoche = fan.filter((u) => u.livello === "epoca");
  const piani = fan.filter((u) => u.livello === "eta");
  const perId = new Map(unita.map((u) => [u.id, u]));
  const era = (u: UnitaICS): UnitaICS | undefined => {
    let p = u.sopra ? perId.get(u.sopra) : undefined;
    while (p && p.livello !== "era") p = p.sopra ? perId.get(p.sopra) : undefined;
    return p;
  };
  const periodo = (u: UnitaICS): UnitaICS | undefined => {
    let p = u.sopra ? perId.get(u.sopra) : undefined;
    while (p && p.livello !== "periodo") p = p.sopra ? perId.get(p.sopra) : undefined;
    return p;
  };
  const dalPiuVecchio = (xs: UnitaICS[]) => [...xs].sort((a, b) => b.da! - a.da!);
  const out: Domanda[] = [];

  if (livello === "base") {
    for (let k = 0; k < 3; k++) {
      const scelti = prendi(periodi, 5);
      out.push({ tipo: "ordina", testo: "Metti in ordine, dal più antico al più recente", voci: mescola(scelti.map((x) => x.nome)), giusto: dalPiuVecchio(scelti).map((x) => x.nome), spiega: dalPiuVecchio(scelti).map((x) => `${x.nome} (${eta(x.da)})`).join(" → ") });
    }
    for (const p of prendi(periodi, 4)) {
      const e = era(p)!;
      out.push({ tipo: "scelta", testo: `A quale era appartiene il ${p.nome}?`, opzioni: mescola(["Paleozoico", "Mesozoico", "Cenozoico"].filter((n) => ere.some((x) => x.nome === n))), giusta: e.nome, spiega: `${p.nome}: ${eta(p.da)} – ${eta(p.a)}, nel ${e.nome}.` });
    }
    for (let k = 0; k < 3; k++) {
      const [x, y] = prendi(periodi, 2);
      const prima = x.da! > y.da! ? x : y;
      out.push({ tipo: "scelta", testo: `Viene prima il ${x.nome} o il ${y.nome}?`, opzioni: mescola([x.nome, y.nome]), giusta: prima.nome, spiega: `${x.nome} da ${eta(x.da)}, ${y.nome} da ${eta(y.da)}.` });
    }
  } else {
    for (const p of prendi(periodi.filter((x) => x.da! > 3), 4)) {
      const distrattori = prendi(periodi.filter((x) => x.id !== p.id), 3).map((x) => eta(x.da));
      out.push({ tipo: "scelta", testo: `Quando inizia il ${p.nome}?`, opzioni: mescola([eta(p.da), ...distrattori]), giusta: eta(p.da), spiega: `${p.nome}: ${eta(p.da, p.daErrore)} – ${eta(p.a, p.aErrore)}${p.gssp ? ", limite con GSSP ratificato" : ""}.` });
    }
    for (const ep of prendi(epoche.filter((x) => periodo(x)), 3)) {
      const pr = periodo(ep)!;
      out.push({ tipo: "scelta", testo: `A quale periodo appartiene l'epoca «${ep.nome}»?`, opzioni: mescola([pr.nome, ...prendi(periodi.filter((x) => x.id !== pr.id), 3).map((x) => x.nome)]), giusta: pr.nome, spiega: `${ep.nome}: ${eta(ep.da)} – ${eta(ep.a)}, nel ${pr.nome}.` });
    }
    for (const pi of prendi(piani.filter((x) => periodo(x)), 3)) {
      const pr = periodo(pi)!;
      out.push({ tipo: "scelta", testo: `Il piano «${pi.nome}» sta nel…`, opzioni: mescola([pr.nome, ...prendi(periodi.filter((x) => x.id !== pr.id), 3).map((x) => x.nome)]), giusta: pr.nome, spiega: `${pi.nome}: ${eta(pi.da)} – ${eta(pi.a)}, ${pr.nome}.` });
    }
  }
  return mescola(out);
}

function Esercizi({ unita, livello }: { unita: UnitaICS[]; livello: "base" | "dettaglio" }) {
  const [domande, setDomande] = useState<Domanda[]>(() => genera(unita, livello));
  const [i, setI] = useState(0);
  const [risposta, setRisposta] = useState<string | null>(null);
  const [ordine, setOrdine] = useState<string[]>([]);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];
  const finito = i >= domande.length;

  function nuovo() {
    setDomande(genera(unita, livello));
    setI(0);
    setRisposta(null);
    setOrdine([]);
    setEsiti([]);
  }
  function chiudi(ok: boolean) {
    setEsiti((e) => [...e, ok]);
  }
  function avanti() {
    if (i + 1 >= domande.length) {
      const corrette = [...esiti].filter(Boolean).length;
      aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: `tempo/${livello}`, correct: corrette, total: domande.length }] }));
    }
    setI(i + 1);
    setRisposta(null);
    setOrdine([]);
  }

  const bottone = "sans rounded-sm px-3 py-1.5 text-sm font-medium";
  if (finito) {
    const ok = esiti.filter(Boolean).length;
    return (
      <div className="foglio entra-girando p-5 pt-7">
        <p className="etichetta">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {ok} <span className="text-xl text-grafite">su {domande.length}</span>
        </p>
        <button type="button" onClick={nuovo} className={`${bottone} mt-4 bg-lava text-white`}>
          Altre {domande.length} domande
        </button>
      </div>
    );
  }

  const chiusa = d.tipo === "scelta" ? risposta !== null : risposta !== null;
  const giusta = d.tipo === "scelta" ? risposta === d.giusta : risposta === "ok";

  return (
    <div>
      <p className="sans flex justify-between text-xs text-grafite">
        <span>
          {i + 1} / {domande.length}
        </span>
        <span>{livello === "base" ? "Ripasso di base" : "Dettaglio"}</span>
      </p>
      <div className="mt-1 h-1 w-full rounded bg-sabbia">
        <div className="h-1 rounded bg-lava transition-[width] duration-500" style={{ width: `${((i + (chiusa ? 1 : 0)) / domande.length) * 100}%` }} />
      </div>
      <div key={i} className={`foglio entra-girando relative mt-4 p-4 pt-6 ${chiusa ? (giusta ? "bagliore" : "crepa") : ""}`}>
        <p className="text-lg leading-snug">{d.testo}</p>

        {d.tipo === "scelta" && (
          <ol className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {d.opzioni.map((o) => {
              const st = risposta ? (o === d.giusta ? "border-muschio bg-muschio/15" : o === risposta ? "border-lava bg-lava/15" : "border-filetto") : "border-filetto hover:border-grafite";
              return (
                <li key={o}>
                  <button
                    type="button"
                    disabled={!!risposta}
                    onClick={() => {
                      setRisposta(o);
                      chiudi(o === d.giusta);
                    }}
                    className={`w-full rounded-sm border px-3 py-2 text-left ${st}`}
                  >
                    {o}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {d.tipo === "ordina" && (
          <div className="mt-3">
            <ol className="flex min-h-10 flex-wrap gap-1.5 rounded-sm border border-dashed border-filetto p-1.5">
              {ordine.map((v, k) => (
                <li key={v} className="rounded-sm bg-sabbia px-2 py-1 font-sans text-sm">
                  <span className="mr-1 text-grafite">{k + 1}.</span>
                  {v}
                </li>
              ))}
              {ordine.length === 0 && <li className="px-1 py-1 font-sans text-xs text-grafite">Tocca i periodi in ordine, dal più antico</li>}
            </ol>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.voci
                .filter((v) => !ordine.includes(v))
                .map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={!!risposta}
                    onClick={() => {
                      const nuovo = [...ordine, v];
                      setOrdine(nuovo);
                      if (nuovo.length === d.voci.length) {
                        const ok = nuovo.every((x, k) => x === d.giusto[k]);
                        setRisposta(ok ? "ok" : "no");
                        chiudi(ok);
                      }
                    }}
                    className="rounded-sm border border-filetto px-2.5 py-1.5 font-sans text-sm hover:border-inchiostro"
                  >
                    {v}
                  </button>
                ))}
              {ordine.length > 0 && !risposta && (
                <button type="button" onClick={() => setOrdine([])} className="px-2 font-sans text-xs text-grafite">
                  ricomincia
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {chiusa && (
        <div className="mt-3">
          <p className={`sans text-xs font-semibold uppercase tracking-[0.18em] ${giusta ? "text-muschio" : "text-lava"}`}>{giusta ? "Giusto" : "Non proprio"}</p>
          <p className="mt-1 text-[0.95rem]">{d.spiega}</p>
          <button type="button" onClick={avanti} className={`${bottone} mt-3 bg-lava text-white`}>
            {i + 1 < domande.length ? "Avanti" : "Chiudi"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Tempo({ unita, versione, modificata }: Props) {
  const [modo, setModo] = useState<Modo>("carta");
  const perId = useMemo(() => new Map(unita.map((u) => [u.id, u])), [unita]);
  const [scelta, setScelta] = useState<UnitaICS | undefined>(() => perId.get("Holocene"));

  const MODI: { id: Modo; nome: string }[] = [
    { id: "carta", nome: "Carta" },
    { id: "base", nome: "Impara: le basi" },
    { id: "dettaglio", nome: "Impara: il dettaglio" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-sm border border-filetto p-0.5 font-sans text-sm">
          {MODI.map((m) => (
            <button key={m.id} type="button" onClick={() => setModo(m.id)} className={`rounded-sm px-3 py-1 ${modo === m.id ? "bg-lava text-white" : "text-grafite hover:text-inchiostro"}`}>
              {m.nome}
            </button>
          ))}
        </div>
        <span className="font-sans text-[0.7rem] text-grafite">
          Carta ICS v{versione}
          {modificata && <> · {modificata.split("-").reverse().join("/")}</>}
        </span>
      </div>

      <div className="mt-5">
        {modo === "carta" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <Carta unita={unita} onScegli={setScelta} scelta={scelta} />
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <Scheda u={scelta} perId={perId} />
            </aside>
          </div>
        )}
        {modo === "base" && <Esercizi key="base" unita={unita} livello="base" />}
        {modo === "dettaglio" && <Esercizi key="dettaglio" unita={unita} livello="dettaglio" />}
      </div>
    </div>
  );
}
