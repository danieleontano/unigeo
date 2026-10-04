// Service worker di UniGeo: una volta visitata, una pagina si riapre anche
// senza rete (treno, aula senza campo). Niente libreria: poche righe.
//  - asset con hash (/_astro/, font, icone, pdf): cache first, non cambiano mai;
//  - pagine HTML: network first, con la copia in cache come ripiego.
const VERSIONE = "unigeo-v3";

self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((chiavi) => Promise.all(chiavi.filter((k) => k !== VERSIONE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

const immutabile = (url) => /\/_astro\/|\/fonts?\/|\.(woff2?|svg|png|jpe?g|pdf|webmanifest)$/.test(url.pathname);

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (immutabile(url)) {
    e.respondWith(
      caches.open(VERSIONE).then(async (cache) => {
        const inCache = await cache.match(request);
        if (inCache) return inCache;
        const risposta = await fetch(request);
        if (risposta.ok) cache.put(request, risposta.clone());
        return risposta;
      }),
    );
    return;
  }

  e.respondWith(
    caches.open(VERSIONE).then(async (cache) => {
      try {
        const risposta = await fetch(request);
        if (risposta.ok) cache.put(request, risposta.clone());
        return risposta;
      } catch {
        const inCache = await cache.match(request);
        if (inCache) return inCache;
        if (request.mode === "navigate") {
          // La home è la radice del service worker: /unigeo/ su Pages, / su Vercel.
          const home = await cache.match(self.registration.scope);
          if (home) return home;
        }
        return new Response("Sei senza rete e questa pagina non è ancora stata aperta.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }),
  );
});
