---
materia: chimica
numero: 4
data: 2026-10-12
titolo: "Atomi polielettronici e configurazione elettronica"
docente: "Pavlo Solokha"
fonte: "Appunti dalla registrazione audio e dalle slide «Teoria atomica» (54–82). Lezione non registrata in modo continuo: tre loop"
nota: "Il prof parla piano e l'audio ha tre loop (uno lungo di numeri dopo l'esercizio sul cloro, uno a metà e uno alla fine, durante l'esercizio 7.64). La lezione si è fermata proprio lì, come confermato. Il contenuto si ricostruisce con le slide. Le note [ndr] sono precisazioni mie."
tag: [orbitali, sottolivelli, atomi polielettronici, schermatura, penetrazione, regola n+l, Aufbau, Pauli, Hund, configurazione elettronica, tavola periodica, cationi, anioni, specie isoelettroniche]
---

## Ripasso: i livelli dell'atomo di idrogeno

*Il prof riparte dall'atomo di idrogeno, perché ancora per un po' si ragiona su quello.*

Il numero di elettroni di un atomo neutro è uguale a quello dei protoni, e non cambia con gli isotopi: il prozio, con un neutrone in più, ha sempre un solo elettrone. Nell'atomo di idrogeno non c'è un solo stato per l'elettrone ma **tanti**, uno per ogni valore di n: **n = 1** è lo stato fondamentale, a energia più bassa; tutti gli altri hanno energia più alta.

:::definizione
**Elettrone e orbitale** sono due modi di dire la stessa cosa: l'elettrone non esiste senza l'orbitale, perché con la sua energia rappresenta quello che chiamiamo orbitale. Per definire uno stato servono **quattro numeri quantici**; i primi tre (n, l, m<sub>l</sub>) fissano l'orbitale, il quarto (m<sub>s</sub>) lo spin.
:::

| Livello | Sottolivelli (l) | Orbitali | Nodi di ciascun orbitale |
| --- | --- | --- | --- |
| n = 1 | 1s | 1 | nessuno |
| n = 2 | 2s, 2p | 1 + 3 = **4** | 2s: 1 radiale · 2p: 1 angolare |
| n = 3 | 3s, 3p, 3d | 1 + 3 + 5 = **9** | 3s: 2 radiali · 3p: 1 + 1 · 3d: 2 angolari (piani nodali) |
| n = 4 | 4s, 4p, 4d, 4f | **16** | |

- Il **sottolivello** è l'insieme degli orbitali dello stesso tipo dentro un livello (2s e 2p sono due sottolivelli del secondo livello).
- Il numero di sottolivelli di un livello è **n**; un sottolivello con numero quantico l contiene **2l + 1** orbitali (3d: 5, 4f: 7); il livello ne contiene **n²** in tutto.
- **Solo nell'atomo di idrogeno** i sottolivelli dello stesso livello hanno la stessa energia, che dipende solo da n. La distanza tra primo e secondo livello è la più grande; poi le differenze si accorciano.

Quando l'atomo assorbe energia, l'elettrone cambia orbitale: da 1s può passare a 3s, 4f, 5d… e cambia **natura**, cioè più nodi, forma ed energia diverse. Quando si riassesta, torna allo stato fondamentale e rilascia l'energia in eccesso. I livelli del diagramma sono "posti disponibili", immaginari finché non c'è un elettrone. Il prof deve ancora informarsi se, eccitandosi, l'elettrone può anche cambiare spin.

Questo spiega lo **spettro di emissione dell'idrogeno**, punto di partenza della lezione precedente: le righe sono i ritorni dell'elettrone verso un livello più basso. Le righe del visibile, quelle di Balmer, corrispondono ai ritorni al livello n = 2: per questo nel visibile sono poche, quattro.

## Quanti elettroni ospita un orbitale

