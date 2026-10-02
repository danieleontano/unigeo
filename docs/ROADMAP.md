# Roadmap

## Fase 1 — MVP (un weekend, massimo 2 giorni)
1. Scaffold Astro + Tailwind + React island. Deploy su GitHub Pages funzionante al primo commit utile.
2. Content collections per `lezioni` (md) e `quiz` (json) con validazione schema (zod).
3. Pagine: /, /materie, /materie/<m>, lezione, quiz, /impostazioni.
4. Componente Quiz (4 tipi di domanda) + stato in localStorage + export/import.
5. Ripasso spaziato a 5 box come da SPEC.
6. Script `scripts/html2md.ts` (Node, `node-html-parser` + `turndown`) e conversione una tantum delle 10 lezioni in `materiale/html/` (Geologia 1: 5, Paleontologia: 3, Geografia fisica: 1, Chimica: 1). Gli SVG inline si salvano come file accanto alla lezione.
7. Caricare almeno 3 quiz veri (li fornisce Daniele).
8. Flashcard fronte/retro per materia, generate dai blocchi `:::definizione`, con «la sapevo / non la sapevo».
9. Foglio di stile `@media print` sulla pagina della lezione: il PDF stampabile lo fa il browser, una sorgente sola.

Fine fase 1: usarla per una settimana senza toccare il codice.

**Stato al 03/10/2026:** punti 1-6, 8, 9 fatti e pubblicati su
https://danieleontano.github.io/unigeo/ (più PWA installabile e offline).
Resta il punto 7: i quiz veri li scrive Daniele con Claude chat; nel repo c'è
un quiz di prova sulla lezione 5 di Geologia 1, da sostituire.

## Fase 2 — solo se la fase 1 viene usata davvero
- Ricerca full-text (Pagefind, statico).
- Vista "formulario" per materia: tutte le definizioni in una pagina.
- Modalità esame: 20 domande miste da una materia, a tempo.

## Mai (per ora)
- Backend, account, sync tra dispositivi oltre export/import.
- Generazione AI dei quiz dentro l'app.
- Editor di appunti nel browser.
