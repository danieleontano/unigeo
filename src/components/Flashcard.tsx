import { useMemo, useState } from "react";
import { aggiornaStato, useIdratato, useStato } from "@/lib/stato";
import type { Carta } from "@/lib/flashcard";

interface Props {
  nomeMateria: string;
  colore: string;
  carte: Carta[];
  base: string;
}

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function inlineHtml(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/&lt;(\/?su[bp])&gt;/g, "<$1>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, " ");
}

// La cassettiera dei campioni: i cartellini da museo delle definizioni. Un
// tocco gira il cartellino in 3D; «La sapevo» lo manda nel cassetto dei
// classificati, «Non la sapevo» in quello da rivedere.
export function Flashcard({ nomeMateria, colore, carte, base }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const pendenti = useMemo(() => {
    const set = new Set<string>();
    for (const [id, p] of Object.entries(stato.progress)) for (const k of p.cartePendenti ?? []) set.add(`${id}#${k}`);
    return set;
  }, [stato]);

  const [mazzo, setMazzo] = useState<Carta[] | null>(null);
  const [i, setI] = useState(0);
  const [girata, setGirata] = useState(false);
  const [uscita, setUscita] = useState<"destra" | "sinistra" | null>(null);
  const [nonSapute, setNonSapute] = useState<Carta[]>([]);
  const [finito, setFinito] = useState(false);

  if (!idratato) return <div className="h-24" aria-hidden="true" />;

  const daRivedere = carte.filter((c) => pendenti.has(c.chiave));
  const stile = { ["--materia" as string]: colore } as React.CSSProperties;
  const bottone = "sans rounded-lg px-3 py-1.5 text-sm font-medium";
  const pieno = `${bottone} bg-lava text-white`;
  const vuoto = `${bottone} border border-filetto text-inchiostro hover:bg-sabbia`;

  function inizia(quali: Carta[]) {
    setMazzo(mescola(quali));
    setI(0);
    setGirata(false);
    setUscita(null);
    setNonSapute([]);
    setFinito(false);
  }

  function salvaPendenti(nonSapute: Carta[], viste: Carta[]) {
    aggiornaStato((s) => {
      const progress = { ...s.progress };
      const perLezione = new Map<string, Set<number>>();
      for (const [id, p] of Object.entries(progress)) perLezione.set(id, new Set(p.cartePendenti ?? []));
      for (const c of viste) {
        const idx = Number(c.chiave.split("#")[1]);
        const set = perLezione.get(c.lezione) ?? new Set<number>();
        if (nonSapute.includes(c)) set.add(idx);
        else set.delete(idx);
        perLezione.set(c.lezione, set);
      }
      for (const [id, set] of perLezione) {
        const p = progress[id] ?? { box: 1 as const, nextReview: new Date().toISOString().slice(0, 10), wrongIds: [] };
        progress[id] = { ...p, cartePendenti: [...set].sort((a, b) => a - b) };
      }
      return { ...s, progress };
    });
  }

  function rispondi(sapevo: boolean) {
    if (!mazzo || uscita) return;
    const c = mazzo[i];
    const nuove = sapevo ? nonSapute : [...nonSapute, c];
    setNonSapute(nuove);
    setUscita(sapevo ? "destra" : "sinistra");
    window.setTimeout(() => {
      setUscita(null);
      setGirata(false);
      if (i + 1 < mazzo.length) setI(i + 1);
      else {
        salvaPendenti(nuove, mazzo);
        setFinito(true);
      }
    }, 480);
  }

  if (!mazzo) {
    return (
      <div style={stile} className="sans">
        <div className="cassetto p-4">
          <div className="maniglia mb-3" />
          <p className="text-center text-sm text-grafite">
            {carte.length} campioni in {new Set(carte.map((c) => c.lezione)).size} lezioni di {nomeMateria}.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => inizia(carte)} className={pieno}>
              Apri il cassetto
            </button>
            {daRivedere.length > 0 && (
              <button type="button" onClick={() => inizia(daRivedere)} className={vuoto}>
                Da rivedere ({daRivedere.length})
              </button>
            )}
          </div>
        </div>
        <ul className="pannello mt-4 divide-y divide-filetto px-4 py-1 text-sm">
          {carte.map((c) => (
            <li key={c.chiave} className="flex items-center gap-3 py-1.5">
              <span className="min-w-0 flex-1 truncate font-serif">{c.fronte}</span>
              <span className="shrink-0 text-xs text-grafite">lez. {c.numeroLezione}</span>
              {pendenti.has(c.chiave) && <span className="shrink-0 text-xs font-semibold text-lava">da rivedere</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (finito) {
    const sapute = mazzo.length - nonSapute.length;
    return (
      <div style={stile} className="entra-girando">
        <p className="etichetta">Cassetto chiuso</p>
        <p className="mt-2 text-3xl font-semibold">
          {sapute} <span className="text-lg text-grafite">classificati su {mazzo.length}</span>
        </p>
        {nonSapute.length > 0 && (
          <ul className="mt-4 divide-y divide-filetto border-y border-filetto text-sm">
            {nonSapute.map((c) => (
              <li key={c.chiave} className="py-1.5">
                <span className="font-semibold">{c.fronte}</span>
                <span className="text-grafite"> · lez. {c.numeroLezione}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {nonSapute.length > 0 && (
            <button type="button" onClick={() => inizia(nonSapute)} className={pieno}>
              Rifai quelli da rivedere
            </button>
          )}
          <button type="button" onClick={() => setMazzo(null)} className={vuoto}>
            Cassettiera
          </button>
          <a href={`${base}/`} className={vuoto}>
            Taccuino
          </a>
        </div>
      </div>
    );
  }

  const c = mazzo[i];
  return (
    <div style={stile}>
      <p className="sans flex items-center justify-between text-xs text-grafite">
        <span>
          {i + 1} / {mazzo.length}
        </span>
        <span className="truncate pl-4">
          lez. {c.numeroLezione} · {c.titoloLezione}
        </span>
      </p>
      <div className="mt-1 h-1 w-full rounded bg-sabbia">
        <div className="h-1 rounded bg-materia transition-[width] duration-500" style={{ width: `${(i / mazzo.length) * 100}%` }} />
      </div>

      <div className="relative mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <div className="sans hidden w-16 text-center text-[0.65rem] uppercase tracking-wider text-grafite sm:block">Da rivedere ←</div>
        <div className={`cartellino-scena mx-auto w-full max-w-md ${uscita === "destra" ? "vola-destra" : uscita === "sinistra" ? "vola-sinistra" : ""}`}>
          <button
            type="button"
            onClick={() => setGirata((g) => !g)}
            className={`cartellino block min-h-64 w-full text-left ${girata ? "girato" : ""}`}
            aria-label={girata ? "Mostra il termine" : "Mostra la definizione"}
          >
            <div className="faccia cartellino-carta flex flex-col justify-center p-6 pt-8">
              <span className="sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: colore }}>
                Campione n. {Number(c.chiave.split("#")[1]) + 1} · lez. {c.numeroLezione}
              </span>
              <span className="display mt-2 break-words text-3xl font-semibold" style={{ color: "#1f2326" }}>
                {c.fronte}
              </span>
              <span className="sans mt-6 text-xs" style={{ color: "#5e6568" }}>
                Tocca per girare il cartellino
              </span>
            </div>
            <div className="faccia retro cartellino-carta flex flex-col justify-center p-6 pt-8">
              <span className="sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: "#c9a227" }}>
                Scheda
              </span>
              <span className="mt-2 text-[1.05rem] leading-snug" style={{ color: "#1f2326" }} dangerouslySetInnerHTML={{ __html: inlineHtml(c.retro) }} />
            </div>
          </button>
        </div>
        <div className="sans hidden w-16 text-center text-[0.65rem] uppercase tracking-wider text-grafite sm:block">→ Classificati</div>
      </div>

      <div className={`mt-4 flex gap-2 transition-opacity ${girata ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <button type="button" onClick={() => rispondi(false)} className={`${bottone} flex-1 border border-lava text-lava hover:bg-lava/15`}>
          Non lo sapevo
        </button>
        <button type="button" onClick={() => rispondi(true)} className={`${bottone} flex-1 border border-muschio text-muschio hover:bg-muschio/15`}>
          Lo sapevo
        </button>
      </div>
    </div>
  );
}
