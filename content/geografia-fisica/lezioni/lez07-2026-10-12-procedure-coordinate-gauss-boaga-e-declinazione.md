---
materia: geografia-fisica
numero: 7
data: 2026-10-12
titolo: "Procedure per le coordinate, Gauss-Boaga e declinazione magnetica"
docente: "Pierluigi Brandolini"
fonte: "Appunti dalla registrazione audio (pomeriggio) e dalle slide «3gfc coordinate geogr e UTM» (slide 10–11, 16, 20–24, 26–32)"
nota: "Lezione del pomeriggio, continua la lez06 della mattina. L'audio parte a metà esercizio (il Nord di B in formato regionale): i risultati numerici dell'esercizio non sono nel file di proposito, qui c'è la procedura, valida per qualunque punto. Due loop brevi non nascondono spiegazioni. Le note [ndr] sono precisazioni mie."
tag: [procedura, coordinate geografiche, coordinate UTM, formato IGM, formato regionale, Gauss-Boaga, coordinate polari, declinazione magnetica, quadro d'unione IGM, QGIS]
---

## Procedura: le coordinate geografiche di un punto

*Quello che si è fatto con il punto A. Vale per qualunque punto della tavoletta.*

1. **Segna il punto a matita**, mai a penna: se sbagli, lo rifai.
2. **Latitudine** (si legge sui **margini laterali**, sulle tracce di meridiano):
   1. con la squadretta traccia dal punto una **orizzontale** fino al margine laterale;
   2. leggi sul margine gradi e primi della tacca **appena sotto** la linea: sempre il **valore inferiore**;
   3. misura con il righello la lunghezza **L** di un primo sul bordo (tra due tacche; a Rapallo circa 7,3 cm) e la distanza **d** dalla tacca inferiore al punto;
   4. proporzione **60″ : L = x : d**, quindi **x = 60 · d / L**; arrotonda al secondo;
   5. scrivi gradi° primi′ secondi″ **Nord**.
3. **Longitudine** (si legge sui **margini superiore e inferiore**, sulle tracce di parallelo):
   1. traccia dal punto una **verticale** fino al margine alto;
   2. **ignora i numeri piccoli** in alto e in basso: sono le coordinate chilometriche, con la longitudine non c'entrano; leggi gradi e primi della tacca inferiore;
   3. misura **L** (un primo di longitudine, a Rapallo circa 5,2 cm) e **d** dalla tacca inferiore al punto;
   4. stessa proporzione, **x = 60 · d / L**;
   5. scrivi gradi° primi′ secondi″ con il riferimento corretto: **ovest di Monte Mario** sulla carta IGM, **est di Greenwich** su quella regionale.

:::definizione
**Perché sempre il valore inferiore**: la coordinata si scrive come un orario, valore intero più frazione ("12 e 32"), non "13 meno 28". Prendere quello superiore costringe a sottrarre e a sbagliare.
:::

:::esame{etichetta="Occhio al verso"}
Sulla carta IGM la longitudine **cresce da est verso ovest**, quindi la tacca "inferiore" sta **a destra** del punto, e si misura da lì verso sinistra. Sulla carta regionale (Greenwich) cresce verso est e la tacca inferiore sta **a sinistra**. Si parte sempre dalla tacca col valore più basso.
:::

Esempio per la latitudine: d = 1,8 cm su un primo di L = 7,3 cm → 60 × 1,8 / 7,3 = 14,8″ ≈ **15″**. Un millimetro di errore sul tracciato vale circa **1″**: ognuno usa la propria misura e deve essere coerente con il proprio tracciato.

## Procedura: le coordinate UTM di un punto

*Le coordinate UTM sono le coordinate **chilometriche**, Est e Nord in metri sul reticolato. È la domanda da 2 punti sul punto B.*

1. **Individua la maglia** da 1 km in cui cade il punto: le linee **Est** sono verticali (numeri sul bordo, in basso e in alto), le linee **Nord** orizzontali (numeri sui lati). Prendi la linea Est **a sinistra** del punto e la linea Nord **sotto** il punto.
2. Con il righello misura **d<sub>E</sub>** dal punto alla linea Est di sinistra e **d<sub>N</sub>** dal punto alla linea Nord di sotto.
3. **Converti in metri** con la scala: su 1:25.000 **1 cm = 250 m**, **1 mm = 25 m** (la maglia da 1 km misura 4 cm).
4. Scrivi **E = km della linea + metri** e **N = km della linea + metri**.
5. Scrivi la stringa nel **formato IGM**: **zona e quadrato** (letti nel riquadro del foglio, per Rapallo 32T NQ), poi i km a due cifre seguiti dai **decametri** (metri / 10), **prima la Est, poi la Nord**.

Esempio: 21 km + 650 m a Est e 14 km + 750 m a Nord → **32T NQ 21 65 14 75**. Sono 8 cifre: si arriva al **decametro**, la precisione della convenzione IGM; per tornare ai metri si aggiunge uno zero, ma potrebbe anche essere un 5.

**Il percorso inverso.** Dato 32T NQ 1813 1387: Est = 18 km + 13 decametri = 18 km + 130 m; Nord = 13 km + 87 decametri = 13 km + 870 m. In millimetri: 130 / 25 = 5,2 mm dalla linea 18 e 870 / 25 = 34,8 mm dalla linea 13.

### Dal formato IGM al formato regionale

La stessa posizione si scrive in **metri**, senza zona e senza quadrato.

| | Formato IGM | Formato regionale |
| --- | --- | --- |
| Est | 2 cifre di km + decametri | **5** + km + metri → 6 cifre (es. 521650) |
| Nord | 2 cifre di km + decametri | **49** + km + metri → 7 cifre (es. 4 914 750) |
| Significato | zona e quadrato dicono dove sei | distanza dal meridiano (con 500 km sul 9°) e dall'**equatore** |

**Perché 5 e 49.** Il **5** davanti all'Est è il 500 km del meridiano di tangenza: un Est di 521 km vuol dire 21 km a est del meridiano 9°. Il **49** davanti al Nord appartiene al Nord, perché "non posso essere a 4911 km dal meridiano": è la distanza dall'equatore, circa 4900 km in Liguria. Esempio di B: dopo il 49 vengono 11 km e 375 m, quindi **4.911.375 m dall'equatore**.

:::nota
Il formato regionale vale **solo per la Regione Liguria**. La Toscana poteva avere un altro formato, il Piemonte un altro ancora: le regioni non sono più uguali tra loro. I numeri sono sempre quelli, cambia solo come vengono scritti.
:::

## La carta regionale: cosa si legge sul bordo

- **Coordinate geografiche**: tra due tacche c'è un primo di longitudine, da **Greenwich**: 9°14′ E, 9°15′ E, 9°16′ E… aumentano andando verso est.
- **Coordinate chilometriche**: le linee verticali sono numerate **524.000, 525.000…** perché ci si allontana dal valore 500 km del meridiano 9°. Il 500 si usa e non lo 0 per evitare valori **negativi**: andando verso ponente, verso il confine, i valori restano positivi anche oltre i 400 e i 300.
- Le linee orizzontali portano **4.913.000, 4.912.000…**: i metri dall'equatore, che diminuiscono di 1 km andando verso sud.

## Gauss-Boaga contro UTM

Sulla stessa carta regionale compaiono **altri numeri**: le coordinate **Gauss-Boaga**, anch'esse chilometriche. Boaga, il cartografo italiano, ha proposto per l'Italia un cilindro **leggermente secante** per ridurre gli errori; usando una superficie di proiezione un po' diversa, le coordinate escono diverse.

| | **UTM** (Gauss) | **Gauss-Boaga** |
| --- | --- | --- |
| Valore al meridiano centrale | **500 km** a 9° e a 15° | **1500 km** a 9° (fuso Ovest), **2520 km** a 15° (fuso Est) |
| Cifre dell'Est | 6 (es. 523) | **7**: un **1** davanti (es. 1523) |
| Reticolato sulla carta | quello normale | **sfalsato**: circa **4 mm** verso est (4 × 25 = **100 m**) e alcuni millimetri verso nord |

:::esame{etichetta="Domanda da orale"}
**La differenza tra Gauss-Boaga e UTM** è una domandina dell'orale, non dello scritto. Il valore 1500 e il 2520 non vanno ricordati a memoria: vanno capiti, come il 500 dell'UTM. Se si confondono i due sistemi, l'errore sulla carta è di circa 100 m (4 mm).
:::

La procedura per ricavare le coordinate Gauss-Boaga è la stessa: si **misura dalle linee del reticolato Gauss-Boaga**, non da quelle UTM. Sulla carta regionale le coordinate sono ancora in uso e la Regione le assegna a ogni carta.

:::ndr
Il corso presenta il cilindro come **tangente** per l'UTM e **secante** per Boaga. In realtà anche l'UTM ha un fattore di scala di 0,9996, quindi è leggermente secante. Lo scarto tra i due reticolati viene soprattutto dal **datum** (Gauss-Boaga è sul Roma 40, l'UTM delle carte IGM sul ED50) e dal **falso Est** (1500 km contro 500 km). All'esame vale la versione del prof.
:::

La tabella della carta regionale con i **quattro vertici** (nord-ovest, nord-est, sud-ovest, sud-est) riporta le coordinate in tre forme: Gauss-Boaga, UTM e geografiche. Mostra quindi il significato del 49, del 5, del 500 e del 1 davanti. Le coordinate geografiche in testa sono riferite a ED 1950.

Il prof ha anche riassunto la sequenza dell'esame: **due test**, uno di cartografia e uno di geografia fisica, la media dei due voti, poi un **orale breve** con due domande, una di cartografia e una di geografia fisica, su cose non chieste nei test.

## Coordinate assolute e coordinate polari

Finora si è parlato di coordinate **assolute**, geografiche e chilometriche (UTM e Gauss-Boaga): danno la posizione rispetto all'intero globo. Per i **rilievi locali**, con **stazione totale** o strumenti simili, si usano le **coordinate polari**.

:::definizione
**Coordinate polari** di un punto Q rispetto a un **punto stazione** P: la **distanza PQ** e l'**azimut ψ**, cioè l'angolo misurato in senso orario dal **Nord** alla direzione PQ. A queste si aggiunge la **quota**, il terzo elemento che individua il punto nello spazio.
:::

Procedura sul terreno:

1. Si sceglie il **punto stazione** P, possibilmente con **coordinate assolute note**.
2. Dal punto P si **mira** un oggetto riconoscibile (un campanile, una cima, la confluenza di due corsi d'acqua): lo strumento misura l'**angolo** rispetto al nord, per esempio 55°.
3. Si misura la **distanza**, per esempio circa 1600 m. Si misura anche la **quota**.
4. Si ripete per 10, 20, 50, 200 o 1000 punti attorno a P: si ottiene un rilievo locale.
5. Conoscendo le coordinate assolute del solo punto P, si **estendono** a tutti i punti rilevati.

:::ndr
Le formule per passare da polari a Est e Nord non sono state fatte in aula. Con ψ misurato in senso orario dal nord: E<sub>Q</sub> = E<sub>P</sub> + d · sen ψ, N<sub>Q</sub> = N<sub>P</sub> + d · cos ψ.
:::

La **quota** è la terza dimensione: planimetricamente bastano latitudine e longitudine (o Est e Nord), ma nello spazio un punto può stare a livello del mare o a 2000 m. I punti A e B sono stati messi su curve di livello apposta: la quota si ricaverà quando si parlerà delle curve di livello.

## La declinazione magnetica

*Un dato che compare su tutte le carte e serve a orientarle.*

La bussola indica il **nord magnetico**, che **non coincide con il nord geografico**, quello della linea meridiana. Nel riquadro delle carte IGM si vedono tre direzioni:

- **N**, il nord geografico (l'asterisco);
- **Nm**, il nord magnetico (la freccia nera);
- **Nq**, il nord della **quadrettatura**, cioè del reticolato chilometrico.

:::definizione
**Declinazione magnetica (δ)**: la differenza **angolare** tra il nord geografico e il nord magnetico. Sulla slide c'è anche la **convergenza (γ)**, l'angolo tra nord geografico e nord della quadrettatura.
:::

Non è costante: **varia nel tempo**, anche ogni anno. Sulla tavoletta di Rapallo, al **1° gennaio 1985**, δ = **+0°56′** (positiva: nord magnetico a est del geografico) e varia di circa **+5′30″ per anno**.

:::ndr
Il prof dice "5 primi 36": la slide riporta **5′30″**.
:::

Procedura per usare il dato oggi:

1. Leggi sulla carta la δ di riferimento e la sua data.
2. Calcola **δ oggi = δ riferimento + (anni trascorsi × variazione annua)**.
3. Per segnare il nord magnetico sulla carta: unisci il punto **P** al centro del lato sud con il **tratto graduato** sul lato nord, corrispondente al valore di δ (istruzione dalla slide).
4. Con la bussola e la carta su una tavoletta rigida, fai coincidere l'ago con il nord e, sapendo che c'è una differenza di qualche grado, ruota la carta di quell'angolo a destra o a sinistra.

Esempio mio, indicativo: dal 1985 al 2026 sono 41 anni, quindi 0°56′ + 41 × 5′30″ ≈ **4°40′** e l'errore di orientamento senza correzione sarebbe notevole. La variazione reale non è costante.

Serve soprattutto quando sul terreno non si hanno riferimenti fisici (un mare, una cima, un campanile) e bisogna orientare la carta con la bussola. Oggi tablet e GPS aiutano molto, ma è importante sapere perché il dato è sulla carta.

## La cartografia IGM: fogli, quadranti e tavolette

L'**IGM** ha coperto l'Italia **dall'Unità d'Italia** fino agli anni 1960–70, quando ha smesso di mandare i propri rilevatori sul terreno (strumenti ormai obsoleti): per fare il 25.000 di tutto il Paese ci sono voluti decenni.

:::definizione
- **Foglio**: carta al **1:100.000**, numerata dal nord verso sud, da 1 in alto a poco meno di 280 in Sicilia (la numerazione è cambiata nel tempo). La tavoletta di Rapallo è nel **foglio 83**.
- **Quadrante**: carta al **1:50.000**; ogni foglio ne ha **4**, numerati in senso **orario** da I (nord-est) a IV.
- **Tavoletta**: carta al **1:25.000**; ogni quadrante ne ha **4**, indicate con **NE, SE, SO, NO**. Ogni foglio è quindi coperto da **16 tavolette**.
- **Sezione**: carta al 1:10.000, termine poco usato.
:::

Per questo Rapallo è: **foglio 83, II quadrante, tavoletta SO**. I quadri d'unione sono sul sito dell'IGM. L'Italia è a cavallo di due fusi, ovest ed est, rispetto al meridiano di Roma; l'unica proiezione adottata è la **UTM**, e il prof la chiede all'esame.

## Le carte regionali e i software GIS

- Dal portale della **Regione Liguria** (basta cercare "cartografia regione Liguria", l'ufficio cartografico regionale) si scaricano **gratuitamente** carte in formato **raster, vettoriale e georeferenziato**.
- Il portale chiede **informazioni** (sistema di riferimento, formato): chi non sa rispondere non riesce a scaricare le carte.
- Si trovano le **edizioni attuali** (il 25.000 del 2017) e **quelle vecchie** (per esempio 1985): si possono scaricare più edizioni per fare **confronti** nel tempo, secondo il lavoro da fare.
- Una carta **georeferenziata** ha associate le coordinate: si punta su un punto e il software le dà. Si aprono con **QGIS** (gratuito e open source): si importano tre o quattro carte e il programma le mette insieme grazie alle coordinate.
- Il GIS **non** si fa in questo corso, non c'è il tempo: il prof consiglia però di iniziare a usarlo.

## Da fare

- [ ] Rifare la procedura delle coordinate geografiche (latitudine e longitudine) su un punto qualsiasi, con le proprie misure di L e d.
- [ ] Rifare la procedura UTM sullo stesso punto e scrivere il risultato in formato IGM e in formato regionale, controllando che le cifre siano 8 + 6 + 7.
- [ ] Imparare perché 500 e non 0, e cosa cambia in Gauss-Boaga (1 davanti, 100 m di sfalsamento).
- [ ] Ripassare la declinazione: definizione, aggiornamento nel tempo, uso con la bussola.
- [ ] Decifrare la sigla della propria tavoletta: foglio 83, II SO.
