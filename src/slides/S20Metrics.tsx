"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useSlide } from "@/components/deck/hooks";
import { FLOW_QUERY } from "@/components/deck/deck-store";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { MetricTree } from "@/components/diagrams/MetricTree";
import { InteractiveTooltip, useTooltip } from "@/components/ui/InteractiveTooltip";
import { SectionHeader, revealHeader, revealHighlights } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/20-metrics";
import { fmtBRL, fmtDec, fmtInt, fmtPct } from "@/lib/format";
import { fade, pop, rise } from "@/lib/motion";
import { clamp, cn } from "@/lib/utils";
import styles from "./S20Metrics.module.css";

type LayerKey = (typeof copy.composition.layers)[number]["key"];
/** Ramos ligados às simulações do último passo: Rede (composição) e Economia (payback). */
const SIM_BRANCHES = [0, 3] as const;

const fmtShare = (v: number) => fmtPct(v);
const fmtMonths = (v: number) => (v > 12 ? copy.payback.over : fmtDec(v));
const fmtMargin = (v: number) => `${fmtBRL(v)}${copy.payback.perMonth}`;

export function MetricsSlide() {
  const { index, step } = useSlide();
  const [layers, setLayers] = useState<Record<LayerKey, number>>(
    () => Object.fromEntries(copy.composition.layers.map((l) => [l.key, l.value])) as Record<LayerKey, number>,
  );
  const [cac, setCac] = useState(300);
  const [margin, setMargin] = useState(120);
  // Largura da barra empilhada: só rotula um segmento quando o texto cabe nele (nunca vaza).
  const stackRef = useRef<HTMLDivElement>(null);
  const [barW, setBarW] = useState(0);
  useLayoutEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarW(el.clientWidth));
    ro.observe(el);
    setBarW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const { scope } = useStepTimeline(({ step: at, q, reduced }) => {
    // 0 — a North Star.
    at(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="lede"]'), 0.45, { y: 14 });
      rise(tl, q('[data-a="mt-root"]'), 0.5, { y: 18 });
      revealHighlights(tl, q('[data-a="mt-root"] .hl'), 1.1);
    });

    // 1 — cinco ramos: o barramento nasce da raiz e desce até cada pergunta de negócio.
    at(1, (tl) => {
      const grow = (targets: Element[], prop: "scaleX" | "scaleY", pos: number, duration: number, stagger = 0) =>
        reduced
          ? tl.from(targets, { autoAlpha: 0, duration: 0.4, stagger }, pos)
          : tl.from(targets, { [prop]: 0, duration, stagger, ease: "power2.inOut" }, pos);
      grow(q('[data-a="mt-drop"]'), "scaleY", 0, 0.3);
      grow(q('[data-a="mt-bus"]'), "scaleX", 0.25, 0.6);
      grow(q('[data-a="mt-bdrop"]'), "scaleY", 0.8, 0.3, 0.06);
      pop(tl, q('[data-a="mt-bnode"]'), 0.95, { stagger: 0.06, duration: 0.4 });
      rise(tl, q('[data-a="mt-branch"]'), 0.95, { stagger: 0.07, y: 10, duration: 0.7 });
    });

    // 2 — as métricas de cada ramo (definição no hover/foco).
    at(2, (tl) => {
      const grow = (targets: Element[], prop: "scaleX" | "scaleY", pos: number, duration: number, stagger = 0) =>
        reduced
          ? tl.from(targets, { autoAlpha: 0, duration: 0.4, stagger }, pos)
          : tl.from(targets, { [prop]: 0, duration, stagger, ease: "power2.inOut" }, pos);
      grow(q('[data-a="mt-spine-head"]'), "scaleY", 0, 0.25, 0.05);
      grow(q('[data-a="mt-spine"]'), "scaleY", 0.2, 0.9, 0.06);
      grow(q('[data-a="mt-stub"]'), "scaleX", 0.35, 0.25, 0.022);
      rise(tl, q('[data-a="mt-leaf"]'), 0.4, { stagger: 0.022, x: -8, y: 0, duration: 0.5 });
      fade(tl, q('[data-a="hint"]'), 1.0, { duration: 0.5 });
    });

    // 3 — da árvore à conta: como a North Star se compõe e quando o crescimento se paga.
    // (No modo fluxo/mobile a árvore continua visível e as simulações entram abaixo dela.)
    at(3, (tl) => {
      if (!window.matchMedia(FLOW_QUERY).matches) {
        tl.to(q('[data-a="mt-leaves"]'), { autoAlpha: 0, y: reduced ? 0 : -8, duration: 0.4, stagger: 0.03, ease: "power2.in" }, 0)
          .to(q('[data-a="mt-spine-head"]'), { autoAlpha: 0, duration: 0.3 }, 0)
          .to(q('[data-a="hint"]'), { autoAlpha: 0, duration: 0.3 }, 0)
          .to(q('[data-dim="true"]'), { opacity: 0.32, duration: 0.5 }, 0.15);
      }
      rise(tl, q('[data-a="sim"]'), 0.35, { stagger: 0.12, y: 20 });
    });
  });

  const tip = useTooltip(scope);

  // ── Simulação: composição da North Star ─────────────────────────────
  const segs = copy.composition.layers.map((l) => ({ ...l, v: layers[l.key] }));
  const total = segs.reduce((n, s) => n + s.v, 0);
  const network = segs.filter((s) => s.network).reduce((n, s) => n + s.v, 0);
  const share = total ? network / total : 0;

  // ── Simulação: payback ──────────────────────────────────────────────
  const months = cac / margin;

  const sims = (
    <div className={styles.sims}>
      <div data-a="sim" className={styles.simComp}>
        <SimPanel title={copy.composition.title} tag={copy.composition.tag} note={copy.composition.note} className={styles.panel}>
          <div className={styles.layerSliders}>
            {segs.map((s) => (
              <Slider
                key={s.key}
                label={s.label}
                value={s.v}
                min={0}
                max={s.max}
                step={50}
                format={fmtInt}
                onChange={(v) => setLayers((prev) => ({ ...prev, [s.key]: v }))}
              />
            ))}
          </div>
          <div ref={stackRef} className={styles.stack} role="img" aria-label={segs.map((s) => `${s.label}: ${fmtInt(s.v)}`).join(", ")}>
            {segs.map((s) => {
              const px = total ? (s.v / total) * Math.max(0, barW - 2 * (segs.length - 1)) : 0;
              const nameW = s.label.length * 7 + 16;
              const valueW = fmtInt(s.v).length * 6.8 + 6;
              return (
                <div key={s.key} className={styles.seg} data-network={s.network} style={{ flexGrow: Math.max(s.v, 0.0001) }} title={`${s.label}: ${fmtInt(s.v)}`}>
                  {px >= nameW && <span>{s.label}</span>}
                  {px >= nameW + valueW && <span className={styles.segValue}>{fmtInt(s.v)}</span>}
                </div>
              );
            })}
          </div>
          <div className={styles.compFoot}>
            <div>
              <p className={styles.legend}>
                <span>
                  <i className={styles.swatch} data-network="true" aria-hidden="true" />
                  {copy.composition.legendNetwork}
                </span>
                <span>
                  <i className={styles.swatch} data-network="false" aria-hidden="true" />
                  {copy.composition.legendMedia}
                </span>
              </p>
              <p className={styles.premise}>{copy.composition.premise}</p>
            </div>
            <div className={styles.compStats}>
              <Stat value={total} format={fmtInt} label={copy.composition.total} accent size="lg" />
              <Stat value={share} format={fmtShare} label={copy.composition.share} />
            </div>
          </div>
        </SimPanel>
      </div>

      <div data-a="sim" className={styles.simPay}>
        <SimPanel title={copy.payback.title} tag={copy.payback.tag} note={copy.payback.note} className={styles.panel}>
          <div className={styles.payGrid}>
            <div className={styles.paySliders}>
              <Slider label={copy.payback.cac} value={cac} min={50} max={1000} step={10} format={fmtBRL} onChange={setCac} />
              <Slider label={copy.payback.margin} value={margin} min={20} max={400} step={5} format={fmtMargin} onChange={setMargin} />
            </div>
            <div>
              <Stat value={months} format={fmtMonths} label={copy.payback.result} accent size="lg" />
              <p className={styles.calc}>
                {fmtBRL(cac)} ÷ {fmtMargin(margin)}
              </p>
              <p className={styles.formula}>{copy.payback.formula}</p>
            </div>
          </div>
          <ol className={styles.months} aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <li key={i} className={styles.month}>
                <span className={styles.monthFill} style={{ transform: `scaleX(${clamp(months - i, 0, 1)})` }} />
              </li>
            ))}
          </ol>
          <p className={styles.monthAxis} aria-hidden="true">
            <span>0</span>
            <span>6</span>
            <span>
              12 {copy.payback.months}
            </span>
          </p>
        </SimPanel>
      </div>
    </div>
  );

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className="grid-12 items-end gap-y-4">
        <SectionHeader index={index} label={copy.label} title={copy.headline} className="col-span-12 lg:col-span-7" titleClassName={styles.headline} />
        <p data-a="lede" className={cn("t-lede col-span-12 lg:col-span-4 lg:col-start-9", styles.lede)}>
          {copy.lede}
        </p>
      </div>

      <div className={styles.stage}>
        <MetricTree
          root={{ label: copy.northStarLabel, title: `==${copy.northStar}==`, def: copy.northStarDef, tag: <Tag kind="proposed">{copy.northStarTag}</Tag> }}
          branches={copy.branches}
          countLabel={copy.metricsCount}
          ariaLabel={copy.treeLabel}
          linked={SIM_BRANCHES}
          linkedActive={step >= 3}
          onLeafEnter={(el, m) =>
            tip.show(
              el,
              <>
                <strong className="font-semibold">{m.name}</strong>
                <br />
                <span className="text-fg-2">{m.def}</span>
              </>,
            )
          }
          onLeafLeave={tip.hide}
          overlay={sims}
        />
        <p data-a="hint" className={styles.hint}>
          {copy.hint}
        </p>
      </div>
      <InteractiveTooltip state={tip.state} />
    </div>
  );
}
