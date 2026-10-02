// Migrazione una tantum: gli appunti HTML in materiale/html/ diventano
// lezioni Markdown in content/<materia>/lezioni/, nel formato di
// docs/CONTENT_FORMAT.md. Gli SVG inline si salvano come file accanto alla
// lezione, i PDF si copiano in public/pdf/<materia>/.
//
//   npx tsx scripts/html2md.ts             tutte le lezioni
//   npx tsx scripts/html2md.ts geologia-1  solo una materia
//
// Alla fine stampa (e salva in materiale/RAPPORTO-CONVERSIONE.md) tutto ciò
// che non ha saputo convertire bene, da sistemare a monte negli HTML.

import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { HTMLElement, parse } from "node-html-parser";
import TurndownService from "turndown";
import GithubSlugger from "github-slugger";

const RADICE = fileURLToPath(new URL("..", import.meta.url));
const SORGENTE = join(RADICE, "materiale", "html");
const PDF_SORGENTE = join(RADICE, "materiale");
const CONTENT = join(RADICE, "content");
const PUBLIC_PDF = join(RADICE, "public", "pdf");

const filtroMateria = process.argv[2];
const rapporto: string[] = [];
function segnala(file: string, cosa: string) {
  rapporto.push(`- **${file}**: ${cosa}`);
}

// ---------------------------------------------------------------------------
// Turndown: HTML → Markdown con le regole del nostro dialetto
// ---------------------------------------------------------------------------

type Contesto = { file: string; slug: string; cartella: string; figure: number };
let ctx: Contesto;

const td = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  emDelimiter: "*",
  strongDelimiter: "**",
  codeBlockStyle: "fenced",
});

// Niente escape aggressivo: negli appunti «·», «–» e le parentesi sono testo.
td.escape = (testo: string) =>
  testo
    .replace(/([\\`*_[\]])/g, "\\$1")
    .replace(/^(\s*)([-+*]) /gm, "$1\\$2 ")
    .replace(/^(\s*)(\d+)\. /gm, "$1$2\\. ")
    .replace(/^(\s*)#/gm, "$1\\#");

td.keep(["sup", "sub"]);
td.remove(["style", "script"]);

const el = (nodo: unknown) => nodo as HTMLElement;

function inline(html: string): string {
  return td.turndown(`<p>${html}</p>`).replace(/\s+/g, " ").trim();
}

// h2 con il numero di sezione: il numero si toglie, lo mette il CSS.
td.addRule("h2", {
  filter: "h2",
  replacement: (_c, nodo) => {
    const e = el(nodo);
    Array.from(e.querySelectorAll("span.n")).forEach((s) => s.parentNode?.removeChild(s));
    return `\n\n## ${inline(e.innerHTML)}\n\n`;
  },
});

td.addRule("lead", {
  filter: (nodo) => nodo.nodeName === "P" && el(nodo).classList.contains("lead"),
  replacement: (c) => `\n\n*${c.trim()}*\n\n`,
});

// Note piccole in grigio (fonti, precisazioni): corsivo.
td.addRule("notaPiccola", {
  filter: (nodo) => nodo.nodeName === "P" && /font-size:\s*9pt/.test(el(nodo).getAttribute("style") ?? ""),
  replacement: (c) => `\n\n*${c.trim()}*\n\n`,
});

// Formula centrata: paragrafo a sé, in grassetto.
td.addRule("centrato", {
  filter: (nodo) => nodo.nodeName === "P" && /text-align:\s*center/.test(el(nodo).getAttribute("style") ?? ""),
  replacement: (c) => `\n\n**${c.trim()}**\n\n`,
});

td.addRule("puntoIncerto", {
  filter: (nodo) => nodo.nodeName === "SPAN" && el(nodo).classList.contains("q"),
  replacement: () => " (?)",
});

