// I diagrammi per classificare le rocce magmatiche, come nelle slide
// «3. Le rocce magmatiche» di Geologia 1 (Piazza, 2025/26) e nella lezione 5:
// - ultrafemiche (femici ≥ 90%): triangolo olivina, ortopirosseno, clinopirosseno
//   (Le Maitre et al. 2002);
// - intrusive con femici < 90%: doppio triangolo di Streckeisen (QAPF);
// - effusive: Streckeisen per le effusive, sui fenocristalli;
// - vetrose frammentarie (piroclastiti): triangolo granulometrico;
// - vetrose non frammentarie: ossidiana, scoria, pomice dalle vescicole.
// Solo dati e funzioni pure: il disegno sta in components/Magmatiche.tsx.

// ---------------------------------------------------------------------------
// QAPF: un valore con segno v (v > 0 = %Q, v < 0 = %F; quarzo e feldspatoidi
// non convivono) e il rapporto r = P/(A+P) in %.
// ---------------------------------------------------------------------------

export interface CampoQapf {
  v: [number, number];
  r: [number, number];
  nome: string;
  /** Il nome com'è scritto sulla slide (in inglese). */
  inglese: string;
  breve?: string;
  nota?: string;
}

const NOTA_DGA = "Stessa casella: decide il femico. Anfibolo (prismi sottili, aghetti a ciuffetti) = diorite; pirosseno (prismi tozzi) = gabbro; quasi solo plagioclasio = anortosite. La slide aggiunge la composizione del plagioclasio.";

export const INTRUSIVE: CampoQapf[] = [
  { v: [90, 100], r: [0, 100], nome: "Quarzolite", inglese: "quartzolite" },
  { v: [60, 90], r: [0, 100], nome: "Granitoide ricco in quarzo", inglese: "quartz-rich granitoid", breve: "Granitoide ricco in Q" },
  { v: [20, 60], r: [0, 10], nome: "Granito a feldspato alcalino", inglese: "alkali feldspar granite" },
  { v: [20, 60], r: [10, 35], nome: "Sienogranito", inglese: "syenogranite", nota: "Sienogranito e monzogranito insieme sono il campo del granito (la linea a 35 è tratteggiata). «Se diciamo che è un granito, siamo già a posto.»" },
  { v: [20, 60], r: [35, 65], nome: "Monzogranito", inglese: "monzogranite", nota: "Sienogranito e monzogranito insieme sono il campo del granito (la linea a 35 è tratteggiata)." },
  { v: [20, 60], r: [65, 90], nome: "Granodiorite", inglese: "granodiorite" },
  { v: [20, 60], r: [90, 100], nome: "Tonalite", inglese: "tonalite" },
  { v: [5, 20], r: [0, 10], nome: "Quarzosienite a feldspato alcalino", inglese: "quartz alkali feldspar syenite" },
  { v: [5, 20], r: [10, 35], nome: "Quarzosienite", inglese: "quartz syenite", breve: "Q-sienite" },
  { v: [5, 20], r: [35, 65], nome: "Quarzomonzonite", inglese: "quartz monzonite", breve: "Q-monzonite" },
  { v: [5, 20], r: [65, 90], nome: "Quarzomonzodiorite / quarzomonzogabbro", inglese: "quartz monzodiorite, quartz monzogabbro", breve: "Q-monzodiorite" },
  { v: [5, 20], r: [90, 100], nome: "Quarzodiorite / quarzogabbro / quarzoanortosite", inglese: "quartz diorite, quartz gabbro, quartz anorthosite", nota: NOTA_DGA },
  { v: [0, 5], r: [0, 10], nome: "Sienite a feldspato alcalino", inglese: "alkali feldspar syenite" },
  { v: [0, 5], r: [10, 35], nome: "Sienite", inglese: "syenite" },
  { v: [0, 5], r: [35, 65], nome: "Monzonite", inglese: "monzonite" },
  { v: [0, 5], r: [65, 90], nome: "Monzodiorite / monzogabbro", inglese: "monzodiorite, monzogabbro", breve: "Monzodiorite" },
  { v: [0, 5], r: [90, 100], nome: "Diorite / gabbro / anortosite", inglese: "diorite, gabbro, anorthosite", nota: NOTA_DGA },
  { v: [-10, 0], r: [0, 10], nome: "Sienite a feldspato alcalino con feldspatoidi", inglese: "foid-bearing alkali feldspar syenite" },
  { v: [-10, 0], r: [10, 35], nome: "Sienite con feldspatoidi", inglese: "foid-bearing syenite", breve: "Sienite c. foidi" },
  { v: [-10, 0], r: [35, 65], nome: "Monzonite con feldspatoidi", inglese: "foid-bearing monzonite", breve: "Monzonite c. foidi" },
  { v: [-10, 0], r: [65, 90], nome: "Monzodiorite / monzogabbro con feldspatoidi", inglese: "foid-bearing monzodiorite, foid-bearing monzogabbro", breve: "Monzogabbro c. foidi" },
  { v: [-10, 0], r: [90, 100], nome: "Diorite / gabbro / anortosite con feldspatoidi", inglese: "foid-bearing diorite, gabbro, anorthosite", nota: NOTA_DGA },
  { v: [-60, -10], r: [0, 10], nome: "Sienite a feldspatoidi", inglese: "foid syenite" },
  { v: [-60, -10], r: [10, 50], nome: "Monzosienite a feldspatoidi", inglese: "foid monzosyenite", breve: "Monzosienite a foidi" },
  { v: [-60, -10], r: [50, 90], nome: "Monzodiorite / monzogabbro a feldspatoidi", inglese: "foid monzodiorite, foid monzogabbro", breve: "Monzogabbro a foidi" },
  { v: [-60, -10], r: [90, 100], nome: "Diorite / gabbro a feldspatoidi", inglese: "foid diorite, foid gabbro", breve: "Diorite / gabbro a foidi" },
  { v: [-100, -60], r: [0, 100], nome: "Foidolite", inglese: "foidolite" },
];

