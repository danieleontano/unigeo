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

// Markdown inline minimo (grassetto, corsivo, apici) → HTML. Le definizioni
// vengono da file nostri: niente da sanificare.
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

// Fronte/retro, un tocco per girare, «La sapevo / Non la sapevo». Le non
// sapute restano segnate nello stato della lezione (cartePendenti) e si
// possono rifare da sole.
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
  const [nonSapute, setNonSapute] = useState<Carta[]>([]);
  const [finito, setFinito] = useState(false);

  if (!idratato) return <div className="h-24" aria-hidden="true" />;

  const daRivedere = carte.filter((c) => pendenti.has(c.chiave));
  const stile = { ["--materia" as string]: colore } as React.CSSProperties;
  const bottone = "sans rounded-lg px-3 py-1.5 text-sm font-medium";
  const pieno = `${bottone} bg-materia text-white`;
  const vuoto = `${bottone} border border-line text-slate hover:bg-sand/60`;

  function inizia(quali: Carta[]) {
    setMazzo(mescola(quali));
    setI(0);
    setGirata(false);
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
    if (!mazzo) return;
    const c = mazzo[i];
    const nuoveNonSapute = sapevo ? nonSapute : [...nonSapute, c];
    setNonSapute(nuoveNonSapute);
    setGirata(false);
    if (i + 1 < mazzo.length) setI(i + 1);
    else {
      salvaPendenti(nuoveNonSapute, mazzo);
      setFinito(true);
    }
  }

  if (!mazzo) {
    return (
      <div style={stile} className="sans">
        <p className="text-sm text-muted">
          {carte.length} definizioni in {new Set(carte.map((c) => c.lezione)).size} lezioni di {nomeMateria}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => inizia(carte)} className={pieno}>
            Tutte
          </button>
          {daRivedere.length > 0 && (
            <button type="button" onClick={() => inizia(daRivedere)} className={vuoto}>
              Da rivedere ({daRivedere.length})
            </button>
          )}
        </div>
        <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
          {carte.map((c) => (
            <li key={c.chiave} className="flex items-center gap-3 py-1.5">
              <span className="min-w-0 flex-1 truncate font-serif text-ink">{c.fronte}</span>
              <span className="shrink-0 text-xs text-muted">lez. {c.numeroLezione}</span>
              {pendenti.has(c.chiave) && <span className="shrink-0 text-xs font-semibold text-materia">da rivedere</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (finito) {
    const sapute = mazzo.length - nonSapute.length;
    return (
      <div style={stile}>
        <p className="sans text-xs font-semibold uppercase tracking-[0.18em] text-muted">Fine</p>
        <p className="mt-2 text-3xl font-semibold text-slate">
          {sapute} <span className="text-lg text-muted">su {mazzo.length}</span>
        </p>
        {nonSapute.length > 0 && (
          <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
            {nonSapute.map((c) => (
              <li key={c.chiave} className="py-1.5">
                <span className="font-semibold text-slate">{c.fronte}</span>
                <span className="text-muted"> · lez. {c.numeroLezione}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {nonSapute.length > 0 && (
            <button type="button" onClick={() => inizia(nonSapute)} className={pieno}>
              Rifai quelle non sapute
            </button>
          )}
          <button type="button" onClick={() => setMazzo(null)} className={vuoto}>
            Indietro
          </button>
          <a href={`${base}/`} className={vuoto}>
            Oggi
          </a>
        </div>
      </div>
    );
  }

  const c = mazzo[i];
  return (
    <div style={stile}>
      <p className="sans flex items-center justify-between text-xs text-muted">
        <span>
          {i + 1} / {mazzo.length}
        </span>
        <span className="truncate pl-4">
          lez. {c.numeroLezione} · {c.titoloLezione}
        </span>
      </p>
      <div className="mt-1 h-1 w-full rounded bg-sand">
        <div className="h-1 rounded bg-materia" style={{ width: `${(i / mazzo.length) * 100}%` }} />
      </div>

      <button
        type="button"
        onClick={() => setGirata((g) => !g)}
        className="mt-5 flex min-h-56 w-full flex-col justify-center rounded-2xl border border-line bg-sand/40 p-5 text-left"
        aria-label={girata ? "Mostra il termine" : "Mostra la definizione"}
      >
        {!girata ? (
          <>
            <span className="sans text-xs font-semibold uppercase tracking-[0.18em] text-materia">Termine</span>
            <span className="mt-2 break-words text-2xl font-semibold text-slate">{c.fronte}</span>
            <span className="sans mt-6 text-xs text-muted">Tocca per girare</span>
          </>
        ) : (
          <>
            <span className="sans text-xs font-semibold uppercase tracking-[0.18em] text-ochre">Definizione</span>
            <span className="mt-2 text-[1.05rem] leading-snug" dangerouslySetInnerHTML={{ __html: inlineHtml(c.retro) }} />
          </>
        )}
      </button>

      {girata && (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => rispondi(true)} className={`${bottone} flex-1 border border-moss text-moss hover:bg-moss/10`}>
            La sapevo
          </button>
          <button type="button" onClick={() => rispondi(false)} className={`${bottone} flex-1 border border-materia text-materia hover:bg-materia/10`}>
            Non la sapevo
          </button>
        </div>
      )}
    </div>
  );
}