Un orbitale può contenere **al massimo due elettroni, con spin opposto**: +½ e −½. È il **principio di esclusione di Pauli** (nome dalla slide 56): in un atomo non esistono due elettroni con gli stessi quattro numeri quantici.

La capienza di un sottolivello è quindi due volte il numero dei suoi orbitali:

| Sottolivello | s | p | d | f |
| --- | --- | --- | --- | --- |
| Orbitali | 1 | 3 | 5 | 7 |
| Capienza (elettroni) | **2** | **6** | **10** | **14** |

Il livello n ha capienza **2n²**: il quarto livello contiene 16 orbitali e quindi 32 elettroni.

:::ndr
La capienza del quarto livello nell'audio non si sente: i 16 orbitali sono detti, i 32 elettroni li ricavo io da 2 × 16.
:::

## Gli atomi polielettronici

*Il punto che mette in crisi il modello: funziona solo per l'idrogeno.*

L'elio ha due elettroni e due protoni: già solo aggiungere un elettrone fa sì che il modello dell'idrogeno non spieghi più nulla. Lo spettro dell'elio ha **molte più righe**, e un numero maggiore di righe è la traccia di un'altra cosa: **nei sistemi con più elettroni i sottolivelli di uno stesso livello non hanno più la stessa energia**.

Gli elettroni si comportano come gli spettatori di un cinema che vogliono vedere meglio lo schermo: cercano di **ottimizzare l'energia**, cioè di interagire il più possibile con il nucleo. Se davanti c'è una persona alta, ci si sposta un po' a destra o a sinistra. I fenomeni sono quattro.

### Carica nucleare, repulsione e schermatura

:::definizione
**Carica nucleare.** A parità di elettroni, più protoni ci sono, più l'energia dell'elettrone è bassa. H (1 p), He<sup>+</sup> (2 p), Li<sup>2+</sup> (3 p) hanno un solo elettrone ciascuno, e l'energia scende al crescere di Z. Per rimuovere l'elettrone 1s serve più energia da He<sup>+</sup> che da H.

**Repulsione fra gli elettroni.** Due elettroni nello stesso orbitale si danno fastidio: un elettrone rende l'altro più facile da rimuovere. Per questo He (−2372 kJ/mol) è meno stabile di He<sup>+</sup> (−5250 kJ/mol).

**Schermatura.** Gli elettroni interni "fanno ombra" a quelli esterni e riducono l'attrazione del nucleo. La **carica nucleare effettiva Z<sub>eff</sub>** è la carica positiva realmente sentita da un elettrone esterno, tenendo conto del nucleo e della repulsione degli altri elettroni: più un elettrone è lontano dal nucleo, minore è la sua Z<sub>eff</sub>.
:::

:::ndr
Il prof dice che con lo stesso numero di elettroni "tutto è lineare" al crescere dei protoni. L'energia scala con **Z²**, come nella formula E = −R<sub>H</sub> Z²/n² della lezione 3: per esempio H −1312, He<sup>+</sup> −5250 (circa 4 × 1312), Li<sup>2+</sup> circa −11800 kJ/mol.
:::

Confronto di Li con lo stesso orbitale 2s senza gli elettroni interni (slide 63): l'energia passa da **−520 a −2954 kJ/mol**. Quindi la schermatura degli elettroni interni è **molto più grande** della repulsione tra elettroni che occupano lo stesso livello: i due elettroni 1s del litio tolgono al 2s la maggior parte dell'attrazione.

### La penetrazione

Dalle **distribuzioni radiali di probabilità**: l'orbitale 2p ha il picco più alto più vicino al nucleo, quindi sembra "più piccolo", mentre il 2s ha il picco più spostato in fuori. Ma il 2s ha anche un **piccolo picco molto vicino al nucleo**: c'è una probabilità, anche piccola, di trovarsi lì.

