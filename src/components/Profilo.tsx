import { useMemo, useRef, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";

// Il profilo topografico come si fa a mano: una carta a isoipse, la traccia
// A–B, i punti dove la traccia taglia le isoipse riportati in un grafico
// distanza/quota. La carta è inventata (colline gaussiane da un seme), così
// ogni «Nuova carta» è un esercizio diverso.

const LARGO = 3000; // metri sul terreno
const ALTO = 2100;
const PASSO = 30; // griglia di campionamento, metri
const EQUIDISTANZA = 20;
const SVG_W = 600;
const SVG_H = (SVG_W * ALTO) / LARGO;
const PX = SVG_W / LARGO; // px per metro

type Punto = { x: number; y: number }; // metri

function generatore(seme: number) {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function terreno(seme: number) {
  const r = generatore(seme);
  const colli = Array.from({ length: 4 + Math.floor(r() * 3) }, () => ({
    x: 300 + r() * (LARGO - 600),
    y: 250 + r() * (ALTO - 500),
    h: 120 + r() * 360,
    sx: 260 + r() * 520,
    sy: 260 + r() * 520,
    a: r() * Math.PI,
  }));
  const valle = { x: r() * LARGO, y: r() * ALTO, h: -(60 + r() * 120), sx: 900, sy: 250, a: r() * Math.PI };
  const base = 180 + r() * 120;
  const pendenza = (r() - 0.5) * 0.08;
  return (x: number, y: number) => {
    let h = base + pendenza * x;
    for (const c of [...colli, valle]) {
      const dx = x - c.x;
      const dy = y - c.y;
      const u = dx * Math.cos(c.a) + dy * Math.sin(c.a);
      const v = -dx * Math.sin(c.a) + dy * Math.cos(c.a);
      h += c.h * Math.exp(-(u * u) / (2 * c.sx * c.sx) - (v * v) / (2 * c.sy * c.sy));
    }
    return h;
  };
}

/** Marching squares: i segmenti di ogni isoipsa, in pixel. */
function isoipse(quota: (x: number, y: number) => number) {
  const nx = Math.floor(LARGO / PASSO);
  const ny = Math.floor(ALTO / PASSO);
  const g: number[][] = [];
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j <= ny; j++) {
    g[j] = [];
    for (let i = 0; i <= nx; i++) {
      const h = quota(i * PASSO, j * PASSO);
      g[j][i] = h;
      min = Math.min(min, h);
      max = Math.max(max, h);
    }
  }
  const linee: { livello: number; d: string; etichetta?: Punto }[] = [];
  for (let liv = Math.ceil(min / EQUIDISTANZA) * EQUIDISTANZA; liv <= max; liv += EQUIDISTANZA) {
    let d = "";
    let etichetta: Punto | undefined;
    const lerp = (a: number, b: number) => (liv - a) / (b - a);
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const [a, b, c, e] = [g[j][i], g[j][i + 1], g[j + 1][i + 1], g[j + 1][i]];
        const caso = (a > liv ? 8 : 0) | (b > liv ? 4 : 0) | (c > liv ? 2 : 0) | (e > liv ? 1 : 0);
        if (caso === 0 || caso === 15) continue;
        const x0 = i * PASSO;
        const y0 = j * PASSO;
        const su = { x: x0 + lerp(a, b) * PASSO, y: y0 };
        const dx = { x: x0 + PASSO, y: y0 + lerp(b, c) * PASSO };
        const giu = { x: x0 + lerp(e, c) * PASSO, y: y0 + PASSO };
        const sx = { x: x0, y: y0 + lerp(a, e) * PASSO };
        const coppie: [Punto, Punto][] = (
          {
            1: [[sx, giu]], 2: [[giu, dx]], 3: [[sx, dx]], 4: [[su, dx]], 5: [[sx, su], [giu, dx]], 6: [[su, giu]], 7: [[sx, su]],
            8: [[sx, su]], 9: [[su, giu]], 10: [[sx, giu], [su, dx]], 11: [[su, dx]], 12: [[sx, dx]], 13: [[giu, dx]], 14: [[sx, giu]],
          } as Record<number, [Punto, Punto][]>
        )[caso];
        for (const [p, q] of coppie) {
          d += `M${(p.x * PX).toFixed(1)},${(p.y * PX).toFixed(1)}L${(q.x * PX).toFixed(1)},${(q.y * PX).toFixed(1)}`;
          // L'etichetta sulle direttrici, in un punto lontano dai bordi.
          if (!etichetta && liv % 100 === 0 && i > nx * 0.2 && i < nx * 0.8 && j > ny * 0.25 && j < ny * 0.75 && (i + j) % 7 === 0) etichetta = p;
        }
      }
    linee.push({ livello: liv, d, etichetta });
  }
  return { linee, min, max };
}

