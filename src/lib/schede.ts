// La «scheda» di una lezione: i pochi dati che le isole React ricevono da
// Astro per mostrare liste senza rileggere le collection nel browser.
export interface SchedaLezione {
  id: string;
  materia: string;
  nomeMateria: string;
  colore: string;
  numero: number;
  titolo: string;
  data: string;
  haQuiz: boolean;
  definizioni: number;
  percorsoLezione: string;
  percorsoQuiz: string;
  percorsoFlashcard: string;
}
