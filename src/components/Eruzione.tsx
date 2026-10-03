import { useEffect, useRef } from "react";

// L'eruzione di fine quiz (sopra l'80%): lapilli di lava su un canvas a
// schermo intero, due secondi e sparisce. Niente librerie.
export function Eruzione({ attiva }: { attiva: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!attiva || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colori = ["#ffb347", "#e2561f", "#ffd27a", "#c2491d", "#fff1cf"];
    const lapilli = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 60,
      y: innerHeight * 0.55,
      vx: (Math.random() - 0.5) * 9,
      vy: -(9 + Math.random() * 11),
      r: 1.5 + Math.random() * 3.5,
      c: colori[Math.floor(Math.random() * colori.length)],
      vita: 1,
    }));
    let inizio = performance.now();
    let id = 0;
    const passo = (t: number) => {
      const dt = Math.min(0.04, (t - inizio) / 1000);
      inizio = t;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let vivi = 0;
      for (const p of lapilli) {
        if (p.vita <= 0) continue;
        p.vy += 22 * dt;
        p.x += p.vx * 60 * dt * 0.6;
        p.y += p.vy * 60 * dt * 0.6;
        p.vita -= dt * 0.45;
        if (p.y > innerHeight) p.vita = 0;
        if (p.vita <= 0) continue;
        vivi++;
        ctx.globalAlpha = Math.max(0, p.vita);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (vivi > 0) id = requestAnimationFrame(passo);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, [attiva]);

  if (!attiva) return null;
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-40" style={{ width: "100vw", height: "100vh" }} aria-hidden="true" />;
}
