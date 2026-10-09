---
materia: chimica
numero: 3
data: 2026-10-09
titolo: "Onde, orbitali e numeri quantici"
docente: "Pavlo Solokha"
fonte: "Appunti dalla registrazione audio e dalle slide «Teoria atomica»; i primi minuti, non registrati, sono ricostruiti solo dalle slide 22–34"
nota: "L'audio parte a metà della slide 35 (onde stazionarie). I minuti prima, probabilmente le slide 22–34 su luce, spettri, Bohr e de Broglie, sono ricostruiti nella sezione «Dalle slide» e segnati come tali: non so quanto il prof ci sia arrivato a voce. Un loop di numeri copre il passaggio sulle lettere s, p, d, f, sistemato con le slide sugli orbitali. Le note [ndr] sono precisazioni mie."
tag: [luce, spettro di emissione, Bohr, de Broglie, onde stazionarie, nodi, atomo di idrogeno, Schrödinger, funzione d'onda, orbitali, numeri quantici, nodi radiali e angolari, spin]
---

## Dalle slide: luce, spettri, Bohr e de Broglie

*Parte non registrata, ricostruita dalle slide 22–34. La tengo come base: l'audio che segue dà questi concetti per scontati (il prof parla di Bohr e de Broglie al passato).*

### La luce come onda

La luce è radiazione elettromagnetica, con lunghezza d'onda λ, frequenza ν e velocità c = 3 × 10<sup>8</sup> m/s nel vuoto: **λ · ν = c**. Esempi sulla slide: λ = 400 nm (violetto) e λ = 700 nm (rosso). Seguono lo spettro elettromagnetico e la diffrazione (la deviazione di un'onda che incontra un ostacolo). Corpo nero, fotone E = h·ν ed effetto fotoelettrico sono già negli appunti della lezione 2.

### Lo spettro di emissione dell'idrogeno

Lo spettro dell'atomo di idrogeno non è continuo: è fatto di **righe spettrali ben distinte**. Nel visibile sono la **serie di Balmer**, descritta dall'equazione sperimentale

:::definizione
**1/λ = R · (1/2² − 1/n²)**, con n > 2 e R = 1,0974 × 10<sup>7</sup> m<sup>−1</sup>. È la correlazione dei dati sperimentali con un'equazione, ma senza spiegazione teorica.
:::

### Il modello di Bohr (1913)

L'elettrone descrive un'**orbita circolare** attorno al nucleo secondo la meccanica classica, con una condizione in più che tiene conto della **quantizzazione dell'energia di Planck**: i raggi delle orbite possibili sono quantizzati,

:::definizione
**r<sub>n</sub> = n² · r<sub>1</sub>**, con r<sub>1</sub> = 0,53 Å e n = 1, 2, 3… (numero quantico di Bohr).
:::

Il passaggio dell'elettrone da un livello a un altro comporta **assorbimento** di energia (se sale) o **emissione** (se scende): è il meccanismo dello spettro di emissione. Le serie dell'idrogeno:

| Serie | Regione | Transizioni |
| --- | --- | --- |
| Lyman | ultravioletto | verso n = 1 |
| Balmer | visibile | da n > 2 verso n = 2 |
| Paschen | infrarosso | da n > 3 verso n = 3 |

Il limite del modello di Bohr: interpreta lo spettro dell'idrogeno, **ma non quelli degli atomi con più elettroni**.

### La relazione di de Broglie

Partendo da E = mc² e E = h·ν: h·ν = mc², quindi h·ν/c = mc = p, cioè

:::definizione
**p = h/λ**, o **λ = h/p**: ogni particella con quantità di moto p ha una lunghezza d'onda associata.
:::

| Particella | Lunghezza d'onda di de Broglie |
| --- | --- |
| Fotone (giallo) | ~600 nm |
| Elettrone (v ≈ 10<sup>5</sup> m/s) | ~6 nm |
| Atomo di sodio (80 K, v ≈ 300 m/s) | ~0,06 nm |
| Pallina da baseball (170 g, 40 m/s) | ~6 × 10<sup>−26</sup> nm |

