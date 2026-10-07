import { useEffect, useState } from "react";
import { giornoItaliano, indiceDelGiorno } from "@/lib/foto";

export interface CampioneVetrina {
  id: string;
  nome: string;
  categoria: string;
  /** Foto a piena risoluzione (/campionario/x.jpg). */
  file: string;
}

// Il campione del giorno: la foto dietro il saluto della Home, con il suo
// cartellino da museo. Cambia a mezzanotte italiana (si ricalcola nel browser;
// il server mette quello del momento della pubblicazione). Porta alla scheda
// nel campionario.
export function CampioneGiorno({ campioni, iniziale, base }: { campioni: CampioneVetrina[]; iniziale: number; base: string }) {
  const [i, setI] = useState(iniziale);
  useEffect(() => {
    // /?campione=granito mostra proprio quel campione (per provare o per condividere).
    const voluto = campioni.findIndex((c) => c.id === new URLSearchParams(location.search).get("campione"));
    setI(voluto >= 0 ? voluto : indiceDelGiorno(giornoItaliano(), campioni.length));
  }, [campioni]);
  const c = campioni[i];
  return (
    <>
      <div className="eroe-foto" aria-hidden="true">
        <img key={c.id} src={`${base}${c.file}`} alt="" decoding="async" fetchPriority="high" />
      </div>
      <a href={`${base}/campionario#${c.id}`} className="eroe-etichetta">
        <span className="eroe-etichetta-sopra">Campione del giorno</span>
        <span className="eroe-etichetta-nome">{c.nome}</span>
        <span className="eroe-etichetta-sotto">
          {c.categoria} <span aria-hidden="true">→</span>
        </span>
      </a>
    </>
  );
}
