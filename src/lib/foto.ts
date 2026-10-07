// Le foto del campionario: l'originale per il riconoscimento a tutto schermo,
// la miniatura (640 px, scripts/miniature.ts) per riquadri e mosaici.
export const miniatura = (file: string) => file.replace("/campionario/", "/campionario/mini/");

/** Il campione del giorno: un indice che cambia ogni giorno e salta tra le categorie. */
export function indiceDelGiorno(giorno: number, n: number): number {
  // Un passo primo che non divide n: scorre tutti i campioni senza ripetersi, e due
  // giorni di fila non cadono quasi mai nella stessa famiglia (l'elenco è per categoria).
  const passo = [61, 59, 53, 47, 43, 41].find((p) => n % p !== 0) ?? 1;
  return (giorno * passo) % n;
}

/** Giorni dal 1970 secondo la data italiana (non UTC: dopo la mezzanotte cambia). */
export function giornoItaliano(adesso = new Date()): number {
  const [a, m, g] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(adesso).split("-").map(Number);
  return Math.floor(Date.UTC(a, m - 1, g) / 86400000);
}
