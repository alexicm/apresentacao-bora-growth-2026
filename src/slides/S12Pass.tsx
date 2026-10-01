"use client";

import { useEffect, useRef, useState } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { MARKET, MarketExpansion } from "@/components/diagrams/MarketExpansion";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { revealHighlights } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Emphasis, SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/12-pass";
import { fmtBRL, fmtInt, fmtPct } from "@/lib/format";
import { Flip, gsap } from "@/lib/gsap";
import { DUR, EASE, fade, motionPrefs, pop, rise, unmask } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import styles from "./S12Pass.module.css";

const IN = copy.sim.inputs;
const fmtPrice = (v: number) => fmtBRL(v);

export function PassSlide() {
  const { index, step, entered, current } = useSlide();

  // ── Simulação ────────────────────────────────────────────────────────
  const [ids, setIds] = useState<number>(IN.ids.value);
  const [share, setShare] = useState<number>(IN.share.value);
  const [price, setPrice] = useState<number>(IN.price.value);
  const [upgrade, setUpgrade] = useState<number>(IN.upgrade.value);
  const subscribers = Math.round(ids * share);
  const mrr = subscribers * price;
  const newCoaching = Math.round(subscribers * upgrade);

  // ── Timeline por passos ──────────────────────────────────────────────
  const { scope } = useStepTimeline(({ step: at, q, reduced }) => {
    const dy = (v: number) => (reduced ? 0 : v);

    // Passo 0 — a frase, sozinha e enorme.
    at(0, (tl) => {
      tl.from(q('[data-a="meta"]'), { autoAlpha: 0, y: dy(10), duration: DUR.m, ease: EASE.soft }, 0);
      unmask(tl, q('[data-a="hero"] .split-unit'), 0.15, { stagger: 0.075, duration: 1.3 });
      revealHighlights(tl, q('[data-a="hero"] .hl'), 1.2);
      rise(tl, q('[data-a="hero-plain"]'), 1.1, { y: 12 });
      fade(tl, q('[data-a="contours"]'), 0.5, { duration: 1.6 });
    });

    // Passo 1 — a frase vira título (Flip, no efeito abaixo) e a arquitetura entra.
    at(1, (tl) => {
      // A tabela espera a frase subir (≈0,6s) para não cruzar com ela.
      tl.to(q('[data-a="contours"]'), { autoAlpha: 0, duration: 0.6, ease: EASE.soft }, 0);
      fade(tl, q('[data-a="scene-tiers"]'), 0.55, { duration: 0.2 });
      rise(tl, q('[data-a="tiers-caption"]'), 0.6, { y: 12 });
      fade(tl, q('[data-a="row-heads"]'), 0.75, { duration: 0.6 });
      rise(tl, q('[data-a="tier"]'), 0.7, { stagger: 0.1, y: 26, duration: 0.9 });
      rise(tl, q('[data-a="tier-item"]'), 0.9, { stagger: 0.025, y: 10, duration: 0.6 });
      tl.from(q('[data-a="arrow"]'), { scaleX: 0, transformOrigin: "left center", duration: 0.7, stagger: 0.15, ease: EASE.inOut }, 1.15);
      fade(tl, q('[data-a="tier-audience"]'), 1.4, { stagger: 0.08 });
    });

    // Passo 2 — o mercado endereçável: o círculo pequeno vira o mercado inteiro de quem corre.
    at(2, (tl) => {
      tl.to(q('[data-a="scene-tiers"]'), { autoAlpha: 0, y: dy(-18), duration: 0.45, ease: EASE.in }, 0);
      fade(tl, q('[data-a="scene-market"]'), 0.35, { duration: 0.2 });
      rise(tl, q('[data-a="mk-lede"]'), 0.4, { y: 12 });
      pop(tl, q('[data-a="mk-small"], [data-a="mk-sdot"]'), 0.45, { stagger: 0.02, duration: 0.6 });
      fade(tl, q('[data-a="mk-small-label"]'), 0.6, { duration: 0.5 });
      unmask(tl, q('[data-a="mk-from"] .split-unit'), 0.55, { stagger: 0.04, duration: 1 });
      fade(tl, q('[data-a="mk-tag"]'), 0.4, { duration: 0.5 });
      tl.from(q('[data-a="mk-big"]'), { autoAlpha: 0, duration: 0.2, ease: "none" }, 0.85).from(
        q('[data-a="mk-big"]'),
        { scale: MARKET.scale, svgOrigin: MARKET.origin, duration: reduced ? 0.01 : 1.35, ease: EASE.inOut },
        0.85,
      );
      tl.from(
        q('[data-a="mk-dot"]'),
        {
          autoAlpha: 0,
          scale: reduced ? 1 : 0,
          transformOrigin: "50% 50%",
          duration: 0.45,
          ease: EASE.soft,
          stagger: (_: number, el: Element) => Number((el as SVGElement).dataset.d ?? 0) * 1.05,
        },
        1.0,
      );
      unmask(tl, q('[data-a="mk-to"] .split-unit'), 1.3, { stagger: 0.06 });
      fade(tl, q('[data-a="mk-large"]'), 1.45, { duration: 0.6 });
      revealHighlights(tl, q('[data-a="mk-to"] .hl'), 1.8);
      pop(tl, q('[data-a="mk-persona"]'), 1.75, { duration: 0.6 });
      fade(tl, q('[data-a="mk-persona-label"]'), 1.9, { duration: 0.4 });
      rise(tl, q('[data-a="persona-card"]'), 1.85, { y: 14, duration: 0.6 });
      fade(tl, q('[data-a="mk-caption"]'), 2.0, { duration: 0.5 });
    });

    // Passo 3 — simulação.
    at(3, (tl) => {
      tl.to(q('[data-a="scene-market"]'), { autoAlpha: 0, y: dy(-18), duration: 0.45, ease: EASE.in }, 0);
      fade(tl, q('[data-a="scene-sim"]'), 0.35, { duration: 0.2 });
      rise(tl, q('[data-a="sim-panel"]'), 0.35, { y: 24, duration: 0.9 });
      rise(tl, q('[data-a="sim-row"]'), 0.55, { stagger: 0.07, y: 10, duration: 0.6 });
      tl.from(q('[data-a="sim-rail"]'), { scaleY: 0, transformOrigin: "center top", duration: 1, ease: EASE.inOut }, 0.6);
      rise(tl, q('[data-a="sim-node"]'), 0.65, { stagger: 0.14, y: 12, duration: 0.7 });
    });

    // Passo 4 — a ficha da ação (ideia: como validamos).
    at(4, (tl) => revealBrief(tl, q));
  });

  // ── Flip: a frase enorme (passo 0) vira o título compacto (passos 1–3) ──
  const compact = useRef(false);
  const lastStep = useRef(-1);
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const want = entered && step >= 1;
    const prev = lastStep.current;
    lastStep.current = step;
    if (want === compact.current) return;

    const heroLines = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-a="hero"] .split-line'));
    const compactLines = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-a="compact-line"]'));
    heroLines.forEach((el, i) => el.setAttribute("data-flip-id", `pass-line-${i}`));
    const state = Flip.getState(want ? heroLines : compactLines);
    root.setAttribute("data-compact", String(want));
    compact.current = want;

    if (!current || Math.abs(step - prev) > 1 || motionPrefs.reduced) return;
    Flip.from(state, {
      targets: want ? compactLines : heroLines,
      scale: true,
      duration: want ? 1 : 0.8,
      // Na volta, espera a tabela rebobinar antes de a frase crescer de novo.
      delay: want ? 0 : 0.55,
      ease: EASE.inOut,
    });
  }, [scope, step, entered, current]);

  // ── Pulso no exemplo (só com o slide em cena, no passo do mercado) ──
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || !entered || step !== 2 || motionPrefs.reduced) return;
    const pulse = root.querySelector('[data-a="mk-pulse"]');
    if (!pulse) return;
    const tween = gsap.fromTo(
      pulse,
      { scale: 1, opacity: 0.7, transformOrigin: "50% 50%" },
      { scale: 3.2, opacity: 0, duration: 1.8, ease: "power2.out", repeat: -1, repeatDelay: 0.5, delay: 2.2 },
    );
    return () => {
      tween.kill();
      gsap.set(pulse, { clearProps: "transform,opacity" });
    };
  }, [scope, step, current, entered]);

  const titleLines = copy.headline;

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div data-a="contours" className={cn("contours text-brand", styles.contours)} aria-hidden="true" />

      <div data-a="meta" className={cn(styles.meta, "flex flex-wrap items-center gap-x-4 gap-y-2")}>
        <span className="t-label t-mono text-fg-3">{pad2(index + 1)}</span>
        <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
        <span className="t-label text-fg-2">{copy.label}</span>
        <StageTag of="pass" />
      </div>

      {/* Passo 0: a frase enorme */}
      <div data-a="hero" className={styles.heroLayer}>
        <SplitHeadline as="h2" lines={titleLines} className={cn("t-headline", styles.hero)} lineClassName={styles.heroLine} />
        <p data-a="hero-plain" className={styles.heroPlain}>
          {copy.plain}
        </p>
      </div>

      {/* Passos 1–3: a mesma frase como título (recebe a posição da frase enorme via Flip) */}
      <p className={cn("t-headline", styles.compact)} aria-hidden="true">
        {titleLines.map((line, i) => (
          <span key={i} data-a="compact-line" data-flip-id={`pass-line-${i}`} className="split-line">
            <Emphasis text={line} />
          </span>
        ))}
      </p>
      <p className={styles.plainFlow}>{copy.plain}</p>

      <div className={styles.scenes}>
        {/* ── Cena 1: arquitetura ── */}
        <section data-a="scene-tiers" className={cn(styles.scene, styles.tiersScene)} aria-label={copy.tiersLabel}>
          <p data-a="tiers-caption" className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="t-label text-fg-3">{copy.tiersLabel}</span>
            <span className="text-[length:var(--fs-body)] text-fg-2">{copy.tiersCaption}</span>
          </p>
          <div className={styles.tiers}>
            <div data-a="row-heads" className={styles.rowHeads} aria-hidden="true">
              <span />
              <span className="t-label">{copy.includesLabel}</span>
              <span className="t-label">{copy.audienceLabel}</span>
            </div>
            {copy.tiers.map((t, i) => (
              <section
                key={t.id}
                data-a="tier"
                className={cn(styles.tier, t.id === "pass" && styles.isPass)}
                aria-label={`${t.brand} ${t.name}, ${t.kind}`}
              >
                <header className={styles.tierHead}>
                  <span className={cn("t-label", styles.tierKind)}>{t.kind}</span>
                  <div className={styles.tierNameRow}>
                    <h3 className={styles.tierName}>
                      {t.brand} <strong>{t.name}</strong>
                    </h3>
                    {i < copy.tiers.length - 1 && <span data-a="arrow" className={styles.arrow} aria-hidden="true" />}
                  </div>
                </header>
                <ul className={styles.items} aria-label={copy.includesLabel}>
                  {"inherits" in t && (
                    <li data-a="tier-item" className={cn(styles.item, styles.itemMuted)}>
                      <span className={cn("t-mono", styles.itemIdx)} aria-hidden="true">
                        +
                      </span>
                      <span>{t.inherits}</span>
                    </li>
                  )}
                  {t.items.map((item, j) => (
                    <li key={item} data-a="tier-item" className={styles.item}>
                      <span className={cn("t-mono", styles.itemIdx)} aria-hidden="true">
                        {pad2(j + 1)}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p data-a="tier-audience" className={styles.audience}>
                  <span className="sr-only">{copy.audienceLabel}: </span>
                  {t.audience}
                </p>
              </section>
            ))}
          </div>
        </section>

        {/* ── Cena 2: o mercado se expande ── */}
        <section data-a="scene-market" className={cn(styles.scene, styles.marketScene)} aria-label={copy.market.lede}>
          <div className={styles.marketText}>
            <div data-a="mk-tag" className="mb-[clamp(14px,2.6vh,28px)]">
              <Tag kind="concept">{copy.market.tag}</Tag>
            </div>
            <p data-a="mk-lede" className="t-lede">
              {copy.market.lede}
            </p>
            <div data-a="mk-from">
              <SplitHeadline as="p" lines={copy.market.from} className={cn("t-headline", styles.marketFrom)} />
            </div>
            <div data-a="mk-to">
              <SplitHeadline as="p" lines={[copy.market.to]} className={cn("t-headline", styles.marketTo)} />
            </div>
            <div data-a="persona-card" className={styles.persona}>
              <Tag kind="fictional">{copy.persona.tag}</Tag>
              <p className={styles.personaText}>
                <span className={styles.personaDot} aria-hidden="true" />
                <span>
                  <Emphasis text={copy.persona.text} />
                </span>
              </p>
            </div>
            <p data-a="mk-caption" className={styles.marketCaption}>
              {copy.market.caption}
            </p>
          </div>
          <div className={styles.marketBox}>
            <MarketExpansion
              className={styles.marketDiagram}
              small={copy.market.small}
              large={copy.market.large}
              personaLabel={copy.persona.tag}
            />
          </div>
        </section>

        {/* ── Cena 3: simulação ── */}
        <section data-a="scene-sim" className={cn(styles.scene, styles.simScene)}>
          <div data-a="sim-panel">
            <SimPanel title={copy.sim.title} note={copy.sim.note}>
              <div className={styles.simGrid}>
                <div className={styles.simInputs}>
                  <p data-a="sim-row" className={cn("t-label", styles.simLabel)}>
                    {copy.sim.assumptionsLabel}
                  </p>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.ids.label}
                      value={ids}
                      min={IN.ids.min}
                      max={IN.ids.max}
                      step={IN.ids.step}
                      onChange={setIds}
                      format={fmtInt}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.share.label}
                      value={share}
                      min={IN.share.min}
                      max={IN.share.max}
                      step={IN.share.step}
                      onChange={setShare}
                      format={fmtPct}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.price.label}
                      value={price}
                      min={IN.price.min}
                      max={IN.price.max}
                      step={IN.price.step}
                      onChange={setPrice}
                      format={fmtPrice}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.upgrade.label}
                      value={upgrade}
                      min={IN.upgrade.min}
                      max={IN.upgrade.max}
                      step={IN.upgrade.step}
                      onChange={setUpgrade}
                      format={fmtPct}
                    />
                  </div>
                </div>

                <div>
                  <p data-a="sim-row" className={cn("t-label", styles.simLabel)}>
                    {copy.sim.resultsLabel}
                  </p>
                  <div className={styles.flowWrap}>
                    <span data-a="sim-rail" className={styles.rail} aria-hidden="true" />
                    <ol className={styles.flow} aria-label={copy.sim.resultsLabel}>
                      <li data-a="sim-node" className={styles.node}>
                        <span className={styles.nodeDot} aria-hidden="true" />
                        <span className={styles.nodeName}>{copy.sim.nodes.id.name}</span>
                        <span className={cn("t-mono", styles.nodeEcho)}>
                          {fmtInt(ids)} <small>{copy.sim.nodes.id.unit}</small>
                        </span>
                      </li>
                      <li data-a="sim-node" className={styles.edge}>
                        {copy.sim.subscribeRate(fmtPct(share))}
                      </li>
                      <li data-a="sim-node" className={cn(styles.node, styles.nodePass)}>
                        <span className={styles.nodeDot} aria-hidden="true" />
                        <span className={styles.nodeName}>{copy.sim.nodes.pass.name}</span>
                        <div className={styles.nodeBody}>
                          <Stat value={subscribers} label={copy.sim.outputs.subscribers} format={fmtInt} />
                          <div>
                            <Stat value={mrr} label={copy.sim.outputs.mrr} format={fmtBRL} accent size="lg" />
                            <p className={styles.perYear}>{copy.sim.perYear(fmtBRL(mrr * 12))}</p>
                          </div>
                        </div>
                      </li>
                      <li data-a="sim-node" className={styles.edge}>
                        {copy.sim.upgradeRate(fmtPct(upgrade))}
                      </li>
                      <li data-a="sim-node" className={styles.node}>
                        <span className={styles.nodeDot} aria-hidden="true" />
                        <span className={styles.nodeName}>{copy.sim.nodes.coaching.name}</span>
                        <Stat value={newCoaching} label={copy.sim.outputs.coaching} format={fmtInt} />
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </SimPanel>
          </div>
        </section>
      </div>

      <ActionBrief id="pass" />
    </div>
  );
}
