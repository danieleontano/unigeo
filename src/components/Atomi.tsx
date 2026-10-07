import { useEffect, useMemo, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";
import {
  BANDE,
  C,
  EV,
  H,
  ISOTOPI,
  METALLI,
  apice,
  bandaDi,
  coloreVisibile,
  elettroni,
  energiaCinetica,
  energiaDaLambda,
  formattaLambda,
  frequenza,
  lambdaSoglia,
  leggiNumero,
  lunghezzaOnda,
  massaMedia,
  neutroni,
  protoni,
  scientifico,
  testoCarica,
  vicino,
  type ElementoBase,
  type Specie,
} from "@/lib/atomi";

// «Atomi e luce» (Chimica, lezione 2): gli esercizi sugli ioni fatti in aula,
// gli isotopi con la massa atomica media, la luce come onda e come fotone, e
// l'effetto fotoelettrico da vedere. Tutti i numeri sono quelli del prof
// (c = 3,00 × 10⁸ m/s, h = 6,63 × 10⁻³⁴ J·s).

type Modo = "particelle" | "isotopi" | "luce" | "fotoelettrico";

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const scegli = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const pieno = "sans rounded-md px-3 py-1.5 text-sm font-medium bg-lava text-white disabled:opacity-40";
const vuoto = "sans rounded-md border border-filetto px-3 py-1.5 text-sm hover:bg-white/5";
const campo = "w-full rounded-md border border-filetto bg-transparent px-3 py-2 font-sans text-base outline-none focus:border-grafite";

function registra(lezione: string, giuste: number, totale: number) {
  aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: lezione, correct: giuste, total: totale }] }));
}

/** Il simbolo come si scrive: numero di massa in alto, atomico in basso, carica in alto a destra. */
function Nuclide({ s, grande = false }: { s: Specie; grande?: boolean }) {
  return (
    <span className={`inline-flex items-center ${grande ? "text-6xl" : "text-3xl"} display leading-none`}>
      <span className={`mr-1 flex flex-col font-sans font-medium leading-none ${grande ? "text-xl gap-1" : "text-sm gap-0.5"}`}>
        <span>{s.a}</span>
        <span>{s.el.z}</span>
      </span>
      {s.el.simbolo}
      {s.q !== 0 && <sup className={`font-sans ${grande ? "text-2xl" : "text-base"} -mt-3 ml-0.5 self-start`}>{testoCarica(s.q)}</sup>}
    </span>
  );
}
const testoSpecie = (el: ElementoBase, q: number) => `${el.simbolo}${apice(testoCarica(q))}`;

// ---------------------------------------------------------------------------
// Particelle
// ---------------------------------------------------------------------------

// Ioni da libro (le cariche delle slide: mai oltre 3+ / 3−).
const IONI: [string, number][] = [
  ["Li", 1], ["Na", 1], ["K", 1], ["Rb", 1], ["Ag", 1], ["Be", 2], ["Mg", 2], ["Ca", 2], ["Sr", 2], ["Ba", 2], ["Zn", 2], ["Fe", 2], ["Cu", 2], ["Pb", 2],
  ["Al", 3], ["Fe", 3], ["F", -1], ["Cl", -1], ["Br", -1], ["I", -1], ["O", -2], ["S", -2], ["Se", -2], ["N", -3], ["P", -3],
];
const NEUTRI = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Fe", "Cu", "Zn", "Br", "Kr"];

type Domanda =
  | { tipo: "conta"; s: Specie }
  | { tipo: "specie"; elettroni: number; q: number; giusta: string; opzioni: string[] }
  | { tipo: "isotopi"; x: Specie; y: Specie; giusta: string };

const OPZIONI_ISOTOPI = ["Isotopi dello stesso elemento", "Elementi diversi", "Lo stesso elemento: cambia solo la carica"];

// Il numero di massa di un esercizio: un isotopo naturale quando lo conosciamo,
// altrimenti la massa atomica arrotondata (a volte un neutrone in più o in meno).
function numeroDiMassa(el: ElementoBase) {
  const noti = ISOTOPI[el.simbolo]?.filter((i) => i.ab > 1).map((i) => i.a);
  if (noti?.length) return scegli(noti);
  const base = Math.round(el.massa ?? el.z * 2);
  return Math.max(el.z, base + scegli([-1, 0, 0, 0, 0, 1]));
}
/** La carica a parole: «1+», «2−». */
const caricaTesto = (q: number) => `${Math.abs(q)}${q > 0 ? "+" : "−"}`;

