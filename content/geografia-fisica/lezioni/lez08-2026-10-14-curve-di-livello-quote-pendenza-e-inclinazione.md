---
materia: geografia-fisica
numero: 8
data: 2026-10-14
titolo: "Curve di livello, quote, pendenza e inclinazione"
docente: "Pierluigi Brandolini"
fonte: "Appunti dalla registrazione audio (mattina) e dalle slide «4gfc isoipse e sez top» (slide 2–9)"
nota: "Lezione della mattina. L'audio è buono ma ha una lunga sequenza di numeri in loop dopo il secondo esempio sulla pendenza e un finale confuso: i calcoli si ricostruiscono dalle slide 8 e 9. Il profilo topografico viene solo annunciato. Come per le coordinate, qui ci sono le procedure, valide per qualunque punto. Le note [ndr] sono precisazioni mie."
tag: [isoipse, curve di livello, equidistanza, punti quotati, direttrici, intermedie, interpolazione, pendenza, inclinazione, profilo topografico]
---

## Rappresentare il rilievo

*Dopo le coordinate sul piano, la terza dimensione: la quota.*

L'altimetria si rappresenta con **punti quotati** oppure con **linee che uniscono punti di uguale quota**: le **isoipse**, o **curve di livello**. Quando si rappresentano le profondità di mari e laghi le stesse linee si chiamano **isobate**.

:::definizione
**Punto quotato**: un punto di cui è stata determinata la quota, scritta sulla carta accanto a un puntino. Si trovano in posizioni scelte, non a caso: la cima di un monte, il punto più basso di una zona.

**Isoipse (curve di livello)**: linee che uniscono punti alla **stessa quota**.
:::

## L'equidistanza

:::definizione
**Equidistanza**: la **differenza di quota (Δh)** tra una curva di livello e la successiva. È una distanza **altimetrica**, non planimetrica, ed è **costante** nella stessa carta.
:::

Regola generale: l'equidistanza è circa **un millesimo della scala della carta**. Ci sono eccezioni, quindi il dato giusto si legge sempre in legenda; la tavoletta di Rapallo ha 25 m.

| Scala | Equidistanza |
| --- | --- |
| 1:10.000 | 10 m |
| 1:25.000 | 25 m |
| 1:100.000 | 100 m |

Esempio visto in aula: una carta con curve ogni 10 m. Non c'è la certezza matematica, ma probabilmente era al 10.000.

## Come nascono le isoipse

Il principio è tagliare il rilievo con **piani orizzontali** a quote fisse (400 m, 200 m…): ogni piano incontra il rilievo lungo una linea, e proiettando tutte le linee sul piano della carta si ottengono le curve di livello.

Nella pratica si parte da una serie di **punti quotati** rilevati sul terreno, con posizione e quota precise. Così lavoravano i topografi dell'**IGM** nei decenni dopo l'Unità d'Italia, con squadre di centinaia o migliaia di persone che usavano strumenti topografici classici (la stadia), antenati delle attuali **stazioni totali**. Oggi i punti quotati si ottengono per via aerea con tecniche **aerofotogrammetriche**: migliaia di punti in poco tempo, e una cartografia di una regione intera in pochi mesi, secondo i mezzi disponibili.

### Procedura: tracciare una curva per interpolazione

*Il metodo semplificato che si usa a mano per ricavare le curve dai punti quotati.*

