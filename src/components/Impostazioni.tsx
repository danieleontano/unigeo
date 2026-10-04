import { useRef, useState } from "react";
import { aggiornaStato, azzeraStato, esportaStato, importaStato, useIdratato, useStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";

interface Props {
  materie: { id: string; nome: string; colore: string }[];
}

export function Impostazioni({ materie }: Props) {
  const stato = useStato();
  const idratato = useIdratato();
  const [esito, setEsito] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  if (!idratato) return <div className="h-10" aria-hidden="true" />;

  function esporta() {
    const blob = new Blob([esportaStato()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unigeo-${oggiIso()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setEsito("Fatto.");
  }

  async function importa(f: File | undefined) {
    if (!f) return;
    const testo = await f.text();
    if (!window.confirm("Sostituire lo stato attuale con quello del file?")) return;
    const r = importaStato(testo);
    setEsito(r.ok ? `Fatto: ${r.lezioni} lezioni.` : r.errore);
    if (file.current) file.current.value = "";
  }

  function azzera() {
    if (!window.confirm("Cancellare progressi e storico? Non si torna indietro.")) return;
    azzeraStato();
    setEsito("Fatto.");
  }

  function attiva(id: string, on: boolean) {
    aggiornaStato((s) => {
      const set = new Set(s.settings.materieAttive);
      if (on) set.add(id);
      else set.delete(id);
      return { ...s, settings: { ...s.settings, materieAttive: [...set] } };
    });
  }

  const lezioniSeguite = Object.keys(stato.progress).length;

  return (
    <div className="sans grid grid-cols-1 gap-4 text-sm">
      <section className="pannello p-4 sm:p-5">
      <h2 className="pannello-titolo">Materie attive</h2>
      <ul className="mt-2 divide-y divide-line border-t border-line">
        {materie.map((m) => (
          <li key={m.id}>
            <label className="flex cursor-pointer items-center gap-3 py-1.5">
              <input
                type="checkbox"
                checked={stato.settings.materieAttive.includes(m.id)}
                onChange={(e) => attiva(m.id, e.target.checked)}
                style={{ accentColor: m.colore }}
              />
              <span>{m.nome}</span>
            </label>
          </li>
        ))}
      </ul>
      </section>

      <section className="pannello p-4 sm:p-5">
      <h2 className="pannello-titolo">I tuoi dati</h2>
      <p className="mt-2 text-muted">
        {lezioniSeguite} lezioni con progressi · {stato.history.length} quiz fatti
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={esporta} className="rounded-md border border-line px-3 py-1.5 hover:bg-white/5">
          Esporta JSON
        </button>
        <button type="button" onClick={() => file.current?.click()} className="rounded-md border border-line px-3 py-1.5 hover:bg-white/5">
          Importa JSON
        </button>
        <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => importa(e.target.files?.[0])} />
        <button type="button" onClick={azzera} className="rounded-md border border-line px-3 py-1.5 text-muted hover:text-lava">
          Azzera
        </button>
      </div>
      {esito && <p className="mt-3 text-muted">{esito}</p>}
      </section>
    </div>
  );
}