// Riquadri → direttive container.
const ETICHETTE_PREDEFINITE: Record<string, [string, string]> = {
  def: ["definizione", "Definizione"],
  exam: ["esame", "All'esame"],
  draw: ["disegna", "Da disegnare"],
  warn: ["nota", "Nota"],
};
td.addRule("box", {
  filter: (nodo) => nodo.nodeName === "DIV" && el(nodo).classList.contains("box"),
  replacement: (_c, nodo) => {
    const e = el(nodo);
    const classe = Array.from(e.classList).find((k) => k in ETICHETTE_PREDEFINITE) ?? "warn";
    let [nome, predefinita] = ETICHETTE_PREDEFINITE[classe];
    const lab = e.querySelector(".lab");
    let etichetta = lab ? inline(lab.innerHTML) : predefinita;
    lab?.parentNode?.removeChild(lab);
    if (/^\\?\[?ndr\]?/i.test(etichetta)) {
      nome = "ndr";
      predefinita = "Ndr";
      etichetta = etichetta.replace(/^\\?\[?ndr\\?\]?\s*/i, "") || predefinita;
    }
    if (classe === "def" && etichetta === "Definizioni") etichetta = predefinita; // singolare ovunque
    const attr = etichetta !== predefinita ? `{etichetta=${JSON.stringify(etichetta)}}` : "";
    const corpo = td.turndown(e.innerHTML).trim();
    return `\n\n:::${nome}${attr}\n${corpo}\n:::\n\n`;
  },
});

// Figure SVG → file accanto alla lezione + immagine con didascalia nell'alt.
td.addRule("figura", {
  // Nel DOM di turndown l'elemento SVG ha nodeName minuscolo (namespace SVG).
  filter: (nodo) => nodo.nodeName.toLowerCase() === "svg",
  replacement: (_c, nodo) => {
    const e = el(nodo);
    ctx.figure += 1;
    const nomeFile = `${ctx.slug}-fig${ctx.figure}.svg`;
    const didascalia = e.getAttribute("data-didascalia") ?? "";
    e.removeAttribute("class");
    e.removeAttribute("style");
    e.removeAttribute("data-didascalia");
    if (!e.getAttribute("xmlns")) e.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    writeFileSync(join(ctx.cartella, nomeFile), e.outerHTML.replace(/\s+/g, " ").replace(/> </g, "><") + "\n");
    if (!didascalia) segnala(ctx.file, `figura ${ctx.figure} senza didascalia`);
    return `\n\n![${didascalia.replace(/[[\]]/g, "")}](./${nomeFile})\n\n`;
  },
});

// Liste di cose da fare.
td.addRule("checklist", {
  filter: (nodo) => nodo.nodeName === "UL" && el(nodo).classList.contains("checklist"),
  replacement: (_c, nodo) => {
    const voci = Array.from(el(nodo).children)
      .filter((li) => li.tagName === "LI")
      .map((li) => `- [ ] ${inline(li.innerHTML)}`);
    return `\n\n${voci.join("\n")}\n\n`;
  },
});

function cella(html: string): string {
  return inline(html.replace(/<br\s*\/?>/gi, " ")).replace(/\|/g, "\\|");
}

// Elenchi definizione → tabella a due colonne.
td.addRule("kv", {
  filter: "dl",
  replacement: (_c, nodo) => {
    const righe: string[] = ["| Termine | Significato |", "| --- | --- |"];
    Array.from(el(nodo).querySelectorAll("dt")).forEach((dt) => {
        const dd = dt.nextElementSibling;
        righe.push(`| **${cella(dt.innerHTML)}** | ${dd ? cella(dd.innerHTML) : ""} |`);
      });
    return `\n\n${righe.join("\n")}\n\n`;
  },
});

