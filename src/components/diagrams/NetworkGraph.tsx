"use client";

import { PROJECTS, type ProjectId } from "@/content/projects";
import { cn, r2 } from "@/lib/utils";
import { ProjectNode } from "./ProjectNode";

/** Coordenadas no viewBox 1000×750 (a caixa do grafo tem a mesma proporção, 4:3). */
export type GraphNode = { id: ProjectId; x: number; y: number; side?: "top" | "bottom" | "right" };

type Props = {
  core: { x: number; y: number; label: string; caption: string };
  nodes: GraphNode[];
  selected: ProjectId | null;
  hovered: ProjectId | null;
  onSelect: (id: ProjectId) => void;
  onHover: (id: ProjectId | null) => void;
  className?: string;
};

const VB = { w: 1000, h: 750 };
const CORE_R = 78;

/** Curva entre dois produtos, arqueada para fora do centro (não atravessa o núcleo). */
function arc(a: GraphNode, b: GraphNode, cx: number, cy: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = mx - cx;
  const dy = my - cy;
  const len = Math.hypot(dx, dy) || 1;
  const push = 70 + 0.12 * Math.hypot(a.x - b.x, a.y - b.y);
  return `M${r2(a.x)} ${r2(a.y)} Q${r2(mx + (dx / len) * push)} ${r2(my + (dy / len) * push)} ${r2(b.x)} ${r2(b.y)}`;
}

/**
 * Mapa da BORA Network: núcleo (BORA OS) + produtos em órbita.
 * Raios (núcleo → produto) = todos compartilham a camada comum.
 * Conexões entre produtos ("alimenta") aparecem ao passar o mouse ou selecionar.
 * Alvos de animação: [data-a="core"], [data-spoke=id], [data-node=id], [data-a="orbit"].
 */
export function NetworkGraph({ core, nodes, selected, hovered, onSelect, onHover, className }: Props) {
  const focus = hovered ?? selected;
  const ids = new Set(nodes.map((n) => n.id));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const links = nodes.flatMap((n) =>
    PROJECTS[n.id].feeds.filter((f) => ids.has(f)).map((f) => ({ from: n.id, to: f })),
  );
  const related = new Set<ProjectId>();
  if (focus) {
    related.add(focus);
    for (const l of links) {
      if (l.from === focus) related.add(l.to);
      if (l.to === focus) related.add(l.from);
    }
  }

  return (
    <div className={cn("net", className)}>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="net-svg" aria-hidden="true">
        <defs>
          <radialGradient id="net-core-glow">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          data-a="orbit"
          cx={core.x}
          cy={core.y}
          rx={390}
          ry={300}
          className="net-orbit"
        />
        {nodes.map((n) => (
          <line
            key={n.id}
            data-spoke={n.id}
            x1={core.x}
            y1={core.y}
            x2={n.x}
            y2={n.y}
            className={cn("net-spoke", focus && (n.id === focus ? "is-on" : "is-off"))}
          />
        ))}
        {links.map((l) => {
          const on = focus && (l.from === focus || l.to === focus);
          return (
            <path
              key={`${l.from}-${l.to}`}
              d={arc(byId.get(l.from)!, byId.get(l.to)!, core.x, core.y)}
              className={cn("net-link", on && "is-on")}
            />
          );
        })}
        <g data-a="core">
          <circle cx={core.x} cy={core.y} r={CORE_R * 2.1} fill="url(#net-core-glow)" />
          <circle cx={core.x} cy={core.y} r={CORE_R} className="net-core" />
          <circle cx={core.x} cy={core.y} r={CORE_R - 10} className="net-core-inner" />
        </g>
        <g data-a="pulses" />
      </svg>

      <div data-a="core-label" className="net-core-label" style={{ left: `${(core.x / VB.w) * 100}%`, top: `${(core.y / VB.h) * 100}%` }}>
        <span className="net-core-name">{core.label}</span>
        <span className="net-core-caption">
          {core.caption.split("·").map((part) => (
            <span key={part} className="block">
              {part.trim()}
            </span>
          ))}
        </span>
      </div>

      {nodes.map((n) => (
        <ProjectNode
          key={n.id}
          project={PROJECTS[n.id]}
          x={(n.x / VB.w) * 100}
          y={(n.y / VB.h) * 100}
          caption={PROJECTS[n.id].pt}
          side={n.side ?? (n.y < core.y - 60 ? "top" : "bottom")}
          selected={selected === n.id}
          dimmed={Boolean(focus) && !related.has(n.id)}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </div>
  );
}
