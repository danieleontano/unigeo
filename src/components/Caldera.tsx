import { useIdratato, useStato } from "@/lib/stato";
import { oggiIso, riepilogoSettimana } from "@/lib/ripasso";

// La caldera: il vulcano in sezione del Taccuino. La camera magmatica si
// riempie con le domande fatte negli ultimi sette giorni (60 = piena);
// se l'ultimo quiz di oggi è andato sopra l'80%, erutta.
const OBIETTIVO = 60;

export function Caldera() {
  const stato = useStato();
  const idratato = useIdratato();
  const oggi = oggiIso();
  const sett = riepilogoSettimana(stato.history, oggi);
  const livello = Math.min(1, sett.domande / OBIETTIVO);
  const ultimo = stato.history.at(-1);
  const erutta = idratato && !!ultimo && ultimo.date === oggi && ultimo.total > 0 && ultimo.correct / ultimo.total >= 0.8;
  const h = 70 * (idratato ? livello : 0);

  return (
    <div className="relative mx-auto w-full max-w-xs select-none" aria-label={`Camera magmatica al ${Math.round(livello * 100)}%`}>
      <svg viewBox="0 0 240 220" className="w-full overflow-visible">
        <defs>
          <linearGradient id="lava-g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffb347" />
            <stop offset="1" stopColor="#c2491d" />
          </linearGradient>
          <clipPath id="camera-clip">
            <path d="M60 210 C 40 170, 60 130, 120 130 C 180 130, 200 170, 180 210 Z" />
          </clipPath>
          <filter id="bagliore-lava" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* bagliore dietro la camera */}
        <ellipse cx="120" cy="175" rx="70" ry="40" fill="#c9552a" opacity={0.08 + livello * 0.3} filter="url(#bagliore-lava)" />

        {/* il cono */}
        <path d="M0 150 L80 40 L100 40 L120 24 L140 40 L160 40 L240 150 Z" fill="#3a2d23" stroke="#8a765c" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M30 150 L95 60 L145 60 L210 150" fill="none" stroke="#6b5a48" strokeWidth="1" strokeDasharray="4 6" />
        {/* strati del cono, come in una sezione disegnata a mano */}
        <path d="M60 110 C 100 106, 140 114, 180 110 M44 132 C 90 128, 150 136, 196 132 M78 86 C 110 83, 130 89, 162 86" fill="none" stroke="#7a6752" strokeWidth="1" />
        <rect x="0" y="150" width="240" height="60" fill="#2a211a" />
        <path d="M0 150 H240" stroke="#8a765c" strokeWidth="1" />

        {/* camera magmatica */}
        <path d="M60 210 C 40 170, 60 130, 120 130 C 180 130, 200 170, 180 210 Z" fill="#14100d" stroke="#8a765c" strokeWidth="1.5" />
        <g clipPath="url(#camera-clip)">
          <rect x="30" y={210 - h} width="180" height={h} fill="url(#lava-g)" style={{ transition: "y 1.2s var(--ease-out-quint), height 1.2s var(--ease-out-quint)" }} />
          {h > 6 && <ellipse cx="120" cy={210 - h} rx="60" ry="4" fill="#ffd27a" opacity="0.6" />}
        </g>

        {/* condotto */}
        <path d="M112 130 L116 60 L124 60 L128 130" fill={livello > 0.5 ? "url(#lava-g)" : "#14100d"} stroke="#8a765c" strokeWidth="1" />
        <path d="M110 40 L130 40 L124 24 L116 24 Z" fill="#14100d" stroke="#8a765c" strokeWidth="1" />

        {/* eruzione */}
        {erutta && (
          <g className="eruzione">
            {Array.from({ length: 14 }).map((_, i) => (
              <circle
                key={i}
                cx={120}
                cy={28}
                r={2 + (i % 3)}
                fill={i % 2 ? "#ffb347" : "#e2561f"}
                style={{
                  animation: `lapillo 1.6s ${(i * 0.11).toFixed(2)}s ease-out infinite`,
                  ["--dx" as string]: `${(i - 7) * 9}px`,
                  ["--dy" as string]: `${-60 - (i % 5) * 14}px`,
                } as React.CSSProperties}
              />
            ))}
          </g>
        )}
      </svg>
      <style>{`@keyframes lapillo { 0% { transform: translate(0,0); opacity: 1 } 70% { opacity: .9 } 100% { transform: translate(var(--dx), calc(var(--dy) * -1 + 30px)); opacity: 0 } }
      .eruzione circle { transform-box: fill-box; transform-origin: center; }
      @media (prefers-reduced-motion: reduce) { .eruzione circle { animation: none !important } }`}</style>
      <p className="mt-1 text-center font-sans text-xs text-grafite">
        {idratato ? (
          <>
            <span className="display text-base font-semibold text-lava">{sett.domande}</span> domande questa settimana
            {sett.domande > 0 && <> · {Math.round(sett.quota * 100)}% corrette</>}
            {erutta && <> · <span className="font-semibold text-ocra">eruzione</span></>}
          </>
        ) : (
          " "
        )}
      </p>
    </div>
  );
}
