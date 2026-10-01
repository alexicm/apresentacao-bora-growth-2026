"use client";

import { useState } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { revealHeader, revealHighlights, SectionHeader } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Emphasis, SplitHeadline } from "@/components/ui/SplitHeadline";
import { Stat } from "@/components/ui/Stat";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/05-open";
import { fmtInt } from "@/lib/format";
import { draw, fade, pop, rise, unmask } from "@/lib/motion";
import { cn, r2, seeded } from "@/lib/utils";
import styles from "./S05Open.module.css";

// ── Funil de pontos (viewBox 1200×340): cada ponto é uma pessoa do treino de sábado ──────────
const VB_W = 1200;
const STATION_X = [100, 300, 500, 700, 900, 1100] as const;
const TRACK_Y = 128;
const CLUSTER_Y = 236;
const SPACING = 6.6;
const DOT_R = 3.3;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** Ritmo do fluxo: duração de cada salto entre estações e respiro entre saltos. */
const HOP = 0.34;
const PAUSE = 0.05;

type Pt = { x: number; y: number };
type FunnelDot = { fate: number; path: Pt[]; enter: Pt; start: number };

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
  const dots: FunnelDot[] = Array.from({ length: n }, () => ({ fate: 0, path: [], enter: { x: 0, y: 0 }, start: 0 }));
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
    d.enter = { x: r2(-(150 + rnd() * 240)), y: r2((rnd() - 0.5) * 70) };
    // Quem vai mais longe sai antes: o passo inteiro se resolve em ~2,2s.
    d.start = r2(((last - d.fate) / last) * 0.55 + key[id] * 0.22);
  });
  return dots;
}

const DOTS = buildFunnel(copy.funnelReach);
const LAST = copy.funnelReach.length - 1;
const COACH = DOTS.find((d) => d.fate === LAST) ?? DOTS[0];
const arrival = (d: FunnelDot, k: number) => d.start + (k - 1) * (HOP + PAUSE) + HOP;

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
const pct = (v: number) => `${v}%`;
const plain = (v: number) => String(v);

/** Contador ligado à timeline (anda para frente e para trás com ela). */
function countUp(tl: gsap.core.Timeline, el: Element | undefined, to: number, at: number, duration: number, color: string) {
  if (!el) return;
  const o = { v: 0 };
  tl.to(o, { v: to, duration, ease: "none", onUpdate: () => void (el.textContent = fmtInt(o.v)) }, at);
  tl.to(el, { color, duration: 0.3, ease: "power1.out" }, at);
}

