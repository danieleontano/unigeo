import { useMemo, useState } from "react";
import { aggiornaStato, useIdratato, useStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";
import type { CosaDaFare } from "@/lib/dafare";

interface Props {
  voci: CosaDaFare[];
  materie: { id: string; nome: string; colore: string }[];
  base: string;
  /** Sul Taccuino: solo le aperte, al massimo `limite`, senza aggiunta. */
  compatto?: boolean;
  limite?: number;
}

function inlineHtml(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>");
}

type Voce =
  | { tipo: "lezione"; chiave: string; testo: string; materia: string; etichetta: string; percorso: string; data: string; fatto?: string }
  | { tipo: "promemoria"; chiave: string; testo: string; data: string; fatto?: string };

// «Da fare»: le spunte dettate dai prof dentro le lezioni più i promemoria
// scritti a mano, in una lista sola. Lo stato è lo stesso delle caselle che
// si vedono negli appunti.
export function DaFare({ voci, materie, base, compatto = false, limite = 5 }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const [soloAperte, setSoloAperte] = useState(true);
  const [nuovo, setNuovo] = useState("");
  const perMateria = useMemo(() => new Map(materie.map((m) => [m.id, m])), [materie]);

  const lista: Voce[] = useMemo(() => {
    const spunte = stato.dafare ?? {};
    const dalleLezioni: Voce[] = voci
      .filter((v) => stato.settings.materieAttive.includes(v.materia))
      .map((v) => ({
        tipo: "lezione",
        chiave: v.chiave,
        testo: v.testo,
        materia: v.materia,
        etichetta: `${perMateria.get(v.materia)?.nome ?? v.materia} · lez. ${v.numeroLezione}`,
        percorso: `/materie/${v.materia}/lezioni/${v.lezione.split("/")[1]}`,
        data: v.data,
        fatto: spunte[v.chiave],
      }));
    const manuali: Voce[] = (stato.promemoria ?? []).map((p) => ({ tipo: "promemoria", chiave: p.id, testo: p.testo, data: p.creato, fatto: p.fatto }));
    return [...manuali, ...dalleLezioni].sort((a, b) => {
      if (!!a.fatto !== !!b.fatto) return a.fatto ? 1 : -1;
      return b.data.localeCompare(a.data);
    });
  }, [voci, stato, perMateria]);

  if (!idratato) return <div className="h-10" aria-hidden="true" />;

  const aperte = lista.filter((v) => !v.fatto);
  const visibili = (compatto || soloAperte ? aperte : lista).slice(0, compatto ? limite : undefined);

  function spunta(v: Voce, on: boolean) {
    const oggi = oggiIso();
    aggiornaStato((s) => {
      if (v.tipo === "lezione") {
        const dafare = { ...(s.dafare ?? {}) };
        if (on) dafare[v.chiave] = oggi;
        else delete dafare[v.chiave];
        return { ...s, dafare };
      }
      return { ...s, promemoria: (s.promemoria ?? []).map((p) => (p.id === v.chiave ? { ...p, fatto: on ? oggi : undefined } : p)) };
    });
  }

  function aggiungi(e: { preventDefault(): void }) {
    e.preventDefault();
    const testo = nuovo.trim();
    if (!testo) return;
    aggiornaStato((s) => ({ ...s, promemoria: [...(s.promemoria ?? []), { id: `p${Date.now().toString(36)}`, testo, creato: oggiIso() }] }));
    setNuovo("");
  }

  function elimina(id: string) {
    aggiornaStato((s) => ({ ...s, promemoria: (s.promemoria ?? []).filter((p) => p.id !== id) }));
  }

  return (
    <div>
      {!compatto && (
        <form onSubmit={aggiungi} className="mb-4 flex gap-2">
          <input
            value={nuovo}
            onChange={(e) => setNuovo(e.target.value)}
            placeholder="Aggiungi una cosa da fare"
            className="w-full rounded-lg border border-filetto bg-white/60 px-3 py-1.5 font-sans text-sm outline-none focus:border-inchiostro"
          />
          <button type="submit" className="bottone bottone-lava shrink-0" disabled={!nuovo.trim()}>
            Aggiungi
          </button>
        </form>
      )}

      {visibili.length === 0 ? (
        <p className="text-sm text-grafite">{aperte.length === 0 ? "Tutto fatto." : "Niente da mostrare."}</p>
      ) : (
        <ol className="divide-y divide-filetto border-y border-filetto">
          {visibili.map((v) => (
            <li key={v.chiave} className="riga items-start py-2" style={v.tipo === "lezione" ? ({ ["--materia" as string]: perMateria.get(v.materia)?.colore } as React.CSSProperties) : undefined}>
              <input
                type="checkbox"
                checked={!!v.fatto}
                onChange={(e) => spunta(v, e.target.checked)}
                className="mt-1.5 h-4 w-4 shrink-0"
                style={{ accentColor: v.tipo === "lezione" ? "var(--materia)" : "var(--color-lava)" }}
                aria-label={v.fatto ? "Segna come da fare" : "Segna come fatta"}
              />
              <span className="min-w-0 flex-1">
                <span className={`block ${v.fatto ? "text-grafite line-through decoration-filetto" : ""}`} dangerouslySetInnerHTML={{ __html: inlineHtml(v.testo) }} />
                <span className="mt-0.5 block font-sans text-[0.7rem] text-grafite">
                  {v.tipo === "lezione" ? (
                    <a href={`${base}${v.percorso}`} className="font-semibold uppercase tracking-wider text-materia hover:underline">
                      {v.etichetta}
                    </a>
                  ) : (
                    <span className="font-semibold uppercase tracking-wider text-lava">Promemoria</span>
                  )}
                  {" · "}
                  {v.data.split("-").reverse().join("/")}
                  {v.fatto && <> · fatta il {v.fatto.split("-").reverse().join("/")}</>}
                </span>
              </span>
              {v.tipo === "promemoria" && !compatto && (
                <button type="button" onClick={() => elimina(v.chiave)} className="shrink-0 font-sans text-xs text-grafite hover:text-lava" aria-label="Elimina">
                  ×
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {!compatto && lista.some((v) => v.fatto) && (
        <p className="mt-3 font-sans text-xs">
          <button type="button" onClick={() => setSoloAperte((s) => !s)} className="text-grafite hover:text-inchiostro">
            {soloAperte ? `Mostra le fatte (${lista.length - aperte.length})` : "Nascondi le fatte"}
          </button>
        </p>
      )}
      {compatto && aperte.length > limite && (
        <p className="mt-2 font-sans text-xs text-grafite">
          <a href={`${base}/da-fare`} className="hover:text-inchiostro">
            e altre {aperte.length - limite} →
          </a>
        </p>
      )}
    </div>
  );
}