const NOTA_BA = "A occhio è quasi impossibile distinguere andesite e basalto: i fenocristalli sono quasi tutti plagioclasio. L'andesite è un po' più chiara, ma è empirico: decide il laboratorio.";
const NOTA_OL = "Basanite se l'olivina supera il 10%, tefrite se resta sotto.";

export const EFFUSIVE: CampoQapf[] = [
  { v: [60, 100], r: [0, 100], nome: "Nessuna effusiva", inglese: "(campo vuoto)", breve: "—", nota: "Non esistono lave così ricche di quarzo: sulla slide il campo è vuoto." },
  { v: [20, 60], r: [0, 10], nome: "Riolite a feldspato alcalino", inglese: "alkali feldspar rhyolite" },
  { v: [20, 60], r: [10, 65], nome: "Riolite", inglese: "rhyolite", nota: "Stesso campo di sienogranito e monzogranito: la riolite è l'equivalente effusivo del granito." },
  { v: [20, 60], r: [65, 100], nome: "Dacite", inglese: "dacite", nota: "Equivalente effusivo di granodiorite e tonalite." },
  { v: [5, 20], r: [0, 10], nome: "Quarzotrachite a feldspato alcalino", inglese: "quartz alkali feldspar trachyte" },
  { v: [5, 20], r: [10, 35], nome: "Quarzotrachite", inglese: "quartz trachyte", breve: "Q-trachite" },
  { v: [5, 20], r: [35, 65], nome: "Quarzolatite", inglese: "quartz latite", breve: "Q-latite" },
  { v: [-10, 20], r: [65, 100], nome: "Basalto / andesite", inglese: "basalt, andesite", breve: "Basalto / andesite", nota: NOTA_BA },
  { v: [0, 5], r: [0, 10], nome: "Trachite a feldspato alcalino", inglese: "alkali feldspar trachyte" },
  { v: [0, 5], r: [10, 35], nome: "Trachite", inglese: "trachyte" },
  { v: [0, 5], r: [35, 65], nome: "Latite", inglese: "latite" },
  { v: [-10, 0], r: [0, 10], nome: "Trachite a feldspato alcalino con feldspatoidi", inglese: "foid-bearing alkali feldspar trachyte" },
  { v: [-10, 0], r: [10, 35], nome: "Trachite con feldspatoidi", inglese: "foid-bearing trachyte", breve: "Trachite c. foidi" },
  { v: [-10, 0], r: [35, 65], nome: "Latite con feldspatoidi", inglese: "foid-bearing latite", breve: "Latite c. foidi" },
  { v: [-60, -10], r: [0, 10], nome: "Fonolite", inglese: "phonolite" },
  { v: [-60, -10], r: [10, 50], nome: "Fonolite tefritica", inglese: "tephritic phonolite" },
  { v: [-60, -10], r: [50, 90], nome: "Basanite fonolitica / tefrite fonolitica", inglese: "phonolitic basanite, phonolitic tephrite", breve: "Tefrite fonolitica", nota: NOTA_OL },
  { v: [-60, -10], r: [90, 100], nome: "Basanite / tefrite", inglese: "basanite, tephrite", breve: "Basanite / tefrite", nota: `${NOTA_OL} È il campo del campione 3 visto in aula: porfirica, vescicolare, con feldspatoidi bianchi e globulari.` },
  { v: [-90, -60], r: [0, 50], nome: "Foidite fonolitica", inglese: "phonolitic foidite", breve: "F. fonolitica" },
  { v: [-90, -60], r: [50, 100], nome: "Foidite tefritica", inglese: "tephritic foidite", breve: "F. tefritica" },
  { v: [-100, -90], r: [0, 100], nome: "Foidite", inglese: "foidite", breve: "" },
];

