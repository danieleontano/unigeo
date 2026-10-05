// Funzione Vercel: i terremoti RSNI in diretta. Il feed non si può leggere
// dal browser (niente CORS), quindi passa da qui; la CDN di Vercel tiene la
// risposta 5 minuti, così la RSNI riceve al massimo una richiesta ogni 5
// minuti qualunque sia il traffico. La mappa (/terremoti) la chiama e
// aggiunge gli eventi arrivati dopo l'ultima pubblicazione.
// «.js» anche se il file è .ts: Vercel compila senza impacchettare, e in
// Node un import senza estensione non si trova.
import { leggiFeed } from "../src/lib/rsni.js";

export async function GET(): Promise<Response> {
  const eventi = await leggiFeed();
  if (!eventi) return Response.json({ errore: "Feed RSNI non raggiungibile" }, { status: 502, headers: { "Cache-Control": "s-maxage=60" } });
  return Response.json(
    { letto: new Date().toISOString(), eventi },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=900" } },
  );
}