1. Prendi due punti quotati vicini, per esempio **128 m** e **142 m**, e uniscili con un segmento.
2. Misura la **lunghezza L** del segmento sulla carta (nell'esempio 14 mm) e il **dislivello ΔQ** tra i due punti (14 m).
3. Dividi: L / ΔQ = **millimetri per metro di quota** (qui 1 mm per metro).
4. Per trovare dove passa la curva di una certa quota, calcola quanti metri mancano dal punto più basso e portali sul segmento: la curva dei **140 m** sta a 140 − 128 = 12 m, cioè a **12 mm** dal punto 128.
5. Ripeti tra le varie coppie di punti e **unisci i punti trovati**: è una isoipsa.

L'ipotesi è che il rilievo tra i due punti salga in modo costante: è una **approssimazione** ("nella realtà magari non è così").

## Isoline di ogni tipo

Le isoipse sono un caso di **isolina**: il luogo dei punti in cui un certo parametro ha lo **stesso valore**. In geografia fisica e in geologia ne incontrerai tante: le **isoterme** (stessa temperatura, quando si parlerà di atmosfera), le **isobate** (stessa profondità) e altre. Qui servono le isoipse.

## Punti quotati e curve di livello

:::esame{etichetta="L'errore classico"}
Il numero che compare vicino a una curva di livello **non è la quota della curva**: è la quota del **punto quotato** accanto. Una curva vicina al punto 1989 non vale 1989: potrebbe essere la 2000, la 1975, la 2025. La curva di livello ha sempre un valore **multiplo dell'equidistanza** (di solito scritto solo su poche curve): la quota si ricava con il ragionamento qui sotto.
:::

## Direttrici e intermedie

Sulla carta 1:25.000 le curve non hanno lo stesso spessore.

| Tipo | Aspetto | Valore | Differenza |
| --- | --- | --- | --- |
| **Direttrice** | più spessa | sempre **multiplo di 100** | 100 m tra una direttrice e la successiva |
| **Intermedia** | più sottile | **multiplo di 25**, escludendo i multipli di 100 | 25 m dalle curve vicine; tra due direttrici ce ne sono **3** (25, 50, 75) |

Tra due direttrici ci sono quindi **4 intervalli da 25 m**. Su una carta **1:10.000** l'equidistanza è 10 m, quindi tra due direttrici le intermedie sono di più; le direttrici possono essere ogni 50 o ogni 100 m e l'intervallo si legge nella carta. Cambia la scala, il principio resta.

### Procedura: leggere la quota di una curva

1. **Riconosci il tipo**: direttrice (spessa) o intermedia (sottile).
2. Cerca un **punto quotato** vicino alla curva.
3. Stabilisci se la curva sta **sopra o sotto** quel punto: da che parte sale il versante.
4. **Direttrice**: prendi il **primo multiplo di 100** nella direzione giusta. Esempio: vicino alla curva c'è il punto 1989 e il versante sale verso la curva → la curva è la **2000**. Se invece c'è il punto 2219 e la curva sta sotto → è la **2200**.
5. Le altre direttrici si ricavano **aggiungendo o togliendo 100** a ogni curva spessa.
6. **Intermedia**: parti dalla direttrice più vicina e aggiungi o togli **25 m** a ogni curva sottile. Esempio: sotto la 1800 le intermedie valgono **1775**, **1750**, **1725**.
7. **Controlla**: partendo dall'alto e dal basso i conti devono tornare ("la prova del 9").

Esempi fatti in aula: un pallino su una direttrice: dalla 2000 si scende 1900, 1800, 1700, quindi la curva è la **1700**. Un pallino su una curva sottile: riconosciuta la 1800, due intermedie sopra, quindi la curva è la **1850**.

## Il profilo topografico

*Solo annunciato: si farà alla lavagna e sulla carta.*

Dalle curve di livello si costruiscono i **profili** (o **sezioni topografiche**), che ricostruiscono l'andamento del rilievo tra due punti.

:::esame{etichetta="L'esercizio chiave"}
È l'esercizio **clou** della prova: "un buon profilo topografico è già circa metà del lavoro previsto nel test di cartografia". Serve poi per tutto: metodi geologici e geomorfologici, sezioni geologiche con strati e faglie, per esempio una **frana**, il suo corpo accumulato al piede del versante e la superficie di scivolamento (tratteggiata in sezione) da cui ricavare gli spessori.
:::

## Pendenza e inclinazione

*Due modi per descrivere quanto è ripido un versante.*

Si considera un triangolo rettangolo: l'ipotenusa è il **piano inclinato** del versante, il cateto verticale è il dislivello **Δh**, quello orizzontale è la **distanza planimetrica D** letta sulla carta tra i due punti.

:::definizione
**Inclinazione**: l'angolo **α** tra il piano orizzontale e il versante. **α = arctan(Δh / D)**.

**Pendenza**: il rapporto tra dislivello e distanza, in **percentuale**. **pendenza % = (Δh / D) × 100**.
:::

Esempio dalla slide 7: Δh = 5 m, D = 13 m → pendenza = 5/13 × 100 = **38,5%**, inclinazione α = arctan(5/13) = **21°**.

**I range**
- **Pendenza**: da **0%** (piano orizzontale) a **infinito** per una parete verticale, dove D = 0 e qualunque Δh diviso zero è infinito. Non c'è un massimo del 100%: la domanda è un trabocchetto.
- **Inclinazione**: da **0°** a **90°**.
- A **45°** si ha Δh = D e quindi una pendenza del **100%**. I versanti reali stanno tipicamente intorno al 30–50–100%, già molto ripidi.

:::ndr
Il prof ha usato la parola "equilatero" per il triangolo con i cateti uguali. È un triangolo rettangolo **isoscele**, con angoli di 45°, 45° e 90°.
:::

### Procedura: pendenza e inclinazione tra due punti

1. Leggi la **quota di A** e di **B** (procedura sopra) e calcola **Δh = quota maggiore − quota minore**.
2. Misura con il righello la **distanza A–B sulla carta** in cm e convertila: su 1:25.000 **D = cm × 250 m**. Questa è la distanza **planimetrica**.
3. **Pendenza** = (Δh / D) × 100.
4. **Inclinazione** = arctan(Δh / D), sulla calcolatrice con la funzione tan<sup>−1</sup>, impostata in **gradi (DEG)** e non in radianti (RAD): altrimenti il numero è strano e non serve.
5. Arrotonda e scrivi insieme **pendenza (%)** e **inclinazione (°)**.

Esempio 1 (slide 8): quota A 1850 m, quota B 1700 m, Δh = 150 m; D = 320 m, cioè circa 1,3 cm sulla carta. Pendenza = 150/320 × 100 = **47%**, inclinazione = arctan(150/320) = **25°**.

Esempio 2 (slide 9): quota A 1575 m, quota B 1825 m, Δh = 250 m; D = 600 m, cioè **2,4 cm** sulla carta. Pendenza = 250/600 × 100 = **41,6%** (circa 42%), inclinazione = **22,6°** (circa 23°). È un versante meno ripido del primo.

:::ndr
In aula "600 m diviso 250 fa 2,2": fa **2,4 cm**.
:::

## Da fare

- [ ] Rifare la procedura per leggere la quota di una curva su cinque curve della tavoletta di Rapallo, partendo da un punto quotato.
- [ ] Calcolare pendenza e inclinazione tra due punti scelti, con le proprie misure, e controllare che la calcolatrice sia in **DEG**.
- [ ] Imparare i range: pendenza da 0 a infinito, inclinazione da 0° a 90°, 45° = 100%.
- [ ] Ricordare la regola dell'equidistanza (un millesimo della scala) e che il dato giusto è in legenda.
- [ ] Preparare matite, righello, squadretta, carta millimetrata per il profilo topografico.
