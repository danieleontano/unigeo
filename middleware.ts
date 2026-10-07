// Il cancello del sito su Vercel (Routing Middleware): gira prima di ogni
// richiesta, file statici compresi. Regole in src/lib/accesso.ts.
//   POST /accesso  → controlla la chiave, mette il cookie, torna dove si era
//   il resto       → passa, oppure porta alla pagina d'accesso
// Di solito il cookie lo mette già la pagina /accesso dal browser; il POST
// serve solo se JavaScript è spento. Non gira né in locale né su GitHub Pages.
import { COOKIE_CHIAVE, decidi, impronta, impronte, livelloDa, ritornoSicuro, type Livello } from "./src/lib/accesso.js";

// Le importazioni locali vanno scritte con «.js»: Vercel non impacchetta il
// middleware in un file solo, e senza estensione il modulo non si trova
// (05/10/2026: 500 MIDDLEWARE_INVOCATION_FAILED su ogni pagina).
export const config = {
  runtime: "nodejs",
  // Tutto, anche /_astro (dentro ci sono le figure delle lezioni): la pagina
  // d'accesso ha gli stili scritti dentro e non ne ha bisogno.
  matcher: "/:path*",
};

const UN_ANNO = 60 * 60 * 24 * 365;

// «Prosegui»: come next() di @vercel/functions, scritto qui. Il pacchetto
// intero non va importato: il suo indice tira dentro moduli che nel runtime
// dei middleware non si caricano (05/10/2026: MIDDLEWARE_INVOCATION_FAILED).
function prosegui(extra: Record<string, string> = {}): Response {
  // Le pagine date a chi ha la chiave sono private e legate al cookie: nessuna
  // cache condivisa (CDN, provider, proxy) deve riproporle a chi non ce l'ha.
  const headers = new Headers({ "Cache-Control": "private, max-age=0, must-revalidate", Vary: "Cookie", ...extra });
  headers.set("x-middleware-next", "1");
  return new Response(null, { headers });
}

// Non HttpOnly: lo legge anche il controllo nel browser (Base.astro).
function cookie(nome: string, valore: string, durata: number) {
  return `${nome}=${valore}; Path=/; Max-Age=${durata}; SameSite=Lax; Secure`;
}

function leggiCookie(request: Request, nome: string): string | undefined {
  const riga = request.headers.get("cookie") ?? "";
  for (const parte of riga.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nome) return v.join("=");
  }
  return undefined;
}

function vai(dove: string, request: Request, cookies: string[] = []): Response {
  const headers = new Headers({ Location: new URL(dove, request.url).toString(), "Cache-Control": "no-store" });
  for (const c of cookies) headers.append("Set-Cookie", c);
  return new Response(null, { status: 303, headers });
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const tabella = impronte(env);

  if (url.pathname === "/accesso" && request.method === "POST") {
    const dati = await request.formData().catch(() => null);
    const chiave = String(dati?.get("chiave") ?? "");
    const da = ritornoSicuro(String(dati?.get("da") ?? ""));
    const valore = await impronta(chiave);
    const livello = livelloDa(valore, tabella);
    if (!livello) return vai(`/accesso?errore=1${da !== "/" ? `&da=${encodeURIComponent(da)}` : ""}`, request);
    return vai(livello === "strumenti" && decidi(da, livello).tipo !== "passa" ? "/strumenti" : da, request, [cookie(COOKIE_CHIAVE, valore, UN_ANNO)]);
  }

  const livello: Livello | null = livelloDa(leggiCookie(request, COOKIE_CHIAVE), tabella);
  const decisione = decidi(url.pathname, livello);
  if (decisione.tipo === "passa") return prosegui({ "X-Robots-Tag": "noindex, nofollow" });
  if (decisione.tipo === "vai") return vai(decisione.dove, request);
  const da = url.pathname + url.search;
  return vai(`/accesso?${decisione.motivo === "serve-appunti" ? "serve=appunti&" : ""}da=${encodeURIComponent(da)}`, request);
}
