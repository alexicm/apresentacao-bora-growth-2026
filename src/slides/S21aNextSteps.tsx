"use client";

import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { copy } from "@/content/slides/21a-next-steps";
import { fade, hold, pop, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S21aNextSteps.module.css";

/**
 * O fim prático da conversa: o que o Alex propõe à diretoria e o que ele faz nos próximos 90 dias.
 * Alinhamento, não venda. Os 90 dias são os mesmos três tempos do Brasília Lab.
 */
export function NextStepsSlide() {
  const { index } = useSlide();

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    step(0, (tl) => {
      revealHeader(tl, q);
      fade(tl, q('[data-a="asks-label"]'), 0.55);
      rise(tl, q('[data-a="ask"]'), 0.65, { stagger: 0.14, y: 16 });
    });
    step(1, (tl) => {
      tl.from(q('[data-a="plan"]'), { autoAlpha: 0, y: reduced ? 0 : 18, duration: 0.7, ease: "bora" }, 0);
      tl.from(q('[data-a="track"]'), { scaleX: 0, transformOrigin: "0% 50%", duration: reduced ? 0.4 : 1.1, ease: "power3.inOut" }, 0.25);
      pop(tl, q('[data-a="phase-dot"]'), 0.35, { stagger: 0.3, duration: 0.5 });
      rise(tl, q('[data-a="phase"]'), 0.4, { stagger: 0.3, y: 10 });
      fade(tl, q('[data-a="cadence"]'), 1.2);
      fade(tl, q('[data-a="honesty"]'), 1.35);
      hold(tl, 0.2);
    });
  });

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className="grid-12 items-end gap-y-4">
        <SectionHeader
          index={index}
          label={copy.label}
          title={copy.headline}
          className="col-span-12 xl:col-span-7"
          titleClassName="!text-[clamp(32px,3.6vw,64px)]"
        />
        <p className="sh-lede t-lede col-span-5 hidden max-w-[44ch] justify-self-end text-fg-2 xl:block">{copy.lede}</p>
      </div>

      <div className={styles.body}>
        <section aria-label={copy.asksLabel}>
          <p data-a="asks-label" className="t-label text-fg-3">
            {copy.asksLabel}
          </p>
          <ol className={styles.asks}>
            {copy.asks.map((a) => (
              <li key={a.n} data-a="ask" className={styles.ask}>
                <span className={styles.askNum}>{a.n}</span>
                <h3 className={styles.askTitle}>{a.title}</h3>
                <p className={styles.askText}>{a.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section data-a="plan" className={styles.planBox} aria-label={copy.planLabel}>
          <p className="t-label text-fg-3">{copy.planLabel}</p>
          <div className={styles.phasesWrap}>
            <span data-a="track" className={styles.track} aria-hidden="true" />
            <ol className={styles.phases}>
            {copy.plan.map((p) => (
              <li key={p.name} className={styles.phase}>
                <span data-a="phase-dot" className={styles.phaseDot} aria-hidden="true" />
                <div data-a="phase" className="grid gap-1.5">
                  <span className={styles.phaseWhen}>{p.when}</span>
                  <h4 className={styles.phaseName}>{p.name}</h4>
                  <p className={styles.phaseText}>{p.text}</p>
                </div>
              </li>
            ))}
            </ol>
          </div>
          <div className={styles.foot}>
            <p data-a="cadence" className={styles.cadence}>
              <strong>{copy.cadence.label}</strong>
              <span>{copy.cadence.text}</span>
            </p>
            <p data-a="honesty" className={styles.honesty}>
              {copy.honesty}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
