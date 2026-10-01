"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ChallengeRoutes, ROUTE_GEOMETRY } from "@/components/diagrams/ChallengeRoutes";
import { FlowSteps } from "@/components/diagrams/FlowSteps";
import { RaceBib } from "@/components/diagrams/RaceBib";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { revealHighlights } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Emphasis, SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/11-challenges";
import { fmtInt, fmtPct } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { DUR, EASE, draw, fade, motionPrefs, pop, rise, unmask } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import styles from "./S11Challenges.module.css";

const IN = copy.sim.inputs;
type CatalogRow = (typeof copy.catalog)[number];

/** Destino de cada corredor nas rotas (índice da parada onde para; o último = Coaching). Funil: poucos chegam ao fim. */
const FATES = { a: [3, 1, 2, 1, 3, 2, 1], b: [2, 1, 2, 1, 1, 2, 1] } as const;
const ROUTE_TIME = 7.5;

export function ChallengesSlide() {
  const { index, step, entered, current } = useSlide();

  // ── Simulação ────────────────────────────────────────────────────────
  const [enrolled, setEnrolled] = useState<number>(IN.enrolled.value);
  const [completion, setCompletion] = useState<number>(IN.completion.value);
  const [toCoaching, setToCoaching] = useState<number>(IN.toCoaching.value);
  const [toNext, setToNext] = useState<number>(IN.toNext.value);
  const completers = Math.round(enrolled * completion);
  const newCoaching = Math.round(completers * toCoaching);
  const nextClass = Math.round(completers * toNext);

  // ── Timeline por passos ──────────────────────────────────────────────
  const { scope } = useStepTimeline(({ step: at, q, reduced }) => {
    const dy = (v: number) => (reduced ? 0 : v);

    // Passo 0 — manchete + assinatura (linha sem fim) × desafio (largada → chegada).
    at(0, (tl) => {
      tl.from(q('[data-a="meta"]'), { autoAlpha: 0, y: dy(10), duration: DUR.m, ease: EASE.soft }, 0);
      unmask(tl, q('[data-a="headline"] .split-unit'), 0.1, { stagger: 0.045 });
      revealHighlights(tl, q('[data-a="headline"] .hl'), 0.85);
      rise(tl, q('[data-a="tagline"]'), 0.5, { y: 14 });
      fade(tl, q('[data-a="scene-contrast"]'), 0.55, { duration: 0.2 });
      rise(tl, q('[data-a="contrast-head"]'), 0.55, { y: 10 });
      rise(tl, q('[data-a="row-text"]'), 0.6, { stagger: 0.18, y: 16 });
      tl.from(q('[data-a="sub-line"]'), { scaleX: 0, transformOrigin: "50% 50%", duration: 1.2, ease: EASE.inOut }, 0.65);
      fade(tl, q('[data-a="drifter"]'), 1.2, { duration: 0.6 });
      tl.from(q('[data-a="chal-line"]'), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.25, ease: "power2.inOut" }, 0.95);
      fade(tl, q('[data-a="start-mark"]'), 0.9, { duration: 0.4 });
      tl.fromTo(q('[data-a="runner-track"]'), { xPercent: 0 }, { xPercent: 100, duration: 1.25, ease: "power2.inOut" }, 0.95);
      rise(tl, q('[data-a="tick"]'), 1.15, { stagger: 0.14, y: 8, duration: 0.5 });
      pop(tl, q('[data-a="finish-mark"]'), 2.05, { duration: 0.5 });
      tl.to(q('[data-a="runner"]'), { autoAlpha: 0, duration: 0.3, ease: EASE.soft }, 2.15);
    });

    // Passo 1 — catálogo: cada desafio é um número de peito, com meta, prazo e próximo passo.
    at(1, (tl) => {
      tl.to(q('[data-a="scene-contrast"]'), { autoAlpha: 0, y: dy(-18), duration: 0.45, ease: EASE.in }, 0);
      fade(tl, q('[data-a="scene-catalog"]'), 0.35, { duration: 0.2 });
      rise(tl, q('[data-a="catalog-head"]'), 0.4, { y: 12 });
      rise(tl, q('[data-a="scene-catalog"] thead tr'), 0.5, { y: 8 });
      rise(tl, q('[data-a="scene-catalog"] .dt-row'), 0.55, { stagger: 0.07, y: 14, duration: 0.7 });
      pop(tl, q('[data-a="bib"]'), 0.6, { stagger: 0.07, duration: 0.6 });
    });

    // Passo 2 — rotas até o Coaching (os corredores andam no efeito abaixo).
    at(2, (tl) => {
      tl.to(q('[data-a="scene-catalog"]'), { autoAlpha: 0, y: dy(-18), duration: 0.45, ease: EASE.in }, 0);
      fade(tl, q('[data-a="scene-routes"]'), 0.35, { duration: 0.2 });
      rise(tl, q('[data-a="routes-head"]'), 0.4, { y: 12 });
      draw(tl, q('[data-a="route-path"]'), 0.45, { duration: 1.4, stagger: 0.25 });
      pop(tl, q('[data-a="route-stop"]'), 0.55, { stagger: 0.1, duration: 0.5 });
      fade(tl, q('[data-a="route-label"]'), 0.65, { stagger: 0.08, duration: 0.5 });
      pop(tl, q('[data-a="route-finish"]'), 1.55, { duration: 0.6 });
      fade(tl, q('[data-a="route-finish-label"]'), 1.65, { duration: 0.5 });
      rise(tl, q('[data-a="routes-foot"] > *'), 1.5, { stagger: 0.12, y: 12, duration: 0.7 });
    });

    // Passo 3 — simulação de uma turma.
    at(3, (tl) => {
      tl.to(q('[data-a="scene-routes"]'), { autoAlpha: 0, y: dy(-18), duration: 0.45, ease: EASE.in }, 0);
      fade(tl, q('[data-a="scene-sim"]'), 0.35, { duration: 0.2 });
      rise(tl, q('[data-a="sim-panel"]'), 0.35, { y: 24, duration: 0.9 });
      rise(tl, q('[data-a="sim-row"]'), 0.55, { stagger: 0.07, y: 10, duration: 0.6 });
      tl.from(q('[data-a="sim-rail"]'), { scaleY: 0, transformOrigin: "50% 0%", duration: 1, ease: EASE.inOut }, 0.6);
      rise(tl, q('[data-a="sim-node"]'), 0.65, { stagger: 0.12, y: 12, duration: 0.7 });
    });

    // Passo 4 — a ficha da ação.
    at(4, (tl) => revealBrief(tl, q));
  });

  // ── Loop do passo 0: a assinatura "anda" sem começo nem fim ──
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || !entered || step !== 0 || motionPrefs.reduced) return;
    const drifters = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-a="drifter"]'));
    const tweens = drifters.map((el, i) =>
      gsap.fromTo(el, { xPercent: 0 }, { xPercent: 100, duration: 9, ease: "none", repeat: -1 }).progress(i / drifters.length),
    );
    return () => {
      tweens.forEach((t) => t.kill());
      gsap.set(drifters, { clearProps: "transform" });
    };
  }, [scope, step, current, entered]);

  // ── Loop do passo 2: corredores percorrem as rotas; poucos chegam ao Coaching ──
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || !entered || step !== 2 || motionPrefs.reduced) return;
    const ctx = gsap.context(() => {
      const finishPulse = root.querySelector('[data-a="route-finish-pulse"]');
      (["a", "b"] as const).forEach((id) => {
        const path = root.querySelector<SVGPathElement>(`[data-a="route-path"][data-route="${id}"]`);
        if (!path) return;
        const g = ROUTE_GEOMETRY[id];
        // Progresso (0–1) de cada parada ao longo do traçado.
        const length = path.getTotalLength();
        const stopAt = [...g.stops.map((si) => g.points[si]), g.points[g.points.length - 1]].map(([x, y]) => {
          let best = 0;
          let bestD = Infinity;
          for (let s = 0; s <= 240; s++) {
            const p = path.getPointAtLength((s / 240) * length);
            const d = (p.x - x) ** 2 + (p.y - y) ** 2;
            if (d < bestD) {
              bestD = d;
              best = s / 240;
            }
          }
          return best;
        });
        const runners = gsap.utils.toArray<SVGCircleElement>(root.querySelectorAll(`[data-a="route-runner"][data-route="${id}"]`));
        const fates = FATES[id];
        runners.forEach((el, i) => {
          const fate = fates[i % fates.length];
          const end = fate >= stopAt.length - 1 ? 1 : stopAt[fate];
          const run = Math.max(0.8, end * ROUTE_TIME);
          const tl = gsap.timeline({
            repeat: -1,
            delay: 2.1 + i * (ROUTE_TIME / runners.length) + (id === "b" ? 0.45 : 0),
            repeatDelay: Math.max(0.3, ROUTE_TIME - run),
          });
          tl.set(el, { opacity: 0 })
            .to(el, { motionPath: { path, start: 0, end }, duration: run, ease: "none" }, 0)
            .to(el, { opacity: 1, duration: 0.3, ease: "none" }, 0)
            .to(el, { opacity: 0, duration: 0.35, ease: "none" }, run - 0.2);
          if (end === 1 && finishPulse) {
            tl.fromTo(
              finishPulse,
              { scale: 1, opacity: 0.8, transformOrigin: "50% 50%" },
              { scale: 2.6, opacity: 0, duration: 0.9, ease: "power2.out", immediateRender: false },
              run - 0.15,
            );
          }
        });
      });
    }, root);
    return () => ctx.revert();
  }, [scope, step, current, entered]);

  const columns: Column<CatalogRow>[] = [
    {
      key: "name",
      label: copy.columns.challenge,
      render: (r) => (
        <span className={styles.challengeCell}>
          <span data-a="bib" className="inline-flex">
            <RaceBib code={r.code} brand={copy.bibBrand} accent={r.code === "10K"} />
          </span>
          <span className={styles.challengeName}>{r.name}</span>
        </span>
      ),
    },
    { key: "goal", label: copy.columns.goal },
    { key: "duration", label: copy.columns.duration, className: styles.colDuration },
    { key: "audience", label: copy.columns.audience },
    { key: "next", label: copy.columns.next },
  ];

  const ticks = copy.attributes.length;

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      {/* ── Cabeçalho (fixo nos quatro passos) ── */}
      <header className={styles.header}>
        <div className={styles.headMain}>
          <div data-a="meta" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="t-label t-mono text-fg-3">{pad2(index + 1)}</span>
            <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
            <span className="t-label text-fg-2">{copy.label}</span>
            <StageTag of="challenges" />
          </div>
          <div data-a="headline">
            <SplitHeadline lines={copy.headline} className={cn("t-headline", styles.headline)} />
          </div>
        </div>
        <div className={styles.headAside}>
          <p data-a="tagline" className={styles.tagline}>
            <Emphasis text={copy.tagline} />
          </p>
        </div>
      </header>

      <div className={styles.scenes}>
        {/* ── Cena 0: assinatura × desafio ── */}
        <section data-a="scene-contrast" className={styles.scene} aria-label={copy.contrastLabel}>
          <div data-a="contrast-head" className={styles.sceneHead}>
            <span className={cn("t-label", styles.sceneLabel)}>{copy.contrastLabel}</span>
          </div>
          <div className={styles.contrast}>
            <div className={styles.row}>
              <div data-a="row-text">
                <h3 className={styles.rowTitle}>{copy.subscription.title}</h3>
                <p className={styles.rowBody}>{copy.subscription.body}</p>
              </div>
              <div className={styles.subTrack} aria-hidden="true">
                <span data-a="sub-line" className={styles.subLine} />
                {[0, 1, 2].map((i) => (
                  <span key={i} data-a="drifter" className={styles.drifter}>
                    <i />
                  </span>
                ))}
              </div>
            </div>

            <div className={cn(styles.row, styles.rowChal)}>
              <div data-a="row-text">
                <h3 className={styles.rowTitle}>{copy.challenge.title}</h3>
                <p className={styles.rowBody}>{copy.challenge.body}</p>
              </div>
              <div className={styles.chalTrack}>
                <span data-a="chal-line" className={styles.chalLine} aria-hidden="true" />
                <span data-a="start-mark" className={cn(styles.endMark, styles.startMark)}>
                  <em className="t-label text-fg-2">{copy.start}</em>
                  <i className={styles.startTick} aria-hidden="true" />
                </span>
                <ol className={styles.ticks} aria-label={copy.challenge.title}>
                  {copy.attributes.map((a, i) => (
                    <li
                      key={a}
                      data-a="tick"
                      className={styles.tick}
                      style={{ left: `${((i + 1) / (ticks + 1)) * 100}%` } as CSSProperties}
                    >
                      <i className={styles.tickMark} aria-hidden="true" />
                      <span className={styles.tickLabel}>{a}</span>
                    </li>
                  ))}
                </ol>
                <span data-a="finish-mark" className={cn(styles.endMark, styles.finishMark)}>
                  <em className="t-label text-brand-text">{copy.finish}</em>
                  <i className={styles.finishNode} aria-hidden="true" />
                </span>
                <span data-a="runner-track" className={styles.runnerTrack} aria-hidden="true">
                  <i data-a="runner" className={styles.runner} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cena 1: catálogo ── */}
        <section data-a="scene-catalog" className={styles.scene} aria-label={copy.catalogLabel}>
          <div data-a="catalog-head" className={styles.sceneHead}>
            <span className={cn("t-label", styles.sceneLabel)}>{copy.catalogLabel}</span>
            <Tag kind="illustrative">{copy.catalogNote}</Tag>
            <span className={styles.sceneCaption}>{copy.catalogCaption}</span>
          </div>
          <DataTable
            className={styles.table}
            caption={`${copy.catalogLabel} · ${copy.catalogNote}`}
            columns={columns}
            rows={copy.catalog.map((r) => ({ ...r }))}
            rowKey={(r) => r.code}
            highlightKey="next"
          />
        </section>

        {/* ── Cena 2: rotas ── */}
        <section data-a="scene-routes" className={cn(styles.scene, styles.routesScene)} aria-label={copy.routesLabel}>
          <div data-a="routes-head" className={styles.sceneHead}>
            <span className={cn("t-label", styles.sceneLabel)}>{copy.routesLabel}</span>
          </div>
          <div className={styles.routesBox}>
            <ChallengeRoutes className={styles.routesDiagram} routes={copy.routes} finish={copy.finishStop} />
          </div>
          <div className={styles.routesList}>
            {copy.routes.map((r) => (
              <div key={r.id}>
                <span className={cn("t-label", styles.sceneLabel)}>{r.name}</span>
                <FlowSteps steps={[...r.stops, copy.finishStop.label]} orientation="vertical" size="sm" activeIndex={r.stops.length} />
              </div>
            ))}
          </div>
          <div data-a="routes-foot" className={styles.routesFoot}>
            <div className={styles.example}>
              <Tag kind="example">{copy.example.tag}</Tag>
              <p className={styles.exampleText}>
                <Emphasis text={copy.example.text} />
              </p>
            </div>
            <p className={styles.insight}>
              <Emphasis text={copy.insight} />
            </p>
            <p className={styles.legend}>{copy.routesLegend}</p>
          </div>
        </section>

        {/* ── Cena 3: simulação ── */}
        <section data-a="scene-sim" className={styles.scene}>
          <div data-a="sim-panel">
            <SimPanel title={copy.sim.title} note={copy.sim.note}>
              <div className={styles.simGrid}>
                <div className={styles.simInputs}>
                  <p data-a="sim-row" className={cn("t-label", styles.simLabel)}>
                    {copy.sim.assumptionsLabel}
                  </p>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.enrolled.label}
                      value={enrolled}
                      min={IN.enrolled.min}
                      max={IN.enrolled.max}
                      step={IN.enrolled.step}
                      onChange={setEnrolled}
                      format={fmtInt}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.completion.label}
                      value={completion}
                      min={IN.completion.min}
                      max={IN.completion.max}
                      step={IN.completion.step}
                      onChange={setCompletion}
                      format={fmtPct}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.toCoaching.label}
                      value={toCoaching}
                      min={IN.toCoaching.min}
                      max={IN.toCoaching.max}
                      step={IN.toCoaching.step}
                      onChange={setToCoaching}
                      format={fmtPct}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.toNext.label}
                      value={toNext}
                      min={IN.toNext.min}
                      max={IN.toNext.max}
                      step={IN.toNext.step}
                      onChange={setToNext}
                      format={fmtPct}
                    />
                  </div>
                </div>

                <div>
                  <p data-a="sim-row" className={cn("t-label", styles.simLabel)}>
                    {copy.sim.resultsLabel}
                  </p>
                  <div className={styles.flowWrap}>
                    <div className={styles.trunk}>
                      <span data-a="sim-rail" className={styles.rail} aria-hidden="true" />
                      <ol className={styles.flow} aria-label={copy.sim.resultsLabel}>
                        <li data-a="sim-node" className={styles.node}>
                          <span className={styles.nodeDot} aria-hidden="true" />
                          <span className={styles.nodeName}>{copy.sim.nodes.start}</span>
                          <Stat value={enrolled} label={copy.sim.outputs.reactivated} format={fmtInt} />
                        </li>
                        <li data-a="sim-node" className={styles.edge}>
                          {copy.sim.completionRate(fmtPct(completion))}
                        </li>
                        <li data-a="sim-node" className={styles.node}>
                          <span className={styles.nodeDot} aria-hidden="true" />
                          <span className={styles.nodeName}>{copy.sim.nodes.finish}</span>
                          <Stat value={completers} label={copy.sim.outputs.completers} format={fmtInt} />
                        </li>
                        <li data-a="sim-node" className={styles.edge}>
                          {copy.sim.branchRate(fmtPct(toCoaching), fmtPct(toNext))}
                        </li>
                      </ol>
                    </div>
                    <div data-a="sim-node" className={styles.branch} role="list">
                      <div role="listitem" className={cn(styles.branchNode, styles.branchAccent)}>
                        <span className={styles.nodeDot} aria-hidden="true" />
                        <span className={styles.nodeName}>{copy.sim.nodes.coaching}</span>
                        <Stat value={newCoaching} label={copy.sim.outputs.coaching} format={fmtInt} accent size="lg" />
                      </div>
                      <div role="listitem" className={styles.branchNode}>
                        <span className={styles.nodeDot} aria-hidden="true" />
                        <span className={styles.nodeName}>{copy.sim.nodes.next}</span>
                        <Stat value={nextClass} label={copy.sim.outputs.next} format={fmtInt} size="lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SimPanel>
          </div>
        </section>
      </div>

      <ActionBrief id="challenges" />
    </div>
  );
}
