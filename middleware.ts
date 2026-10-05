// Il cancello del sito su Vercel (Routing Middleware): gira prima di ogni
// richiesta, file statici compresi. Regole in src/lib/accesso.ts.
//   POST /accesso  → controlla la chiave, mette il cookie, torna dove si era
//   il resto       → passa, oppure porta alla pagina d'accesso
// Di solito il cookie lo mette già la pagina /accesso dal browser; il POST
// serve solo se JavaScript è spento. Non gira né in locale né su GitHub Pages.
import { next } from "@vercel/functions";
import { COOKIE_CHIAVE, decidi, impronta, impronte, livelloDa, ritornoSicuro, type Livello } from "./src/lib/accesso";

export const config = {
  // Tutto, anche /_astro (dentro ci sono le figure delle lezioni): la pagina
  // d'accesso ha gli stili scritti dentro e non ne ha bisogno.
  matcher: "/:path*",
};

const UN_ANNO = 60 * 60 * 24 * 365;

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
  const tabella = impronte(process.env);

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
  if (decisione.tipo === "passa") return next({ headers: { "X-Robots-Tag": "noindex, nofollow" } });
  if (decisione.tipo === "vai") return vai(decisione.dove, request);
  const da = url.pathname + url.search;
  return vai(`/accesso?${decisione.motivo === "serve-appunti" ? "serve=appunti&" : ""}da=${encodeURIComponent(da)}`, request);
}
