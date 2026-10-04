import { useEffect, useState } from "react";

// L'occhiello della Home, come in Minerva: «DOMENICA 4 OTTOBRE 2026 · 02.14.07»,
// ora italiana, aggiornato ogni secondo.
function formatta(d: Date) {
  const data = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" }).format(d).toUpperCase();
  const ora = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Rome" }).format(d).replaceAll(":", ".");
  return `${data} · ${ora}`;
}

export function Orologio({ className }: { className?: string }) {
  const [adesso, setAdesso] = useState<Date | null>(null);
  useEffect(() => {
    setAdesso(new Date());
    const id = setInterval(() => setAdesso(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <p className={className}>{adesso ? formatta(adesso) : " "}</p>;
}
