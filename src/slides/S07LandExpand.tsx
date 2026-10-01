"use client";

import { useState, type CSSProperties } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { revealHeader, revealHighlights } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Emphasis, SplitHeadline } from "@/components/ui/SplitHeadline";
import { Stat } from "@/components/ui/Stat";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/07-land-and-expand";
import { gsap } from "@/lib/gsap";
import { fmtBRL, fmtInt } from "@/lib/format";
import { fade, pop, rise, unmask } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import styles from "./S07LandExpand.module.css";

const N = copy.steps.length;
/** Largura (em colunas de degrau) da faixa "chão" antes do primeiro degrau. */
const GROUND = 0.6;
const UNITS = GROUND + N;
/** Posição do clube (em % da área da escada): -1 = chão; i = em cima do degrau i. */
const markerAt = (i: number) =>
  i < 0 ? { x: (GROUND / 2 / UNITS) * 100, y: 100 } : { x: ((GROUND + i + 0.5) / UNITS) * 100, y: (1 - (i + 1) / N) * 100 };

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
const pct = (v: number) => `${v}%`;

type Row = { n: string; title: string; club: string; bora: string };
const ROWS: Row[] = copy.steps.map((s, i) => ({ n: pad2(i + 1), title: s.title, club: s.club, bora: s.bora }));
const COLUMNS: Column<Row>[] = [
  {
    key: "title",
    label: copy.table.step,
    render: (r) => (
      <span className={styles.stepCell}>
        <span className={styles.stepNum}>{r.n}</span>
        {r.title}
      </span>
    ),
  },
  { key: "club", label: copy.gains.club },
  { key: "bora", label: copy.gains.bora },
];

function ClubBadge({ large }: { large?: boolean }) {
  return (
    <span className={cn(styles.clubBadge, large && styles.clubBadgeLg)} aria-hidden="true">
      {copy.club.monogram}
    </span>
  );
}

