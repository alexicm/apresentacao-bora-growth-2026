"use client";

import type { Project } from "@/content/projects";
import { cn } from "@/lib/utils";
import { stageOf } from "@/content/projects";

type Props = {
  project: Project;
  /** Posição em % da caixa do grafo. */
  x: number;
  y: number;
  caption?: string;
  /** De que lado do marcador fica o rótulo — sempre para fora do núcleo, para os raios não cruzarem o texto. */
  side?: "top" | "bottom" | "right";
  selected?: boolean;
  dimmed?: boolean;
  onSelect?: (id: Project["id"]) => void;
  onHover?: (id: Project["id"] | null) => void;
};

/**
 * Nó de produto no mapa da rede. O marcador indica o estágio no pack:
 * rodando = volt sólido · backlog = contorno · ideia = anel tracejado · produto atual (Coaching) = sólido neutro.
 * É um botão: clique/Enter abre o painel do produto.
 */
export function ProjectNode({ project, x, y, caption, side = "bottom", selected, dimmed, onSelect, onHover }: Props) {
  return (
    <button
      type="button"
      data-node={project.id}
      data-side={side}
      className={cn("net-node", `net-node--${project.id === "coaching" ? "current" : (stageOf(project.id) ?? "ideia")}`, selected && "is-selected", dimmed && "is-dimmed")}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={() => onSelect?.(project.id)}
      onMouseEnter={() => onHover?.(project.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(project.id)}
      onBlur={() => onHover?.(null)}
      aria-pressed={selected}
      aria-label={`${project.name}: ${project.summary}`}
    >
      {/* O GSAP anima o botão, .net-node-dot e .net-node-text; os efeitos de hover/dim (CSS) ficam
          em elementos internos para não disputar as mesmas propriedades. */}
      <span className="net-node-inner">
        <span className="net-node-dot" aria-hidden="true">
          <span className="net-node-dot-core" />
        </span>
        <span className="net-node-text" aria-hidden="true">
          <span className="net-node-name">{project.short}</span>
          {caption && <span className="net-node-caption">{caption}</span>}
        </span>
      </span>
    </button>
  );
}
