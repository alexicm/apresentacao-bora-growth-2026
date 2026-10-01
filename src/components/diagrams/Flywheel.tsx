"use client";

import { StageDots } from "@/components/ui/StageTag";
import { r2 } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** O que move o estágio: uma ação rodando, no backlog ou ideia, o produto atual ou só um resultado. */
export type FlywheelKind = "rodando" | "backlog" | "ideia" | "atual" | "resultado";
export type FlywheelStage = { label: string; why: string; gear?: string; kind?: FlywheelKind };

type Props = {
  stages: readonly FlywheelStage[];
  starter: { label: string; caption: string };
  centerLabel: string;
  active: number | null;
  onActive: (i: number | null) => void;
  className?: string;
};

// Geometria (viewBox 1000×1000)
export const FW = { c: 500, r: 300, rl: 350 };
const GAP = 3.2; // graus livres ao redor de cada marcador

export const stageAngle = (i: number, n: number) => -90 + (i * 360) / n;
const pt = (deg: number, radius: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: r2(FW.c + Math.cos(a) * radius), y: r2(FW.c + Math.sin(a) * radius) };
};

/** Arco no sentido horário entre dois estágios, com folga nos marcadores. */
function arcPath(a0: number, a1: number) {
  const s = pt(a0 + GAP, FW.r);
  const e = pt(a1 - GAP, FW.r);
  return `M${s.x} ${s.y} A${FW.r} ${FW.r} 0 0 1 ${e.x} ${e.y}`;
}

/** Ponta de seta tangente ao círculo no fim do arco (sentido horário). */
function arrowPath(a1: number) {
  const deg = a1 - GAP;
  const p = pt(deg, FW.r);
  const rad = (deg * Math.PI) / 180;
  const tx = -Math.sin(rad);
  const ty = Math.cos(rad);
  const nx = Math.cos(rad);
  const ny = Math.sin(rad);
  const L = 11;
  const W = 6;
  const b = { x: p.x - tx * L, y: p.y - ty * L };
  return `M${r2(b.x + nx * W)} ${r2(b.y + ny * W)} L${p.x} ${p.y} L${r2(b.x - nx * W)} ${r2(b.y - ny * W)}`;
}

/**
 * Flywheel: estágios em círculo, arcos no sentido horário, rótulos para fora.
 * Cada marcador mostra o que move o estágio: volt sólido = ação rodando · anel tracejado = ideia ·
 * sólido neutro = produto atual · anel pequeno = resultado (consequência, não é ação).
 * Alvos de animação: [data-fw-arc=i], [data-fw-arrow=i], [data-fw-dot=i], [data-fw-label=i],
 * [data-a="fw-ring"] (anel que gira), [data-a="fw-comets"], [data-a="fw-starter"], [data-a="fw-center"].
 */
export function Flywheel({ stages, starter, centerLabel, active, onActive, className }: Props) {
  const n = stages.length;
  const prev = active === null ? null : (active - 1 + n) % n;
  const next = active === null ? null : (active + 1) % n;

  return (
    <div className={cn("fw", className)}>
      <svg viewBox="0 0 1000 1000" className="fw-svg" aria-hidden="true">
        {/* anel de marcações — é ele que "gira" */}
        <g data-a="fw-ring">
          <circle cx={FW.c} cy={FW.c} r={FW.r + 34} className="fw-ring" />
          {Array.from({ length: 72 }, (_, i) => {
            const a = i * 5;
            const p0 = pt(a, FW.r + 28);
            const p1 = pt(a, FW.r + (i % 6 === 0 ? 42 : 36));
            return <line key={i} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} className="fw-tick" />;
          })}
        </g>
        <circle cx={FW.c} cy={FW.c} r={FW.r} className="fw-ghost" />
        {stages.map((_, i) => {
          const a0 = stageAngle(i, n);
          const a1 = stageAngle(i + 1, n);
          const on = active !== null && (i === active || i === prev);
          return (
            <g key={i} className={cn("fw-seg", on && "is-on", active !== null && !on && "is-off")}>
              <path data-fw-arc={i} d={arcPath(a0, a1)} className="fw-arc" />
              <path data-fw-arrow={i} d={arrowPath(a1)} className="fw-arrow" />
            </g>
          );
        })}
        {/* partida: OPEN empurra a roda no primeiro estágio */}
        <g data-a="fw-starter">
          <path d={`M${FW.c - 250} ${FW.c - 384} C ${FW.c - 150} ${FW.c - 384}, ${FW.c - 60} ${FW.c - 360}, ${FW.c - 14} ${FW.c - FW.r - 10}`} className="fw-starter-line" />
        </g>
        <g data-a="fw-comets" />
      </svg>

      <div data-a="fw-center" className="fw-center">
        <span className="contours fw-contours" />
        <span className="fw-center-label">{centerLabel}</span>
      </div>

      <div data-a="fw-starter" className="fw-starter" style={{ left: `${((FW.c - 262) / 1000) * 100}%`, top: `${((FW.c - 384) / 1000) * 100}%` }}>
        <span className="fw-starter-pill">{starter.label}</span>
        <span className="fw-starter-caption">{starter.caption}</span>
      </div>

      {stages.map((s, i) => {
        const a = stageAngle(i, n);
        const d = pt(a, FW.r);
        const l = pt(a, FW.rl);
        const cos = Math.cos((a * Math.PI) / 180);
        // Só o estágio exatamente no topo/base centraliza; os vizinhos se alinham para fora (sem colisão).
        const align = cos > 0.12 ? "left" : cos < -0.12 ? "right" : Math.sin((a * Math.PI) / 180) < 0 ? "top" : "bottom";
        const state = i === active ? "is-active" : i === prev || i === next ? "is-near" : active !== null ? "is-off" : "";
        const kind = s.kind ?? "rodando";
        const stageKind = kind === "rodando" || kind === "backlog" || kind === "ideia" ? kind : null;
        return (
          <button
            key={i}
            type="button"
            className={cn("fw-stage", state)}
            onMouseEnter={() => onActive(i)}
            onMouseLeave={() => onActive(null)}
            onFocus={() => onActive(i)}
            onBlur={() => onActive(null)}
            aria-label={`${s.label}${s.gear ? ` (${s.gear})` : ""}: ${s.why}`}
          >
            <span data-fw-dot={i} className={cn("fw-dot", `fw-dot--${kind}`)} style={{ left: `${d.x / 10}%`, top: `${d.y / 10}%` }}>
              <span className="fw-dot-lit" />
            </span>
            <span data-fw-label={i} className={cn("fw-label", `fw-label--${align}`)} style={{ left: `${l.x / 10}%`, top: `${l.y / 10}%` }}>
              <span className="fw-label-index t-mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="fw-label-text">{s.label}</span>
              {s.gear && (
                <span className={cn("fw-label-gear", `fw-label-gear--${kind}`)}>
                  {stageKind && <StageDots stage={stageKind} />}
                  {s.gear}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
