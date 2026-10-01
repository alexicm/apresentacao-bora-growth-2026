import type { CSSProperties } from "react";
import { BoraShield } from "@/components/brand/BoraMark";
import { cn, r2 } from "@/lib/utils";
import styles from "./CityDemandMap.module.css";
import {
  AVENUE_PATHS,
  CELLS,
  COMPANIES,
  HUB,
  MAX_DOTS,
  OUTLINE_PATH,
  RING_PATH,
  SCATTER,
  SLOTS,
  VIEW,
  pct,
  type Pt,
} from "./cityDemandGeometry";

/** Quantos corredores cada capitão da história tem em cada fase (índices 0–2 = três primeiros capitães). */
export type StoryCounts = {
  open: readonly number[];
  grow: readonly number[];
  final: readonly number[];
};

/** Estado da camada de simulação (dirigida por React). */
export type SimView = {
  captains: number;
  dots: readonly number[];
  heat: readonly number[];
  above: readonly boolean[];
  companies: number;
  hub: Pt | null;
};

type Props = {
  story: StoryCounts;
  sim: SimView;
  hubLabel: string;
  ariaLabel: string;
  className?: string;
};

const STORY_SLOTS = [0, 1, 2] as const;
const STORY_COMPANIES = 2;
/** Corredores "em desafio": um a cada três (determinístico). */
const inChallenge = (i: number) => i % 3 === 1;

/**
 * Alvos de animação (data-a): outline, cell, avenue, ring-road, heat-{0..2}, above, halo, scatter,
 * dot (+ data-phase="open|grow|late", data-dx/dy), challenge, captain, company, co-link, hub, hub-pulse,
 * ripple, hood-{0..2}, hub-label, hub-mark, story (camada), sim (camada), sim-labels, sim-hub-pulse.
 */
