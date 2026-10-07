// L'indice della ricerca (pagina /cerca): un record per ogni sezione delle
// lezioni, per ogni definizione dei riquadri, per ogni voce del glossario, concetto
// di cartografia, campione, elemento e strumento. Si ricostruisce a ogni
// pubblicazione. Contiene il testo delle lezioni: sta tra le parti riservate alla
// chiave «appunti» (lib/accesso.ts).
import type { APIRoute } from "astro";
import GithubSlugger from "github-slugger";
import { lezioniDi, materiaDiLezione, percorsoLezione } from "@/lib/contenuti";
import { STRUMENTI } from "@/lib/strumenti";
import { pulisci, type Voce } from "@/lib/ricerca";
import campioni from "../../content/campionario/campioni.json";
import elementi from "../../content/chimica/elementi.json";
import concetti from "../../content/cartografia/concetti.json";
import glossario from "../../content/geologia-1/glossario-magmatiche.json";

export const GET: APIRoute = async () => {
  const voci: Voce[] = [];
  const lezioni = await lezioniDi();

  for (const l of lezioni) {
    const materia = materiaDiLezione(l);
    const base = percorsoLezione(l);
    const origine = `Lezione ${l.data.numero} · ${l.data.titolo}`;
    const slugger = new GithubSlugger();
    let titolo = l.data.titolo;
    let ancora = "";
    let righe: string[] = [];
    let inDefinizione = false;
    let definizione: string[] = [];

    const chiudiSezione = () => {
      const x = pulisci(righe.join("\n"));
      if (x) voci.push({ t: "lezione", m: materia, h: titolo, l: origine, u: base + (ancora ? `#${ancora}` : ""), x });
      righe = [];
    };
    const chiudiDefinizione = () => {
      for (const par of definizione.join("\n").split(/\n\s*\n/)) {
        const m = /^\s*\*\*([^*]+)\*\*[:.]?\s*([\s\S]*)$/.exec(par.trim());
        if (m) voci.push({ t: "definizione", m: materia, h: pulisci(m[1]), l: origine, u: base + (ancora ? `#${ancora}` : ""), x: pulisci(m[2]) || pulisci(m[1]) });
      }
      definizione = [];
    };

    for (const riga of (l.body ?? "").split("\n")) {
      const h = /^(#{2,4})\s+(.*)$/.exec(riga);
      if (h && !inDefinizione) {
        chiudiSezione();
        titolo = pulisci(h[2]);
        ancora = slugger.slug(titolo);
        continue;
      }
      if (/^:::definizione/.test(riga)) {
        inDefinizione = true;
        continue;
      }
      if (inDefinizione && /^:::\s*$/.test(riga)) {
        inDefinizione = false;
        chiudiDefinizione();
        continue;
      }
      if (inDefinizione) definizione.push(riga);
      righe.push(riga);
    }
    chiudiSezione();
  }

  for (const g of glossario.gruppi)
    for (const v of g.voci) voci.push({ t: "definizione", m: "geologia-1", h: v.termine, l: `Rocce magmatiche · glossario · ${g.titolo}`, u: "/qap", x: v.definizione });

  for (const g of concetti.gruppi)
    for (const c of g.concetti) voci.push({ t: "definizione", m: "geografia-fisica", h: c.termine, l: `Cartografia · ${g.titolo}`, u: "/cartografia", x: c.definizione });

  for (const c of campioni as { id: string; nome: string; categoria?: string; famiglia: string; caratteri: string }[])
    voci.push({ t: "campione", m: "geologia-1", h: c.nome, l: `Campionario · ${c.categoria ?? c.famiglia}`, u: `/campionario#${c.id}`, x: `${c.famiglia}. ${c.caratteri}` });

  for (const e of elementi.elementi)
    voci.push({ t: "elemento", m: "chimica", h: `${e.nome[0].toUpperCase()}${e.nome.slice(1)} (${e.simbolo})`, l: `Tavola periodica · elemento ${e.z}`, u: "/tavola", x: `${e.inglese}. ${e.categoria}. Gruppo ${e.gruppo ?? "—"}, periodo ${e.periodo}. ${e.configurazione ?? ""} ${e.stato}. Ossidazione ${e.ossidazione ?? "—"}.` });

  for (const s of STRUMENTI) voci.push({ t: "strumento", m: s.materia ?? "", h: s.titolo, l: "Strumento", u: s.href, x: s.testo });

  return new Response(JSON.stringify(voci), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
