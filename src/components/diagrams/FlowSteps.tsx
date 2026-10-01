import { Fragment } from "react";
import { cn } from "@/lib/utils";

type Step = { label: string; caption?: string };

type Props = {
  steps: readonly (Step | string)[];
  /** Destaca um passo (índice) em volt. */
  activeIndex?: number;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  className?: string;
};

/**
 * Fluxo linear de estações conectadas por setas (ex.: TREINO ABERTO → BORA ID → … → COACHING).
 * Alvos de animação: `.flow-step` (estação), `.flow-link` (conector; `transform-origin` à esquerda/topo),
 * `.flow-dot` (marcador da estação).
 */
export function FlowSteps({ steps, activeIndex, orientation = "horizontal", size = "md", className }: Props) {
  const items = steps.map((s) => (typeof s === "string" ? { label: s } : s));
  return (
    <ol className={cn("flow", `flow--${orientation}`, size === "sm" && "flow--sm", className)}>
      {items.map((s, i) => (
        <Fragment key={i}>
          {i > 0 && <li className="flow-link" aria-hidden="true" />}
          <li className={cn("flow-step", i === activeIndex && "is-active")}>
            <span className="flow-dot" aria-hidden="true" />
            <span className="flow-label">{s.label}</span>
            {s.caption && <span className="flow-caption">{s.caption}</span>}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
