"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { deck } from "@/components/deck/deck-store";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { CityDemandMap, type SimView, type StoryCounts } from "@/components/diagrams/CityDemandMap";
import { HUB, MAX_DOTS, SLOTS, type Pt } from "@/components/diagrams/cityDemandGeometry";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { Toggle } from "@/components/ui/Toggle";
import { copy } from "@/content/slides/13-captains";
import { fmtInt, fmtPct } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { draw, fade, motionPrefs, pop, rise, unmask } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S13Captains.module.css";

// ── Modelo da simulação (premissas expostas no painel) ──────────────────
const T = copy.sim.thresholds;
const D = copy.sim.defaults;
/** Fração de rostos novos a cada treino (premissa fixa, declarada na nota). */
const NEW_SHARE = 0.08;
/** Corredores desenhados por ID recorrente (escala visual do mapa). */
const DOT_K = 0.55;

type Inputs = {
  captains: number;
  perSession: number;
  sessions: number;
  weeks: number;
  recurring: number;
  companies: number;
};

function simulate(v: Inputs) {
  // Pessoas alcançadas por capitão: a turma inicial + ~8% de rostos novos a cada treino.
  const reach = v.perSession * (1 + NEW_SHARE * (v.sessions * v.weeks - 1));
  const ids = SLOTS.map((s, i) => (i < v.captains ? reach * v.recurring * s.pull : 0));
  const total = ids.reduce((a, b) => a + b, 0);
  const above = ids.map((x) => x >= T.idsPerHood);
  const hoods = above.filter(Boolean).length;
  const criteria = [
    hoods >= T.hoods,
    v.perSession >= T.perSession,
    v.weeks >= T.weeks && v.recurring >= T.recurring - 1e-9,
    v.companies >= T.companies,
  ];
  const open = criteria.every(Boolean);
  let hub: Pt | null = null;
  if (open) {
    if (above[0] && above[1]) hub = HUB;
    else {
      const top = ids
        .map((x, i) => ({ x, i }))
        .filter((o) => above[o.i])
        .sort((a, b) => b.x - a.x)
        .slice(0, 2)
        .map((o) => SLOTS[o.i].at);
      hub = [(top[0][0] + top[1][0]) / 2, (top[0][1] + top[1][1]) / 2];
    }
  }
  return {
    total,
    hoods,
    criteria,
    open,
    view: {
      captains: v.captains,
      dots: ids.map((x) => Math.min(MAX_DOTS, Math.round(x * DOT_K))),
      heat: ids.map((x) => 0.05 + 0.27 * Math.min(1, x / 60)),
      above,
      companies: v.companies,
      hub,
    } satisfies SimView,
  };
}

// A história usa exatamente o resultado do simulador nas premissas padrão: o mapa não "pula" ao trocar de camada.
const BASE = simulate({ ...D });
const STORY: StoryCounts = {
  final: BASE.view.dots.slice(0, 3),
  open: BASE.view.dots.slice(0, 3).map((n) => Math.round(n * 0.42)),
  grow: BASE.view.dots.slice(0, 3).map((n, i) => (i < 2 ? Math.round(n * 0.86) : n)),
};

const N = copy.steps.length;
const railAt = (k: number) => (k + 0.5) / N;
const fmtYes = (v: number) => (v >= 0.5 ? copy.sim.yes : copy.sim.notYet);
const fmtPctInput = (v: number) => fmtPct(v);
const COMPANY_OPTIONS = copy.sim.companyOptions.map((o) => ({
  value: o,
  label: o,
}));

