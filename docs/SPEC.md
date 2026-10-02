# Specifica funzionale

## Obiettivo
Avere un posto unico, dinamico, dove:
1. leggere gli appunti di ogni lezione, ordinati per materia e data;
2. ripassare attivamente con quiz per lezione e per materia;
3. sapere ogni giorno cosa ripassare (ripetizione spaziata);
4. costruire il materiale stesso (scrivere/incollare domande) come forma di studio.

## Non obiettivi (per ora)
- Nessuna generazione automatica di quiz con AI dentro l'app.
- Nessuna condivisione con altri, nessun account.
- Nessun editor WYSIWYG: i contenuti si modificano nei file.
- Niente upload di PDF con parsing: le dispense sono solo link a file nel repo.

## Utente e contesto d'uso
Una persona sola. Telefono in treno (10–20 minuti), tablet in aula, PC a casa
nel weekend. Deve essere veloce da aprire e da usare con una mano.

## Pagine

### / (Oggi)
- Lista "Da ripassare oggi": le lezioni con quiz in scadenza secondo lo
  schedule (vedi Ripasso). Un tasto "Inizia" per ognuna.
- Ultime lezioni aggiunte (3).
- Contatore semplice: domande fatte questa settimana, percentuale corrette.

### /materie
Griglia delle materie con colore, numero lezioni, numero quiz, prossimo
appuntamento (facoltativo, da `content/<materia>/materia.json`).

### /materie/<materia>
Elenco cronologico delle lezioni: numero, data, titolo, docente, badge
"quiz disponibile", stato ripasso (mai fatto / in corso / ok).

### /materie/<materia>/lezioni/<slug>
- Appunti renderizzati dal Markdown (titoli, tabelle, riquadri: definizione,
  all'esame, da disegnare, ndr).
- Barra laterale (o accordion su mobile): indice della lezione, link alle
  dispense, link al PDF originale se presente.
- In fondo: "Fai il quiz di questa lezione" + "Segna come ripassata".

### /quiz/<materia>/<slug>
- Una domanda alla volta. Tipi: scelta multipla, vero/falso, risposta aperta
  breve con autovalutazione (mostra la soluzione, l'utente dice "giusto/sbagliato"),
  abbinamento (coppie).
- Dopo la risposta: spiegazione + link al paragrafo degli appunti (`ref`).
- A fine quiz: punteggio, domande sbagliate da rifare, aggiornamento schedule.

### /ripasso
Vista calendario/lista di tutto lo schedule, con possibilità di rimandare o
anticipare una lezione.

### /impostazioni
Export/import dello stato (JSON), reset, scelta materie attive.

## Ripasso spaziato (semplice, niente algoritmi complessi)
Per ogni lezione si salva `box` (1–5) e `nextReview`.
- Quiz completato con ≥ 80% corrette → box +1; < 50% → box = 1; altrimenti box invariato.
- Intervalli per box: 1 → 1 giorno, 2 → 3 giorni, 3 → 7 giorni, 4 → 14 giorni, 5 → 30 giorni.
- Una lezione nuova parte in box 1 con nextReview = oggi.
- Le domande sbagliate si ripropongono per prime al quiz successivo.

## Stato in localStorage
Chiave unica `studio.state.v1`:
```json
{
  "progress": { "<materia>/<slug>": { "box": 2, "nextReview": "2026-10-05", "lastScore": 0.8, "wrongIds": ["q3"] } },
  "history": [ { "date": "2026-10-02", "lesson": "geologia-1/lez05-...", "correct": 8, "total": 10 } ],
  "settings": { "materieAttive": ["geologia-1","paleontologia","geografia-fisica","chimica","matematica"] }
}
```

## Criteri di accettazione MVP
- Posso aprire il sito dal telefono, vedere "Da ripassare oggi" e fare un quiz in meno di 5 minuti.
- Aggiungere una lezione = copiare un .md e un .json in `content/` e fare commit. Nessun altro passaggio.
- Lo stato sopravvive alla chiusura del browser e si può esportare.
- Build statica senza errori, deploy automatico su push.
