import { useMemo } from "react";
import { useIdratato, useStato } from "@/lib/stato";
import { inScadenza, oggiIso, riepilogoSettimana } from "@/lib/ripasso";
import type { SchedaLezione } from "@/lib/schede";

// La tessera del ripasso nella Home: un anello con le lezioni da ripassare oggi
// (pieno = niente in scadenza, vuoto = tutto da fare) e, sotto, le domande della
// settimana. Porta al quiz della prima lezione in scadenza, o alla pagina Ripasso.
const OBIETTIVO_SETTIMANA = 60;

export function RipassoBreve({ lezioni, base }: { lezioni: SchedaLezione[]; base: string }) {
  const stato = useStato();
  const idratato = useIdratato();
  const oggi = oggiIso();
  const attive = useMemo(() => lezioni.filter((l) => l.haQuiz && stato.settings.materieAttive.includes(l.materia)), [lezioni, stato]);
  const daFare = useMemo(
    () => attive.filter((l) => inScadenza(stato.progress[l.id], oggi)).sort((a, b) => (stato.progress[a.id]?.nextReview ?? "").localeCompare(stato.progress[b.id]?.nextReview ?? "")),
    [attive, stato, oggi],
  );
  const settimana = riepilogoSettimana(stato.history, oggi);
  const prima = daFare[0];
  const href = prima ? `${base}${prima.percorsoQuiz}` : `${base}/ripasso`;
  const R = 34;
  const C = 2 * Math.PI * R;
  // Anello: arancione quanto è da ripassare (tutto = giro pieno), verde e pieno se non c'è nulla in scadenza.
  const quota = daFare.length === 0 ? 1 : daFare.length / Math.max(1, attive.length);

  return (
    <a href={href} className="pannello tessera group">
      <svg viewBox="0 0 84 84" className="h-[84px] w-[84px] shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="42" cy="42" r={R} fill="none" stroke="#3b2f27" strokeWidth="7" />
        <circle cx="42" cy="42" r={R} fill="none" stroke={daFare.length ? "#e07a4a" : "#8fb26f"} strokeWidth="7" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={idratato ? C * (1 - quota) : C} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <span className="absolute left-[1.3rem] top-1/2 flex h-[84px] w-[84px] -translate-y-1/2 items-center justify-center">
        <span className="display text-[2rem] leading-none">{idratato ? daFare.length : ""}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="tessera-sopra">Da ripassare oggi</span>
        <span className="mt-1 block truncate text-[1.02rem] font-medium">
          {!idratato ? "…" : daFare.length === 0 ? "Tutto in regola" : daFare.length === 1 ? prima.titolo : `${daFare.length} lezioni in scadenza`}
        </span>
        <span className="mt-0.5 block truncate text-xs text-grafite">
          {!idratato ? " " : settimana.domande > 0 ? `${settimana.domande} domande questa settimana` : prima ? prima.nomeMateria : "Le flashcard valgono sempre"}
        </span>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-[#3b2f27]">
          <span className="block h-full rounded-full bg-[#c9a24f]" style={{ width: `${Math.min(100, ((idratato ? settimana.domande : 0) / OBIETTIVO_SETTIMANA) * 100)}%`, transition: "width 1s cubic-bezier(.2,.7,.2,1)" }} />
        </span>
      </span>
    </a>
  );
}
