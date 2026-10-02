# Note di Claude Code sul kit «Studio» (02/10/2026)

Da aggiungere al kit come `docs/NOTE-DI-CODE.md` e da far leggere a chi
costruisce insieme a CLAUDE.md. Sono correzioni e integrazioni, non una
riscrittura: l'impianto del kit (timebox, niente DB, contenuti da file,
«mi fa studiare o costruire?») è giusto e va tenuto.

## 1. Cose del kit che non tornano sul PC di Daniele

- **Python non è installato.** Si può installare in due minuti, ma per
  convertire quattro file HTML non vale un secondo runtime: lo script si
  scrive in Node/TypeScript (`node-html-parser` + `turndown`) e gira con lo
  stesso `npx` del progetto. Se Daniele preferisce Python, va bene lo stesso:
  è una scelta di comodo, non un vincolo.
- **La conversione copre 4 lezioni su 10.** In `materiale/` gli HTML sono
  solo gli ultimi di ogni materia (Geologia 1 lez. 5, Paleontologia lez. 3,
  Geografia fisica lez. 1, Chimica lez. 1). Le altre sei esistono solo come
  PDF. Il punto 6 della roadmap va riscritto: si convertono le quattro, le
  altre sei entrano come lezioni «solo PDF» (frontmatter + link) e si
  riscrivono in Markdown con Claude in chat una per volta, quando si
  ripassano. Chiedere prima a Claude chat se ha ancora gli HTML sorgente.
- **Il convertitore è una migrazione una tantum, non un passo del flusso.**
  Dalla prossima lezione Claude chat scrive direttamente il Markdown di
  `CONTENT_FORMAT.md`. Il PDF stampabile lo produce il sito con un foglio di
  stile `@media print` sulla pagina della lezione: un formato solo, una
  sorgente sola. Sparisce un passaggio di produzione a ogni lezione.

## 2. Dove sta il repo e con quale identità

- **Fuori da `C:\Minerva`.** Il `CLAUDE.md` condiviso di Minerva impone
  Next.js + Prisma + Supabase e le regole del gestionale: con Astro
  litigherebbe a ogni sessione. Cartella `C:\Studio`, suo CLAUDE.md, fine.
- Identità git **personale** (controllare `git config user.email` nel repo
  prima del primo commit), repo sull'account personale. Non è CRI, non è un
  committente: non serve nemmeno l'org `gestionale-minerva`.
- GitHub Pages va bene. Se si preferisce Vercel Hobby (già noto), Astro
  statico ci sta senza configurare nulla; niente cron, niente funzioni.

## 3. Stack: Astro sì, guscio Minerva no

Astro è la scelta giusta per questa forma (Markdown + poche isole
interattive) e non va ridiscussa. Quello che NON si fa: partire da
`C:\Minerva\base`. La lezione di Cirulla è scritta nel suo AGENTS.md: il
guscio gestionale ha fatto sì che «la cornice pesasse più del gioco», e il
1/10/2026 sono stati tolti 59 file mai usati. Qui la cornice deve essere
quasi nulla: una riga in alto, i contenuti, basta.

Da Minerva si porta il **metodo**, non il codice del gestionale. Tre pezzi
di codice sì, da copiare e adattare:

| Da dove | Cosa | Perché |
| --- | --- | --- |
| `Cirulla/lib/cirulla/salvataggio.ts` | il negozio su localStorage con `useSyncExternalStore`, snapshot stabile in cache, `try/catch` su lettura e scrittura | è esattamente lo «stato personale» della SPEC; evita i bug di idratazione e lo storage pieno già incontrati |
| `Cirulla/app/manifest.ts` + icone | la PWA installabile | la SPEC chiede «offline una volta caricato»: in Astro si fa con `@vite-pwa/astro`, il manifest si ricopia |
| `CRI/components/mi-preparo/gioco-zaino.tsx` | la macchina a fasi `inizio → gioco → risultato` con timer e mescolata | è lo scheletro del componente Quiz; si butta la logica dello zaino, resta la struttura |

Niente shadcn, niente Base UI, niente `IconaApp` in Fase 1: per quattro
tipi di domanda e una lista di lezioni bastano Tailwind e HTML.

## 4. Regole UX di Minerva che valgono anche qui

Prese da `C:\Minerva\CLAUDE.md`, selezionate per un sito di studio:

