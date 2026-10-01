"use client";

import { useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { motionPrefs } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * "Formato" de um programa no tempo, em linhas finas:
 *  program → começo e fim definidos (ex.: 8–12 semanas até um 5K)
 *  club    → toda semana, sem data de fim (renovações periódicas)
 *  race    → semanas até uma prova-alvo; depois, o próximo desafio (tracejado = opcional)
 *  league  → vários times em paralelo, 8 semanas, convergindo no evento final
 * Rótulos vêm do conteúdo (ordem por formato descrita em `labels`).
 */
export type ProgramShapeKind = "program" | "club" | "race" | "league";

type Props = {
  kind: ProgramShapeKind;
  /**
   * program: [início, meio da faixa, fim da faixa, marco final]
   * club:    [início, renovação, fim aberto]
   * race:    [início, duração, prova, depois]
   * league:  [times, duração, marco final]
   */
  labels: readonly string[];
  className?: string;
};

const W = 800;
const H = 84;
const X0 = 10;
const Y = 38;

const tickXs = (n: number, from: number, to: number) => Array.from({ length: n }, (_, i) => from + ((i + 1) / n) * (to - from));

export function ProgramShape({ kind, labels, className }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const shown = useRef(kind);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useGSAP(
    () => {
      if (shown.current === kind || motionPrefs.reduced) {
        shown.current = kind;
        return;
      }
      shown.current = kind;
      const q = gsap.utils.selector(ref);
      gsap.from(q(".ps-tick"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.45, ease: "bora", stagger: 0.022, delay: 0.15 });
      gsap.from(q(".ps-mark"), { scale: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "bora", delay: 0.45 });
    },
    { dependencies: [kind], scope: ref },
  );

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={cn("block h-auto w-full overflow-visible", className)} aria-hidden="true" focusable="false">
      {kind === "program" && <Program labels={labels} />}
      {kind === "club" && <Club labels={labels} uid={uid} />}
      {kind === "race" && <Race labels={labels} />}
      {kind === "league" && <League labels={labels} />}
    </svg>
  );
}

const S = {
  base: { stroke: "var(--border-strong)", strokeWidth: 1.5 },
  tick: { stroke: "var(--text-tertiary)", strokeWidth: 1.5 },
  soft: { stroke: "var(--text-quaternary)", strokeWidth: 1.5 },
  label: { fill: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: 12 },
  strong: { fill: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600 },
} as const;

function Start({ x = X0, y = Y }: { x?: number; y?: number }) {
  return <circle cx={x} cy={y} r={5} fill="var(--bg-primary)" stroke="var(--text-primary)" strokeWidth={1.5} />;
}

function Mark({ x, y = Y, r = 7 }: { x: number; y?: number; r?: number }) {
  return <circle className="ps-mark" cx={x} cy={y} r={r} fill="var(--brand)" stroke="var(--text-primary)" strokeWidth={1.5} />;
}

const never = () => false;

function Ticks({ xs, y = Y, h = 12, soft = never }: { xs: number[]; y?: number; h?: number; soft?: (i: number) => boolean }) {
  return (
    <>
      {xs.map((x, i) => (
        <line key={i} className="ps-tick" x1={x} x2={x} y1={y - h / 2} y2={y + h / 2} {...(soft(i) ? S.soft : S.tick)} />
      ))}
    </>
  );
}

function Program({ labels }: { labels: readonly string[] }) {
  const end = 600;
  const xs = tickXs(12, X0, end);
  return (
    <g>
      <line x1={X0} x2={xs[7]} y1={Y} y2={Y} {...S.base} />
      <line x1={xs[7]} x2={end} y1={Y} y2={Y} {...S.soft} strokeDasharray="3 5" />
      <Ticks xs={xs.slice(0, -1)} soft={(i) => i > 7} />
      <Start />
      <Mark x={end} />
      <text x={X0 - 4} y={Y + 30} {...S.label}>
        {labels[0]}
      </text>
      <text x={xs[7]} y={Y + 30} textAnchor="middle" {...S.label}>
        {labels[1]}
      </text>
      <text x={end} y={Y + 30} textAnchor="middle" {...S.label}>
        {labels[2]}
      </text>
      <text x={end + 18} y={Y + 4.5} {...S.strong}>
        {labels[3]}
      </text>
    </g>
  );
}

