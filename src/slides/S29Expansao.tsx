"use client";

import { useEffect } from "react";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { METRO, MetroRoutes, metroAt } from "@/components/diagrams/MetroRoutes";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { Tag } from "@/components/ui/Tag";
import { stageOf } from "@/content/projects";
import { copy } from "@/content/slides/29-frente-expansao";
import { gsap } from "@/lib/gsap";
import { draw, fade, motionPrefs, pop, rise } from "@/lib/motion";
import { FrontFrame, revealBriefStep, revealFront, showVisual } from "./FrontFrame";
import styles from "./S29Expansao.module.css";

/** Duração do traço de cada linha. As estações acendem quando o traço passa por elas. */
const LINE_DUR = 1.1;
/** Pontos em loop: a maioria segue até a cidade; alguns saem pelas saídas legítimas. */
const PATTERN = ["flowA", "flowB", "flowExitA", "flowB", "flowA", "flowExitB", "flowA", "flowB"] as const;
const SPEED = 300; // unidades do viewBox por segundo
const S_MAP = 1;

/** Estágio da ação por trás de cada estação (lido de projects.ts). */
const stagesOf = (ids: readonly (string | null)[]) => ids.map((id) => (id ? (stageOf(id) ?? null) : null));
const STAGES_A = stagesOf(copy.routeA.stationIds);
const STAGES_B = stagesOf(copy.routeB.stationIds);

/**
 * Frente 6 · Expansão. s0 as três ações · s1 as duas rotas até uma nova cidade (por parceiros e por demanda) ·
 * s2 e s3 as fichas do Brasília Lab e do pipeline de expansão.
 */
export function ExpansaoSlide() {
  const { index, step, entered, current } = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";

  const { scope } = useStepTimeline(
    ({ step: at, q, reduced }) => {
      const els = (name: string) => q(`[data-a="${name}"]`);
      const dur = reduced ? 0.5 : LINE_DUR;

      /** Uma linha que se desenha e acende as estações na ordem em que o traço passa. */
      const drawRoute = (tl: gsap.core.Timeline, route: "a" | "b", start: number) => {
        pop(tl, els(`badge-${route}`), start, { duration: 0.5 });
        fade(tl, els(`kind-${route}`), start + 0.15, { duration: 0.6 });
        if (reduced) tl.from(els(`line-${route}`), { autoAlpha: 0, duration: dur }, start);
        else tl.from(els(`line-${route}`), { drawSVG: "0%", duration: dur, ease: "none" }, start);
        const xs = METRO[route].xs;
        els(`st-${route}`).forEach((st, i) => pop(tl, st, start + metroAt(xs[i]) * dur, { duration: 0.45 }));
        els(`lb-${route}`).forEach((lb, i) => rise(tl, lb, start + metroAt(xs[i]) * dur + 0.05, { y: route === "a" ? 10 : -10, duration: 0.6 }));
      };

      at(0, (tl) => revealFront(tl, q));

      at(S_MAP, (tl) => {
        const t = showVisual(tl, q, flow, reduced);
        rise(tl, els("ex-head"), t, { y: 10 });
        drawRoute(tl, "a", t + 0.1);
        drawRoute(tl, "b", t + 0.35);
        const end = t + 0.35 + dur;
        pop(tl, els("unit"), end - 0.1, { duration: 0.5 });
        rise(tl, els("unit-label"), end, { y: 8 });
        draw(tl, els("trunk"), end, { duration: reduced ? 0.4 : 0.6, ease: "power2.inOut" });
        pop(tl, els("city"), end + 0.45, { duration: 0.6 });
        pop(tl, els("city-mark"), end + 0.55, { duration: 0.5 });
        rise(tl, els("city-label"), end + 0.6, { y: 10 });
        fade(tl, els("exit"), end + 0.3, { stagger: 0.15, duration: 0.6 });
        pop(tl, els("exit-end"), end + 0.45, { stagger: 0.15, duration: 0.45 });
        rise(tl, els("exit-text"), end + 0.5, { stagger: 0.15, y: 8 });
        fade(tl, els("legend"), end + 0.4, { duration: 0.6 });
        rise(tl, els("ex-note"), end + 0.6, { y: 10 });
      });

      at(2, (tl) => revealBriefStep(tl, q, 0, { flow }));
      at(3, (tl) => revealBriefStep(tl, q, 1, { flow }));
    },
    [flow],
  );

  // Pipeline em movimento: pontos percorrem as rotas; alguns param nas saídas (só em cena, no passo do mapa).
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || !entered || step !== S_MAP || motionPrefs.reduced) return;
    const dots = gsap.utils.toArray<SVGCircleElement>(root.querySelectorAll('[data-a="dot"]'));
    const pulse = root.querySelector('[data-a="pulse-loop"]');
    const path = (name: string) => root.querySelector<SVGPathElement>(`[data-path="${name}"]`);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, delay: 2.6 });
      PATTERN.forEach((name, i) => {
        const p = path(name);
        const dot = dots[i];
        if (!p || !dot) return;
        const d = p.getTotalLength() / SPEED;
        const t0 = i * 0.9;
        const toCity = name === "flowA" || name === "flowB";
        tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0)
          .to(dot, { motionPath: { path: p, align: p, alignOrigin: [0.5, 0.5] }, duration: d, ease: "none" }, t0)
          .to(dot, { opacity: 0, duration: toCity ? 0.25 : 0.6 }, t0 + d - (toCity ? 0.1 : -0.5));
        if (toCity && pulse) {
          tl.fromTo(pulse, { scale: 1, opacity: 0.7 }, { scale: 1.7, opacity: 0, transformOrigin: "50% 50%", duration: 0.9, ease: "power2.out" }, t0 + d - 0.1);
        }
      });
    }, root);
    return () => ctx.revert();
  }, [scope, step, current, entered]);

  return (
    <FrontFrame scope={scope} index={index} copy={copy}>
      <div className={styles.wrap}>
        <div data-a="ex-head" className={styles.head}>
          <span className="t-label text-fg-2">{copy.visualLabel}</span>
          <Tag kind="concept" />
        </div>
        <div className={styles.mapBox}>
          <MetroRoutes
            className={styles.map}
            ariaLabel={copy.mapLabel}
            routeA={copy.routeA}
            routeB={copy.routeB}
            unit={copy.unit}
            city={copy.city}
            exits={copy.exits}
            stagesA={STAGES_A}
            stagesB={STAGES_B}
            legend={copy.legend}
          />
        </div>
        <p data-a="ex-note" className={styles.note}>
          <Emphasis text={copy.mapNote} />
        </p>
      </div>
    </FrontFrame>
  );
}