/** Le linee tratteggiate della slide (non separano nomi). */
export const TRATTEGGI_INTRUSIVE: { v: [number, number]; r: number }[] = [];
export const TRATTEGGI_EFFUSIVE: { v: [number, number]; r: number }[] = [
  { v: [20, 60], r: 35 },
  { v: [20, 60], r: 90 },
  { v: [-60, -10], r: 90 },
];

export function campoQapf(campi: CampoQapf[], v: number, r: number): CampoQapf {
  return campi.find((c) => v >= c.v[0] && v <= c.v[1] && r >= c.r[0] && r <= c.r[1]) ?? campi[0];
}

/** Q (o F), A, P normalizzati a 100 da v e r. */
export function componentiQapf(v: number, r: number) {
  const resto = 100 - Math.abs(v);
  const p = Math.round((resto * r) / 100);
  return { q: v > 0 ? v : 0, f: v < 0 ? -v : 0, a: resto - p, p };
}

// ---------------------------------------------------------------------------
// Triangoli: coordinate baricentriche [alto, sinistra, destra] in %.
// ---------------------------------------------------------------------------

export type Terna = [number, number, number];

export interface CampoTernario {
  nome: string;
  inglese: string;
  breve?: string;
  /** Il gruppo dei «tre nomi fondamentali» (dunite, peridotite, pirossenite). */
  gruppo?: string;
  nota?: string;
  poligono: Terna[];
  /** Dove scrivere il nome, se non al centro (strisce strette lungo i lati). */
  etichetta?: Terna;
  /** Rotazione del nome in gradi (le strisce lungo i lati). */
  angolo?: number;
  corpo?: number;
}

export interface Ternario {
  vertici: [string, string, string];
  campi: CampoTernario[];
  classifica: (t: Terna) => CampoTernario;
  /** Tacche sui lati: posizione e testo. */
  tacche: { punto: Terna; testo: string }[];
}

const per = (campi: CampoTernario[], nome: string) => campi.find((c) => c.nome === nome)!;

