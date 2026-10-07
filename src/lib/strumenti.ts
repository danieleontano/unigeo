// Gli strumenti di studio, in un posto solo: li usano il menu laterale, la
// pagina Strumenti, la Home e le pagine delle materie. `simbolo` è un simbolo
// di Litologie.astro.
export interface Strumento {
  href: string;
  titolo: string;
  breve: string;
  testo: string;
  materia: string | null;
  simbolo: string;
}

export const STRUMENTI: Strumento[] = [
  { href: "/campionario", titolo: "Riconosci la pietra", breve: "Campionario", testo: "Rocce e minerali in foto, come la prova pratica", materia: "geologia-1", simbolo: "martello" },
  { href: "/qap", titolo: "Rocce magmatiche", breve: "Magmatiche", testo: "Il metodo della lezione 5 e i diagrammi delle slide: ultrafemiche, intrusive, effusive, vetrose", materia: "geologia-1", simbolo: "triangolo" },
  { href: "/mohs", titolo: "Scala di Mohs", breve: "Mohs", testo: "Durezza dei minerali e prove con unghia, rame, acciaio, vetro", materia: "geologia-1", simbolo: "cristallo" },
  { href: "/tempo", titolo: "Scala del tempo", breve: "Tempo geologico", testo: "La carta ICS ufficiale, con esercizi base e di dettaglio", materia: "paleontologia", simbolo: "fossile-ammonite" },
  { href: "/tavola", titolo: "Tavola periodica", breve: "Tavola periodica", testo: "Schede degli elementi ed esercizio su nomi e simboli", materia: "chimica", simbolo: "provetta" },
  { href: "/atomi", titolo: "Atomi e luce", breve: "Atomi e luce", testo: "Protoni, neutroni, elettroni, isotopi e ioni; luce, fotone ed effetto fotoelettrico", materia: "chimica", simbolo: "provetta" },
  { href: "/cartografia", titolo: "Cartografia di base", breve: "Cartografia", testo: "Concetti e calcoli dello scritto: scala, pendenza, coordinate", materia: "geografia-fisica", simbolo: "bussola" },
  { href: "/coordinate", titolo: "Coordinate e fusi", breve: "Coordinate", testo: "Primi e secondi dal righello, Monte Mario e Greenwich, fusi Gauss-Boaga", materia: "geografia-fisica", simbolo: "bussola" },
  { href: "/profilo", titolo: "Profilo topografico", breve: "Profilo", testo: "Dalle isoipse al profilo, passo per passo", materia: "geografia-fisica", simbolo: "isoipse" },
  { href: "/terremoti", titolo: "Terremoti", breve: "Terremoti", testo: "Gli ultimi eventi della rete sismica UniGe sulla mappa", materia: null, simbolo: "sismogramma" },
  { href: "/ispirazione", titolo: "Ispirazione", breve: "Ispirazione", testo: "Fonti vere dei geologi, fuori dal corso", materia: null, simbolo: "fossile-felce" },
];

export const strumentiDi = (materia: string) => STRUMENTI.filter((s) => s.materia === materia);
