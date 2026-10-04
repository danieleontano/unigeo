import { useMemo, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";

export interface Elemento {
  z: number;
  simbolo: string;
  nome: string;
  inglese: string;
  massa: number | null;
  configurazione: string | null;
  elettronegativita: number | null;
  stato: string;
  categoria: string;
  ossidazione: string | null;
  scoperta: string;
  periodo: number;
  gruppo: number | null;
  riga: number;
  colonna: number;
}

interface Props {
  elementi: Elemento[];
  /** Numeri atomici da sapere a memoria (dalle lezioni). */
  daSapere: number[];
}

// Colori per categoria: toni di roccia e minerale, non arcobaleno.
const COLORI: Record<string, string> = {
  "Metallo alcalino": "#e3a77a",
  "Metallo alcalino-terroso": "#e8c98c",
  "Metallo di transizione": "#c9b8a0",
  "Metallo del blocco p": "#a9b8a6",
  Semimetallo: "#9fc2b8",
  "Non metallo": "#9cc0d6",
  Alogeno: "#b7b0d9",
  "Gas nobile": "#d6a9c4",
  Lantanide: "#d9c27a",
  Attinide: "#d39a85",
};
const STATI: Record<string, string> = { solido: "#c9b8a0", liquido: "#7fb0d4", gassoso: "#d6a9c4" };

type Colore = "categoria" | "stato" | "elettronegativita";
type Modo = "tavola" | "esercizio";

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function coloreDi(e: Elemento, per: Colore): string {
  if (per === "categoria") return COLORI[e.categoria] ?? "#ddd";
  if (per === "stato") return STATI[e.stato.split(" ")[0]] ?? "#e6dfd2";
  if (e.elettronegativita == null) return "#e6dfd2";
  const t = Math.min(1, Math.max(0, (e.elettronegativita - 0.7) / 3.3));
  return `color-mix(in srgb, #c9552a ${Math.round(t * 100)}%, #f3ecdd)`;
}

function Griglia({ elementi, per, evidenzia, onTocca, scelto, esito }: { elementi: Elemento[]; per: Colore; evidenzia?: Set<number>; onTocca: (e: Elemento) => void; scelto?: number; esito?: Record<number, "giusto" | "sbagliato"> }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[720px] gap-[3px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(7, auto) 10px repeat(2, auto)" }}>
        {elementi.map((e) => {
          const spento = evidenzia && !evidenzia.has(e.z);
          const st = esito?.[e.z];
          return (
            <button
              key={e.z}
              type="button"
              onClick={() => onTocca(e)}
              title={`${e.z} ${e.nome}`}
              className={`relative aspect-[4/5] rounded-[3px] border p-[3px] text-left text-[#241e19] transition hover:z-10 hover:scale-110 ${scelto === e.z ? "z-10 scale-110 border-inchiostro ring-2 ring-lava" : "border-black/15"} ${spento ? "opacity-25" : ""} ${st === "giusto" ? "ring-2 ring-muschio" : st === "sbagliato" ? "ring-2 ring-lava" : ""}`}
              style={{ gridRow: e.riga > 7 ? e.riga + 1 : e.riga, gridColumn: e.colonna, background: coloreDi(e, per) }}
            >
              <span className="block font-sans text-[0.5rem] leading-none tabular-nums opacity-70">{e.z}</span>
              <span className="display block text-center text-[0.95rem] font-semibold leading-tight">{e.simbolo}</span>
              <span className="block truncate text-center font-sans text-[0.42rem] leading-none opacity-80">{e.nome}</span>
            </button>
          );
        })}
        <span className="flex items-center justify-center font-sans text-[0.55rem] text-grafite" style={{ gridRow: 6, gridColumn: 3 }}>
          57–71
        </span>
        <span className="flex items-center justify-center font-sans text-[0.55rem] text-grafite" style={{ gridRow: 7, gridColumn: 3 }}>
          89–103
        </span>
      </div>
    </div>
  );
}

function Scheda({ e }: { e?: Elemento }) {
  if (!e) return null;
  return (
    <div key={e.z} className="foglio entra-girando p-4 pt-6">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-sm border border-black/15" style={{ background: COLORI[e.categoria] }}>
          <span className="font-sans text-[0.6rem]">{e.z}</span>
          <span className="display text-2xl font-semibold leading-none">{e.simbolo}</span>
        </div>
        <div className="min-w-0">
          <p className="display text-2xl capitalize leading-tight">{e.nome}</p>
          <p className="font-sans text-xs text-grafite">
            {e.categoria} · {e.inglese}
          </p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-sans text-sm">
        <dt className="text-grafite">Massa atomica</dt>
        <dd>{e.massa ?? "—"} u</dd>
        <dt className="text-grafite">Gruppo · periodo</dt>
        <dd>
          {e.gruppo ?? (e.categoria === "Lantanide" ? "lantanidi" : "attinidi")} · {e.periodo}
        </dd>
        <dt className="text-grafite">Configurazione</dt>
        <dd>{e.configurazione ?? "—"}</dd>
        <dt className="text-grafite">Elettronegatività</dt>
        <dd>{e.elettronegativita ?? "—"}</dd>
        <dt className="text-grafite">Stato (25 °C)</dt>
        <dd>{e.stato}</dd>
        <dt className="text-grafite">N. di ossidazione</dt>
        <dd>{e.ossidazione ?? "—"}</dd>
        <dt className="text-grafite">Scoperta</dt>
        <dd>{e.scoperta}</dd>
      </dl>
      <a href={`https://ptable.com/?lang=it#Propriet%C3%A0/${e.z}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-sans text-xs text-grafite underline hover:text-inchiostro">
        Apri su Ptable ↗
      </a>
    </div>
  );
}

type Domanda = { tipo: "nome" | "simbolo" | "trova"; e: Elemento; opzioni: string[] };

function genera(pool: Elemento[], tutti: Elemento[]): Domanda[] {
  return mescola(pool)
    .slice(0, 12)
    .map((e, k) => {
      const tipo = (["nome", "simbolo", "trova"] as const)[k % 3];
      const altri = mescola(tutti.filter((x) => x.z !== e.z && Math.abs(x.z - e.z) < 20)).slice(0, 3);
      const opzioni = mescola([e, ...altri]).map((x) => (tipo === "nome" ? x.nome : x.simbolo));
      return { tipo, e, opzioni };
    });
}

function Esercizio({ elementi, daSapere }: Props) {
  const [solo, setSolo] = useState(true);
  const pool = useMemo(() => (solo ? elementi.filter((e) => daSapere.includes(e.z)) : elementi), [solo, elementi, daSapere]);
  const [domande, setDomande] = useState(() => genera(pool, elementi));
  const [i, setI] = useState(0);
  const [risposta, setRisposta] = useState<string | number | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];

  function ricomincia(s = solo) {
    setSolo(s);
    const p = s ? elementi.filter((e) => daSapere.includes(e.z)) : elementi;
    setDomande(genera(p, elementi));
    setI(0);
    setRisposta(null);
    setEsiti([]);
  }
  function rispondi(r: string | number, ok: boolean) {
    if (risposta !== null) return;
    setRisposta(r);
    setEsiti((x) => [...x, ok]);
  }
  function avanti() {
    if (i + 1 >= domande.length) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "chimica/elementi", correct: esiti.filter(Boolean).length, total: domande.length }] }));
    setI(i + 1);
    setRisposta(null);
  }

  const bottone = "sans rounded-sm px-3 py-1.5 text-sm font-medium";
  const scelta = (
    <div className="mb-4 flex flex-wrap gap-1 font-sans text-xs">
      {[true, false].map((s) => (
        <button key={String(s)} type="button" onClick={() => ricomincia(s)} className={`rounded-sm border px-2.5 py-1 ${solo === s ? "border-inchiostro bg-sabbia" : "border-filetto text-grafite"}`}>
          {s ? `Da sapere per Chimica (${daSapere.length})` : "Tutti i 118"}
        </button>
      ))}
    </div>
  );

  if (i >= domande.length) {
    return (
      <div>
        {scelta}
        <div className="foglio entra-girando p-5 pt-7">
          <p className="etichetta">Fatto</p>
          <p className="display mt-1 text-4xl font-semibold">
            {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {domande.length}</span>
          </p>
          <button type="button" onClick={() => ricomincia()} className={`${bottone} mt-4 bg-lava text-white`}>
            Altre {domande.length}
          </button>
        </div>
      </div>
    );
  }

  const giusta = d.tipo === "nome" ? d.e.nome : d.e.simbolo;
  const ok = d.tipo === "trova" ? risposta === d.e.z : risposta === giusta;
  return (
    <div>
      {scelta}
      <p className="sans text-xs text-grafite">
        {i + 1} / {domande.length}
      </p>
      <div key={i} className={`foglio entra-girando relative mt-2 p-4 pt-6 ${risposta !== null ? (ok ? "bagliore" : "crepa") : ""}`}>
        {d.tipo === "nome" && (
          <p className="text-lg">
            Come si chiama l'elemento <span className="display text-3xl font-semibold">{d.e.simbolo}</span>?
          </p>
        )}
        {d.tipo === "simbolo" && (
          <p className="text-lg">
            Qual è il simbolo di <span className="display text-2xl font-semibold">{d.e.nome}</span>?
          </p>
        )}
        {d.tipo === "trova" && (
          <p className="text-lg">
            Tocca sulla tavola: <span className="display text-2xl font-semibold">{d.e.nome}</span>
          </p>
        )}
        {d.tipo !== "trova" && (
          <ol className="mt-3 grid grid-cols-2 gap-1.5">
            {d.opzioni.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  disabled={risposta !== null}
                  onClick={() => rispondi(o, o === giusta)}
                  className={`w-full rounded-sm border px-3 py-2 text-left ${risposta !== null ? (o === giusta ? "border-muschio bg-muschio/15" : o === risposta ? "border-lava bg-lava/15" : "border-filetto") : "border-filetto hover:border-grafite"}`}
                >
                  {o}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      {d.tipo === "trova" && (
        <div className="mt-3">
          <Griglia
            elementi={elementi}
            per="categoria"
            onTocca={(e) => rispondi(e.z, e.z === d.e.z)}
            esito={risposta !== null ? { [d.e.z]: "giusto", ...(risposta !== d.e.z ? { [risposta as number]: "sbagliato" } : {}) } : undefined}
          />
        </div>
      )}
      {risposta !== null && (
        <div className="mt-3">
          <p className={`sans text-xs font-semibold uppercase tracking-[0.18em] ${ok ? "text-muschio" : "text-lava"}`}>{ok ? "Giusto" : "Non proprio"}</p>
          <p className="mt-1">
            <span className="display font-semibold">{d.e.simbolo}</span> = {d.e.nome}, numero atomico {d.e.z}, {d.e.categoria.toLowerCase()}.
          </p>
          <button type="button" onClick={avanti} className={`${bottone} mt-3 bg-lava text-white`}>
            {i + 1 < domande.length ? "Avanti" : "Chiudi"}
          </button>
        </div>
      )}
    </div>
  );
}

export function Tavola({ elementi, daSapere }: Props) {
  const [modo, setModo] = useState<Modo>("tavola");
  const [per, setPer] = useState<Colore>("categoria");
  const [soloDaSapere, setSoloDaSapere] = useState(false);
  const [scelto, setScelto] = useState<Elemento | undefined>(() => elementi.find((e) => e.z === 14));
  const evidenzia = useMemo(() => (soloDaSapere ? new Set(daSapere) : undefined), [soloDaSapere, daSapere]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="segmentato">
          {(["tavola", "esercizio"] as Modo[]).map((m) => (
            <button key={m} type="button" onClick={() => setModo(m)} aria-pressed={modo === m}>
              {m === "tavola" ? "Tavola" : "Esercizio"}
            </button>
          ))}
        </div>
        <a href="https://ptable.com/?lang=it#Propriet%C3%A0" target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-grafite underline hover:text-inchiostro">
          Ptable, quella del prof ↗
        </a>
      </div>

      {modo === "tavola" ? (
        <div className="mt-4">
          <div className="mb-3 flex flex-wrap items-center gap-3 font-sans text-sm">
            <div className="segmentato">
            {(
              [
                ["categoria", "Categoria"],
                ["stato", "Stato a 25 °C"],
                ["elettronegativita", "Elettronegatività"],
              ] as [Colore, string][]
            ).map(([k, n]) => (
              <button key={k} type="button" onClick={() => setPer(k)} aria-pressed={per === k}>
                {n}
              </button>
            ))}
            </div>
            <label className="flex items-center gap-1.5 text-grafite">
              <input type="checkbox" checked={soloDaSapere} onChange={(e) => setSoloDaSapere(e.target.checked)} />
              Solo quelli da sapere
            </label>
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
            <div>
              <Griglia elementi={elementi} per={per} evidenzia={evidenzia} onTocca={setScelto} scelto={scelto?.z} />
              {per === "categoria" && (
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-sans text-[0.65rem]">
                  {Object.entries(COLORI).map(([k, c]) => (
                    <li key={k} className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
                      {k}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <aside>
              <Scheda e={scelto} />
            </aside>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Esercizio elementi={elementi} daSapere={daSapere} />
        </div>
      )}
    </div>
  );
}