Per un oggetto macroscopico l'onda è assolutamente trascurabile; per un elettrone no. Perciò **è possibile descrivere l'elettrone come un'onda**. A questo si aggiunge il principio di Heisenberg (non si può conoscere con precisione la traiettoria di una particella elementare) e la teoria di **Schrödinger** (1926), la **meccanica ondulatoria**, che descrive il comportamento dell'elettrone nell'atomo partendo dalle onde stazionarie.

## Onde stazionarie e nodi

*L'audio riparte dalla corda fissata agli estremi: ogni onda possibile ha un numero preciso di nodi, e più nodi significa più energia.*

Nell'onda fondamentale i soli punti fermi sono i due estremi fissi della corda. Agitando di più la corda, l'energia dell'onda aumenta e compaiono dei **nodi** interni: uno, poi due, poi tre, e così via. Il numero dei nodi può solo crescere a scatti, per numeri interi: è la stessa idea di grandezza **discreta** che ritorna in tutta la lezione.

:::definizione
**Nodo**: punto in cui l'onda non oscilla. Non è un punto dove c'è energia: l'energia è associata all'**onda nella sua interezza**, non al nodo. L'onda con energia più bassa è quella con **zero nodi** interni; quella con energia subito maggiore ne ha uno, poi due, e così via.
:::

Il numero di nodi è sempre **n − 1**, dove n è il numero quantico: per n = 1 zero nodi (stato fondamentale), per n = 2 un nodo, per n = 3 due nodi.

Per un'onda stazionaria "macroscopica" (la corda) l'energia dipende da due cose: **n**, che sta al **numeratore** (più n, più energia), e dalla lunghezza **L** del sistema. Il prof non ha chiesto di ricordare tutti i termini dell'equazione.

:::ndr
In aula L è stata chiamata "lunghezza dell'onda": è la lunghezza del sistema in cui l'onda sta confinata (la corda). La formula sulla slide è E = h²n²/(8mL²).
:::

## L'elettrone come onda

L'atomo è un oggetto sferico, e l'elettrone, oltre a essere una particella, **si muove molto velocemente e ha le proprietà di un'onda**. Lo si può quindi pensare in modo simile alla corda: come un'onda con la sua energia e con il suo numero di nodi, e anche per l'atomo valgono le stesse regole. Sono possibili solo onde con un numero **discreto** di nodi, 0, 1, 2…: stato fondamentale n = 1 con zero nodi, secondo stato n = 2 con un nodo, e così via. Una quantità intermedia è proibita.

## Energia dell'atomo di idrogeno

Per l'elettrone attorno al nucleo l'energia si esprime con un'equazione diversa da quella della corda:

:::definizione
**E<sub>n</sub> = − R<sub>H</sub> · Z² / n²**

R<sub>H</sub> è la **costante di Rydberg**; Z è la **carica nucleare effettiva**, legata al numero di protoni e alla forza di interazione con l'elettrone (per l'idrogeno Z = 1); n è il numero quantico. Questa volta **n sta al denominatore**, e davanti c'è un **segno meno**.
:::

- **Stato fondamentale**, n = 1, Z = 1: E<sub>1</sub> = − R<sub>H</sub>.
- **Secondo stato**, n = 2: E<sub>2</sub> = − R<sub>H</sub>/4.
- Così via per n = 3, 4… fino all'infinito, dove l'energia tende a zero (elettrone ionizzato, E = 0).

:::nota
Dalla slide: R<sub>H</sub> = 2,18 × 10<sup>−18</sup> J (= 3,29 × 10<sup>15</sup> Hz); moltiplicata per il numero di Avogadro, N<sub>A</sub> · R<sub>H</sub> = 1312 kJ/mol.
:::

