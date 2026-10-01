import { cn } from "@/lib/utils";

/**
 * Brasão do clube fictício de exemplo (Sunset Run Club). Usa a cor própria do clube (--club),
 * propositalmente fora da paleta BORA: o clube continua sendo o clube.
 */
export function ClubCrest({ name, suffix, className }: { name: string; suffix: string; className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={cn("club-crest", className)} role="img" aria-label={`${name} ${suffix}`}>
      <circle cx="120" cy="120" r="116" fill="var(--bg-primary)" stroke="var(--club)" strokeWidth="2.5" />
      <circle cx="120" cy="120" r="104" fill="none" stroke="var(--club)" strokeOpacity="0.35" strokeWidth="1" />
      {/* Sol se pondo sobre o horizonte */}
      <clipPath id="crest-sun">
        <rect x="0" y="0" width="240" height="112" />
      </clipPath>
      <circle cx="120" cy="112" r="38" fill="var(--club)" clipPath="url(#crest-sun)" />
      {[120, 128, 136].map((y, i) => (
        <line key={y} x1={78 + i * 10} x2={162 - i * 10} y1={y} y2={y} stroke="var(--club)" strokeWidth="3" strokeLinecap="round" />
      ))}
      <text x="120" y="172" textAnchor="middle" fill="var(--text-primary)" fontFamily="var(--font-sans)" fontWeight="800" fontSize="30" letterSpacing="1">
        {name.toUpperCase()}
      </text>
      <text x="120" y="194" textAnchor="middle" fill="var(--club)" fontFamily="var(--font-sans)" fontWeight="600" fontSize="11" letterSpacing="5">
        {suffix.toUpperCase()}
      </text>
    </svg>
  );
}
