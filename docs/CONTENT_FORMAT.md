# Formato dei contenuti

## Lezione: `content/<materia>/lezioni/<slug>.md`

Slug del file: `lezNN-AAAA-MM-GG-<titolo slugificato>` (es.
`lez05-2026-10-02-classificare-le-rocce-magmatiche.md`). Le figure stanno
accanto, con lo stesso prefisso: `lez05-…-fig1.svg`.

```markdown
---
materia: geologia-1
numero: 5
data: 2026-10-02
titolo: "Classificare le rocce magmatiche"
docente: "Michele Piazza"
modulo: "Modulo 2 · Geologia stratigrafica"          # solo dove il corso ha moduli
fonte: "Appunti dalla registrazione audio e dalle slide «3. Le rocce magmatiche»"
nota: "Le note [ndr] sono precisazioni mie. I primi minuti mancano dalla registrazione."
pdf: /pdf/geologia-1/lez05-2026-10-02-classificare-le-rocce-magmatiche.pdf   # facoltativo
dispense:                                             # facoltativo
  - titolo: "3. Le rocce magmatiche"
    file: /dispense/geologia-1/3-le-rocce-magmatiche.pdf
tag: [rocce magmatiche, streckeisen, classificazione] # facoltativo
---

## Una prima classificazione

*Una riga in corsivo subito sotto il titolo è l'attacco della sezione (il «lead» degli HTML).*

Testo in Markdown normale. Tabelle in Markdown (GFM). Apici con HTML: <sup>18</sup>O.
I punti incerti dell'audio si segnano con (?).

:::definizione
**Dunite**: roccia ultrafemica con olivina ≥ 90%.
:::

:::esame{etichetta="Errore classico"}
Domanda tipica: la più grave delle Big Five è la numero 3, non la 5.
:::

:::disegna
Il diagramma di flusso del metodo.
:::

:::ndr
In aula la silice è stata data «dal 40 al 60%»; la scala standard è un'altra.
:::

:::nota{etichetta="Consiglio pratico"}
Una nota del docente o di metodo che non è né definizione né esame.
:::

![Didascalia della figura: va nell'alt, il sito la mostra sotto.](./lez05-2026-10-02-classificare-le-rocce-magmatiche-fig1.svg)

- [ ] Cose da fare (ex «checklist»): lista di spunte GFM.
```

Regole del formato:
- **I titoli `##` NON portano il numero** («## Una prima classificazione», non
  «## 01 · Una prima classificazione»): il numero lo mette il sito. Così
  l'anchor è pulito e il `ref` dei quiz è `#una-prima-classificazione`.
- **Anchor dei titoli** = `github-slugger` sul testo del titolo (minuscole,
  spazi → trattini, punteggiatura via). È lo stesso algoritmo che usa Astro:
  il `ref` di un quiz si calcola così e la build lo verifica.
- Cinque riquadri: `:::definizione`, `:::esame`, `:::disegna`, `:::ndr`,
  `:::nota`. L'etichetta predefinita è il nome stesso (Definizione, All'esame,
  Da disegnare, Ndr, Nota); una diversa si passa con `{etichetta="…"}`.
  Sono gli stessi riquadri degli appunti PDF già prodotti.
- Le figure sono file `.svg` accanto alla lezione, inserite come immagine
  Markdown; la didascalia va nell'alt. Senza alt resta un'immagine nuda.
- Niente HTML a blocchi (div, table): tutto quello che serve esiste in
  Markdown. Inline sono ammessi solo `<sup>` e `<sub>`.
- Lo stato dei quiz e del ripasso NON sta nel Markdown: è nel browser.

Conversione degli appunti esistenti (fatta il 02/10/2026): `scripts/html2md.ts`
(Node, `node-html-parser` + `turndown`) ha convertito i 10 HTML di
`materiale/html/`; il rapporto è in `materiale/RAPPORTO-CONVERSIONE.md`. Da
qui in poi il Markdown arriva pronto da Claude chat in questo formato.

## Quiz: `content/<materia>/quiz/<slug>.json`

Stesso slug della lezione. Schema:

```json
{
  "lezione": "geologia-1/lez05-2026-10-02-classificare-rocce-magmatiche",
  "domande": [
    {
      "id": "q1",
      "tipo": "scelta",
      "testo": "In una roccia olocristallina vedi quarzo, plagioclasio bianco allotriomorfo e feldspati alcalini colorati in prevalenza. Che roccia è?",
      "opzioni": ["Granodiorite", "Granito", "Tonalite", "Diorite"],
      "corretta": 1,
      "spiegazione": "Il quarzo visibile porta nel triangolo superiore; la prevalenza degli alcalini sul plagioclasio esclude granodiorite e tonalite.",
      "ref": "#in-aula-il-ragionamento-sui-campioni"
    },
    {
      "id": "q2",
      "tipo": "verofalso",
      "testo": "Nel diagramma di Streckeisen quarzo e feldspatoidi possono coesistere nella stessa roccia.",
      "corretta": false,
      "spiegazione": "Q e F si escludono: il 100% di Q è in cima, lo 0% sulla linea A–P.",
      "ref": "#il-protocollo-con-i-diagrammi-triangolari"
    },
    {
      "id": "q3",
      "tipo": "aperta",
      "testo": "Spiega perché un fuso che lascia cristallizzare quarzo era sovrassaturo in silice.",
      "soluzione": "Tutti i minerali hanno preso la silice che potevano mettere nel reticolo; quella avanzata ha cristallizzato come quarzo.",
      "ref": "#il-protocollo-con-i-diagrammi-triangolari"
    },
    {
      "id": "q4",
      "tipo": "abbinamento",
      "testo": "Abbina roccia e femico caratteristico.",
      "coppie": [["Diorite","anfibolo"],["Gabbro","pirosseno"],["Anortosite","quasi solo plagioclasio"]],
      "ref": "#il-protocollo-con-i-diagrammi-triangolari"
    }
  ]
}
```

Regole:
- 8–15 domande per lezione. Almeno 2 aperte: costringono a formulare.
- `ref` punta all'anchor di un titolo `##` o `###` della lezione: `#` +
  `github-slugger` del testo del titolo (senza numero). La build fallisce se
  un `ref` non esiste nella lezione.
- `lezione` è l'id «materia/slug» e il file del quiz ha lo stesso nome del
  file della lezione.
- Le domande le scrive Daniele con Claude in chat, dopo ogni lezione, insieme
  agli appunti. Scriverle è parte dello studio: l'app non le genera.

## Materia: `content/<materia>/materia.json`
```json
{ "slug": "geologia-1", "nome": "Geologia 1", "colore": "#B5552A", "icona": "geologia-1.svg",
  "docenti": ["Laura Federico", "Michele Piazza"],
  "moduli": ["Modulo 1 · Geologia strutturale", "Modulo 2 · Geologia stratigrafica"],
  "esame": "Unico per i due moduli, pratica (3 campioni) poi orale. Appelli da giugno." }
```
