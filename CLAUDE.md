# Studio — appunti dinamici per Scienze Geologiche

Sito statico personale, senza backend e senza database, per studiare le materie
del primo anno di Scienze Geologiche (UniGe, a.a. 2026/27). L'utente è Daniele:
studente, impara facendo, si concentra bene su cose concrete, ha poco metodo
di studio classico. L'app serve a trasformare gli appunti in materiale di
studio attivo (schede, quiz, ripasso spaziato). Non è un prodotto: è uno
strumento personale, va tenuto piccolo.

## Regole del progetto
- **Timebox**: l'MVP si fa in un weekend. Niente feature oltre docs/ROADMAP.md
  fase 1 finché la fase 1 non è usata davvero per una settimana.
- **Nessun DB, nessun backend, nessun login.** Tutti i contenuti stanno in
  file nel repo (Markdown + JSON). Lo stato personale (progressi, risposte,
  schedule di ripasso) sta in localStorage, con export/import JSON.
- **I contenuti arrivano da fuori**: le lezioni sono già scritte (HTML/Markdown
  prodotti con Claude in chat), i quiz anche. L'app li legge, non li genera.
- Deploy su GitHub Pages (o Netlify). Deve funzionare offline una volta caricato.
- Italiano ovunque, interfaccia inclusa.
- Mobile first: si usa soprattutto dal telefono, in treno e in aula.

## Stack (deciso, non ridiscutere)
- Astro 7 (output statico) + componenti React 19 solo dove serve interattività
  (quiz, flashcard, ripasso). Tailwind 4 via `@tailwindcss/vite`, token in
  `src/styles/globale.css`. Caratteri self-hosted (`@fontsource`), mai Google Fonts.
- Astro 7 è più recente di quanto il modello conosca e NON porta la documentazione
  nel pacchetto: prima di usare un'API si leggono i tipi in `node_modules/astro/dist`
  e `node_modules/astro/templates/content/types.d.ts`. Server di sviluppo:
  `npx astro dev --background` (poi `astro dev status | logs | stop`).
- TypeScript resta alla 6: `@astrojs/check` non accetta la 7.
- Il sito vive sotto `/unigeo` (GitHub Pages): ogni link interno passa da
  `percorso()` di `src/lib/percorsi.ts`, mai un href che parte da "/".
- Contenuti in `content/` con frontmatter; schema in docs/CONTENT_FORMAT.md.
- Nessuna dipendenza da servizi esterni. Nessuna chiamata API a runtime.

## Struttura cartelle
```
content/
  <materia>/              es. geologia-1, paleontologia, geografia-fisica, chimica, matematica
    lezioni/<slug>.md     appunti della lezione (frontmatter + markdown)
    quiz/<slug>.json      domande della lezione
    dispense/<file>.pdf   estratti slide del docente (solo link, non si parsano)
    lezioni/<slug>.svg    disegni della lezione, linkati dal markdown
src/                      Astro + React
docs/                     specifiche (leggile prima di scrivere codice)
```

## Convenzioni
- Slug lezione: `lez05-2026-10-02-classificare-rocce-magmatiche`.
- Ogni materia ha un colore e un'icona SVG (già definiti negli appunti HTML:
  geologia-1 terracotta #B5552A, paleontologia teal #1F6F78, geografia-fisica
  verde #3F6E3A, chimica viola #6A4C93). Riusali.
- Commit piccoli, messaggi in italiano.
- Prima di aggiungere una feature chiediti: "mi fa studiare di più o costruire di più?"

## Misura di successo (non è una feature)
Ogni lezione ha appunti in Markdown e quiz entro 48 ore dalla lezione. Se per
due settimane di fila salta, il problema non è nel codice.

## Diario
- 2026-10-02 · Kit iniziale (Claude chat). Note di Claude Code accolte: script
  in Node, repo fuori da Minerva (poi `C:\UniGeo`, nome scelto da Daniele;
  fuori da OneDrive perché `node_modules` sincronizzato rompe le build), identità visiva ereditata dagli
  appunti (Caladea + Poppins, colori per materia, quattro riquadri), flashcard
  dai `:::definizione` promosse in Fase 1, `ref` dei quiz con github-slugger e
  controllo in build, PDF via `@media print`. Dalla prossima lezione il
  Markdown arriva pronto dalla chat: lo script html2md è una migrazione una tantum.
- 2026-10-02 · Commit 1, scaffold: Astro 7.3 + React 19 + Tailwind 4, layout con una
  sola riga in alto, icone per materia estratte dagli appunti in `public/icone/`,
  deploy GitHub Pages con `withastro/action`. Repo pubblico `danieleontano/unigeo`
  (Pages gratis solo sui repo pubblici).