:::definizione
**Penetrazione**: un orbitale "penetra" quando c'è una possibilità, anche piccola, che l'elettrone si trovi vicino al nucleo. La penetrazione **aumenta l'attrazione nucleare e diminuisce la schermatura**: l'elettrone in quell'orbitale ha energia più bassa. Per questo **2s è più stabile di 2p**, e così 3s < 3p < 3d.
:::

Per il terzo elettrone del litio la scelta è quindi **2s e non 2p**. Nei sistemi polielettronici l'energia dipende da **n e da l**, non più solo da n: è il diagramma dei sottolivelli diviso in gradini, non più "per livelli". Più in alto i fenomeni si complicano: per esempio il **4s è più stabile del 3d**, e il prof darà criteri pratici per l'ordine.

## L'ordine di riempimento degli orbitali

Gli orbitali occupati hanno energia che **cresce con la somma n + l**; a parità di n + l è più stabile quello con **n più basso**.

| Orbitale | 1s | 2s | 2p | 3s | 3p | 4s | 3d | 4p | 5s | 4d | 5p | 6s | 4f | 5d |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| n + l | 1 | 2 | 3 | 3 | 4 | 4 | 5 | 5 | 5 | 6 | 6 | 6 | 7 | 7 |

Ordine: **1s < 2s < 2p < 3s < 3p < 4s < 3d < 4p < 5s < 4d < 5p < 6s < 4f < 5d …** Per esempio 2p (n + l = 3) e 3s (3): vince 2p, che ha n più basso. 4s (4) viene prima di 3d (5). Il 5s va messo addirittura prima del 4d.

:::disegna
Lo schema mnemonico: i sottolivelli in righe (1s · 2s 2p · 3s 3p 3d · 4s 4p 4d 4f · 5s…) e una **freccia diagonale dall'alto a destra verso il basso a sinistra** che li attraversa in ordine di riempimento. Ridisegnarlo a mano.
:::

## La configurazione elettronica

La **configurazione elettronica** dice come sono distribuiti gli elettroni tra gli orbitali. Si scrive per esempio **1s¹**: il **1** è il numero quantico principale n, la **s** è il sottolivello (l = 0), l'**apice** è il numero di elettroni nel sottolivello. Si può rappresentare anche con un **diagramma a orbitali**: un riquadro per ogni orbitale e una freccia per ogni elettrone, su o giù a seconda dello spin.

### Aufbau, Pauli e Hund

:::definizione
- **Principio di Aufbau** ("costruzione"): gli elettroni si collocano negli orbitali a **energia più bassa** disponibili, in ordine, via via.
- **Principio di Pauli**: al massimo due elettroni per orbitale, con spin opposto.
- **Regola di Hund**: in un sottolivello la disposizione più stabile è quella con il **maggior numero di spin paralleli**: gli elettroni occupano **orbitali diversi** della stessa energia, tutti con lo stesso spin, prima di appaiarsi. Mettere due elettroni nello stesso orbitale produce un po' di schermatura reciproca, anche se hanno spin opposto.
:::

Il prof ricorda che nei libri la regola di Hund si trova spesso come "**massimizzazione dello spin totale**": tre elettroni con spin parallelo danno 3 × ½, mentre due appaiati danno spin totale zero.

:::ndr
In aula "outbound" e "Humbert": sono **Aufbau** e **Hund**.
:::

### Da H a Ne

| Atomo | Z | Configurazione | Nota |
| --- | --- | --- | --- |
| H | 1 | 1s¹ | |
| He | 2 | 1s² | il secondo elettrone entra nello stesso orbitale 1s, con spin opposto |
| Li | 3 | 1s² 2s¹ | il terzo va in 2s (penetra di più) |
| Be | 4 | 1s² 2s² | |
| B | 5 | 1s² 2s² 2p¹ | |
| C | 6 | 1s² 2s² 2p² | il sesto elettrone va in un altro orbitale 2p, non con il primo |
| N | 7 | 1s² 2s² 2p³ | tre elettroni in tre orbitali 2p, spin paralleli |
| O | 8 | 1s² 2s² 2p⁴ | l'ottavo si appaia a uno dei precedenti |
| F | 9 | 1s² 2s² 2p⁵ | |
| Ne | 10 | 1s² 2s² 2p⁶ | completa il sottolivello 2p |

