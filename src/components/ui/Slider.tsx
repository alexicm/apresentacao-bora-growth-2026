"use client";

import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  /** Formata o valor exibido (ex.: fmtPct). */
  format?: (v: number) => string;
  hint?: string;
  className?: string;
};

/** Premissa ajustável de uma simulação. Acessível por teclado (setas) e mouse. */
export function Slider({ label, value, min, max, step = 1, onChange, format = String, hint, className }: Props) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("slider", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[13px] font-medium text-fg-2">
          {label}
        </label>
        <output htmlFor={id} className="t-mono text-[14px] font-medium text-fg">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
        style={{ "--pct": `${pct}%` } as CSSProperties}
      />
      {hint && <p className="mt-1 text-[12px] text-fg-3">{hint}</p>}
    </div>
  );
}
