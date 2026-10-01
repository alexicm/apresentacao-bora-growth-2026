"use client";

import { deck } from "@/components/deck/deck-store";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { StageDots, StageTag } from "@/components/ui/StageTag";
import { PACK, growthById, type GrowthProject } from "@/content/projects";
import { copy } from "@/content/slides/04a-foundation";
import { DUR, EASE, fade, hold, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S04aFoundation.module.css";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

const GROUPS = copy.groups.map((gr) => ({
  ...gr,
  items: gr.ids.map((id) => growthById(id)).filter((g): g is GrowthProject => Boolean(g)),
}));
const BASE = GROUPS.flatMap((g) => g.items);
const LEDE = fill(copy.lede, {
  n: BASE.filter((g) => g.stage === "rodando").length,
  total: PACK.filter((g) => g.stage === "rodando").length,
  backlog: BASE.filter((g) => g.stage === "backlog").length,
});
/** Grupos em que todas as ações estão rodando entram no passo 0; os demais (backlog) no passo 1. */
const isNow = (items: GrowthProject[]) => items.every((g) => g.stage === "rodando");

/**
 * As ações de base que não têm slide próprio, explicadas em uma linha cada.
 * Clicar numa ação abre a ficha completa nas pastas (tecla P).
 */
export function FoundationSlide() {
  const { index } = useSlide();

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    step(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="lede"]'), 0.45);
      rise(tl, q('[data-a="group-now"] [data-a="group-head"]'), 0.6, { stagger: 0.12, y: 12 });
      tl.from(
        q('[data-a="group-now"] [data-a="item"]'),
        { autoAlpha: 0, y: reduced ? 0 : 10, duration: DUR.s, ease: EASE.out, stagger: 0.05 },
        0.75,
      );
    });
    step(1, (tl) => {
      tl.from(q('[data-a="group-later"]'), { autoAlpha: 0, duration: 0.01 }, 0);
      rise(tl, q('[data-a="group-later"] [data-a="group-head"]'), 0.05, { y: 12 });
      tl.from(
        q('[data-a="group-later"] [data-a="item"]'),
        { autoAlpha: 0, y: reduced ? 0 : 10, duration: DUR.s, ease: EASE.out, stagger: 0.08 },
        0.2,
      );
      fade(tl, q('[data-a="hint"]'), 0.5);
      fade(tl, q('[data-a="next"]'), 0.7);
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
          titleClassName="!text-[clamp(30px,3.3vw,58px)]"
        />
        <p data-a="lede" className="t-lede col-span-5 hidden max-w-[46ch] justify-self-end text-fg-2 xl:block">
          {LEDE}
        </p>
      </div>

      <div className={styles.groups}>
        {GROUPS.map((gr) => (
          <section
            key={gr.id}
            data-a={isNow(gr.items) ? "group-now" : "group-later"}
            className={cn(styles.group, styles[`group_${gr.id}`])}
            aria-label={gr.title}
          >
            <header data-a="group-head" className={styles.groupHead}>
              <h3 className={styles.groupTitle}>{gr.title}</h3>
              {gr.items[0] && <StageTag stage={gr.items[0].stage} />}
              <p className={styles.groupSub}>{gr.sub}</p>
            </header>
            <ul className={styles.items}>
              {gr.items.map((g) => (
                <li key={g.id} data-a="item">
                  <button type="button" className={styles.item} onClick={() => deck.openProject(g.id)}>
                    <span className={styles.itemHead}>
                      <StageDots stage={g.stage} className={styles[`dots_${g.stage}`]} />
                      <span className={styles.itemName}>{g.name}</span>
                    </span>
                    <span className={styles.itemPlain}>{g.plain}</span>
                    <span className={styles.itemKpi}>
                      {copy.metric}: {g.kpi}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className={styles.foot}>
        <span data-a="hint">{copy.hint}</span>
        <span data-a="next" className={styles.next}>
          {copy.next}
        </span>
      </div>
    </div>
  );
}
