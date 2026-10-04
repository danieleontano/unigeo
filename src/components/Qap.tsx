import { useMemo, useRef, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";

// Il diagramma QAPF di Streckeisen (IUGS) completo, a rombo: in alto il
// triangolo Q-A-P (con quarzo), in basso F-A-P (con feldspatoidi). Quarzo e
// feldspatoidi non convivono, quindi un solo valore con segno: v > 0 è %Q,
// v < 0 è %F. In orizzontale il rapporto P/(A+P).
// Fasce: Q 5, 20, 60, 90; F 10, 60. Colonne: 10, 35, 65, 90 (sopra e nella
// fascia F 0–10), 10, 50, 90 (nella fascia F 10–60).

type Campo = {
  /** Intervallo del valore con segno: positivo = %Q, negativo = %F. */
  v: [number, number];
  r: [number, number];
  intrusiva: string;
  effusiva: string;
  /** Etichetta corta dentro il diagramma. */
  breve?: string;
};

const CAMPI: Campo[] = [
  { v: [90, 100], r: [0, 100], intrusiva: "Quarzolite", effusiva: "—" },
  { v: [60, 90], r: [0, 100], intrusiva: "Granitoidi ricchi in quarzo", effusiva: "—", breve: "Granitoidi ricchi in Q" },
  { v: [20, 60], r: [0, 10], intrusiva: "Granito a feldspato alcalino", effusiva: "Riolite a feldspato alcalino" },
  { v: [20, 60], r: [10, 35], intrusiva: "Sienogranito", effusiva: "Riolite" },
  { v: [20, 60], r: [35, 65], intrusiva: "Monzogranito", effusiva: "Riolite" },
  { v: [20, 60], r: [65, 90], intrusiva: "Granodiorite", effusiva: "Dacite" },
  { v: [20, 60], r: [90, 100], intrusiva: "Tonalite", effusiva: "Dacite" },
  { v: [5, 20], r: [0, 10], intrusiva: "Quarzosienite a feldspato alcalino", effusiva: "Quarzotrachite a feldspato alcalino" },
  { v: [5, 20], r: [10, 35], intrusiva: "Quarzosienite", effusiva: "Quarzotrachite", breve: "Q-sienite" },
  { v: [5, 20], r: [35, 65], intrusiva: "Quarzomonzonite", effusiva: "Quarzolatite", breve: "Q-monzonite" },
  { v: [5, 20], r: [65, 90], intrusiva: "Quarzomonzodiorite / quarzomonzogabbro", effusiva: "Andesite / basalto", breve: "Q-monzodiorite" },
  { v: [5, 20], r: [90, 100], intrusiva: "Quarzodiorite / quarzogabbro / quarzoanortosite", effusiva: "Andesite / basalto" },
  { v: [0, 5], r: [0, 10], intrusiva: "Sienite a feldspato alcalino", effusiva: "Trachite a feldspato alcalino" },
  { v: [0, 5], r: [10, 35], intrusiva: "Sienite", effusiva: "Trachite" },
  { v: [0, 5], r: [35, 65], intrusiva: "Monzonite", effusiva: "Latite" },
  { v: [0, 5], r: [65, 90], intrusiva: "Monzodiorite / monzogabbro", effusiva: "Andesite / basalto", breve: "Monzodiorite" },
  { v: [0, 5], r: [90, 100], intrusiva: "Diorite / gabbro / anortosite", effusiva: "Andesite / basalto" },
  // Parte inferiore: feldspatoidi (leucite, nefelina, sodalite…)
  { v: [-10, 0], r: [0, 10], intrusiva: "Sienite a feldspato alcalino con feldspatoidi", effusiva: "Trachite a feldspato alcalino con feldspatoidi" },
  { v: [-10, 0], r: [10, 35], intrusiva: "Sienite con feldspatoidi", effusiva: "Trachite con feldspatoidi", breve: "Sienite c. foidi" },
  { v: [-10, 0], r: [35, 65], intrusiva: "Monzonite con feldspatoidi", effusiva: "Latite con feldspatoidi", breve: "Monzonite c. foidi" },
  { v: [-10, 0], r: [65, 90], intrusiva: "Monzodiorite / monzogabbro con feldspatoidi", effusiva: "Basalto / andesite con feldspatoidi", breve: "Monzogabbro c. foidi" },
  { v: [-10, 0], r: [90, 100], intrusiva: "Diorite / gabbro con feldspatoidi", effusiva: "Basalto / andesite con feldspatoidi" },
  { v: [-60, -10], r: [0, 10], intrusiva: "Sienite a feldspatoidi", effusiva: "Fonolite" },
  { v: [-60, -10], r: [10, 50], intrusiva: "Monzosienite a feldspatoidi", effusiva: "Fonolite tefritica", breve: "Monzosienite a foidi" },
  { v: [-60, -10], r: [50, 90], intrusiva: "Monzodiorite / monzogabbro a feldspatoidi", effusiva: "Basanite / tefrite fonolitica", breve: "Monzogabbro a foidi" },
  { v: [-60, -10], r: [90, 100], intrusiva: "Diorite / gabbro a feldspatoidi", effusiva: "Basanite / tefrite" },
  { v: [-100, -60], r: [0, 100], intrusiva: "Foidolite", effusiva: "Foidite" },
];

const W = 520;
const H = Math.round((W * Math.sqrt(3)) / 2);
const M = 26;
const A = { x: M, y: H + M };
const P = { x: W + M, y: H + M };
const Q = { x: W / 2 + M, y: M };
const F = { x: W / 2 + M, y: 2 * H + M };

/** Punto del rombo dal valore con segno (Q o F) e dal rapporto P/(A+P) in %. */
function punto(v: number, r: number) {
  const apice = v >= 0 ? Q : F;
  const t = Math.abs(v) / 100;
  const sx = { x: A.x + t * (apice.x - A.x), y: A.y + t * (apice.y - A.y) };
  const dx = { x: P.x + t * (apice.x - P.x), y: P.y + t * (apice.y - P.y) };
  return { x: sx.x + (r / 100) * (dx.x - sx.x), y: sx.y + (r / 100) * (dx.y - sx.y) };
}
function campoDi(v: number, r: number): Campo {
  return CAMPI.find((c) => v >= c.v[0] && v <= c.v[1] && r >= c.r[0] && r <= c.r[1]) ?? CAMPI[0];
}
const poligono = (c: Campo) => [punto(c.v[0], c.r[0]), punto(c.v[0], c.r[1]), punto(c.v[1], c.r[1]), punto(c.v[1], c.r[0])].map((p) => `${p.x},${p.y}`).join(" ");
// Sopra le sabbie calde del quarzo, sotto i grigi-verdi dei feldspatoidi.
const COLORE: Record<string, string> = { "0": "#efe2c4", "5": "#e9d3b0", "20": "#e6c59f", "60": "#dcd2c0", "90": "#d6cdbd", "-10": "#e1e4d2", "-60": "#d3dbc6", "-100": "#c7d1ba" };

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** «Q 35» oppure «F 20»: la terza componente, quella che manca ad A e P. */
const terzo = (v: number) => (v >= 0 ? `Q ${v}` : `F ${-v}`);

function Rombo({ v, r, onPunta, evidenzia }: { v: number; r: number; onPunta?: (v: number, r: number) => void; evidenzia?: Campo }) {
  const svg = useRef<SVGSVGElement>(null);
  const trascina = useRef(false);

  function daEvento(e: React.PointerEvent) {
    if (!onPunta || !svg.current) return;
    // Coordinate dentro il viewBox anche quando l'SVG è ridotto in altezza.
    const ctm = svg.current.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const sopra = p.y <= A.y;
    const t = Math.max(0, Math.min(1, sopra ? (A.y - p.y) / (A.y - Q.y) : (p.y - A.y) / (F.y - A.y)));
    const apice = sopra ? Q : F;
    const sx = A.x + t * (apice.x - A.x);
    const dx = P.x + t * (apice.x - P.x);
    const rr = dx - sx < 1 ? 50 : Math.max(0, Math.min(100, ((p.x - sx) / (dx - sx)) * 100));
    onPunta(Math.round(t * 100) * (sopra ? 1 : -1), Math.round(rr));
  }

  const pt = punto(v, r);
  const lettera = (testo: string, x: number, y: number, ancora: "start" | "middle" | "end" = "middle") => (
    <text x={x} y={y} textAnchor={ancora} fontSize="16" fontWeight="700" fill="#c9552a" fontFamily="Fraunces, serif">
      {testo}
    </text>
  );
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W + 2 * M} ${2 * H + 2 * M}`}
      className="mx-auto block h-auto max-h-[82vh] w-full touch-none select-none"
      onPointerDown={(e) => {
        trascina.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        daEvento(e);
      }}
      onPointerMove={(e) => trascina.current && daEvento(e)}
      onPointerUp={() => (trascina.current = false)}
    >
      {CAMPI.map((c) => (
        <polygon key={c.intrusiva} points={poligono(c)} fill={evidenzia === c ? "#f3b98a" : COLORE[String(c.v[0])]} stroke="#5a4a3a" strokeWidth="0.8" />
      ))}
      <line x1={A.x} y1={A.y} x2={P.x} y2={P.y} stroke="#3a2d23" strokeWidth="1.6" />
      {/* Etichette solo dove c'è spazio. */}
      {CAMPI.filter((c) => (c.r[1] - c.r[0] >= 25 && c.r[1] - c.r[0] < 100) || c.v[0] >= 60 || c.v[0] === -100).map((c) => {
        const centro = punto((c.v[0] + c.v[1]) / 2, (c.r[0] + c.r[1]) / 2);
        const alta = Math.abs(c.v[1] - c.v[0]);
        const corpo = alta >= 40 ? 10.5 : alta >= 15 ? 8.5 : 6.6;
        return (
          <text key={"t" + c.intrusiva} x={centro.x} y={centro.y + corpo / 3} textAnchor="middle" fontSize={corpo} fontFamily="Poppins, sans-serif" fill="#3a2d23">
            {c.breve ?? c.intrusiva.split(" / ")[0]}
          </text>
        );
      })}
      {lettera("Q", Q.x, Q.y - 8)}
      {lettera("F", F.x, F.y + 20)}
      {lettera("A", A.x - 6, A.y + 5, "end")}
      {lettera("P", P.x + 6, P.y + 5, "start")}
      {[5, 20, 60, 90, -10, -60].map((x) => (
        <text key={x} x={punto(x, 100).x + 6} y={punto(x, 100).y + 3} fontSize="9" fill="#a89a86" fontFamily="Poppins, sans-serif">
          {Math.abs(x)}%
        </text>
      ))}
      {onPunta && (
        <g pointerEvents="none">
          <circle cx={pt.x} cy={pt.y} r="10" fill="#c9552a" opacity="0.25" />
          <circle cx={pt.x} cy={pt.y} r="5" fill="#c9552a" stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

/** Composizione casuale dentro un campo, normalizzata a 100. */
function dentro(c: Campo) {
  const v = Math.round(c.v[0] + (0.2 + Math.random() * 0.6) * (c.v[1] - c.v[0]));
  const r = Math.round(c.r[0] + (0.2 + Math.random() * 0.6) * (c.r[1] - c.r[0]));
  const resto = 100 - Math.abs(v);
  const p = Math.round((resto * r) / 100);
  return { v, a: resto - p, p };
}

function Prova() {
  const candidati = CAMPI.filter((c) => c.v[1] - c.v[0] < 40 || c.v[0] === -100);
  const genera = () =>
    mescola(candidati)
      .slice(0, 10)
      .map((c) => {
        const stessaMeta = candidati.filter((x) => x !== c && Math.sign(x.v[0] + x.v[1]) === Math.sign(c.v[0] + c.v[1]) && x.intrusiva !== c.intrusiva);
        return { c, ...dentro(c), opzioni: mescola([c.intrusiva, ...mescola(stessaMeta).slice(0, 3).map((x) => x.intrusiva)]) };
      });
  const [domande, setDomande] = useState(genera);
  const [i, setI] = useState(0);
  const [ris, setRis] = useState<string | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];
  const bottone = "sans rounded-md px-3 py-1.5 text-sm font-medium bg-lava text-white";

  if (i >= domande.length)
    return (
      <div className="pannello entra-girando p-5">
        <p className="pannello-titolo">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {domande.length}</span>
        </p>
        <button type="button" className={`${bottone} mt-4`} onClick={() => (setDomande(genera()), setI(0), setEsiti([]), setRis(null))}>
          Altri campioni
        </button>
      </div>
    );

  const rapporto = Math.round((d.p / Math.max(1, d.a + d.p)) * 100);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="pannello p-3 sm:p-4">
        <Rombo v={d.v} r={rapporto} evidenzia={ris ? d.c : undefined} />
      </div>
      <div>
        <p className="sans text-xs text-grafite">
          {i + 1} / {domande.length} · roccia intrusiva, femici sotto il 90%
        </p>
        <div key={i} className={`pannello entra-girando relative mt-2 p-4 ${ris ? (ris === d.c.intrusiva ? "bagliore" : "crepa") : ""}`}>
          <p className="text-lg leading-snug">
            Normalizzati a 100: <b>{terzo(d.v)}</b> · <b>A {d.a}</b> · <b>P {d.p}</b>. Che roccia è?
          </p>
          <ol className="mt-3 space-y-1.5">
            {d.opzioni.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  disabled={!!ris}
                  onClick={() => (setRis(o), setEsiti((e) => [...e, o === d.c.intrusiva]))}
                  className={`w-full rounded-md border px-3 py-2 text-left text-[0.95rem] ${ris ? (o === d.c.intrusiva ? "border-muschio bg-muschio/15" : o === ris ? "border-lava bg-lava/15" : "border-filetto") : "border-filetto hover:border-grafite"}`}
                >
                  {o}
                </button>
              </li>
            ))}
          </ol>
        </div>
        {ris && (
          <div className="mt-3">
            <p className="font-sans text-sm">
              {d.v >= 0 ? `Q ${d.v}%` : `F ${-d.v}%`} → fascia {Math.abs(d.c.v[1])}–{Math.abs(d.c.v[0])}; P/(A+P) = {rapporto}% → {d.c.r[0]}–{d.c.r[1]}. Effusiva: {d.c.effusiva}.
            </p>
            <button
              type="button"
              className={`${bottone} mt-3`}
              onClick={() => {
                if (i + 1 >= domande.length) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "geologia-1/qap", correct: esiti.filter(Boolean).length, total: domande.length }] }));
                setI(i + 1);
                setRis(null);
              }}
            >
              {i + 1 < domande.length ? "Prossimo campione" : "Chiudi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Qap() {
  const [modo, setModo] = useState<"esplora" | "prova">("esplora");
  const [v, setV] = useState(35);
  const [r, setR] = useState(25);
  const c = useMemo(() => campoDi(v, r), [v, r]);
  const resto = 100 - Math.abs(v);
  const p = Math.round((resto * r) / 100);
  const a = resto - p;

  return (
    <div>
      <div className="segmentato">
        {(["esplora", "prova"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setModo(m)} aria-pressed={modo === m}>
            {m === "esplora" ? "Esplora il diagramma" : "Classifica tu"}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {modo === "esplora" ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
            <div className="pannello p-3 sm:p-4">
              <Rombo
                v={v}
                r={r}
                evidenzia={c}
                onPunta={(vv, rr) => {
                  setV(vv);
                  setR(rr);
                }}
              />
              <p className="mt-1 text-center font-sans text-[0.7rem] text-grafite">Trascina il punto nel rombo</p>
            </div>
            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <div className="pannello p-4">
                <p className="pannello-titolo">Intrusiva</p>
                <p className="display mt-0.5 text-2xl leading-tight">{c.intrusiva}</p>
                <p className="pannello-titolo mt-3">Effusiva equivalente</p>
                <p className="display mt-0.5 text-xl leading-tight">{c.effusiva}</p>
                <p className="mt-3 font-sans text-sm tabular-nums">
                  {terzo(v)} · A {a} · P {p} <span className="text-grafite">· P/(A+P) = {r}%</span>
                </p>
              </div>
              <div className="pannello space-y-3 p-4 font-sans text-sm">
                <label className="block">
                  {v >= 0 ? `Quarzo Q: ${v}%` : `Feldspatoidi F: ${-v}%`}
                  <input type="range" min={-100} max={100} value={v} onChange={(e) => setV(Number(e.target.value))} className="w-full accent-[#c9552a]" />
                  <span className="flex justify-between text-[0.7rem] text-grafite">
                    <span>← feldspatoidi</span>
                    <span>quarzo →</span>
                  </span>
                </label>
                <label className="block">
                  Plagioclasi sul totale dei feldspati, P/(A+P): {r}%
                  <input type="range" min={0} max={100} value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full accent-[#c9552a]" />
                </label>
                <p className="text-[0.75rem] leading-snug text-grafite">
                  Quarzo e feldspatoidi non stanno mai insieme. Se vedi il quarzo, conta almeno 20%. Nei campi doppi decide il femico: anfibolo = diorite, pirosseno = gabbro, quasi solo plagioclasio = anortosite.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Prova />
        )}
      </div>
    </div>
  );
}
