import { aggiornaStato, useIdratato, useStato } from "@/lib/stato";
import { dopoRipassoManuale, giorniTra, oggiIso } from "@/lib/ripasso";

interface Props {
  idLezione: string;
  haQuiz: boolean;
  percorsoQuiz: string;
  percorsoFlashcard: string | null;
  base: string;
}

// In fondo alla lezione: «Fai il quiz», le flashcard della materia e «Segna
// come ripassata» (sposta la scadenza senza cambiare scatola).
export function AzioniLezione({ idLezione, haQuiz, percorsoQuiz, percorsoFlashcard, base }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const oggi = oggiIso();
  const p = stato.progress[idLezione];

  function segna() {
    aggiornaStato((s) => ({ ...s, progress: { ...s.progress, [idLezione]: dopoRipassoManuale(s.progress[idLezione], oggi) } }));
  }

  const g = p ? giorniTra(oggi, p.nextReview) : null;
  const scadenza = g === null ? null : g < 0 ? `in ritardo di ${-g} g` : g === 0 ? "oggi" : g === 1 ? "domani" : `tra ${g} g`;

  return (
    <div className="sans mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-sm print:hidden">
      {haQuiz && (
        <a href={`${base}${percorsoQuiz}`} className="rounded-lg bg-materia px-3 py-1.5 font-medium text-white">
          Fai il quiz
        </a>
      )}
      {percorsoFlashcard && (
        <a href={`${base}${percorsoFlashcard}`} className="rounded-lg border border-line px-3 py-1.5 text-slate hover:bg-sand/60">
          Flashcard
        </a>
      )}
      <button type="button" onClick={segna} className="rounded-lg border border-line px-3 py-1.5 text-slate hover:bg-sand/60">
        Segna come ripassata
      </button>
      {idratato && p && (
        <span className="text-xs text-muted">
          Scatola {p.box} · ripasso {scadenza}
        </span>
      )}
    </div>
  );
}
