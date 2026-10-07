import { useEffect, useState } from "react";
import { aggiornaStato } from "@/lib/stato";
import { oggiIso } from "@/lib/ripasso";
import { CITTA, MONTE_MARIO, daGreenwichAMonteMario, daMonteMarioAGreenwich, daSecondi, dms, fusoDi, inDecimali, inSecondi, secondiDaProporzione } from "@/lib/coordinate";

// «Coordinate e fusi» (Geografia fisica e cartografia, lezione 4): l'esercizio
// del punto P con il righello, la longitudine «ovest da Monte Mario» → Greenwich,
// i fusi Gauss-Boaga con i loro meridiani centrali. Numeri come in aula.

type Modo = "righello" | "monte" | "fusi" | "allena";

const pieno = "sans rounded-md px-3 py-1.5 text-sm font-medium bg-lava text-white disabled:opacity-40";
const vuoto = "sans rounded-md border border-filetto px-3 py-1.5 text-sm hover:bg-white/5";
const campo = "block w-full rounded-md border border-filetto bg-transparent px-3 py-2 font-sans text-base outline-none focus:border-grafite";
const numero = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));
const virgola = (x: number, c = 1) => x.toLocaleString("it-IT", { minimumFractionDigits: c, maximumFractionDigits: c });

function mescola<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const casuale = (min: number, max: number) => min + Math.random() * (max - min);
const intero = (min: number, max: number) => Math.floor(casuale(min, max + 1));

