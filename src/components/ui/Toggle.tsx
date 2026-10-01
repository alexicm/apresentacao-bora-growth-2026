"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
};

/**
 * Controle segmentado em pílula — mesmo desenho dos seletores do site da BORA
 * ("1 MODALIDADE | 2 MODALIDADES"). O indicador volt desliza até a opção ativa.
 */
export function Toggle<T extends string>({ options, value, onChange, label, className, size = "md" }: Props<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const el = root.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(value)}"]`);
      if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [value]);

  return (
    <div ref={rootRef} role="radiogroup" aria-label={label} className={cn("toggle", size === "sm" && "toggle--sm", className)}>
      {thumb && (
        <span
          aria-hidden="true"
          className="toggle-thumb"
          style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }}
        />
      )}
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          data-value={o.value}
          className={cn("toggle-option", o.value === value && "is-active")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