// Ultrafemiche: [olivina, ortopirosseno, clinopirosseno]
const ULTRA: CampoTernario[] = [
  { nome: "Dunite", inglese: "dunite", gruppo: "Duniti", etichetta: [94, 3, 3], corpo: 7, poligono: [[100, 0, 0], [90, 10, 0], [90, 0, 10]], nota: "Olivina oltre il 90%: verde oliva, granulare. Fresca non è poi così scura." },
  { nome: "Harzburgite", inglese: "harzburgite", gruppo: "Peridotiti", etichetta: [65, 32.6, 2.4], angolo: -60, corpo: 8, poligono: [[90, 10, 0], [40, 60, 0], [40, 55, 5], [90, 5, 5]], nota: "Olivina e ortopirosseno, quasi niente clinopirosseno." },
  { nome: "Lherzolite", inglese: "lherzolite", gruppo: "Peridotiti", poligono: [[90, 5, 5], [40, 55, 5], [40, 5, 55]], nota: "Olivina con entrambi i pirosseni: la peridotite tipica del mantello." },
  { nome: "Wehrlite", inglese: "wehrlite", gruppo: "Peridotiti", etichetta: [65, 2.4, 32.6], angolo: 60, corpo: 8, poligono: [[90, 0, 10], [90, 5, 5], [40, 5, 55], [40, 0, 60]], nota: "Olivina e clinopirosseno, quasi niente ortopirosseno." },
  { nome: "Ortopirossenite ad olivina", inglese: "olivine orthopyroxenite", gruppo: "Pirosseniti", etichetta: [25, 72.6, 2.4], angolo: -60, corpo: 6.5, poligono: [[40, 60, 0], [10, 90, 0], [10, 85, 5], [40, 55, 5]] },
  { nome: "Websterite ad olivina", inglese: "olivine websterite", gruppo: "Pirosseniti", poligono: [[40, 55, 5], [10, 85, 5], [10, 5, 85], [40, 5, 55]] },
  { nome: "Clinopirossenite ad olivina", inglese: "olivine clinopyroxenite", gruppo: "Pirosseniti", etichetta: [25, 2.4, 72.6], angolo: 60, corpo: 6.5, poligono: [[40, 0, 60], [40, 5, 55], [10, 5, 85], [10, 0, 90]] },
  { nome: "Ortopirossenite", inglese: "orthopyroxenite", gruppo: "Pirosseniti", breve: "", poligono: [[10, 90, 0], [0, 100, 0], [0, 90, 10]] },
  { nome: "Websterite", inglese: "websterite", gruppo: "Pirosseniti", poligono: [[10, 90, 0], [0, 90, 10], [0, 10, 90], [10, 0, 90]] },
  { nome: "Clinopirossenite", inglese: "clinopyroxenite", gruppo: "Pirosseniti", breve: "", poligono: [[10, 0, 90], [0, 10, 90], [0, 0, 100]] },
];

export const ULTRAFEMICHE: Ternario = {
  vertici: ["Olivina", "Ortopirosseno", "Clinopirosseno"],
  campi: ULTRA,
  classifica: ([ol, opx, cpx]) => {
    if (ol >= 90) return per(ULTRA, "Dunite");
    if (ol >= 40) return per(ULTRA, cpx < 5 ? "Harzburgite" : opx < 5 ? "Wehrlite" : "Lherzolite");
    if (ol >= 10) return per(ULTRA, cpx < 5 ? "Ortopirossenite ad olivina" : opx < 5 ? "Clinopirossenite ad olivina" : "Websterite ad olivina");
    return per(ULTRA, opx >= 90 ? "Ortopirossenite" : cpx >= 90 ? "Clinopirossenite" : "Websterite");
  },
  tacche: [
    { punto: [90, 10, 0], testo: "90" },
    { punto: [40, 60, 0], testo: "40" },
    { punto: [10, 90, 0], testo: "10" },
  ],
};

export const GRUPPI_ULTRA: Record<string, string> = {
  Duniti: "Olivina ≥ 90%.",
  Peridotiti: "Olivina tra 40 e 90%. Tra le più frequenti; l'equivalente effusivo è la komatiite.",
  Pirosseniti: "Olivina sotto il 40%: dominano i pirosseni.",
};