1. **Testi asciutti.** Etichette, non frasi. Niente spiegazioni sotto i
   campi. Il toast dice «Fatto.».
2. **Elenco lezioni a righe strette** (una riga una lezione, ~30px,
   `truncate`, tutta la riga cliccabile). Su telefono restano righe, non card.
3. **Mai `grid` senza colonna di base** (`grid-cols-1 sm:grid-cols-2`):
   senza, una riga `truncate` sfonda lo schermo del telefono.
4. **Filtro testo sull'elenco lezioni già in Fase 1** (è una riga di
   codice). Pagefind resta in Fase 2 per il testo degli appunti.
5. **Verifica su telefono vero**, non sull'emulazione del browser: a
   Minerva l'emulazione sotto i 500px ha mentito più volte. Prima di dire
   «fatto» si apre l'URL dal telefono di Daniele.
6. **Niente emoji nell'interfaccia.** I colori per materia sono già
   decisi negli appunti: si usano quelli, non si inventa una palette.

## 5. Identità visiva: c'è già, è quella degli appunti

Gli HTML in `materiale/` hanno un'identità compiuta: Caladea per il testo,
Poppins per i titoli, un colore per materia, i quattro riquadri
(definizione / esame / disegna / ndr) con filetto a sinistra, le tabelle con
l'intestazione maiuscoletta. **Il sito eredita quella**, non Bricolage e il
registro SaaS di Minerva: è un quaderno, non un prodotto. Nessun giro con
Claude Design per ora.

## 6. Correzioni tecniche alla SPEC e al formato

- **`ref` dei quiz e anchor dei titoli.** Il formato dice «slugificato» ma
  non dice come. Fissare: lo slugger di Astro (`github-slugger`), e il
  convertitore/Claude chat generano i `ref` con la stessa funzione. Senza
  questo i link «vai al paragrafo» si rompono in silenzio. Aggiungere un
  controllo in build: ogni `ref` deve esistere nella lezione, altrimenti la
  build fallisce.
- **I riquadri `:::definizione`** in Markdown si rendono con
  `remark-directive`: una dipendenza, nessun parser fatto in casa.
- **Il `box` è per lezione**, e per l'MVP va bene. `wrongIds` è già nello
  stato: tenerlo, è il seme del ripasso per domanda della Fase 2.
- **Versione dello stato** (`studio.state.v1`): giusta. Aggiungere da subito
  `export` come download di un file `.json` con la data nel nome, e
  `import` che chiede conferma prima di sovrascrivere.

## 7. Una promozione dalla Fase 2 alla Fase 1: le flashcard

Il caso d'uso primario della SPEC è «telefono in treno, 10-20 minuti». I
quiz però esistono solo per le lezioni di cui Daniele ha SCRITTO le
domande: per settimane saranno pochi. Le **flashcard dai blocchi
`:::definizione`** esistono invece dal primo giorno per tutte le lezioni
convertite, e costano un'ora perché i blocchi sono già strutturati.

Proposta: Fase 1 punto 8, «Flashcard fronte/retro per materia, generate dai
`:::definizione`, con “la sapevo / non la sapevo”». La modalità esame a
tempo e il formulario restano in Fase 2.

## 8. Il rischio vero, detto una volta

Costruire è più piacevole che studiare, e Daniele lo sa. Il kit lo tiene a
bada col timebox. Aggiungere una misura che non c'entra col codice e che
decide se il progetto funziona: **ogni lezione ha appunti in Markdown e
quiz entro 48 ore dalla lezione.** Se per due settimane di fila la misura
salta, il problema non è una feature mancante e non si risolve con una
feature.

## 9. Abitudine da Minerva: il diario nel CLAUDE.md

In Minerva le decisioni datate stanno in fondo all'AGENTS.md di ogni repo,
ed è ciò che ha salvato il contesto dopo una reinstallazione. Qui lo stesso:
in fondo a CLAUDE.md una sezione «Diario» con le decisioni e la data,
tre righe per volta. Prima voce: queste note.

## 10. Prompt iniziale: tre righe da aggiungere

Dopo «Vincoli che non si discutono»:

> Gli script sono in Node/TypeScript (Python solo se lo decide Daniele). Il repo sta in
> `C:\Studio`, fuori da Minerva. Prima di dire «fatto» l'URL si prova dal
> telefono. Leggi anche docs/NOTE-DI-CODE.md: dove dice cose diverse dalla
> roadmap, vince la nota.