function generaDomande(elementi: ElementoBase[]): Domanda[] {
  const el = (simbolo: string) => elementi.find((e) => e.simbolo === simbolo)!;
  const specie = (): Specie => {
    if (Math.random() < 0.65) {
      const [s, q] = scegli(IONI);
      return { el: el(s), a: numeroDiMassa(el(s)), q };
    }
    const e = el(scegli(NEUTRI));
    return { el: e, a: numeroDiMassa(e), q: 0 };
  };
  const tipi = mescola(["conta", "conta", "conta", "conta", "specie", "specie", "specie", "isotopi", "isotopi", "conta"] as const);
  return tipi.map((tipo): Domanda => {
    if (tipo === "conta") return { tipo, s: specie() };
    if (tipo === "specie") {
      const [s, q0] = Math.random() < 0.8 ? scegli(IONI) : ([scegli(NEUTRI), 0] as [string, number]);
      const giusto = el(s);
      const e = giusto.z - q0;
      // Gli errori tipici: scambiare elettroni e protoni, dimenticare la carica, sbagliare il segno.
      const z = [e, giusto.z - 2 * q0 + 0, giusto.z + 1, giusto.z - 1, e + q0 * 2].filter((n) => n !== giusto.z && n >= 1);
      const altri = mescola(Array.from(new Set(z)))
        .slice(0, 3)
        .map((n) => elementi.find((x) => x.z === n))
        .filter((x): x is ElementoBase => !!x);
      return { tipo, elettroni: e, q: q0, giusta: testoSpecie(giusto, q0), opzioni: mescola([testoSpecie(giusto, q0), ...altri.map((x) => testoSpecie(x, q0))]) };
    }
    const caso = scegli(["isotopi", "diversi", "carica"] as const);
    const e = el(scegli(["C", "O", "N", "Cl", "Mg", "Ne", "Si", "S", "H", "Li"]));
    const a = numeroDiMassa(e);
    if (caso === "isotopi") return { tipo, x: { el: e, a, q: 0 }, y: { el: e, a: a + scegli([1, 2, -1]), q: 0 }, giusta: OPZIONI_ISOTOPI[0] };
    if (caso === "carica") {
      const q = e.simbolo === "Cl" || e.simbolo === "O" || e.simbolo === "S" ? -1 : 1;
      return { tipo, x: { el: e, a, q: 0 }, y: { el: e, a, q }, giusta: OPZIONI_ISOTOPI[2] };
    }
    const z2 = Math.max(1, Math.min(36, e.z + scegli([-1, 1])));
    const e2 = elementi.find((x) => x.z === z2)!;
    return { tipo, x: { el: e, a, q: 0 }, y: { el: e2, a, q: 0 }, giusta: OPZIONI_ISOTOPI[1] };
  });
}