// Tabelle → GFM. Il rowspan si scioglie ripetendo la cella nelle righe sotto.
td.addRule("tabella", {
  filter: "table",
  replacement: (_c, nodo) => {
    const griglia: string[][] = [];
    const pendenti = new Map<number, { testo: string; resta: number }>();
    let intestazione: string[] | null = null;
    let haColspan = false;

    Array.from(el(nodo).querySelectorAll("tr")).forEach((tr) => {
        const celle: string[] = [];
        const figli = Array.from(tr.children).filter((c) => c.tagName === "TH" || c.tagName === "TD");
        const scaricaPendenti = () => {
          while (pendenti.has(celle.length)) {
            const p = pendenti.get(celle.length)!;
            celle.push(p.testo);
            p.resta -= 1;
            if (p.resta === 0) pendenti.delete(celle.length - 1);
          }
        };
        for (const c of figli) {
          scaricaPendenti();
          const testo = cella(c.innerHTML);
          const rs = Number(c.getAttribute("rowspan") ?? 1);
          const cs = Number(c.getAttribute("colspan") ?? 1);
          if (cs > 1) haColspan = true;
          if (rs > 1) pendenti.set(celle.length, { testo, resta: rs - 1 });
          celle.push(testo);
          for (let i = 1; i < cs; i++) celle.push("");
        }
        scaricaPendenti();
        if (figli.length && figli.every((c) => c.tagName === "TH") && !intestazione) intestazione = celle;
        else griglia.push(celle);
      });

    if (haColspan) segnala(ctx.file, "tabella con colspan: celle vuote aggiunte, da controllare");
    if (!intestazione) {
      segnala(ctx.file, "tabella senza riga di intestazione (th): usata la prima riga");
      intestazione = griglia.shift() ?? [];
    }
    const testa: string[] = intestazione;
    const larghezza = Math.max(testa.length, ...griglia.map((r) => r.length));
    const riga = (c: string[]) => `| ${Array.from({ length: larghezza }, (_, i) => c[i] ?? "").join(" | ")} |`;
    const out = [riga(testa), `| ${Array(larghezza).fill("---").join(" | ")} |`, ...griglia.map(riga)];
    return `\n\n${out.join("\n")}\n\n`;
  },
});

// ---------------------------------------------------------------------------
// Lettura dell'intestazione e scrittura della lezione
// ---------------------------------------------------------------------------

function testoPulito(e: HTMLElement | null): string {
  if (!e) return "";
  e.querySelectorAll("span.q").forEach((s) => s.replaceWith(" (?)"));
  return e.structuredText.replace(/\s+/g, " ").trim();
}

function yaml(chiave: string, valore: string | number | undefined): string {
  if (valore === undefined || valore === "") return "";
  return typeof valore === "number" ? `${chiave}: ${valore}\n` : `${chiave}: ${JSON.stringify(valore)}\n`;
}

const DOCENTE_PER_MODULO: Record<string, string> = {
  "Modulo 1": "Laura Federico",
  "Modulo 2": "Michele Piazza",
};

