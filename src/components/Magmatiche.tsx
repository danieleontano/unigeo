import { useEffect, useMemo, useRef, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";
import {
  EFFUSIVE,
  GENETICI,
  GRUPPI_ULTRA,
  INTRUSIVE,
  PIROCLASTITI,
  TRATTEGGI_EFFUSIVE,
  TRATTEGGI_INTRUSIVE,
  ULTRAFEMICHE,
  campoQapf,
  componentiQapf,
  vetrosaDa,
  type CampoQapf,
  type CampoTernario,
  type Terna,
  type Ternario,
} from "@/lib/magmatiche";

// La classificazione delle rocce magmatiche come nelle slide di Geologia 1:
// il metodo della lezione 5 (tessitura → femici → diagramma) e i quattro
// diagrammi, più l'esercizio e il glossario dei termini.

type Vista = "metodo" | "ultrafemiche" | "intrusive" | "effusive" | "vetrose" | "prova";
export interface VoceGlossario {
  termine: string;
  definizione: string;
}
export interface GruppoGlossario {
  titolo: string;
  voci: VoceGlossario[];
}

const VISTE: { id: Vista; nome: string }[] = [
  { id: "metodo", nome: "Il metodo" },
  { id: "ultrafemiche", nome: "Ultrafemiche" },
  { id: "intrusive", nome: "Intrusive" },
  { id: "effusive", nome: "Effusive" },
  { id: "vetrose", nome: "Vetrose" },
  { id: "prova", nome: "Classifica tu" },
];

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Doppio triangolo di Streckeisen (rombo QAPF)
// ---------------------------------------------------------------------------

const W = 520;
const H = Math.round((W * Math.sqrt(3)) / 2);
const M = 26;
const A = { x: M, y: H + M };
const P = { x: W + M, y: H + M };
const Q = { x: W / 2 + M, y: M };
const F = { x: W / 2 + M, y: 2 * H + M };

function puntoQapf(v: number, r: number) {
  const apice = v >= 0 ? Q : F;
  const t = Math.abs(v) / 100;
  const sx = { x: A.x + t * (apice.x - A.x), y: A.y + t * (apice.y - A.y) };
  const dx = { x: P.x + t * (apice.x - P.x), y: P.y + t * (apice.y - P.y) };
  return { x: sx.x + (r / 100) * (dx.x - sx.x), y: sx.y + (r / 100) * (dx.y - sx.y) };
}
/** Il campo come poligono: se attraversa la linea A–P, il lato piega lì. */
function poligonoQapf(c: CampoQapf) {
  const vs = c.v[0] < 0 && c.v[1] > 0 ? [c.v[0], 0, c.v[1]] : [c.v[0], c.v[1]];
  const pts = [...vs.map((v) => puntoQapf(v, c.r[0])), ...[...vs].reverse().map((v) => puntoQapf(v, c.r[1]))];
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}
const COLORE_QAPF = (c: CampoQapf) =>
  ({ "90": "#d6cdbd", "60": "#dcd2c0", "20": "#e6c59f", "5": "#e9d3b0", "0": "#efe2c4", "-10": "#e1e4d2", "-60": "#d3dbc6", "-90": "#c7d1ba", "-100": "#c7d1ba" })[String(c.v[0])] ?? "#e9e1cc";

function Rombo({ campi, tratteggi, v, r, onPunta, evidenzia }: { campi: CampoQapf[]; tratteggi: { v: [number, number]; r: number }[]; v: number; r: number; onPunta?: (v: number, r: number) => void; evidenzia?: CampoQapf }) {
  const svg = useRef<SVGSVGElement>(null);
  const trascina = useRef(false);
  function daEvento(e: React.PointerEvent) {
    const ctm = svg.current?.getScreenCTM();
    if (!onPunta || !ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const sopra = p.y <= A.y;
    const t = Math.max(0, Math.min(1, sopra ? (A.y - p.y) / (A.y - Q.y) : (p.y - A.y) / (F.y - A.y)));
    const apice = sopra ? Q : F;
    const sx = A.x + t * (apice.x - A.x);
    const dx = P.x + t * (apice.x - P.x);
    const rr = dx - sx < 1 ? 50 : Math.max(0, Math.min(100, ((p.x - sx) / (dx - sx)) * 100));
    onPunta(Math.round(t * 100) * (sopra ? 1 : -1), Math.round(rr));
  }
  const pt = puntoQapf(v, r);
  const lettera = (testo: string, x: number, y: number, ancora: "start" | "middle" | "end" = "middle") => (
    <text x={x} y={y} textAnchor={ancora} fontSize="16" fontWeight="700" fill="#c9552a" fontFamily="Fraunces, serif">
      {testo}
    </text>
  );
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W + 2 * M} ${2 * H + 2 * M}`}
      className={`mx-auto block h-auto max-h-[82vh] w-full select-none ${onPunta ? "touch-none" : ""}`}
      onPointerDown={(e) => {
        if (!onPunta) return;
        trascina.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        daEvento(e);
      }}
      onPointerMove={(e) => trascina.current && daEvento(e)}
      onPointerUp={() => (trascina.current = false)}
    >
      {campi.map((c) => (
        <polygon key={c.nome + c.v[0]} points={poligonoQapf(c)} fill={evidenzia === c ? "#f3b98a" : COLORE_QAPF(c)} stroke="#5a4a3a" strokeWidth="0.8" />
      ))}
      {tratteggi.map((d, k) => {
        const a = puntoQapf(d.v[0], d.r);
        const b = puntoQapf(d.v[1], d.r);
        return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#5a4a3a" strokeWidth="0.8" strokeDasharray="4 3" />;
      })}
      <line x1={A.x} y1={A.y} x2={P.x} y2={P.y} stroke="#3a2d23" strokeWidth="1.6" />
      {campi
        .filter((c) => c.breve !== "—" && c.breve !== "" && ((c.r[1] - c.r[0] >= 25 && c.r[1] - c.r[0] < 100) || c.v[0] >= 60 || c.v[0] <= -90 || (c.r[1] - c.r[0] === 10 && c.v[1] - c.v[0] >= 40)))
        .map((c) => {
          const centro = puntoQapf((c.v[0] + c.v[1]) / 2, (c.r[0] + c.r[1]) / 2);
          const alta = Math.abs(c.v[1] - c.v[0]);
          // Le strisce strette lungo i lati (r 0–10 o 90–100): nome ruotato come sulla slide.
          const striscia = c.r[1] - c.r[0] === 10 && alta >= 40;
          const angolo = striscia ? (c.v[0] >= 0 ? (c.r[0] === 0 ? -60 : 60) : c.r[0] === 0 ? 60 : -60) : 0;
          const corpo = striscia ? 7.5 : alta >= 40 ? 10.5 : alta >= 15 ? 8.5 : 6.6;
          return (
            <text key={"t" + c.nome} x={centro.x} y={centro.y + corpo / 3} transform={angolo ? `rotate(${angolo} ${centro.x} ${centro.y})` : undefined} textAnchor="middle" fontSize={corpo} fontFamily="Poppins, sans-serif" fill="#3a2d23">
              {c.breve ?? c.nome.split(" / ")[0]}
            </text>
          );
        })}
      {lettera("Q", Q.x, Q.y - 8)}
      {lettera("F", F.x, F.y + 20)}
      {lettera("A", A.x - 6, A.y + 5, "end")}
      {lettera("P", P.x + 6, P.y + 5, "start")}
      {[5, 20, 60, 90, -10, -60, ...(campi === EFFUSIVE ? [-90] : [])].map((x) => (
        <text key={x} x={puntoQapf(x, 100).x + 6} y={puntoQapf(x, 100).y + 3} fontSize="9" fill="#a89a86" fontFamily="Poppins, sans-serif">
          {Math.abs(x)}%
        </text>
      ))}
      {[10, 35, 65, 90].map((x) => (
        <text key={"r" + x} x={puntoQapf(20, x).x} y={puntoQapf(20, x).y - 4} textAnchor="middle" fontSize="8" fill="#7a6a58" fontFamily="Poppins, sans-serif">
          {x}
        </text>
      ))}
      <g pointerEvents="none">
        <circle cx={pt.x} cy={pt.y} r="10" fill="#c9552a" opacity="0.25" />
        <circle cx={pt.x} cy={pt.y} r="5" fill="#c9552a" stroke="#fff" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Triangolo generico (ultrafemiche, piroclastiti)
// ---------------------------------------------------------------------------

const TW = 520;
const TH = Math.round((TW * Math.sqrt(3)) / 2);
const TM = 30;
const T_ALTO = { x: TM + TW / 2, y: TM + 18 };
const T_SX = { x: TM, y: TM + 18 + TH };
const T_DX = { x: TM + TW, y: TM + 18 + TH };
const xy = ([a, b, c]: Terna) => ({ x: (a * T_ALTO.x + b * T_SX.x + c * T_DX.x) / 100, y: (a * T_ALTO.y + b * T_SX.y + c * T_DX.y) / 100 });

function inTerna(x: number, y: number): Terna {
  const den = (T_SX.y - T_DX.y) * (T_ALTO.x - T_DX.x) + (T_DX.x - T_SX.x) * (T_ALTO.y - T_DX.y);
  let a = ((T_SX.y - T_DX.y) * (x - T_DX.x) + (T_DX.x - T_SX.x) * (y - T_DX.y)) / den;
  let b = ((T_DX.y - T_ALTO.y) * (x - T_DX.x) + (T_ALTO.x - T_DX.x) * (y - T_DX.y)) / den;
  let c = 1 - a - b;
  [a, b, c] = [a, b, c].map((n) => Math.max(0, n));
  const s = a + b + c || 1;
  const ta = Math.round((a / s) * 100);
  const tb = Math.min(100 - ta, Math.round((b / s) * 100));
  return [ta, tb, 100 - ta - tb];
}

function area(pts: { x: number; y: number }[]) {
  let s = 0;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    s += p.x * q.y - q.x * p.y;
  });
  return Math.abs(s) / 2;
}

function Triangolo({ tern, punto, onPunta, evidenzia, colori }: { tern: Ternario; punto: Terna; onPunta?: (t: Terna) => void; evidenzia?: CampoTernario; colori: string[] }) {
  const svg = useRef<SVGSVGElement>(null);
  const trascina = useRef(false);
  function daEvento(e: React.PointerEvent) {
    const ctm = svg.current?.getScreenCTM();
    if (!onPunta || !ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    onPunta(inTerna(p.x, p.y));
  }
  const pt = xy(punto);
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${TW + 2 * TM} ${TH + 2 * TM + 40}`}
      className={`mx-auto block h-auto max-h-[72vh] w-full select-none ${onPunta ? "touch-none" : ""}`}
      onPointerDown={(e) => {
        if (!onPunta) return;
        trascina.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        daEvento(e);
      }}
      onPointerMove={(e) => trascina.current && daEvento(e)}
      onPointerUp={() => (trascina.current = false)}
    >
      {tern.campi.map((c, i) => {
        const pts = c.poligono.map(xy);
        return <polygon key={c.nome} points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} fill={evidenzia === c ? "#f3b98a" : colori[i]} stroke="#5a4a3a" strokeWidth="0.8" />;
      })}
      {tern.campi.map((c) => {
        const pts = c.poligono.map(xy);
        const a = area(pts);
        if (c.breve === "" || (a < 1500 && !c.etichetta)) return null;
        const centro = c.etichetta ? xy(c.etichetta) : { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
        const corpo = c.corpo ?? (a > 20000 ? 12 : a > 6000 ? 10 : 8);
        return (
          <text key={"t" + c.nome} x={centro.x} y={centro.y + corpo / 3} transform={c.angolo ? `rotate(${c.angolo} ${centro.x} ${centro.y})` : undefined} textAnchor="middle" fontSize={corpo} fontFamily="Poppins, sans-serif" fill="#3a2d23" pointerEvents="none">
            {c.breve ?? c.nome}
          </text>
        );
      })}
      {tern.tacche.map((t) => {
        const p = xy(t.punto);
        return (
          <text key={t.testo} x={p.x - 6} y={p.y + 3} textAnchor="end" fontSize="10" fill="#a89a86" fontFamily="Poppins, sans-serif">
            {t.testo}
          </text>
        );
      })}
      <g fontFamily="Fraunces, serif" fontSize="15" fontWeight="700" fill="#c9552a">
        <text x={T_ALTO.x} y={T_ALTO.y - 10} textAnchor="middle">{tern.vertici[0]}</text>
        <text x={T_SX.x} y={T_SX.y + 24} textAnchor="start">{tern.vertici[1]}</text>
        <text x={T_DX.x} y={T_DX.y + 24} textAnchor="end">{tern.vertici[2]}</text>
      </g>
      <g pointerEvents="none">
        <circle cx={pt.x} cy={pt.y} r="10" fill="#c9552a" opacity="0.25" />
        <circle cx={pt.x} cy={pt.y} r="5" fill="#c9552a" stroke="#fff" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

const COLORI_ULTRA = ["#c7d59a", "#d9e0b4", "#cfe0cf", "#d9e0b4", "#eadfc2", "#efe2c4", "#eadfc2", "#e3d3b3", "#e9dcc0", "#e3d3b3"];
const COLORI_PIRO = ["#c3d0e3", "#d6d3cc", "#c5dcbf", "#e6e1d6", "#ebcaca"];

// ---------------------------------------------------------------------------
// Pezzi comuni
// ---------------------------------------------------------------------------

function Scheda({ etichetta, nome, inglese, children }: { etichetta: string; nome: string; inglese?: string; children?: React.ReactNode }) {
  return (
    <div className="pannello p-4">
      <p className="pannello-titolo">{etichetta}</p>
      <p className="display mt-0.5 text-2xl leading-tight">{nome}</p>
      {inglese && <p className="mt-0.5 text-xs italic text-grafite">sulla slide: {inglese}</p>}
      {children}
    </div>
  );
}

function Cursore({ etichetta, valore, min = 0, max = 100, onCambia, sotto }: { etichetta: string; valore: number; min?: number; max?: number; onCambia: (n: number) => void; sotto?: [string, string] }) {
  return (
    <label className="block">
      {etichetta}
      <input type="range" min={min} max={max} value={valore} onChange={(e) => onCambia(Number(e.target.value))} className="w-full accent-[#c9552a]" />
      {sotto && (
        <span className="flex justify-between text-[0.7rem] text-grafite">
          <span>{sotto[0]}</span>
          <span>{sotto[1]}</span>
        </span>
      )}
    </label>
  );
}

function Didascalia({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-[0.72rem] leading-snug text-grafite">{children}</p>;
}

// ---------------------------------------------------------------------------
// Il metodo: le domande della lezione 5, una alla volta
// ---------------------------------------------------------------------------

type Nodo =
  | { domanda: string; aiuto?: string; scelte: { testo: string; dettaglio: string; va: string }[] }
  | { esito: string; testo: string; vista?: Vista; bottone?: string };

const NODI: Record<string, Nodo> = {
  inizio: {
    domanda: "Com'è la tessitura?",
    aiuto: "La prima osservazione: come sono disposti cristalli e pasta di fondo.",
    scelte: [
      { testo: "Olocristallina", dettaglio: "Tutta cristalli, visibili a occhio nudo", va: "intrusiva" },
      { testo: "Porfirica", dettaglio: "Fenocristalli in una pasta di fondo fine o vetrosa", va: "porfirica" },
      { testo: "Micro o criptocristallina", dettaglio: "Grana finissima, nessun fenocristallo", va: "micro" },
      { testo: "Vetrosa", dettaglio: "Niente cristalli: vetro, schiuma o frammenti", va: "vetrosa" },
    ],
  },
  intrusiva: {
    domanda: "Roccia intrusiva. Quanti femici (minerali scuri)?",
    aiuto: "Olivina, pirosseni, anfiboli, biotite. È la prima stima da fare.",
    scelte: [
      { testo: "90% o più", dettaglio: "Quasi tutta scura o verde oliva", va: "ultra" },
      { testo: "Meno del 90%", dettaglio: "Ci sono minerali chiari: quarzo, feldspati, feldspatoidi", va: "streckeisen" },
    ],
  },
  ultra: { esito: "Ultrafemica", testo: "Si usa il triangolo olivina, ortopirosseno, clinopirosseno. Tre nomi fondamentali: dunite (olivina ≥ 90%), peridotite (40–90%), pirossenite (sotto il 40%).", vista: "ultrafemiche", bottone: "Apri il triangolo delle ultrafemiche" },
  streckeisen: {
    domanda: "Streckeisen per le intrusive. Vedi quarzo o feldspatoidi?",
    aiuto: "Si escludono a vicenda: o uno, o l'altro, o nessuno dei due.",
    scelte: [
      { testo: "Quarzo", dettaglio: "Grigio vetroso, senza sfaldatura", va: "int-q" },
      { testo: "Feldspatoidi", dettaglio: "Bianchi e tondeggianti", va: "int-f" },
      { testo: "Nessuno dei due", dettaglio: "Solo feldspati e femici", va: "int-0" },
    ],
  },
  "int-q": { esito: "Triangolo superiore, Q ≥ 20%", testo: "Se il quarzo si vede, conta almeno il 20%: roccia sovrassatura in silice. Ora stima feldspati alcalini (A) e plagioclasi (P) e incrocia: tra 20 e 60% di quarzo cadi nei graniti, granodioriti, tonaliti.", vista: "intrusive", bottone: "Apri lo Streckeisen delle intrusive" },
  "int-f": { esito: "Triangolo inferiore", testo: "Ci sono feldspatoidi: niente quarzo, roccia sottosatura. Stessa logica del triangolo superiore, con F al posto di Q.", vista: "intrusive", bottone: "Apri lo Streckeisen delle intrusive" },
  "int-0": { esito: "Vicino alla linea A–P", testo: "Quarzo sotto il 20%: roccia satura. Decidono A e P (sienite, monzonite, diorite…). Attenzione: il quarzo potrebbe esserci in cristalli troppo piccoli da vedere. Nella casella diorite / gabbro / anortosite decide il femico.", vista: "intrusive", bottone: "Apri lo Streckeisen delle intrusive" },
  porfirica: {
    domanda: "Effusiva porfirica: si ragiona solo sui fenocristalli. Tra i fenocristalli vedi quarzo o feldspatoidi?",
    aiuto: "La pasta di fondo non si conta: a occhio non se ne sa la composizione.",
    scelte: [
      { testo: "Quarzo", dettaglio: "Anche poco", va: "eff-q" },
      { testo: "Feldspatoidi", dettaglio: "Bianchi, globulari", va: "eff-f" },
      { testo: "Nessuno dei due", dettaglio: "Feldspati, pirosseni, olivina", va: "eff-0" },
    ],
  },
  "eff-q": { esito: "Triangolo superiore delle effusive", testo: "Quarzo tra i fenocristalli: sovrassatura. Riolite (equivalente del granito) o dacite secondo A e P. «Anche se è poco, gli vogliamo bene.»", vista: "effusive", bottone: "Apri lo Streckeisen delle effusive" },
  "eff-f": { esito: "Triangolo inferiore delle effusive", testo: "Feldspatoidi tra i fenocristalli: fonoliti, tefriti, basaniti. Olivina oltre il 10% = basanite, sotto = tefrite.", vista: "effusive", bottone: "Apri lo Streckeisen delle effusive" },
  "eff-0": { esito: "Vicino alla linea A–P", testo: "Trachite, latite o basalto / andesite secondo A e P. Basalto e andesite a occhio quasi non si distinguono: aiuta un po' l'indice di colore. Il nome rigoroso lo dà il laboratorio.", vista: "effusive", bottone: "Apri lo Streckeisen delle effusive" },
  micro: { esito: "A occhio nudo ci si ferma", testo: "Effusiva senza fenocristalli: non si classifica sul campione a mano. Si annota l'indice di colore (scura = probabilmente femica) e si porta in laboratorio." },
  vetrosa: {
    domanda: "Roccia vetrosa. È fatta di frammenti?",
    scelte: [
      { testo: "Sì, frammenti", dettaglio: "Clasti di varie dimensioni, cementati o sciolti", va: "piro" },
      { testo: "No, un pezzo unico", dettaglio: "Vetro compatto o schiuma", va: "nonframm" },
    ],
  },
  piro: { esito: "Piroclastite", testo: "Si classifica per granulometria, come una sedimentaria clastica: stima blocchi e bombe (> 64 mm), lapilli (2–64 mm), ceneri (< 2 mm).", vista: "vetrose", bottone: "Apri il triangolo delle piroclastiti" },
  nonframm: {
    domanda: "Quante vescicole?",
    aiuto: "Le vescicole sono i vuoti lasciati dai gas.",
    scelte: [
      { testo: "Praticamente nessuna", dettaglio: "Vetro nero lucido, frattura concoide", va: "ossidiana" },
      { testo: "Meno della metà", dettaglio: "Scura, ruvida, piena di bollicine", va: "scoria" },
      { testo: "Almeno metà del volume", dettaglio: "Leggerissima, chiara: galleggia", va: "pomice" },
    ],
  },
  ossidiana: { esito: "Ossidiana", testo: vetrosaDa(0).testo },
  scoria: { esito: "Scoria", testo: `${vetrosaDa(30).testo} Attenzione: se oltre alle vescicole vedi fenocristalli, è una porfirica e non una scoria.` },
  pomice: { esito: "Pomice", testo: vetrosaDa(70).testo },
};

function Metodo({ apri }: { apri: (v: Vista) => void }) {
  const [percorso, setPercorso] = useState<{ nodo: string; scelta: string }[]>([]);
  const idAttuale = percorso.length === 0 ? "inizio" : (NODI[percorso.at(-1)!.nodo] as Extract<Nodo, { scelte: unknown }>).scelte.find((s) => s.testo === percorso.at(-1)!.scelta)!.va;
  const nodo = NODI[idAttuale];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="pannello p-5">
        {percorso.length > 0 && (
          <ol className="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
            {percorso.map((p, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <button type="button" onClick={() => setPercorso(percorso.slice(0, i))} className="rounded-full border border-filetto px-2.5 py-0.5 text-grafite transition hover:border-grafite hover:text-inchiostro" title="Torna a questa domanda">
                  {p.scelta}
                </button>
                <span className="text-grafite">→</span>
              </li>
            ))}
          </ol>
        )}
        {"domanda" in nodo ? (
          <div key={idAttuale} className="entra-girando">
            <p className="pannello-titolo">Passo {percorso.length + 1}</p>
            <p className="display mt-1 text-2xl leading-tight">{nodo.domanda}</p>
            {nodo.aiuto && <p className="mt-1 text-sm text-grafite">{nodo.aiuto}</p>}
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {nodo.scelte.map((s) => (
                <button key={s.testo} type="button" onClick={() => setPercorso([...percorso, { nodo: idAttuale, scelta: s.testo }])} className="rounded-[0.7rem] border border-filetto px-4 py-3 text-left transition hover:border-[#a8643c] hover:bg-white/[0.03]">
                  <span className="block font-semibold">{s.testo}</span>
                  <span className="block text-sm text-grafite">{s.dettaglio}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div key={idAttuale} className="entra-girando">
            <p className="pannello-titolo">Risultato</p>
            <p className="display mt-1 text-2xl leading-tight">{nodo.esito}</p>
            <p className="mt-2 max-w-2xl text-[0.95rem] leading-snug">{nodo.testo}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {nodo.vista && (
                <button type="button" onClick={() => apri(nodo.vista!)} className="sans rounded-md bg-lava px-3 py-1.5 text-sm font-medium text-white">
                  {nodo.bottone}
                </button>
              )}
              <button type="button" onClick={() => setPercorso([])} className="sans rounded-md border border-filetto px-3 py-1.5 text-sm hover:bg-white/5">
                Ricomincia
              </button>
            </div>
          </div>
        )}
      </div>
      <aside className="pannello self-start p-4 text-sm">
        <p className="pannello-titolo">Il protocollo, in breve</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-4 leading-snug">
          <li>
            <b>Tessitura</b>: olocristallina = intrusiva; porfirica, micro o criptocristallina = effusiva; oppure vetrosa.
          </li>
          <li>
            <b>Femici</b>: dal 90% in su, triangolo delle ultrafemiche; sotto, Streckeisen.
          </li>
          <li>
            <b>Quarzo o feldspatoidi</b>: decidono il triangolo, superiore o inferiore.
          </li>
          <li>
            <b>A e P</b>: si stimano e si incrociano con Q (o F) per trovare il campo.
          </li>
          <li>
            <b>Femico accessorio</b>: serve solo nelle caselle con più nomi.
          </li>
        </ol>
        <p className="mt-3 text-xs leading-snug text-grafite">Un'effusiva si classifica in modo rigoroso solo in laboratorio: sul campione a mano si dà un primo nome.</p>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Le viste dei diagrammi
// ---------------------------------------------------------------------------

function VistaQapf({ tipo, v, r, setV, setR }: { tipo: "intrusive" | "effusive"; v: number; r: number; setV: (n: number) => void; setR: (n: number) => void }) {
  const campi = tipo === "intrusive" ? INTRUSIVE : EFFUSIVE;
  const altri = tipo === "intrusive" ? EFFUSIVE : INTRUSIVE;
  const c = campoQapf(campi, v, r);
  const eq = campoQapf(altri, v, r);
  const k = componentiQapf(v, r);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="pannello p-3 sm:p-4">
        <Rombo campi={campi} tratteggi={tipo === "intrusive" ? TRATTEGGI_INTRUSIVE : TRATTEGGI_EFFUSIVE} v={v} r={r} onPunta={(a, b) => (setV(a), setR(b))} evidenzia={c} />
        <Didascalia>
          {tipo === "intrusive"
            ? "Femici sotto il 90%. Q, A, P (o F, A, P) riportati a 100. In verticale quarzo o feldspatoidi, in orizzontale P/(A+P)."
            : "Solo con tessitura porfirica: le percentuali si stimano sui fenocristalli. Meno suddivisioni che per le intrusive."}{" "}
          Trascina il punto.
        </Didascalia>
      </div>
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Scheda etichetta={tipo === "intrusive" ? "Intrusiva" : "Effusiva"} nome={c.nome} inglese={c.inglese}>
          <p className="mt-3 text-sm tabular-nums">
            {k.q > 0 ? `Q ${k.q}` : k.f > 0 ? `F ${k.f}` : "Q 0"} · A {k.a} · P {k.p} <span className="text-grafite">· P/(A+P) = {r}%</span>
          </p>
          {c.nota && <p className="mt-2 text-sm leading-snug text-grafite">{c.nota}</p>}
          {eq.breve !== "—" && (
            <p className="mt-3 border-t border-filetto pt-2 text-sm">
              <span className="text-grafite">{tipo === "intrusive" ? "Equivalente effusivo" : "Equivalente intrusivo"}: </span>
              <b>{eq.nome}</b>
            </p>
          )}
        </Scheda>
        <div className="pannello space-y-3 p-4 text-sm">
          <Cursore etichetta={v >= 0 ? `Quarzo Q: ${v}%` : `Feldspatoidi F: ${-v}%`} valore={v} min={-100} max={100} onCambia={setV} sotto={["← feldspatoidi", "quarzo →"]} />
          <Cursore etichetta={`Plagioclasi sul totale dei feldspati, P/(A+P): ${r}%`} valore={r} onCambia={setR} sotto={["← alcalini", "plagioclasi →"]} />
          <p className="text-[0.75rem] leading-snug text-grafite">
            {tipo === "intrusive" ? "Se vedi il quarzo conta almeno il 20%: roccia sovrassatura. Quarzo e feldspatoidi non stanno mai insieme." : "Se il quarzo c'è come fenocristallo, anche poco, la roccia è sovrassatura."}
          </p>
        </div>
      </div>
    </div>
  );
}

function VistaUltrafemiche() {
  const [t, setT] = useState<Terna>([60, 30, 10]);
  const c = ULTRAFEMICHE.classifica(t);
  const px = t[1] + t[2];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="pannello p-3 sm:p-4">
        <Triangolo tern={ULTRAFEMICHE} punto={t} onPunta={setT} evidenzia={c} colori={COLORI_ULTRA} />
        <Didascalia>Femici al 90% o più. Le linee a 90, 40 e 10% di olivina separano duniti, peridotiti e pirosseniti; le strisce lungo i lati sono al 5%. A occhio nudo i due pirosseni si ragionano insieme. Trascina il punto.</Didascalia>
      </div>
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Scheda etichetta={`Ultrafemica · ${c.gruppo}`} nome={c.nome} inglese={c.inglese}>
          <p className="mt-3 text-sm tabular-nums">
            Olivina {t[0]} · ortopirosseno {t[1]} · clinopirosseno {t[2]}
          </p>
          {c.nota && <p className="mt-2 text-sm leading-snug text-grafite">{c.nota}</p>}
          <p className="mt-3 border-t border-filetto pt-2 text-sm">
            <b>{c.gruppo}</b> <span className="text-grafite">· {GRUPPI_ULTRA[c.gruppo!]}</span>
          </p>
        </Scheda>
        <div className="pannello space-y-3 p-4 text-sm">
          <Cursore etichetta={`Olivina: ${t[0]}%`} valore={t[0]} onCambia={(ol) => {
            const resto = 100 - ol;
            const quota = px > 0 ? t[2] / px : 0.5;
            const cpx = Math.round(resto * quota);
            setT([ol, resto - cpx, cpx]);
          }} />
          <Cursore etichetta={`Clinopirosseno sul totale dei pirosseni: ${px > 0 ? Math.round((t[2] / px) * 100) : 50}%`} valore={px > 0 ? Math.round((t[2] / px) * 100) : 50} onCambia={(q) => {
            const resto = 100 - t[0];
            const cpx = Math.round((resto * q) / 100);
            setT([t[0], resto - cpx, cpx]);
          }} sotto={["← ortopirosseno", "clinopirosseno →"]} />
        </div>
      </div>
    </div>
  );
}

function VistaVetrose() {
  const [vescicole, setVescicole] = useState(65);
  const [t, setT] = useState<Terna>([15, 30, 55]);
  const v = vetrosaDa(vescicole);
  const c = PIROCLASTITI.classifica(t);
  return (
    <div className="space-y-6">
      <section>
        <div className="sezione-titolo !mt-0">
          <h2>Non frammentarie</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="pannello p-5">
            <p className="text-sm text-grafite">Quante vescicole, sul volume della roccia?</p>
            <div className="relative mt-3 h-10 overflow-hidden rounded-md border border-filetto">
              <div className="absolute inset-y-0 left-0 flex items-center justify-center bg-[#2f2622] text-[0.68rem] text-grafite" style={{ width: "3%" }} title="Ossidiana" />
              <div className="absolute inset-y-0 flex items-center justify-center bg-[#3a2b24] text-xs text-grafite" style={{ left: "3%", width: "47%" }}>
                scoria
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center justify-center bg-[#4a3a30] text-xs text-grafite" style={{ width: "50%" }}>
                pomice
              </div>
              <div className="absolute inset-y-0 w-0.5 bg-[#e07a4a]" style={{ left: `${vescicole}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[0.7rem] text-grafite">
              <span>0 · ossidiana</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <input type="range" min={0} max={90} value={vescicole} onChange={(e) => setVescicole(Number(e.target.value))} className="mt-3 w-full accent-[#c9552a]" aria-label="Vescicole in percentuale" />
          </div>
          <Scheda etichetta={`Vetrosa non frammentaria · vescicole ${vescicole}%`} nome={v.nome}>
            <p className="mt-2 text-sm leading-snug text-grafite">{v.testo}</p>
          </Scheda>
        </div>
      </section>

      <section>
        <div className="sezione-titolo">
          <h2>Frammentarie: le piroclastiti</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="pannello p-3 sm:p-4">
            <Triangolo tern={PIROCLASTITI} punto={t} onPunta={setT} evidenzia={c} colori={COLORI_PIRO} />
            <Didascalia>Classificazione granulometrica, come per le sedimentarie clastiche. Linee a 75% e 25% di blocchi, a 75% di lapilli e di ceneri. Trascina il punto.</Didascalia>
          </div>
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Scheda etichetta="Piroclastite" nome={c.nome} inglese={c.inglese}>
              <p className="mt-3 text-sm tabular-nums">
                Blocchi e bombe {t[0]} · lapilli {t[1]} · ceneri {t[2]}
              </p>
              {c.nota && <p className="mt-2 text-sm leading-snug text-grafite">{c.nota}</p>}
            </Scheda>
            <div className="pannello p-4">
              <p className="pannello-titolo">Se si capisce come si è messa in posto</p>
              <dl className="mt-2 space-y-2 text-sm">
                {GENETICI.map((g) => (
                  <div key={g.nome}>
                    <dt className="font-semibold">{g.nome}</dt>
                    <dd className="leading-snug text-grafite">{g.testo}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Classifica tu: domande miste da tutti i diagrammi
// ---------------------------------------------------------------------------

interface Domanda {
  tipo: string;
  testo: string;
  giusta: string;
  opzioni: string[];
  spiegazione: string;
  figura?: (rivela: boolean) => React.ReactNode;
}

const SCENARI: { testo: string; giusta: string }[] = [
  { testo: "Olocristallina, chiara, quarzo ben visibile, femici circa 10%.", giusta: "Streckeisen intrusive, triangolo superiore" },
  { testo: "Olocristallina, cristalli centimetrici, niente quarzo né feldspatoidi, femici 40%.", giusta: "Streckeisen intrusive, vicino alla linea A–P" },
  { testo: "Olocristallina, verde scuro, quasi solo olivina e pirosseni.", giusta: "Triangolo delle ultrafemiche" },
  { testo: "Fenocristalli bianchi e globulari in una pasta di fondo grigia, con vescicole.", giusta: "Streckeisen effusive, triangolo inferiore" },
  { testo: "Porfirica, tra i fenocristalli c'è un po' di quarzo.", giusta: "Streckeisen effusive, triangolo superiore" },
  { testo: "Frammenti da pochi millimetri a 10 cm in una matrice di cenere.", giusta: "Triangolo granulometrico delle piroclastiti" },
  { testo: "Grana finissima, scura, nessun fenocristallo.", giusta: "Nessuno: a occhio nudo ci si ferma" },
  { testo: "Vetro nero lucido, frattura concoide, nessuna vescicola.", giusta: "Nessun triangolo: vetrosa non frammentaria" },
];
const RISPOSTE_SCENARI = [...new Set(SCENARI.map((s) => s.giusta))];

function dentroQapf(c: CampoQapf) {
  const v = Math.round(c.v[0] + (0.2 + Math.random() * 0.6) * (c.v[1] - c.v[0]));
  const r = Math.round(c.r[0] + (0.2 + Math.random() * 0.6) * (c.r[1] - c.r[0]));
  return { v, r };
}
function dentroTernario(tern: Ternario, c: CampoTernario): Terna {
  for (let i = 0; i < 2000; i++) {
    const a = Math.random() * 100;
    const b = Math.random() * (100 - a);
    const t: Terna = [Math.round(a), Math.round(b), 100 - Math.round(a) - Math.round(b)];
    if (t[2] >= 0 && tern.classifica(t) === c) return t;
  }
  return c.poligono[0];
}
const opzioniDa = (giusta: string, tutte: string[]) => mescola([giusta, ...mescola(tutte.filter((n) => n !== giusta)).slice(0, 3)]);

function generaDomande(): Domanda[] {
  const tipi = mescola(["intrusive", "intrusive", "effusive", "effusive", "ultrafemiche", "ultrafemiche", "piroclastiti", "vetrose", "metodo", "metodo"]);
  return tipi.map((tipo): Domanda => {
    if (tipo === "intrusive" || tipo === "effusive") {
      const campi = tipo === "intrusive" ? INTRUSIVE : EFFUSIVE;
      const scelte = campi.filter((c) => c.breve !== "—" && c.v[0] < 60);
      const c = scelte[Math.floor(Math.random() * scelte.length)];
      const { v, r } = dentroQapf(c);
      const k = componentiQapf(v, r);
      const stessaMeta = scelte.filter((x) => Math.sign(x.v[0] + x.v[1]) === Math.sign(c.v[0] + c.v[1]));
      return {
        tipo,
        testo: `${tipo === "intrusive" ? "Intrusiva, femici sotto il 90%" : "Effusiva porfirica, stime sui fenocristalli"}. Normalizzati a 100: ${k.q ? `Q ${k.q}` : `F ${k.f}`} · A ${k.a} · P ${k.p}. Che roccia è?`,
        giusta: c.nome,
        opzioni: opzioniDa(c.nome, stessaMeta.map((x) => x.nome)),
        spiegazione: `${k.q ? `Q ${k.q}%` : `F ${k.f}%`} e P/(A+P) = ${Math.round((k.p / Math.max(1, k.a + k.p)) * 100)}%: campo ${c.nome}.${c.nota ? ` ${c.nota}` : ""}`,
        figura: (rivela) => <Rombo campi={campi} tratteggi={tipo === "intrusive" ? TRATTEGGI_INTRUSIVE : TRATTEGGI_EFFUSIVE} v={v} r={r} evidenzia={rivela ? c : undefined} />,
      };
    }
    if (tipo === "ultrafemiche" || tipo === "piroclastiti") {
      const tern = tipo === "ultrafemiche" ? ULTRAFEMICHE : PIROCLASTITI;
      const c = tern.campi[Math.floor(Math.random() * tern.campi.length)];
      const t = dentroTernario(tern, c);
      return {
        tipo,
        testo: tipo === "ultrafemiche" ? `Intrusiva, femici al 95%: olivina ${t[0]} · ortopirosseno ${t[1]} · clinopirosseno ${t[2]}. Che roccia è?` : `Piroclastite consolidata: blocchi e bombe ${t[0]} · lapilli ${t[1]} · ceneri ${t[2]}. Che roccia è?`,
        giusta: c.nome,
        opzioni: opzioniDa(c.nome, tern.campi.map((x) => x.nome)),
        spiegazione: `${c.nome}${c.gruppo ? ` (${c.gruppo.toLowerCase()})` : ""}. ${c.nota ?? ""}`,
        figura: (rivela) => <Triangolo tern={tern} punto={t} evidenzia={rivela ? c : undefined} colori={tipo === "ultrafemiche" ? COLORI_ULTRA : COLORI_PIRO} />,
      };
    }
    if (tipo === "vetrose") {
      const ves = [0, 15 + Math.floor(Math.random() * 30), 55 + Math.floor(Math.random() * 30)][Math.floor(Math.random() * 3)];
      const v = vetrosaDa(ves);
      return { tipo, testo: `Vetrosa non frammentaria, vescicole ${ves === 0 ? "praticamente assenti" : `circa ${ves}% del volume`}. Che roccia è?`, giusta: v.nome, opzioni: mescola(["Ossidiana", "Scoria", "Pomice", "Tufo"]), spiegazione: v.testo };
    }
    const s = SCENARI[Math.floor(Math.random() * SCENARI.length)];
    return { tipo, testo: `Quale diagramma usi? ${s.testo}`, giusta: s.giusta, opzioni: opzioniDa(s.giusta, RISPOSTE_SCENARI), spiegazione: "Prima la tessitura, poi i femici, poi quarzo o feldspatoidi: è il protocollo della lezione 5." };
  });
}

function Prova() {
  const [domande, setDomande] = useState(generaDomande);
  const [i, setI] = useState(0);
  const [ris, setRis] = useState<string | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const pieno = "sans rounded-md px-3 py-1.5 text-sm font-medium bg-lava text-white";
  if (i >= domande.length)
    return (
      <div className="pannello entra-girando p-5">
        <p className="pannello-titolo">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {domande.length}</span>
        </p>
        <button type="button" className={`${pieno} mt-4`} onClick={() => (setDomande(generaDomande()), setI(0), setEsiti([]), setRis(null))}>
          Altre domande
        </button>
      </div>
    );
  const d = domande[i];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="pannello p-3 sm:p-4">
        {d.figura ? (
          d.figura(!!ris)
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center">
            <svg className="h-24 w-24 text-[#e3b08c] opacity-50" aria-hidden="true">
              <use href={d.tipo === "metodo" ? "#strati" : "#cristallo"} />
            </svg>
          </div>
        )}
      </div>
      <div>
        <p className="sans text-xs text-grafite">
          {i + 1} / {domande.length}
        </p>
        <div key={i} className={`pannello entra-girando relative mt-2 p-4 ${ris ? (ris === d.giusta ? "bagliore" : "crepa") : ""}`}>
          <p className="text-[1.02rem] leading-snug">{d.testo}</p>
          <ol className="mt-3 space-y-1.5">
            {d.opzioni.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  disabled={!!ris}
                  onClick={() => (setRis(o), setEsiti((e) => [...e, o === d.giusta]))}
                  className={`w-full rounded-md border px-3 py-2 text-left text-[0.92rem] ${ris ? (o === d.giusta ? "border-muschio bg-muschio/15" : o === ris ? "border-lava bg-lava/15" : "border-filetto") : "border-filetto hover:border-grafite"}`}
                >
                  {o}
                </button>
              </li>
            ))}
          </ol>
        </div>
        {ris && (
          <div className="mt-3">
            <p className="text-sm leading-snug">{d.spiegazione}</p>
            <button
              type="button"
              className={`${pieno} mt-3`}
              onClick={() => {
                if (i + 1 >= domande.length) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "geologia-1/magmatiche", correct: esiti.filter(Boolean).length, total: domande.length }] }));
                setI(i + 1);
                setRis(null);
              }}
            >
              {i + 1 < domande.length ? "Prossima" : "Chiudi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Glossario
// ---------------------------------------------------------------------------

function Glossario({ gruppi }: { gruppi: GruppoGlossario[] }) {
  const [cerca, setCerca] = useState("");
  const parole = cerca.toLowerCase().split(/\s+/).filter(Boolean);
  const filtrati = gruppi
    .map((g) => ({ ...g, voci: g.voci.filter((v) => parole.every((p) => `${v.termine} ${v.definizione}`.toLowerCase().includes(p))) }))
    .filter((g) => g.voci.length > 0);
  return (
    <section className="mt-8">
      <div className="sezione-titolo">
        <h2>Glossario dei termini</h2>
        <input type="search" value={cerca} onChange={(e) => setCerca(e.target.value)} placeholder="Cerca un termine" className="w-48 rounded-md border border-filetto bg-transparent px-3 py-1 text-sm outline-none focus:border-grafite" />
      </div>
      {filtrati.length === 0 && <p className="text-sm text-grafite">Nessun termine trovato.</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtrati.map((g) => (
          <div key={g.titolo} className="pannello p-4">
            <p className="pannello-titolo">{g.titolo}</p>
            <dl className="mt-2 divide-y divide-filetto">
              {g.voci.map((v) => (
                <div key={v.termine} className="py-2">
                  <dt className="font-semibold leading-tight">{v.termine}</dt>
                  <dd className="mt-0.5 text-[0.86rem] leading-snug text-grafite">{v.definizione}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function Magmatiche({ glossario }: { glossario: GruppoGlossario[] }) {
  const [vista, setVistaStato] = useState<Vista>("metodo");
  // La vista sta anche nell'indirizzo (/qap#effusive): si può collegare dalle lezioni.
  useEffect(() => {
    const h = location.hash.slice(1) as Vista;
    if (VISTE.some((x) => x.id === h)) setVistaStato(h);
  }, []);
  const setVista = (x: Vista) => {
    setVistaStato(x);
    history.replaceState(history.state, "", `#${x}`);
  };
  const [v, setV] = useState(35);
  const [r, setR] = useState(25);
  const contenuto = useMemo(() => {
    switch (vista) {
      case "metodo":
        return <Metodo apri={setVista} />;
      case "ultrafemiche":
        return <VistaUltrafemiche />;
      case "intrusive":
      case "effusive":
        return <VistaQapf tipo={vista} v={v} r={r} setV={setV} setR={setR} />;
      case "vetrose":
        return <VistaVetrose />;
      case "prova":
        return <Prova />;
    }
  }, [vista, v, r]);
  return (
    <div>
      <div className="segmentato">
        {VISTE.map((m) => (
          <button key={m.id} type="button" onClick={() => setVista(m.id)} aria-pressed={vista === m.id}>
            {m.nome}
          </button>
        ))}
      </div>
      <div className="mt-4">{contenuto}</div>
      <Glossario gruppi={glossario} />
    </div>
  );
}
