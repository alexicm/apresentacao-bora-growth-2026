"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, type Ref } from "react";
import { fmtInt } from "@/lib/format";
import { Flip, gsap } from "@/lib/gsap";
import { motionPrefs } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import styles from "./Leaderboard.module.css";

export type LeaderboardRow = {
  id: string;
  name: string;
  total: number;
  /** Parte do total que veio de performance (segmento separado da barra). */
  perf: number;
  /** Variação de posição desde a rodada anterior (+ subiu, − caiu); `null` esconde. */
  delta: number | null;
};

export type LeaderboardHandle = {
  /** Grave as posições ANTES de mudar a ordem (ex.: antes de trocar a semana) — o Flip anima a partir delas. */
  capture: () => void;
};

type Props = {
  /** Linhas já ordenadas (1º lugar primeiro). */
  rows: readonly LeaderboardRow[];
  /** Valor que ocupa a barra inteira (mantenha fixo para as barras "crescerem" ao longo da temporada). */
  max: number;
  cols: { pos: string; company: string; points: string };
  leaderTag?: string;
  caption?: string;
  className?: string;
  ref?: Ref<LeaderboardHandle>;
};

/**
 * Classificação animada: as linhas trocam de lugar com GSAP Flip, as barras crescem e os pontos contam.
 * Respeita movimento reduzido (troca instantânea).
 */
export function Leaderboard({ rows, max, cols, leaderTag, caption, className, ref }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      capture: () => {
        const list = listRef.current;
        if (!list || motionPrefs.reduced) return;
        flipState.current = Flip.getState(list.querySelectorAll("[data-lb-row]"));
      },
    }),
    [],
  );

  const order = rows.map((r) => r.id).join("|");
  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    const list = listRef.current;
    if (!state || !list) return;
    const tween = Flip.from(state, {
      targets: list.querySelectorAll("[data-lb-row]"),
      duration: 0.75,
      ease: "power3.inOut",
      // Quem sobe passa por cima de quem desce.
      zIndex: 2,
    });
    return () => {
      tween.kill();
    };
  }, [order]);

  const anyPoints = rows.some((r) => r.total > 0);

  return (
    <div className={cn(styles.lb, className)}>
      <div className={cn(styles.head, "t-label text-fg-3")} aria-hidden="true">
        <span>{cols.pos}</span>
        <span />
        <span>{cols.company}</span>
        <span />
        <span className="justify-self-end">{cols.points}</span>
      </div>
      <div className={styles.body}>
        <ol className={cn(styles.ranks, "t-mono")} aria-hidden="true">
          {rows.map((r, i) => (
            <li key={i} data-leader={i === 0 && anyPoints ? "" : undefined}>
              {pad2(i + 1)}
            </li>
          ))}
        </ol>
        <ol ref={listRef} className={styles.list} aria-label={caption}>
          {rows.map((r, i) => {
            const base = Math.max(0, r.total - r.perf) / max;
            const perf = r.perf / max;
            const leader = i === 0 && anyPoints;
            return (
              <li key={r.id} data-lb-row="" data-leader={leader ? "" : undefined} className={styles.row}>
                <span className="sr-only">{i + 1}º</span>
                <span
                  className={cn(styles.delta, "t-mono")}
                  data-dir={r.delta == null || r.delta === 0 ? undefined : r.delta > 0 ? "up" : "down"}
                  aria-hidden="true"
                >
                  {r.delta == null ? "" : r.delta === 0 ? "=" : r.delta > 0 ? `▲${r.delta}` : `▼${-r.delta}`}
                </span>
                <span className={styles.name}>
                  <span className={styles.nameText}>{r.name}</span>
                  {leader && leaderTag && <span className={styles.leader}>{leaderTag}</span>}
                </span>
                <span className={styles.bar} aria-hidden="true">
                  <i className={cn(styles.seg, styles.base)} style={{ transform: `scaleX(${base})` }} />
                  <i
                    className={cn(styles.seg, styles.perf)}
                    style={{ transform: `translateX(calc(${base * 100}% + ${perf > 0 ? 2 : 0}px)) scaleX(${perf})` }}
                  />
                </span>
                <Count value={r.total} className={cn(styles.pts, "t-mono")} />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** Número que conta até o novo valor (sem re-render por quadro). */
function Count({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (motionPrefs.reduced) {
      shown.current = value;
      el.textContent = fmtInt(value);
      return;
    }
    const proxy = { v: shown.current };
    const tween = gsap.to(proxy, {
      v: value,
      duration: 0.7,
      ease: "power2.out",
      onUpdate: () => {
        shown.current = proxy.v;
        el.textContent = fmtInt(proxy.v);
      },
    });
    return () => {
      tween.kill();
    };
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {fmtInt(value)}
    </span>
  );
}
