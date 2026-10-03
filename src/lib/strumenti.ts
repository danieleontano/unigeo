// Gli strumenti di studio, in un posto solo: li usano la pagina Strumenti, la
// Home e le pagine delle materie. `simbolo` è un simbolo di Litologie.astro.
export interface Strumento {
  href: string;
  titolo: string;
  testo: string;
  materia: string | null;
  simbolo: string;
}

export const STRUMENTI: Strumento[] = [
  { href: "/campionario", titolo: "Riconosci la pietra", testo: "31 rocce e minerali in foto, come la prova pratica", materia: "geologia-1", simbolo: "cristallo" },
  { href: "/qap", titolo: "Triangolo QAP", testo: "Streckeisen interattivo: dal campione al nome", materia: "geologia-1", simbolo: "fossile-impronta" },
  { href: "/tempo", titolo: "Scala del tempo", testo: "La carta ICS ufficiale, con esercizi base e di dettaglio", materia: "paleontologia", simbolo: "fossile-ammonite" },
  { href: "/tavola", titolo: "Tavola periodica", testo: "Schede degli elementi ed esercizio su nomi e simboli", materia: "chimica", simbolo: "cristallo" },
  { href: "/cartografia", titolo: "Cartografia di base", testo: "Concetti e calcoli dello scritto: scala, pendenza, coordinate", materia: "geografia-fisica", simbolo: "fossile-conchiglia" },
  { href: "/ispirazione", titolo: "Ispirazione", testo: "Fonti vere dei geologi, fuori dal corso", materia: null, simbolo: "fossile-felce" },
];

export const strumentiDi = (materia: string) => STRUMENTI.filter((s) => s.materia === materia);