export function CityDemandMap({ story, sim, hubLabel, ariaLabel, className }: Props) {
  return (
    <div className={cn(styles.box, className)} style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }} role="img" aria-label={ariaLabel}>
      <svg className={styles.svg} viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} aria-hidden="true" focusable="false">
        {/* ── Base ─────────────────────────────────────────── */}
        {CELLS.map((c) => (
          <path key={c.index} data-a="cell" className={styles.cell} d={c.d} />
        ))}
        <path data-a="outline" className={styles.outline} d={OUTLINE_PATH} />
        {AVENUE_PATHS.map((d, i) => (
          <path key={i} data-a="avenue" className={styles.avenue} d={d} />
        ))}
        <path data-a="ring-road" className={styles.avenue} d={RING_PATH} />

        {/* ── História (GSAP) ──────────────────────────────── */}
        <g data-a="story">
          {STORY_SLOTS.map((s) => (
            <path key={s} data-a={`heat-${s}`} className={styles.heat} d={CELLS[SLOTS[s].cell].d} />
          ))}
          {[0, 1].map((s) => (
            <path key={s} data-a="above" className={styles.above} d={CELLS[SLOTS[s].cell].d} />
          ))}
          {STORY_SLOTS.map((s) => (
            <circle key={s} data-a="halo" className={styles.halo} cx={SLOTS[s].at[0]} cy={SLOTS[s].at[1]} r={SLOTS[s].halo} />
          ))}
          {COMPANIES.slice(0, STORY_COMPANIES).map((c, i) => (
            <line
              key={i}
              data-a="co-link"
              className={styles.companyLink}
              x1={c.p[0]}
              y1={c.p[1]}
              x2={SLOTS[c.slot].at[0]}
              y2={SLOTS[c.slot].at[1]}
            />
          ))}
          {SCATTER.map((p, i) => (
            <circle key={i} data-a="scatter" className={styles.scatter} cx={p[0]} cy={p[1]} r={2.4} />
          ))}
          {STORY_SLOTS.map((s) =>
            SLOTS[s].dots.slice(0, story.final[s]).map((p, i) => {
              const phase = i < story.open[s] ? "open" : i < story.grow[s] ? "grow" : "late";
              const from = SLOTS[s].from[i];
              return (
                <circle
                  key={`${s}-${i}`}
                  data-a="dot"
                  data-phase={phase}
                  data-slot={s}
                  data-dx={r2(from[0] - p[0])}
                  data-dy={r2(from[1] - p[1])}
                  className={styles.dot}
                  cx={p[0]}
                  cy={p[1]}
                  r={2.9}
                />
              );
            }),
          )}
          {STORY_SLOTS.map((s) =>
            SLOTS[s].dots
              .slice(0, story.grow[s])
              .map((p, i) =>
                inChallenge(i) ? (
                  <circle key={`${s}-${i}`} data-a="challenge" className={styles.challenge} cx={p[0]} cy={p[1]} r={6} />
                ) : null,
              ),
          )}
          {COMPANIES.slice(0, STORY_COMPANIES).map((c, i) => (
            <rect key={i} data-a="company" className={styles.company} x={c.p[0] - 5.5} y={c.p[1] - 5.5} width={11} height={11} rx={1.5} />
          ))}
          {STORY_SLOTS.map((s) => (
            <circle key={s} data-a="ripple" className={styles.ripple} cx={SLOTS[s].at[0]} cy={SLOTS[s].at[1]} r={10} />
          ))}
          {STORY_SLOTS.map((s) => (
            <g key={s} data-a="captain">
              <circle className={styles.captainRing} cx={SLOTS[s].at[0]} cy={SLOTS[s].at[1]} r={9} />
              <circle className={styles.captainCore} cx={SLOTS[s].at[0]} cy={SLOTS[s].at[1]} r={3.4} />
            </g>
          ))}
          <g data-a="hub">
            <circle data-a="hub-pulse" className={styles.hubPulse} cx={HUB[0]} cy={HUB[1]} r={13} />
            <circle data-a="hub-pulse" className={styles.hubPulse} cx={HUB[0]} cy={HUB[1]} r={13} />
            <circle className={styles.hubCore} cx={HUB[0]} cy={HUB[1]} r={13} />
          </g>
        </g>

        {/* ── Simulação (React) ────────────────────────────── */}
        <g data-a="sim" className={styles.sim}>
          {SLOTS.map((slot, s) => {
            const on = s < sim.captains;
            const cell = CELLS[slot.cell];
            return (
              <g key={s}>
                <path className={styles.heat} d={cell.d} style={{ opacity: on ? sim.heat[s] : 0 }} />
                <path className={styles.above} d={cell.d} style={{ opacity: on && sim.above[s] ? 1 : 0 }} />
              </g>
            );
          })}
          {COMPANIES.map((c, i) => {
            const on = i < sim.companies && c.slot < sim.captains;
            return (
              <g key={i}>
                <line
                  className={styles.companyLink}
                  x1={c.p[0]}
                  y1={c.p[1]}
                  x2={SLOTS[c.slot].at[0]}
                  y2={SLOTS[c.slot].at[1]}
                  style={{ opacity: on ? 1 : 0 }}
                />
                <rect
                  className={styles.company}
                  x={c.p[0] - 5.5}
                  y={c.p[1] - 5.5}
                  width={11}
                  height={11}
                  rx={1.5}
                  style={{ opacity: on ? 1 : 0 }}
                />
              </g>
            );
          })}
          {SCATTER.map((p, i) => (
            <circle key={i} className={styles.scatter} cx={p[0]} cy={p[1]} r={2.4} />
          ))}
          {SLOTS.map((slot, s) =>
            slot.dots.slice(0, MAX_DOTS).map((p, i) => {
              const on = s < sim.captains && i < sim.dots[s];
              return (
                <g key={`${s}-${i}`} style={{ "--i": i } as CSSProperties}>
                  <circle className={styles.dot} cx={p[0]} cy={p[1]} r={2.9} style={{ opacity: on ? 1 : 0 }} />
                  {inChallenge(i) && <circle className={styles.challenge} cx={p[0]} cy={p[1]} r={6} style={{ opacity: on ? 1 : 0 }} />}
                </g>
              );
            }),
          )}
          {SLOTS.map((slot, s) => (
            <g key={s} className={styles.captain} style={{ opacity: s < sim.captains ? 1 : 0 }}>
              <circle className={styles.captainRing} cx={slot.at[0]} cy={slot.at[1]} r={9} />
              <circle className={styles.captainCore} cx={slot.at[0]} cy={slot.at[1]} r={3.4} />
            </g>
          ))}
          <g
            className={styles.simHub}
            style={{
              opacity: sim.hub ? 1 : 0,
              transform: `translate(${(sim.hub ?? HUB)[0] - HUB[0]}px, ${(sim.hub ?? HUB)[1] - HUB[1]}px)`,
            }}
          >
            <circle data-a="sim-hub-pulse" className={styles.hubPulse} cx={HUB[0]} cy={HUB[1]} r={13} />
            <circle className={styles.hubCore} cx={HUB[0]} cy={HUB[1]} r={13} />
          </g>
        </g>
      </svg>

      {/* Rótulos (história) */}
      {STORY_SLOTS.map((s) => (
        <span key={s} data-a={`hood-${s}`} className={cn(styles.label, styles.hood)} style={pct(SLOTS[s].at)}>
          {SLOTS[s].letter}
        </span>
      ))}
      <span data-a="hub-mark" className={styles.hubMark} style={pct(HUB)} aria-hidden="true">
        <BoraShield className="block h-auto w-full" title="" />
      </span>
      <span data-a="hub-label" className={cn(styles.label, styles.hubLabel)} style={pct(HUB)}>
        {hubLabel}
      </span>

      {/* Rótulos (simulação) */}
      <div data-a="sim-labels" className={styles.sim}>
        {SLOTS.map((slot, s) => (
          <span
            key={s}
            className={cn(styles.label, styles.hood, sim.above[s] && styles.hoodHot)}
            style={{ ...pct(slot.at), opacity: s < sim.captains ? 1 : 0 }}
          >
            {slot.letter}
          </span>
        ))}
        <span className={styles.label} style={{ ...pct(sim.hub ?? HUB), opacity: sim.hub ? 1 : 0 }}>
          <span className={styles.hubMark} style={{ left: 0, top: 0 }} aria-hidden="true">
            <BoraShield className="block h-auto w-full" title="" />
          </span>
          <span className={cn(styles.label, styles.hubLabel)} style={{ left: 0, top: 0 }}>
            {hubLabel}
          </span>
        </span>
      </div>
    </div>
  );
}
