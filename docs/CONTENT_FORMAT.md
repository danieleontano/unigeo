# Formato dei contenuti

## Lezione: `content/<materia>/lezioni/<slug>.md`

```markdown
---
materia: geologia-1
numero: 5
data: 2026-10-02
titolo: Classificare le rocce magmatiche
docente: Michele Piazza
modulo: "Modulo 2 · Geologia stratigrafica"
dispense:
  - titolo: "3. Le rocce magmatiche"
    file: ../dispense/Geologia1-3_le_rocce_magmatiche_25_26.pdf
pdf: ../pdf/Geologia1_Lez05_2026-10-02.pdf
tag: [rocce magmatiche, streckeisen, classificazione]
---

## 01 · Una prima classificazione

Testo in Markdown normale. Tabelle in Markdown.

:::definizione
**Dunite**: roccia ultrafemica con olivina ≥ 90%.
:::

:::esame
Domanda tipica: la più grave delle Big Five è la numero 3, non la 5.
:::

:::disegna
Il diagramma di flusso del metodo.
:::

:::ndr
In aula la silice è stata data "dal 40 al 60%"; la scala standard è...
:::
```

I quattro blocchi `:::definizione`, `:::esame`, `:::disegna`, `:::ndr` (più
`:::nota`) vanno resi come riquadri colorati. Sono gli stessi riquadri degli
appunti PDF già prodotti: stessa gerarchia, così la conversione HTML → Markdown
è meccanica.

Conversione degli appunti esistenti: i file `template_appunti_*.html` hanno
sezioni `<section>` con `<h2>`, riquadri `<div class="box def|exam|draw|warn">`
e tabelle HTML. Uno script `scripts/html2md.py` (da scrivere, Python, usa
BeautifulSoup + markdownify) li converte in questo formato. Le immagini SVG
inline si salvano come file `.svg` accanto alla lezione e si linkano.

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
      "ref": "#05-in-aula-il-ragionamento-sui-campioni"
    },
    {
      "id": "q2",
      "tipo": "verofalso",
      "testo": "Nel diagramma di Streckeisen quarzo e feldspatoidi possono coesistere nella stessa roccia.",
      "corretta": false,
      "spiegazione": "Q e F si escludono: il 100% di Q è in cima, lo 0% sulla linea A–P.",
      "ref": "#03-il-protocollo-con-i-diagrammi-triangolari"
    },
    {
      "id": "q3",
      "tipo": "aperta",
      "testo": "Spiega perché un fuso che lascia cristallizzare quarzo era sovrassaturo in silice.",
      "soluzione": "Tutti i minerali hanno preso la silice che potevano mettere nel reticolo; quella avanzata ha cristallizzato come quarzo.",
      "ref": "#03-il-protocollo-con-i-diagrammi-triangolari"
    },
    {
      "id": "q4",
      "tipo": "abbinamento",
      "testo": "Abbina roccia e femico caratteristico.",
      "coppie": [["Diorite","anfibolo"],["Gabbro","pirosseno"],["Anortosite","quasi solo plagioclasio"]],
      "ref": "#03-il-protocollo-con-i-diagrammi-triangolari"
    }
  ]
}
```

Regole:
- 8–15 domande per lezione. Almeno 2 aperte: costringono a formulare.
- `ref` punta all'anchor del titolo `## ` della lezione (slugificato).
- Le domande le scrive Daniele con Claude in chat, dopo ogni lezione, insieme
  agli appunti. Scriverle è parte dello studio: l'app non le genera.

## Materia: `content/<materia>/materia.json`
```json
{ "slug": "geologia-1", "nome": "Geologia 1", "colore": "#B5552A", "icona": "pietrolina.svg",
  "docenti": ["Laura Federico", "Michele Piazza"], "esame": "unico congiunto, da giugno" }
```
