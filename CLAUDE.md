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
- Il sito vive alla radice su Vercel e sotto `/unigeo` su GitHub Pages e in
  locale (astro.config.mjs guarda la variabile VERCEL): ogni link interno passa
  da `percorso()` di `src/lib/percorsi.ts`, mai un href che parte da "/".
- Contenuti in `content/` con frontmatter; schema in docs/CONTENT_FORMAT.md.
- Nessuna dipendenza da servizi esterni. Unica chiamata a runtime: la funzione
  Vercel `api/sismi.ts` (feed RSNI in diretta, cache CDN 5 minuti).

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
- 2026-10-04 · Struttura alla Minerva, su richiesta di Daniele («tanti post-it
  messi a casaccio»): menu laterale (Menu.astro: Studio, Materie, Strumenti,
  Impostazioni in fondo; su telefono cassetto dal tasto ☰), niente più header
  con `transition:persist` (teneva accesa la voce sbagliata). Ogni pagina =
  `Testata` (occhiello, titolo, una riga, azioni) + `.sezione-titolo` + griglie
  di `.pannello` uniformi; interruttori di modo = `.segmentato`. Home con
  «Ciao, Daniele» e orologio al secondo (Orologio.tsx). Frana TOLTA (Daniele
  non la vedeva: non riproporla). I token `--color-*` si risolvono su :root:
  per un colore di riga usare le classi fuori layer `.text-materia`/`.bg-materia`
  in sottosuolo.css.
- 2026-10-04 · Strumenti nuovi: QAPF completo a rombo (feldspatoidi sotto);
  carta ICS «come il poster» (CartaIcs.tsx, tre blocchi, una riga per piano,
  scheda flottante) più le viste in scala; Scala di Mohs con prova di durezza;
  Profilo topografico (carta a isoipse generata da un seme, traccia A–B,
  esercizio «quale profilo?» col profilo rovesciato come trappola); Terremoti:
  mappa RSNI su carta di base fissa (scripts/mappa-nordovest.ts, Natural Earth
  + regioni openpolis). Il feed RSNI dà solo 20 eventi: l'archivio cresce a
  ogni build in `.archivio-sismi/`, che passa tra un deploy e l'altro con
  actions/cache (niente DB, niente commit). Dati ICS: il Pridoli è sia serie
  sia piano con lo stesso id e Ludlow aveva il tetto sbagliato; lo script ora
  tiene il rango più alto e allinea i tetti ai fratelli, e lo stampa.
- 2026-10-04 · Campionario da 31 a 141 (110 nuovi: 60 rocce, 50 minerali),
  ognuno con `categoria` (Magmatica intrusiva/effusiva/piroclastica,
  Sedimentaria clastica/chimica/organogena, Metamorfica, Minerale): Riconosci
  filtra per gruppo e sceglie le risposte sbagliate nella stessa categoria;
  la scala di Mohs prende le foto per id. Foto viste una per una, solo CC
  BY*/CC0/PD, niente sezioni sottili né gemme tagliate. Lasciati fuori per
  mancanza di foto buone: marna, calcarenite, calcescisto, prasinite, torba,
  tillite, granulite, porfido, ialoclastite, troctolite, lawsonite. Pronti
  da aggiungere se servono: rodocrosite, celestina, crisocolla, cassiterite,
  wollastonite, cordierite, grossularia. Da far confermare ai docenti:
  categorie discutibili (calcari micritico/oolitico, dolomia e selce come
  «chimica», bauxite residuale, kimberlite e carbonatite intrusive, lherzolite
  e harzburgite tra le intrusive, oficalce metamorfica) e pomice/scoria
  effusive anziché piroclastiche.
