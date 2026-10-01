"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ActionBriefCard } from "@/components/ui/ActionBrief";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { StageDots, StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { Toggle } from "@/components/ui/Toggle";
import { PACK, STAGES, growthById, type Stage } from "@/content/projects";
import { copy } from "@/content/slides/03b-method";
import { fmtDec, fmtInt } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { DUR, EASE, fade, hold, motionPrefs, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S03bMethod.module.css";

type Triple = readonly [number, number, number];
type Formula = "product" | "mean";

const ROW_H = 46;
/** "Próxima janela": as três primeiras do ranking entram no próximo ciclo. */
const CUT = 3;

const PHASES = copy.cycle.phases;
const COUNTS = Object.fromEntries(STAGES.map((s) => [s, PACK.filter((g) => g.stage === s).length])) as Record<Stage, number>;

// Ranking ICE: só o que ainda não está rodando (lido de projects.ts).
const ITEMS = PACK.filter((g) => g.stage !== "rodando");
const SEED = copy.ice.initial as Record<string, Triple>;
const INITIAL: Record<string, Triple> = Object.fromEntries(ITEMS.map((g) => [g.id, SEED[g.id] ?? ([5, 5, 5] as const)]));
const scoreOf = (t: Triple, f: Formula) => (f === "product" ? t[0] * t[1] * t[2] : (t[0] + t[1] + t[2]) / 3);
const rankIds = (scores: Record<string, Triple>, f: Formula) =>
  [...ITEMS].sort((a, b) => scoreOf(scores[b.id], f) - scoreOf(scores[a.id], f) || a.name.localeCompare(b.name, "pt-BR")).map((g) => g.id);
const INITIAL_RANK = rankIds(INITIAL, "product");

const EXAMPLE = growthById(copy.sheet.actionId);
const phaseLabel = (p: number) => `${PHASES[p].n} · ${PHASES[p].name}`;
/** A ficha do exemplo, anotada com a fase do ciclo de cada bloco. */
const SHEET_PHASES = {
  why: phaseLabel(copy.sheet.phases.why),
  how: phaseLabel(copy.sheet.phases.how),
  metric: phaseLabel(copy.sheet.phases.metric),
};

/**
 * O método em quatro cenas: o ciclo (ligado aos estágios do pack), a priorização ICE,
 * a ficha que toda ação segue e a cadência que mantém o ciclo girando.
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
        rise(tl, q('[data-a="ice-head"]'), 0.3, { y: 8 });
        tl.from(q('[data-a="row"]'), { autoAlpha: 0, duration: DUR.s, ease: EASE.soft, stagger: 0.05 }, 0.4);
        fade(tl, q('[data-a="cut"]'), 0.85);
        rise(tl, q('[data-a="ice-panel"]'), 0.45, { y: 14 });
      });
      step(2, (tl) => {
        swap(tl, 1, 2);
        rise(tl, q('[data-a="sheet"]'), 0.3, { y: 16 });
        rise(tl, q('[data-a="sheet"] [data-a="brief-row"]'), 0.45, { stagger: 0.05, y: 8 });
        rise(tl, q('[data-a="mgmt"]'), 0.5, { y: 16 });
        rise(tl, q('[data-a="field"]'), 0.7, { stagger: 0.08, y: 10 });
      });
      step(3, (tl) => {
        swap(tl, 2, 3);
        rise(tl, q('[data-a="ritual"]'), 0.3, { stagger: 0.08, y: 10 });
        tl.from(q('[data-a="week"]'), { autoAlpha: 0, duration: DUR.xs, stagger: 0.006, ease: EASE.soft }, 0.5);
        rise(tl, q('[data-a="artifact"]'), 0.7, { stagger: 0.1, y: 12 });
        hold(tl, 0.2);
      });
    },
    [flow],
  );

  // ── Simulação ICE ──────────────────────────────────────────────────
  const [scores, setScores] = useState<Record<string, Triple>>(INITIAL);
  const [selected, setSelected] = useState<string>(INITIAL[copy.ice.defaultSelected] ? copy.ice.defaultSelected : INITIAL_RANK[0]);
  const [formula, setFormula] = useState<Formula>("product");
  const ranking = useMemo(() => rankIds(scores, formula), [scores, formula]);
  const max = formula === "product" ? 1000 : 10;
  const fmt = formula === "product" ? fmtInt : fmtDec;
  const listRef = useRef<HTMLOListElement>(null);

  // As linhas trocam de lugar quando o ranking muda (o GSAP cuida da posição; o React não toca nela).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.querySelectorAll<HTMLElement>("[data-row]").forEach((el) => {
      const r = ranking.indexOf(el.dataset.row ?? "");
      gsap.to(el, { y: r * ROW_H, duration: motionPrefs.reduced ? 0 : 0.55, ease: "power3.inOut", overwrite: "auto" });
    });
  }, [ranking]);

  const current = scores[selected];
  const selectedProject = growthById(selected);
  const setValue = (k: 0 | 1 | 2, v: number) =>
    setScores((s) => {
      const next = [...s[selected]] as [number, number, number];
      next[k] = v;
      return { ...s, [selected]: next };
    });

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

        {/* ── Cena 1: priorizar com ICE ─────────────────────────────── */}
        <div data-scene="1" className={cn(styles.scene, styles.sceneTop, "pre")}>
          <div className={cn("grid-12 gap-y-6", styles.iceGrid)}>
            <div className="col-span-12 lg:col-span-7">
              <div data-a="ice-head" className={styles.iceHead} role="presentation">
                <span className={styles.iceNum} title={copy.ice.colTitles.rank}>
                  {copy.ice.cols.rank}
                </span>
                <span>{copy.ice.cols.action}</span>
                <span className={styles.iceNum} title={copy.ice.colTitles.i}>
                  {copy.ice.cols.i}
                </span>
                <span className={styles.iceNum} title={copy.ice.colTitles.c}>
                  {copy.ice.cols.c}
                </span>
                <span className={styles.iceNum} title={copy.ice.colTitles.e}>
                  {copy.ice.cols.e}
                </span>
                <span title={copy.ice.colTitles.score}>{copy.ice.cols.score}</span>
              </div>
              <ol ref={listRef} className={styles.iceList} style={{ height: ITEMS.length * ROW_H }} aria-label={copy.ice.listLabel}>
                {ITEMS.map((g) => {
                  const t = scores[g.id];
                  const s = scoreOf(t, formula);
                  const r = ranking.indexOf(g.id);
                  return (
                    <li
                      key={g.id}
                      data-row={g.id}
                      data-a="row"
                      className={styles.iceItem}
                      style={{ "--r0": INITIAL_RANK.indexOf(g.id) } as CSSProperties}
                    >
                      <button
                        type="button"
                        className={styles.iceRow}
                        aria-pressed={selected === g.id}
                        aria-label={`${r + 1}º: ${g.name}. ${copy.ice.colTitles.i} ${t[0]}, ${copy.ice.colTitles.c} ${t[1]}, ${copy.ice.colTitles.e} ${t[2]}. ${copy.ice.score} ${fmt(s)}`}
                        onClick={() => setSelected(g.id)}
                      >
                        <span className={styles.rank}>{r + 1}</span>
                        <span className={styles.iceName}>
                          <StageDots stage={g.stage} className={styles[`dots_${g.stage}`]} />
                          <span>{g.name}</span>
                        </span>
                        <span className={styles.iceVal}>{t[0]}</span>
                        <span className={styles.iceVal}>{t[1]}</span>
                        <span className={styles.iceVal}>{t[2]}</span>
                        <span className={styles.scoreCell}>
                          <span className={styles.bar}>
                            <span className={styles.barFill} style={{ transform: `scaleX(${Math.min(1, s / max)})` }} />
                          </span>
                          <span className={styles.scoreNum}>{fmt(s)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                {ITEMS.length > CUT && (
                  <li data-a="cut" className={styles.cut} style={{ top: CUT * ROW_H }} aria-hidden="true">
                    <span>{copy.ice.cut}</span>
                  </li>
                )}
              </ol>
              <p data-a="ice-head" className="mt-4 text-[13px] text-fg-3">
                {copy.ice.sub}
              </p>
            </div>

            <div data-a="ice-panel" className={cn("col-span-12 lg:col-span-5", styles.icePanel)}>
              <SimPanel title={copy.ice.title} tag={copy.ice.tag} note={copy.ice.note}>
                {selectedProject && (
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h4 className={styles.selName}>{selectedProject.name}</h4>
                    <StageTag stage={selectedProject.stage} />
                  </div>
                )}
                <div className="grid gap-2.5">
                  {copy.ice.sliders.map((sl, k) => (
                    <Slider
                      key={sl.key}
                      label={sl.label}
                      hint={sl.hint}
                      min={1}
                      max={10}
                      value={current[k]}
                      onChange={(v) => setValue(k as 0 | 1 | 2, v)}
                    />
                  ))}
                </div>
                <div className={styles.result}>
                  <div>
                    <p className="t-label text-fg-3">{copy.ice.score}</p>
                    <p className="mt-1 text-[13px] text-fg-2">
                      {copy.ice.rank.replace("{r}", String(ranking.indexOf(selected) + 1)).replace("{n}", String(ITEMS.length))}
                    </p>
                  </div>
                  <span className={styles.resultNum}>{fmt(scoreOf(current, formula))}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <Toggle
                    size="sm"
                    label={copy.ice.formulaLabel}
                    value={formula}
                    onChange={setFormula}
                    options={copy.ice.formulas}
                  />
                  <button type="button" className={styles.reset} onClick={() => setScores(INITIAL)}>
                    {copy.ice.reset}
                  </button>
                </div>
                <p className={styles.formula}>{copy.ice.formulaText[formula]}</p>
              </SimPanel>
            </div>
          </div>
        </div>

        {/* ── Cena 2: a ficha de cada ação ──────────────────────────── */}
        <div data-scene="2" className={cn(styles.scene, "pre")}>
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

        {/* ── Cena 3: cadência e organização ────────────────────────── */}
        <div data-scene="3" className={cn(styles.scene, "pre")}>
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