function Particelle({ elementi }: { elementi: ElementoBase[] }) {
  const [domande, setDomande] = useState(() => generaDomande(elementi));
  const [i, setI] = useState(0);
  const [scelta, setScelta] = useState<string | null>(null);
  const [valori, setValori] = useState({ p: "", n: "", e: "" });
  const [controllato, setControllato] = useState(false);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];

  function ricomincia() {
    setDomande(generaDomande(elementi));
    setI(0);
    setScelta(null);
    setValori({ p: "", n: "", e: "" });
    setControllato(false);
    setEsiti([]);
  }
  function avanti() {
    if (i + 1 >= domande.length) registra("chimica/atomi", esiti.filter(Boolean).length, domande.length);
    setI(i + 1);
    setScelta(null);
    setValori({ p: "", n: "", e: "" });
    setControllato(false);
  }

  if (i >= domande.length)
    return (
      <div className="pannello entra-girando p-5">
        <p className="pannello-titolo">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {domande.length}</span>
        </p>
        <button type="button" className={`${pieno} mt-4`} onClick={ricomincia}>
          Altre domande
        </button>
      </div>
    );

  const barra = (
    <div className="mb-3 flex items-center gap-3 font-sans text-xs text-grafite">
      <span>
        {i + 1} / {domande.length}
      </span>
      <span className="h-1 flex-1 overflow-hidden rounded-full bg-[#3b2f27]">
        <span className="block h-full rounded-full bg-lava transition-[width] duration-500" style={{ width: `${((i + (controllato || scelta ? 1 : 0)) / domande.length) * 100}%` }} />
      </span>
    </div>
  );

  if (d.tipo === "conta") {
    const giusti = { p: protoni(d.s), n: neutroni(d.s), e: elettroni(d.s) };
    const campi: [keyof typeof valori, string][] = [
      ["p", "Protoni"],
      ["n", "Neutroni"],
      ["e", "Elettroni"],
    ];
    const tutti = campi.every(([k]) => valori[k] !== "");
    return (
      <div className="mx-auto max-w-2xl">
        {barra}
        <form
          className="pannello p-5"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (controllato) return avanti();
            if (!tutti) return;
            const ok = campi.every(([k]) => Number(valori[k]) === giusti[k]);
            setControllato(true);
            setEsiti((x) => [...x, ok]);
          }}
        >
          <p className="pannello-titolo">Quante particelle?</p>
          <div className="my-4 flex items-center justify-center">
            <Nuclide s={d.s} grande />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {campi.map(([k, nome]) => {
              const giusto = Number(valori[k]) === giusti[k];
              return (
                <label key={k} className="block font-sans text-xs text-grafite">
                  {nome}
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    value={valori[k]}
                    readOnly={controllato}
                    onChange={(e) => setValori({ ...valori, [k]: e.target.value.replace(/[^0-9]/g, "") })}
                    className={`${campo} mt-1 text-center text-xl ${controllato ? (giusto ? "!border-muschio" : "!border-lava") : ""}`}
                    autoFocus={k === "p"}
                  />
                  {controllato && !giusto && <span className="mt-1 block text-center text-sm text-lava">{giusti[k]}</span>}
                </label>
              );
            })}
          </div>
          {controllato && (
            <p className="mt-4 text-sm leading-snug">
              <b>Protoni</b> = Z = {d.s.el.z}. <b>Neutroni</b> = A − Z = {d.s.a} − {d.s.el.z} = {giusti.n}. <b>Elettroni</b> = Z {d.s.q === 0 ? "(atomo neutro)" : d.s.q > 0 ? `− ${d.s.q} (catione: ha perso elettroni)` : `+ ${-d.s.q} (anione: ne ha acquistati)`} = {giusti.e}.
            </p>
          )}
          <button type="submit" className={`${pieno} mt-4`} disabled={!controllato && !tutti}>
            {controllato ? (i + 1 < domande.length ? "Avanti" : "Chiudi") : "Controlla"}
          </button>
        </form>
      </div>
    );
  }

  const scegliRisposta = (r: string) => {
    if (scelta) return;
    setScelta(r);
    setEsiti((x) => [...x, r === d.giusta]);
  };
  const classe = (o: string) =>
    `w-full rounded-md border px-4 py-3 text-left text-[0.98rem] transition ${scelta ? (o === d.giusta ? "border-muschio bg-muschio/15" : o === scelta ? "border-lava bg-lava/15" : "border-filetto opacity-60") : "border-filetto hover:border-grafite"}`;

  return (
    <div className="mx-auto max-w-2xl">
      {barra}
      <div className="pannello p-5">
        {d.tipo === "specie" ? (
          <>
            <p className="pannello-titolo">Quale specie?</p>
            <p className="display mt-2 text-2xl leading-snug">
              {d.elettroni} elettroni, {d.q === 0 ? "carica neutra" : `carica ${caricaTesto(d.q)}`}
            </p>
            <p className="mt-1 text-sm text-grafite">Serve la tavola periodica: i protoni (Z) sono gli elettroni più la carica.</p>
          </>
        ) : (
          <>
            <p className="pannello-titolo">Cosa sono queste due specie?</p>
            <div className="my-4 flex items-center justify-center gap-8">
              <Nuclide s={d.x} grande />
              <span className="text-grafite">e</span>
              <Nuclide s={d.y} grande />
            </div>
          </>
        )}
        <ol className={`mt-4 grid gap-2 ${d.tipo === "specie" ? "grid-cols-2" : "grid-cols-1"}`}>
          {(d.tipo === "specie" ? d.opzioni : OPZIONI_ISOTOPI).map((o) => (
            <li key={o}>
              <button type="button" disabled={!!scelta} onClick={() => scegliRisposta(o)} className={classe(o)}>
                {o}
              </button>
            </li>
          ))}
        </ol>
        {scelta && (
          <div className="mt-4">
            <p className="text-sm leading-snug">
              {d.tipo === "specie"
                ? `Z = elettroni + carica = ${d.elettroni} ${d.q >= 0 ? "+" : "−"} ${Math.abs(d.q)} = ${d.elettroni + d.q}: ${d.giusta}.`
                : d.giusta === OPZIONI_ISOTOPI[0]
                  ? "Stesso numero di protoni (stesso elemento), diverso numero di neutroni: sono isotopi."
                  : d.giusta === OPZIONI_ISOTOPI[1]
                    ? "Hanno lo stesso numero di massa ma Z diverso: sono elementi diversi (due nuclidi con lo stesso A non sono isotopi)."
                    : "Stesso nucleo, cambia solo il numero di elettroni: non sono isotopi, è lo stesso atomo (o ione)."}
            </p>
            <button type="button" className={`${pieno} mt-3`} onClick={avanti}>
              {i + 1 < domande.length ? "Avanti" : "Chiudi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Isotopi
// ---------------------------------------------------------------------------

function Isotopi({ elementi }: { elementi: ElementoBase[] }) {
  const simboli = Object.keys(ISOTOPI);
  const [simbolo, setSimbolo] = useState("Cl");
  const [risposta, setRisposta] = useState("");
  const [rivela, setRivela] = useState(false);
  const el = elementi.find((e) => e.simbolo === simbolo)!;
  const isotopi = ISOTOPI[simbolo];
  const media = massaMedia(isotopi);
  const noti = isotopi.filter((i) => i.ab > 0);
  const massaMax = Math.max(...isotopi.map((i) => i.ab));
  const dato = leggiNumero(risposta);
  const giusta = dato !== null && Math.abs(dato - media) <= 0.03;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="pannello p-4 sm:p-5">
        <p className="pannello-titolo">Elemento</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {simboli.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => (setSimbolo(s), setRisposta(""), setRivela(false))}
              aria-pressed={s === simbolo}
              className={`min-w-10 rounded-md border px-2 py-1.5 font-sans text-sm transition ${s === simbolo ? "border-[#a8643c] bg-[#a8643c]/20 text-[#e3b08c]" : "border-filetto hover:border-grafite"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-baseline gap-3">
          <span className="display text-5xl leading-none">{el.simbolo}</span>
          <span className="text-grafite">
            {el.nome} · Z = {el.z} · {isotopi.length} isotopi
          </span>
        </div>
        <ul className="mt-4 space-y-2.5">
          {isotopi.map((i) => (
            <li key={i.a} className="grid grid-cols-[4.5rem_minmax(0,1fr)_6.5rem] items-center gap-3">
              <Nuclide s={{ el, a: i.a, q: 0 }} />
              <div>
                <div className="h-3 overflow-hidden rounded-full bg-[#3b2f27]">
                  <div className="h-full rounded-full bg-[#c9a24f] transition-[width] duration-500" style={{ width: `${Math.max(i.ab > 0 ? 1.5 : 0, (i.ab / massaMax) * 100)}%` }} />
                </div>
                <p className="mt-0.5 font-sans text-[0.7rem] text-grafite">
                  {i.a - el.z} neutroni{i.radioattivo ? " · radioattivo" : ""}
                </p>
              </div>
              <div className="text-right font-sans text-sm tabular-nums">
                {i.ab > 0 ? `${i.ab.toLocaleString("it-IT", { maximumFractionDigits: 4 })}%` : "in tracce"}
                <span className="block text-[0.7rem] text-grafite">{i.massa.toLocaleString("it-IT", { minimumFractionDigits: 3, maximumFractionDigits: 5 })} u</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.78rem] leading-snug text-grafite">I protoni sono sempre {el.z}: cambia solo il numero di neutroni. Le abbondanze sono quelle naturali sulla Terra.</p>
      </div>

      <div className="pannello self-start p-4 sm:p-5">
        <p className="pannello-titolo">Massa atomica media</p>
        <p className="mt-2 text-sm leading-snug">È la media delle masse degli isotopi pesata sulle abbondanze: quella che trovi sulla tavola periodica.</p>
        <label className="mt-3 block font-sans text-xs text-grafite">
          Calcolala (in u)
          <input
            inputMode="decimal"
            value={risposta}
            onChange={(e) => setRisposta(e.target.value)}
            placeholder="es. 35,45"
            className={`${campo} mt-1 ${dato !== null && rivela ? (giusta ? "!border-muschio" : "!border-lava") : ""}`}
          />
        </label>
        <button type="button" className={`${vuoto} mt-3`} onClick={() => setRivela(true)}>
          Mostra il calcolo
        </button>
        {rivela && (
          <div className="mt-3 border-t border-filetto pt-3 text-sm leading-relaxed">
            <p className="font-sans text-[0.8rem] text-grafite">
              {noti.map((i) => `(${i.massa.toLocaleString("it-IT", { maximumFractionDigits: 5 })} × ${i.ab.toLocaleString("it-IT", { maximumFractionDigits: 4 })})`).join(" + ")} ÷ 100
            </p>
            <p className="display mt-1 text-2xl">{media.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} u</p>
            <p className="text-grafite">Sulla tavola periodica: {el.massa?.toLocaleString("it-IT")} u.</p>
            {dato !== null && <p className={giusta ? "text-muschio" : "text-lava"}>{giusta ? "Giusto." : "Il tuo valore non coincide: controlla le moltiplicazioni."}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Luce
// ---------------------------------------------------------------------------

const LOG_MIN = -12;
const LOG_MAX = 3;
const PRESET: { nome: string; lambda: number }[] = [
  { nome: "Laser rosso", lambda: 700e-9 },
  { nome: "Laser blu", lambda: 400e-9 },
  { nome: "Raggi X", lambda: 1e-10 },
  { nome: "Forno a microonde", lambda: 0.122 },
  { nome: "Radio FM", lambda: 3 },
];
const posizione = (lambda: number) => ((Math.log10(lambda) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;

type DomandaLuce =
  | { tipo: "numero"; testo: string; giusto: number; unita: string; soluzione: string }
  | { tipo: "scelta"; testo: string; opzioni: string[]; giusta: string; soluzione: string };

function generaLuce(): DomandaLuce[] {
  const lista: DomandaLuce[] = [];
  const colori = [
    ["rossa", 700],
    ["arancione", 620],
    ["gialla", 580],
    ["verde", 530],
    ["blu", 450],
    ["violetta", 400],
  ] as const;
  for (let k = 0; k < 2; k++) {
    const [nome, nm] = scegli([...colori]);
    const nu = frequenza(nm * 1e-9);
    lista.push({ tipo: "numero", testo: `Una luce ${nome} ha λ = ${nm} nm. Quanto vale la frequenza?`, giusto: nu, unita: "Hz", soluzione: `ν = c / λ = (3,00 × 10⁸ m/s) / (${nm} × 10⁻⁹ m) = ${scientifico(nu)} Hz.` });
  }
  {
    const nu14 = scegli([4.3, 5.2, 6.0, 6.8, 7.5]);
    const nu = nu14 * 1e14;
    lista.push({ tipo: "numero", testo: `Una radiazione ha frequenza ${nu14.toLocaleString("it-IT")} × 10¹⁴ Hz. Quanto vale la lunghezza d'onda, in nm?`, giusto: lunghezzaOnda(nu) * 1e9, unita: "nm", soluzione: `λ = c / ν = (3,00 × 10⁸) / (${nu14.toLocaleString("it-IT")} × 10¹⁴) = ${Number((lunghezzaOnda(nu) * 1e9).toPrecision(3)).toLocaleString("it-IT")} nm.` });
  }
  {
    const nm = scegli([400, 450, 500, 600, 700]);
    const E = energiaDaLambda(nm * 1e-9);
    lista.push({ tipo: "numero", testo: `Quanta energia ha un fotone di lunghezza d'onda ${nm} nm? (in joule)`, giusto: E, unita: "J", soluzione: `E = h·ν = h·c/λ = (6,63 × 10⁻³⁴ J·s)(3,00 × 10⁸ m/s) / (${nm} × 10⁻⁹ m) = ${scientifico(E)} J.` });
  }
  for (const [x, y] of [
    [{ n: "il laser rosso (700 nm)", l: 700e-9 }, { n: "il laser blu (400 nm)", l: 400e-9 }],
    [{ n: "i raggi X", l: 1e-10 }, { n: "le onde radio", l: 3 }],
    [{ n: "le microonde (12 cm)", l: 0.12 }, { n: "la luce verde (530 nm)", l: 530e-9 }],
  ] as const) {
    const [a, b] = Math.random() < 0.5 ? [x, y] : [y, x];
    const che = scegli(["la frequenza", "l'energia del fotone"] as const);
    lista.push({
      tipo: "scelta",
      testo: `Quale tra ${a.n} e ${b.n} ha ${che} più alta?`,
      opzioni: [a.n, b.n],
      giusta: a.l < b.l ? a.n : b.n,
      soluzione: `λ e ν sono inversamente proporzionali (λ·ν = c) ed E = h·ν: la lunghezza d'onda più corta ha frequenza ed energia più alte. Qui: ${a.l < b.l ? a.n : b.n}.`,
    });
  }
  return mescola(lista).slice(0, 7);
}

function Luce() {
  const [vista, setVista] = useState<"spettro" | "allena">("spettro");
  const [esp, setEsp] = useState(-6.22); // 600 nm: arancione, nel visibile
  const lambda = Math.pow(10, esp);
  const nu = frequenza(lambda);
  const E = energiaDaLambda(lambda);
  const banda = bandaDi(lambda);
  const visibile = banda.nome === "Visibile";
  const nm = lambda * 1e9;

  return (
    <div>
      <div className="segmentato mb-4">
        {(["spettro", "allena"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setVista(v)} aria-pressed={vista === v}>
            {v === "spettro" ? "Lo spettro" : "Allenati sui calcoli"}
          </button>
        ))}
      </div>
      {vista === "allena" ? (
        <AllenaLuce />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="pannello p-4 sm:p-5">
            <p className="pannello-titolo">Lo spettro elettromagnetico</p>
            <div className="relative mt-5">
              <div className="flex h-12 overflow-hidden rounded-lg">
                {BANDE.map((b) => {
                  const da = Math.max(0, posizione(b.da));
                  const a = Math.min(100, posizione(b.a));
                  return (
                    <div
                      key={b.nome}
                      className="flex items-center justify-center overflow-hidden px-1 text-center font-sans text-[0.62rem] font-semibold leading-tight text-black/65"
                      style={{ width: `${a - da}%`, background: b.nome === "Visibile" ? "linear-gradient(90deg,#7b3ff2,#2b6fff,#2bd1ff,#3fe06b,#f7e63f,#ff9a2b,#ff3b2b)" : b.colore }}
                      title={b.nome}
                    >
                      {a - da > 9 ? b.nome : ""}
                    </div>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute -top-2 bottom-0 w-0.5 bg-[#f3ecdd]" style={{ left: `${posizione(lambda)}%` }}>
                <span className="absolute -top-3 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#f3ecdd]" />
              </div>
            </div>
            <div className="mt-1 flex justify-between font-sans text-[0.65rem] text-grafite">
              <span>1 pm · λ corta, ν alta, energia alta</span>
              <span>1 km · λ lunga, ν bassa, energia bassa</span>
            </div>
            <p className="mt-4 font-sans text-[0.65rem] text-grafite">Zoom sul visibile: da 400 nm (violetto) a 700 nm (rosso)</p>
            <div className="relative mt-1 h-5 rounded-md" style={{ background: `linear-gradient(90deg, ${Array.from({ length: 13 }, (_, k) => coloreVisibile(400 + k * 25)).join(", ")})` }}>
              {nm >= 400 && nm <= 700 && <span className="absolute -top-1 bottom-[-4px] w-0.5 bg-[#f3ecdd]" style={{ left: `${((nm - 400) / 300) * 100}%` }} />}
            </div>
            <input
              type="range"
              min={LOG_MIN}
              max={LOG_MAX}
              step={0.01}
              value={esp}
              onChange={(e) => setEsp(Number(e.target.value))}
              aria-label="Lunghezza d'onda (scala logaritmica)"
              className="mt-3 w-full accent-[#c9552a]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESET.map((p) => (
                <button key={p.nome} type="button" onClick={() => setEsp(Math.log10(p.lambda))} className={`${vuoto} !py-1 text-xs`}>
                  {p.nome}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-snug text-grafite">
              Il visibile è una fetta sottilissima: da circa 400 nm (violetto) a 700 nm (rosso). Tutte le radiazioni elettromagnetiche viaggiano nel vuoto alla stessa velocità, c = 3,00 × 10⁸ m/s: cambiano λ e ν, legate da <b>λ · ν = c</b>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="pannello overflow-hidden p-0">
              <div className="h-20" style={{ background: visibile ? coloreVisibile(nm) : `color-mix(in srgb, ${banda.colore} 55%, #241c17)` }} />
              <div className="p-4">
                <p className="pannello-titolo">Radiazione</p>
                <p className="display mt-0.5 text-2xl leading-tight">{banda.nome}</p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-sans text-sm">
                  <dt className="text-grafite">λ</dt>
                  <dd className="tabular-nums">{formattaLambda(lambda)}</dd>
                  <dt className="text-grafite">ν = c / λ</dt>
                  <dd className="tabular-nums">{scientifico(nu)} Hz</dd>
                  <dt className="text-grafite">E = h·ν</dt>
                  <dd className="tabular-nums">{scientifico(E)} J</dd>
                  <dt className="text-grafite" />
                  <dd className="tabular-nums text-grafite">{scientifico(E / EV)} eV</dd>
                </dl>
              </div>
            </div>
            <div className="pannello p-4 text-sm leading-snug">
              <p className="pannello-titolo">Le costanti</p>
              <p className="mt-2 tabular-nums">
                c = {scientifico(C, 3)} m/s
                <br />h = {scientifico(H, 3)} J·s
              </p>
              <p className="mt-2 text-grafite">Il fotone è la parte indivisibile della luce: la sua energia è E = h·ν.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AllenaLuce() {
  const [domande, setDomande] = useState(generaLuce);
  const [i, setI] = useState(0);
  const [testo, setTesto] = useState("");
  const [scelta, setScelta] = useState<string | null>(null);
  const [fatto, setFatto] = useState(false);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];

  function avanti() {
    if (i + 1 >= domande.length) registra("chimica/luce", esiti.filter(Boolean).length, domande.length);
    setI(i + 1);
    setTesto("");
    setScelta(null);
    setFatto(false);
  }
  if (i >= domande.length)
    return (
      <div className="pannello entra-girando p-5">
        <p className="pannello-titolo">Fatto</p>
        <p className="display mt-1 text-4xl font-semibold">
          {esiti.filter(Boolean).length} <span className="text-xl text-grafite">su {domande.length}</span>
        </p>
        <button type="button" className={`${pieno} mt-4`} onClick={() => (setDomande(generaLuce()), setI(0), setEsiti([]), setTesto(""), setScelta(null), setFatto(false))}>
          Altri calcoli
        </button>
      </div>
    );

  const dato = leggiNumero(testo);
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-3 font-sans text-xs text-grafite">
        {i + 1} / {domande.length} · c = 3,00 × 10⁸ m/s, h = 6,63 × 10⁻³⁴ J·s
      </p>
      <div className="pannello p-5">
        <p className="text-[1.05rem] leading-snug">{d.testo}</p>
        {d.tipo === "numero" ? (
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (fatto) return avanti();
              if (dato === null) return;
              setFatto(true);
              setEsiti((x) => [...x, vicino(dato, d.giusto, 0.03)]);
            }}
          >
            <label className="block font-sans text-xs text-grafite">
              Risposta in {d.unita} (scrivi per esempio 4,3e14 oppure 4,3 × 10^14)
              <input value={testo} readOnly={fatto} onChange={(e) => setTesto(e.target.value)} autoFocus className={`${campo} mt-1 ${fatto ? (vicino(dato, d.giusto, 0.03) ? "!border-muschio" : "!border-lava") : ""}`} />
            </label>
            {fatto && (
              <p className="mt-3 text-sm leading-snug">
                <b>{vicino(dato, d.giusto, 0.03) ? "Giusto. " : "Non esatto. "}</b>
                {d.soluzione}
              </p>
            )}
            <button type="submit" className={`${pieno} mt-4`} disabled={!fatto && dato === null}>
              {fatto ? (i + 1 < domande.length ? "Avanti" : "Chiudi") : "Controlla"}
            </button>
          </form>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {d.opzioni.map((o) => (
                <button
                  key={o}
                  type="button"
                  disabled={!!scelta}
                  onClick={() => (setScelta(o), setEsiti((x) => [...x, o === d.giusta]))}
                  className={`rounded-md border px-4 py-3 text-left transition ${scelta ? (o === d.giusta ? "border-muschio bg-muschio/15" : o === scelta ? "border-lava bg-lava/15" : "border-filetto opacity-60") : "border-filetto hover:border-grafite"}`}
                >
                  {o}
                </button>
              ))}
            </div>
            {scelta && (
              <>
                <p className="mt-3 text-sm leading-snug">{d.soluzione}</p>
                <button type="button" className={`${pieno} mt-3`} onClick={avanti}>
                  {i + 1 < domande.length ? "Avanti" : "Chiudi"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Effetto fotoelettrico
// ---------------------------------------------------------------------------

function Fotoelettrico() {
  const [metallo, setMetallo] = useState(METALLI[0]);
  const [nm, setNm] = useState(450);
  const [intensita, setIntensita] = useState(4);
  const lambda = nm * 1e-9;
  const Efot = energiaDaLambda(lambda) / EV;
  const Ek = energiaCinetica(lambda, metallo.phi);
  const emette = Ek > 0;
  const soglia = lambdaSoglia(metallo.phi) * 1e9;
  const colore = nm >= 380 && nm <= 780 ? coloreVisibile(nm) : nm < 380 ? "#a98bff" : "#d6694a";
  const lungo = 40 + 38 * Math.sqrt(Ek);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="pannello p-3 sm:p-4">
        <svg viewBox="0 0 480 240" className="block w-full" role="img" aria-label="Fotoni su una lastra di metallo">
          <rect width="480" height="240" rx="10" fill="#1b1512" />
          <rect x="40" y="170" width="400" height="46" rx="4" fill="#6b5b4d" />
          <rect x="40" y="170" width="400" height="6" rx="3" fill="#a8987f" />
          <text x="240" y="201" textAnchor="middle" fill="#efe4d0" fontSize="16" fontFamily="Fraunces, serif">
            {metallo.nome} ({metallo.simbolo})
          </text>
          {/* La sorgente */}
          <g transform="translate(20 20)">
            <circle cx="16" cy="16" r="14" fill={colore} opacity="0.9" />
            <circle cx="16" cy="16" r="6" fill="#fff" opacity="0.8" />
          </g>
          {Array.from({ length: intensita }, (_, k) => {
            const ritardo = (k * 2.4) / intensita;
            const x0 = 70 + (k % 4) * 8;
            const y0 = 50 + (k % 3) * 14;
            const xi = 140 + k * 36;
            return (
              <g key={`${metallo.simbolo}-${nm}-${intensita}-${k}`}>
                <circle cx={x0} cy={y0} r="5" fill={colore} className="fotone" style={{ ["--px" as string]: `${xi - x0}px`, ["--py" as string]: `${170 - y0}px`, animationDelay: `${ritardo}s` }} />
                {emette && <circle cx={xi} cy="166" r="3.5" fill="#f3ecdd" className="elettrone" style={{ ["--ex" as string]: `${lungo * 0.8}px`, ["--ey" as string]: `${-lungo}px`, animationDelay: `${ritardo}s` }} />}
              </g>
            );
          })}
          {!emette && (
            <text x="240" y="130" textAnchor="middle" fill="#e3b08c" fontSize="13" fontFamily="Poppins, sans-serif">
              nessun elettrone: il fotone non ha abbastanza energia
            </text>
          )}
        </svg>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block font-sans text-sm">
            Lunghezza d'onda: {nm} nm <span className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: colore }} />
            <input type="range" min={200} max={800} step={5} value={nm} onChange={(e) => setNm(Number(e.target.value))} className="w-full accent-[#c9552a]" />
            <span className="flex justify-between text-[0.7rem] text-grafite">
              <span>ultravioletto</span>
              <span>infrarosso</span>
            </span>
          </label>
          <label className="block font-sans text-sm">
            Intensità: {intensita} {intensita === 1 ? "fotone" : "fotoni"} per volta
            <input type="range" min={1} max={8} step={1} value={intensita} onChange={(e) => setIntensita(Number(e.target.value))} className="w-full accent-[#c9552a]" />
            <span className="flex justify-between text-[0.7rem] text-grafite">
              <span>debole</span>
              <span>forte</span>
            </span>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {METALLI.map((m) => (
            <button key={m.simbolo} type="button" onClick={() => setMetallo(m)} aria-pressed={m.simbolo === metallo.simbolo} className={`rounded-md border px-2.5 py-1 font-sans text-sm transition ${m.simbolo === metallo.simbolo ? "border-[#a8643c] bg-[#a8643c]/20 text-[#e3b08c]" : "border-filetto hover:border-grafite"}`}>
              {m.simbolo}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="pannello p-4">
          <p className="pannello-titolo">{emette ? "Gli elettroni escono" : "Non succede niente"}</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-sans text-sm">
            <dt className="text-grafite">Fotone E = h·ν</dt>
            <dd className="tabular-nums">{Efot.toLocaleString("it-IT", { maximumFractionDigits: 2 })} eV</dd>
            <dt className="text-grafite">Soglia del {metallo.simbolo}</dt>
            <dd className="tabular-nums">
              {metallo.phi.toLocaleString("it-IT")} eV (λ ≤ {Math.round(soglia)} nm)
            </dd>
            <dt className="text-grafite">Energia degli elettroni</dt>
            <dd className="tabular-nums">{emette ? `${Ek.toLocaleString("it-IT", { maximumFractionDigits: 2 })} eV` : "—"}</dd>
          </dl>
          <p className="mt-3 text-sm leading-snug">
            {emette
              ? `Ogni fotone ha più energia della soglia: ne regala una parte per strappare l'elettrone e il resto diventa energia cinetica. Più fotoni (intensità), più elettroni; ma la loro energia non cambia.`
              : `Sotto la soglia nessun fotone riesce a strappare un elettrone, anche se ne arrivano tantissimi: conta l'energia del singolo fotone, non l'intensità.`}
          </p>
        </div>
        <div className="pannello p-4 text-sm leading-snug text-grafite">
          <p className="pannello-titolo">Perché è la prova dei corpuscoli</p>
          <p className="mt-2">Se la luce fosse solo un'onda, con abbastanza intensità prima o poi strapperebbe elettroni. Invece conta la frequenza: la luce rossa non fa nulla, la blu sì. Einstein: un fotone urta un elettrone e lo scalza solo se ha E = h·ν sufficiente. Valori delle soglie indicativi.</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Atomi({ elementi }: { elementi: ElementoBase[] }) {
  const [modo, setModoStato] = useState<Modo>("particelle");
  // Il modo sta anche nell'indirizzo (/atomi#luce): si può collegare dalle lezioni.
  useEffect(() => {
    const leggi = () => {
      const h = location.hash.slice(1) as Modo;
      if (["particelle", "isotopi", "luce", "fotoelettrico"].includes(h)) setModoStato(h);
    };
    leggi();
    window.addEventListener("hashchange", leggi);
    return () => window.removeEventListener("hashchange", leggi);
  }, []);
  const setModo = (m: Modo) => {
    setModoStato(m);
    history.replaceState(history.state, "", `#${m}`);
  };
  const MODI: [Modo, string][] = [
    ["particelle", "Particelle e ioni"],
    ["isotopi", "Isotopi"],
    ["luce", "La luce"],
    ["fotoelettrico", "Effetto fotoelettrico"],
  ];
  const base = useMemo(() => elementi, [elementi]);
  return (
    <div>
      <div className="segmentato">
        {MODI.map(([m, nome]) => (
          <button key={m} type="button" onClick={() => setModo(m)} aria-pressed={modo === m}>
            {nome}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {modo === "particelle" && <Particelle elementi={base} />}
        {modo === "isotopi" && <Isotopi elementi={base} />}
        {modo === "luce" && <Luce />}
        {modo === "fotoelettrico" && <Fotoelettrico />}
      </div>
    </div>
  );
}
