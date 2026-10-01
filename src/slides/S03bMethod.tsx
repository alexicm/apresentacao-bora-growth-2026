"use client";

import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ActionBriefCard } from "@/components/ui/ActionBrief";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { PACK, STAGES, growthById, type Stage } from "@/content/projects";
import { copy } from "@/content/slides/03b-method";
import { gsap } from "@/lib/gsap";
import { DUR, EASE, fade, hold, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S03bMethod.module.css";

const PHASES = copy.cycle.phases;
const COUNTS = Object.fromEntries(STAGES.map((s) => [s, PACK.filter((g) => g.stage === s).length])) as Record<Stage, number>;

const EXAMPLE = growthById(copy.sheet.actionId);
const phaseLabel = (p: number) => `${PHASES[p].n} · ${PHASES[p].name}`;
/** A ficha do exemplo, anotada com a fase do ciclo de cada bloco. */
const SHEET_PHASES = {
  why: phaseLabel(copy.sheet.phases.why),
  how: phaseLabel(copy.sheet.phases.how),
  metric: phaseLabel(copy.sheet.phases.metric),
};

/**
 * O método em três cenas: o ciclo (ligado às fases do pack), a ficha que toda ação seguiria
 * e a cadência que manteria o ciclo girando.
 * No celular (modo documento) as cenas empilham e ficam todas visíveis.
 */
export function MethodSlide() {
  const { index } = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";

  const { scope } = useStepTimeline(
    ({ step, q, reduced }) => {
      const swap = (tl: gsap.core.Timeline, from: number, to: number) => {
        if (!flow) tl.to(q(`[data-scene="${from}"]`), { autoAlpha: 0, duration: DUR.xs, ease: EASE.in }, 0);
        tl.fromTo(q(`[data-scene="${to}"]`), { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.xs, ease: EASE.soft }, flow ? 0 : 0.2);
      };

      step(0, (tl) => {
        revealHeader(tl, q);
        rise(tl, q('[data-a="lede"]'), 0.45);
        fade(tl, q('[data-a="rowlabel"]'), 0.55, { stagger: 0.1 });
        rise(tl, q('[data-a="band"]'), 0.65, { stagger: 0.12, y: 8 });
        tl.from(q('[data-a="phase"]'), { autoAlpha: 0, y: reduced ? 0 : 18, duration: DUR.m, ease: EASE.out, stagger: 0.12 }, 0.75);
        fade(tl, q('[data-a="arrow"]'), 1.05, { stagger: 0.12, duration: DUR.s });
        rise(tl, q('[data-a="loop"]'), 1.55, { y: 8 });
      });
      step(1, (tl) => {
        swap(tl, 0, 1);
        rise(tl, q('[data-a="sheet"]'), 0.3, { y: 16 });
        rise(tl, q('[data-a="sheet"] [data-a="brief-row"]'), 0.45, { stagger: 0.05, y: 8 });
        rise(tl, q('[data-a="mgmt"]'), 0.5, { y: 16 });
        rise(tl, q('[data-a="field"]'), 0.7, { stagger: 0.08, y: 10 });
      });
      step(2, (tl) => {
        swap(tl, 1, 2);
        rise(tl, q('[data-a="ritual"]'), 0.3, { stagger: 0.08, y: 10 });
        tl.from(q('[data-a="week"]'), { autoAlpha: 0, duration: DUR.xs, stagger: 0.006, ease: EASE.soft }, 0.5);
        rise(tl, q('[data-a="artifact"]'), 0.7, { stagger: 0.1, y: 12 });
        hold(tl, 0.2);
      });
    },
    [flow],
  );

  return (
    <div ref={scope} className="slide grid grid-rows-[auto_1fr] gap-y-[clamp(14px,2.8vh,30px)]">
      <div className={cn("grid-12 gap-y-4", styles.top)}>
        <SectionHeader
          index={index}
          label={copy.label}
          title={copy.headline}
          className="col-span-12 xl:col-span-7"
          titleClassName="!text-[clamp(30px,3.3vw,58px)]"
        />
        <p data-a="lede" className="t-lede col-span-5 hidden max-w-[40ch] justify-self-end text-fg-2 xl:block">
          <Emphasis text={copy.lede} />
        </p>
      </div>

      <div className={styles.stage}>
        {/* ── Cena 0: o ciclo ───────────────────────────────────────── */}
        <div data-scene="0" className={styles.scene} role="group" aria-label={copy.cycle.ariaLabel}>
          <div className={styles.cycle}>
            <p data-a="rowlabel" className={cn(styles.rowLabel, "t-label")}>
              {copy.cycle.rowPack}
            </p>
            {copy.cycle.bands.map((b) => (
              <div
                key={b.stage}
                data-a="band"
                className={cn(styles.band, styles[`band_${b.stage}`])}
                style={{ gridColumn: `${b.from + 1} / ${b.to + 2}` }}
              >
                <StageTag stage={b.stage} />
                <span className={styles.bandCount}>
                  {COUNTS[b.stage]} {COUNTS[b.stage] === 1 ? copy.cycle.countOne : copy.cycle.countMany}
                </span>
              </div>
            ))}
            <p data-a="rowlabel" className={cn(styles.rowLabel, "t-label")}>
              {copy.cycle.rowMethod}
            </p>
            {PHASES.map((p, i) => (
              <article key={p.n} data-a="phase" className={styles.phase}>
                <span className={styles.phaseNum}>{p.n}</span>
                <h3 className={styles.phaseName}>{p.name}</h3>
                <p className={styles.phaseDesc}>{p.desc}</p>
                {i < PHASES.length - 1 && (
                  <span data-a="arrow" className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                )}
              </article>
            ))}
            <div data-a="loop" className={styles.loop}>
              <span className={styles.loopText}>{copy.cycle.loop}</span>
            </div>
          </div>
        </div>

        {/* ── Cena 1: a ficha de cada ação ──────────────────────────── */}
        <div data-scene="1" className={cn(styles.scene, "pre")}>
          <p className={cn("mb-4 max-w-[70ch] text-[15px] text-fg-2", styles.sheetIntro)}>
            <strong className="text-fg">{copy.sheet.title}.</strong> {copy.sheet.sub}
          </p>
          {EXAMPLE && (
            <div className={styles.sheetGrid}>
              <div data-a="sheet" className="min-w-0">
                <ActionBriefCard g={EXAMPLE} size="sm" phases={SHEET_PHASES} />
              </div>
              <aside data-a="mgmt" className={styles.mgmt} aria-label={copy.sheet.mgmt.title}>
                <div className={styles.mgmtHead}>
                  <p className={styles.mgmtTitle}>{copy.sheet.mgmt.title}</p>
                  <Tag kind="concept">{copy.sheet.mgmt.tag}</Tag>
                </div>
                {copy.sheet.mgmt.fields.map((f) => (
                  <Field key={f.key} phase={f.phase} label={f.label}>
                    <p className={styles.fieldValue}>{f.value}</p>
                    <p className={styles.fieldCaption}>{f.caption}</p>
                  </Field>
                ))}
                <Field phase={copy.sheet.mgmt.decision.phase} label={copy.sheet.mgmt.decision.label}>
                  <div className={styles.decisions}>
                    {copy.sheet.mgmt.decision.options.map((o) => (
                      <div key={o.key} className={cn(styles.decision, styles[`decision_${o.key}`])}>
                        <span className={styles.decisionName}>{o.label}</span>
                        <span className={styles.decisionRule}>{o.rule}</span>
                        <span className={styles.decisionThen}>{o.then}</span>
                      </div>
                    ))}
                  </div>
                </Field>
              </aside>
            </div>
          )}
        </div>

        {/* ── Cena 2: cadência e organização ────────────────────────── */}
        <div data-scene="2" className={cn(styles.scene, "pre")}>
          <div className="grid-12 items-start gap-y-6">
            <div className="col-span-12 lg:col-span-8">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h3 className="t-title text-[length:var(--fs-title)]">{copy.cadence.title}</h3>
                <Tag kind="concept">{copy.cadence.tag}</Tag>
                <span className="text-[13px] text-fg-3">{copy.cadence.sub}</span>
              </div>
              <table className={styles.ritualTable} aria-label={copy.cadence.ariaLabel}>
                <thead>
                  <tr>
                    <th scope="col">{copy.cadence.cols.freq}</th>
                    <th scope="col">{copy.cadence.cols.ritual}</th>
                    <th scope="col">{copy.cadence.cols.weeks}</th>
                    <th scope="col">{copy.cadence.cols.phases}</th>
                  </tr>
                </thead>
                <tbody>
                  {copy.cadence.rituals.map((r) => (
                    <tr key={r.freq} data-a="ritual">
                      <td className={styles.freq}>{r.freq}</td>
                      <td>
                        <span className={styles.ritualName}>{r.name}</span>
                        <span className={styles.ritualDesc}>{r.desc}</span>
                      </td>
                      <td>
                        <span className={styles.weeks} role="img" aria-label={copy.cadence.weeksAria.replace("{n}", String(r.weeks.length))}>
                          {Array.from({ length: copy.cadence.weeks }, (_, w) => (
                            <i key={w} data-a="week" className={styles.week} data-on={(r.weeks as readonly number[]).includes(w + 1) ? "" : undefined} />
                          ))}
                        </span>
                      </td>
                      <td>
                        <span className={styles.phaseList}>
                          {r.phases.length === PHASES.length ? (
                            <span className={styles.phasePill}>{copy.cadence.all}</span>
                          ) : (
                            r.phases.map((p) => (
                              <span key={p} className={styles.phasePill} title={PHASES[p].name}>
                                {PHASES[p].n}
                              </span>
                            ))
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <aside className="col-span-12 lg:col-span-4" aria-label={copy.cadence.artifactsTitle}>
              <p className="t-label mb-3 text-fg-3">{copy.cadence.artifactsTitle}</p>
              <div className={styles.artifacts}>
                {copy.cadence.artifacts.map((a) => (
                  <div key={a.key} data-a="artifact" className={styles.artifact}>
                    <p className={styles.artifactName}>{a.name}</p>
                    <p className={styles.artifactDesc}>
                      <Emphasis text={a.desc} />
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  phase,
  label,
  tag,
  tagKind = "example",
  className,
  children,
}: {
  phase: number;
  label: string;
  tag?: string;
  tagKind?: "example" | "concept";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-a="field" className={cn(styles.field, className)}>
      <div className={styles.fieldTop}>
        <span className={styles.phaseChip}>{phaseLabel(phase)}</span>
        <span className={styles.fieldLabel}>{label}</span>
        {tag && <Tag kind={tagKind}>{tag}</Tag>}
      </div>
      {children}
    </div>
  );
}