function convertiLezione(file: string): boolean {
  const m = /^([a-z0-9-]+)_lez(\d+)_(\d{4}-\d{2}-\d{2})\.html$/.exec(file);
  if (!m) return false;
  const [, materia, numeroStr, data] = m;
  if (filtroMateria && materia !== filtroMateria) return true;
  const numero = Number(numeroStr);

  const html = readFileSync(join(SORGENTE, file), "utf8");
  const body = parse(html, { comment: false }).querySelector("body")!;

  // Intestazione
  const h1 = testoPulito(body.querySelector(".hd h1"));
  const titolo = h1.includes(" · ") ? h1.split(" · ").slice(1).join(" · ") : h1;
  const occhiello = testoPulito(body.querySelector(".hd .k"));
  const meta = testoPulito(body.querySelector(".hd .m"))
    .split(" · ")
    .map((s) => s.trim());
  const modulo = materia === "geologia-1" ? occhiello.split(" · ").slice(1).join(" · ") : undefined;
  let docente = meta.find((s) => /^prof/i.test(s))?.replace(/^prof\.?(ssa)?\s*/i, "");
  if (!docente && modulo) docente = DOCENTE_PER_MODULO[modulo.split(" · ")[0]];
  if (!docente) segnala(file, "docente non trovato nell'intestazione");
  const fonte = meta.find((s) => /^Appunti/i.test(s));
  const nota = testoPulito(body.querySelector("p.legend"));

  const slug = `lez${String(numero).padStart(2, "0")}-${data}-${new GithubSlugger().slug(titolo)}`;
  const cartella = join(CONTENT, materia, "lezioni");
  mkdirSync(cartella, { recursive: true });
  ctx = { file, slug, cartella, figure: 0 };

  // Pulizia del corpo
  body.querySelectorAll(".hd, p.legend, .runhead, .foot, style").forEach((e) => e.remove());
  body.querySelectorAll("svg").forEach((svg) => {
    const dopo = svg.nextElementSibling;
    if (dopo && dopo.tagName === "P" && dopo.classList.contains("caption")) {
      svg.setAttribute("data-didascalia", testoPulito(dopo));
      dopo.remove();
    }
  });
  body.querySelectorAll("p.caption").forEach((p) => segnala(file, `didascalia orfana: «${testoPulito(p).slice(0, 60)}…»`));

  // Cose che non ci aspettiamo: si segnalano, non si perdono in silenzio.
  const classiNote = new Set(["page", "box", "def", "exam", "draw", "warn", "lab", "lead", "n", "t", "q", "cycle", "caption", "checklist", "kv"]);
  body.querySelectorAll("[class]").forEach((e) => {
    for (const k of e.classList.values()) if (!classiNote.has(k)) segnala(file, `classe sconosciuta «${k}» su <${e.tagName.toLowerCase()}>`);
  });
  body.querySelectorAll("[style]").forEach((e) => {
    const st = (e.getAttribute("style") ?? "").trim();
    if (e.tagName === "SVG" || /^(margin|font-size:\s*9pt|text-align|flex|display:flex|width)/.test(st)) return;
    segnala(file, `stile inline non previsto su <${e.tagName.toLowerCase()}>: ${st}`);
  });
  body.querySelectorAll("img, a, iframe, video").forEach((e) => segnala(file, `elemento <${e.tagName.toLowerCase()}> non gestito`));

  // PDF originale → public/pdf/<materia>/<slug>.pdf
  const chiave = materia.replace(/[^a-z0-9]/g, "");
  const pdfOrig = readdirSync(PDF_SORGENTE).find((f) => {
    const n = f.toLowerCase();
    return n.endsWith(`_lez${numeroStr}_${data}.pdf`) && n.replace(/[^a-z0-9]/g, "").startsWith(chiave);
  });
  let pdf: string | undefined;
  if (pdfOrig) {
    mkdirSync(join(PUBLIC_PDF, materia), { recursive: true });
    copyFileSync(join(PDF_SORGENTE, pdfOrig), join(PUBLIC_PDF, materia, `${slug}.pdf`));
    pdf = `/pdf/${materia}/${slug}.pdf`;
  } else segnala(file, "PDF originale non trovato in materiale/");

  // Corpo
  const corpo = td
    .turndown(body.innerHTML)
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/^(\s*)-   /gm, "$1- ")
    .trim();

  const frontmatter =
    "---\n" +
    yaml("materia", materia) +
    yaml("numero", numero) +
    `data: ${data}\n` +
    yaml("titolo", titolo) +
    yaml("docente", docente) +
    yaml("modulo", modulo) +
    yaml("fonte", fonte) +
    yaml("nota", nota) +
    yaml("pdf", pdf) +
    "---\n\n";

  writeFileSync(join(cartella, `${slug}.md`), frontmatter + corpo + "\n");
  console.log(`✓ ${materia}/${slug}  (${ctx.figure} figure)`);
  return true;
}

mkdirSync(PUBLIC_PDF, { recursive: true });
const saltati: string[] = [];
for (const f of readdirSync(SORGENTE).filter((f) => f.endsWith(".html")).sort()) {
  if (!convertiLezione(f)) saltati.push(f);
}
if (saltati.length) console.log(`Non lezioni, saltati: ${saltati.join(", ")}`);

const segnalazioni = [...new Set(rapporto)];
const testoRapporto =
  `# Rapporto di conversione HTML → Markdown\n\nGenerato da \`scripts/html2md.ts\` il ${new Date().toISOString().slice(0, 10)}.\n\n` +
  (segnalazioni.length ? segnalazioni.join("\n") : "Nessun problema rilevato.") +
  "\n";
writeFileSync(join(RADICE, "materiale", "RAPPORTO-CONVERSIONE.md"), testoRapporto);
console.log(`\n${segnalazioni.length} segnalazioni → materiale/RAPPORTO-CONVERSIONE.md`);