// Piroclastiti: [blocchi e bombe, lapilli, ceneri]
const PIRO: CampoTernario[] = [
  { nome: "Agglomerato / breccia piroclastica", inglese: "agglomerate, pyroclastic breccia", breve: "Agglomerato / breccia", etichetta: [81, 9.5, 9.5], corpo: 8, poligono: [[100, 0, 0], [75, 25, 0], [75, 0, 25]], nota: "Consolidato. Agglomerato se prevalgono le bombe (arrotondate, lanciate ancora fuse), breccia piroclastica se prevalgono i blocchi (angolosi). Sciolto: tefra a bombe o a blocchi." },
  { nome: "Breccia tufacea", inglese: "tuff-breccia, ash-breccia", poligono: [[75, 25, 0], [25, 75, 0], [25, 0, 75], [75, 0, 25]], nota: "Blocchi tra 25 e 75%, il resto lapilli e ceneri." },
  { nome: "Lapillite", inglese: "lapillistone (sciolto: lapilli tephra)", poligono: [[25, 75, 0], [0, 100, 0], [0, 75, 25]], nota: "Lapilli oltre il 75%. Sciolti si chiamano semplicemente lapilli (tefra a lapilli)." },
  { nome: "Tufo a lapilli", inglese: "lapilli-tuff (sciolto: lapilli ash)", poligono: [[25, 75, 0], [0, 75, 25], [0, 25, 75], [25, 0, 75]], nota: "Lapilli e ceneri mescolati, pochi blocchi." },
  { nome: "Tufo", inglese: "ash tuff (sciolto: ash, cenere)", poligono: [[25, 0, 75], [0, 25, 75], [0, 0, 100]], nota: "Ceneri oltre il 75%. Tufo di caduta o tufo saldato (da flusso piroclastico): in entrambi i casi un tufo in senso geologico. Attenzione: il «tufo» delle Langhe è una marna, sedimentaria." },
];

export const PIROCLASTITI: Ternario = {
  vertici: ["Blocchi e bombe > 64 mm", "Lapilli 2–64 mm", "Ceneri < 2 mm"],
  campi: PIRO,
  classifica: ([b, l, c]) => {
    if (b >= 75) return PIRO[0];
    if (b >= 25) return PIRO[1];
    if (l >= 75) return PIRO[2];
    if (c >= 75) return PIRO[4];
    return PIRO[3];
  },
  tacche: [
    { punto: [75, 25, 0], testo: "75" },
    { punto: [25, 75, 0], testo: "25" },
  ],
};

// Vetrose non frammentarie: dalle vescicole.
export function vetrosaDa(vescicole: number): { nome: string; testo: string } {
  if (vescicole <= 3) return { nome: "Ossidiana", testo: "Solo vetro vulcanico, vescicole praticamente assenti: magma tanto viscoso da non riuscire a cristallizzare. Frattura concoide, nero lucido." };
  if (vescicole < 50) return { nome: "Scoria", testo: "Vescicole sotto il 50%: stessa origine della pomice, meno ricca di gas. Scura, ruvida, pesante rispetto alla pomice." };
  return { nome: "Pomice", testo: "Vescicole almeno il 50% della roccia: lava ricchissima di gas. È così piena di vuoti che galleggia." };
}

/** I termini genetici della slide 12: si usano quando si capisce come si è messa in posto. */
export const GENETICI: { nome: string; testo: string }[] = [
  { nome: "Flusso di blocchi e ceneri", testo: "Block and ash flow: prodotto di un flusso piroclastico fatto soprattutto di blocchi e ceneri." },
  { nome: "Ignimbrite", testo: "Prodotto di un flusso piroclastico di pomice e cenere, con clasti dai lapilli ai blocchi." },
  { nome: "Ialoclastite", testo: "Hyaloclastite: lava effusa in acqua, sotto un ghiacciaio o in sedimenti saturi d'acqua; il raffreddamento rapidissimo la frammenta in piccoli clasti angolosi." },
  { nome: "Autoclastite", testo: "Una colata che si frammenta da sola, sul posto, per qualunque causa meccanica." },
];
