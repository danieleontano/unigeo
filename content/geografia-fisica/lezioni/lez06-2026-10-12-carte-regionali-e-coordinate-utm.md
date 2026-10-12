---
materia: geografia-fisica
numero: 6
data: 2026-10-12
titolo: "Carte regionali, UTM e coordinate chilometriche"
docente: "Pierluigi Brandolini"
fonte: "Appunti dalla registrazione audio (mattina) e dalle slide «3gfc coordinate geogr e UTM», controllati sulle slide 10–11 e 20–24. Lezione non seguita di persona"
nota: "Lezione della mattina. Finisce a metà esercizio («oggi pomeriggio proseguiamo»): la longitudine del punto A e le coordinate di B sono nella lezione del pomeriggio (lez07). L'audio ha qualche loop (righe di numeri e ripetizioni) che non nasconde spiegazioni. Le note [ndr] sono precisazioni mie."
tag: [UTM, proiezione cilindrica trasversa, fuso, Gauss-Boaga, carta regionale, IGM, coordinate chilometriche, coordinate geografiche, Monte Mario, Greenwich, scala]
---

## Carte regionali e carte IGM

*La tavoletta di Rapallo è una carta IGM. La Regione Liguria produce carte tecniche regionali (CTR), e il prof ne porterà una fotocopia.*

