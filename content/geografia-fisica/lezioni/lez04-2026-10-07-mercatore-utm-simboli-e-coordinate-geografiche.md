---
materia: geografia-fisica
numero: 4
data: 2026-10-07
titolo: "Mercatore, UTM, simboli e coordinate geografiche"
docente: "Pierluigi Brandolini"
fonte: "Appunti dalla registrazione audio (pomeriggio, 14–16, B1.01, in otto spezzoni) e dalle slide «2gfc scala proiez simb» e «3gfc coordinate geogr e UTM»"
nota: "Continua la lezione della mattina (lez03). La registrazione si è interrotta più volte. Le note [ndr] sono precisazioni mie; la sezione su «Correct the Map» è un approfondimento che ho chiesto io."
tag: [Mercatore, UTM, Gauss-Boaga, fusi, Equal Earth, simbolismo cartografico, segni convenzionali, coordinate geografiche, latitudine, longitudine, Monte Mario]
---
## Dalla cilindrica a Mercatore

Si immagina una lampadina al centro del globo che proietta meridiani e paralleli sulla superficie interna di un cilindro, poi si srotola il cilindro. Nella **cilindrica diretta** l'asse del cilindro coincide con l'asse Nord–Sud e il cilindro è tangente all'**equatore**: i meridiani diventano linee verticali equidistanti, i paralleli linee orizzontali.

:::esame{etichetta="Domandina del prof"}
Perché si chiama **diretta**? Perché il cilindro ha l'asse coincidente con l'asse di rotazione terrestre ed è tangente all'equatore.
:::

Il problema delle cilindriche geometriche si vede dai cerchietti disegnati sul globo: vicino all'equatore (entro ±15°) restano cerchi, ma andando verso le alte latitudini si allungano in senso Nord–Sud e si ingrandiscono. I territori sono deformati oltre che dilatati.

**Mercatore** modifica la cilindrica riducendo la distanza tra un parallelo e l'altro: i cerchietti restano cerchi anche alle alte latitudini. La carta diventa **isogonica** (conforme): mantiene gli angoli e le forme. Non è equivalente né equidistante: a 30°, 45° di latitudine il cerchio è ancora un cerchio, ma più grande, le aree si espandono. Per questo si usa in campo **nautico**: la rotta tra due punti (dall'Irlanda alla Florida) è una retta, la **lossodromia**, che mantiene un angolo costante rispetto al Nord.

