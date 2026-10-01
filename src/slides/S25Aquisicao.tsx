"use client";

import { useState } from "react";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/25-frente-aquisicao";
import { fmtInt } from "@/lib/format";
import { draw, fade, pop, rise } from "@/lib/motion";
import { cn, r2, seeded } from "@/lib/utils";
import { FrontFrame, revealBriefStep, revealFront, showVisual } from "./FrontFrame";
import styles from "./S25Aquisicao.module.css";

// ── Funil de pontos (viewBox 1200×340): cada ponto é uma pessoa do treino de sábado ──────────
const VB_W = 1200;
const STATION_X = [100, 300, 500, 700, 900, 1100] as const;
const TRACK_Y = 128;
const CLUSTER_Y = 236;
const SPACING = 6.6;
const DOT_R = 3.3;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** Ritmo do fluxo: duração de cada salto entre estações e respiro entre saltos. */
const HOP = 0.28;
const PAUSE = 0.04;

type Pt = { x: number; y: number };
type FunnelDot = { fate: number; path: Pt[]; start: number };

const slotPoint = (slot: number, station: number): Pt => {
  const radius = SPACING * Math.sqrt(slot + 0.5);
  const angle = slot * GOLDEN;
  return { x: r2(STATION_X[station] + radius * Math.cos(angle)), y: r2(CLUSTER_Y + radius * Math.sin(angle)) };
};

/** `reach[k]` pessoas chegam à estação k. Determinístico: mesmo desenho no servidor e no cliente. */
function buildFunnel(reach: readonly number[]): FunnelDot[] {
  const n = reach[0];
  const last = reach.length - 1;
  const rnd = seeded(23);
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const dots: FunnelDot[] = Array.from({ length: n }, () => ({ fate: 0, path: [], start: 0 }));
  order.forEach((id, rank) => {
    let fate = 0;
    for (let k = last; k >= 0; k--) {
      if (rank < reach[k]) {
        fate = k;
        break;
      }
    }
    dots[id].fate = fate;
  });
  const key = dots.map(() => rnd());
  for (let k = 0; k <= last; k++) {
    const here = dots.map((d, id) => ({ d, id })).filter(({ d }) => d.fate >= k);
    // Quem fica nesta estação ocupa o miolo do aglomerado; quem segue sai pela borda.
    here.sort((a, b) => Number(a.d.fate > k) - Number(b.d.fate > k) || key[a.id] - key[b.id]);
    here.forEach(({ d }, slot) => {
      d.path[k] = slotPoint(slot, k);
    });
  }
  dots.forEach((d, id) => {
    // Quem vai mais longe sai antes: o fluxo inteiro se resolve em ~2 s.
    d.start = r2(((last - d.fate) / last) * 0.45 + key[id] * 0.18);
  });
  return dots;
}

const DOTS = buildFunnel(copy.funnelReach);
const LAST = copy.funnelReach.length - 1;
const COACH = DOTS.find((d) => d.fate === LAST) ?? DOTS[0];
const arrival = (d: FunnelDot, k: number) => d.start + (k - 1) * (HOP + PAUSE) + HOP;

