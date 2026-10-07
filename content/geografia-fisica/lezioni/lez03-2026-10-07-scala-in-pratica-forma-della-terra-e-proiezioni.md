---
materia: geografia-fisica
numero: 3
data: 2026-10-07
titolo: "Scala in pratica, forma della Terra e proiezioni"
docente: "Pierluigi Brandolini"
fonte: "Appunti dalla registrazione audio (mattina, 9–11, CT.09) e dalle slide «2gfc scala proiez simb»"
nota: "La registrazione copre solo i primi venti minuti, l'esercizio sulla scala: forma della Terra e classificazione delle proiezioni sono ricostruite dalle slide e da quanto il prof ha richiamato nella lezione del pomeriggio (lez04). Le note [ndr] sono precisazioni mie."
tag: [scala, esercizi, ellissoide, geoide, proiezioni, classificazione delle carte]
---


## La scala, in pratica

*Ripresa della lezione precedente con la carta sul banco.*

### Una carta ingrandita non cambia scala

Se per un lavoro serve un rilevamento al 5.000, bisogna procurarsi una carta **realizzata** al 5.000: fotocopiare una carta al 10.000 raddoppiandola dà un ingrandimento artificiale, non una carta al 5.000. Passando dal 25.000 al 10.000 al 5.000 i rilevatori hanno aggiunto dettagli e informazioni più precise; riducendo, quelle informazioni diventerebbero illeggibili (simboli troppo vicini, elementi lineari che si sovrappongono).

Esempio sul promontorio di Portofino, in senso antiorario: al 50.000 tutto il promontorio; al 25.000 il settore da Punta Chiappa a San Fruttuoso; al 10.000 la sola baia di San Fruttuoso; al 5.000 e al 2.000 i singoli edifici; poi la catastale. **Più la scala aumenta, più cresce il dettaglio e più diminuisce l'area rappresentata**, a parità di foglio. Dall'altra parte le carte a piccolissima scala (1:95 milioni, 1:38 milioni, 1:16 milioni) sono quelle degli atlanti, anche fisici: climi, correnti marine, fenomeni a scala globale.

### Esercizio in aula: verificare la scala della tavoletta

Caso tipico: uno stralcio o una fotocopia di cui non si conosce la scala. Sul **foglio 3** si prendono due punti: **A** il puntino della lettera M di "M. Castello", **B** la casetta quotata **368** a sinistra. Il dato che il prof dà: distanza reale **700 m**. Sulla carta, col righello, A–B misura circa **2,8 cm**.

:::esame{etichetta="Il conto, sempre nella stessa unità"}
Non si può dividere metri per centimetri. 700 m = **70.000 cm**. 70.000 / 2,8 = **25.000**: la carta è al 1:25.000. Se la fotocopia fosse stata ingrandita o ridotta, sarebbe venuto un valore diverso, e quello sarebbe stato il denominatore della scala "effettiva" del foglio in mano.
:::

Ogni carta è definita dal suo rapporto di riduzione dalla realtà. Al compitino si misura con la propria riga e si fa il proprio conto: un paio di millimetri di differenza spostano poco il risultato.

## La forma della Terra e le proiezioni

*Questa parte manca dalla registrazione: le definizioni sono quelle delle slide, e al pomeriggio il prof le ha richiamate.*

:::definizione
**Carta approssimata** perché sempre deformata. Per essere esatta dovrebbe avere tre requisiti insieme, equidistanza, equivalenza e isogonia, e sull'intero globo è impossibile. Le **proiezioni geografiche** sono i procedimenti con cui la superficie "sferica" della Terra viene trasformata per riportarla sul piano.

**Classificazione delle carte per scala**: piante e mappe (più grandi di 1:1.000), carte topografiche (da 1:1.000 a 1:150.000), corografiche (da 1:150.000 a 1:1.000.000), geografiche (più piccole di 1:1.000.000). Per contenuto: generali e tematiche (qualitative, quantitative, statiche, dinamiche, di previsione).
:::

**La forma della Terra.** Per la rotazione la Terra non è una sfera ma un **ellissoide di rotazione** (un'ellisse ruotata sul suo asse minore). La forma reale è il **geoide**, la superficie teorica su cui il potenziale della gravità è uguale in tutti i punti; ellissoide e geoide non coincidono. La cartografia IGM adotta l'**ellissoide internazionale** di Hayford (1909, adottato nel 1924): raggio equatoriale 6378,388 km, raggio polare 6356,912 km, differenza 21,476 km, schiacciamento 1/297. È il "sistema di riferimento" che QGIS chiede appena si carica una carta: se si dà al software il dato sbagliato, i dati estratti sono sbagliati.

**Tre famiglie di proiezioni.**

| Famiglia | Come si costruisce | Esempi |
| --- | --- | --- |
| Vere (pure) | principi geometrici, con una superficie ausiliaria: **prospettiche** (piane o azimutali: centrografiche, stereografiche, scenografiche, ortografiche) e **di sviluppo** (coniche, cilindriche) | cilindrica centrale; centrografica polare |
| Modificate | le precedenti con correzioni geometriche per ridurre le deformazioni | **Mercatore** (cilindrica modificata) |
| Convenzionali | relazioni matematiche che rispettano uno dei tre requisiti | Mollweide, sinusoidale, Hammer, Goode (interrotta) |

La figura della slide con il profilo umano deformato dice tutto: ogni proiezione deforma in modo diverso.

## Da fare

- [ ] Rifare l'esercizio di Monte Castello con la propria misura.
- [ ] Ripassare le tre famiglie di proiezioni e i numeri dell'ellissoide internazionale.
