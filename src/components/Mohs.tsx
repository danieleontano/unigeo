import { useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";

// La scala di Mohs e le prove di durezza come in laboratorio: si graffia il
// campione con unghia, moneta di rame, acciaio, vetro, e dai risultati si
// stringe l'intervallo. La scala è ordinale: il diamante (10) è molte volte più
// duro del corindone (9), come mostrano le durezze assolute (sclerometro).

interface Minerale {
  id: string;
  nome: string;
  durezza: [number, number];
  formula?: string;
  nota?: string;
}

const SCALA: (Minerale & { assoluta: number })[] = [
  { id: "talco", nome: "Talco", durezza: [1, 1], formula: "Mg₃Si₄O₁₀(OH)₂", assoluta: 1, nota: "Untuoso al tatto, si riga con l'unghia." },
  { id: "gesso", nome: "Gesso", durezza: [2, 2], formula: "CaSO₄·2H₂O", assoluta: 3, nota: "L'unghia lo riga, appena." },
  { id: "calcite", nome: "Calcite", durezza: [3, 3], formula: "CaCO₃", assoluta: 9, nota: "La moneta di rame la riga; effervescente con HCl." },
  { id: "fluorite", nome: "Fluorite", durezza: [4, 4], formula: "CaF₂", assoluta: 21, nota: "L'acciaio la riga facilmente." },
  { id: "apatite", nome: "Apatite", durezza: [5, 5], formula: "Ca₅(PO₄)₃(F,Cl,OH)", assoluta: 48, nota: "L'acciaio la riga ancora, con fatica." },
  { id: "ortoclasio", nome: "Ortoclasio", durezza: [6, 6], formula: "KAlSi₃O₈", assoluta: 72, nota: "Riga il vetro; l'acciaio non lo riga." },
  { id: "quarzo", nome: "Quarzo", durezza: [7, 7], formula: "SiO₂", assoluta: 100, nota: "Riga vetro e acciaio." },
  { id: "topazio", nome: "Topazio", durezza: [8, 8], formula: "Al₂SiO₄(F,OH)₂", assoluta: 200, nota: "Riga il quarzo." },
  { id: "corindone", nome: "Corindone", durezza: [9, 9], formula: "Al₂O₃", assoluta: 400, nota: "Rubino e zaffiro sono corindone." },
  { id: "diamante", nome: "Diamante", durezza: [10, 10], formula: "C", assoluta: 1500, nota: "Quasi quattro volte il corindone." },
];

const ALTRI: Minerale[] = [
  { id: "grafite", nome: "Grafite", durezza: [1, 2], formula: "C" },
  { id: "zolfo", nome: "Zolfo", durezza: [1.5, 2.5], formula: "S" },
  { id: "muscovite", nome: "Muscovite", durezza: [2, 2.5] },
  { id: "salgemma", nome: "Salgemma (halite)", durezza: [2.5, 2.5], formula: "NaCl" },
  { id: "galena", nome: "Galena", durezza: [2.5, 2.75], formula: "PbS" },
  { id: "biotite", nome: "Biotite", durezza: [2.5, 3] },
  { id: "barite", nome: "Barite", durezza: [3, 3.5], formula: "BaSO₄" },
  { id: "dolomite", nome: "Dolomite", durezza: [3.5, 4], formula: "CaMg(CO₃)₂" },
  { id: "malachite", nome: "Malachite", durezza: [3.5, 4], formula: "Cu₂CO₃(OH)₂" },
  { id: "orneblenda", nome: "Orneblenda (anfibolo)", durezza: [5, 6] },
  { id: "augite", nome: "Augite (pirosseno)", durezza: [5.5, 6] },
  { id: "magnetite", nome: "Magnetite", durezza: [5.5, 6.5], formula: "Fe₃O₄" },
  { id: "ematite", nome: "Ematite", durezza: [5.5, 6.5], formula: "Fe₂O₃" },
  { id: "plagioclasio", nome: "Plagioclasio", durezza: [6, 6.5] },
  { id: "pirite", nome: "Pirite", durezza: [6, 6.5], formula: "FeS₂" },
  { id: "olivina", nome: "Olivina", durezza: [6.5, 7], formula: "(Mg,Fe)₂SiO₄" },
  { id: "granato", nome: "Granato", durezza: [6.5, 7.5] },
  { id: "tormalina", nome: "Tormalina", durezza: [7, 7.5] },
  { id: "berillo", nome: "Berillo", durezza: [7.5, 8], formula: "Be₃Al₂Si₆O₁₈" },
];

const ATTREZZI = [
  { id: "unghia", nome: "Unghia", h: 2.5 },
  { id: "rame", nome: "Moneta di rame", h: 3.5 },
  { id: "acciaio", nome: "Lama d'acciaio", h: 5.5 },
  { id: "vetro", nome: "Vetro", h: 5.5, inverso: true },
  { id: "lima", nome: "Lima d'acciaio", h: 6.5 },
  { id: "punta", nome: "Punta di quarzo", h: 7 },
] as const;

const FASCE: { nome: string; da: number; a: number }[] = [
  { nome: "fino a 2,5", da: 0, a: 2.5 },
  { nome: "2,5 – 3,5", da: 2.5, a: 3.5 },
  { nome: "3,5 – 5,5", da: 3.5, a: 5.5 },
  { nome: "5,5 – 6,5", da: 5.5, a: 6.5 },
  { nome: "6,5 – 7", da: 6.5, a: 7 },
  { nome: "oltre 7", da: 7, a: 10 },
];

const numero = (x: number) => x.toLocaleString("it-IT");
const durezzaTesto = (m: Minerale) => (m.durezza[0] === m.durezza[1] ? numero(m.durezza[0]) : `${numero(m.durezza[0])}–${numero(m.durezza[1])}`);
function fasciaGiusta(m: Minerale) {
  const medio = (m.durezza[0] + m.durezza[1]) / 2;
  return FASCE.findIndex((f) => medio > f.da && medio <= f.a + 1e-9);
}

/** Cosa succede graffiando: l'attrezzo riga il minerale se è più duro (il vetro al contrario). */
function prova(a: (typeof ATTREZZI)[number], m: Minerale): { esito: "si" | "no" | "incerto"; testo: string } {
  const [lo, hi] = m.durezza;
  if ("inverso" in a && a.inverso) {
    if (lo > a.h) return { esito: "si", testo: `Riga il vetro → più di ${numero(a.h)}` };
    if (hi < a.h) return { esito: "no", testo: `Non riga il vetro → meno di ${numero(a.h)}` };
    return { esito: "incerto", testo: `Sul vetro lascia un segno incerto → circa ${numero(a.h)}` };
  }
  if (a.h > hi) return { esito: "si", testo: `${a.nome}: lo riga → meno di ${numero(a.h)}` };
  if (a.h < lo) return { esito: "no", testo: `${a.nome}: non lo riga → più di ${numero(a.h)}` };
  return { esito: "incerto", testo: `${a.nome}: segno incerto → circa ${numero(a.h)}` };
}

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Foto = Record<string, string>;

function Scala({ foto, base }: { foto: Foto; base: string }) {
  const [scelto, setScelto] = useState(6);
  const m = SCALA[scelto];
  const massimo = Math.log10(1500);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="pannello p-4 sm:p-5">
        <h2 className="pannello-titolo">Durezza assoluta (sclerometro), in scala logaritmica</h2>
        <div className="mt-4 grid grid-cols-10 items-end gap-1 sm:gap-2" style={{ height: 180 }}>
          {SCALA.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setScelto(i)}
              aria-pressed={scelto === i}
              className="group flex h-full flex-col justify-end"
              title={`${x.nome}: ${x.assoluta}`}
            >
              <span className="mb-1 text-center font-sans text-[0.6rem] tabular-nums text-grafite">{x.assoluta}</span>
              <span
                className="block rounded-t-md transition group-hover:brightness-125"
                style={{
                  height: `${Math.max(4, (Math.log10(x.assoluta) / massimo) * 100)}%`,
                  background: scelto === i ? "#e07a4a" : `color-mix(in srgb, #e07a4a ${20 + i * 7}%, #3a2e26)`,
                }}
              />
            </button>
          ))}
        </div>
        {/* Il righello di Mohs con gli attrezzi di campagna. */}
        <div className="relative mt-2 h-14 border-t border-filetto">
          {SCALA.map((x, i) => (
            <span key={x.id} className="absolute top-1 -translate-x-1/2 text-center" style={{ left: `${(i + 0.5) * 10}%` }}>
              <span className={`display block text-lg leading-none ${scelto === i ? "text-[#e07a4a]" : ""}`}>{i + 1}</span>
              <span className="hidden font-sans text-[0.62rem] text-grafite sm:block">{x.nome}</span>
            </span>
          ))}
        </div>
        <div className="relative h-12">
          {ATTREZZI.filter((a) => a.id !== "acciaio").map((a, k) => (
            <span key={a.id} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${(a.h - 0.5) * 10}%` }}>
              <span className="w-px bg-[#e07a4a]" style={{ height: k % 2 ? 22 : 8 }} />
              <span className="whitespace-nowrap font-sans text-[0.6rem] text-[#e9b08f]">
                {{ unghia: "unghia", rame: "rame", vetro: "vetro, acciaio", lima: "lima", punta: "quarzo" }[a.id as string]} {numero(a.h)}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="pannello overflow-hidden p-0">
        {foto[m.id] && <img src={base + foto[m.id]} alt={m.nome} className="h-44 w-full object-cover" loading="lazy" />}
        <div className="p-4">
          <p className="pannello-titolo">Durezza {scelto + 1}</p>
          <p className="display mt-0.5 text-2xl leading-tight">{m.nome}</p>
          {m.formula && <p className="mt-0.5 font-sans text-sm text-grafite">{m.formula}</p>}
          <p className="mt-3 text-[0.95rem] leading-snug">{m.nota}</p>
        </div>
      </div>
    </div>
  );
}

function Prova({ foto, base }: { foto: Foto; base: string }) {
  const genera = () => mescola([...SCALA.filter((m) => m.durezza[0] < 10), ...ALTRI]).slice(0, 8);
  const [serie, setSerie] = useState(genera);
  const [i, setI] = useState(0);
  const [prove, setProve] = useState<string[]>([]);
  const [risposta, setRisposta] = useState<number | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const m = serie[i];
  const pieno = "sans rounded-md px-3 py-1.5 text-sm font-medium bg-lava text-white";

  if (i >= serie.length)
    return (
      <div className="pannello entra-girando p-5">
        <p className="pannello-titolo">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {serie.length}</span>
        </p>
        <button type="button" className={`${pieno} mt-4`} onClick={() => (setSerie(genera()), setI(0), setEsiti([]), setProve([]), setRisposta(null))}>
          Altri campioni
        </button>
      </div>
    );

  const giusta = fasciaGiusta(m);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="pannello overflow-hidden p-0">
        {foto[m.id] ? (
          <img src={base + foto[m.id]} alt="Campione da provare" className="h-64 w-full object-cover sm:h-80" />
        ) : (
          <div className="flex h-64 items-center justify-center bg-[#231c18] sm:h-80">
            <svg className="h-24 w-24 text-[#e07a4a] opacity-60" aria-hidden="true"><use href="#cristallo" /></svg>
          </div>
        )}
        <div className="p-4">
          <p className="font-sans text-xs text-grafite">
            Campione {i + 1} di {serie.length}
            {risposta !== null && <> · <b className="text-inchiostro">{m.nome}</b>, durezza {durezzaTesto(m)}</>}
          </p>
          <ol className="mt-2 space-y-1 font-sans text-sm">
            {prove.length === 0 && <li className="text-grafite">Scegli con cosa graffiare.</li>}
            {prove.map((id) => {
              const a = ATTREZZI.find((x) => x.id === id)!;
              const r = prova(a, m);
              return (
                <li key={id} className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${r.esito === "incerto" ? "bg-[#c9bba4]" : r.esito === "si" ? "bg-[#e07a4a]" : "bg-[#6f9a62]"}`} />
                  {r.testo}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="space-y-4">
        <div className="pannello p-4">
          <h2 className="pannello-titolo">Graffia con</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ATTREZZI.map((a) => (
              <button
                key={a.id}
                type="button"
                disabled={prove.includes(a.id) || risposta !== null}
                onClick={() => setProve((p) => [...p, a.id])}
                className="rounded-md border border-filetto px-2 py-2 text-left font-sans text-sm transition enabled:hover:border-grafite disabled:opacity-40"
              >
                {"inverso" in a ? "Prova sul vetro" : a.nome}
                <span className="block text-[0.7rem] text-grafite">{numero(a.h)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={`pannello p-4 ${risposta === null ? "" : risposta === giusta ? "bagliore" : "crepa"}`}>
          <h2 className="pannello-titolo">Durezza stimata</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FASCE.map((f, k) => (
              <button
                key={f.nome}
                type="button"
                disabled={risposta !== null || prove.length === 0}
                onClick={() => (setRisposta(k), setEsiti((e) => [...e, k === giusta]))}
                className={`rounded-md border px-2 py-2 font-sans text-sm tabular-nums transition disabled:cursor-default ${
                  risposta === null ? "border-filetto enabled:hover:border-grafite disabled:opacity-40" : k === giusta ? "border-muschio bg-muschio/15" : k === risposta ? "border-lava bg-lava/15" : "border-filetto opacity-50"
                }`}
              >
                {f.nome}
              </button>
            ))}
          </div>
          {risposta !== null && (
            <button
              type="button"
              className={`${pieno} mt-4`}
              onClick={() => {
                if (i + 1 >= serie.length) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "geologia-1/mohs", correct: esiti.filter(Boolean).length, total: serie.length }] }));
                setI(i + 1);
                setProve([]);
                setRisposta(null);
              }}
            >
              {i + 1 < serie.length ? "Prossimo campione" : "Chiudi"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Mohs({ foto, base }: { foto: Foto; base: string }) {
  const [modo, setModo] = useState<"scala" | "prova">("scala");
  return (
    <div>
      <div className="segmentato">
        {(["scala", "prova"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setModo(m)} aria-pressed={modo === m}>
            {m === "scala" ? "La scala" : "Prova di durezza"}
          </button>
        ))}
      </div>
      <div className="mt-4">{modo === "scala" ? <Scala foto={foto} base={base} /> : <Prova foto={foto} base={base} />}</div>
    </div>
  );
}
