import { useEffect, useMemo, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";
import {
  AREA_AFRICA,
  AREA_GROENLANDIA,
  PROIEZIONI,
  areaAnello,
  centriCerchietti,
  cerchio,
  decodifica,
  limiti,
  proiezione,
  punto,
  spostaSullaSfera,
  type IdProiezione,
  type Proiezione,
} from "@/lib/proiezioni";

// «Proiezioni deformate» (Geografia fisica, lezioni 3 e 4): lo stesso mondo in
// otto proiezioni, con i cerchietti del prof che si deformano (indicatrici di
// Tissot), il confronto Africa e Groenlandia e una prova. I confini sono Natural
// Earth 1:110m (scripts/mondo.ts).

export interface PaeseMondo {
  n: string;
  c: string;
  a: number[][];
}

const pieno = "sans rounded-md px-3 py-1.5 text-sm font-medium bg-lava text-white";
const GRUPPI: { titolo: string; ids: IdProiezione[] }[] = [
  { titolo: "Cilindriche", ids: ["centrale", "equidistante", "mercatore", "peters"] },
  { titolo: "Convenzionali", ids: ["sinusoidale", "mollweide", "equalearth"] },
  { titolo: "Prospettiche", ids: ["polare"] },
];
const LON_GROENLANDIA = -40;

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const f = (n: number) => n.toFixed(3);
const percorso = (pts: [number, number][], chiudi = true) => (pts.length ? `M${pts.map(([x, y]) => `${f(x)},${f(-y)}`).join("L")}${chiudi ? "Z" : ""}` : "");

function Chip({ si, nome, aiuto }: { si: boolean; nome: string; aiuto: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-xs ${si ? "border-muschio/60 bg-muschio/15 text-[#b7d6a0]" : "border-filetto text-grafite"}`} title={aiuto}>
      <span aria-hidden="true">{si ? "✓" : "✗"}</span>
      {nome}
    </span>
  );
}

function Planisfero({ paesi }: { paesi: PaeseMondo[] }) {
  const [id, setId] = useState<IdProiezione>("mercatore");
  const [cerchietti, setCerchietti] = useState(true);
  const [reticolato, setReticolato] = useState(true);
  const [evidenzia, setEvidenzia] = useState(true);
  const [sposta, setSposta] = useState(0);
  const p = proiezione(id);
  const polare = id === "polare";
  // /proiezioni#equalearth apre direttamente quella proiezione.
  useEffect(() => {
    const leggi = () => {
      const h = location.hash.slice(1);
      if (PROIEZIONI.some((x) => x.id === h)) setId(h as IdProiezione);
    };
    leggi();
    window.addEventListener("hashchange", leggi);
    return () => window.removeEventListener("hashchange", leggi);
  }, []);

  const dati = useMemo(() => {
    const b = limiti(p);
    const nascondiAntartide = p.latMin > -90 && !polare;
    const anelli = (paese: PaeseMondo, spostamento = 0) =>
      paese.a
        .map(decodifica)
        .filter((r) => r.some(([, la]) => la >= p.latMin && la <= p.latMax) || spostamento !== 0)
        .map((r) => r.map(([lo, la]) => (spostamento ? spostaSullaSfera(lo, la, LON_GROENLANDIA, spostamento) : [lo, la]) as [number, number]));
    const proietta = (r: [number, number][]) => r.map(([lo, la]) => punto(p, lo, la));
    const base = paesi
      .filter((x) => x.n !== "Groenlandia" && x.c !== "A" && !(nascondiAntartide && x.c === "X"))
      .map((x) => anelli(x).map((r) => percorso(proietta(r))).join(""));
    const africa = paesi.filter((x) => x.c === "A").flatMap((x) => anelli(x).map((r) => proietta(r)));
    const grDati = paesi.find((x) => x.n === "Groenlandia")!;
    return { b, base: base.join(""), africa, grDati, anelli, proietta };
  }, [p, paesi, polare]);

  const groenlandia = useMemo(() => dati.anelli(dati.grDati, sposta).map(dati.proietta), [dati, sposta]);
  const areaAf = dati.africa.reduce((s, r) => s + areaAnello(r), 0);
  const areaGr = groenlandia.reduce((s, r) => s + areaAnello(r), 0);
  const apparente = polare ? null : areaAf / areaGr;
  const vero = AREA_AFRICA / AREA_GROENLANDIA;

  const reticoloPath = useMemo(() => {
    if (!reticolato) return "";
    const linee: string[] = [];
    for (let lo = -180; lo <= 180; lo += 30) {
      const pts: [number, number][] = [];
      for (let la = p.latMin; la <= p.latMax; la += 2) pts.push(punto(p, lo, la));
      pts.push(punto(p, lo, p.latMax));
      linee.push(percorso(pts, false));
    }
    for (let la = Math.ceil(p.latMin / 30) * 30; la <= p.latMax; la += 30) {
      const pts: [number, number][] = [];
      for (let lo = -180; lo <= 180; lo += 3) pts.push(punto(p, lo, la));
      linee.push(percorso(pts, false));
    }
    return linee.join("");
  }, [p, reticolato]);

  const cerchiettiPath = useMemo(() => {
    if (!cerchietti) return "";
    return centriCerchietti(p)
      .map(([lo, la]) => percorso(cerchio(lo, la, polare ? 5 : 6).map(([a, b]) => punto(p, a, b))))
      .join("");
  }, [p, cerchietti, polare]);

  const { x0, x1, y0, y1 } = dati.b;
  const margine = Math.max(x1 - x0, y1 - y0) * 0.03;
  const vb = `${f(x0 - margine)} ${f(-y1 - margine)} ${f(x1 - x0 + 2 * margine)} ${f(y1 - y0 + 2 * margine)}`;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
      <div className="pannello p-3 sm:p-4">
        <div className="space-y-2">
          {GRUPPI.map((g) => (
            <div key={g.titolo} className="flex flex-wrap items-center gap-1.5">
              <span className="w-28 shrink-0 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-grafite">{g.titolo}</span>
              {g.ids.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => (setId(i), history.replaceState(history.state, "", `#${i}`))}
                  aria-pressed={i === id}
                  className={`rounded-md border px-2.5 py-1 font-sans text-sm transition ${i === id ? "border-[#a8643c] bg-[#a8643c]/20 text-[#e3b08c]" : "border-filetto hover:border-grafite"}`}
                >
                  {proiezione(i).nome}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-3 overflow-hidden rounded-lg bg-[#1b2326]">
          <svg viewBox={vb} className="mx-auto block max-h-[64vh] w-full" role="img" aria-label={`Il mondo in proiezione ${p.nome}`}>
            {reticoloPath && <path d={reticoloPath} fill="none" stroke="#4d5a5e" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
            <path d={dati.base} fill="#3a3028" stroke="#6b5847" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            <g fill={evidenzia ? "#c9a24f" : "#3a3028"} stroke={evidenzia ? "#f2d78a" : "#6b5847"} strokeWidth="0.8" fillOpacity={evidenzia ? 0.85 : 1}>
              {dati.africa.map((r, k) => (
                <path key={k} d={percorso(r)} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            <g fill={evidenzia ? "#e07a4a" : "#3a3028"} stroke={evidenzia ? "#f4b08f" : "#6b5847"} strokeWidth="0.8" fillOpacity={evidenzia ? 0.9 : 1}>
              {groenlandia.map((r, k) => (
                <path key={k} d={percorso(r)} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            {cerchiettiPath && <path d={cerchiettiPath} fill="#f3ecdd" fillOpacity="0.38" stroke="#f3ecdd" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />}
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-sm">
          {(
            [
              ["Cerchietti", cerchietti, setCerchietti],
              ["Reticolato", reticolato, setReticolato],
              ["Africa e Groenlandia", evidenzia, setEvidenzia],
            ] as const
          ).map(([nome, v, set]) => (
            <label key={nome} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} className="accent-[#c9552a]" />
              {nome}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <ProiezioneInfo p={p} />
        <div className="pannello p-4">
          <p className="pannello-titolo">Africa e Groenlandia</p>
          {apparente === null ? (
            <p className="mt-2 text-sm text-grafite">Il confronto non ha senso in una carta che mostra solo l'emisfero nord.</p>
          ) : (
            <>
              <p className="mt-2 text-sm leading-snug">
                In questa carta l'Africa sembra <b className="display text-xl">{apparente.toLocaleString("it-IT", { maximumFractionDigits: 1 })} volte</b> la Groenlandia.
              </p>
              <div className="mt-3 space-y-1.5 font-sans text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-16 text-grafite">in realtà</span>
                  <span className="h-2.5 rounded-full bg-[#c9a24f]" style={{ width: `${Math.min(100, (vero / Math.max(vero, apparente)) * 100)}%` }} />
                  <span className="tabular-nums">{vero.toLocaleString("it-IT", { maximumFractionDigits: 1 })}×</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-grafite">qui</span>
                  <span className="h-2.5 rounded-full bg-[#e07a4a]" style={{ width: `${Math.min(100, (apparente / Math.max(vero, apparente)) * 100)}%` }} />
                  <span className="tabular-nums">{apparente.toLocaleString("it-IT", { maximumFractionDigits: 1 })}×</span>
                </div>
              </div>
              <label className="mt-4 block font-sans text-sm">
                Sposta la Groenlandia verso l'equatore: {sposta}°
                <input type="range" min={0} max={75} step={1} value={sposta} onChange={(e) => setSposta(Number(e.target.value))} className="w-full accent-[#c9552a]" />
              </label>
              <p className="mt-2 text-[0.78rem] leading-snug text-grafite">
                Lo spostamento conserva la grandezza vera (30,4 milioni di km² l'Africa, 2,2 la Groenlandia). In una proiezione equivalente la Groenlandia non cambia di dimensione; in Mercatore si rimpicciolisce a mano a mano che scende.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProiezioneInfo({ p }: { p: Proiezione }) {
  return (
    <div className="pannello p-4">
      <p className="pannello-titolo">{p.famiglia}</p>
      <p className="display mt-0.5 text-2xl leading-tight">{p.nome}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip si={p.proprieta.isogonica} nome="Isogonica" aiuto="Conserva gli angoli, cioè le direzioni" />
        <Chip si={p.proprieta.equivalente} nome="Equivalente" aiuto="Conserva le superfici" />
        <Chip si={p.proprieta.equidistante} nome="Equidistante" aiuto="Conserva le distanze (lungo certe direzioni)" />
      </div>
      <p className="mt-3 text-sm leading-snug">{p.nota}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prova
// ---------------------------------------------------------------------------

interface Domanda {
  testo: string;
  giusta: string;
  altre: string[];
  spiegazione: string;
}

const DOMANDE: Domanda[] = [
  { testo: "Quale proiezione è isogonica (conforme): conserva gli angoli e le forme piccole?", giusta: "Mercatore", altre: ["Gall-Peters", "Sinusoidale", "Cilindrica equidistante"], spiegazione: "In Mercatore i cerchietti restano cerchi (conserva gli angoli) ma si ingrandiscono verso i poli: per questo non è equivalente." },
  { testo: "Perché Mercatore si usa ancora in navigazione?", giusta: "La rotta tra due punti è una retta, la lossodromia", altre: ["Conserva le aree", "Conserva le distanze ovunque", "È l'unica a coprire i poli"], spiegazione: "La lossodromia mantiene un angolo costante rispetto al Nord: su Mercatore è una linea retta." },
  { testo: "Su Mercatore l'Africa e la Groenlandia sembrano di grandezza simile. Perché?", giusta: "Perché le aree si dilatano verso i poli", altre: ["Perché la Groenlandia è davvero grande come l'Africa", "Perché è una proiezione equivalente", "Perché le due masse sono vicine"], spiegazione: "L'Africa è circa 14 volte la Groenlandia. Mercatore è conforme ma non equivalente." },
  { testo: "Quale proiezione raccomanda la risoluzione ONU «Correct the Map» per confrontare le superfici?", giusta: "Equal Earth", altre: ["Mercatore", "Cilindrica centrale", "Centrografica polare"], spiegazione: "Raccomandazione non vincolante: non vieta Mercatore. Equal Earth è equivalente (2018)." },
  { testo: "Nella cilindrica diretta il cilindro è…", giusta: "tangente all'equatore, con l'asse coincidente con l'asse terrestre", altre: ["tangente a un meridiano", "secante, di diametro minore della Terra", "un piano tangente al polo"], spiegazione: "Diretta: asse del cilindro = asse di rotazione terrestre, tangente all'equatore. Nella trasversa (UTM) il cilindro è ruotato di 90°." },
  { testo: "Le tre famiglie di proiezioni sono…", giusta: "vere (pure), modificate e convenzionali", altre: ["isogoniche, equivalenti ed equidistanti", "cilindriche, coniche e piane", "grandi, medie e piccole"], spiegazione: "Vere: costruzione geometrica con una superficie ausiliaria. Modificate: vere con correzioni (Mercatore). Convenzionali: formule matematiche (Mollweide, Sinusoidale, Hammer, Goode)." },
  { testo: "Una proiezione equivalente conserva…", giusta: "le superfici", altre: ["gli angoli", "le distanze", "le direzioni"], spiegazione: "Equivalente = conserva le aree. Isogonica = gli angoli. Equidistante = le distanze." },
  { testo: "Nella cilindrica centrale (lampadina al centro), a 60° di latitudine i cerchietti…", giusta: "si allungano in senso nord-sud e si ingrandiscono", altre: ["restano cerchi della stessa grandezza", "si rimpiccioliscono", "diventano quadrati"], spiegazione: "Entro circa ±15° dall'equatore sono ancora cerchi; più su la deformazione cresce rapidamente." },
  { testo: "Per le zone polari (oltre gli 80° di latitudine) si usano…", giusta: "le proiezioni centrografiche polari", altre: ["la proiezione di Mercatore", "le cilindriche equivalenti", "la proiezione UTM"], spiegazione: "Un piano tangente al polo con la lampadina al centro: paralleli cerchi concentrici, meridiani raggi." },
];

function Prova() {
  const genera = () => mescola(DOMANDE).slice(0, 8).map((d) => ({ ...d, opzioni: mescola([d.giusta, ...d.altre]) }));
  const [domande, setDomande] = useState(genera);
  const [i, setI] = useState(0);
  const [scelta, setScelta] = useState<string | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];
  if (i >= domande.length)
    return (
      <div className="pannello entra-girando p-5">
        <p className="pannello-titolo">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {domande.length}</span>
        </p>
        <button type="button" className={`${pieno} mt-4`} onClick={() => (setDomande(genera()), setI(0), setEsiti([]), setScelta(null))}>
          Altre domande
        </button>
      </div>
    );
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-3 font-sans text-xs text-grafite">
        {i + 1} / {domande.length}
      </p>
      <div className="pannello p-5">
        <p className="text-[1.05rem] leading-snug">{d.testo}</p>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {d.opzioni.map((o) => (
            <button
              key={o}
              type="button"
              disabled={!!scelta}
              onClick={() => (setScelta(o), setEsiti((x) => [...x, o === d.giusta]))}
              className={`rounded-md border px-4 py-3 text-left transition ${scelta ? (o === d.giusta ? "border-muschio bg-muschio/15" : o === scelta ? "border-lava bg-lava/15" : "border-filetto opacity-60") : "border-filetto hover:border-grafite"}`}
            >
              {o}
            </button>
          ))}
        </div>
        {scelta && (
          <>
            <p className="mt-3 text-sm leading-snug">{d.spiegazione}</p>
            <button
              type="button"
              className={`${pieno} mt-3`}
              onClick={() => {
                if (i + 1 >= domande.length) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "geografia-fisica/proiezioni", correct: esiti.filter(Boolean).length, total: domande.length }] }));
                setI(i + 1);
                setScelta(null);
              }}
            >
              {i + 1 < domande.length ? "Avanti" : "Chiudi"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Proiezioni({ paesi }: { paesi: PaeseMondo[] }) {
  const [modo, setModoStato] = useState<"mondo" | "prova">("mondo");
  useEffect(() => {
    const leggi = () => {
      const h = location.hash.slice(1);
      if (h === "mondo" || h === "prova") setModoStato(h);
      else if (PROIEZIONI.some((x) => x.id === h)) setModoStato("mondo");
    };
    leggi();
    window.addEventListener("hashchange", leggi);
    return () => window.removeEventListener("hashchange", leggi);
  }, []);
  const setModo = (m: "mondo" | "prova") => {
    setModoStato(m);
    history.replaceState(history.state, "", `#${m}`);
  };
  return (
    <div>
      <div className="segmentato">
        <button type="button" onClick={() => setModo("mondo")} aria-pressed={modo === "mondo"}>
          Il mondo deformato
        </button>
        <button type="button" onClick={() => setModo("prova")} aria-pressed={modo === "prova"}>
          Mettiti alla prova
        </button>
      </div>
      <div className="mt-4">{modo === "mondo" ? <Planisfero paesi={paesi} /> : <Prova />}</div>
      <p className="mt-6 max-w-prose font-sans text-[0.7rem] leading-snug text-grafite">
        Confini: Natural Earth 1:110m (dominio pubblico). Nessuna proiezione è giusta in assoluto: si sceglie in base allo scopo. La risoluzione ONU «Correct the Map», approvata il 4 settembre 2026 con 164 voti a favore, uno contrario e sei astenuti, non è vincolante e non vieta Mercatore.
      </p>
    </div>
  );
}
