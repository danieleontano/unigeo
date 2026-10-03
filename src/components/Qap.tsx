import { useMemo, useRef, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";

// Il triangolo QAP di Streckeisen (IUGS), parte superiore: Q quarzo, A
// feldspati alcalini, P plagioclasi, per rocce con femici sotto il 90%.
// Le fasce orizzontali sono la percentuale di Q (5, 20, 60, 90); le linee che
// salgono al vertice Q sono il rapporto P/(A+P) (10, 35, 65, 90%).

type Campo = { q: [number, number]; r: [number, number]; intrusiva: string; effusiva: string };

const CAMPI: Campo[] = [
  { q: [90, 100], r: [0, 100], intrusiva: "Quarzolite", effusiva: "—" },
  { q: [60, 90], r: [0, 100], intrusiva: "Granitoidi ricchi in quarzo", effusiva: "—" },
  { q: [20, 60], r: [0, 10], intrusiva: "Granito a feldspato alcalino", effusiva: "Riolite a feldspato alcalino" },
  { q: [20, 60], r: [10, 35], intrusiva: "Sienogranito", effusiva: "Riolite" },
  { q: [20, 60], r: [35, 65], intrusiva: "Monzogranito", effusiva: "Riolite" },
  { q: [20, 60], r: [65, 90], intrusiva: "Granodiorite", effusiva: "Dacite" },
  { q: [20, 60], r: [90, 100], intrusiva: "Tonalite", effusiva: "Dacite" },
  { q: [5, 20], r: [0, 10], intrusiva: "Quarzosienite a feldspato alcalino", effusiva: "Quarzotrachite a feldspato alcalino" },
  { q: [5, 20], r: [10, 35], intrusiva: "Quarzosienite", effusiva: "Quarzotrachite" },
  { q: [5, 20], r: [35, 65], intrusiva: "Quarzomonzonite", effusiva: "Quarzolatite" },
  { q: [5, 20], r: [65, 90], intrusiva: "Quarzomonzodiorite / quarzomonzogabbro", effusiva: "Andesite / basalto" },
  { q: [5, 20], r: [90, 100], intrusiva: "Quarzodiorite / quarzogabbro / quarzoanortosite", effusiva: "Andesite / basalto" },
  { q: [0, 5], r: [0, 10], intrusiva: "Sienite a feldspato alcalino", effusiva: "Trachite a feldspato alcalino" },
  { q: [0, 5], r: [10, 35], intrusiva: "Sienite", effusiva: "Trachite" },
  { q: [0, 5], r: [35, 65], intrusiva: "Monzonite", effusiva: "Latite" },
  { q: [0, 5], r: [65, 90], intrusiva: "Monzodiorite / monzogabbro", effusiva: "Andesite / basalto" },
  { q: [0, 5], r: [90, 100], intrusiva: "Diorite / gabbro / anortosite", effusiva: "Andesite / basalto" },
];

const W = 520;
const H = Math.round((W * Math.sqrt(3)) / 2);
const M = 24;
const A = { x: M, y: H + M };
const P = { x: W + M, y: H + M };
const Q = { x: W / 2 + M, y: M };

/** Punto del triangolo da %Q e rapporto P/(A+P) in %. */
function punto(q: number, r: number) {
  const t = q / 100;
  const sx = { x: A.x + t * (Q.x - A.x), y: A.y + t * (Q.y - A.y) };
  const dx = { x: P.x + t * (Q.x - P.x), y: P.y + t * (Q.y - P.y) };
  return { x: sx.x + (r / 100) * (dx.x - sx.x), y: sx.y + (r / 100) * (dx.y - sx.y) };
}
function campoDi(q: number, r: number): Campo {
  return CAMPI.find((c) => q >= c.q[0] && q <= c.q[1] && r >= c.r[0] && r <= c.r[1]) ?? CAMPI[CAMPI.length - 1];
}
const poligono = (c: Campo) => [punto(c.q[0], c.r[0]), punto(c.q[0], c.r[1]), punto(c.q[1], c.r[1]), punto(c.q[1], c.r[0])].map((p) => `${p.x},${p.y}`).join(" ");
const COLORE: Record<string, string> = { "0": "#efe2c4", "5": "#e9d3b0", "20": "#e6c59f", "60": "#dcd2c0", "90": "#d6cdbd" };

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Triangolo({ q, r, onPunta, evidenzia }: { q: number; r: number; onPunta?: (q: number, r: number) => void; evidenzia?: Campo }) {
  const svg = useRef<SVGSVGElement>(null);
  const trascina = useRef(false);

  function daEvento(e: React.PointerEvent) {
    if (!onPunta || !svg.current) return;
    const box = svg.current.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * (W + 2 * M);
    const y = ((e.clientY - box.top) / box.height) * (H + 2 * M);
    const qq = Math.max(0, Math.min(100, ((A.y - y) / (A.y - Q.y)) * 100));
    const t = qq / 100;
    const sx = A.x + t * (Q.x - A.x);
    const dx = P.x + t * (Q.x - P.x);
    const rr = dx - sx < 1 ? 50 : Math.max(0, Math.min(100, ((x - sx) / (dx - sx)) * 100));
    onPunta(Math.round(qq), Math.round(rr));
  }

  const pt = punto(q, r);
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W + 2 * M} ${H + 2 * M}`}
      className="w-full touch-none select-none"
      onPointerDown={(e) => {
        trascina.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        daEvento(e);
      }}
      onPointerMove={(e) => trascina.current && daEvento(e)}
      onPointerUp={() => (trascina.current = false)}
    >
      {CAMPI.map((c) => (
        <polygon key={c.intrusiva + c.q[0]} points={poligono(c)} fill={evidenzia === c ? "#f3c99a" : COLORE[String(c.q[0])]} stroke="#5a4a3a" strokeWidth="0.8" />
      ))}
      {/* Etichette solo dove c'è spazio: i campi larghi (rapporto 10–35, 35–65, 65–90) e le due fasce alte. */}
      {CAMPI.filter((c) => c.r[1] - c.r[0] >= 25 && c.r[1] - c.r[0] < 100 || c.q[0] >= 60).map((c) => {
        const centro = punto((c.q[0] + c.q[1]) / 2, (c.r[0] + c.r[1]) / 2);
        const corto = c.intrusiva.split(" / ")[0].replace("Quarzo", "Q-").replace("Granitoidi ricchi in quarzo", "Granitoidi ricchi in Q");
        const corpo = c.q[0] === 20 || c.q[0] >= 60 ? 10 : c.q[0] === 5 ? 8 : 6.5;
        return (
          <text key={"t" + c.intrusiva} x={centro.x} y={centro.y + corpo / 3} textAnchor="middle" fontSize={corpo} fontFamily="Poppins, sans-serif" fill="#3a2d23">
            {corto}
          </text>
        );
      })}
      <text x={Q.x} y={Q.y - 8} textAnchor="middle" fontSize="14" fontWeight="700" fill="#c9552a" fontFamily="Fraunces, serif">
        Q
      </text>
      <text x={A.x - 12} y={A.y + 16} fontSize="14" fontWeight="700" fill="#c9552a" fontFamily="Fraunces, serif">
        A
      </text>
      <text x={P.x + 4} y={P.y + 16} fontSize="14" fontWeight="700" fill="#c9552a" fontFamily="Fraunces, serif">
        P
      </text>
      {[5, 20, 60, 90].map((v) => (
        <text key={v} x={punto(v, 100).x + 6} y={punto(v, 100).y + 3} fontSize="9" fill="#a89a86" fontFamily="Poppins, sans-serif">
          {v}%
        </text>
      ))}
      {onPunta && (
        <g>
          <circle cx={pt.x} cy={pt.y} r="9" fill="#c9552a" opacity="0.25" />
          <circle cx={pt.x} cy={pt.y} r="4.5" fill="#c9552a" stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

function Prova() {
  const genera = () =>
    mescola(CAMPI.filter((c) => c.q[0] < 60))
      .slice(0, 8)
      .map((c) => {
        const q = Math.round(c.q[0] + (0.2 + Math.random() * 0.6) * (c.q[1] - c.q[0]));
        const r = Math.round(c.r[0] + (0.2 + Math.random() * 0.6) * (c.r[1] - c.r[0]));
        const qa = 100 - q;
        const p = Math.round((qa * r) / 100);
        return { c, q, a: qa - p, p, opzioni: mescola([c.intrusiva, ...mescola(CAMPI.filter((x) => x !== c && x.q[0] < 60).map((x) => x.intrusiva)).filter((n) => n !== c.intrusiva).slice(0, 3)]) };
      });
  const [domande, setDomande] = useState(genera);
  const [i, setI] = useState(0);
  const [ris, setRis] = useState<string | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];
  const bottone = "sans rounded-sm px-3 py-1.5 text-sm font-medium bg-lava text-white";

  if (i >= domande.length)
    return (
      <div className="foglio entra-girando p-5 pt-7">
        <p className="etichetta">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {domande.length}</span>
        </p>
        <button type="button" className={`${bottone} mt-4`} onClick={() => (setDomande(genera()), setI(0), setEsiti([]), setRis(null))}>
          Altri campioni
        </button>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
      <div className="foglio p-3 pt-5">
        <Triangolo q={d.q} r={Math.round((d.p / Math.max(1, d.a + d.p)) * 100)} evidenzia={ris ? d.c : undefined} />
      </div>
      <div>
        <p className="sans text-xs text-grafite">
          {i + 1} / {domande.length} · roccia intrusiva, femici sotto il 90%
        </p>
        <div key={i} className={`foglio entra-girando relative mt-2 p-4 pt-6 ${ris ? (ris === d.c.intrusiva ? "bagliore" : "crepa") : ""}`}>
          <p className="text-lg leading-snug">
            Normalizzati a 100: <b>Q {d.q}</b> · <b>A {d.a}</b> · <b>P {d.p}</b>. Che roccia è?
          </p>
          <ol className="mt-3 space-y-1.5">
            {d.opzioni.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  disabled={!!ris}
                  onClick={() => (setRis(o), setEsiti((e) => [...e, o === d.c.intrusiva]))}
                  className={`w-full rounded-sm border px-3 py-2 text-left text-[0.95rem] ${ris ? (o === d.c.intrusiva ? "border-muschio bg-muschio/15" : o === ris ? "border-lava bg-lava/15" : "border-filetto") : "border-filetto hover:border-grafite"}`}
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
              Q {d.q}% → fascia {d.c.q[0]}–{d.c.q[1]}; P/(A+P) = {Math.round((d.p / (d.a + d.p)) * 100)}% → {d.c.r[0]}–{d.c.r[1]}. Effusiva corrispondente: {d.c.effusiva}.
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
  const [q, setQ] = useState(35);
  const [r, setR] = useState(25);
  const c = useMemo(() => campoDi(q, r), [q, r]);
  const resto = 100 - q;
  const p = Math.round((resto * r) / 100);
  const a = resto - p;

  return (
    <div>
      <div className="flex gap-1 rounded-sm border border-filetto p-0.5 font-sans text-sm" style={{ width: "fit-content" }}>
        {(["esplora", "prova"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setModo(m)} className={`rounded-sm px-3 py-1 ${modo === m ? "bg-lava text-white" : "text-grafite hover:text-inchiostro"}`}>
            {m === "esplora" ? "Esplora il triangolo" : "Classifica tu"}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {modo === "esplora" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
            <div className="foglio p-3 pt-5">
              <Triangolo
                q={q}
                r={r}
                evidenzia={c}
                onPunta={(qq, rr) => {
                  setQ(qq);
                  setR(rr);
                }}
              />
              <p className="mt-1 text-center font-sans text-[0.7rem] text-grafite">Trascina il punto dentro il triangolo</p>
            </div>
            <div className="space-y-4">
              <div className="foglio p-4 pt-6">
                <p className="etichetta">Intrusiva</p>
                <p className="display text-2xl leading-tight">{c.intrusiva}</p>
                <p className="etichetta mt-3">Effusiva equivalente</p>
                <p className="display text-xl leading-tight">{c.effusiva}</p>
                <p className="mt-3 font-sans text-sm tabular-nums">
                  Q {q} · A {a} · P {p} <span className="text-grafite">· P/(A+P) = {r}%</span>
                </p>
              </div>
              <div className="foglio space-y-3 p-4 pt-6 font-sans text-sm">
                <label className="block">
                  Quarzo Q: {q}%
                  <input type="range" min={0} max={100} value={q} onChange={(e) => setQ(Number(e.target.value))} className="w-full accent-[#c9552a]" />
                </label>
                <label className="block">
                  Plagioclasi sul totale dei feldspati, P/(A+P): {r}%
                  <input type="range" min={0} max={100} value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full accent-[#c9552a]" />
                </label>
                <p className="text-[0.75rem] leading-snug text-grafite">
                  Dalla lezione 5: se vedi il quarzo, conta almeno 20%. Nei campi doppi (diorite / gabbro / anortosite) decide il femico: anfibolo = diorite, pirosseno = gabbro, quasi solo plagioclasio = anortosite.
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
