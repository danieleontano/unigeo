import { useEffect, useMemo, useState } from "react";
import { aggiornaStato, useIdratato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";
import { Eruzione } from "./Eruzione";

export interface CampioneFoto {
  id: string;
  nome: string;
  tipo: "roccia" | "minerale";
  famiglia: string;
  caratteri: string;
  foto: { file: string; autore: string; licenza: string; pagina: string };
  altre?: { file: string; autore: string; licenza: string; pagina: string }[];
}

// Una foto a caso tra quelle del campione: si impara la roccia, non la foto.
function unaFoto(c: CampioneFoto): CampioneFoto {
  const tutte = [c.foto, ...(c.altre ?? [])];
  return { ...c, foto: tutte[Math.floor(Math.random() * tutte.length)] };
}

interface Props {
  campioni: CampioneFoto[];
  base: string;
}

const GIRI = 10;

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Le opzioni: il campione giusto più tre dello stesso tipo, preferendo quelli
// della stessa famiglia (sbagliare granito con diorite insegna, con il gesso no).
function opzioniPer(c: CampioneFoto, tutti: CampioneFoto[]): CampioneFoto[] {
  const stessoTipo = tutti.filter((x) => x.id !== c.id && x.tipo === c.tipo);
  const radice = c.famiglia.split("·")[0].trim();
  const vicini = mescola(stessoTipo.filter((x) => x.famiglia.startsWith(radice)));
  const altri = mescola(stessoTipo.filter((x) => !x.famiglia.startsWith(radice)));
  return mescola([c, ...[...vicini, ...altri].slice(0, 3)]);
}

type Fase = "inizio" | "gioco" | "fine" | "sfoglia";

// «Riconosci questa pietra»: la prova pratica dell'esame in tasca. Una foto
// alla volta in una vetrina da museo, quattro nomi; dopo la risposta il
// cartellino con famiglia e caratteri distintivi, e il credito della foto.
export function Riconosci({ campioni, base }: Props) {
  const idratato = useIdratato();
  const [fase, setFase] = useState<Fase>("inizio");
  const [giro, setGiro] = useState<CampioneFoto[]>([]);
  const [i, setI] = useState(0);
  const [scelta, setScelta] = useState<string | null>(null);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const [filtro, setFiltro] = useState<"tutti" | "roccia" | "minerale">("tutti");

  // Arrivando da un appunto (/campionario#granito) si apre il campionario su quel campione.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id || !campioni.some((c) => c.id === id)) return;
    setFase("sfoglia");
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "center" }));
  }, [campioni]);

  const pool = useMemo(() => campioni.filter((c) => filtro === "tutti" || c.tipo === filtro), [campioni, filtro]);
  const c = giro[i];
  const opzioni = useMemo(() => (c ? opzioniPer(c, campioni) : []), [c, campioni]);

  if (!idratato) return <div className="h-40" aria-hidden="true" />;

  const bottone = "sans rounded-sm px-3 py-1.5 text-sm font-medium";
  const pieno = `${bottone} bg-lava text-white disabled:opacity-40`;
  const vuoto = `${bottone} border border-filetto text-inchiostro hover:bg-sabbia`;

  function inizia() {
    setGiro(mescola(pool).slice(0, Math.min(GIRI, pool.length)).map(unaFoto));
    setI(0);
    setScelta(null);
    setEsiti([]);
    setFase("gioco");
  }

  function rispondi(id: string) {
    if (scelta) return;
    setScelta(id);
    setEsiti((e) => [...e, id === c.id]);
  }

  function avanti() {
    if (i + 1 < giro.length) {
      setI(i + 1);
      setScelta(null);
    } else {
      const corrette = esiti.filter(Boolean).length;
      aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "campionario/foto", correct: corrette, total: giro.length }] }));
      setFase("fine");
    }
  }

  const Credito = ({ x }: { x: CampioneFoto }) => (
    <a href={x.foto.pagina} target="_blank" rel="noopener noreferrer" className="font-sans text-[0.65rem] text-grafite hover:text-inchiostro">
      Foto: {x.foto.autore} · {x.foto.licenza} · Wikimedia Commons
    </a>
  );

  if (fase === "sfoglia") {
    return (
      <div>
        <button type="button" onClick={() => setFase("inizio")} className={vuoto}>
          ← Indietro
        </button>
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {campioni.map((x) => (
            <li key={x.id} id={x.id} className="vetrina scroll-mt-20 overflow-hidden">
              <img src={`${base}${x.foto.file}`} alt={x.nome} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="foglio rounded-none p-3 pt-4">
                <p className="display text-lg leading-tight">{x.nome}</p>
                <p className="etichetta mt-0.5 !text-[0.6rem]">{x.famiglia}</p>
                <p className="mt-1.5 text-[0.85rem] leading-snug text-grafite">{x.caratteri}</p>
                <div className="mt-2">
                  <Credito x={x} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (fase === "inizio") {
    return (
      <div className="foglio p-5 pt-7">
        <p className="text-[0.95rem]">
          {GIRI} foto, quattro nomi. Come la prova pratica: guarda tessitura, colore, cristalli, vescicole.
        </p>
        <div className="segmentato mt-4">
          {(["tutti", "roccia", "minerale"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFiltro(f)} aria-pressed={filtro === f}>
              {f === "tutti" ? `Tutti (${campioni.length})` : f === "roccia" ? `Rocce (${campioni.filter((x) => x.tipo === "roccia").length})` : `Minerali (${campioni.filter((x) => x.tipo === "minerale").length})`}
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={inizia} className={pieno}>
            Inizia il riconoscimento
          </button>
          <button type="button" onClick={() => setFase("sfoglia")} className={vuoto}>
            Sfoglia il campionario
          </button>
        </div>
      </div>
    );
  }

  if (fase === "fine") {
    const corrette = esiti.filter(Boolean).length;
    const quota = giro.length ? corrette / giro.length : 0;
    return (
      <div className="foglio entra-girando p-5 pt-7">
        <Eruzione attiva={quota >= 0.8} />
        <p className="etichetta">Riconoscimento concluso</p>
        <p className="display mt-2 text-4xl font-semibold">
          {corrette} <span className="text-xl text-grafite">su {giro.length}</span>
        </p>
        <ul className="mt-4 grid grid-cols-5 gap-1.5">
          {giro.map((x, k) => (
            <li key={x.id} className="relative" title={x.nome}>
              <img src={`${base}${x.foto.file}`} alt={x.nome} className={`aspect-square w-full rounded-sm object-cover ${esiti[k] ? "" : "opacity-50 grayscale"}`} />
              <span className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ${esiti[k] ? "bg-muschio" : "bg-lava"}`} />
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={inizia} className={pieno}>
            Un altro giro
          </button>
          <button type="button" onClick={() => setFase("sfoglia")} className={vuoto}>
            Sfoglia il campionario
          </button>
        </div>
      </div>
    );
  }

  const giusta = scelta === c.id;
  return (
    <div>
      <p className="sans flex items-center justify-between text-xs text-grafite">
        <span>
          Campione {i + 1} / {giro.length}
        </span>
        <span>{c.tipo === "roccia" ? "Che roccia è?" : "Che minerale è?"}</span>
      </p>
      <div className="mt-1 h-1 w-full rounded bg-sabbia">
        <div className="h-1 rounded bg-lava transition-[width] duration-500" style={{ width: `${((i + (scelta ? 1 : 0)) / giro.length) * 100}%` }} />
      </div>

      <figure key={c.id} className={`vetrina entra-girando relative mt-4 ${scelta ? (giusta ? "bagliore" : "crepa") : ""}`}>
        <img src={`${base}${c.foto.file}`} alt="Campione da riconoscere" className="aspect-[4/3] w-full object-cover" />
        <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-1.5 pt-6 text-right">
          <span className="font-sans text-[0.6rem] text-white/80">n. {String(i + 1).padStart(3, "0")}</span>
        </figcaption>
      </figure>

      <ol className="mt-4 grid grid-cols-2 gap-2">
        {opzioni.map((o) => {
          const st = scelta ? (o.id === c.id ? "giusta" : o.id === scelta ? "sbagliata" : "") : "";
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={!!scelta}
                onClick={() => rispondi(o.id)}
                className={`w-full rounded-sm border px-3 py-2.5 text-left text-[0.95rem] transition ${
                  st === "giusta" ? "border-muschio bg-muschio/20" : st === "sbagliata" ? "border-lava bg-lava/20" : "border-filetto hover:border-grafite"
                }`}
              >
                {o.nome}
              </button>
            </li>
          );
        })}
      </ol>

      {scelta && (
        <div className="foglio mt-4 p-4 pt-6">
          <p className={`sans text-xs font-semibold uppercase tracking-[0.18em] ${giusta ? "text-muschio" : "text-lava"}`}>{giusta ? "Riconosciuto" : `Era ${c.nome}`}</p>
          <p className="display mt-1 text-2xl leading-tight">{c.nome}</p>
          <p className="etichetta mt-0.5">{c.famiglia}</p>
          <p className="mt-2 text-[0.95rem] leading-snug">{c.caratteri}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={avanti} className={pieno}>
              {i + 1 < giro.length ? "Prossimo campione" : "Chiudi"}
            </button>
            <Credito x={c} />
          </div>
        </div>
      )}
    </div>
  );
}
