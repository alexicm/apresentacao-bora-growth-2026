"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { deck } from "@/components/deck/deck-store";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Stat } from "@/components/ui/Stat";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { STAGE_LABEL, stageOf } from "@/content/projects";
import { copy, type LabExperiment, type LabItem, type LabPhase } from "@/content/slides/19-brasilia-lab";
import { fmtInt, fmtPct } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { fade, motionPrefs, pop, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S19BrasiliaLab.module.css";

// ── Dados derivados do conteúdo ─────────────────────────────────────────
const PHASES: readonly LabPhase[] = copy.phases;
const ITEMS: readonly LabItem[] = PHASES.flatMap((p) => p.items);
const LAST_PHASE = PHASES.length - 1;
const WEEKS = copy.scrubber.weeks;
const PLAYBOOK_ITEM = PHASES[LAST_PHASE].items[PHASES[LAST_PHASE].items.length - 1].label;

/** Dias cobertos pela semana `w` do plano (semana 1 = dias 0–6; a 13ª fecha no dia 90). */
const weekDays = (w: number) => [7 * (w - 1), Math.min(90, 7 * w - 1)] as const;

/** Estado do plano numa semana: frentes ativas, % concluído, experimentos rodando e fase. */
function labState(week: number) {
  const [a, b] = weekDays(week);
  const active = ITEMS.filter((it) => it.from <= b && it.to >= a);
  const done = ITEMS.filter((it) => it.to <= b).length;
  const running = copy.experiments.rows.filter((r) => r.from <= week && r.to >= week).length;
  const mid = a + 3;
  const phase = PHASES.find((p) => mid >= p.start && mid <= p.end) ?? PHASES[LAST_PHASE];
  return { a, b, active, donePct: done / ITEMS.length, running, phase };
}

const fmtWeek = (v: number) => `${copy.scrubber.weekPrefix} ${v}`;

const getMode = () => deck.getSnapshot().mode;
const getServerMode = () => "deck" as const;

type Row = LabExperiment & { live: boolean; week: number };

function WeekBar({ from, to, week }: { from: number; to: number; week: number }) {
  return (
    <span className={styles.weeks}>
      <span className={cn("t-mono", styles.weeksText)}>{`${from} ${copy.to} ${to}`}</span>
      <span className={styles.gantt} aria-hidden="true">
        {Array.from({ length: WEEKS }, (_, i) => {
          const w = i + 1;
          const on = w >= from && w <= to;
          return (
            <i key={w} className={cn(styles.cell, on && styles.cellOn, w === week && styles.cellNow, on && w === week && styles.cellHit)} />
          );
        })}
      </span>
    </span>
  );
}

const COLUMNS: Column<Row>[] = [
  {
    key: "hypothesis",
    label: copy.experiments.columns.hypothesis,
    className: styles.colHyp,
    render: (r) => (
      <span className={styles.hyp}>
        <span className={cn(styles.liveDot, r.live && styles.liveOn)} aria-hidden="true" />
        <span>
          <span className={styles.product}>
            {r.product}
            {stageOf(r.action) && <span className={styles.productStage}> · {STAGE_LABEL[stageOf(r.action)!]}</span>}
          </span>
          {r.hypothesis}
          {r.live && <span className="sr-only"> ({copy.experiments.liveLabel})</span>}
        </span>
      </span>
    ),
  },
  {
    key: "experiment",
    label: copy.experiments.columns.experiment,
    className: styles.colExp,
  },
  {
    key: "metric",
    label: copy.experiments.columns.metric,
    className: styles.colMetric,
  },
  {
    key: "weeks",
    label: copy.experiments.columns.weeks,
    className: styles.colWeeks,
    render: (r) => <WeekBar from={r.from} to={r.to} week={r.week} />,
  },
];

export function BrasiliaLabSlide() {
  const { index, step, entered, current } = useSlide();
  const mode = useSyncExternalStore(deck.subscribe, getMode, getServerMode);
  const flow = mode === "flow";

  const [week, setWeek] = useState<number>(copy.scrubber.defaultWeek);
  const lab = useMemo(() => labState(week), [week]);
  const rows = useMemo<Row[]>(
    () =>
      copy.experiments.rows.map((r) => ({
        ...r,
        week,
        live: r.from <= week && r.to >= week,
      })),
    [week],
  );

  const { scope } = useStepTimeline(
    ({ step: at, q, reduced }) => {
      const els = (name: string) => q(`[data-a="${name}"]`);

      // s0 — a tese + o eixo de 90 dias.
      at(0, (tl) => {
        revealHeader(tl, q);
        tl.from(
          els("rule"),
          {
            scaleX: 0,
            duration: reduced ? 0.4 : 0.9,
            ease: "power3.inOut",
            stagger: 0.22,
          },
          0.45,
        );
        fade(tl, els("tick"), 0.6, { stagger: 0.18, duration: 0.6 });
      });

      // s1–s3 — uma fase por passo: o progresso volt avança no eixo e as frentes entram.
      PHASES.forEach((_, i) => {
        at(i + 1, (tl) => {
          if (i > 0) tl.to(els(`content-${i - 1}`), { opacity: 0.34, duration: 0.6, ease: "power2.out" }, 0);
          tl.from(els(`progress-${i}`), { scaleX: 0, duration: reduced ? 0.4 : 1.1, ease: "power3.inOut" }, 0);
          rise(tl, els(`head-${i}`), 0.12, { y: 18 });
          rise(tl, els(`item-${i}`), 0.32, {
            stagger: 0.06,
            y: 12,
            duration: 0.7,
          });
          tl.from(
            els(`fill-${i}`),
            {
              autoAlpha: 0,
              scale: reduced ? 1 : 0.3,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
            },
            0.55,
          );
        });
      });

      // s4 — o aprendizado vira Playbook V1, que abre a próxima cidade.
      at(4, (tl) => {
        tl.to(
          PHASES.slice(0, LAST_PHASE).flatMap((_, i) => els(`content-${i}`)),
          { opacity: 1, duration: 0.6 },
          0,
        ).to(q('[data-fill="done"]'), { autoAlpha: 0, duration: 0.5, stagger: 0.012 }, 0);
        tl.from(els("arrow-h"), { scaleX: 0, duration: reduced ? 0.3 : 0.5, ease: "power2.in" }, 0.2).from(
          els("arrow-v"),
          { scaleY: 0, duration: reduced ? 0.3 : 0.35, ease: "power2.out" },
          0.68,
        );
        rise(tl, els("doc"), 0.82, { y: 16 });
        tl.from(
          els("doc-line"),
          {
            scaleX: 0,
            transformOrigin: "0% 50%",
            duration: 0.35,
            stagger: 0.07,
            ease: "power2.out",
          },
          1.05,
        );
        fade(tl, els("doc-kicker"), 1.0, { duration: 0.4 });
        pop(tl, els("doc-badge"), 1.4, { duration: 0.5 });
        rise(tl, els("doc-label"), 1.15, { y: 10 });
        fade(tl, els("connector"), 1.45, { duration: 0.4 });
        pop(tl, els("ring"), 1.55, { duration: 0.7 });
        rise(tl, els("next-label"), 1.7, { y: 10 });
      });

      // s5 — console: experimentos + semana a semana.
      at(5, (tl) => {
        if (!flow)
          tl.to(
            els("plan"),
            {
              autoAlpha: 0,
              y: reduced ? 0 : -14,
              duration: 0.5,
              ease: "power2.in",
            },
            0,
          );
        tl.from(els("console"), { autoAlpha: 0, duration: 0.3 }, flow ? 0 : 0.35);
        rise(tl, els("console-head"), flow ? 0 : 0.4, { y: 12 });
        rise(tl, q(".dt-row"), flow ? 0.1 : 0.5, { stagger: 0.06, y: 10 });
        rise(tl, els("sim"), flow ? 0.1 : 0.6, { y: 18 });
      });
    },
    [flow],
  );

  // Próxima cidade: o anel tracejado gira devagar (só em cena, nunca com movimento reduzido).
  useEffect(() => {
    const root = scope.current;
    // No modo deck o anel só aparece no passo 4 (no 5 o console o cobre); no modo fluxo continua visível.
    if (!root || !current || !entered || step < 4 || (step > 4 && !flow) || motionPrefs.reduced) return;
    const spin = root.querySelector('[data-a="ring-spin"]');
    if (!spin) return;
    const tween = gsap.to(spin, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 40,
      ease: "none",
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, [scope, current, entered, step, flow]);

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <SectionHeader index={index} label={copy.label} title={copy.headline} tag={<StageTag of="lab" />} />

      <div className={styles.stage}>
        {/* ── Plano: eixo, fases e saída ───────────────────────────── */}
        <div data-a="plan" className={styles.plan}>
          <p className={cn("sh-lede t-lede", styles.lede)}>{copy.lede}</p>

          <div className={cn("grid-12 gap-y-8", styles.timeline)}>
            <div className={cn("col-span-12 md:col-span-9", styles.phases)}>
              {PHASES.map((p, i) => (
                <section key={p.id} className={styles.phase} aria-label={`${p.name} · ${p.range}`}>
                  <div className={styles.axis} aria-hidden="true">
                    <span data-a="tick" className={styles.tick}>
                      {i === 0 ? `${copy.dayPrefix} ${p.start}` : p.start - 1}
                    </span>
                    <span className={styles.tickMark} />
                    {i === LAST_PHASE && (
                      <>
                        <span data-a="tick" className={cn(styles.tick, styles.tickEnd)}>
                          {`${p.end} ${copy.days}`}
                        </span>
                        <span className={cn(styles.tickMark, styles.tickMarkEnd)} />
                      </>
                    )}
                    <span data-a="rule" className={styles.rule} />
                    <span data-a={`progress-${i}`} className={styles.progress} />
                  </div>

                  <div data-a={`content-${i}`} className={styles.content}>
                    <header data-a={`head-${i}`}>
                      <p className={styles.phaseMeta}>
                        <span className={styles.phaseIndex}>{p.index}</span>
                        <span className={cn("t-label", styles.phaseRange)}>{p.range}</span>
                      </p>
                      <h3 className={styles.phaseName}>{p.name}</h3>
                    </header>
                    <ul className={styles.items}>
                      {p.items.map((it) => {
                        const isPlaybook = it.label === PLAYBOOK_ITEM;
                        return (
                          <li key={it.label} data-a={`item-${i}`} className={styles.item}>
                            <span className={styles.itemDot} aria-hidden="true">
                              <span data-a={`fill-${i}`} data-fill={isPlaybook ? "keep" : "done"} className={styles.itemFill} />
                            </span>
                            <span className={cn(styles.itemLabel, isPlaybook && styles.itemKey)}>{it.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </section>
              ))}
            </div>

            <aside className={cn("col-span-12 md:col-span-3", styles.output)}>
              <div className={styles.outAxis} aria-hidden="true">
                <span data-a="arrow-h" className={styles.arrowH} />
              </div>
              <span data-a="arrow-v" className={styles.arrowV} aria-hidden="true" />

              <div data-a="doc" className={styles.doc} aria-hidden="true">
                <svg viewBox="0 0 120 152" preserveAspectRatio="none">
                  <path
                    className={styles.docSheet}
                    d="M12 1 H90 L119 30 V140 A11 11 0 0 1 108 151 H12 A11 11 0 0 1 1 140 V12 A11 11 0 0 1 12 1 Z"
                  />
                  <path className={styles.docFold} d="M90 1 V21 A9 9 0 0 0 99 30 H119 Z" />
                  <rect data-a="doc-line" className={styles.docLineStrong} x="15" y="40" width="62" height="5" rx="2.5" />
                  <rect data-a="doc-line" className={styles.docLine} x="15" y="58" width="88" height="3" rx="1.5" />
                  <rect data-a="doc-line" className={styles.docLine} x="15" y="70" width="80" height="3" rx="1.5" />
                  <rect data-a="doc-line" className={styles.docLine} x="15" y="82" width="86" height="3" rx="1.5" />
                  <rect data-a="doc-line" className={styles.docLine} x="15" y="94" width="58" height="3" rx="1.5" />
                  <rect data-a="doc-line" className={styles.docLine} x="15" y="112" width="44" height="3" rx="1.5" />
                </svg>
                <span data-a="doc-kicker" className={styles.docKicker}>
                  {copy.output.kicker}
                </span>
                <span data-a="doc-badge" className={styles.docBadge}>
                  {copy.output.version}
                </span>
              </div>
              <div data-a="doc-label" className={styles.docLabel}>
                <p className={styles.docTitle}>
                  {copy.output.playbook} <span className={styles.version}>{copy.output.version}</span>
                </p>
                <p className={styles.caption}>{copy.output.caption}</p>
              </div>

              <span data-a="connector" className={styles.connector} aria-hidden="true" />
              <div data-a="ring" className={styles.ring}>
                <svg data-a="ring-spin" className={styles.ringSpin} viewBox="0 0 100 100" aria-hidden="true">
                  <circle className={styles.ringCircle} cx="50" cy="50" r="48" />
                </svg>
                <span className={styles.ringQ} aria-hidden="true">
                  ?
                </span>
              </div>
              <div data-a="next-label" className={styles.nextLabel}>
                <p className={styles.docTitle}>{copy.output.next}</p>
                <p className={styles.caption}>{copy.output.nextCaption}</p>
              </div>
            </aside>
          </div>
        </div>

        {/* ── Console: experimentos + semana a semana ──────────────── */}
        <div data-a="console" className={cn("grid-12 gap-y-6", styles.console)}>
          <div className="col-span-12 lg:col-span-8">
            <div data-a="console-head" className={styles.consoleHead}>
              <h3 className={cn("t-title", styles.consoleTitle)}>{copy.experiments.title}</h3>
              <Tag kind="hypothesis">{copy.experiments.tag}</Tag>
            </div>
            <div className={styles.tableScroll}>
              <DataTable<Row>
                caption={copy.experiments.title}
                className={styles.table}
                columns={COLUMNS}
                rows={rows}
                rowKey={(r) => r.product}
              />
            </div>
          </div>

          <div data-a="sim" className="col-span-12 lg:col-span-4">
            <SimPanel title={copy.scrubber.title} tag={copy.scrubber.tag} note={copy.scrubber.note}>
              <Slider label={copy.scrubber.slider} value={week} min={1} max={WEEKS} onChange={setWeek} format={fmtWeek} />
              <p className={styles.phaseNow} aria-live="polite">
                {copy.scrubber.phaseLabel}: <b>{lab.phase.name}</b> · {copy.days} {lab.a} {copy.to} {lab.b}
              </p>
              <div className={styles.stats}>
                <Stat value={lab.donePct} label={copy.scrubber.stats.done} format={fmtPct} accent />
                <Stat value={lab.active.length} label={copy.scrubber.stats.active} format={fmtInt} />
                <Stat value={lab.running} label={copy.scrubber.stats.running} format={fmtInt} />
              </div>
              <p className={cn("t-label", styles.activeHead)}>{copy.scrubber.activeLabel}</p>
              <p className={styles.activeList}>
                {lab.active.map((it, i) => (
                  <span key={it.label}>
                    {i > 0 && (
                      <span className={styles.sep} aria-hidden="true">
                        {" "}
                        ·{" "}
                      </span>
                    )}
                    {it.label}
                  </span>
                ))}
              </p>
            </SimPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