Il prof non ha scritto la configurazione di Ne: "ora non ci scrivo", guardate la tavola periodica.

## La tavola periodica a blocchi

La tavola periodica è fatta in modo da **rispettare l'ordine di riempimento**: non è un caso che il primo periodo abbia 2 elementi e il secondo 8 (2s + 2p: 2 + 6). Il **sodio** inizia la terza riga perché il suo undicesimo elettrone va in 3s.

| Blocco | Colonne | Perché |
| --- | --- | --- |
| **s** | 2 | capienza del sottolivello s: 2 |
| **p** | 6 | capienza del sottolivello p: 6 |
| **d** | 10 | capienza del sottolivello d: 10 (metalli di transizione) |
| **f** | 14 | capienza del sottolivello f: 14 (lantanoidi e attinoidi, "incastrati" in basso) |

Sulla tavola, dopo 3s e 3p si riempie **4s**, e solo dopo 3d e 4p; poi 5s, 4d, 5p, 6s e così via, seguendo la linea del periodo, non per livello. Gli elementi dell'**ultima colonna** sono i **gas nobili**: hanno una configurazione completa, con i livelli energetici chiusi.

:::esame{etichetta="La tavola muta"}
All'esame verrà data una **tavola periodica muta**, senza nomi: non va saputa a memoria, ma bisogna saperla **leggere** (periodo, blocco, quanti elettroni, come si riempie). Il prof lo ripete: "non vi chiederò di saperla a memoria, ma di interagire con lei".
:::