:::esame{etichetta="Il trucco del segno"}
Con il meno davanti e n al denominatore, **più alto è n, più alta è l'energia**: −R<sub>H</sub>/4 è maggiore di −R<sub>H</sub> perché è meno negativo. Non farsi ingannare dal fatto che il numero diventa più piccolo.
:::

Per far salire l'elettrone dal primo al secondo livello serve la **differenza** tra le due energie, dal terzo la differenza tra E<sub>3</sub> e E<sub>1</sub>, e così via: l'energia scambiata è **quantizzata**, può avere solo certi valori. È la spiegazione più completa di quello che aveva ipotizzato **Bohr**, che aveva assunto energie ammissibili senza sapere perché: ragionare sull'elettrone come un'onda, come aveva proposto de Broglie, le fa uscire da sole. Per questo non c'è da stupirsi se un oggetto riscaldato scambia energia a "pacchetti" e non in quantità qualsiasi.

:::ndr
Nel transcript il calcolo del salto 1 → 2 non si capisce. La differenza tra − R<sub>H</sub>/4 e − R<sub>H</sub> è **3/4 di R<sub>H</sub>**.
:::

## L'equazione di Schrödinger e il principio di indeterminazione

**Schrödinger**, scienziato austriaco, aveva passato la vita a studiare le onde stazionarie, e sapeva usare un linguaggio matematico elegante: ha scritto un'equazione che descrive tutto questo. Il problema è che l'onda della corda ha **una** dimensione (basta la coordinata x), mentre l'elettrone nell'atomo è un oggetto tridimensionale: servono x, y, z. Da qui nasce una nuova fisica, la **meccanica ondulatoria** (o quantistica).

:::definizione
**Principio di indeterminazione di Heisenberg**: nel microcosmo, se l'oggetto è piccolo e si muove velocemente, non si può conoscere con precisione elevatissima insieme dove si trova e come si muove: o l'uno o l'altro. Nel macrocosmo non è così: un missile lanciato si può prevedere con grande precisione, perché è un oggetto grosso.
:::

:::ndr
In aula "o conosco dove si trova, oppure la sua energia". Le due grandezze legate dal principio sono **posizione e quantità di moto** (cioè velocità).
:::

Schrödinger scrive l'equazione con una **funzione d'onda ψ** (psi) che rappresenta lo stato dell'elettrone: da una parte alcune operazioni matematiche applicate a ψ, in cui compaiono due termini, **energia cinetica ed energia potenziale**; dall'altra l'energia dell'onda moltiplicata per la stessa ψ. Si cerca quali onde, cioè quali **orbitali**, sono ammissibili per l'elettrone. L'equazione è stata risolta in modo esatto solo per l'**atomo di idrogeno**, un protone e un elettrone, che è un sistema semplice.

:::esame{etichetta="All'esame"}
L'equazione di Schrödinger **non viene chiesta**: serve solo per spiegare come nascono gli orbitali e i numeri quantici.
:::

Quando l'elettrone assorbe energia succede quello che si vedeva con la corda agitata di più: **l'onda cambia**. Anche l'elettrone cambia il suo orbitale, la sua forma e la sua energia.

## I numeri quantici

La soluzione è molto complessa, ma ha caratteristiche precise: tre numeri quantici, perché l'onda è tridimensionale. Sono **numeri interi** e **non sono indipendenti**: uno dipende dall'altro, quindi, dato il primo, a cascata si ricavano gli altri.

:::definizione
- **n**, numero quantico **principale**: 1, 2, 3, 4… (solo interi positivi).
- **l**, numero quantico **orbitale** (momento angolare): da **0 a n − 1**.
- **m<sub>l</sub>**, numero quantico **magnetico**: da **− l a + l**, cioè 0, ±1, ±2, … ± l.
:::

Esempi, ragionando a cascata:

