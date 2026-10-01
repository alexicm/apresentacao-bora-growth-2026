"use client";

import type { ReactNode, RefObject } from "react";
import { deck } from "@/components/deck/deck-store";
import { ActionBriefStack, revealBriefStep } from "@/components/ui/ActionBrief";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { StageTag } from "@/components/ui/StageTag";
import { FRONT_UI, fill } from "@/content/fronts";
import { GROWTH_FRONTS, GROWTH_PROJECTS, STAGES, STAGE_LABEL, growthById, type GrowthFront } from "@/content/projects";
import { DUR, EASE, fade, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./FrontFrame.module.css";

export type FrontCopy = {
  front: GrowthFront;
  headline: readonly string[];
  lede: string;
  briefs: readonly string[];
  note?: string;
};

type Props = {
  /** Ref da raiz do slide (vem do useStepTimeline). */
  scope: RefObject<HTMLDivElement | null>;
  index: number;
  copy: FrontCopy;
  /** Cabeçalho do visual: rótulo, tag e nota. */
  visualHead?: ReactNode;
  /** O visual da frente (passo 1 em diante). */
  children: ReactNode;
  /** Classe extra da cena do visual. */
  visualClassName?: string;
};

/**
 * Moldura comum dos seis slides de frente (versão curta):
 * s0 · cabeçalho + tabela com TODAS as ações da frente (o que é, primeiro passo, métrica);
 * s1+ · o visual da frente ocupa o corpo; depois, uma ficha (ActionBrief) por passo.
 * Cada slide monta a própria timeline com `revealFront`, `showVisual` e `revealBriefStep`.
 */
export function FrontFrame({ scope, index, copy, visualHead, children, visualClassName }: Props) {
  const items = GROWTH_PROJECTS.filter((g) => g.front === copy.front && !g.core);
  const n = GROWTH_FRONTS.indexOf(copy.front) + 1;
  const counts = STAGES.map((s) => ({ s, c: items.filter((g) => g.stage === s).length })).filter((x) => x.c > 0);
  const briefNames = copy.briefs.map((id) => growthById(id)?.name ?? id);
  const briefs = fill(FRONT_UI.briefs, {
    names: briefNames.length > 1 ? `${briefNames.slice(0, -1).join(", ")} ${FRONT_UI.and} ${briefNames[briefNames.length - 1]}` : briefNames[0] ?? "",
  });

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className={cn("grid-12 gap-y-4", styles.top)}>
        <SectionHeader
          index={index}
          label={fill(FRONT_UI.label, { n, total: GROWTH_FRONTS.length, front: copy.front })}
          title={copy.headline}
          lede={copy.lede}
          className="col-span-12 lg:col-span-8"
          titleClassName="!text-[clamp(30px,3.3vw,58px)]"
        />
        <aside data-a="front-count" className={cn("col-span-12 lg:col-span-4 lg:col-start-9", styles.count)}>
          <p className={styles.countLine}>
            <span className={styles.countNum}>{items.length}</span>
            <span className={styles.countText}>{items.length === 1 ? FRONT_UI.countOne : FRONT_UI.countMany}</span>
          </p>
          <div className={styles.stages}>
            {counts.map(({ s, c }) => (
              <StageTag key={s} stage={s} label={`${STAGE_LABEL[s]} · ${c}`} />
            ))}
          </div>
          {copy.note && <p className={styles.note}>{copy.note}</p>}
          <p className={styles.hint}>
            {FRONT_UI.hint} <strong>{briefs}</strong>
          </p>
        </aside>
      </div>

      <div className={styles.body}>
        <section data-a="scene-table" className={cn(styles.scene, styles.sceneTable)} aria-label={fill(FRONT_UI.tableLabel, { front: copy.front })}>
          <table className={styles.table}>
            <colgroup>
              <col className={styles.colAction} />
              <col className={styles.colStage} />
              <col className={styles.colPlain} />
              <col className={styles.colFirst} />
              <col className={styles.colKpi} />
            </colgroup>
            <thead data-a="thead">
              <tr>
                <th scope="col" className={cn("t-label", styles.th)}>
                  {FRONT_UI.cols.action}
                </th>
                <th scope="col" className={cn("t-label", styles.th)}>
                  {FRONT_UI.cols.stage}
                </th>
                <th scope="col" className={cn("t-label", styles.th)}>
                  {FRONT_UI.cols.plain}
                </th>
                <th scope="col" className={cn("t-label", styles.th)}>
                  {FRONT_UI.cols.first}
                </th>
                <th scope="col" className={cn("t-label", styles.th, styles.kpiHead)}>
                  {FRONT_UI.cols.kpi}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((g) => (
                <tr key={g.id} data-a="row" className={styles.row} onClick={() => deck.openProject(g.id)}>
                  <th scope="row">
                    <button
                      type="button"
                      className={styles.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        deck.openProject(g.id);
                      }}
                    >
                      {g.name}
                    </button>
                  </th>
                  <td className={styles.stageCell}>
                    <StageTag stage={g.stage} />
                  </td>
                  <td className={styles.plain}>
                    <span className={styles.cellLabel}>{FRONT_UI.cols.plain}</span>
                    {g.plain}
                  </td>
                  <td className={styles.first}>
                    <span className={styles.cellLabel}>{FRONT_UI.cols.first}</span>
                    {g.howTo[0]}
                  </td>
                  <td className={cn(styles.kpi, styles.kpiCell)}>
                    <span className={styles.cellLabel}>{FRONT_UI.cols.kpi}</span>
                    {g.kpi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section data-a="scene-visual" className={cn(styles.scene, styles.sceneVisual, visualClassName)}>
          {visualHead ? (
            <div data-a="visual-head" className={styles.visualHead}>
              {visualHead}
            </div>
          ) : (
            <span />
          )}
          <div className="min-h-0">{children}</div>
        </section>
      </div>

      <ActionBriefStack ids={copy.briefs} />
    </div>
  );
}

/** Cabeçalho do visual: rótulo em caixa-alta + tag de status + nota curta. */
export function VisualHead({ label, tag, note }: { label: string; tag?: ReactNode; note?: ReactNode }) {
  return (
    <>
      <span className={cn("t-label", styles.visualLabel)}>{label}</span>
      {tag}
      {note && <span className={styles.visualNote}>{note}</span>}
    </>
  );
}

/** Passo 0: cabeçalho, contagem e a tabela linha a linha. */
export function revealFront(tl: gsap.core.Timeline, q: (s: string) => Element[]) {
  revealHeader(tl, q);
  rise(tl, q('[data-a="front-count"]'), 0.5, { y: 12 });
  fade(tl, q('[data-a="thead"]'), 0.6, { duration: DUR.s });
  rise(tl, q('[data-a="row"]'), 0.65, { stagger: 0.07, y: 12, duration: 0.7 });
  return tl;
}

/** Passo do visual: a tabela sai e o visual entra. Devolve o tempo em que o visual já está em cena. */
export function showVisual(tl: gsap.core.Timeline, q: (s: string) => Element[], flow: boolean, reduced: boolean) {
  if (!flow) tl.to(q('[data-a="scene-table"]'), { autoAlpha: 0, y: reduced ? 0 : -14, duration: 0.4, ease: EASE.in }, 0);
  const at = flow ? 0 : 0.35;
  tl.from(q('[data-a="scene-visual"]'), { autoAlpha: 0, duration: 0.01 }, at);
  rise(tl, q('[data-a="visual-head"]'), at, { y: 10, duration: 0.6 });
  return at + 0.1;
}

export { revealBriefStep };
