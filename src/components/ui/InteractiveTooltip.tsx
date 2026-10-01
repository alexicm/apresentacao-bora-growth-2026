"use client";

import { useCallback, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

type TipState = { x: number; y: number; content: ReactNode; placement: "top" | "bottom" } | null;

/**
 * Tooltip ancorado a um elemento, posicionado dentro da raiz do slide.
 * Uso:
 *   const tip = useTooltip(scope);
 *   <button onMouseEnter={(e) => tip.show(e.currentTarget, "texto")} onMouseLeave={tip.hide}
 *           onFocus={(e) => tip.show(e.currentTarget, "texto")} onBlur={tip.hide} />
 *   <InteractiveTooltip state={tip.state} />
 * Regra de acessibilidade: nada essencial pode existir só no tooltip.
 */
export function useTooltip(rootRef: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<TipState>(null);
  const show = useCallback(
    (anchor: Element, content: ReactNode, placement: "top" | "bottom" = "top") => {
      const root = rootRef.current;
      if (!root) return;
      const r = anchor.getBoundingClientRect();
      const rr = root.getBoundingClientRect();
      setState({ x: r.left + r.width / 2 - rr.left, y: (placement === "top" ? r.top : r.bottom) - rr.top, content, placement });
    },
    [rootRef],
  );
  const hide = useCallback(() => setState(null), []);
  return { state, show, hide };
}

export function InteractiveTooltip({ state, className }: { state: TipState; className?: string }) {
  if (!state) return null;
  return (
    <div
      role="tooltip"
      className={cn("tip", state.placement === "top" ? "tip--top" : "tip--bottom", className)}
      style={{ left: state.x, top: state.y }}
    >
      {state.content}
    </div>
  );
}
