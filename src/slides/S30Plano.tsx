"use client";

import { deck } from "@/components/deck/deck-store";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { StageDots } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { PACK, type GrowthProject, type Horizon } from "@/content/projects";
import { copy } from "@/content/slides/30-plano";
import { DUR, EASE, fade, pop, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S30Plano.module.css";

/** As ações de cada janela, lidas do `horizon` de cada ação do pack (projects.ts). */
const inWindow = (h: Horizon) => PACK.filter((g) => g.horizon === h);
/** Nome curto no chip: os produtos perdem o "BORA" (menos BORA ID e BORA OS). */
const short = (g: GrowthProject) => {
  const n = g.name.replace(/^BORA (?!ID|OS)/, "").replace("Programa de ", "");
  return n.charAt(0).toUpperCase() + n.slice(1);
};

const COLUMNS = [
  ...copy.phases.map((p, i) => ({ ...p, items: inWindow(p.horizon), first: i === 0, later: false })),
  { id: "later", range: copy.later.range, name: copy.later.name, text: copy.later.text, horizon: copy.later.horizon, items: inWindow(copy.later.horizon), first: false, later: true },
];

/**
 * O plano proposto: se aprovado, 90 dias em Brasília (Construir, Pilotar, Aprender) e o que fica para depois.
 * As ações de cada janela vêm do horizonte de cada ação. No fim, a North Star e as perguntas por trás dela.
 */
export function PlanoSlide() {
  const { index } = useSlide();

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    step(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="lede"]'), 0.45);
      tl.from(q('[data-a="track"]'), { scaleX: 0, duration: reduced ? 0.4 : 1.4, ease: EASE.inOut }, 0.5);
      pop(tl, q('[data-col="0"] [data-a="ph-dot"]'), 0.55, { duration: 0.5 });
      rise(tl, q('[data-col="0"] [data-a="ph-text"]'), 0.6, { stagger: 0.06, y: 10 });
      tl.from(q('[data-col="0"] [data-a="chip"]'), { autoAlpha: 0, scale: reduced ? 1 : 0.88, duration: DUR.s, ease: EASE.out, stagger: 0.04 }, 0.85);
    });
    step(1, (tl) => {
      [1, 2, 3].forEach((c, k) => {
        const at = k * 0.3;
        pop(tl, q(`[data-col="${c}"] [data-a="ph-dot"]`), at, { duration: 0.5 });
        rise(tl, q(`[data-col="${c}"] [data-a="ph-text"]`), at + 0.05, { stagger: 0.06, y: 10 });
        tl.from(q(`[data-col="${c}"] [data-a="chip"]`), { autoAlpha: 0, scale: reduced ? 1 : 0.88, duration: DUR.s, ease: EASE.out, stagger: 0.04 }, at + 0.25);
      });
    });
    step(2, (tl) => {
      rise(tl, q('[data-a="ns"]'), 0, { y: 20, duration: 0.8 });
      rise(tl, q('[data-a="ns"] [data-a="q"]'), 0.4, { stagger: 0.06, y: 8 });
      fade(tl, q('[data-a="honesty"]'), 0.9);
    });
  });

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className={cn("grid-12 gap-y-4", styles.top)}>
        <SectionHeader
          index={index}
          label={copy.label}
          title={copy.headline}
          tag={<Tag kind="proposed" />}
          className="col-span-12 xl:col-span-7"
          titleClassName="!text-[clamp(30px,3.3vw,58px)]"
        />
        <p data-a="lede" className="t-lede col-span-5 hidden max-w-[46ch] justify-self-end text-fg-2 xl:block">
          {copy.lede}
        </p>
      </div>

      <div className={styles.timeline}>
        <span data-a="track" className={styles.track} aria-hidden="true" />
        <ol className={styles.phases}>
          {COLUMNS.map((c, i) => (
            <li key={c.id} data-col={i} className={cn(styles.phase, c.later && styles.later)}>
              <span data-a="ph-dot" className={cn(styles.dot, c.first && styles.dotBuild, c.later && styles.dotLater)} aria-hidden="true" />
              {c.range && (
                <span data-a="ph-text" className={styles.range}>
                  {c.range}
                </span>
              )}
              <h3 data-a="ph-text" className={styles.name}>
                {c.name}
              </h3>
              <p data-a="ph-text" className={styles.text}>
                {c.text}
              </p>
              <ul className={styles.chips}>
                {c.items.map((g) => (
                  <li key={g.id} data-a="chip">
                    <button type="button" className={cn(styles.chip, styles[`chip_${g.stage}`])} onClick={() => deck.openProject(g.id)} title={g.plain}>
                      <StageDots stage={g.stage} />
                      {short(g)}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <section data-a="ns" className={styles.ns} aria-label={copy.northStar.label}>
        <div className={styles.nsHead}>
          <span className="t-label text-fg-3">{copy.northStar.label}</span>
          <p className={styles.nsName}>
            {copy.northStar.name}
            <Tag kind="proposed">{copy.northStar.tag}</Tag>
          </p>
          <p className={styles.nsDef}>{copy.northStar.def}</p>
        </div>
        <div className={styles.questions}>
          <span className="t-label text-fg-3">{copy.northStar.questionsLabel}</span>
          <ul className={styles.qList}>
            {copy.northStar.questions.map((qq) => (
              <li key={qq} data-a="q" className={styles.q}>
                {qq}
              </li>
            ))}
          </ul>
          <p data-a="honesty" className={styles.honesty}>
            {copy.honesty}
          </p>
        </div>
      </section>
    </div>
  );
}
