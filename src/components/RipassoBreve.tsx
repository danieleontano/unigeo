import { useMemo } from "react";
import { useIdratato, useStato } from "@/lib/stato";
import { inScadenza, oggiIso, riepilogoSettimana } from "@/lib/ripasso";
import type { SchedaLezione } from "@/lib/schede";

// La scheda compatta della Home: quante lezioni sono da ripassare oggi e,
// se ce n'è una, porta dritta al suo quiz. Il resto sta nella pagina Ripasso.
export function RipassoBreve({ lezioni, base }: { lezioni: SchedaLezione[]; base: string }) {
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
  const prima = daFare[0];
  const href = prima ? `${base}${prima.percorsoQuiz}` : `${base}/ripasso`;

  return (
    <a href={href} className="pannello scheda scheda-riga group !items-center">
      <span className="chip shrink-0">
        <svg className="h-5 w-5" aria-hidden="true">
          <use href="#ripasso" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-grafite">Da ripassare oggi</span>
        <span className="mt-0.5 block truncate text-[0.95rem] font-medium">
          {!idratato ? "…" : daFare.length === 0 ? "Niente in scadenza" : daFare.length === 1 ? prima.titolo : `${daFare.length} lezioni`}
        </span>
        <span className="block truncate text-xs text-grafite">
          {!idratato ? " " : settimana.domande > 0 ? `${settimana.domande} domande negli ultimi 7 giorni` : prima ? prima.nomeMateria : "Le flashcard valgono sempre"}
        </span>
      </span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-grafite transition group-hover:translate-x-0.5" aria-hidden="true">
        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
