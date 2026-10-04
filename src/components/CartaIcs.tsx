import type { UnitaICS } from "@/components/Tempo";

// La carta come quella stampata dalla Commissione: tre blocchi affiancati
// (Cenozoico + Mesozoico, Paleozoico, Precambriano), una riga per ogni unità
// foglia (di solito l'età/piano), i genitori che coprono le righe dei figli.
// Non è in scala: si legge come la carta ufficiale. I tre blocchi hanno la
// stessa altezza, come sul poster.

type Colonna = "supereone" | "eone" | "era" | "periodo" | "sottoperiodo" | "epoca" | "eta";

interface Blocco {
  titolo: string;
  /** Unità che copre tutte le righe nella prima colonna. */
  cima: string;
  radici: string[];
  colonne: Colonna[];
  larghezze: string;
}

const BLOCCHI: Blocco[] = [
  { titolo: "Cenozoico e Mesozoico", cima: "Phanerozoic", radici: ["Cenozoic", "Mesozoic"], colonne: ["eone", "era", "periodo", "sottoperiodo", "epoca", "eta"], larghezze: "20px 20px minmax(0,.6fr) minmax(0,.45fr) minmax(0,.85fr) minmax(0,1.1fr) 58px" },
  { titolo: "Paleozoico", cima: "Phanerozoic", radici: ["Paleozoic"], colonne: ["eone", "era", "periodo", "sottoperiodo", "epoca", "eta"], larghezze: "20px 20px minmax(0,.6fr) minmax(0,.45fr) minmax(0,.85fr) minmax(0,1.1fr) 58px" },
  { titolo: "Precambriano", cima: "Precambrian", radici: ["Proterozoic", "Archean", "Hadean"], colonne: ["supereone", "eone", "era", "periodo"], larghezze: "20px 20px minmax(0,1fr) minmax(0,1fr) 58px" },
];

const ALTEZZA = 1100;

function eta(ma: number | undefined) {
  if (ma === undefined) return "";
  if (ma === 0) return "0";
  return ma >= 1000 ? `~${(ma / 1000).toLocaleString("it-IT")} Ga` : ma.toLocaleString("it-IT", { maximumFractionDigits: 3 });
}

/** Come sul poster: «Cretacico superiore» sotto il Cretacico diventa «Superiore», «Piano 4 del Cambriano» diventa «Piano 4». */
function breve(u: UnitaICS, perId: Map<string, UnitaICS>) {
  let nome = u.nome.replace(/ del Cambriano$/, "");
  for (let p = u.sopra ? perId.get(u.sopra) : undefined; p; p = p.sopra ? perId.get(p.sopra) : undefined) {
    if (nome.startsWith(p.nome + " ")) {
      nome = nome.slice(p.nome.length + 1);
      return nome[0].toUpperCase() + nome.slice(1);
    }
  }
  return nome;
}

type Cella = { u: UnitaICS; riga: [number, number]; colonna: [number, number] };

function disponi(b: Blocco, perId: Map<string, UnitaICS>, figliDi: Map<string, UnitaICS[]>) {
  const celle: Cella[] = [];
  const foglie: UnitaICS[] = [];
  const ultima = b.colonne.length; // indice della colonna Ma
  function visita(u: UnitaICS): [number, number] {
    const inizio = foglie.length;
    const figli = figliDi.get(u.id) ?? [];
    if (figli.length === 0) foglie.push(u);
    else figli.forEach(visita);
    const riga: [number, number] = [inizio, foglie.length];
    const c = b.colonne.indexOf(u.livello as Colonna);
    // Un periodo senza sottoperiodi copre anche la colonna dei sottoperiodi;
    // una foglia arriva fino alla colonna Ma.
    const fine = figli.length === 0 ? ultima : u.livello === "periodo" && !figli.some((f) => f.livello === "sottoperiodo") && b.colonne.includes("sottoperiodo") ? c + 2 : c + 1;
    celle.push({ u, riga, colonna: [c, fine] });
    return riga;
  }
  b.radici.forEach((id) => {
    const u = perId.get(id);
    if (u) visita(u);
  });
  const cima = perId.get(b.cima);
  if (cima) celle.push({ u: cima, riga: [0, foglie.length], colonna: [0, 1] });
  return { celle, foglie };
}

export function CartaUfficiale({ unita, onScegli, scelta }: { unita: UnitaICS[]; onScegli: (u: UnitaICS) => void; scelta?: UnitaICS }) {
  const perId = new Map(unita.map((u) => [u.id, u]));
  const figliDi = new Map<string, UnitaICS[]>();
  for (const u of unita) {
    if (!u.sopra) continue;
    figliDi.set(u.sopra, [...(figliDi.get(u.sopra) ?? []), u]);
  }
  for (const xs of figliDi.values()) xs.sort((a, b) => (a.a ?? 0) - (b.a ?? 0));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {BLOCCHI.map((b) => {
        const { celle, foglie } = disponi(b, perId, figliDi);
        const alta = ALTEZZA / foglie.length;
        return (
          <section key={b.titolo} className="min-w-0">
            <h3 className="pannello-titolo mb-1.5">{b.titolo}</h3>
            <div
              className="grid overflow-hidden rounded-md border border-[#1a1411] bg-[#1a1411]"
              style={{ gridTemplateColumns: b.larghezze, gridTemplateRows: `repeat(${foglie.length}, ${Math.max(19, alta)}px)`, gap: 1 }}
            >
              {celle.map(({ u, riga, colonna }) => {
                const verticale = colonna[0] < 2 && colonna[1] - colonna[0] === 1;
                const righe = riga[1] - riga[0];
                const attiva = scelta?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onScegli(u)}
                    title={u.nome}
                    className={`relative flex min-w-0 overflow-hidden px-1 font-sans leading-tight text-black/85 transition hover:brightness-110 ${verticale ? "items-center justify-center" : "items-center"} ${attiva ? "z-10 outline outline-2 -outline-offset-2 outline-[#c9552a]" : ""}`}
                    style={{ gridRow: `${riga[0] + 1} / ${riga[1] + 1}`, gridColumn: `${colonna[0] + 1} / ${colonna[1] + 1}`, background: u.colore ?? "#ccc", fontSize: righe > 1 || verticale ? "0.7rem" : "0.64rem" }}
                  >
                    <span className={verticale ? "whitespace-nowrap font-semibold [writing-mode:vertical-rl] rotate-180" : `truncate ${u.livello === "periodo" || u.livello === "era" ? "font-semibold" : ""}`}>{breve(u, perId)}</span>
                  </button>
                );
              })}
              {/* Colonna Ma: l'età della base di ogni riga, col ▼ dove c'è un GSSP. */}
              {foglie.map((f, i) => (
                <span
                  key={"ma" + f.id}
                  className="flex items-end justify-end whitespace-nowrap bg-[#231c18] px-1 pb-px font-sans text-[0.6rem] tabular-nums text-[#c9bba4]"
                  style={{ gridRow: `${i + 1} / ${i + 2}`, gridColumn: `${b.colonne.length + 1} / ${b.colonne.length + 2}` }}
                >
                  {f.gssp && <span className="mr-0.5 text-[#e07a4a]" title="GSSP ratificato">▼</span>}
                  {eta(f.da)}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