/** Tre caselle per gradi, primi e secondi. */
function CaselleDms({ valore, onCambia, etichette = ["Gradi", "Primi", "Secondi"], bloccato, esito }: { valore: [string, string, string]; onCambia: (v: [string, string, string]) => void; etichette?: [string, string, string]; bloccato?: boolean; esito?: [boolean, boolean, boolean] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {valore.map((v, k) => (
        <label key={k} className="block font-sans text-xs text-grafite">
          {etichette[k]}
          <input
            inputMode="numeric"
            value={v}
            readOnly={bloccato}
            onChange={(e) => {
              const n = [...valore] as [string, string, string];
              n[k] = e.target.value.replace(/[^0-9]/g, "");
              onCambia(n);
            }}
            className={`${campo} mt-1 text-center text-lg ${bloccato && esito ? (esito[k] ? "!border-muschio" : "!border-lava") : ""}`}
          />
        </label>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Il righello: i secondi dalla proporzione
// ---------------------------------------------------------------------------

function Righello({ L, d, primo, ultimo }: { L: number; d: number; primo: string; ultimo: string }) {
  const scala = Math.min(86, 420 / Math.max(L, 1));
  const x0 = 50;
  const largo = L * scala;
  const dx = Math.max(0, Math.min(d, L)) * scala;
  return (
    <svg viewBox="0 0 540 170" className="block w-full" role="img" aria-label="Il bordo della carta con la tacca del primo e il punto">
      <rect x="0" y="0" width="540" height="170" rx="10" fill="#f1e7d3" />
      {/* il bordo della carta */}
      <rect x={x0} y="62" width={largo} height="22" fill="#e6d8bd" stroke="#7a6a58" strokeWidth="1" />
      {Array.from({ length: 7 }, (_, k) => (
        <g key={k}>
          <line x1={x0 + (largo * k) / 6} x2={x0 + (largo * k) / 6} y1="62" y2={k % 3 === 0 ? 52 : 57} stroke="#5a4a3a" strokeWidth="1.2" />
          <text x={x0 + (largo * k) / 6} y="46" textAnchor="middle" fontSize="10" fill="#7a6a58" fontFamily="Poppins, sans-serif">
            {k * 10}″
          </text>
        </g>
      ))}
      <line x1={x0} x2={x0} y1="50" y2="96" stroke="#3a2d23" strokeWidth="2" />
      <line x1={x0 + largo} x2={x0 + largo} y1="50" y2="96" stroke="#3a2d23" strokeWidth="2" />
      <text x={x0} y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3a2d23" fontFamily="Fraunces, serif">
        {primo}
      </text>
      <text x={x0 + largo} y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3a2d23" fontFamily="Fraunces, serif">
        {ultimo}
      </text>
      {/* la lunghezza di un primo */}
      <g stroke="#7a6a58" strokeWidth="1">
        <line x1={x0} x2={x0 + largo} y1="24" y2="24" />
        <line x1={x0} x2={x0} y1="19" y2="29" />
        <line x1={x0 + largo} x2={x0 + largo} y1="19" y2="29" />
      </g>
      <text x={x0 + largo / 2} y="19" textAnchor="middle" fontSize="11" fill="#5a4a3a" fontFamily="Poppins, sans-serif">
        1′ = 60″ = {virgola(L)} cm
      </text>
      {/* il punto */}
      <line x1={x0 + dx} x2={x0 + dx} y1="62" y2="132" stroke="#c9552a" strokeWidth="2" />
      <circle cx={x0 + dx} cy="73" r="5" fill="#c9552a" stroke="#fff" strokeWidth="1.5" />
      <g stroke="#c9552a" strokeWidth="1.4">
        <line x1={x0} x2={x0 + dx} y1="140" y2="140" />
        <line x1={x0} x2={x0} y1="135" y2="145" />
        <line x1={x0 + dx} x2={x0 + dx} y1="135" y2="145" />
      </g>
      <text x={x0 + dx / 2} y="158" textAnchor="middle" fontSize="12" fontWeight="600" fill="#c9552a" fontFamily="Poppins, sans-serif">
        {virgola(d)} cm
      </text>
    </svg>
  );
}

function ModoRighello() {
  const [tipo, setTipo] = useState<"lon" | "lat">("lon");
  const [g, setG] = useState("3");
  const [p, setP] = useState("12");
  const [L, setL] = useState("5,2");
  const [d, setD] = useState("2,8");
  const gn = numero(g), pn = numero(p), Ln = numero(L), dn = numero(d);
  const valido = gn !== null && pn !== null && pn >= 0 && pn < 60 && Ln !== null && Ln > 0 && dn !== null && dn >= 0 && dn <= (Ln ?? 0);
  const sec = valido ? secondiDaProporzione(Ln!, dn!) : null;
  const s = sec === null ? null : Math.round(sec);
  const tot = valido && s !== null ? inSecondi(gn!, pn!, s) : null;
  const verso = tipo === "lon" ? "ovest da Monte Mario" : "nord";
  const gw = tot !== null && tipo === "lon" ? daMonteMarioAGreenwich(tot) : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="pannello p-3 sm:p-4">
        <Righello L={Ln && Ln > 0 ? Ln : 5.2} d={dn !== null && dn >= 0 ? dn : 0} primo={`${g || "?"}°${p || "?"}′`} ultimo={`${g || "?"}°${pn !== null ? pn + 1 : "?"}′`} />
        <p className="mt-2 text-center text-[0.72rem] leading-snug text-grafite">
          Sul bordo della carta ogni tacca vale un primo. Si prende sempre il valore inferiore (come con l'ora: «12 e 32», non «13 meno 28») e si misura dalla sua tacca fino alla verticale del punto.
        </p>
      </div>
      <div className="space-y-4">
        <div className="pannello p-4">
          <div className="segmentato mb-3">
            {(["lon", "lat"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTipo(t)} aria-pressed={tipo === t}>
                {t === "lon" ? "Longitudine" : "Latitudine"}
              </button>
            ))}
          </div>
          <p className="pannello-titolo">La tacca inferiore</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="block font-sans text-xs text-grafite">
              Gradi
              <input inputMode="numeric" value={g} onChange={(e) => setG(e.target.value.replace(/[^0-9]/g, ""))} className={`${campo} mt-1 text-center text-lg`} />
            </label>
            <label className="block font-sans text-xs text-grafite">
              Primi
              <input inputMode="numeric" value={p} onChange={(e) => setP(e.target.value.replace(/[^0-9]/g, ""))} className={`${campo} mt-1 text-center text-lg`} />
            </label>
          </div>
          <p className="pannello-titolo mt-4">Le tue misure col righello</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="block font-sans text-xs text-grafite">
              1 primo (cm)
              <input inputMode="decimal" value={L} onChange={(e) => setL(e.target.value)} className={`${campo} mt-1 text-center text-lg`} />
            </label>
            <label className="block font-sans text-xs text-grafite">
              Dalla tacca al punto (cm)
              <input inputMode="decimal" value={d} onChange={(e) => setD(e.target.value)} className={`${campo} mt-1 text-center text-lg`} />
            </label>
          </div>
          <button
            type="button"
            className={`${vuoto} mt-3 !py-1 text-xs`}
            onClick={() => {
              setTipo("lon");
              setG("3");
              setP("12");
              setL("5,2");
              setD("2,8");
            }}
          >
            L'esercizio del prof: il punto P
          </button>
        </div>
        <div className="pannello p-4">
          <p className="pannello-titolo">Risultato</p>
          {tot === null ? (
            <p className="mt-2 text-sm text-grafite">Inserisci misure valide (il punto sta entro la tacca del primo).</p>
          ) : (
            <>
              <p className="mt-1 text-sm tabular-nums text-grafite">
                60″ × {virgola(dn!)} ÷ {virgola(Ln!)} = {virgola(sec!, 2)}″ ≈ <b className="text-inchiostro">{s}″</b>
              </p>
              <p className="display mt-2 text-3xl leading-tight tabular-nums">
                {dms(tot)} <span className="text-lg text-grafite">{verso}</span>
              </p>
              {gw && (
                <p className="mt-2 text-sm leading-snug">
                  Rispetto a Greenwich: {dms(MONTE_MARIO)} − {dms(tot)} = <b>{dms(gw.sec)} {gw.verso === "E" ? "est" : "ovest"}</b>.
                </p>
              )}
              {tipo === "lat" && <p className="mt-2 text-sm text-grafite">La latitudine cresce verso nord: misura dalla tacca inferiore salendo.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monte Mario ↔ Greenwich
// ---------------------------------------------------------------------------

function ModoMonteMario() {
  const [verso, setVerso] = useState<"mm" | "gw">("mm");
  const [v, setV] = useState<[string, string, string]>(["3", "12", "32"]);
  const n = v.map((x) => (x === "" ? 0 : Number(x))) as [number, number, number];
  const tot = inSecondi(...n);
  const r = verso === "mm" ? daMonteMarioAGreenwich(tot) : daGreenwichAMonteMario(tot);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="pannello p-4 sm:p-5">
        <div className="segmentato">
          <button type="button" onClick={() => setVerso("mm")} aria-pressed={verso === "mm"}>
            Monte Mario → Greenwich
          </button>
          <button type="button" onClick={() => setVerso("gw")} aria-pressed={verso === "gw"}>
            Greenwich → Monte Mario
          </button>
        </div>
        <p className="pannello-titolo mt-5">{verso === "mm" ? "Longitudine ovest da Monte Mario" : "Longitudine est da Greenwich"}</p>
        <div className="mt-2 max-w-md">
          <CaselleDms valore={v} onCambia={setV} />
        </div>
        <div className="mt-6 rounded-lg border border-filetto p-4">
          <p className="display text-2xl leading-tight tabular-nums">
            {dms(r.sec)} <span className="text-lg text-grafite">{verso === "mm" ? (r.verso === "E" ? "est di Greenwich" : "ovest di Greenwich") : r.verso === "W" ? "ovest da Monte Mario" : "est di Monte Mario"}</span>
          </p>
          <p className="mt-2 font-sans text-sm tabular-nums text-grafite">
            {verso === "mm" ? (
              <>
                {dms(MONTE_MARIO)} − {dms(tot)} = {r.verso === "E" ? dms(r.sec) : `−${dms(r.sec)}`}
              </>
            ) : (
              <>
                {dms(MONTE_MARIO)} − {dms(tot)} = {r.verso === "W" ? dms(r.sec) : `−${dms(r.sec)}`}
              </>
            )}{" "}
            · in decimali {inDecimali(r.sec).toLocaleString("it-IT", { maximumFractionDigits: 4 })}°
          </p>
        </div>
        <p className="mt-4 text-sm leading-snug text-grafite">
          Le carte IGM non contano da Greenwich ma da <b>Roma Monte Mario</b>, che sta a <b>12°27′08″ est</b> di Greenwich. La Liguria è a ovest di Roma: la sua longitudine è «ovest da Monte Mario» e <b>cresce verso ovest</b>, al contrario di quella da Greenwich.
        </p>
      </div>
      <div className="space-y-4">
        <div className="pannello p-4 text-sm leading-snug">
          <p className="pannello-titolo">Per controllare</p>
          <ul className="mt-2 space-y-1.5">
            {[
              ["Genova", 8.934],
              ["Milano", 9.19],
              ["Torino", 7.686],
            ].map(([nome, lon]) => {
              const w = daGreenwichAMonteMario(Math.round((lon as number) * 3600));
              return (
                <li key={nome as string} className="flex justify-between gap-3 tabular-nums">
                  <span>{nome}</span>
                  <span className="text-grafite">
                    {dms(Math.round((lon as number) * 3600))} E = {dms(w.sec)} {w.verso === "W" ? "ovest" : "est"} di MM
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fusi
// ---------------------------------------------------------------------------

const X0 = 5;
const X1 = 19;
const px = (lon: number) => 30 + ((lon - X0) / (X1 - X0)) * 600;

function ModoFusi() {
  const [lon, setLon] = useState(CITTA.find((c) => c.nome === "Genova")!.lon);
  const [lat, setLat] = useState(44.4);
  const f = fusoDi(lon, lat);
  const vicina = CITTA.find((c) => Math.abs(c.lon - lon) < 0.02);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="pannello p-3 sm:p-4">
        <svg viewBox="0 0 660 230" className="block w-full" role="img" aria-label="I due fusi italiani sull'asse delle longitudini">
          <rect width="660" height="230" rx="10" fill="#1b1512" />
          {/* fusi */}
          <rect x={px(6)} y="60" width={px(12) - px(6)} height="70" fill="#5b7fb5" opacity="0.5" />
          <rect x={px(12)} y="60" width={px(18) - px(12)} height="70" fill="#c9a24f" opacity="0.5" />
          <rect x={px(11.75)} y="52" width={px(12.25) - px(11.75)} height="86" fill="#f3ecdd" opacity="0.28" />
          <text x={px(9)} y="100" textAnchor="middle" fill="#efe4d0" fontSize="15" fontFamily="Fraunces, serif">
            Fuso Ovest
          </text>
          <text x={px(15)} y="100" textAnchor="middle" fill="#efe4d0" fontSize="15" fontFamily="Fraunces, serif">
            Fuso Est
          </text>
          <text x={px(12)} y="44" textAnchor="middle" fill="#efe4d0" fontSize="10" fontFamily="Poppins, sans-serif">
            sovrapposizione 30′
          </text>
          {/* meridiani centrali */}
          {[9, 15].map((m) => (
            <g key={m}>
              <line x1={px(m)} x2={px(m)} y1="52" y2="150" stroke="#efe4d0" strokeWidth="1.5" strokeDasharray="5 4" />
              <text x={px(m)} y="166" textAnchor="middle" fill="#e3b08c" fontSize="11" fontFamily="Poppins, sans-serif">
                meridiano centrale {m}° E
              </text>
            </g>
          ))}
          {/* asse */}
          <line x1={px(X0)} x2={px(X1)} y1="190" y2="190" stroke="#7a6a58" />
          {Array.from({ length: 15 }, (_, k) => 5 + k).map((m) => (
            <g key={m}>
              <line x1={px(m)} x2={px(m)} y1="186" y2="194" stroke="#7a6a58" />
              <text x={px(m)} y="208" textAnchor="middle" fill="#9c8c78" fontSize="10" fontFamily="Poppins, sans-serif">
                {m}°
              </text>
            </g>
          ))}
          {/* città: solo i punti sull'asse, i nomi sono i bottoni sotto il grafico */}
          {CITTA.map((c) => (
            <circle key={c.nome} cx={px(c.lon)} cy="190" r="4" fill={Math.abs(c.lon - lon) < 0.02 ? "#c9552a" : "#f3ecdd"} opacity="0.85" />
          ))}
          <g>
            <line x1={px(Math.max(X0, Math.min(X1, lon)))} x2={px(Math.max(X0, Math.min(X1, lon)))} y1="52" y2="190" stroke="#c9552a" strokeWidth="2" />
            <circle cx={px(Math.max(X0, Math.min(X1, lon)))} cy="190" r="6" fill="#c9552a" stroke="#fff" strokeWidth="1.5" />
          </g>
        </svg>
        <input type="range" min={X0} max={X1} step={0.01} value={Math.max(X0, Math.min(X1, lon))} onChange={(e) => (setLon(Number(e.target.value)), setLat(44))} aria-label="Longitudine" className="mt-2 w-full accent-[#c9552a]" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CITTA.map((c) => (
            <button key={c.nome} type="button" onClick={() => (setLon(c.lon), setLat(c.lat))} aria-pressed={Math.abs(c.lon - lon) < 0.02} className={`rounded-md border px-2.5 py-1 font-sans text-sm transition ${Math.abs(c.lon - lon) < 0.02 ? "border-[#a8643c] bg-[#a8643c]/20 text-[#e3b08c]" : "border-filetto hover:border-grafite"}`}>
              {c.nome}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[0.72rem] leading-snug text-grafite">Scegli una città o muovi il cursore. In chiaro la fascia di sovrapposizione di 30′ attorno ai 12°.</p>
      </div>

      <div className="space-y-4">
        <div className="pannello p-4">
          <p className="pannello-titolo">{vicina ? vicina.nome : "Il punto"}</p>
          <p className="display mt-0.5 text-2xl leading-tight tabular-nums">{dms(Math.round(lon * 3600))} E</p>
          <p className="mt-0.5 font-sans text-xs text-grafite">da Greenwich · {lon.toLocaleString("it-IT", { maximumFractionDigits: 3 })}°</p>
          <p className="display mt-4 text-3xl leading-tight" style={{ color: f.nome === "Ovest" ? "#8fb2e0" : "#e0c070" }}>
            Fuso {f.nome}
          </p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-sans text-sm">
            <dt className="text-grafite">Meridiano centrale</dt>
            <dd>{f.centrale}° E</dd>
            <dt className="text-grafite">Distanza</dt>
            <dd className="tabular-nums">
              {f.distanza >= 0 ? "+" : "−"}
              {Math.abs(f.distanza).toLocaleString("it-IT", { maximumFractionDigits: 2 })}° ≈ {Math.round(Math.abs(f.km)).toLocaleString("it-IT")} km {f.distanza >= 0 ? "a est" : "a ovest"}
            </dd>
          </dl>
          {f.sovrapposizione && <p className="mt-2 text-sm text-[#e3b08c]">Sei nella fascia di sovrapposizione: la carta può essere in entrambi i fusi.</p>}
          {f.oltre && <p className="mt-2 text-sm text-[#e3b08c]">Oltre i 3° dal meridiano centrale le deformazioni non sono più trascurabili.</p>}
        </div>
        <div className="pannello p-4 text-sm leading-snug text-grafite">
          <p className="pannello-titolo">Dalla lezione</p>
          <p className="mt-2">
            L'Italia si estende per circa 12° di longitudine, più dei 6° di un fuso: l'IGM ha applicato la proiezione di Gauss due volte, con i meridiani di tangenza a <b className="text-inchiostro">9° e 15° est</b> di Greenwich. Ogni fuso è largo 6° (3° per lato). Boaga ha usato un cilindro leggermente secante: da lì le coordinate Gauss-Boaga.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Allenati
// ---------------------------------------------------------------------------

type Domanda =
  | { tipo: "secondi"; testo: string; L: number; d: number; g: number; p: number; giusto: number }
  | { tipo: "conversione"; g: number; p: number; s: number }
  | { tipo: "fuso"; citta: string; lon: number }
  | { tipo: "scelta"; testo: string; opzioni: string[]; giusta: string; spiegazione: string };

function genera(): Domanda[] {
  const lista: Domanda[] = [];
  for (let k = 0; k < 3; k++) {
    const L = Math.round(casuale(4.9, 5.6) * 10) / 10;
    const d = Math.round(casuale(0.5, L - 0.5) * 10) / 10;
    const g = intero(2, 4);
    const p = intero(5, 52);
    lista.push({ tipo: "secondi", testo: "", L, d, g, p, giusto: Math.round(secondiDaProporzione(L, d)) });
  }
  for (let k = 0; k < 2; k++) lista.push({ tipo: "conversione", g: intero(1, 5), p: intero(0, 59), s: intero(0, 59) });
  for (const c of mescola(CITTA.filter((x) => Math.abs(x.lon - 12) > 0.4)).slice(0, 2)) lista.push({ tipo: "fuso", citta: c.nome, lon: c.lon });
  lista.push(
    {
      tipo: "scelta",
      testo: "Sulla tavoletta di Rapallo (IGM) la longitudine cresce verso…",
      opzioni: mescola(["ovest, perché parte da Monte Mario", "est, come da Greenwich"]),
      giusta: "ovest, perché parte da Monte Mario",
      spiegazione: "Il meridiano fondamentale delle carte IGM è Roma Monte Mario, a est della Liguria: le longitudini sono «ovest da Monte Mario» e aumentano andando verso ovest.",
    },
    {
      tipo: "scelta",
      testo: "Su che meridiani sono centrati i due fusi italiani?",
      opzioni: mescola(["9° e 15° est di Greenwich", "6° e 12° est di Greenwich", "12°27′ e 15° est di Greenwich"]),
      giusta: "9° e 15° est di Greenwich",
      spiegazione: "Fuso Ovest centrato sul meridiano 9° E, fuso Est sul 15° E; ciascuno è largo 6°, quindi 3° per lato.",
    },
  );
  return mescola(lista);
}

function Allena() {
  const [domande, setDomande] = useState(genera);
  const [i, setI] = useState(0);
  const [val, setVal] = useState<[string, string, string]>(["", "", ""]);
  const [scelta, setScelta] = useState<string | null>(null);
  const [fatto, setFatto] = useState(false);
  const [esiti, setEsiti] = useState<boolean[]>([]);
  const d = domande[i];

  function avanti() {
    if (i + 1 >= domande.length) aggiornaStato((s) => ({ ...s, history: [...s.history, { date: oggiIso(), lesson: "geografia-fisica/coordinate", correct: esiti.filter(Boolean).length, total: domande.length }] }));
    setI(i + 1);
    setVal(["", "", ""]);
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
        <button type="button" className={`${pieno} mt-4`} onClick={() => (setDomande(genera()), setI(0), setEsiti([]), setVal(["", "", ""]), setScelta(null), setFatto(false))}>
          Altre domande
        </button>
      </div>
    );

  const barra = (
    <p className="mb-3 font-sans text-xs text-grafite">
      {i + 1} / {domande.length}
    </p>
  );
  const scegliBottone = (giusta: string, spiega: string, opzioni: string[]) => (
    <>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {opzioni.map((o) => (
          <button
            key={o}
            type="button"
            disabled={!!scelta}
            onClick={() => (setScelta(o), setEsiti((x) => [...x, o === giusta]))}
            className={`rounded-md border px-4 py-3 text-left transition ${scelta ? (o === giusta ? "border-muschio bg-muschio/15" : o === scelta ? "border-lava bg-lava/15" : "border-filetto opacity-60") : "border-filetto hover:border-grafite"}`}
          >
            {o}
          </button>
        ))}
      </div>
      {scelta && (
        <>
          <p className="mt-3 text-sm leading-snug">{spiega}</p>
          <button type="button" className={`${pieno} mt-3`} onClick={avanti}>
            {i + 1 < domande.length ? "Avanti" : "Chiudi"}
          </button>
        </>
      )}
    </>
  );

  if (d.tipo === "scelta")
    return (
      <div className="mx-auto max-w-2xl">
        {barra}
        <div className="pannello p-5">
          <p className="text-[1.05rem] leading-snug">{d.testo}</p>
          {scegliBottone(d.giusta, d.spiegazione, d.opzioni)}
        </div>
      </div>
    );

  if (d.tipo === "fuso") {
    const f = fusoDi(d.lon);
    const giusta = f.nome === "Ovest" ? "Fuso Ovest (meridiano 9° E)" : "Fuso Est (meridiano 15° E)";
    return (
      <div className="mx-auto max-w-2xl">
        {barra}
        <div className="pannello p-5">
          <p className="text-[1.05rem] leading-snug">
            {d.citta} sta a {dms(Math.round(d.lon * 3600))} est di Greenwich. In quale fuso Gauss-Boaga cade?
          </p>
          {scegliBottone(giusta, `Sotto i 12° vale il fuso Ovest, sopra il fuso Est: ${d.citta} è a ${Math.abs(f.distanza).toLocaleString("it-IT", { maximumFractionDigits: 2 })}° dal meridiano ${f.centrale}°. ${f.oltre ? "(Oltre i 3°: già nelle deformazioni.)" : ""}`, ["Fuso Ovest (meridiano 9° E)", "Fuso Est (meridiano 15° E)"])}
        </div>
      </div>
    );
  }

  if (d.tipo === "conversione") {
    const mm = inSecondi(d.g, d.p, d.s);
    const r = daMonteMarioAGreenwich(mm);
    const giusto = daSecondi(r.sec);
    const dato = val.map((x) => (x === "" ? null : Number(x)));
    const esito: [boolean, boolean, boolean] = [dato[0] === giusto.g, dato[1] === giusto.p, dato[2] === giusto.s];
    const completo = dato.every((x) => x !== null);
    return (
      <div className="mx-auto max-w-2xl">
        {barra}
        <form
          className="pannello p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (fatto) return avanti();
            if (!completo) return;
            setFatto(true);
            setEsiti((x) => [...x, esito.every(Boolean)]);
          }}
        >
          <p className="text-[1.05rem] leading-snug">
            Un punto ha longitudine <b>{dms(mm)}</b> ovest da Monte Mario. Qual è la sua longitudine est rispetto a Greenwich?
          </p>
          <div className="mt-4 max-w-sm">
            <CaselleDms valore={val} onCambia={setVal} bloccato={fatto} esito={esito} />
          </div>
          {fatto && (
            <p className="mt-3 text-sm leading-snug tabular-nums">
              {dms(MONTE_MARIO)} − {dms(mm)} = <b>{dms(r.sec)}</b> est.
            </p>
          )}
          <button type="submit" className={`${pieno} mt-4`} disabled={!fatto && !completo}>
            {fatto ? (i + 1 < domande.length ? "Avanti" : "Chiudi") : "Controlla"}
          </button>
        </form>
      </div>
    );
  }

  // secondi dal righello
  const dato = numero(val[0]);
  const ok = dato !== null && Math.abs(dato - d.giusto) <= 1;
  return (
    <div className="mx-auto max-w-2xl">
      {barra}
      <form
        className="pannello p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (fatto) return avanti();
          if (dato === null) return;
          setFatto(true);
          setEsiti((x) => [...x, ok]);
        }}
      >
        <p className="text-[1.05rem] leading-snug">
          Sul margine superiore un primo di longitudine misura <b>{virgola(d.L)} cm</b>. Dalla tacca <b>{d.g}°{d.p}′</b> alla verticale del punto misuri <b>{virgola(d.d)} cm</b>. Quanti secondi?
        </p>
        <div className="mt-3 rounded-lg bg-[#f1e7d3] p-2">
          <Righello L={d.L} d={d.d} primo={`${d.g}°${d.p}′`} ultimo={`${d.g}°${d.p + 1}′`} />
        </div>
        <label className="mt-4 block font-sans text-xs text-grafite">
          Secondi (arrotonda all'intero)
          <input inputMode="numeric" value={val[0]} readOnly={fatto} onChange={(e) => setVal([e.target.value.replace(/[^0-9]/g, ""), "", ""])} autoFocus className={`${campo} mt-1 max-w-[10rem] text-center text-xl ${fatto ? (ok ? "!border-muschio" : "!border-lava") : ""}`} />
        </label>
        {fatto && (
          <p className="mt-3 text-sm leading-snug tabular-nums">
            60″ × {virgola(d.d)} ÷ {virgola(d.L)} = {virgola(secondiDaProporzione(d.L, d.d), 2)}″ → <b>{d.giusto}″</b>. La longitudine è <b>{d.g}°{d.p}′{d.giusto}″</b> ovest da Monte Mario.
          </p>
        )}
        <button type="submit" className={`${pieno} mt-4`} disabled={!fatto && dato === null}>
          {fatto ? (i + 1 < domande.length ? "Avanti" : "Chiudi") : "Controlla"}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Coordinate() {
  const [modo, setModoStato] = useState<Modo>("righello");
  useEffect(() => {
    const leggi = () => {
      const h = location.hash.slice(1) as Modo;
      if (["righello", "monte", "fusi", "allena"].includes(h)) setModoStato(h);
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
    ["righello", "Il righello"],
    ["monte", "Monte Mario ↔ Greenwich"],
    ["fusi", "I fusi"],
    ["allena", "Allenati"],
  ];
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
        {modo === "righello" && <ModoRighello />}
        {modo === "monte" && <ModoMonteMario />}
        {modo === "fusi" && <ModoFusi />}
        {modo === "allena" && <Allena />}
      </div>
    </div>
  );
}
