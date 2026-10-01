import { useMemo } from "react";
import { r2, seeded } from "@/lib/utils";

/** Linguagem visual: ponto = um corredor · aglomerado = uma comunidade · núcleo volt = BORA. */
export type Cluster = { x: number; y: number; r: number; w?: number };

type Props = {
  clusters: Cluster[];
  count?: number;
  seed?: number;
  /** Fração de corredores que continua solta depois do agrupamento. */
  loose?: number;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Campo de pontos em SVG, determinístico (mesmo resultado no servidor e no cliente).
 * Cada ponto guarda em data-dx/data-dy o deslocamento até sua comunidade — use `gatherDots`.
 */
export function DotField({ clusters, count = 150, seed = 11, loose = 0.08, width = 1440, height = 900, className }: Props) {
  const groups = useMemo(() => {
    const rnd = seeded(seed);
    const weights = clusters.map((c) => c.w ?? c.r);
    const total = weights.reduce((a, b) => a + b, 0);
    const out: Array<Array<{ x: number; y: number; dx: number; dy: number; big: boolean }>> = clusters.map(() => []);
    for (let i = 0; i < count; i++) {
      const x = rnd() * width;
      const y = rnd() * height;
      let pick = rnd() * total;
      let ci = 0;
      while (ci < weights.length - 1 && pick > weights[ci]) pick -= weights[ci++];
      const c = clusters[ci];
      const a = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * c.r;
      const stays = rnd() < loose;
      out[ci].push({
        x: r2(x),
        y: r2(y),
        dx: stays ? 0 : r2(c.x + Math.cos(a) * d - x),
        dy: stays ? 0 : r2(c.y + Math.sin(a) * d - y),
        big: rnd() < 0.07,
      });
    }
    return out;
  }, [clusters, count, seed, loose, width, height]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {clusters.map((c, ci) => (
        <g key={ci} className="dot-cluster" data-cx={c.x} data-cy={c.y}>
          <circle className="dot-halo" cx={c.x} cy={c.y} r={c.r * 1.35} />
          {groups[ci].map((d, i) => (
            <circle key={i} className="dot" cx={d.x} cy={d.y} r={d.big ? 2.6 : 1.7} data-dx={d.dx} data-dy={d.dy} />
          ))}
          <circle className="dot-hub" cx={c.x} cy={c.y} r={3.4} />
        </g>
      ))}
    </svg>
  );
}

const num = (el: Element, key: string) => Number((el as SVGElement).dataset[key] ?? 0);

/** Anima os corredores soltos até suas comunidades. */
export function gatherDots(tl: gsap.core.Timeline, dots: Element[], pos: gsap.Position, duration = 1.8) {
  return tl.to(
    dots,
    {
      x: (_: number, el: Element) => num(el, "dx"),
      y: (_: number, el: Element) => num(el, "dy"),
      duration,
      ease: "power3.inOut",
      stagger: { each: 0.004, from: "random" },
    },
    pos,
  );
}
