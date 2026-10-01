"use client";

import { useEffect } from "react";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ChallengeRoutes, ROUTE_GEOMETRY } from "@/components/diagrams/ChallengeRoutes";
import { FlowSteps } from "@/components/diagrams/FlowSteps";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/27-frente-conversao";
import { gsap } from "@/lib/gsap";
import { draw, fade, motionPrefs, pop, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { FrontFrame, revealBriefStep, revealFront, showVisual } from "./FrontFrame";
import styles from "./S27Conversao.module.css";

/** Até que parada cada corredor chega (índice; a última = Coaching). Poucos chegam, e tudo bem. */
const FATES = { a: [3, 1, 2, 1, 3, 2, 1], b: [2, 1, 2, 1, 1, 2, 1] } as const;
const ROUTE_TIME = 7.5;
const S_ROUTES = 1;

/**
 * Frente 4 · Conversão. s0 as quatro ações · s1 as rotas até o Coaching (exemplo), com corredores em loop ·
 * s2 e s3 as fichas de BORA CHALLENGES e BORA PASS.
 */
export function ConversaoSlide() {
  const { index, step, entered, current } = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";

  const { scope } = useStepTimeline(
    ({ step: at, q, reduced }) => {
      at(0, (tl) => revealFront(tl, q));

      at(S_ROUTES, (tl) => {
        const t = showVisual(tl, q, flow, reduced);
        rise(tl, q('[data-a="cv-head"]'), t, { y: 10 });
        draw(tl, q('[data-a="route-path"]'), t + 0.05, { duration: 1.3, stagger: 0.25 });
        pop(tl, q('[data-a="route-stop"]'), t + 0.15, { stagger: 0.1, duration: 0.5 });
        fade(tl, q('[data-a="route-label"]'), t + 0.25, { stagger: 0.08, duration: 0.5 });
        pop(tl, q('[data-a="route-finish"]'), t + 1.1, { duration: 0.6 });
        fade(tl, q('[data-a="route-finish-label"]'), t + 1.2, { duration: 0.5 });
        rise(tl, q('[data-a="cv-foot"] > *'), t + 1.1, { stagger: 0.12, y: 12, duration: 0.7 });
      });

      at(2, (tl) => revealBriefStep(tl, q, 0, { flow }));
      at(3, (tl) => revealBriefStep(tl, q, 1, { flow }));
    },
    [flow],
  );

  // Corredores percorrem as rotas; poucos chegam ao Coaching (só com o slide em cena, no passo das rotas).
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || !entered || step !== S_ROUTES || motionPrefs.reduced) return;
    const ctx = gsap.context(() => {
      const finishPulse = root.querySelector('[data-a="route-finish-pulse"]');
      (["a", "b"] as const).forEach((id) => {
        const path = root.querySelector<SVGPathElement>(`[data-a="route-path"][data-route="${id}"]`);
        if (!path) return;
        const g = ROUTE_GEOMETRY[id];
        // Progresso (0 a 1) de cada parada ao longo do traçado.
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
            delay: 2 + i * (ROUTE_TIME / runners.length) + (id === "b" ? 0.45 : 0),
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

  return (
    <FrontFrame scope={scope} index={index} copy={copy}>
      <div className={styles.wrap}>
        <div data-a="cv-head" className={styles.head}>
          <span className="t-label text-fg-2">{copy.visualLabel}</span>
          <Tag kind="example" />
        </div>
        <div className={styles.routesBox}>
          <ChallengeRoutes className={styles.routesDiagram} routes={copy.routes} finish={copy.finishStop} />
        </div>
        <div className={styles.routesList}>
          {copy.routes.map((r) => (
            <div key={r.id}>
              <span className="t-label text-fg-2">{r.name}</span>
              <FlowSteps steps={[...r.stops, copy.finishStop.label]} orientation="vertical" size="sm" activeIndex={r.stops.length} />
            </div>
          ))}
        </div>
        <div data-a="cv-foot" className={styles.foot}>
          <p className={cn(styles.exampleText)}>
            <Emphasis text={copy.example} />
          </p>
          <p className={styles.legend}>{copy.routesLegend}</p>
        </div>
      </div>
    </FrontFrame>
  );
}
