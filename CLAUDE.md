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
- 2026-10-02 · Commit 2-3, contenuti: collection `lezioni`/`quiz`/`materie` con zod;
  Markdown col pipeline remark (`@astrojs/markdown-remark` + `remark-directive`),
  NON il processore nativo satteri di Astro 7, perché i riquadri `:::` passano da
  remark. Decisione di formato: i titoli `##` non portano il numero (lo mette il
  CSS con un contatore), così gli anchor e i `ref` dei quiz sono puliti. Le 10
  lezioni convertite con `scripts/html2md.ts`; 20 figure SVG salvate accanto ai
  `.md`, didascalia nell'alt → `<figure>` via `remarkFigure`. I PDF originali
  stanno in `public/pdf/<materia>/`. Rapporto per Claude chat in
  `materiale/RAPPORTO-CONVERSIONE.md`. Nel dev server gli `<img>` SVG hanno
  `naturalWidth` 0 anche se visibili: verificare a occhio, non via JS.
- 2026-10-03 · Commit 4-7, l'app: pagine di lettura (materie, elenco a righe
  strette con filtro, lezione con PDF e prev/next, pagina libri), stato in
  localStorage (`unigeo.stato.v1`, negozio come Cirulla), ripasso a 5 scatole,
  quiz a 4 tipi con `scripts/verifica-ref.ts` nella build, flashcard dai
  `:::definizione` (fronte = il grassetto con cui il blocco comincia, altrimenti
  l'etichetta). Le isole React ricevono «schede» già pronte da Astro
  (`lib/schede.ts`), non rileggono le collection. Dopo un `npm install` il dev
  server va riavviato con `node_modules/.vite` cancellata, altrimenti React
  carica due versioni del runtime JSX (`_jsxDEV is not a function`).
- 2026-10-03 · Commit 8, PWA: `@vite-pwa/astro` non supporta Astro 7, quindi
  service worker scritto a mano in `public/sw.js` (asset cache-first, pagine
  network-first con ripiego in cache) e `public/manifest.webmanifest`; si
  registra solo in produzione (`import.meta.env.PROD` nel layout). Icona
  `icone/app-512.png` rasterizzata dall'SVG di Geologia 1 via canvas nel browser.
  Fase 1 della roadmap completa salvo il punto 7 (i quiz veri li scrive Daniele).
- 2026-10-03 · Identità visiva. Daniele: «visivamente deve essere un capolavoro,
  questo è piatto», tema geologia anche nei colori, lettura continua come un
  libro. Brief in `docs/IDENTITA-VISIVA.md` (base chiara carta e sabbia, scelta
  sua; metafora della colonna stratigrafica; Fraunces + Caladea + Poppins; un
  solo accento caldo, lava). Costruito: token legati a variabili CSS (`--carta`,
  `--inchiostro`…) così il modo lettura su `:root[data-carta]` tinge tutto;
  campiture geologiche in CSS puro; `Colonna.astro` (strati, più recente in
  cima) e `Strati.astro` (striscia sotto la barra); home «Taccuino», Materie come
  correlazione; **Libro** per materia (`/materie/<m>/libro`) con `Lettore.tsx`:
  capitoli romani, capolettera, tavole numerate, Aa (zoom, colonna,
  carta/seppia/notte), avanzamento, posizione ricordata, indice a margine.
  Restano da ripellare: lezione singola, quiz, flashcard, ripasso, impostazioni.
- 2026-10-03 · Leggibilità e «Da fare». Daniele: «un po' difficile da leggere,
  la pagina dei libri quasi illeggibile». Causa: tabelle a 4 colonne in 360 px.
  Rimedio: `remarkTabelleEtichettate` mette l'intestazione di colonna in
  `data-etichetta` su ogni cella e sotto i 640 px la tabella si impila (una riga
  = una scheda, etichette in maiuscoletto). Il «lead» in corsivo torna dritto in
  grafite. Nuova sezione **Da fare**: le righe `- [ ]` delle lezioni (dettate dai
  prof) + promemoria scritti a mano, con spunta condivisa con le caselle dentro
  gli appunti (`SpunteVive.astro`, chiave «lezione#n» nell'ordine del testo).
  Il negozio è stato diviso: `lib/stato-core.ts` senza React (lo importano gli
  script Astro), `lib/stato.ts` solo gli hook. ATTENZIONE: il dev server tiene
  in cache il Markdown reso: dopo un cambio ai plugin remark cancellare
  `.astro`, `node_modules/.astro` e `node_modules/.vite` e riavviare.
- 2026-10-03 · Il wow. Daniele: «cosa non capisci di capolavoro innovativo?
  Deve essere un effetto wow, sassi e altro». Decisione: «chiaro per leggere,
  scuro per scoprire» (tema `sottosuolo` su home, materie, quiz, campioni,
  ripasso, da fare, impostazioni; carta su Libro, lezioni, pagine). Costruito
  tutto in fila: `Litologie.astro` (pattern USGS-like + fossili SVG, una volta nel
  layout, currentColor), `Sezione.astro` (home come sezione geologica: strati =
  lezioni, parallasse e affioramenti con `animation-timeline: view()`, righello
  del tempo, fossili), `Caldera.tsx` (camera magmatica = domande della settimana
  su 60, eruzione se l'ultimo quiz di oggi ≥ 80%), `Campione.astro` + `Inclina`
  (rocce sfaccettate 3D, puntatore/giroscopio), quiz come riconoscimento del
  campione (crepa/bagliore, scala di Mohs, `Eruzione.tsx` su canvas), cassettiera
  dei campioni con giro 3D vero, carota di lettura nel Libro, View Transitions
  (`ClientRouter`: TUTTI gli script Astro ascoltano `astro:page-load`, non
  girano da soli). CSS in `src/styles/sottosuolo.css` (il Bash tronca gli
  heredoc lunghi: file grandi col tool Write). Verifica visiva: il pannello
  browser nascosto congela le animazioni e fa fallire gli screenshot → screenshot
  headless con Chrome (`--headless=new --screenshot --window-size=390,3400
  --virtual-time-budget=5000`) oppure `document.getAnimations().forEach(a=>a.finish())`
  prima dello scatto.
- 2026-10-03 · «Troppo futuristico». Audit con screenshot di tutte le sezioni:
  il registro astronave veniva da nero grafite freddo, bagliore radiale, pannelli
  di vetro sfumato (backdrop-blur) e cassettiera grigio-metallo. Correzioni di
  materia, non d'idea: sottosuolo = terra bagnata (`#1c1714`, avorio `#efe4d0`,
  lava spenta `#c9552a`), grana SVG (feTurbulence) su pietra e carta, i cartellini
  degli strati e del quiz sono CARTA appuntata con spillo d'ottone (classe
  `.foglio` / `.campione-strato` con variabili chiare locali), cassetto di legno,
  caldera in sepia disegnata a mano, raggi dei bottoni 0.3rem, sassi desaturati.
  Regola: niente blur, niente glow, niente nero puro; ogni superficie ha una grana.
- 2026-10-03 · Giro di Daniele: «Da fare non mi piace» → tolto (pagina, voce,
  blocco in home; restano le caselle negli appunti e lo stato `dafare`). La
  home si chiama Home e mostra solo gli ultimi 6 strati (`Sezione limite`), il
  basamento rimanda ai Libri: trenta strati sarebbero un pozzo. Quiz e ripasso
  PER MATERIA: `/quiz/<materia>` (misto, tutte le domande della materia,
  `modalita="misto"`: va nello storico, non tocca le scatole) e `/ripasso`
  raggruppato per materia con ancore `#<materia>`; bottoni nella pagina
  materia. Nuova pagina **Ispirazione** («Extra» sul telefono): fonti vere
  (INGV, USGS, Smithsonian GVP, NASA, Mindat, ISPRA CARG, ICS, PBDB), link
  verificati il 03/10 (Smithsonian e Mindat rispondono 403 ai bot, vanno nel
  browser). TRAPPOLA CSS: i token Tailwind `--color-x: var(--x)` si risolvono
  sul `:root`; un contenitore che ridefinisce `--inchiostro` deve ridefinire
  anche `--color-inchiostro` ecc. (fatto in `.foglio` e `.campione-strato`).
- 2026-10-03 · Daniele ha scelto: foto da Wikimedia Commons subito, sismografo,
  scala del tempo, frana. Costruiti:
  · **Riconosci la pietra** (`/campionario`, `Riconosci.tsx`): 16 campioni (10
    rocce, 6 minerali) in `content/campionario/campioni.json`; foto scaricate UNA
    volta da `scripts/campionario.ts` (immagine principale della voce Wikipedia
    EN, poi imageinfo su Commons; solo licenze libere; `fileCommons` forza un
    file, `autoreFoto` corregge un autore illeggibile) in `public/campionario/`,
    con credito in pagina. Testi «famiglia/caratteri» scritti da noi: da
    rileggere con Daniele. Le foto del set di laboratorio si aggiungono allo
    stesso JSON quando arrivano.
  · **Scala del tempo** (`/tempo`): dati da `scripts/scala-tempo.ts` → Macrostrat
    API (segue la carta ICS, CC-BY) → `content/tempo/scala.json`, nomi in
    italiano, Adeano aggiunto come informale (4567→4031). Scala verticale
    √età. Non scrivere età a memoria: rigenerare dallo script.
  · **Sismografo** in Home (`Sismografo.tsx`): INGV FDSN (CORS *, formato text),
    M≥2, box Italia, 7 giorni; ultima risposta in `unigeo.sismi.v1` per l'offline.
    È l'UNICA chiamata di rete a runtime (eccezione voluta alla regola del kit).
  · **Frana** (`Frana.astro`, `transition:persist`): entrando in /materie/<m>
    gli strati crollano, `ev.loader` aspetta il crollo, dopo lo swap scivolano.
  · Home: blocco «Laboratorio» (campionario, tempo, ispirazione); bottoni
    dedicati in Geologia 1 e Paleontologia. SW v2 mette in cache anche i .jpg.
- 2026-10-04 · Giro grosso, richieste di Daniele: dati sismici da RSNI (UniGe
  DISTAV) invece che INGV; Laboratorio messo male; tavola periodica per Chimica
  (il prof usa ptable.com); Paleontologia con la carta ICS più aggiornata,
  esercizi base e di dettaglio, aggiornamento automatico; uno strumento per i
  concetti di cartografia; sezione Strumenti; foto vere delle rocce degli
  esempi; «Astro lo vedo» (era la dev toolbar in locale: spenta); «la frana non
  la vedo» (con «riduci movimento» la saltavo: ora parte, più corta).
  Costruito:
  · **RSNI**: il feed RSS (`distav.unige.it/rsni/rss-man.php`, 20 eventi rivisti
    a mano) non ha CORS → si legge IN BUILD (`lib/sismi.ts`, `Sismografo.astro`)
    e `deploy.yml` ripubblica ogni 30 minuti (cron 7,37). INGV tolto.
  · **Carta ICS ufficiale**: fonte = repo `i-c-stratigraphy/chart` (RDF Turtle,
    versionato, quello che legge stratigraphy.org/chart), via jsDelivr. Script
    `scripts/carta-ics.ts` (n3) → `content/tempo/carta-ics.json`: 179 unità con
    nomi italiani ufficiali, età ± incertezza, GSSP, colori; le unità senza
    etichetta si compongono come fa la carta (Superiore/Medio/Inferiore, Serie/
    Piano del Cambriano). Versione al 04/10/2026: v2026-06 (modificata
    20/06/2026). `carta-ics.yml` la ricontrolla ogni lunedì e committa se è
    cambiata (il deploy a cron la pubblica). Macrostrat e `scala.json` tolti.
    `/tempo` (`Tempo.tsx`): Carta (Fanerozoico con i piani / tutta la storia,
    √età), Impara le basi (ordina periodi, era di appartenenza, prima/dopo),
    Impara il dettaglio (inizio dei periodi, epoca→periodo, piano→periodo).
  · **Tavola periodica** `/tavola`: PubChem (NIH) + nomi italiani Wikidata
    (`scripts/tavola-periodica.ts`, posizione calcolata dal numero atomico e
    verificata: 118 caselle distinte). Colora per categoria/stato/
    elettronegatività, scheda, link a Ptable; esercizio sui «da sapere» della
    lezione 1 (1–30, 35–38, 47, 53–56, 78, 79): nome↔simbolo, trova sulla tavola.
  · **Cartografia** `/cartografia`: 46 concetti in `content/cartografia/
    concetti.json` (dal programma di Brandolini; da manuale, da arricchire),
    prova definizione→termine, calcolatori (distanza, pendenza/inclinazione,
    coordinate GMS↔decimali, area) con il procedimento, allenamento con
    problemi casuali.
  · **QAP** `/qap` (proposta mia): triangolo di Streckeisen superiore,
    trascinabile, nome intrusivo + effusivo (IUGS), modalità «classifica tu».
  · **Campionario** 31 campioni (10 rocce e 5 minerali nuovi), più foto per
    campione (`altriFile` → `altre`, il quiz ne pesca una a caso). Foto scelte
    guardandole su un foglio di provini (Chrome headless su un HTML di
    miniature): scartate sezioni sottili e foto con più minerali. Commons
    risponde «too many requests» se si insiste: lo script fa pause e ritenta.
  · **`::campioni{id="…"}`** nel Markdown: foto dal campionario dentro gli
    appunti (lezione 5 esempi d'aula e campi QAP, lezione 3 minerali).
  · **Strumenti** (`lib/strumenti.ts`, una lista per pagina Strumenti, Home e
    materie); voce «Strumenti» nella barra, «Home» nascosta sul telefono (il
    logo porta a casa).
- 2026-10-03 · Sync tra dispositivi: proposta Supabase gratuito offline-first,
  Daniele ha detto NO («non abbiamo più posto su Supabase»). Resta
  esporta/importa a mano; la regola «niente DB» del kit vale ancora. Da
  riaprire solo con un posto in rete a costo zero diverso da Supabase.