const fill = (template: string, vars: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
const pct = (v: number) => `${v}%`;
const plain = (v: number) => String(v);

/** Contador ligado à timeline (anda para frente e para trás com ela). */
function countUp(tl: gsap.core.Timeline, el: Element | undefined, to: number, at: number, duration: number, color: string) {
  if (!el) return;
  const o = { v: 0 };
  tl.to(o, { v: to, duration, ease: "none", onUpdate: () => void (el.textContent = fmtInt(o.v)) }, at);
  tl.to(el, { color, duration: 0.3, ease: "power1.out" }, at);
}

/**
 * Frente 2 · Aquisição. s0 as sete ações · s1 o funil de um treino aberto (ilustrativo) ·
 * s2 o simulador do BORA OPEN · s3 e s4 as fichas de BORA OPEN e BORA CAPTAINS.
 */
export function AquisicaoSlide() {
  const { index } = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";
  const [participants, setParticipants] = useState(80);
  const [sessions, setSessions] = useState(4);
  const [returning, setReturning] = useState(40);
  const [challenge, setChallenge] = useState(10);
  const [conversion, setConversion] = useState(15);

  // Modelo: capacidade fixa por treino. Quem volta já tem BORA ID; quem chega pela 1ª vez ganha um.
  const checkins = participants * sessions;
  const community = (checkins * returning) / 100;
  const ids = checkins - community;
  const challenges = (community * challenge) / 100;
  const coaching = (challenges * conversion) / 100;

  const { scope } = useStepTimeline(
    ({ step, q, reduced }) => {
      const dotEls = q('[data-a="dot"]');
      const counters = q('[data-a="count"]');
      const tokens = getComputedStyle(q('[data-a="funnel"]')[0] ?? document.documentElement);
      const C = {
        fg: tokens.getPropertyValue("--text-primary").trim() || "#0a0a0a",
        intent: tokens.getPropertyValue("--brand-deep").trim() || "#5c6e00",
        brand: tokens.getPropertyValue("--brand").trim() || "#ceff00",
        ink: tokens.getPropertyValue("--brand-ink").trim() || "#0a0d00",
      };
      const colorAt = (fate: number) => (fate >= LAST ? C.brand : fate >= 3 ? C.intent : C.fg);

      step(0, (tl) => revealFront(tl, q));

      // Passo 1: as 80 pessoas do treino chegam; todos ganham um BORA ID, poucos seguem até o Coaching.
      step(1, (tl) => {
        const t = showVisual(tl, q, flow, reduced);
        rise(tl, q('[data-a="flow-head"]'), t, { y: 10, duration: 0.6 });
        draw(tl, q('[data-a="track"]'), t, { duration: 1 });
        pop(tl, q('[data-a="node"]'), t + 0.1, { stagger: 0.06, duration: 0.5 });
        rise(tl, q('[data-a="count"], [data-a="st-text"]'), t + 0.15, { stagger: 0.02, y: 10, duration: 0.6 });
        fade(tl, dotEls, t + 0.3, { duration: 0.5, stagger: { each: 0.004, from: "random" } });
        countUp(tl, counters[0], copy.funnelReach[0], t + 0.3, 0.6, C.fg);

        const f0 = t + 0.95;
        if (reduced) {
          DOTS.forEach((d, i) => {
            const end = d.path[d.fate];
            tl.set(dotEls[i], { x: end.x - d.path[0].x, y: end.y - d.path[0].y, fill: colorAt(d.fate), opacity: d.fate === 1 ? 0.5 : 1 }, f0);
          });
        } else {
          DOTS.forEach((d, i) => {
            for (let k = 1; k <= d.fate; k++) {
              const vars: gsap.TweenVars = { x: d.path[k].x - d.path[0].x, y: d.path[k].y - d.path[0].y, duration: HOP, ease: "power2.inOut" };
              if (k === 1) vars.fill = C.fg;
              if (k === 3) vars.fill = C.intent;
              if (k === LAST) Object.assign(vars, { fill: C.brand, stroke: C.ink, scale: 1.5, transformOrigin: "50% 50%" });
              tl.to(dotEls[i], vars, f0 + d.start + (k - 1) * (HOP + PAUSE));
            }
            // Só o BORA ID: não voltou (ainda). O ponto esmaece.
            if (d.fate === 1) tl.to(dotEls[i], { opacity: 0.5, duration: 0.5, ease: "power1.out" }, f0 + arrival(d, 1) + 0.15);
          });
        }
        for (let k = 1; k <= LAST; k++) {
          const times = DOTS.filter((d) => d.fate >= k).map((d) => arrival(d, k));
          const first = reduced ? 0 : Math.min(...times) - HOP * 0.4;
          const span = reduced ? 0.3 : Math.max(0.2, Math.max(...times) - first);
          countUp(tl, counters[k], copy.funnelReach[k], f0 + first, span, C.fg);
        }
        const coachAt = f0 + (reduced ? 0.1 : arrival(COACH, LAST));
        const coachNode = q('[data-a="node"]')[LAST];
        if (coachNode) tl.to(coachNode, { fill: C.brand, duration: 0.35, ease: "power1.out" }, coachAt - 0.1);
        pop(tl, q('[data-a="coach-glow"]'), coachAt - 0.12, { duration: 0.45 });
        pop(tl, q('[data-a="coach-ring"]'), coachAt - 0.08, { duration: 0.45 });
        rise(tl, q('[data-a="funnel-foot"] > *'), coachAt + 0.1, { y: 10, stagger: 0.1 });
      });

      // Passo 2: o simulador.
      step(2, (tl) => {
        if (!flow) tl.to(q('[data-a="scene-funnel"]'), { autoAlpha: 0, y: reduced ? 0 : -18, duration: 0.45, ease: "power2.in" }, 0);
        tl.from(q('[data-a="scene-sim"]'), { autoAlpha: 0, y: reduced ? 0 : 24, duration: 0.8, ease: "bora" }, flow ? 0 : 0.35);
        rise(tl, q('[data-a="sim-in"]'), 0.55, { stagger: 0.05, y: 10 });
        rise(tl, q('[data-a="sim-out"]'), 0.7, { stagger: 0.08, y: 12 });
        fade(tl, q('[data-a="sim-year"]'), 1.1);
      });

      step(3, (tl) => revealBriefStep(tl, q, 0, { flow }));
      step(4, (tl) => revealBriefStep(tl, q, 1, { flow }));
    },
    [flow],
  );

  const outputs = [
    { key: "ids", value: ids, label: copy.sim.outputs.ids.label, hint: copy.sim.outputs.ids.hint },
    { key: "community", value: community, label: copy.sim.outputs.community.label, hint: copy.sim.outputs.community.hint },
    { key: "challenges", value: challenges, label: copy.sim.outputs.challenges.label, hint: fill(copy.sim.outputs.challenges.hint, { pct: pct(challenge) }) },
    { key: "coaching", value: coaching, label: copy.sim.outputs.coaching.label, hint: fill(copy.sim.outputs.coaching.hint, { pct: pct(conversion) }) },
  ];

  return (
    <FrontFrame scope={scope} index={index} copy={copy}>
      <div className={styles.scenes}>
        {/* Cena 1: funil de pontos */}
        <section data-a="scene-funnel" className={styles.scene} aria-label={copy.example.label}>
          <div data-a="flow-head" className={styles.flowHead}>
            <span className="t-label text-fg-2">{copy.example.label}</span>
            <Tag kind="example" />
            <Tag kind="illustrative" />
            <span className={styles.funnelLegend}>
              {copy.example.where} · {copy.example.facts} · {copy.funnelLegend}
            </span>
          </div>
          <div className={styles.funnelBox}>
            <div data-a="funnel" className={styles.funnel}>
              <svg viewBox={`0 0 ${VB_W} 340`} className={styles.funnelSvg} aria-hidden="true" focusable="false">
                <line data-a="track" className={styles.track} x1={STATION_X[0]} y1={TRACK_Y} x2={STATION_X[LAST]} y2={TRACK_Y} />
                <circle data-a="coach-glow" className={styles.coachGlow} cx={STATION_X[LAST]} cy={TRACK_Y} r={16} />
                {STATION_X.map((x, i) => (
                  <circle key={x} data-a="node" className={styles.node} cx={x} cy={TRACK_Y} r={i === LAST ? 7.5 : 5.5} />
                ))}
                <g data-a="dots">
                  {DOTS.map((d, i) => (
                    <circle key={i} data-a="dot" className={styles.dot} cx={d.path[0].x} cy={d.path[0].y} r={DOT_R} />
                  ))}
                </g>
                <circle data-a="coach-ring" className={styles.coachRing} cx={COACH.path[LAST].x} cy={COACH.path[LAST].y} r={11} />
              </svg>
              {copy.flow.map((s, i) => (
                <div key={s.label} className={styles.station} style={{ left: `${(STATION_X[i] / VB_W) * 100 - 100 / 12}%` }}>
                  <span data-a="count" className={styles.count}>
                    0
                  </span>
                  <span data-a="st-text" className={styles.stLabel}>
                    {s.label}
                  </span>
                  <span data-a="st-text" className={styles.stCaption}>
                    {s.caption}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div data-a="funnel-foot" className={styles.funnelFoot}>
            <p className={styles.funnelCaption}>
              <Emphasis text={copy.funnelCaption} />
            </p>
            <p className={styles.funnelNote}>{copy.funnelNote}</p>
          </div>
        </section>

        {/* Cena 2: simulador */}
        <section data-a="scene-sim" className={styles.scene}>
          <SimPanel title={copy.sim.title} note={copy.sim.note}>
            <div className={styles.simGrid}>
              <div className={styles.sliders}>
                <div data-a="sim-in">
                  <Slider label={copy.sim.inputs.participants} value={participants} min={20} max={300} step={10} onChange={setParticipants} format={fmtInt} />
                </div>
                <div data-a="sim-in">
                  <Slider label={copy.sim.inputs.sessions} value={sessions} min={1} max={12} onChange={setSessions} format={plain} />
                </div>
                <div data-a="sim-in">
                  <Slider label={copy.sim.inputs.returning} value={returning} min={10} max={80} step={5} onChange={setReturning} format={pct} />
                </div>
                <div data-a="sim-in">
                  <Slider label={copy.sim.inputs.challenge} value={challenge} min={2} max={30} onChange={setChallenge} format={pct} />
                </div>
                <div data-a="sim-in">
                  <Slider label={copy.sim.inputs.conversion} value={conversion} min={5} max={40} onChange={setConversion} format={pct} />
                </div>
                <p data-a="sim-in" className={styles.checkins}>
                  {fill(copy.sim.checkins, { p: fmtInt(participants), t: sessions, n: fmtInt(checkins) })}
                </p>
              </div>
              <div className={styles.results}>
                <ol className={styles.chain}>
                  {outputs.map((o, i) => (
                    <SimLink key={o.key} last={i === outputs.length - 1} value={o.value} label={o.label} hint={o.hint} arrow={copy.sim.arrow} />
                  ))}
                </ol>
                <p data-a="sim-year" className={styles.yearly}>
                  <Emphasis text={fill(copy.sim.yearly, { n: fmtInt(coaching * 12) })} />
                </p>
              </div>
            </div>
          </SimPanel>
        </section>
      </div>
    </FrontFrame>
  );
}

function SimLink({ value, label, hint, last, arrow }: { value: number; label: string; hint: string; last: boolean; arrow: string }) {
  return (
    <>
      <li data-a="sim-out" className={cn(styles.link, last && styles.linkAccent)}>
        <Stat value={value} label={label} format={fmtInt} accent={last} size={last ? "lg" : "md"} />
        <span className={styles.hint}>{hint}</span>
      </li>
      {!last && (
        <li className={styles.arrow} aria-hidden="true">
          {arrow}
        </li>
      )}
    </>
  );
}
