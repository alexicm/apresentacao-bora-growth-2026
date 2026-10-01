"use client";

import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/24-frente-fundacao";
import { EASE, fade, pop, rise } from "@/lib/motion";
import { FrontFrame, VisualHead, revealBriefStep, revealFront, showVisual } from "./FrontFrame";
import styles from "./S24Fundacao.module.css";

const J = copy.journey;
const HOPS = J.stops.length - 1;

/**
 * Frente 1 · Fundação. s0 as três ações · s1 o caminho de um BORA ID (exemplo fictício):
 * o ID percorre as quatro paradas e cada uma deixa um registro · s2 e s3 as fichas de BORA ID e CRM + tracking.
 */
export function FundacaoSlide() {
  const { index } = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";

  const { scope } = useStepTimeline(
    ({ step, q, reduced }) => {
      step(0, (tl) => revealFront(tl, q));

      step(1, (tl) => {
        const t = showVisual(tl, q, flow, reduced);
        tl.from(q('[data-a="j-track"]'), { scaleX: 0, duration: reduced ? 0.4 : 1.2, ease: "none" }, t + 0.3);
        pop(tl, q('[data-a="j-node"]'), t + 0.1, { stagger: 0.12, duration: 0.5 });
        rise(tl, q('[data-a="j-when"], [data-a="j-what"]'), t + 0.15, { stagger: 0.05, y: 10, duration: 0.6 });
        pop(tl, q('[data-a="j-token"]'), t + 0.3, { duration: 0.5 });
        const recs = q('[data-a="j-rec"]');
        pop(tl, recs[0], t + 0.55, { duration: 0.45 });
        // O ID anda parada a parada; cada chegada deixa um registro.
        for (let k = 1; k <= HOPS; k++) {
          const start = t + 0.3 + (k - 1) * (1.2 / HOPS);
          if (!reduced)
            tl.fromTo(
              q('[data-a="j-carrier"]'),
              { xPercent: ((k - 1) / HOPS) * 100 },
              { xPercent: (k / HOPS) * 100, duration: 1.2 / HOPS, ease: EASE.inOut, immediateRender: false },
              start,
            );
          pop(tl, recs[k], reduced ? t + 0.4 : start + 1.2 / HOPS - 0.05, { duration: 0.4 });
        }
        if (reduced) tl.set(q('[data-a="j-carrier"]'), { xPercent: 100 }, t + 0.4);
        fade(tl, q('[data-a="j-moral"]'), t + 1.4);
      });

      step(2, (tl) => revealBriefStep(tl, q, 0, { flow }));
      step(3, (tl) => revealBriefStep(tl, q, 1, { flow }));
    },
    [flow],
  );

  return (
    <FrontFrame
      scope={scope}
      index={index}
      copy={copy}
      visualHead={<VisualHead label={J.label} tag={<Tag kind="fictional" />} note={`${J.who} · ${J.id}`} />}
    >
      <div className={styles.journey} role="img" aria-label={J.ariaLabel}>
        <div className={styles.path}>
          <div className={styles.trackWrap} aria-hidden="true">
            <span data-a="j-track" className={styles.track} />
            <span data-a="j-carrier" className={styles.carrier}>
              <span data-a="j-token" className={styles.token} />
            </span>
          </div>
          <ol className={styles.stops}>
            {J.stops.map((s) => (
              <li key={s.when} className={styles.stop}>
                <span data-a="j-when" className={styles.when}>
                  {s.when}
                </span>
                <span data-a="j-node" className={styles.node} aria-hidden="true" />
                <span data-a="j-what" className={styles.what}>
                  {s.what}
                </span>
                <span data-a="j-rec" className={styles.rec}>
                  <span className={styles.recDot} aria-hidden="true" />
                  {s.record}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p data-a="j-moral" className={styles.moral}>
          <Emphasis text={J.moral} />
        </p>
      </div>
    </FrontFrame>
  );
}
