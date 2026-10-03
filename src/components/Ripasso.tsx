import { useIdratato, useStato, aggiornaStato } from "@/lib/stato";
import { anticipa, giorniTra, oggiIso, rimanda, type Progresso } from "@/lib/ripasso";
import type { SchedaLezione } from "@/lib/schede";

interface Props {
  lezioni: SchedaLezione[];
  base: string;
}

function etichettaScadenza(p: Progresso | undefined, oggi: string): string {
  if (!p) return "mai fatta";
  const g = giorniTra(oggi, p.nextReview);
  if (g < 0) return `in ritardo di ${-g} g`;
  if (g === 0) return "oggi";
  if (g === 1) return "domani";
  return `tra ${g} g`;
}

// Tutto il calendario del ripasso, una riga per lezione con quiz: scatola,
// scadenza, e due azioni (rimanda di un giorno, anticipa a oggi).
export function Ripasso({ lezioni, base }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const oggi = oggiIso();

  const righe = lezioni
    .filter((l) => l.haQuiz && stato.settings.materieAttive.includes(l.materia))
    .map((l) => ({ l, p: stato.progress[l.id] }))
    .sort((a, b) => (a.p?.nextReview ?? oggi).localeCompare(b.p?.nextReview ?? oggi) || a.l.data.localeCompare(b.l.data));

  function cambia(id: string, fn: (p: Progresso) => Progresso) {
    aggiornaStato((s) => {
      const p = s.progress[id] ?? { box: 1, nextReview: oggi, wrongIds: [] };
      return { ...s, progress: { ...s.progress, [id]: fn(p) } };
    });
  }

  if (!idratato) return <div className="h-10" aria-hidden="true" />;
  if (righe.length === 0) return <p className="mt-2 text-sm text-muted">Nessuna lezione con quiz nelle materie attive.</p>;

  return (
    <ol className="mt-2 divide-y divide-line border-y border-line">
      {righe.map(({ l, p }) => {
        const scaduta = !p || p.nextReview <= oggi;
        return (
          <li key={l.id} className="flex items-center gap-3 py-1.5" style={{ ["--materia" as string]: l.colore }}>
            <a href={`${base}${l.percorsoQuiz}`} className="flex min-w-0 flex-1 items-center gap-3">
              <span className="sans w-24 shrink-0 truncate text-xs font-semibold text-materia">{l.nomeMateria}</span>
              <span className="min-w-0 flex-1 truncate">
                {l.numero} · {l.titolo}
              </span>
            </a>
            <span className={`h-5 w-8 shrink-0 rounded-sm border border-filetto ${p ? `lito-${p.box}` : ""}`} title={p ? `Scatola ${p.box}: ${["sedimento sciolto", "sedimento compattato", "cementazione", "roccia tenera", "roccia compatta"][p.box - 1]}` : "Mai fatta"} aria-label={p ? `Scatola ${p.box}` : "Mai fatta"} />
            <span className={`sans w-24 shrink-0 text-right text-xs tabular-nums ${scaduta ? "font-medium text-materia" : "text-muted"}`}>
              {etichettaScadenza(p, oggi)}
            </span>
            <span className="sans flex shrink-0 gap-1 text-xs">
              <button type="button" onClick={() => cambia(l.id, (x) => rimanda(x, oggi))} className="rounded border border-line px-1.5 py-0.5 text-muted hover:text-slate" title="Rimanda di un giorno">
                +1
              </button>
              <button type="button" onClick={() => cambia(l.id, (x) => anticipa(x, oggi))} className="rounded border border-line px-1.5 py-0.5 text-muted hover:text-slate" title="Anticipa a oggi" disabled={scaduta}>
                Oggi
              </button>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
