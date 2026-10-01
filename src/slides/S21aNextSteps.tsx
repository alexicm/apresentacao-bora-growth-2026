"use client";

import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { copy } from "@/content/slides/21a-next-steps";
import { fade, hold, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S21aNextSteps.module.css";

/**
 * O fim prático da conversa: as três decisões que o Alex propõe à diretoria e como o trabalho
 * seria dividido (a diretoria decide onde e com quem; ele construiria o como). Tudo no condicional:
 * alinhamento, não venda.
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
      tl.from(q('[data-a="role"]'), { autoAlpha: 0, y: reduced ? 0 : 18, duration: 0.7, ease: "bora" }, 0);
      rise(tl, q('[data-a="role-col"]'), 0.25, { stagger: 0.15, y: 12 });
      rise(tl, q('[data-a="role-item"]'), 0.4, { stagger: 0.05, y: 8 });
      fade(tl, q('[data-a="flow"]'), 0.7, { stagger: 0.15 });
      fade(tl, q('[data-a="cadence"]'), 1.0);
      fade(tl, q('[data-a="honesty"]'), 1.15);
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

        <section data-a="role" className={styles.planBox} aria-label={copy.roleLabel}>
          <p className="t-label text-fg-3">{copy.roleLabel}</p>
          <div className={styles.roleGrid}>
            {[copy.board, copy.me].map((col, i) => (
              <div key={col.title} data-a="role-col" className={cn(styles.roleCol, i === 1 && styles.roleColMe)}>
                <h4 className={styles.roleTitle}>{col.title}</h4>
                <ul className={styles.roleList}>
                  {col.items.map((it) => (
                    <li key={it} data-a="role-item">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className={styles.flows} aria-hidden="true">
              <span data-a="flow" className={styles.flowDown}>
                {copy.flows.down} →
              </span>
              <span data-a="flow" className={styles.flowUp}>
                ← {copy.flows.up}
              </span>
            </div>
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