export function LandExpandSlide() {
  const { index } = useSlide();
  const [members, setMembers] = useState(150);
  const [conversion, setConversion] = useState(5);
  const [fee, setFee] = useState(250);
  const [share, setShare] = useState(10);

  const athletes = Math.round((members * conversion) / 100);
  const revenue = athletes * fee;
  const repasse = (revenue * share) / 100;

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    const blocks = q('[data-a="block"]');
    const fills = q('[data-a="fill"]');
    const treads = q('[data-a="tread"]');
    const layer = q('[data-a="marker-layer"]');
    const start = markerAt(-1);
    gsap.set(layer, { xPercent: start.x, yPercent: start.y });

    // Passo 0 — a escada inteira, ainda tracejada; o clube no chão.
    step(0, (tl) => {
      revealHeader(tl, q);
      tl.from(q('[data-a="ghost"]'), {
        scaleY: reduced ? 1 : 0,
        autoAlpha: 0,
        transformOrigin: "50% 100%",
        duration: reduced ? 0.5 : 0.9,
        stagger: 0.06,
        ease: "power3.out",
      }, 0.35);
      fade(tl, q('[data-a="ghost-text"]'), 0.8, { stagger: 0.05 });
      fade(tl, q('[data-a="axis"]'), 0.5);
      pop(tl, q('[data-a="marker"]'), 1.05);
      rise(tl, q('[data-block="0"] [data-a="b-in"]'), 0.6, { stagger: 0.08, y: 12 });
    });

    // Passos 1–7 — um degrau por →: o degrau enche de volt, o clube sobe, o painel troca.
    for (let i = 0; i < N; i++) {
      step(i + 1, (tl) => {
        const to = markerAt(i);
        tl.to(blocks[i], { autoAlpha: 0, y: reduced ? 0 : -14, duration: 0.4, ease: "power2.in" }, 0);
        tl.from(blocks[i + 1], { autoAlpha: 0, y: reduced ? 0 : 18, duration: 0.7, ease: "bora" }, 0.3);
        rise(tl, q(`[data-block="${i + 1}"] [data-a="b-in"]`), 0.4, { stagger: 0.06, y: 10 });

        if (reduced) {
          fade(tl, fills[i], 0.1);
          fade(tl, treads[i], 0.1);
          tl.set(layer, { xPercent: to.x, yPercent: to.y }, 0.2);
        } else {
          tl.from(fills[i], { clipPath: "inset(100% 0% 0% 0%)", duration: 0.85, ease: "power3.inOut" }, 0.1);
          tl.from(treads[i], { scaleX: 0, transformOrigin: "0% 50%", duration: 0.6, ease: "power3.inOut" }, 0.55);
          tl.to(layer, { xPercent: to.x, duration: 0.95, ease: "power2.inOut" }, 0.15);
          tl.to(layer, { yPercent: to.y, duration: 0.95, ease: "power3.out" }, 0.15);
        }
      });
    }

    // Passo 8 — o princípio + o que cada lado ganha.
    step(N + 1, (tl) => {
      tl.to(q(".sh-title .split-unit"), { yPercent: reduced ? 0 : -135, autoAlpha: 0, duration: 0.55, stagger: 0.03, ease: "power2.in" }, 0);
      tl.to(q(".sh-lede"), { autoAlpha: 0, duration: 0.4 }, 0);
      unmask(tl, q('[data-a="quote"] .split-unit'), 0.45, { stagger: 0.05 });
      revealHighlights(tl, q('[data-a="quote"] .hl'), 1.25);
      tl.to(blocks[N], { autoAlpha: 0, y: reduced ? 0 : -14, duration: 0.4, ease: "power2.in" }, 0);
      tl.from(blocks[N + 1], { autoAlpha: 0, y: reduced ? 0 : 18, duration: 0.7, ease: "bora" }, 0.35);
      rise(tl, q(`[data-block="${N + 1}"] .dt-row`), 0.55, { stagger: 0.06, y: 8 });
    });
  });

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div>
        <div className="sh-meta flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="t-label t-mono text-fg-3">{pad2(index + 1)}</span>
          <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
          <span className="t-label text-fg-2">{copy.label}</span>
          <StageTag of="powered" />
        </div>
        <div className={styles.swap}>
          <div className="grid-12 items-end gap-y-4">
            <SplitHeadline
              as="h2"
              lines={copy.headline}
              className="sh-title t-headline col-span-12 text-[length:var(--fs-display-m)] lg:col-span-7"
            />
            <p className="sh-lede t-lede col-span-12 max-w-[46ch] lg:col-span-5 lg:col-start-8">{copy.lede}</p>
          </div>
          <div data-a="quote" className={styles.quoteWrap}>
            <SplitHeadline as="p" lines={copy.quote} className={cn("t-headline", styles.quote)} />
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* Escada: x = tempo, y = profundidade da parceria */}
        <div className={styles.chart}>
          <div data-a="axis" className={styles.yAxis}>
            <span className={styles.axisLabel}>{copy.axis.y}</span>
            <span className={styles.arrowUp} aria-hidden="true" />
          </div>
          <div className={styles.plot}>
            <ol className={styles.stairs} aria-label={copy.headline.join(" ").replace(/\*\*/g, "")}>
              <li aria-hidden="true" />
              {copy.steps.map((s, i) => (
                <li key={s.title} className={styles.stair} style={{ "--h": (i + 1) / N } as CSSProperties}>
                  <div data-a="ghost" className={styles.ghost} aria-hidden="true" />
                  <div data-a="ghost-text" className={styles.stairText}>
                    <span className={styles.num}>{pad2(i + 1)}</span>
                    <span className={styles.stTitle}>{"short" in s ? s.short : s.title}</span>
                  </div>
                  <div data-a="fill" className={cn(styles.stairText, styles.fill)} aria-hidden="true">
                    <span className={styles.num}>{pad2(i + 1)}</span>
                    <span className={styles.stTitle}>{"short" in s ? s.short : s.title}</span>
                  </div>
                  <div data-a="tread" className={styles.tread} aria-hidden="true" />
                </li>
              ))}
              <li data-a="marker-layer" className={styles.markerLayer} aria-hidden="true">
                <div className={styles.marker}>
                  <span data-a="marker" className={styles.markerDot}>
                    {copy.club.monogram}
                  </span>
                </div>
              </li>
            </ol>
          </div>
          <div data-a="axis" className={styles.xAxis}>
            <span className={styles.axisLabel}>{copy.axis.x}</span>
            <span className={styles.arrowRight} aria-hidden="true" />
          </div>
        </div>

        {/* Painel: um bloco por passo */}
        <div className={styles.panel}>
          <article data-a="block" data-block={0} className={styles.block}>
            <div data-a="b-in" className={styles.intro}>
              <ClubBadge large />
              <h3 className={styles.introName}>{copy.club.name}</h3>
              <Tag kind="fictional" />
            </div>
            <p data-a="b-in" className={cn("t-lede", styles.introText)}>
              {copy.club.intro}
            </p>
            <p data-a="b-in" className={styles.introHint}>
              {copy.club.hint}
            </p>
            <div data-a="b-in" className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.swatchDone} aria-hidden="true" />
                {copy.legend.done}
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatchNext} aria-hidden="true" />
                {copy.legend.next}
              </span>
            </div>
          </article>

          {copy.steps.map((s, i) => {
            const last = i === N - 1;
            return (
              <article key={s.title} data-a="block" data-block={i + 1} className={styles.block}>
                <p data-a="b-in" className={styles.blockLabel}>
                  {fill(copy.stepLabel, { n: pad2(i + 1), total: pad2(N) })}
                </p>
                <h3 data-a="b-in" className={styles.blockTitle}>
                  {s.title}
                </h3>
                <p data-a="b-in" className={cn("t-lede", styles.blockBody)}>
                  {s.body}
                </p>
                {last ? (
                  <div data-a="b-in" className={styles.sim}>
                    <SimPanel title={copy.sim.title} note={copy.sim.note}>
                      <div className={styles.simSliders}>
                        <Slider label={copy.sim.inputs.members} value={members} min={30} max={600} step={10} onChange={setMembers} format={fmtInt} />
                        <Slider label={copy.sim.inputs.conversion} value={conversion} min={1} max={20} onChange={setConversion} format={pct} />
                        <Slider label={copy.sim.inputs.fee} value={fee} min={150} max={600} step={10} onChange={setFee} format={fmtBRL} />
                        <Slider label={copy.sim.inputs.share} value={share} min={5} max={30} onChange={setShare} format={pct} />
                      </div>
                      <div className={styles.simStats}>
                        <Stat value={athletes} label={copy.sim.outputs.athletes} format={fmtInt} />
                        <Stat value={revenue} label={copy.sim.outputs.revenue} format={fmtBRL} />
                        <Stat value={repasse} label={copy.sim.outputs.share} format={fmtBRL} accent className={styles.simAccent} />
                      </div>
                      <p className={styles.simYear}>
                        <Emphasis text={fill(copy.sim.yearly, { n: fmtBRL(repasse * 12) })} />
                      </p>
                    </SimPanel>
                  </div>
                ) : (
                  <>
                    <div data-a="b-in" className={styles.example}>
                      <div className={styles.exampleHead}>
                        <ClubBadge />
                        <span className={styles.clubName}>{copy.club.name}</span>
                        <Tag kind="fictional" className={styles.exampleTag} />
                      </div>
                      <p className={styles.exampleText}>{s.example}</p>
                    </div>
                    <dl data-a="b-in" className={styles.gains}>
                      <div>
                        <dt className="t-label text-fg-3">{copy.gains.club}</dt>
                        <dd>{s.club}</dd>
                      </div>
                      <div className={styles.gainBora}>
                        <dt className="t-label">{copy.gains.bora}</dt>
                        <dd>{s.bora}</dd>
                      </div>
                    </dl>
                  </>
                )}
              </article>
            );
          })}

          <article data-a="block" data-block={N + 1} className={styles.block}>
            <div className={styles.tableTitle}>
              <h3 className="t-label text-fg-2">{copy.table.title}</h3>
              <Tag kind="concept">{copy.table.tag}</Tag>
            </div>
            <DataTable columns={COLUMNS} rows={ROWS} caption={copy.table.title} rowKey={(r) => r.n} dense />
          </article>
        </div>
      </div>
    </div>
  );
}
