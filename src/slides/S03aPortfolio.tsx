"use client";

import { deck } from "@/components/deck/deck-store";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { InteractiveTooltip, useTooltip } from "@/components/ui/InteractiveTooltip";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { StageDots, StageTag } from "@/components/ui/StageTag";
import { GROWTH_FRONTS, PACK, STAGES, horizonLabel, type GrowthProject, type Stage } from "@/content/projects";
import { copy } from "@/content/slides/03a-portfolio";
import { DUR, EASE, fade, hold, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S03aPortfolio.module.css";

const COUNTS = Object.fromEntries(STAGES.map((s) => [s, PACK.filter((g) => g.stage === s).length])) as Record<Stage, number>;
const MAJORITY = COUNTS.rodando > PACK.length / 2;
const HEADLINE = (MAJORITY ? copy.headline : copy.headlineSome).map((l) => l.replace("{total}", String(PACK.length)));
const CELLS = GROWTH_FRONTS.map((front) => ({
  front,
  byStage: STAGES.map((s) => PACK.filter((g) => g.front === front && g.stage === s)),
}));

/**
 * O pack inteiro numa tela: frentes nas linhas, estágios nas colunas.
 * Rodando = volt sólido · Backlog = contorno · Ideia = tracejado (mesma linguagem do StageTag).
 * Clicar numa ação abre a ficha dela nas pastas do mapa.
 */
export function PortfolioSlide() {
  const { index } = useSlide();

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    step(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="lede"]'), 0.45);
      rise(tl, q('[data-a="head"]'), 0.55, { stagger: 0.12, y: 14 });
      tl.from(q('[data-a="count"]'), { textContent: 0, snap: { textContent: 1 }, duration: reduced ? DUR.xs : 1.3, ease: EASE.soft, stagger: 0.12 }, 0.7);
      rise(tl, q('[data-a="def"]'), 0.9, { stagger: 0.12, y: 6 });
    });
    step(1, (tl) => {
      fade(tl, q('[data-a="row"]'), 0, { stagger: 0.06 });
      tl.from(
        q('[data-a="chip"]'),
        { autoAlpha: 0, scale: reduced ? 1 : 0.86, duration: DUR.s, ease: EASE.out, stagger: { each: 0.025, from: "start" } },
        0.15,
      );
      fade(tl, q('[data-a="hint"]'), 0.9);
    });
    step(2, (tl) => {
      tl.to(q('[data-a="def"]'), { autoAlpha: 0, y: reduced ? 0 : -6, duration: DUR.xs, ease: EASE.in }, 0);
      rise(tl, q('[data-a="note"]'), 0.2, { stagger: 0.12, y: 8 });
      fade(tl, q('[data-a="next"]'), 0.7);
      hold(tl, 0.2);
    });
  });

  const tip = useTooltip(scope);
  const showTip = (el: Element, g: GrowthProject) =>
    tip.show(
      el,
      <>
        <span className={styles.tipName}>{g.name}</span>
        <span className={styles.tipGoal}>{g.goal}</span>
        <span className={styles.tipMeta}>
          {copy.tipMetric}: {g.kpi} · {horizonLabel(g.horizon)}
        </span>
      </>,
    );

  return (
    <div ref={scope} className="slide relative grid grid-rows-[auto_1fr] gap-y-[clamp(14px,3vh,34px)]">
      <div className={cn("grid-12 gap-y-4", styles.top)}>
        <SectionHeader
          index={index}
          label={copy.label}
          title={HEADLINE}
          className="col-span-12 xl:col-span-8"
          titleClassName="!text-[clamp(30px,3.3vw,58px)]"
        />
        <p data-a="lede" className="t-lede col-span-4 hidden max-w-[40ch] justify-self-end text-fg-2 xl:block">
          <Emphasis text={copy.lede} />
        </p>
      </div>

      <div className="min-h-0 self-end">
        <table className={styles.board}>
          <caption className="sr-only">{copy.caption}</caption>
          <colgroup>
            <col className={styles.colFront} />
            <col className={styles.colRun} />
            <col className={styles.colBacklog} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={cn(styles.frontHead, "t-label")}>
                {copy.frontsLabel}
              </th>
              {STAGES.map((s) => (
                <th key={s} scope="col" className={cn(styles.stageHead, styles[s])}>
                  <div data-a="head" className={styles.headRow}>
                    <span data-a="count" className={styles.count}>
                      {COUNTS[s]}
                    </span>
                    <span className={styles.headSide}>
                      <StageTag stage={s} className="justify-self-start" />
                      <span className={styles.headText}>
                        <span data-a="def" className={styles.def}>
                          {copy.defs[s]}
                        </span>
                        <span data-a="note" className={cn(styles.note, "pre")}>
                          {copy.notes[s]}
                        </span>
                      </span>
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CELLS.map(({ front, byStage }) => (
              <tr key={front} data-a="row">
                <th scope="row" className={styles.front}>
                  {front}
                </th>
                {byStage.map((items, si) => (
                  <td key={STAGES[si]} className={styles.cell}>
                    {items.length > 0 && (
                      <ul>
                        {items.map((g) => (
                          <li key={g.id} data-a="chip">
                            <button
                              type="button"
                              className={cn(styles.chip, styles[`chip_${g.stage}`])}
                              onPointerEnter={(e) => showTip(e.currentTarget, g)}
                              onPointerLeave={tip.hide}
                              onFocus={(e) => showTip(e.currentTarget, g)}
                              onBlur={tip.hide}
                              onClick={() => {
                                tip.hide();
                                deck.openProject(g.id);
                              }}
                            >
                              <StageDots stage={g.stage} className={styles.chipDots} />
                              {g.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.foot}>
          <span data-a="hint">{copy.hint}</span>
          <span data-a="next" className={styles.next}>
            {copy.next}
          </span>
        </div>
      </div>

      <InteractiveTooltip state={tip.state} />
    </div>
  );
}
