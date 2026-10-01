import { useMemo, type ReactNode } from "react";
import { cn, r2, seeded } from "@/lib/utils";
import styles from "./MarketExpansion.module.css";

/**
 * Mercado endereçável que se expande: um círculo pequeno (mercado tradicional) vira um círculo enorme
 * (mercado da corrida). Conceito fora de escala — nenhum número de mercado.
 *
 * Linguagem: ponto = corredor · volt = BORA / expansão · ponto volt em destaque = exemplo.
 * Alvos de animação (data-a): mk-big (círculo grande), mk-dot (corredores do mercado grande, com data-d = distância
 * normalizada ao ponto de tangência), mk-small + mk-sdot (mercado tradicional), mk-persona, mk-pulse,
 * mk-large, mk-small-label, mk-persona-label, mk-tag.
 * Para a expansão, anime mk-big com `scale: MARKET.scale, svgOrigin: MARKET.origin` (nasce do círculo pequeno).
 */

const SIZE = 600;
const CX = 300;
const CY = 300;
const R = 284;
const SR = 58;
const ANGLE = 135; // ponto de tangência: inferior esquerdo
const rad = (ANGLE * Math.PI) / 180;
const TX = r2(CX + R * Math.cos(rad));
const TY = r2(CY + R * Math.sin(rad));
const K = SR / R;
const SX = r2(TX + K * (CX - TX));
const SY = r2(TY + K * (CY - TY));
const PERSONA = { x: 146, y: 236 };

export const MARKET = { size: SIZE, origin: `${TX} ${TY}`, scale: K } as const;

type Rect = readonly [number, number, number, number];
const EXCLUDE: readonly Rect[] = [
  [168, 40, 432, 116], // rótulo do mercado grande
  [SX + SR + 4, SY - 34, SX + SR + 262, SY + 34], // rótulo do mercado tradicional
  [PERSONA.x - 16, PERSONA.y - 18, PERSONA.x + 168, PERSONA.y + 18], // exemplo + rótulo
];

type Dot = { x: number; y: number; d: number; big: boolean };

function makeDots(count: number, seed: number, box: Rect, inside: (x: number, y: number) => boolean, gap: number) {
  const rnd = seeded(seed);
  const out: Dot[] = [];
  const [x0, y0, x1, y1] = box;
  let guard = 0;
  while (out.length < count && guard++ < count * 60) {
    const x = x0 + rnd() * (x1 - x0);
    const y = y0 + rnd() * (y1 - y0);
    const big = rnd() < 0.08;
    if (!inside(x, y)) continue;
    if (out.some((p) => Math.hypot(p.x - x, p.y - y) < gap)) continue;
    out.push({ x: r2(x), y: r2(y), d: r2(Math.hypot(x - TX, y - TY) / (2 * R)), big });
  }
  return out;
}

type Label = { title: string; body: string };

type Props = {
  small: Label;
  large: Label;
  /** Status (ex.: <Tag kind="concept">…</Tag>) no canto superior esquerdo. */
  tag?: ReactNode;
  /** Rótulo curto ao lado do corredor em destaque (o exemplo). */
  personaLabel?: string;
  count?: number;
  seed?: number;
  className?: string;
};

export function MarketExpansion({ small, large, tag, personaLabel, count = 190, seed = 7, className }: Props) {
  const dots = useMemo(
    () =>
      makeDots(
        count,
        seed,
        [CX - R, CY - R, CX + R, CY + R],
        (x, y) =>
          Math.hypot(x - CX, y - CY) < R - 12 &&
          Math.hypot(x - SX, y - SY) > SR + 8 &&
          Math.hypot(x - PERSONA.x, y - PERSONA.y) > 16 &&
          !EXCLUDE.some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 && y < y1),
        15,
      ),
    [count, seed],
  );
  const smallDots = useMemo(
    () => makeDots(9, seed + 3, [SX - SR, SY - SR, SX + SR, SY + SR], (x, y) => Math.hypot(x - SX, y - SY) < SR - 12, 14),
    [seed],
  );

  const pct = (v: number) => `${r2((v / SIZE) * 100)}%`;

  return (
    <div className={cn(styles.market, className)}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg} aria-hidden="true" focusable="false">
        <circle data-a="mk-big" className={styles.big} cx={CX} cy={CY} r={R} vectorEffect="non-scaling-stroke" />
        <g>
          {dots.map((p, i) => (
            <circle key={i} data-a="mk-dot" data-d={p.d} className={styles.dot} cx={p.x} cy={p.y} r={p.big ? 2.9 : 2.1} />
          ))}
        </g>
        <circle data-a="mk-small" className={styles.small} cx={SX} cy={SY} r={SR} vectorEffect="non-scaling-stroke" />
        <g>
          {smallDots.map((p, i) => (
            <circle key={i} data-a="mk-sdot" className={styles.sdot} cx={p.x} cy={p.y} r={2.3} />
          ))}
        </g>
        <g data-a="mk-persona">
          <circle data-a="mk-pulse" className={styles.pulse} cx={PERSONA.x} cy={PERSONA.y} r={7} vectorEffect="non-scaling-stroke" />
          <circle className={styles.halo} cx={PERSONA.x} cy={PERSONA.y} r={11} vectorEffect="non-scaling-stroke" />
          <circle className={styles.persona} cx={PERSONA.x} cy={PERSONA.y} r={5} />
        </g>
      </svg>

      <div data-a="mk-large" className={cn(styles.label, styles.labelLarge)} style={{ left: "50%", top: pct(78) }}>
        <span className={styles.labelTitle}>{large.title}</span>
        <span className={styles.labelBodyLarge}>{large.body}</span>
      </div>
      <div data-a="mk-small-label" className={cn(styles.label, styles.labelSmall)} style={{ left: pct(SX + SR + 16), top: pct(SY) }}>
        <span className={styles.labelTitle}>{small.title}</span>
        <span className={styles.labelBody}>{small.body}</span>
      </div>
      {personaLabel && (
        <div data-a="mk-persona-label" className={styles.personaLabel} style={{ left: pct(PERSONA.x + 16), top: pct(PERSONA.y) }}>
          {personaLabel}
        </div>
      )}
      {tag && (
        <div data-a="mk-tag" className={styles.tag}>
          {tag}
        </div>
      )}
    </div>
  );
}
