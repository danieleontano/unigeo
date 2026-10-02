// Gira prima della build: ogni quiz deve avere la sua lezione, e ogni `ref`
// deve puntare a un titolo che nella lezione esiste davvero. Gli anchor si
// calcolano con github-slugger sul testo del titolo, come fa Astro.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";

const CONTENT = fileURLToPath(new URL("../content", import.meta.url));
const errori: string[] = [];

function anchorDi(markdown: string): Set<string> {
  const slugger = new GithubSlugger();
  const anchor = new Set<string>();
  const corpo = markdown.replace(/^---[\s\S]*?---/, "");
  for (const riga of corpo.split("\n")) {
    const m = /^(#{2,4})\s+(.+?)\s*$/.exec(riga);
    if (!m) continue;
    const testo = m[2].replace(/[*_`]/g, "").replace(/<[^>]+>/g, "");
    anchor.add(slugger.slug(testo));
  }
  return anchor;
}

for (const materia of readdirSync(CONTENT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const cartellaQuiz = join(CONTENT, materia, "quiz");
  if (!existsSync(cartellaQuiz)) continue;
  for (const file of readdirSync(cartellaQuiz).filter((f) => f.endsWith(".json"))) {
    const slug = file.replace(/\.json$/, "");
    const quiz = JSON.parse(readFileSync(join(cartellaQuiz, file), "utf8"));
    const fileLezione = join(CONTENT, materia, "lezioni", `${slug}.md`);
    if (!existsSync(fileLezione)) {
      errori.push(`${materia}/quiz/${file}: manca la lezione ${materia}/lezioni/${slug}.md`);
      continue;
    }
    if (quiz.lezione !== `${materia}/${slug}`) errori.push(`${materia}/quiz/${file}: "lezione" è «${quiz.lezione}», atteso «${materia}/${slug}»`);
    const anchor = anchorDi(readFileSync(fileLezione, "utf8"));
    const id = new Set<string>();
    for (const d of quiz.domande ?? []) {
      if (id.has(d.id)) errori.push(`${materia}/quiz/${file}: id «${d.id}» ripetuto`);
      id.add(d.id);
      if (d.ref) {
        const a = String(d.ref).replace(/^#/, "");
        if (!anchor.has(a)) errori.push(`${materia}/quiz/${file} · ${d.id}: ref «${d.ref}» non esiste. Titoli: ${[...anchor].map((x) => `#${x}`).join(" ")}`);
      }
    }
  }
}

if (errori.length) {
  console.error(`✘ ${errori.length} problemi nei quiz:\n- ${errori.join("\n- ")}`);
  process.exit(1);
}
console.log("✓ quiz e ref coerenti con le lezioni");