const getMode = () => deck.getSnapshot().mode;
const getServerMode = () => "deck" as const;

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 6.4 5 8.8l4.6-5.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CaptainsSlide() {
  const { index, step, entered, current } = useSlide();
  const mode = useSyncExternalStore(deck.subscribe, getMode, getServerMode);
  const flow = mode === "flow";

  const [inputs, setInputs] = useState<Inputs>({ ...D });
  const set = useCallback(
    <K extends keyof Inputs>(k: K) =>
      (v: Inputs[K]) =>
        setInputs((s) => ({ ...s, [k]: v })),
    [],
  );
  const result = useMemo(() => simulate(inputs), [inputs]);
  const fmtHoods = useCallback((v: number) => `${fmtInt(v)} ${copy.sim.of} ${inputs.captains}`, [inputs.captains]);

  const { scope } = useStepTimeline(
    ({ step: at, q, reduced }) => {
      const els = (name: string) => q(`[data-a="${name}"]`);
      const steps = els("step");
      const texts = els("step-text");
      const nums = els("num-on");
      const rail = els("rail-progress");
      const legend = (k: number) => els(`legend-${k}`);
      const countTo = (tl: gsap.core.Timeline, el: Element | undefined, from: number, to: number, pos: number) => {
        if (!el) return;
        const o = { v: from };
        tl.to(
          o,
          {
            v: to,
            duration: reduced ? 0.3 : 0.9,
            ease: "power2.out",
            onUpdate: () => void (el.textContent = fmtInt(o.v)),
          },
          pos,
        );
      };
      /** Avança a lista: o passo anterior fica "feito", o atual acende. */
      const activate = (tl: gsap.core.Timeline, k: number) => {
        if (k > 0) {
          tl.to(texts[k - 1], { opacity: 0.58, duration: 0.4 }, 0).to(nums[k - 1], { opacity: 0, duration: 0.3 }, 0);
        }
        tl.to(texts[k], { opacity: 1, duration: 0.45 }, 0.05)
          .to(nums[k], { opacity: 1, duration: 0.4 }, 0.05)
          .to(rail, { scaleY: railAt(k), duration: 0.6, ease: "power2.inOut" }, 0);
      };

      // s0 — manchete, a cidade e o passo 01: capitães.
      at(0, (tl) => {
        revealHeader(tl, q);
        rise(tl, els("map-head"), 0.25, { y: 10 });
        if (reduced) {
          fade(tl, [...els("outline"), ...els("cell"), ...els("avenue"), ...els("ring-road")], 0.2);
        } else {
          tl.from(els("outline"), { drawSVG: "0%", duration: 1.5, ease: "power2.inOut" }, 0.15);
          fade(tl, els("cell"), 0.35, {
            stagger: { each: 0.04, from: "center" },
            duration: 0.7,
          });
          draw(tl, els("avenue"), 0.7, { stagger: 0.07, duration: 0.9 });
          draw(tl, els("ring-road"), 0.8, { duration: 1.1 });
        }
        rise(tl, steps, 0.4, { stagger: 0.05, y: 12, duration: 0.7 });
        tl.fromTo(rail, { scaleY: 0 }, { scaleY: railAt(0), duration: 0.6, ease: "power2.inOut" }, 0.9);
        tl.to(texts[0], { opacity: 1, duration: 0.45 }, 0.95).to(nums[0], { opacity: 1, duration: 0.4 }, 0.95);
        pop(tl, els("captain"), 1.25, { stagger: 0.16, duration: 0.6 });
        rise(tl, legend(0), 1.4, { y: 6 });
      });

      // s1 — 02 BORA OPEN: treinos abertos geram os primeiros IDs ao redor dos capitães.
      at(1, (tl) => {
        activate(tl, 1);
        if (!reduced) {
          tl.set(els("ripple"), { opacity: 0.75, scale: 1, transformOrigin: "50% 50%" }, 0.2).to(
            els("ripple"),
            {
              opacity: 0,
              scale: 5,
              duration: 1.2,
              ease: "power2.out",
              stagger: 0.1,
            },
            0.2,
          );
        }
        tl.from(
          q('[data-a="dot"][data-phase="open"]'),
          {
            autoAlpha: 0,
            scale: reduced ? 1 : 0,
            transformOrigin: "50% 50%",
            duration: 0.5,
            stagger: { each: 0.018 },
            ease: "back.out(2)",
          },
          0.35,
        );
        rise(tl, legend(1), 0.6, { y: 6 });
      });

      // s2 — 03 comunidade: gente chega de toda a cidade e os grupos crescem.
      at(2, (tl) => {
        activate(tl, 2);
        tl.from(
          q('[data-a="dot"][data-phase="grow"]'),
          {
            x: (_: number, el: Element) => (reduced ? 0 : Number((el as SVGElement).dataset.dx)),
            y: (_: number, el: Element) => (reduced ? 0 : Number((el as SVGElement).dataset.dy)),
            autoAlpha: 0,
            duration: reduced ? 0.5 : 1.5,
            ease: "power3.inOut",
            stagger: { each: 0.01, from: "random" },
          },
          0.15,
        );
        fade(tl, els("scatter"), 0.4, { stagger: 0.03, duration: 0.6 });
        fade(tl, els("halo"), 1.2, { duration: 0.7, stagger: 0.1 });
      });

      // s3 — 04 desafios: parte da comunidade assume uma meta com prazo.
      at(3, (tl) => {
        activate(tl, 3);
        pop(tl, els("challenge"), 0.3, {
          stagger: { each: 0.03, from: "random" },
          duration: 0.5,
        });
        rise(tl, legend(2), 0.6, { y: 6 });
      });

      // s4 — 05 empresas do entorno entram em teste.
      at(4, (tl) => {
        activate(tl, 4);
        pop(tl, els("company"), 0.3, { stagger: 0.2, duration: 0.6 });
        fade(tl, els("co-link"), 0.6, { stagger: 0.2, duration: 0.6 });
        rise(tl, legend(3), 0.6, { y: 6 });
      });

      // s5 — 06 medir: calor por bairro e o limiar (hipótese).
      at(5, (tl) => {
        activate(tl, 5);
        const heat = [0.13, 0.11, 0.08];
        heat.forEach((h, s) => tl.to(els(`heat-${s}`), { opacity: h, duration: 0.8, ease: "power2.out" }, 0.2 + s * 0.08));
        [0, 1, 2].forEach((s) => rise(tl, els(`hood-${s}`), 0.4 + s * 0.08, { y: 6, duration: 0.5 }));
        rise(tl, els("density"), 0.3, { y: 14 });
        copy.density.measured.forEach((v, s) => {
          tl.fromTo(els(`bar-${s}`), { scaleX: 0 }, { scaleX: v / copy.density.max, duration: 0.9, ease: "power3.out" }, 0.55 + s * 0.08);
          countTo(tl, els(`val-${s}`)[0], 0, v, 0.55 + s * 0.08);
        });
        fade(tl, els("threshold"), 0.9, { duration: 0.5 });
      });

      // s6 — 07 validar: dois bairros passam do limiar e nasce um BORA HUB.
      at(6, (tl) => {
        activate(tl, 6);
        copy.density.validated.forEach((v, s) => {
          tl.to(els(`bar-${s}`), { scaleX: v / copy.density.max, duration: 1, ease: "power3.inOut" }, 0.2 + s * 0.06);
          countTo(tl, els(`val-${s}`)[0], copy.density.measured[s], v, 0.2 + s * 0.06);
        });
        tl.to(els("bar-hot-0"), { opacity: 1, duration: 0.5 }, 0.8).to(els("bar-hot-1"), { opacity: 1, duration: 0.5 }, 0.9);
        BASE.view.heat.slice(0, 3).forEach((h, s) => tl.to(els(`heat-${s}`), { opacity: h, duration: 0.9 }, 0.3));
        tl.from(
          q('[data-a="dot"][data-phase="late"]'),
          {
            autoAlpha: 0,
            scale: reduced ? 1 : 0,
            transformOrigin: "50% 50%",
            duration: 0.4,
            stagger: 0.04,
          },
          0.4,
        );
        draw(tl, els("above"), 0.85, { duration: 0.9, stagger: 0.12 });
        pop(tl, els("hub"), 1.3, { duration: 0.7 });
        pop(tl, els("hub-mark"), 1.45, { duration: 0.5 });
        rise(tl, els("hub-label"), 1.55, { y: 8, duration: 0.6 });
        rise(tl, legend(4), 1.6, { y: 6 });
      });

      // s7 — portão: abrir operação completa? Só com os quatro sinais.
      at(7, (tl) => {
        if (!flow)
          tl.to(
            els("flow-pane"),
            {
              autoAlpha: 0,
              y: reduced ? 0 : -12,
              duration: 0.45,
              ease: "power2.in",
            },
            0,
          );
        tl.from(els("gate-pane"), { autoAlpha: 0, duration: 0.3 }, flow ? 0 : 0.35);
        rise(tl, els("gate-head"), flow ? 0 : 0.4, { y: 12 });
        rise(tl, q('[data-a="gate-pane"] .dt-row'), flow ? 0.05 : 0.5, {
          stagger: 0.08,
          y: 10,
        });
        pop(tl, els("check"), flow ? 0.3 : 0.85, {
          stagger: 0.16,
          duration: 0.45,
        });
        rise(tl, els("decision"), flow ? 0.4 : 1.45, { y: 8 });
        tl.from(els("statement"), { autoAlpha: 0, duration: 0.01 }, flow ? 0.4 : 1.5);
        unmask(tl, q('[data-a="statement"] .split-unit'), flow ? 0.4 : 1.5, {
          stagger: 0.06,
        });
      });

      // s8 — simulador: o mapa passa a responder às premissas.
      at(8, (tl) => {
        if (!flow) {
          tl.to(
            els("gate-pane"),
            {
              autoAlpha: 0,
              y: reduced ? 0 : -12,
              duration: 0.45,
              ease: "power2.in",
            },
            0,
          );
          tl.to(
            [...els("story"), ...els("hood-0"), ...els("hood-1"), ...els("hood-2"), ...els("hub-label"), ...els("hub-mark")],
            { autoAlpha: 0, duration: 0.5 },
            0.2,
          );
        }
        tl.from([...els("sim"), ...els("sim-labels")], { autoAlpha: 0, duration: 0.5 }, flow ? 0 : 0.2);
        rise(tl, els("sim-pane"), flow ? 0 : 0.35, { y: 18 });
      });

      // s9 — a ficha da ação.
      at(9, (tl) => revealBrief(tl, q));
    },
    [flow],
  );

  // BORA HUB pulsando (só em cena, só depois de nascer, nunca com movimento reduzido).
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || !entered || step < 6 || motionPrefs.reduced) return;
    const pulses = root.querySelectorAll('[data-a="hub-pulse"], [data-a="sim-hub-pulse"]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pulses,
        { scale: 1, opacity: 0.6, transformOrigin: "50% 50%" },
        {
          scale: 2.8,
          opacity: 0,
          duration: 2.2,
          ease: "power1.out",
          stagger: { each: 1.1, repeat: -1 },
          delay: 1.6,
        },
      );
    }, root);
    return () => ctx.revert();
  }, [scope, current, entered, step]);

  const slotLetters = SLOTS.slice(0, 3).map((s) => s.letter);

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className={cn("grid-12 gap-y-10", styles.cols)}>
        {/* ── Narrativa ─────────────────────────────────────────── */}
        <div className={cn("col-span-12 lg:col-span-6 xl:col-span-5", styles.left)}>
          <SectionHeader
            index={index}
            label={copy.label}
            title={copy.headline}
            lede={copy.lede}
            tag={<StageTag of="captains" />}
            titleClassName={styles.title}
          />

          <div className={styles.leftStage}>
            <div data-a="flow-pane" className={styles.flowPane}>
              <div className={styles.stepsWrap}>
                <span className={styles.rail} aria-hidden="true">
                  <span data-a="rail-progress" className={styles.railProgress} />
                </span>
                <ol className={styles.steps}>
                  {copy.steps.map((s, i) => (
                    <li key={s.title} data-a="step" className={styles.step} aria-current={step === i ? "step" : undefined}>
                      <span className={styles.num} aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                        <span data-a="num-on" className={styles.numOn}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </span>
                      <div data-a="step-text" className={styles.stepText}>
                        <p className={styles.stepTitle}>{s.title}</p>
                        <p className={styles.stepBody}>{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div data-a="density" className={styles.density}>
                <div className={styles.densHead}>
                  <span className="t-label">{copy.density.title}</span>
                  <Tag kind="illustrative" />
                </div>
                <div className={styles.bars}>
                  <div className={styles.thresholdWrap} aria-hidden="true">
                    <span
                      data-a="threshold"
                      className={styles.threshold}
                      style={{
                        left: `${(T.idsPerHood / copy.density.max) * 100}%`,
                      }}
                    >
                      <span className={styles.thresholdLabel}>
                        {copy.density.threshold} · {T.idsPerHood}
                      </span>
                    </span>
                  </div>
                  {slotLetters.map((letter, s) => (
                    <div key={letter} className={styles.barRow}>
                      <span className={styles.barKey}>{letter}</span>
                      <span className={styles.track} aria-hidden="true">
                        <span data-a={`bar-${s}`} className={styles.bar} />
                        <span
                          data-a={`bar-hot-${s}`}
                          className={styles.barHot}
                          style={{
                            transform: `scaleX(${copy.density.validated[s] / copy.density.max})`,
                          }}
                        />
                      </span>
                      <span data-a={`val-${s}`} className={styles.barVal}>
                        {copy.density.validated[s]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div data-a="gate-pane" className={styles.gatePane}>
              <div data-a="gate-head" className={styles.gateHead}>
                <h3 className={styles.gateTitle}>{copy.gate.title}</h3>
                <Tag kind="hypothesis" />
              </div>
              <p className={cn("t-label", styles.gateCaption)}>{copy.gate.caption}</p>
              <DataTable
                caption={copy.gate.caption}
                className={styles.gateTable}
                columns={[
                  { key: "criterion", label: copy.gate.columns.criterion },
                  { key: "signal", label: copy.gate.columns.signal },
                  { key: "threshold", label: copy.gate.columns.threshold },
                  {
                    key: "ok",
                    label: "",
                    render: () => (
                      <span data-a="check" className={styles.check}>
                        <CheckIcon />
                      </span>
                    ),
                  },
                ]}
                rows={copy.gate.rows.map((r) => ({ ...r, ok: true }))}
              />
              <p data-a="decision" className={styles.decision}>
                <span className={styles.yes}>{copy.gate.yes}</span>
                {copy.gate.decision}
              </p>
              <div data-a="statement">
                <SplitHeadline as="p" lines={copy.statement} className={cn("t-headline", styles.statement)} />
              </div>
            </div>

            <div data-a="sim-pane" className={styles.simPane}>
              <SimPanel title={copy.sim.title} note={copy.sim.note} className={styles.sim}>
                <div className={styles.sliders}>
                  <Slider label={copy.sim.inputs.captains} value={inputs.captains} min={1} max={SLOTS.length} onChange={set("captains")} />
                  <Slider
                    label={copy.sim.inputs.perSession}
                    value={inputs.perSession}
                    min={10}
                    max={80}
                    step={5}
                    onChange={set("perSession")}
                  />
                  <Slider label={copy.sim.inputs.sessions} value={inputs.sessions} min={1} max={4} onChange={set("sessions")} />
                  <Slider label={copy.sim.inputs.weeks} value={inputs.weeks} min={4} max={20} onChange={set("weeks")} />
                  <Slider
                    label={copy.sim.inputs.recurring}
                    value={inputs.recurring}
                    min={0.1}
                    max={0.6}
                    step={0.05}
                    onChange={set("recurring")}
                    format={fmtPctInput}
                  />
                  <div className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>{copy.sim.inputs.companies}</span>
                    <Toggle
                      size="sm"
                      label={copy.sim.inputs.companies}
                      options={COMPANY_OPTIONS}
                      value={String(inputs.companies)}
                      onChange={(v) => set("companies")(Number(v))}
                    />
                  </div>
                </div>
                <div className={styles.results}>
                  <Stat value={result.total} label={copy.sim.results.ids} format={fmtInt} />
                  <Stat value={result.hoods} label={copy.sim.results.hoods} format={fmtHoods} />
                  <Stat value={result.open ? 1 : 0} label={copy.sim.results.open} format={fmtYes} accent />
                  <ul className={styles.criteria} aria-label={copy.sim.gateLabel}>
                    {copy.sim.criteria.map((c, i) => (
                      <li key={c} className={cn(styles.crit, result.criteria[i] && styles.critOk)}>
                        <span className={styles.critMark} aria-hidden="true">
                          {result.criteria[i] && <CheckIcon />}
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </SimPanel>
            </div>
          </div>
        </div>

        {/* ── Cidade ────────────────────────────────────────────── */}
        <div className={cn("col-span-12 lg:col-span-6 xl:col-span-7", styles.right)}>
          <div data-a="map-head" className={styles.mapHead}>
            <span className={styles.city}>{copy.city}</span>
            <Tag kind="example">{copy.cityNote}</Tag>
          </div>
          <div className={styles.mapArea}>
            <div className={styles.mapFit}>
              <CityDemandMap story={STORY} sim={result.view} hubLabel={copy.hub} ariaLabel={copy.mapLabel} />
            </div>
          </div>
          <ul className={styles.legend}>
            {[
              { k: 0, cls: styles.lgCaptain, label: copy.legend.captain },
              { k: 1, cls: styles.lgRunner, label: copy.legend.runner },
              { k: 2, cls: styles.lgChallenge, label: copy.legend.challenge },
              { k: 3, cls: styles.lgCompany, label: copy.legend.company },
              { k: 4, cls: styles.lgHub, label: copy.legend.hub },
            ].map((l) => (
              <li key={l.k} data-a={`legend-${l.k}`} className={styles.legendItem}>
                <span className={styles.lgIcon} aria-hidden="true">
                  <i className={l.cls} />
                </span>
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ActionBrief id="captains" />
    </div>
  );
}
