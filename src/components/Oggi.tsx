import { useMemo } from "react";
import { useIdratato, useStato } from "@/lib/stato";
import { inScadenza, oggiIso, riepilogoSettimana } from "@/lib/ripasso";
import type { SchedaLezione } from "@/lib/schede";

interface Props {
  lezioni: SchedaLezione[];
  base: string;
}

// «Da ripassare oggi»: le lezioni con quiz la cui data di ripasso è arrivata
// (una lezione mai fatta è in scadenza da subito). Isola React perché legge
// lo stato nel browser; la lista delle lezioni arriva già pronta da Astro.
export function Oggi({ lezioni, base }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const oggi = oggiIso();

  const daFare = useMemo(
    () =>
      lezioni
        .filter((l) => l.haQuiz && stato.settings.materieAttive.includes(l.materia))
        .filter((l) => inScadenza(stato.progress[l.id], oggi))
        .sort((a, b) => (stato.progress[a.id]?.nextReview ?? "").localeCompare(stato.progress[b.id]?.nextReview ?? "")),
    [lezioni, stato, oggi],
  );
  const settimana = riepilogoSettimana(stato.history, oggi);
  const conQuiz = lezioni.some((l) => l.haQuiz);

  if (!idratato) return <div className="h-10" aria-hidden="true" />;

  return (
    <>
      {!conQuiz ? (
        <p className="mt-2 text-sm text-muted">Nessun quiz ancora: si aggiunge un file in content/&lt;materia&gt;/quiz/.</p>
      ) : daFare.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Niente in scadenza. Le flashcard valgono sempre.</p>
      ) : (
        <ol className="mt-2 divide-y divide-line border-t border-line">
          {daFare.map((l) => {
            const p = stato.progress[l.id];
            return (
              <li key={l.id} style={{ ["--materia" as string]: l.colore }}>
                <a href={`${base}${l.percorsoQuiz}`} className="flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-white/5">
                  <span className="sans w-24 shrink-0 truncate text-xs font-semibold text-materia">{l.nomeMateria}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {l.numero} · {l.titolo}
                  </span>
                  <span className="sans shrink-0 text-xs text-muted">{p ? `scatola ${p.box}` : "nuova"}</span>
                  <span className="sans shrink-0 rounded-md bg-materia px-2 py-0.5 text-xs font-medium text-white">Inizia</span>
                </a>
              </li>
            );
          })}
        </ol>
      )}
      {settimana.domande > 0 && (
        <p className="sans mt-3 text-xs text-muted">
          Ultimi 7 giorni: {settimana.domande} domande · {Math.round(settimana.quota * 100)}% corrette
        </p>
      )}
    </>
  );
}