Sono carte **più recenti**: cambia la configurazione del territorio (nelle IGM, "rilevate un secolo fa", si vedono paesaggio e topografia di allora, utili per studiare l'evoluzione morfologica) e cambia soprattutto il **riferimento delle coordinate**. L'anno di rilevamento si legge nell'angolo in basso a sinistra del foglio.

Le **curve di livello**, o **isoipse**, sono le linee curve che si vedono sul foglio; quelle più spesse sono le curve su cui verranno piazzati i punti dell'esame. Le quote le vedremo tra poco.

## La proiezione di riferimento

:::esame{etichetta="Domandina d'esame"}
**Qual è la proiezione di riferimento delle carte regionali e delle carte IGM?** La **proiezione cilindrica trasversa di Mercatore**, **UTM** (Universal Transverse Mercator), ideata da **Gauss**. Il prof ha ripetuto che questa domanda all'esame arriva: basta il disegnino del cilindro.
:::

- Un **cilindro** in cui si inserisce la Terra. Se l'asse è verticale la proiezione è diretta; qui il cilindro è **ruotato di 90°**, quindi è **trasverso** e risulta **tangente a un meridiano** (e al suo antimeridiano).
- Il cilindro può essere **tangente**, oppure, con un diametro un po' più piccolo, **secante**: è la modifica di Boaga.
- La proiezione è valida in una fascia di **3° a est e 3° a ovest** del meridiano di tangenza, **6° in totale**.
- L'Italia si estende per circa **12°** di longitudine, da circa 6° a 18° Est (e da circa 36° a 46° Nord). Servono quindi **due meridiani di tangenza**, **9°** e **15°**, e si applicano **due cilindri trasversi**: il **fuso Ovest** e il **fuso Est**.

:::disegna
Il disegnino che il prof chiede di saper fare: il cilindro trasverso attorno alla Terra, tangente a un meridiano, e la cartina dell'Italia con i due meridiani a 9° e 15° e le fasce di 3° + 3° per lato.
:::

### Il valore 500 km

Nelle coordinate UTM al **meridiano centrale** del fuso è assegnato il valore di **500 km**, non zero: se fosse zero, tutto ciò che sta a ovest del meridiano avrebbe coordinate **negative**.

:::ndr
In aula "al meridiano 9 il valore di 500 km, mentre al meridiano 15 il valore di 1500". In **UTM** entrambi i meridiani centrali hanno **500 km**. I valori diversi sono quelli della **Gauss-Boaga**: **1500 km** a 9° (fuso Ovest) e **2520 km** a 15° (fuso Est).
:::

Esempio: la Liguria sta attorno al meridiano 9°. Rapallo è un po' a est, quindi con valori sopra i 500 km (517, 526…). Verso Genova e oltre, verso ponente, i valori scendono sotto i 500: alla fine della Liguria occidentale sarebbero intorno ai 430. Non serve ricordare il numero: serve capire cosa significa quel 5 davanti.

La posizione di Monte Mario rispetto a Greenwich è scritta sulla carta, **in alto a destra**: per convertire una longitudine IGM in una da Greenwich serve quel valore.

## Le coordinate geografiche nelle due carte

| | **Carta IGM** | **Carta regionale** |
| --- | --- | --- |
| Meridiano di riferimento | **Roma Monte Mario** | **Greenwich** |
| Come cresce la longitudine | da **est verso ovest** | da **ovest verso est** |
| Latitudine | dall'equatore | dall'equatore |

La longitudine della CTR cresce da ovest verso est perché ci si allontana dal meridiano di Greenwich, che passa per Londra: si vede dai valori sul bordo. La latitudine è sempre riferita all'equatore.

## Le coordinate chilometriche nelle due carte

Anche la CTR ha un **reticolato chilometrico**: le linee sono le stesse, ogni chilometro, e i chilometri sono gli stessi. Cambia come si scrivono i numeri.

| | **Carta IGM** | **Carta regionale** |
| --- | --- | --- |
| Come si scrive | si usa la stringa **32T NQ** (zona, quadrato di 100 km) e poi solo le cifre brevi: **32T NQ 21 …** | **niente zona e niente quadrato**: si legge la distanza complessiva |
| Est | numeri di 2 cifre sul reticolato | distanza dal meridiano di tangenza, con il **500 davanti**: **517, 526…** km |
| Nord | numeri di 2 cifre | distanza dall'**equatore**: per esempio **4.908.000 m** = **4908 km** |

Sulla carta regionale i numeri sul bordo sono scritti per esteso agli angoli (517.000, 526.000, 4.908.000…) e abbreviati lungo il reticolato (17, 26, 18…): il 5 davanti al 17 e al 26 dice che siamo a 17 e 26 km dal meridiano che vale 500 km. "Dovete sapere il **significato** di questi numeri": sarà utile quando in una cava di Lavagna o di Ardesia in Val Fontanabuona vi diranno "coordinate UTM 5 2x xxx, 4 9xx xxx".

:::ndr
Il titolo della slide 21 è «Coordinate Gauss-Boaga», ma i numeri che il prof legge sulla carta regionale (517, 526, 4.908.000) sono quelli **UTM**. La legenda del foglio dice che sulla carta ci sono **due reticolati**, uno Gauss-Boaga (fuso Ovest, valori che iniziano con 1: 1.5xx.xxx) e uno UTM, e che le coordinate geografiche dei vertici sono riferite a ED 1950. A lezione si è lavorato sul reticolato UTM.
:::

## Esercizio: scrivere le coordinate di P in due modi

Il punto P dell'esercizio chilometrico (quello vicino a Fontanelle, già svolto: 2,6 cm dalla linea 21 e 3,0 cm dalla linea 14) si scrive in due modi.

:::definizione
**Carta IGM**: 32T NQ **21 65 14 75**, cioè **2165 1475**: otto cifre, perché si arriva fino al **decametro** (la convenzione IGM è la precisione di 10 m). Per ottenere i metri si aggiunge uno zero, ma potrebbe essere anche un 5: la misura non va oltre il decametro.

**Carta regionale**: **Est 521650**, **Nord 4914750**. All'Est si aggiunge il **5** davanti (il 500) e uno zero in coda per i metri, **sei cifre**; al Nord si mettono davanti le cifre dell'equatore, 49, e uno zero in coda: 4914 km, più 750 m.
:::

I numeri sono gli stessi: cambia solo la **modalità di restituzione**. Oggi si usa il vecchio sistema IGM perché la carta è quella, ma nei prossimi anni "99 volte su 100" si lavorerà con le coordinate moderne, e può capitare di ricevere coordinate nell'altra convenzione e doverle convertire.

:::nota
Nel deck "P" indica **due punti diversi**. Il P degli esercizi geografici (slide 10–11, vicino a Monte Pegge) è a 03°12′34″ O di Monte Mario e 44°23′16″ N, che in UTM ED50 sono circa **519,4 km Est e 4.915,2 km Nord**: sulla carta sta vicino alla linea 19 e appena sopra la 15. Il P delle coordinate chilometriche (slide 20, Fontanelle) è un altro punto, a **521,65 km Est e 4.914,75 km Nord**. Conviene chiamarli P1 e P2 sugli appunti.
:::

## Esercizio inverso: dal numero al punto

Dalle coordinate al punto sulla carta, con la stringa **32T NQ 18 13 13 87**, che si legge **32T NQ 1813 1387**.

:::esame{etichetta="L'ordine"}
Nella stringa va **prima la coordinata Est, poi la Nord**: sembrano invertite rispetto a "nord, est", ma è sempre così.
:::

1. Il punto sta tra le linee **18 e 19** (Est) e **13 e 14** (Nord). Si lavora direttamente dentro il quadrato chilometrico.
2. **Est 18 13**: dopo il 18 vengono 13 decametri, cioè **130 m** a est della linea 18.
3. **Nord 13 87**: dopo il 13 vengono 87 decametri, cioè **870 m** a nord della linea 13.
4. Si converte in lunghezze sulla carta: su una carta 1:25.000 **1 mm = 25 m** e **1 cm = 250 m**.
   - 130 / 25 = **5,2 mm** dalla linea 18;
   - 870 / 25 = 34,8 mm, cioè **circa 3,5 cm** dalla linea 13.
5. Si segna il punto all'incrocio e ci si ferma: una precisione di un millimetro, 25 m, è accettabile ("mezzo punto più, mezzo punto meno").

## I punti A e B

Zona alle spalle di Zoagli (Monte di Zoagli), sulla stessa tavoletta. **A** sta su una curva di livello spessa; **B** sta più a valle, su un'altra curva spessa poco sopra il torrente. I punti servono per consolidare la lettura delle coordinate geografiche e chilometriche, e daranno poi la **quota**, quando si parlerà delle curve di livello.

:::esame{etichetta="All'esame"}
Domanda da **4 punti**: **2 punti** per le coordinate geografiche del punto A e **2 punti** per le coordinate UTM del punto B. I punti verranno piazzati su curve di livello. Il prof ha fatto capire che una coordinata sbagliata resta sbagliata anche se il procedimento è giusto (passaggio poco chiaro nell'audio).
:::

**Latitudine di A.** Si misura dalla linea dei **21 primi** al punto: **1,8 cm**. Con il primo di latitudine di **7,3 cm**: 60″ : 7,3 cm = x : 1,8 cm, quindi x = 60 × 1,8 / 7,3 = 14,8″, che si arrotonda a **15″**. Il prof ha detto "14 e mezzo" e poi ha accettato 15 come approssimazione, non come errore.

**Latitudine di A = 44°21′15″ Nord.** La longitudine di A e le coordinate UTM di B sono nella lezione del pomeriggio.

## Da fare

- [ ] Rifare l'esercizio inverso: trovare sulla carta il punto 32T NQ 1813 1387 e controllare 5,2 mm e 3,5 cm.
- [ ] Scrivere le coordinate di P (Fontanelle) nei due modi, IGM e regionale, e ricontrollare che le cifre siano quelle.
- [ ] Rifare il disegnino del cilindro trasverso e dei due meridiani 9° e 15°.
- [ ] Imparare perché al meridiano centrale si assegna 500 km e non zero.
- [ ] Segnare i punti A e B a matita sulla carta; calcolare la longitudine di A e le coordinate di B con le proprie misure.
