"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { motionPrefs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  label: string;
  format?: (v: number) => string;
  /** Destaque volt (resultado principal da simulação). */
  accent?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Número de resultado com contagem animada ao mudar (sem re-render por frame). */
export function Stat({ value, label, format = (v) => String(Math.round(v)), accent, size = "md", className }: Props) {
  const numRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    if (motionPrefs.reduced) {
      shown.current = value;
      el.textContent = format(value);
      return;
    }
    const proxy = { v: shown.current };
    const tween = gsap.to(proxy, {
      v: value,
      duration: 0.7,
      ease: "power2.out",
      onUpdate: () => {
        shown.current = proxy.v;
        el.textContent = format(proxy.v);
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, format]);

  return (
    <div className={cn("stat", className)}>
      <span
        ref={numRef}
        className={cn(
          "t-mono block font-medium leading-none tracking-tight",
          size === "lg" ? "text-[clamp(34px,3.4vw,56px)]" : size === "md" ? "text-[clamp(24px,2.2vw,36px)]" : "text-[20px]",
          accent ? "text-brand-text" : "text-fg",
        )}
      >
        {format(value)}
      </span>
      <span className="mt-2 block text-[12.5px] leading-snug text-fg-3">{label}</span>
    </div>
  );
}