- 2026-10-04 sera · Audit grafico (Daniele: «home troppo densa, il menu a
  sinistra non mi fa impazzire, il marrone mi piace»). Guscio come Minerva:
  nel menu solo i moduli (Home, Materie, Ripasso, Strumenti + Impostazioni),
  riducibile a icone (html[data-menu="rail"], in localStorage); le sezioni
  stanno nelle schede sotto l'intestazione (lib/navigazione.ts,
  Intestazione.astro), che sulle pagine di lettura non ci sono. Testata a
  riquadro solo per le aperture dei moduli, piana (`piana`) per strumenti,
  quiz, flashcard, impostazioni. Home = apertura + tre scorciatoie (ripasso,
  ultima lezione, terremoto) + materie; caldera spostata nel Ripasso,
  sismografo e strati della Home tolti. Marrone «cuoio» (--cuoio #a8643c)
  per voce attiva, schede, chip e testate; lava solo per le azioni. Nel
  sottosuolo un solo carattere d'interfaccia (Poppins, 15px); il serif resta
  alle lezioni. Tinta di testate e chip in `--tinta` (non `--materia`, che ha
  un default ardesia su :root).
- 2026-10-04 sera · Verso Vercel (piano Hobby, gratis). Base condizionale
  (radice su Vercel, /unigeo su Pages), manifest e service worker relativi,
  vercel.json con cleanUrls (le pagine sono .html, build.format "file").
  Terremoti: archivio nel repo (content/terremoti/archivio.json), allungato
  ogni due ore dal workflow «Archivio terremoti» con un commit solo se ci sono
  eventi nuovi; in mezzo la mappa legge api/sismi.ts (funzione Vercel nella
  cartella api/, accanto al sito statico). Niente cron di Vercel: su Hobby
  uno al giorno al massimo. Il deploy su Pages non ha più il cron ogni 30
  minuti; si spegne quando Vercel è confermato.
- 2026-10-05 · «Diagramma QAPF» diventa «Rocce magmatiche» (/qap, stesso
  indirizzo), allineato alle slide «3. Le rocce magmatiche» di Piazza (in
  Downloads di Daniele): il metodo della lezione 5 a domande (tessitura →
  femici → quarzo/feldspatoidi), ultrafemiche (Ol-Opx-Cpx, Le Maitre 2002),
  Streckeisen intrusive ED effusive (campi diversi: dacite, latite,
  basalto/andesite da Q 20 a F 10, tefrite/basanite, foiditi), vetrose
  (ossidiana/scoria/pomice dalle vescicole; triangolo granulometrico delle
  piroclastiti; termini genetici della slide 12), esercizio misto e glossario
  (content/geologia-1/glossario-magmatiche.json). Dati in src/lib/magmatiche.ts;
  la vista si apre dall'indirizzo (/qap#effusive) per collegarla dalle lezioni.
  Ogni campo ha anche il nome inglese della slide.
- 2026-10-05 · Chiave di accesso. Daniele vuole il sito privato con due
  chiavi: «sassi» = solo strumenti, «roccemaledette» = anche gli appunti
  (lezioni, Libro, quiz, flashcard, ripasso, PDF). Vercel scartato da lui
  («troppa poca archiviazione»; in realtà il sito pesa ~60 MB, ma la decisione
  è sua): si resta su GitHub Pages. Pages gratis vuole il repo pubblico e non
  ha controllo d'accesso, quindi la chiave è un VELO: pagina /accesso, impronta
  SHA-256 in un cookie, controllo nel browser in testa a ogni pagina
  (Base.astro), voci di menu nascoste per gli strumenti. Repo e HTML restano
  leggibili da chi li cerca: detto chiaramente a Daniele, che aveva proposto
  lui «nascondiamo». Regole in src/lib/accesso.ts; middleware.ts (Vercel)
  pronto se un giorno si vuole la serratura vera. noindex + robots.txt.
  I workflow dei terremoti e della carta ICS, dopo il commit, avviano
  deploy.yml con `gh workflow run` (il push col token di Actions non lo fa).
- 2026-10-05 sera · Daniele ha importato il progetto su Vercel (team
  gestionale-minerva, https://unigeo-tau.vercel.app). Primo deploy: 500
  MIDDLEWARE_INVOCATION_FAILED su tutto. Causa: Vercel NON impacchetta
  middleware.ts né api/*.ts in un file solo; gli import locali senza
  estensione («./src/lib/accesso») non si risolvono. Regola: negli import di
  middleware.ts e api/ scrivere «.js» (TypeScript lo risolve sul .ts). Il
  middleware ora gira su Node.js (runtime "nodejs"; edge è deprecato).
  Per riprodurre in locale: `.vercel/project.json` con settings
  framework "astro" e `VERCEL=1 npx vercel build`, poi importare con node i
  file in `.vercel/output/functions/`. Su Vercel la chiave è una serratura
  vera (provato: senza cookie esce solo /accesso). Restano pubblici il repo
  GitHub e la copia su GitHub Pages: da chiudere se Daniele conferma.
- 2026-10-06 · Rifacimento grafico «Vetrina» (Daniele: «home banale e piatta,
  settori troppo caotici, voglio il wow»). Claude Design non si è collegato
  (403, serve /design-login): si è progettato direttamente nel codice, con
  screenshot a ogni passo. Idea: le 141 foto del campionario sono il materiale
  grafico, tenute insieme da una tinta calda (mix-blend-mode multiply + bordi
  sfumati con mask, così sfondi bianchi/blu/neri spariscono). Home = apertura
  con il CAMPIONE DEL GIORNO a destra (componenti/CampioneGiorno.tsx; indice
  del giorno italiano in lib/foto.ts; `/?campione=granito` forza un campione)
  + nastro dei periodi ICS in fondo + tre tessere vive (anello del ripasso,
  ultima lezione, mini-mappa RSNI) + le materie coi sassi 3D. Strumenti: ogni
  tessera ha un'anteprima viva (AnteprimaStrumento.astro, tutta SVG o foto).
  Stile in src/styles/vetrina.css (dopo sottosuolo.css); `.sale` = entrata
  scalata con --i. Miniature 640px in public/campionario/mini/ (scripts/
  miniature.ts, lanciata anche da campionario.ts): riquadri e mosaici usano
  quelle, il riconoscimento a schermo pieno gli originali.
  In locale, per gli screenshot senza chiave: `PUBLIC_UNIGEO_APERTO=1 npx astro
  dev` (disattiva solo il controllo nel browser; in produzione non esiste).
- 2026-10-08 · Ritocchi dopo la prova di Daniele sul sito pubblicato.
  (1) BUG: nel sito costruito l'indirizzo della Home arriva come «/index» (o
  «/unigeo/index.html»), non «/»: Menu e Intestazione la scambiavano per
  Strumenti (voce accesa sbagliata e schede degli strumenti in cima).
  percorsoPagina() ora toglie anche «/index». In `astro dev` non si vedeva.
  (2) Sassi 3D delle materie TOLTI («brutti, troppo futuristici»): al loro posto
  la foto di un campione tinta nel colore della materia (campo `campione` in
  materia.json; lib/campioni.ts), anche nella testata della materia.
  Campione.astro e Inclina.astro cancellati.
  (3) Chiave: ora il menu mostra «Chiave: appunti/strumenti · cambia o esci» e
  Impostazioni ha il blocco «Chiave di accesso». Tolta la riga «quaderno
  privato» dalla pagina d'accesso. Il cancello in locale è SEMPRE attivo: per gli
  screenshot si usa `?aperto` nell'indirizzo (solo in `astro dev`, mai nel sito
  pubblicato); la vecchia variabile PUBLIC_UNIGEO_APERTO non esiste più. Pagine
  date a chi ha la chiave: Cache-Control private + Vary: Cookie.
  Daniele ha detto che in incognito da Chrome il link Vercel NON chiedeva la
  chiave: non riproducibile (55 richieste curl, Chrome incognito su 4
  indirizzi e UA iPhone: sempre reindirizzato a /accesso). Chiesto l'indirizzo
  esatto. Nota: `unigeo.vercel.app` è un altro progetto, non nostro.
  (4) Riconosci la pietra: le foto del mosaico mostrano il nome (e la categoria
  al passaggio del mouse) e un clic apre la scheda del campione.
  Dopo aver cambiato lo schema delle materie, svuotare .astro/ (cache dei dati).
