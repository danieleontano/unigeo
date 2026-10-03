# UniGeo — identità visiva

Brief per chi disegna e per chi costruisce. Contiene cosa deve sembrare il
sito, perché, e i vincoli. Deciso con Daniele il 03/10/2026: base **chiara,
carta e sabbia**; prototipo prima su home e Libro, poi si estende.

---

## 1. Cos'è

Il quaderno di studio di uno studente del primo anno di Scienze Geologiche:
appunti di ogni lezione, quiz, flashcard, ripasso spaziato. Una persona sola,
soprattutto dal telefono (treno, aula), PC a casa. Non è un prodotto: è il suo
taccuino da campo, e deve dare voglia di aprirlo.

## 2. Il sentimento

**Un trattato di geologia dell'Ottocento riletto oggi.** Carta spessa, inchiostro
caldo, tavole litografiche di strati e fossili; ma impaginato come un prodotto
moderno: aria, gerarchia netta, movimento sobrio. Adulto, concreto, con un po'
di meraviglia. Mai «app scolastica», mai icone da cartone animato, mai pietre
disegnate come emoji.

Da evitare: il bianco piatto da documentazione tecnica (com'è adesso), i
gradienti viola-blu da SaaS, le card tutte uguali con ombre grigie, i badge
colorati ovunque.

## 3. La metafora: la colonna stratigrafica

La geologia regala una metafora vera, da usare nella struttura e non solo come
decorazione:

- **Le lezioni sono strati.** Si depositano nel tempo; la più recente sta in
  cima. L'elenco delle lezioni di una materia è una **colonna stratigrafica**:
  ogni strato ha spessore proporzionale alla lunghezza della lezione, il colore
  della materia con una texture leggera (puntinato, lineato, a scaglie, come le
  campiture delle carte geologiche), e il numero della lezione come etichetta
  laterale. Si legge dall'alto: oggi è in superficie, settembre è in profondità.
- **Il ripasso è litificazione.** Scatola 1 = sedimento sciolto (puntini radi),
  scatola 5 = roccia compatta (campitura piena). La barra di avanzamento di un
  quiz o di una materia si «riempie» come un livello che si deposita.
- **Le flashcard sono i campioni** della cassettiera del museo: cartellino con
  il termine, girando si legge la scheda. La cassettiera è l'elenco dei campioni.
- **Il quiz è il riconoscimento del campione**, come la prova pratica
  dell'esame: una domanda alla volta, il campione al centro, le opzioni intorno.
- **La home è il taccuino da campo**: la data in alto come su un taccuino, «da
  ripassare oggi» come la lista delle cose da fare in uscita, gli ultimi strati
  depositati.
- **Il Libro di ogni materia** è il trattato: le lezioni in fila come capitoli,
  numerazione romana dei capitoli, capolettera, indice a margine che segue la
  lettura, tavole (gli SVG) con didascalia numerata come «Tav. 3».

## 4. Colori: rocce, non pastelli

Base chiara da carta e sabbia; il colore pieno è della materia e si usa con
misura (filetti, etichette, un'azione principale), mai come sfondo di card.

| Ruolo | Nome | Valore |
| --- | --- | --- |
| Carta (sfondo) | carta | `#F6F1E7` |
| Carta scura (sezioni, piede) | sabbia | `#EADFCB` |
| Inchiostro (testo) | inchiostro | `#1F2326` |
| Inchiostro attenuato | grafite | `#5E6568` |
| Filetti | filetto | `#D6CBB6` |
| Accento caldo unico (azioni, «oggi») | lava | `#C2491D` |
| Accento secondario | ocra | `#C9A227` |
| Geologia 1 | terracotta | `#B5552A` |
| Paleontologia | serpentino | `#1F6F78` |
| Geografia fisica | muschio | `#3F6E3A` |
| Chimica | ametista | `#6A4C93` |
| Matematica | ardesia | `#3E4A52` |
| Giusto / sbagliato | muschio / lava | `#3F6E3A` / `#C2491D` |

Modo lettura: «carta» (questa), «seppia» (`#F1E6D0` con inchiostro `#3B2F22`),
«notte» (`#15181A` con testo `#E8E1D3`): il notturno esiste SOLO nel Libro.

## 5. Caratteri

- **Display**: Fraunces (variabile, assi ottico e «soft»): titoli, numeri dei
  capitoli, cifre grandi. Ha il peso dei frontespizi d'epoca senza essere un
  pastiche.
- **Testo**: Caladea, già usato negli appunti: resta.
- **Etichette e dati**: Poppins medio, maiuscoletto spaziato per le etichette
  dei riquadri, tabular-nums per date e numeri.
- Tutto self-hosted (`@fontsource`), niente Google Fonts.

## 6. Movimento

Sobrio e fisico, mai gratuito. Durate 200–400 ms, curve `ease-out`.

- Gli strati della colonna entrano uno dopo l'altro dal basso (deposizione).
- La barra di avanzamento si riempie come un livello.
- La flashcard si gira in 3D (rotateY), il cartellino resta leggibile.
- Nel Libro, l'indice a margine evidenzia il capitolo corrente mentre si scorre;
  il titolo del capitolo si «solidifica» nella barra in alto quando esce dallo
  schermo.
- Rispettare `prefers-reduced-motion`: tutto si riduce a dissolvenze.

## 7. Componenti e pagine

- **Barra in alto**: una riga sottile, logotipo «UniGeo» in Fraunces, tre voci.
  Sotto la barra una **striscia di strati** di 6 px (le cinque materie, in
  proporzione alle lezioni fatte): è il marchio e insieme un dato.
- **Home / taccuino**: data in alto in Fraunces; «Da ripassare oggi» come lista
  a righe con l'azione «Inizia» in lava; «Ultimi strati» come mini colonna
  orizzontale.
- **Materie**: cinque colonne stratigrafiche affiancate (una per materia), alte
  quanto le lezioni fatte; sotto ogni colonna nome, docenti, numeri.
- **Materia**: la colonna stratigrafica verticale a sinistra (su telefono in
  alto, orizzontale), accanto l'elenco a righe; bottoni «Apri il Libro» e
  «Campioni» (flashcard).
- **Libro**: colonna di testo 68–72 caratteri, indice a margine su desktop e a
  scomparsa su telefono, barra di avanzamento sottile in alto, pulsante
  «Aa» per il modo lettura (dimensione, larghezza, carta/seppia/notte),
  posizione ricordata, frecce tra capitoli.
- **Riquadri**: come ora (filetto a sinistra, etichetta maiuscoletta), con il
  filetto che diventa una **campitura geologica** sottile: definizione =
  lineato, esame = pieno in lava, disegna = tratteggio, nota = puntinato.
- **Campioni**: cartellino con bordo inchiostro e angolo tagliato, come i
  cartellini da museo; retro con la scheda.
- **Quiz**: il campione (domanda) su un cartellino grande, opzioni sotto come
  righe; esito con la stessa campitura giusto/sbagliato.

## 8. Vincoli

- Tutto in italiano. Testi asciutti: etichette, non frasi.
- Mobile first: 390 px è la larghezza di riferimento; niente scorrimento
  orizzontale; righe strette negli elenchi (≈ 36 px).
- Niente immagini raster: tutto SVG e CSS (texture comprese), così resta
  leggero e offline.
- Si giudica sul telefono vero, non sull'emulazione.