function Club({ labels, uid }: { labels: readonly string[]; uid: string }) {
  const end = W - 6;
  const xs = tickXs(22, X0, end - 20);
  const renewals = [7, 15];
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-fade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.7" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${uid}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect x="0" y="0" width={W} height={H} fill={`url(#${uid}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${uid}-mask)`}>
        <line x1={X0} x2={end} y1={Y} y2={Y} {...S.base} />
        <Ticks xs={xs} />
      </g>
      <Start />
      {renewals.map((i) => (
        <g key={i}>
          <circle className="ps-mark" cx={xs[i]} cy={Y} r={6} fill="var(--brand)" stroke="var(--text-primary)" strokeWidth={1.5} />
          <text x={xs[i]} y={Y + 30} textAnchor="middle" {...S.label}>
            {labels[1]}
          </text>
        </g>
      ))}
      <text x={X0 - 4} y={Y + 30} {...S.label}>
        {labels[0]}
      </text>
      <text x={end} y={Y - 16} textAnchor="end" {...S.strong}>
        {labels[2]}
      </text>
    </g>
  );
}

function Race({ labels }: { labels: readonly string[] }) {
  const race = 560;
  const xs = tickXs(14, X0, race);
  return (
    <g>
      <line x1={X0} x2={race} y1={Y} y2={Y} {...S.base} />
      <Ticks xs={xs.slice(0, -1)} />
      <line x1={race + 12} x2={W - 30} y1={Y} y2={Y} {...S.soft} strokeDasharray="3 5" />
      <circle cx={W - 24} cy={Y} r={4.5} fill="var(--bg-primary)" stroke="var(--text-quaternary)" strokeWidth={1.5} />
      <line className="ps-tick" x1={race} x2={race} y1={Y - 22} y2={Y + 14} stroke="var(--text-primary)" strokeWidth={1.5} />
      <Start />
      <Mark x={race} />
      <text x={X0 - 4} y={Y + 30} {...S.label}>
        {labels[0]}
      </text>
      <text x={race - 14} y={Y + 30} textAnchor="end" {...S.label}>
        {labels[1]}
      </text>
      <text x={race} y={Y - 30} textAnchor="middle" {...S.strong}>
        {labels[2]}
      </text>
      <text x={W - 24} y={Y + 30} textAnchor="end" {...S.label}>
        {labels[3]}
      </text>
    </g>
  );
}

function League({ labels }: { labels: readonly string[] }) {
  const lanes = [Y - 22, Y, Y + 22];
  const startX = X0 + 26;
  const endX = 520;
  const finalX = 600;
  const xs = tickXs(8, startX, endX);
  return (
    <g>
      {lanes.map((y, li) => (
        <g key={li}>
          {[0, 7, 14].map((dx) => (
            <circle key={dx} cx={X0 - 2 + dx} cy={y} r={2.6} fill="var(--text-primary)" />
          ))}
          <line x1={startX} x2={endX} y1={y} y2={y} {...S.base} />
          <Ticks xs={xs} y={y} h={9} />
          <path d={`M ${endX} ${y} C ${endX + 46} ${y}, ${finalX - 40} ${Y}, ${finalX - 8} ${Y}`} fill="none" {...S.base} />
        </g>
      ))}
      <Mark x={finalX} r={8} />
      <text x={finalX + 20} y={Y + 4.5} {...S.strong}>
        {labels[2]}
      </text>
      <text x={X0 - 4} y={Y + 44} {...S.label}>
        {labels[0]}
      </text>
      <text x={(startX + endX) / 2 + 60} y={Y + 44} textAnchor="middle" {...S.label}>
        {labels[1]}
      </text>
    </g>
  );
}