| n | l possibili | m<sub>l</sub> possibili | Quanti orbitali |
| --- | --- | --- | --- |
| 1 | 0 | 0 | **1** |
| 2 | 0, 1 | per l = 0: 0 · per l = 1: −1, 0, +1 | **4** |
| 3 | 0, 1, 2 | 0 · −1, 0, +1 · −2, −1, 0, +1, +2 | **9** |

Il numero di orbitali di un livello è **n²**. Lo stato fondamentale è definito da **(n, l, m<sub>l</sub>) = (1, 0, 0)**: esiste una sola funzione, ψ<sub>100</sub>. Il numero di valori di m<sub>l</sub> per un dato l è **2l + 1**, e dice quanti orbitali di quel tipo esistono.

## Gli orbitali, dalla lettera ai numeri

Si indicano solo i primi due numeri quantici (da cui dipende l'energia) e l si scrive con una lettera:

| l | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Lettera | **s** | **p** | **d** | **f** |
| Valori di m<sub>l</sub> = quanti orbitali | 1 | 3 | 5 | 7 |

(poi viene il 9, e così via per i tipi successivi). Quindi: **1s** è n = 1, l = 0; **2s** è n = 2, l = 0; i tre **2p** sono n = 2, l = 1; i cinque **3d** sono n = 3, l = 2.

- Gli orbitali dello stesso tipo e livello, come i tre p (p<sub>x</sub>, p<sub>y</sub>, p<sub>z</sub>), hanno **la stessa energia**: si dicono **degeneri**.
- In ogni livello l ≤ n − 1: **non esiste 2d**, esiste invece **4f** (n = 4, l = 3), con **7 orbitali**.
- La lettera dice la forma: **s sferico** (cambia solo dimensione, energia e numero di nodi, ma la forma resta sferica), **p a due lobi** (un "manubrio" con un piano nodale al centro), **d a "quadrifoglio"**, **f** più complicata.

:::ndr
Per l'atomo di idrogeno gli orbitali dello stesso livello hanno la stessa energia, quindi 2s e 2p sono uguali per energia. Negli atomi con più elettroni non è più così (si vedrà più avanti).
:::

## Che cosa significa la funzione d'onda

La funzione d'onda ψ è un'ampiezza, può essere positiva o negativa, e **in sé non ha nessun significato fisico** nel microcosmo. Quello che ha significato è il suo **quadrato**.

:::definizione
**ψ²** è la **probabilità** (la densità di probabilità) di trovare l'elettrone in un punto dello spazio. Per il principio di Heisenberg la posizione esatta non si può conoscere: l'unico parametro che esiste è la probabilità.
:::

L'immagine del prof è il **melo**: l'albero è il nucleo, le mele cadute sono le posizioni dell'elettrone. La mela può finire in qualsiasi punto attorno all'albero; a un chilometro è molto improbabile, ma **mai impossibile**. Così l'elettrone: la probabilità di trovarlo lontano dal nucleo è piccola, ma non è mai nulla, nemmeno a distanza infinita.

Per rappresentare un orbitale si fanno due cose:

1. Il grafico di ψ² in funzione della distanza dal nucleo (0 = il nucleo).
2. Dato che l'elettrone è in un oggetto tridimensionale, si moltiplica per un coefficiente geometrico e si ottiene la **distribuzione radiale di probabilità**: ha un **picco**, che è la distanza più probabile dal nucleo.

Per il **1s dell'idrogeno** il picco è a **0,53 Å**, lo stesso valore che **Bohr** aveva ricavato postulando gli stati energetici. È l'unione di due teorie, una approssimativa e una rigorosa, e per Schrödinger vale il Nobel.

Per convenzione, la superficie con cui si disegna un orbitale è quella che racchiude il **95%** della probabilità di trovare l'elettrone; il resto non interessa. Nei disegni i lobi sono colorati in giallo e blu: indicano il **segno della funzione d'onda** (positiva o negativa), non una carica.

## I nodi degli orbitali

Un **nodo** in un orbitale è un punto, un piano o una superficie in cui la probabilità di trovare l'elettrone è **zero**, come una zona proibita attorno al melo dove non cadrà mai una mela. Quanti nodi ha un orbitale è lo stesso discorso della corda: più nodi, più energia.

- **1s**: nessun nodo, un solo picco.
- **2s**: un nodo, una sfera dove la probabilità è zero. Al centro la probabilità è alta, poi nulla, poi di nuovo qualcosa più fuori.
- **3s**: due nodi.
- **2p**: un nodo, che è un **piano** (il piano nodale).

:::definizione
Esistono due tipi di nodi:

- **Nodi angolari**: piani o coni. Il loro numero è uguale a **l**.
- **Nodi radiali**: superfici sferiche. Il loro numero è **n − l − 1**.

Il **numero totale di nodi** è **n − 1**.
:::

| Orbitale | n | l | Nodi totali | Angolari | Radiali |
| --- | --- | --- | --- | --- | --- |
| 1s | 1 | 0 | 0 | 0 | 0 |
| 2s | 2 | 0 | 1 | 0 | 1 |
| 2p | 2 | 1 | 1 | 1 | 0 |
| 3s | 3 | 0 | 2 | 0 | 2 |
| 3p | 3 | 1 | 2 | 1 | 1 |
| 3d | 3 | 2 | 2 | 2 | 0 |
| 4f | 4 | 3 | 3 | 3 | 0 |

2s e 2p hanno lo stesso numero totale di nodi, perché hanno la stessa energia; cambia **la natura** del nodo, sferico in un caso e piano nell'altro. Gli orbitali s non hanno mai nodi angolari: i loro nodi sono tutti sferici.

Quando l'elettrone assorbe l'energia giusta e sale da 1s a 2s o 3s, la sua forma cambia: compaiono nodi. Se poi torna allo stato fondamentale, riprende la forma di prima e **rilascia l'energia in eccesso**. Come fa a esistere una zona dove non si trova mai, e comunque a "passare" da una parte all'altra? Perché nel microcosmo le cose **non sono continue** ma quantizzate, e funzionano con regole che nel macrocosmo non esistono.

## Lo spin

Le misure sperimentali hanno mostrato che l'elettrone ha un'altra proprietà. Se un fascio passa tra i poli di una calamita, si **divide in due**: una metà viene attratta verso un polo, l'altra verso l'altro. L'elettrone risponde al campo magnetico come se ruotasse su se stesso, in senso orario o antiorario.

:::definizione
**Spin**: quarto numero quantico, **m<sub>s</sub>**, che assume solo due valori, **+½** e **−½** (senso orario e antiorario). Nei diagrammi si disegna con una **freccia**: di solito verso l'alto per +½, verso il basso per −½.
:::

Quindi per descrivere un elettrone in un atomo servono **quattro numeri quantici**: n, l, m<sub>l</sub>, m<sub>s</sub>.

:::ndr
L'esperimento descritto è quello di **Stern e Gerlach** (1922), fatto con un fascio di **atomi di argento**, non di elettroni estratti dall'atomo: l'atomo si comporta come un piccolo magnete per lo spin del suo elettrone spaiato.
:::

## Da fare

- [ ] Esercizio da rifare: dato n = 4, scrivere tutti i valori di l e di m<sub>l</sub> e contare gli orbitali (devono venire 16 = n²).
- [ ] Imparare a memoria: s, p, d, f con 1, 3, 5, 7 orbitali; l da 0 a n − 1; m<sub>l</sub> da −l a +l.
- [ ] Per ogni orbitale (1s, 2s, 2p, 3s, 3p, 3d, 4f) saper calcolare nodi totali, angolari e radiali.
- [ ] Ripassare il trucco del segno nell'energia dell'idrogeno e la differenza tra ψ e ψ².
- [ ] Il prof riprende lunedì: fare le domande a lezione se qualcosa non è chiaro, non "in commento".