**Configurazione abbreviata.** Il nucleo dei livelli già completi si sostituisce con il **gas nobile precedente** tra parentesi quadre: Mg = [Ne]3s², Sr = [Kr]5s² (nell'audio il gas nobile si sente male), C = [He]2s²2p². Gli esempi sono del prof.

## Esercizi fatti in aula

**Configurazione del magnesio (Z = 12).** 12 elettroni, terzo periodo: 1s² 2s² 2p⁶ 3s², cioè **[Ne]3s²** (2 + 2 + 6 + 2 = 12). Gli ultimi due elettroni stanno in 3s.

**Numeri quantici dell'ultimo elettrone del cloro (Z = 17).** 1s² 2s² 2p⁶ 3s² 3p⁵: l'ultimo va in **3p**, quindi **n = 3, l = 1**. Il valore di m<sub>l</sub> (−1, 0, +1) e quello di m<sub>s</sub> (±½) dipendono da come si disegna il diagramma, cioè da quale posizione si assegna all'elettrone: la slide li dà come valori possibili.

**Quali numeri quantici sono uguali per i tre elettroni 3p di 1s² 2s² 2p⁶ 3s² 3p³?** L'atomo è il **fosforo** (15 elettroni, 5 di valenza, terzo periodo). Con la regola di Hund i tre elettroni stanno in tre orbitali diversi con spin parallelo: sono uguali **n = 3**, **l = 1** e **m<sub>s</sub> = +½** (o −½ per tutti); **m<sub>l</sub> è diverso**: −1, 0 e +1.

**Perché esiste 3d ma non 2d?** Perché l va da 0 a n − 1: per n = 2 al massimo l = 1; per n = 3 si arriva a l = 2.

**Quanti elettroni s ci sono nel silicio (Z = 14)?** 1s² 2s² 2p⁶ 3s² 3p²: **6** elettroni s. È l'esercizio 7.64: gli altri due punti, che non sentiamo nell'audio, li ricavo dalle slide: gli elettroni p di N sono **3** (2p³) e gli elettroni 3d di S sono **0**. La lezione si è fermata qui.

## Cationi, anioni e specie isoelettroniche

:::definizione
**Catione**: specie che ha **perso** elettroni (più protoni che elettroni). **Anione**: specie che ha **acquistato** elettroni, e che riesce a tollerarli senza destabilizzarsi troppo. Le specie stabili sono quelle che assumono la configurazione esterna di un **gas nobile**.
:::

- **Cationi.** Si tolgono sempre gli elettroni **più esterni**: togliere uno interno costerebbe molta più energia. Na [Ne]3s¹ → Na<sup>+</sup> [Ne]; Ca [Ar]4s² → Ca<sup>2+</sup> [Ar]; Al [Ne]3s²3p¹ → Al<sup>3+</sup> [Ne]. Il magnesio si trova nei composti sempre come **Mg<sup>2+</sup>**, perché si perdono entrambi gli elettroni di valenza.
- **Anioni.** H [1s¹] → H<sup>−</sup> 1s² = [He]; F 1s²2s²2p⁵ → F<sup>−</sup> = [Ne]; O 1s²2s²2p⁴ → O<sup>2−</sup> = [Ne] (da qui il numero di ossidazione −2); N 1s²2s²2p³ → N<sup>3−</sup> = [Ne]. **H<sup>2−</sup>** non esiste: il secondo elettrone dovrebbe andare nel secondo livello per un atomo con un solo protone, cosa proibitiva. Anche F<sup>2−</sup> non esiste.
- La regola del gas nobile **non è universale**: ci sono atomi con più di un catione possibile (+2, +3…), mentre per gli elementi del primo e del secondo periodo funziona bene.

:::ndr
In aula "Mg<sup>+</sup> non esiste": nei composti si trova solo Mg<sup>2+</sup>, ma Mg<sup>+</sup> esiste in fase gassosa. Per il calcio il prof dice "la configurazione del gas nobile che lo precede, elio": è **[Ar]**, come sulla slide.
:::

:::nota
Il magnesio è uno dei **elementi più abbondanti della crosta terrestre**, e quasi tutti i suoi composti sono ionici, con Mg<sup>2+</sup>: un buon esempio di perché un geologo deve conoscere queste configurazioni.
:::

:::definizione
**Specie isoelettroniche**: specie con lo **stesso numero di elettroni**. Na<sup>+</sup>, Mg<sup>2+</sup>, Al<sup>3+</sup>, F<sup>−</sup>, O<sup>2−</sup>, N<sup>3−</sup> hanno tutte 10 elettroni e sono isoelettroniche con **Ne**. L'atomo neutro isoelettronico con H<sup>−</sup> (1s², 2 elettroni) è **He**, l'unico gas nobile con due elettroni.
:::

## Elettroni interni, esterni e di valenza

Gli elettroni **interni** (o di core) sono quelli del gas nobile precedente; quelli **esterni** stanno sul livello con n più alto. Nel cloro (1s² 2s² 2p⁶ 3s² 3p⁵) gli interni sono i primi **10** e gli esterni **7**; sono questi ultimi, di norma, gli elettroni di **valenza**, quelli che formano i composti: per il fosforo sono 5. Gli interni schermano l'interazione degli esterni con il nucleo.

## Da fare

- [ ] Scrivere la configurazione completa e abbreviata degli elementi da H ad Ar, con il diagramma a orbitali per C, N e O.
- [ ] Ridisegnare lo schema diagonale e provare a ricostruire l'ordine di riempimento fino a 6s.
- [ ] Per ogni elemento di una tavola periodica muta riconoscere periodo, blocco e numero di elettroni.
- [ ] Rifare gli esercizi: ultimo elettrone di Cl, tre elettroni 3p di P, elettroni s di Si, e le slide 7.64, 7.82 (elettroni spaiati) e 7.85 (numeri quantici di Mg).
- [ ] Continuare con i nomi e i simboli degli elementi 1–30, 35–38, 47, 53–56, 78, 79.
