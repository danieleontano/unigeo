import { useIdratato, useStato, aggiornaStato } from "@/lib/stato";
import { anticipa, giorniTra, oggiIso, rimanda, type Progresso } from "@/lib/ripasso";
import type { SchedaLezione } from "@/lib/schede";

interface Props {
  lezioni: SchedaLezione[];
  base: string;
}

const LITIFICAZIONE = ["sedimento sciolto", "sedimento compattato", "cementazione", "roccia tenera", "roccia compatta"];

function etichettaScadenza(p: Progresso | undefined, oggi: string): string {
  if (!p) return "mai fatta";
  const g = giorniTra(oggi, p.nextReview);
  if (g < 0) return `in ritardo di ${-g} g`;
  if (g === 0) return "oggi";
  if (g === 1) return "domani";
  return `tra ${g} g`;
}

// Il calendario del ripasso, materia per materia: una riga per lezione con
// quiz, la litificazione (scatola 1-5), la scadenza, rimanda o anticipa.
export function Ripasso({ lezioni, base }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const oggi = oggiIso();

  const righe = lezioni
    .filter((l) => l.haQuiz && stato.settings.materieAttive.includes(l.materia))
    .map((l) => ({ l, p: stato.progress[l.id] }))
    .sort((a, b) => (a.p?.nextReview ?? oggi).localeCompare(b.p?.nextReview ?? oggi) || a.l.data.localeCompare(b.l.data));

  const materie = [...new Map(righe.map(({ l }) => [l.materia, { nome: l.nomeMateria, colore: l.colore }])).entries()];

  function cambia(id: string, fn: (p: Progresso) => Progresso) {
    aggiornaStato((s) => {
      const p = s.progress[id] ?? { box: 1, nextReview: oggi, wrongIds: [] };
      return { ...s, progress: { ...s.progress, [id]: fn(p) } };
    });
  }

  if (!idratato) return <div className="h-10" aria-hidden="true" />;
  if (righe.length === 0) return <p className="mt-2 text-sm text-grafite">Nessuna lezione con quiz nelle materie attive.</p>;

  return (
    <div className="mt-4 space-y-8">
      {materie.map(([materia, m]) => {
        const mie = righe.filter(({ l }) => l.materia === materia);
        const scadute = mie.filter(({ p }) => !p || p.nextReview <= oggi).length;
        return (
          <section key={materia} id={materia} className="scroll-mt-20" style={{ ["--materia" as string]: m.colore } as React.CSSProperties}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl">{m.nome}</h2>
              <span className="font-sans text-xs text-grafite">
                {scadute > 0 ? (
                  <>
                    <span className="font-semibold text-materia">{scadute}</span> da fare
                  </>
                ) : (
                  "tutto in pari"
                )}
                {" · "}
                <a href={`${base}/quiz/${materia}`} className="hover:text-inchiostro">
                  quiz misto →
                </a>
              </span>
            </div>
            <ol className="mt-2 divide-y divide-filetto border-y border-filetto">
              {mie.map(({ l, p }) => {
                const scaduta = !p || p.nextReview <= oggi;
                return (
                  <li key={l.id} className="riga">
                    <a href={`${base}${l.percorsoQuiz}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="display w-6 shrink-0 text-right text-sm font-semibold text-materia">{l.numero}</span>
                      <span className="min-w-0 flex-1 truncate">{l.titolo}</span>
                    </a>
                    <span
                      className={`h-5 w-8 shrink-0 rounded-sm border border-filetto ${p ? `lito-${p.box}` : ""}`}
                      title={p ? `Scatola ${p.box}: ${LITIFICAZIONE[p.box - 1]}` : "Mai fatta"}
                      aria-label={p ? `Scatola ${p.box}` : "Mai fatta"}
                    />
                    <span className={`sans w-24 shrink-0 text-right text-xs tabular-nums ${scaduta ? "font-medium text-materia" : "text-grafite"}`}>{etichettaScadenza(p, oggi)}</span>
                    <span className="sans flex shrink-0 gap-1 text-xs">
                      <button type="button" onClick={() => cambia(l.id, (x) => rimanda(x, oggi))} className="rounded-sm border border-filetto px-1.5 py-0.5 text-grafite hover:text-inchiostro" title="Rimanda di un giorno">
                        +1
                      </button>
                      <button type="button" onClick={() => cambia(l.id, (x) => anticipa(x, oggi))} className="rounded-sm border border-filetto px-1.5 py-0.5 text-grafite hover:text-inchiostro disabled:opacity-30" title="Anticipa a oggi" disabled={scaduta}>
                        Oggi
                      </button>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