Le carte **convenzionali** degli atlanti (Mollweide, sinusoidale, Hammer, l'omolosina di Goode "a ritagli") rappresentano i continenti più vicini alle loro dimensioni reali, deformando ai bordi. Per le zone polari, oltre gli 80° di latitudine, si usano le proiezioni **centrografiche polari**: un piano tangente al polo, lampadina al centro, paralleli come cerchi concentrici e meridiani come raggi.

## Mercatore oggi: la risoluzione ONU «Correct the Map»

*Argomento in più, chiesto da me a lezione. Il prof non la conosceva e l'ha liquidata come una trovata politica; in realtà è un caso da manuale di quello che abbiamo visto oggi, isogonia contro equivalenza.*

Il 4 settembre 2026 l'Assemblea generale delle Nazioni Unite ha approvato, con 164 voti a favore, un solo contrario e sei astenuti, la risoluzione **«Correct the Map»**, presentata dal Togo a nome degli Stati africani e sostenuta dall'Unione Africana, che aveva già adottato la nuova mappa. La risoluzione **non è vincolante** e **non vieta Mercatore**: raccomanda a governi, scuole e istituzioni di usare proiezioni **equivalenti** quando si confrontano le superfici, in particolare la **Equal Earth** (2018, Tom Patterson, Bojan Šavrič e Bernhard Jenny). La Francia ha annunciato che passerà alla Eckert IV, una proiezione equivalente analoga del 1906.

Il motivo è quello della lezione: Mercatore è **conforme**, conserva angoli e forme, ma dilata le aree verso le alte latitudini. Sulle mappe scolastiche l'Africa (30 milioni di km²) sembra grande come la Groenlandia (2 milioni), e l'Europa e il Nord America appaiono molto più grandi del vero. Una proiezione equivalente restituisce i rapporti di superficie, a costo di deformare le forme ai bordi.

:::nota
Da ricordare per l'orale: nessuna proiezione è giusta in assoluto. Mercatore resta la scelta corretta per la navigazione (la rotta è una retta) e per le carte topografiche a grande scala nella versione trasversa (UTM); per confrontare le dimensioni dei continenti serve una equivalente. Si sceglie la proiezione in base allo scopo.
:::

## UTM e Gauss-Boaga

*La proiezione delle carte topografiche italiane. "Argomento tosto", più da orale che da scritto: all'esame chiede qual è la proiezione di riferimento delle carte che usate e come è costruita.*

:::definizione
**Proiezione cilindrica trasversa di Mercatore (Gauss)**, sigla **UTM** (Universal Transverse Mercator; si legge in alto a destra sul foglio 2 della tavoletta). Il cilindro è **ruotato di 90°**: non è più tangente all'equatore ma lungo un **meridiano** (e il suo antimeridiano), passando per i due poli. Ha senso perché la cilindrica rappresenta bene la fascia vicina alla tangenza: ruotandola si rappresenta bene una fascia di territorio allungata in senso Nord–Sud, come l'Italia, dalla Sicilia all'Alto Adige.
:::

La proiezione dà errori trascurabili di isogonia, equidistanza ed equivalenza solo in una fascia di **3° a est e 3° a ovest** del meridiano di tangenza, cioè **6° in totale**: un **fuso**. Fuori si deforma. Quindi non basta un cilindro per tutto il globo: servono tanti cilindri che ruotano, un fuso dopo l'altro.

:::disegna
Il cilindro trasverso tangente a un meridiano, e sulla carta srotolata il meridiano centrale con due linee a 3° a destra e a sinistra. Scriverci "3°" su entrambi i lati. È il disegnino che il prof ha chiesto di fare.
:::

**Perché l'Italia ha due fusi.** L'Italia si estende in longitudine per circa 12°, dalla Liguria alla Puglia: più di un fuso. L'IGM ha scelto due meridiani di tangenza, a **9°** e a **15°** di longitudine **est** di Greenwich, e ha applicato la proiezione due volte: il **fuso Ovest** e il **fuso Est**, un po' estesi oltre i 3° per avere una zona di sovrapposizione (30′ di longitudine, circa 40 km).

:::ndr
Nel transcript si sente "9° ovest rispetto a Greenwich": è **est**. L'Italia sta a est di Greenwich, come il prof stesso dice poco dopo.
:::

**La modifica di Boaga.** Per ridurre ulteriormente le deformazioni sul territorio italiano, Boaga ha adottato un cilindro trasverso non tangente ma leggermente **secante**, di diametro un po' più piccolo di quello della Terra. Ne derivano le **coordinate chilometriche Gauss-Boaga**, quelle che la Regione Liguria adotta ufficialmente e che vengono richieste per consegnare lavori. Nel sistema Gauss-Boaga le ascisse del fuso Ovest iniziano con 1 (valore convenzionale 1.500 km sul meridiano 9°) e quelle del fuso Est con 2 (2.520 km sul meridiano 15°); nelle carte con reticolato UTM al posto di questi valori c'è 500. Ci si torna con le coordinate chilometriche.

## Il simbolismo cartografico

*Terza caratteristica delle carte: sono rappresentazioni simboliche, basate su segni convenzionali. Non si imparano a memoria: si capisce il significato e si va a vedere la legenda. Guardare la legenda della tavoletta.*

- **Elementi antropici**: viabilità (strade di vario tipo, ferrovie, sentieri e mulattiere), edifici, chiese, campanili, cimiteri. I **sentieri e le mulattiere** sono le linee tratteggiate nere: vanno riconosciuti perché permettono percorsi fuori dalla viabilità ordinaria, "e in bosco o macchia ci si perde".
- **Limiti amministrativi**: linee puntinate per confini di Stato, di regione, un tempo di provincia, e tra comuni. Spesso coincidono con limiti fisici, **crinali spartiacque** o **corsi d'acqua**. Con un corso d'acqua il confine può spostarsi: l'alveo si muove nel tempo, in 50 o 100 anni, per erosione delle sponde (Geomorfologia), e un comune può perdere ettari. Per noi i puntini sono utili perché all'inizio aiutano a riconoscere crinali e corsi d'acqua. E hanno peso pratico: due perforazioni a cavallo di un confine comunale sono due pratiche con due comuni diversi.
- **Uso e copertura del suolo**: i **pallini vuoti** sparsi indicano copertura vegetale; un simbolo dentro i pallini dice il tipo: faggio, castagno, abete per i boschi; vigneto, oliveto per l'agricolo. Niente pallini: zona nuda, denudata. Vedere oliveti su tutto un versante dice che era terrazzato e coltivato.
- **Idrografia**: linee puntinate, tratteggiate o continue sono porzioni del reticolo idrografico, corsi d'acqua più o meno grandi.

:::esame{etichetta="Errore classico"}
Confondere una **valle** con un **crinale**: le curve di livello si somigliano. Se c'è un corso d'acqua, lì c'è una valle, in geomorfologia un **impluvio**; dall'altra parte, tra due valli, c'è un crinale, o **displuvio**. Il simbolo del corso d'acqua è la prima cosa da cercare.
:::

### Leggere una carta come una foto dall'aereo

Esempio sullo stralcio di tavoletta IGM della slide, **Capo Nero**, tra Ospedaletti e Sanremo nella Liguria di Ponente: un promontorio, versanti che degradano verso est e verso ovest, un crinale che dalla cima scende al mare, quote da 0 ai punti quotati 184 e 234. Tante curve di livello vuol dire territorio rilevato; curve **fitte** significano versanti ripidi, curve **rade** versanti dolci. Rete stradale fitta lungo la costa e strade a tornanti sui versanti ripidi, oliveti su versanti terrazzati, confini comunali che passano da sud a nord e non sul crinale.

:::nota
Sul terreno con la carta in mano si fa il **punto**: si cercano elementi riconoscibili intorno (una cima, un campanile, un incrocio, una chiesa) e dalla loro posizione ci si colloca sulla carta. Per questo bisogna riconoscere i simboli e le forme: è la prima operazione di ogni rilevamento.
:::

## Le coordinate geografiche

:::definizione
**Meridiani**: intersezione tra la superficie terrestre e i piani passanti per l'asse di rotazione; comunemente le semicirconferenze da un polo all'altro. **Paralleli**: intersezione con i piani perpendicolari all'asse; il cerchio massimo è l'**equatore**, verso i poli i paralleli si riducono fino a un punto. L'incrocio di meridiani e paralleli è il **reticolato geografico**.

**Latitudine**: distanza angolare del punto dall'equatore, misurata in gradi sull'arco di **meridiano** passante per il punto. Da 0° a **90° Nord o Sud**. L'arco di 1° di latitudine è quasi costante, da 110,575 km all'equatore a 111,699 km ai poli (media 111,121 km) per lo schiacciamento; la sua sessantesima parte, 1′ di latitudine, è il **miglio marino** (1852 m).

**Longitudine**: distanza angolare dal **meridiano fondamentale** di Greenwich (a circa 32 km dal centro di Londra, sul Tamigi), misurata in gradi sull'arco di **parallelo** passante per il punto. Da 0° a **180° Est o Ovest**. L'arco di 1° di longitudine è variabile perché i meridiani convergono: 111 km all'equatore, 0 ai poli.

**Altitudine**: altezza del punto sul livello del mare.
:::

Sono coordinate **sferiche**: angoli al centro della Terra. La latitudine è l'angolo tra il piano dell'equatore e il raggio che passa per il punto; la longitudine è l'angolo, sul piano dell'equatore, tra il meridiano fondamentale e il meridiano del punto.

Sulla tavoletta le tracce dei **meridiani** sono i margini verticali del foglio, quelle dei **paralleli** i margini orizzontali. Quindi: la latitudine si legge sui margini laterali (lungo il meridiano), la longitudine sui margini in alto e in basso (lungo il parallelo). Ogni tacca bianca o nera sul bordo è l'ampiezza di **un primo**: un grado è diviso in 60 primi, un primo in 60 secondi (sistema sessagesimale).

:::esame{etichetta="L'inghippo delle carte IGM"}
La longitudine sulle carte IGM non è riferita a Greenwich ma al meridiano fondamentale italiano, quello di **Roma Monte Mario**. La Liguria sta a ovest di Roma, quindi la longitudine è **ovest da Monte Mario** e cresce da est verso ovest, al contrario di quella da Greenwich. In alto a destra sulla carta c'è scritto che Monte Mario sta a **12°27′08″** circa a est di Greenwich: con quel valore si converte quando serve, e sarà un esercizio.
:::

### Esercizio: la longitudine del punto P

Sul **foglio 1**: trovare il Monte Pegge, poi il punto quotato **402**; sotto a sinistra, nell'intersezione tra la **curva di livello e il sentiero tratteggiato**, sta il punto P. Segnarlo a matita. Chilometricamente è tra 15 e 16 Nord e tra 19 e 20 Est. Si traccia dal punto una verticale fino al margine superiore, parallela alla traccia di meridiano (squadretta appoggiata sul bordo).

1. **Dimenticare i numeri piccoli** in alto a sinistra: sono le coordinate chilometriche, con la longitudine non c'entrano. I valori che servono sono quelli in gradi e primi: il margine parte da **3°15′** e, andando verso ovest, 14′, 13′, 12′… (scriverli sulla carta).
2. P cade tra 12′ e 13′: si prende sempre il **valore inferiore**, **3°12′**, e si aggiungono i secondi. Come con l'ora: si dice 12 e 32, non 13 meno 28.
3. I secondi con una proporzione. Un primo sul bordo misura **5,2 cm** (va misurato, tutti devono trovare 5,2). Il tratto da 12′ alla verticale di P misura, a seconda di chi misurava, 2,6–3 cm; in aula si è preso **2,8 cm**, che è anche la mia misura. Allora 5,2 : 60″ = 2,8 : x, da cui x = 60 × 2,8 / 5,2 = **32″** circa.
4. Risultato: **P = 3°12′32″ Ovest di Monte Mario**. Chi ha misurato 2,6 cm ottiene 30″: va bene, ognuno usa la propria misura e deve essere coerente con il proprio tracciato. La mia: 2,8 cm → 32″ → **3°12′32″ W**.

Il calcolo della **latitudine** si fa alla prossima lezione, con lo stesso metodo lungo il margine laterale.

## Da fare

- [ ] Prossima lezione: **giovedì 8 ottobre, 14–16, in CT.09** (con l'allerta gialla le aule interrate sono interdette). Si calcola la latitudine di P.
- [ ] Segnare il punto P sul foglio 1 e scrivere a matita i primi di longitudine sul margine superiore.
- [ ] Rifare l'esercizio della longitudine con la propria misura e il proprio conto.
- [ ] Fare il disegnino del cilindro trasverso con i 3° da ogni lato.
- [ ] Saper rispondere: qual è la proiezione delle carte topografiche italiane, perché due fusi, cos'ha cambiato Boaga.
