# Primo messaggio da incollare in Claude Code

Leggi CLAUDE.md e tutta la cartella docs/ prima di fare qualsiasi cosa.
Poi:
1. Riassumimi in 10 righe cosa hai capito del progetto e dei vincoli (niente DB,
   timebox di un weekend, contenuti da file).
2. Proponi la struttura del repo e il piano della Fase 1 come lista di commit,
   senza scrivere ancora codice. Aspetta il mio ok.
3. Dopo l'ok, procedi un commit alla volta. Alla fine di ogni passo dimmi come
   verificarlo io stesso (comando o pagina da aprire).

Vincoli che non si discutono: Astro statico, nessuna chiamata di rete a runtime,
tutto in italiano, mobile first. Gli script sono in Node/TypeScript (Python solo
se lo decide Daniele). Il repo sta in `C:\Studio`, fuori da Minerva. Prima di dire
«fatto» l'URL si prova dal telefono. Leggi anche docs/NOTE-DI-CODE.md: dove dice
cose diverse dalla roadmap, vince la nota. Se una cosa non è nella Fase 1 della roadmap,
non farla: segnala e vai avanti.

Nella cartella `materiale/html/` trovi gli appunti HTML di TUTTE le 10 lezioni
fatte finora (più il PDF di ciascuna in `materiale/`): il primo compito concreto
è lo script `scripts/html2md.ts` che li converte nel formato di
docs/CONTENT_FORMAT.md. È una migrazione una tantum: dalla prossima lezione il
Markdown arriva già pronto.