/** Quote lungo la traccia e punti dove taglia le isoipse. */
function profilo(quota: (x: number, y: number) => number, a: Punto, b: Punto) {
  const L = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(2, Math.round(L / 5));
  const campioni = Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n;
    return { s: t * L, h: quota(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)) };
  });
  const tagli: { s: number; h: number }[] = [];
  for (let k = 1; k < campioni.length; k++) {
    const p = campioni[k - 1];
    const q = campioni[k];
    const lo = Math.ceil(Math.min(p.h, q.h) / EQUIDISTANZA) * EQUIDISTANZA;
    for (let liv = lo; liv <= Math.max(p.h, q.h); liv += EQUIDISTANZA) {
      if (q.h === p.h) continue;
      tagli.push({ s: p.s + ((liv - p.h) / (q.h - p.h)) * (q.s - p.s), h: liv });
    }
  }
  return { L, campioni, tagli };
}

function Grafico({ dati, esagerazione, compatto, tagli = true }: { dati: ReturnType<typeof profilo>; esagerazione: number; compatto?: boolean; tagli?: boolean }) {
  const W = compatto ? 260 : 600;
  const sx = W / dati.L;
  const hs = dati.campioni.map((c) => c.h);
  const lo = Math.floor(Math.min(...hs) / EQUIDISTANZA) * EQUIDISTANZA - EQUIDISTANZA;
  const hi = Math.ceil(Math.max(...hs) / EQUIDISTANZA) * EQUIDISTANZA + EQUIDISTANZA;
  const sy = compatto ? 90 / (hi - lo) : sx * esagerazione;
  const H = (hi - lo) * sy;
  const X = (s: number) => s * sx;
  const Y = (h: number) => (hi - h) * sy;
  const linea = dati.campioni.map((c) => `${X(c.s).toFixed(1)},${Y(c.h).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`-34 -6 ${W + 40} ${H + 26}`} className="block h-auto w-full" style={compatto ? undefined : { maxHeight: 420 }}>
      {!compatto &&
        Array.from({ length: Math.round((hi - lo) / EQUIDISTANZA) + 1 }, (_, k) => lo + k * EQUIDISTANZA).map((h) => (
          <g key={h}>
            <line x1={0} x2={W} y1={Y(h)} y2={Y(h)} stroke={h % 100 === 0 ? "#cbb99c" : "#e2d6c1"} strokeWidth={h % 100 === 0 ? 0.8 : 0.5} />
            {(h % 100 === 0 || (hi - lo) / EQUIDISTANZA < 12) && (
              <text x={-4} y={Y(h) + 3} textAnchor="end" fontSize="9" fill="#7a6a58" fontFamily="Poppins, sans-serif">
                {h}
              </text>
            )}
          </g>
        ))}
      <polygon points={`0,${H} ${linea} ${W},${H}`} fill="#c9a77c" opacity="0.45" />
      <polyline points={linea} fill="none" stroke="#7a3e1d" strokeWidth={compatto ? 1.4 : 1.8} />
      {tagli && !compatto && dati.tagli.map((t, k) => <circle key={k} cx={X(t.s)} cy={Y(t.h)} r="2.2" fill="#c9552a" />)}
      <text x={0} y={H + 14} fontSize="11" fontWeight="700" fill="#c9552a" fontFamily="Fraunces, serif">A</text>
      <text x={W} y={H + 14} textAnchor="end" fontSize="11" fontWeight="700" fill="#c9552a" fontFamily="Fraunces, serif">B</text>
      {!compatto && (
        <text x={W / 2} y={H + 14} textAnchor="middle" fontSize="9" fill="#7a6a58" fontFamily="Poppins, sans-serif">
          {Math.round(dati.L).toLocaleString("it-IT")} m · esagerazione verticale {esagerazione}×
        </text>
      )}
    </svg>
  );
}

function Carta({ curve, a, b, onTraccia }: { curve: ReturnType<typeof isoipse>; a: Punto; b: Punto; onTraccia?: (a: Punto, b: Punto) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const inizio = useRef<Punto | null>(null);
  const [anteprima, setAnteprima] = useState<Punto | null>(null);

  function inMetri(e: React.PointerEvent): Punto | null {
    const ctm = svg.current?.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: Math.max(0, Math.min(LARGO, p.x / PX)), y: Math.max(0, Math.min(ALTO, p.y / PX)) };
  }
  const fine = anteprima ?? b;
  const origine = inizio.current ?? a;
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className={`block h-auto w-full select-none rounded-md ${onTraccia ? "cursor-crosshair touch-none" : ""}`}
      onPointerDown={(e) => {
        if (!onTraccia) return;
        const p = inMetri(e);
        if (!p) return;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        inizio.current = p;
        setAnteprima(p);
      }}
      onPointerMove={(e) => inizio.current && setAnteprima(inMetri(e))}
      onPointerUp={(e) => {
        const p = inMetri(e);
        if (inizio.current && p && Math.hypot(p.x - inizio.current.x, p.y - inizio.current.y) > 150) onTraccia?.(inizio.current, p);
        inizio.current = null;
        setAnteprima(null);
      }}
    >
      <rect width={SVG_W} height={SVG_H} fill="#f1e7d3" />
      {curve.linee.map((l) => (
        <path key={l.livello} d={l.d} fill="none" stroke="#a5652f" strokeWidth={l.livello % 100 === 0 ? 1.15 : 0.5} strokeLinecap="round" />
      ))}
      {curve.linee
        .filter((l) => l.etichetta)
        .map((l) => (
          <text key={"e" + l.livello} x={l.etichetta!.x * PX} y={l.etichetta!.y * PX} fontSize="8" fill="#8a4f22" fontFamily="Poppins, sans-serif" textAnchor="middle" paintOrder="stroke" stroke="#f1e7d3" strokeWidth="3">
            {l.livello}
          </text>
        ))}
      <line x1={origine.x * PX} y1={origine.y * PX} x2={fine.x * PX} y2={fine.y * PX} stroke="#c9552a" strokeWidth="2" strokeLinecap="round" />
      {[
        { p: origine, t: "A" },
        { p: fine, t: "B" },
      ].map(({ p, t }) => (
        <g key={t}>
          <circle cx={p.x * PX} cy={p.y * PX} r="4" fill="#c9552a" stroke="#fff" strokeWidth="1.2" />
          <text x={p.x * PX + 7} y={p.y * PX - 6} fontSize="12" fontWeight="700" fill="#c9552a" fontFamily="Fraunces, serif" paintOrder="stroke" stroke="#f1e7d3" strokeWidth="3">
            {t}
          </text>
        </g>
      ))}
      {/* Scala grafica: 500 m */}
      <g transform={`translate(${SVG_W - 120}, ${SVG_H - 16})`} fontFamily="Poppins, sans-serif" fontSize="8" fill="#5a4a3a">
        <rect x="0" y="0" width={250 * PX} height="4" fill="#5a4a3a" />
        <rect x={250 * PX} y="0" width={250 * PX} height="4" fill="#f1e7d3" stroke="#5a4a3a" strokeWidth="0.6" />
        <text x="0" y="-3">0</text>
        <text x={500 * PX} y="-3" textAnchor="end">500 m</text>
      </g>
    </svg>
  );
}

function trucco(seme: number) {
  const r = generatore(seme * 7 + 3);
  const p = () => ({ x: 250 + r() * (LARGO - 500), y: 200 + r() * (ALTO - 400) });
  let a = p();
  let b = p();
  while (Math.hypot(a.x - b.x, a.y - b.y) < 1400) [a, b] = [p(), p()];
  return { a, b };
}

function Esercizio() {
  const [seme, setSeme] = useState(() => Math.floor(Math.random() * 1e9));
  const [scelta, setScelta] = useState<number | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const quota = useMemo(() => terreno(seme), [seme]);
  const curve = useMemo(() => isoipse(quota), [quota]);
  const { a, b } = useMemo(() => trucco(seme), [seme]);
  // Il profilo giusto, lo stesso letto da B verso A, e quello di un'altra traccia.
  const opzioni = useMemo(() => {
    const altra = trucco(seme + 1);
    const giusto = profilo(quota, a, b);
    const rovescio = profilo(quota, b, a);
    const diverso = profilo(quota, altra.a, altra.b);
    const ordine = [0, 1, 2].sort(() => Math.random() - 0.5);
    return ordine.map((k) => ({ dati: [giusto, rovescio, diverso][k], giusto: k === 0, perche: ["", "È il profilo letto da B verso A.", "È il profilo di un'altra traccia."][k] }));
  }, [quota, a, b, seme]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
      <div className="pannello p-3 sm:p-4">
        <Carta curve={curve} a={a} b={b} />
      </div>
      <div className="space-y-3">
        <p className="font-sans text-sm text-grafite">
          Quale profilo corrisponde alla traccia A–B? {esiti.length > 0 && <>· {esiti.filter(Boolean).length} su {esiti.length}</>}
        </p>
        {opzioni.map((o, k) => (
          <button
            key={k}
            type="button"
            disabled={scelta !== null}
            onClick={() => (setScelta(k), setEsiti((e) => [...e, o.giusto]))}
            className={`block w-full rounded-[0.85rem] border bg-[#f1e7d3] p-2 text-left transition ${
              scelta === null ? "border-transparent hover:border-[#e07a4a]" : o.giusto ? "border-muschio ring-2 ring-muschio" : k === scelta ? "border-lava ring-2 ring-lava" : "border-transparent opacity-50"
            }`}
          >
            <Grafico dati={o.dati} esagerazione={1} compatto />
            {scelta !== null && !o.giusto && k === scelta && <p className="px-1 pt-1 font-sans text-xs text-[#7a3e1d]">{o.perche}</p>}
          </button>
        ))}
        {scelta !== null && (
          <button
            type="button"
            className="sans rounded-md bg-lava px-3 py-1.5 text-sm font-medium text-white"
            onClick={() => {
              if (esiti.length % 5 === 0) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "geografia-fisica/profilo", correct: esiti.slice(-5).filter(Boolean).length, total: 5 }] }));
              setSeme(Math.floor(Math.random() * 1e9));
              setScelta(null);
            }}
          >
            Un'altra carta
          </button>
        )}
      </div>
    </div>
  );
}

export function Profilo() {
  const [modo, setModo] = useState<"disegna" | "esercizio">("disegna");
  const [seme, setSeme] = useState(20261004);
  const [traccia, setTraccia] = useState<{ a: Punto; b: Punto }>({ a: { x: 400, y: 1500 }, b: { x: 2600, y: 600 } });
  const [esagerazione, setEsagerazione] = useState(2);
  const quota = useMemo(() => terreno(seme), [seme]);
  const curve = useMemo(() => isoipse(quota), [quota]);
  const dati = useMemo(() => profilo(quota, traccia.a, traccia.b), [quota, traccia]);
  const ha = quota(traccia.a.x, traccia.a.y);
  const hb = quota(traccia.b.x, traccia.b.y);
  const pend = (hb - ha) / dati.L;
  const hs = dati.campioni.map((c) => c.h);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="segmentato">
          {(["disegna", "esercizio"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setModo(m)} aria-pressed={modo === m}>
              {m === "disegna" ? "Traccia tu" : "Quale profilo?"}
            </button>
          ))}
        </div>
        {modo === "disegna" && (
          <>
            <div className="segmentato">
              {[1, 2, 5].map((e) => (
                <button key={e} type="button" onClick={() => setEsagerazione(e)} aria-pressed={esagerazione === e}>
                  {e}× verticale
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSeme(Math.floor(Math.random() * 1e9))} className="bottone bottone-vuoto">
              Nuova carta
            </button>
          </>
        )}
      </div>

      <div className="mt-4">
        {modo === "disegna" ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="pannello p-3 sm:p-4">
              <Carta curve={curve} a={traccia.a} b={traccia.b} onTraccia={(a, b) => setTraccia({ a, b })} />
              <p className="mt-1.5 text-center font-sans text-[0.7rem] text-grafite">Trascina sulla carta da A a B · equidistanza {EQUIDISTANZA} m, direttrici ogni 100 m</p>
            </div>
            <div className="space-y-4">
              <div className="pannello p-3 sm:p-4">
                <div className="rounded-md bg-[#f1e7d3] p-2">
                  <Grafico dati={dati} esagerazione={esagerazione} />
                </div>
                <p className="mt-1.5 text-center font-sans text-[0.7rem] text-grafite">I punti rossi sono i tagli con le isoipse: è da lì che si costruisce il profilo a mano.</p>
              </div>
              <div className="pannello grid grid-cols-2 gap-3 p-4 font-sans text-sm sm:grid-cols-4">
                {[
                  ["Distanza", `${Math.round(dati.L).toLocaleString("it-IT")} m`],
                  ["Dislivello", `${hb - ha >= 0 ? "+" : "−"}${Math.abs(Math.round(hb - ha))} m`],
                  ["Pendenza media", `${(Math.abs(pend) * 100).toLocaleString("it-IT", { maximumFractionDigits: 1 })}% · ${((Math.atan(Math.abs(pend)) * 180) / Math.PI).toLocaleString("it-IT", { maximumFractionDigits: 1 })}°`],
                  ["Quote", `${Math.round(Math.min(...hs))} – ${Math.round(Math.max(...hs))} m`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="pannello-titolo">{k}</p>
                    <p className="display mt-0.5 text-lg leading-tight tabular-nums">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Esercizio />
        )}
      </div>
    </div>
  );
}
