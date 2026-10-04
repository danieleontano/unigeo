import { useEffect, useState } from "react";

interface Capitolo {
  id: string;
  numero: number;
  titolo: string;
}

interface Props {
  chiave: string;
  capitoli: Capitolo[];
}

type Carta = "carta" | "seppia" | "notte";
interface Preferenze {
  zoom: number;
  larghezza: number;
  carta: Carta;
}

const PREF_CHIAVE = "unigeo.lettore.v1";
const PREF_DEFAULT: Preferenze = { zoom: 1, larghezza: 42, carta: "carta" };

function leggi<T>(chiave: string, difetto: T): T {
  try {
    const g = localStorage.getItem(chiave);
    return g ? { ...difetto, ...JSON.parse(g) } : difetto;
  } catch {
    return difetto;
  }
}
function scrivi(chiave: string, valore: unknown) {
  try {
    localStorage.setItem(chiave, JSON.stringify(valore));
  } catch {
    /* ignorato */
  }
}

// Il modo lettura del Libro: dimensione del testo, larghezza della colonna,
// carta/seppia/notte, barra di avanzamento, capitolo corrente nell'indice e
// posizione ricordata. Lavora sul DOM che Astro ha già reso: imposta variabili
// CSS sul contenitore .libro e osserva i capitoli.
export function Lettore({ chiave, capitoli }: Props) {
  const [pref, setPref] = useState<Preferenze>(PREF_DEFAULT);
  const [aperto, setAperto] = useState(false);
  const [corrente, setCorrente] = useState<string>(capitoli[0]?.id ?? "");
  const [avanzamento, setAvanzamento] = useState(0);
  const [pronto, setPronto] = useState(false);

  // preferenze + posizione salvata
  useEffect(() => {
    const p = leggi(PREF_CHIAVE, PREF_DEFAULT);
    setPref(p);
    const pos = leggi<{ y: number }>(`${chiave}.posizione`, { y: 0 });
    if (pos.y > 0 && !location.hash) requestAnimationFrame(() => window.scrollTo({ top: pos.y }));
    setPronto(true);
  }, [chiave]);

  // applica le preferenze al contenitore
  useEffect(() => {
    const libro = document.querySelector<HTMLElement>(".libro");
    if (!libro) return;
    libro.style.setProperty("--zoom", String(pref.zoom));
    libro.style.setProperty("--larghezza", `${pref.larghezza}rem`);
    // Il tema sta sulla radice, così lo seguono anche barra e piede.
    document.documentElement.dataset.carta = pref.carta;
    if (pronto) scrivi(PREF_CHIAVE, pref);
    return () => {
      delete document.documentElement.dataset.carta;
    };
  }, [pref, pronto]);

  // avanzamento, capitolo corrente, posizione
  useEffect(() => {
    let tick = 0;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setAvanzamento(max > 0 ? Math.min(1, h.scrollTop / max) : 1);
      if (++tick % 10 === 0) scrivi(`${chiave}.posizione`, { y: h.scrollTop });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const oss = new IntersectionObserver(
      (voci) => {
        const visibile = voci.filter((v) => v.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visibile) setCorrente(visibile.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    capitoli.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) oss.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      oss.disconnect();
      scrivi(`${chiave}.posizione`, { y: document.documentElement.scrollTop });
    };
  }, [chiave, capitoli]);

  const idx = capitoli.findIndex((c) => c.id === corrente);
  const cap = capitoli[idx];
  const vai = (i: number) => {
    const c = capitoli[i];
    if (c) document.getElementById(c.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* barra di avanzamento in alto (telefono) e carota di lettura a sinistra (schermo largo) */}
      <div className="fixed left-0 top-0 z-30 h-[3px] bg-materia transition-[width] duration-150 lg:hidden" style={{ width: `${avanzamento * 100}%` }} aria-hidden="true" />
      <div className="carota hidden lg:block" aria-hidden="true" title={`Letto il ${Math.round(avanzamento * 100)}%`}>
        <div className="riempimento" style={{ height: `${avanzamento * 100}%` }} />
      </div>

      {/* barra del capitolo corrente + controlli */}
      <div className="sticky top-12 lg:top-0 z-20 -mx-4 flex items-center gap-2 border-b border-filetto px-4 py-1.5 font-sans text-xs backdrop-blur" style={{ background: "color-mix(in srgb, var(--carta) 88%, transparent)" }}>
        <button type="button" onClick={() => vai(idx - 1)} disabled={idx <= 0} className="bottone bottone-vuoto px-2 py-1 disabled:opacity-30" aria-label="Capitolo precedente">
          ←
        </button>
        <span className="min-w-0 flex-1 truncate text-inchiostro">
          {cap && (
            <>
              <span className="display font-semibold text-materia">Cap. {cap.numero}</span> · {cap.titolo}
            </>
          )}
        </span>
        <button type="button" onClick={() => vai(idx + 1)} disabled={idx >= capitoli.length - 1} className="bottone bottone-vuoto px-2 py-1 disabled:opacity-30" aria-label="Capitolo successivo">
          →
        </button>
        <button type="button" onClick={() => setAperto((a) => !a)} className={`bottone px-2 py-1 ${aperto ? "bottone-materia" : "bottone-vuoto"}`} aria-expanded={aperto} aria-label="Modo lettura">
          <span className="display text-sm leading-none">Aa</span>
        </button>
      </div>

      {aperto && (
        <div className="sticky top-[5.3rem] lg:top-[2.3rem] z-20 -mx-4 border-b border-filetto px-4 py-3 font-sans text-xs" style={{ background: "var(--carta)" }}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-1">
              <span className="etichetta mr-1">Testo</span>
              <button type="button" onClick={() => setPref((p) => ({ ...p, zoom: Math.max(0.85, +(p.zoom - 0.1).toFixed(2)) }))} className="bottone bottone-vuoto px-2 py-1">
                A−
              </button>
              <button type="button" onClick={() => setPref((p) => ({ ...p, zoom: Math.min(1.5, +(p.zoom + 0.1).toFixed(2)) }))} className="bottone bottone-vuoto px-2 py-1">
                A+
              </button>
            </div>
            <div className="hidden items-center gap-1 sm:flex">
              <span className="etichetta mr-1">Colonna</span>
              {[36, 42, 52].map((w) => (
                <button key={w} type="button" onClick={() => setPref((p) => ({ ...p, larghezza: w }))} className={`bottone px-2 py-1 ${pref.larghezza === w ? "bottone-materia" : "bottone-vuoto"}`}>
                  {w === 36 ? "Stretta" : w === 42 ? "Media" : "Larga"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="etichetta mr-1">Carta</span>
              {(["carta", "seppia", "notte"] as Carta[]).map((c) => (
                <button key={c} type="button" onClick={() => setPref((p) => ({ ...p, carta: c }))} className={`bottone px-2 py-1 capitalize ${pref.carta === c ? "bottone-materia" : "bottone-vuoto"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