export function OpenSlide() {
  const { index } = useSlide();
  const [participants, setParticipants] = useState(80);
  const [sessions, setSessions] = useState(4);
  const [returning, setReturning] = useState(40);
  const [challenge, setChallenge] = useState(10);
  const [conversion, setConversion] = useState(15);

  // Modelo: capacidade fixa por treino — quem volta já tem BORA ID; quem chega pela 1ª vez ganha um.
  const checkins = participants * sessions;
  const community = (checkins * returning) / 100;
  const ids = checkins - community;
  const challenges = (community * challenge) / 100;
  const coaching = (challenges * conversion) / 100;

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
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

    // Passo 0 — o treino de sábado: 80 pessoas chegam ao Treino Aberto.
    step(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="example"]'), 0.3, { y: 16 });
      fade(tl, q('[data-a="flow-head"]'), 0.45);
      draw(tl, q('[data-a="track"]'), 0.4, { duration: 1.3 });
      pop(tl, q('[data-a="node"]'), 0.55, { stagger: 0.08, duration: 0.6 });
      rise(tl, q('[data-a="count"], [data-a="st-text"]'), 0.6, { stagger: 0.03, y: 12 });
      if (reduced) fade(tl, dotEls, 0.8);
      else
        tl.from(
          dotEls,
          {
            x: (i: number) => DOTS[i].enter.x,
            y: (i: number) => DOTS[i].enter.y,
            autoAlpha: 0,
            duration: 1,
            ease: "power3.out",
            stagger: { each: 0.006, from: "random" },
          },
          0.75,
        );
      countUp(tl, counters[0], copy.funnelReach[0], 0.95, 1.1, C.fg);
    });

    // Passo 1 — o funil: todos ganham um BORA ID, a maioria fica na comunidade, poucos chegam ao Coaching.
    step(1, (tl) => {
      if (reduced) {
        const group = q('[data-a="dots"]');
        tl.to(group, { autoAlpha: 0, duration: 0.2 }, 0);
        DOTS.forEach((d, i) => {
          const end = d.path[d.fate];
          tl.set(dotEls[i], { x: end.x - d.path[0].x, y: end.y - d.path[0].y, fill: colorAt(d.fate), opacity: d.fate === 1 ? 0.5 : 1 }, 0.2);
        });
        tl.to(group, { autoAlpha: 1, duration: 0.4 }, 0.25);
      } else {
        DOTS.forEach((d, i) => {
          for (let k = 1; k <= d.fate; k++) {
            const vars: gsap.TweenVars = {
              x: d.path[k].x - d.path[0].x,
              y: d.path[k].y - d.path[0].y,
              duration: HOP,
              ease: "power2.inOut",
            };
            if (k === 1) vars.fill = C.fg;
            if (k === 3) vars.fill = C.intent;
            if (k === LAST) Object.assign(vars, { fill: C.brand, stroke: C.ink, scale: 1.5, transformOrigin: "50% 50%" });
            tl.to(dotEls[i], vars, d.start + (k - 1) * (HOP + PAUSE));
          }
          // Só o BORA ID: não voltou (ainda). O ponto esmaece.
          if (d.fate === 1) tl.to(dotEls[i], { opacity: 0.5, duration: 0.5, ease: "power1.out" }, arrival(d, 1) + 0.15);
        });
      }

      for (let k = 1; k <= LAST; k++) {
        const times = DOTS.filter((d) => d.fate >= k).map((d) => arrival(d, k));
        const first = reduced ? 0.25 : Math.min(...times) - HOP * 0.4;
        const span = reduced ? 0.3 : Math.max(0.2, Math.max(...times) - first);
        countUp(tl, counters[k], copy.funnelReach[k], first, span, C.fg);
      }

      const coachAt = reduced ? 0.3 : arrival(COACH, LAST);
      const coachNode = q('[data-a="node"]')[LAST];
      if (coachNode) tl.to(coachNode, { fill: C.brand, duration: 0.35, ease: "power1.out" }, coachAt - 0.1);
      pop(tl, q('[data-a="coach-glow"]'), coachAt - 0.12, { duration: 0.45 });
      pop(tl, q('[data-a="coach-ring"]'), coachAt - 0.08, { duration: 0.45 });
      rise(tl, q('[data-a="funnel-caption"]'), reduced ? 0.4 : 1.55, { y: 12 });
    });

    // Passo 2 — OPEN ≠ COACHING.
    step(2, (tl) => {
      const leave = { autoAlpha: 0, y: reduced ? 0 : -22, duration: 0.5, ease: "power2.in" };
      tl.to(q('[data-a="scene-flow"]'), leave, 0);
      tl.to(q('[data-a="example"]'), { ...leave, y: reduced ? 0 : -10 }, 0);
      tl.from(q('[data-a="scene-compare"]'), { autoAlpha: 0, duration: 0.01 }, 0.45);
      unmask(tl, q('[data-a="cmp-title"] .split-unit'), 0.5, { stagger: 0.05 });
      rise(tl, q('[data-a="cmp-panel"]'), 0.6, { stagger: 0.14, y: 30 });
      pop(tl, q('[data-a="neq"]'), 1.0);
      rise(tl, q('[data-a="cmp-item"]'), 0.85, { stagger: 0.03, y: 8 });
      pop(tl, q('[data-a="art-dot"]'), 0.9, { stagger: { each: 0.012, from: "center" }, duration: 0.5 });
      draw(tl, q('[data-a="art-line"]'), 1.1, { duration: 0.7 });
      rise(tl, q('[data-a="objective"]'), 0.95, { y: 12 });
      revealHighlights(tl, q('[data-a="objective"] .hl'), 1.4);
    });

    // Passo 3 — simulador.
    step(3, (tl) => {
      tl.to(q('[data-a="scene-compare"]'), { autoAlpha: 0, y: reduced ? 0 : -22, duration: 0.5, ease: "power2.in" }, 0);
      tl.from(q('[data-a="scene-sim"]'), { autoAlpha: 0, y: reduced ? 0 : 28, duration: 0.8, ease: "bora" }, 0.4);
      rise(tl, q('[data-a="sim-in"]'), 0.6, { stagger: 0.06, y: 10 });
      rise(tl, q('[data-a="sim-out"]'), 0.75, { stagger: 0.1, y: 14 });
      fade(tl, q('[data-a="sim-year"]'), 1.2);
    });

    // Passo 4 — a ficha da ação: o que é, por que importa, como executamos e como medimos.
    step(4, (tl) => revealBrief(tl, q));
  });

  const outputs = [
    { key: "ids", value: ids, ...copy.sim.outputs.ids, hint: copy.sim.outputs.ids.hint },
    { key: "community", value: community, ...copy.sim.outputs.community, hint: copy.sim.outputs.community.hint },
    { key: "challenges", value: challenges, ...copy.sim.outputs.challenges, hint: fill(copy.sim.outputs.challenges.hint, { pct: pct(challenge) }) },
    { key: "coaching", value: coaching, ...copy.sim.outputs.coaching, hint: fill(copy.sim.outputs.coaching.hint, { pct: pct(conversion) }) },
  ];

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className="grid-12 items-start gap-y-6">
        <SectionHeader
          index={index}
          label={copy.label}
          title={copy.title}
          lede={copy.tagline}
          tag={<StageTag of="open" />}
          className="col-span-12 lg:col-span-7"
        />
        <div className={cn(styles.topSwap, "col-span-12 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9")}>
          <aside data-a="example" className={styles.example} aria-label={`${copy.example.when}, ${copy.example.where}`}>
            <div className={styles.exampleHead}>
              <Tag kind="example" />
              <span className="t-label text-fg-3">{copy.example.when}</span>
            </div>
            <p className={styles.exampleWhere}>{copy.example.where}</p>
            <dl className={styles.exampleFacts}>
              {copy.example.facts.map((f) => (
                <div key={f.label}>
                  <dt className={styles.factValue}>{f.value}</dt>
                  <dd className={styles.factLabel}>{f.label}</dd>
                </div>
              ))}
            </dl>
          </aside>
          <div data-a="objective" className={styles.objective}>
            <p className="t-label text-fg-3">{copy.objective.label}</p>
            <p className={styles.objectiveText}>
              <Emphasis text={copy.objective.text} />
            </p>
          </div>
        </div>
      </div>

      <div className={styles.scenes}>
        {/* Cena 1 — funil de pontos */}
        <section data-a="scene-flow" className={styles.scene} aria-label={copy.flowLabel}>
          <div data-a="flow-head" className={styles.flowHead}>
            <span className="t-label text-fg-2">{copy.flowLabel}</span>
            <Tag kind="illustrative" />
            <span className={styles.funnelLegend}>{copy.funnelLegend}</span>
          </div>
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
          <div className={styles.funnelFoot}>
            <p data-a="funnel-caption" className={styles.funnelCaption}>
              <Emphasis text={copy.funnelCaption} />
            </p>
          </div>
        </section>

        {/* Cena 2 — OPEN não é coaching grátis */}
        <section data-a="scene-compare" className={styles.scene}>
          <div data-a="cmp-title">
            <SplitHeadline as="h3" lines={[copy.compare.headline]} className={cn("t-headline", styles.compareTitle)} />
          </div>
          <div className={styles.compare}>
            <article data-a="cmp-panel" className={styles.panel}>
              <header className={styles.panelHead}>
                <h4 className={styles.panelTitle}>{copy.compare.open.title}</h4>
                <span className={styles.kind}>{copy.compare.open.kind}</span>
              </header>
              <CommunityArt />
              <ul className={styles.items}>
                {copy.compare.open.items.map((item) => (
                  <li key={item} data-a="cmp-item" className={styles.item}>
                    <span className={styles.itemDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className={styles.role}>
                <span className="t-label text-fg-3">{copy.compare.roleLabel}</span>
                <span className={styles.roleValue}>{copy.compare.open.role}</span>
              </p>
            </article>
            <div data-a="neq" className={styles.neq} aria-hidden="true">
              {copy.compare.versus}
            </div>
            <article data-a="cmp-panel" data-theme="dark" className={cn(styles.panel, styles.panelCoach)}>
              <header className={styles.panelHead}>
                <h4 className={styles.panelTitle}>{copy.compare.coaching.title}</h4>
                <span className={styles.kind}>{copy.compare.coaching.kind}</span>
              </header>
              <CoachArt />
              <ul className={styles.items}>
                {copy.compare.coaching.items.map((item) => (
                  <li key={item} data-a="cmp-item" className={styles.item}>
                    <span className={styles.itemDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className={styles.role}>
                <span className="t-label text-fg-3">{copy.compare.roleLabel}</span>
                <span className={styles.roleValue}>{copy.compare.coaching.role}</span>
              </p>
            </article>
          </div>
        </section>

        {/* Cena 3 — simulador */}
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

      <ActionBrief id="open" />
    </div>
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

/** Três aglomerados = grupos de pace (BORA OPEN é coletivo). */
const PACE_GROUPS = [
  { x: 30, n: 16 },
  { x: 100, n: 13 },
  { x: 162, n: 10 },
];
function CommunityArt() {
  return (
    <svg viewBox="0 0 200 80" className={styles.panelArt} aria-hidden="true" focusable="false">
      {PACE_GROUPS.flatMap((g) =>
        Array.from({ length: g.n }, (_, i) => {
          const radius = 5.2 * Math.sqrt(i + 0.5);
          const angle = i * GOLDEN;
          return (
            <circle
              key={`${g.x}-${i}`}
              data-a="art-dot"
              className={styles.artDot}
              cx={r2(g.x + radius * Math.cos(angle))}
              cy={r2(40 + radius * Math.sin(angle))}
              r={2.5}
            />
          );
        }),
      )}
    </svg>
  );
}

/** Um atleta, um treinador (BORA COACHING é individual). */
function CoachArt() {
  return (
    <svg viewBox="0 0 200 80" className={styles.panelArt} aria-hidden="true" focusable="false">
      <circle data-a="art-line" className={styles.artLine} cx={34} cy={40} r={22} />
      <line data-a="art-line" className={styles.artLine} x1={56} y1={40} x2={118} y2={40} />
      <circle data-a="art-dot" className={styles.artDot} cx={34} cy={40} r={6} />
      <circle data-a="art-dot" className={styles.artCoach} cx={128} cy={40} r={7.5} />
    </svg>
  );
}
