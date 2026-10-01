"use client";

import { useEffect, useState } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { RaceWeekendTimeline } from "@/components/diagrams/RaceWeekendTimeline";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { InteractiveTooltip, useTooltip } from "@/components/ui/InteractiveTooltip";
import { revealHighlights } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Emphasis, SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/14-house";
import { fmtBRL, fmtInt } from "@/lib/format";
import { DUR, EASE, fade, pop, rise, unmask } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import styles from "./S14House.module.css";

const IN = copy.sim.inputs;
const PHOTO_SRCSET = [640, 960, 1280].map((w) => `/brand/bora-house-${w}.webp ${w}w`).join(", ");

export function HouseSlide() {
  const { index } = useSlide();

  // ── Simulação ────────────────────────────────────────────────────────
  const [coaching, setCoaching] = useState<number>(IN.coaching.value);
  const [pass, setPass] = useState<number>(IN.pass.value);
  const [clubs, setClubs] = useState<number>(IN.clubs.value);
  const [members, setMembers] = useState<number>(IN.members.value);
  const [corporate, setCorporate] = useState<number>(IN.corporate.value);
  const [naming, setNaming] = useState<number>(IN.naming.value);
  const [pack, setPack] = useState<number>(IN.pack.value);
  const people = coaching + pass + clubs * members + corporate;
  const corporateRevenue = corporate * pack;
  const total = naming + corporateRevenue;
  const subscribers = coaching + pass;

  // ── Timeline por passos ──────────────────────────────────────────────
  const { scope } = useStepTimeline(({ step: at, q, reduced }) => {
    const dy = (v: number) => (reduced ? 0 : v);

    // Passo 0 — manchete + o fim de semana de prova, dia a dia (o domingo é o pico).
    at(0, (tl) => {
      tl.from(q('[data-a="meta"]'), { autoAlpha: 0, y: dy(10), duration: DUR.m, ease: EASE.soft }, 0);
      unmask(tl, q('[data-a="headline"] .split-unit'), 0.1, { stagger: 0.045 });
      revealHighlights(tl, q('[data-a="headline"] .hl'), 0.9);
      rise(tl, q('[data-a="lede"]'), 0.45, { y: 14 });
      fade(tl, q('[data-a="scene-left"]'), 0.5, { duration: 0.2 });
      fade(tl, q('[data-a="rwt-label"]'), 0.55, { duration: 0.5 });
      tl.from(q('[data-a="rwt-rail"]'), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.5, ease: "power2.inOut" }, 0.6);
      const days = q('[data-a="rwt-day"]');
      const nodes = q('[data-a="rwt-node"]');
      const items = q('[data-a="rwt-items"]');
      days.forEach((_, i) => {
        const t = 0.62 + i * 0.36;
        pop(tl, nodes[i], t, { duration: 0.5 });
        rise(tl, days[i], t, { y: 10, duration: 0.6 });
        rise(tl, items[i], t + 0.08, { y: 12, duration: 0.7 });
      });
      // A foto real da BORA no dia da prova.
      fade(tl, q('[data-a="scene-photo"]'), 0.5, { duration: 0.2 });
      tl.from(q('[data-a="photo-frame"]'), { autoAlpha: 0, y: dy(24), duration: 1, ease: EASE.out }, 0.55).fromTo(
        q('[data-a="photo-img"]'),
        { scale: reduced ? 1 : 1.08 },
        { scale: 1, duration: 2, ease: "power2.out" },
        0.55,
      );
      rise(tl, q('[data-a="photo-fact"]'), 1.25, { y: 14, duration: 0.8 });
    });

    // Passo 1 — exemplo: quem é atendido em cada momento (a timeline sobe e os pontos enchem o fim de semana).
    at(1, (tl) => {
      tl.fromTo(q('[data-a="scene-left"]'), { "--k": 1 }, { "--k": 0, duration: reduced ? 0.01 : 1, ease: EASE.inOut }, 0);
      rise(tl, q('[data-a="rwt-mx-head"]'), 0.25, { y: 12 });
      rise(tl, q('[data-a="rwt-mx-row"]'), 0.35, { stagger: 0.08, y: 10, duration: 0.6 });
      tl.from(
        q('[data-a="rwt-dot"]'),
        {
          autoAlpha: 0,
          scale: reduced ? 1 : 0.2,
          transformOrigin: "50% 50%",
          duration: 0.45,
          ease: EASE.out,
          stagger: (i: number, el: Element) => Number((el as HTMLElement).dataset.col ?? 0) * 0.16 + Math.floor(i / 4) * 0.05,
        },
        0.65,
      );
    });

    // Passo 2 — a foto dá lugar às camadas de receita.
    at(2, (tl) => {
      tl.to(q('[data-a="scene-photo"]'), { autoAlpha: 0, y: dy(-16), duration: 0.45, ease: EASE.in }, 0);
      fade(tl, q('[data-a="scene-revenue"]'), 0.35, { duration: 0.2 });
      rise(tl, q('[data-a="rev-head"]'), 0.4, { y: 12 });
      rise(tl, q('[data-a="rev-layer"]'), 0.45, { stagger: { each: 0.11, from: "end" }, y: 18, duration: 0.7 });
    });

    // Passo 3 — simulação de uma House.
    at(3, (tl) => {
      tl.to(q('[data-a="scene-left"], [data-a="scene-revenue"]'), { autoAlpha: 0, y: dy(-18), duration: 0.45, ease: EASE.in }, 0);
      fade(tl, q('[data-a="scene-sim"]'), 0.35, { duration: 0.2 });
      rise(tl, q('[data-a="sim-panel"]'), 0.35, { y: 24, duration: 0.9 });
      rise(tl, q('[data-a="sim-row"]'), 0.55, { stagger: 0.05, y: 10, duration: 0.6 });
      rise(tl, q('[data-a="sim-result"]'), 0.75, { stagger: 0.1, y: 12, duration: 0.7 });
    });

    // Passo 4 — a ficha da ação.
    at(4, (tl) => revealBrief(tl, q));
  });

  // Mede quanto a timeline precisa descer para ficar centrada no passo 0 (atualiza no resize/tela cheia).
  useEffect(() => {
    const root = scope.current;
    const scene = root?.querySelector<HTMLElement>('[data-a="scene-left"]');
    const head = root?.querySelector<HTMLElement>('[data-a="rwt-mx-head"]');
    if (!scene || !head) return;
    const measure = () => {
      const free = scene.clientHeight - head.offsetTop;
      scene.style.setProperty("--shift", `${Math.max(0, Math.round(free / 2))}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scene);
    return () => ro.disconnect();
  }, [scope]);

  const tip = useTooltip(scope);
  const namingShare = total > 0 ? naming / total : 0;

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      {/* ── Cabeçalho ── */}
      <header className={styles.header}>
        <div className={styles.headMain}>
          <div data-a="meta" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="t-label t-mono text-fg-3">{pad2(index + 1)}</span>
            <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
            <span className="t-label text-fg-2">{copy.label}</span>
            <StageTag of="house" />
          </div>
          <div data-a="headline">
            <SplitHeadline lines={copy.headline} className={cn("t-headline", styles.headline)} />
          </div>
        </div>
        <div className={styles.headAside}>
          <p data-a="lede" className={cn("t-lede", styles.lede)}>
            <Emphasis text={copy.lede} />
          </p>
        </div>
      </header>

      <div className={styles.main}>
        {/* ── Esquerda: o fim de semana (timeline + matriz de exemplo) ── */}
        <section data-a="scene-left" className={styles.leftScene} aria-label={copy.timelineLabel}>
          <div className={styles.leftInner}>
            <RaceWeekendTimeline
              label={copy.timelineLabel}
              days={copy.days}
              peakDay={copy.peakDay}
              peakLabel={copy.peakLabel}
              matrix={{
                label: copy.matrix.label,
                tag: <Tag kind="example">{copy.matrix.tag}</Tag>,
                caption: copy.matrix.caption,
                legend: { served: copy.matrix.legendServed, none: copy.matrix.legendNone },
                rows: copy.matrix.rows,
              }}
              onCellEnter={(el, text) => tip.show(el, text)}
              onCellLeave={tip.hide}
            />
          </div>
        </section>

        {/* ── Direita: foto → receitas ── */}
        <div className={styles.rightCol}>
          <figure data-a="scene-photo" className={cn(styles.rightScene, "m-0")}>
            <div data-a="photo-frame" className={styles.photo}>
              {/* eslint-disable-next-line @next/next/no-img-element -- WebP responsivo já otimizado (funciona também no export estático) */}
              <img
                data-a="photo-img"
                src="/brand/bora-house-960.webp"
                srcSet={PHOTO_SRCSET}
                sizes="(min-width: 768px) 34vw, 100vw"
                alt={copy.photo.alt}
                loading="lazy"
                decoding="async"
              />
              <div className={styles.photoGrade} aria-hidden="true" />
              <figcaption data-a="photo-fact" className={styles.photoFact}>
                <span className={styles.factValue}>{copy.fact.value}</span>
                <span className={styles.factLabel}>{copy.fact.label}</span>
                <span className={styles.factSource}>
                  <span className={styles.factPill}>{copy.fact.status}</span>
                  <span>
                    {copy.fact.source} {copy.photo.credit}
                  </span>
                </span>
              </figcaption>
            </div>
          </figure>

          <section data-a="scene-revenue" className={cn(styles.rightScene, styles.revenue)} aria-label={copy.revenue.label}>
            <div data-a="rev-head" className={styles.revHead}>
              <span className={cn("t-label", styles.revLabel)}>{copy.revenue.label}</span>
              <Tag kind="hypothesis">{copy.revenue.tag}</Tag>
            </div>
            <ol className={styles.layers}>
              {copy.revenue.layers.map((l, i) => (
                <li key={l.name} data-a="rev-layer" className={styles.layer}>
                  <span className={cn("t-mono", styles.layerIdx)} aria-hidden="true">
                    {pad2(i + 1)}
                  </span>
                  <span>
                    <span className={styles.layerName}>{l.name}</span>
                    <span className={styles.layerPayer}>{l.payer}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* ── Simulação (largura toda) ── */}
        <section data-a="scene-sim" className={styles.simScene}>
          <div data-a="sim-panel">
            <SimPanel title={copy.sim.title} note={copy.sim.note}>
              <div className={styles.simGrid}>
                <div className={styles.simCol}>
                  <p data-a="sim-row" className={cn("t-label", styles.simLabel)}>
                    {copy.sim.audienceLabel}
                  </p>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.coaching.label}
                      value={coaching}
                      min={IN.coaching.min}
                      max={IN.coaching.max}
                      step={IN.coaching.step}
                      onChange={setCoaching}
                      format={fmtInt}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.pass.label}
                      value={pass}
                      min={IN.pass.min}
                      max={IN.pass.max}
                      step={IN.pass.step}
                      onChange={setPass}
                      format={fmtInt}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.clubs.label}
                      value={clubs}
                      min={IN.clubs.min}
                      max={IN.clubs.max}
                      step={IN.clubs.step}
                      onChange={setClubs}
                      format={fmtInt}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.members.label}
                      value={members}
                      min={IN.members.min}
                      max={IN.members.max}
                      step={IN.members.step}
                      onChange={setMembers}
                      format={fmtInt}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.corporate.label}
                      value={corporate}
                      min={IN.corporate.min}
                      max={IN.corporate.max}
                      step={IN.corporate.step}
                      onChange={setCorporate}
                      format={fmtInt}
                    />
                  </div>
                </div>

                <div className={styles.simCol}>
                  <p data-a="sim-row" className={cn("t-label", styles.simLabel)}>
                    {copy.sim.pricesLabel}
                  </p>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.naming.label}
                      value={naming}
                      min={IN.naming.min}
                      max={IN.naming.max}
                      step={IN.naming.step}
                      onChange={setNaming}
                      format={fmtBRL}
                    />
                  </div>
                  <div data-a="sim-row">
                    <Slider
                      label={IN.pack.label}
                      value={pack}
                      min={IN.pack.min}
                      max={IN.pack.max}
                      step={IN.pack.step}
                      onChange={setPack}
                      format={fmtBRL}
                    />
                  </div>
                </div>

                <div className={styles.results}>
                  <p data-a="sim-result" className={cn("t-label", styles.simLabel)}>
                    {copy.sim.resultsLabel}
                  </p>
                  <div data-a="sim-result" className={styles.resultsTop}>
                    <Stat value={people} label={copy.sim.outputs.people} format={fmtInt} />
                    <Stat value={total} label={copy.sim.outputs.total} format={fmtBRL} accent size="lg" />
                  </div>
                  <div data-a="sim-result" className="grid gap-2.5">
                    <span className="text-[12.5px] text-fg-3">{copy.sim.outputs.layers}</span>
                    <div className={styles.bar} aria-hidden="true">
                      {total > 0 ? (
                        <>
                          <span className={cn(styles.barSeg, styles.segNaming)} style={{ flexGrow: namingShare, flexBasis: 0 }} />
                          <span className={cn(styles.barSeg, styles.segCorporate)} style={{ flexGrow: 1 - namingShare, flexBasis: 0 }} />
                        </>
                      ) : (
                        <span className={styles.barEmpty} />
                      )}
                    </div>
                    <ul className={styles.layerList}>
                      <li className={styles.layerRow}>
                        <i className={cn(styles.swatch, styles.segNaming)} aria-hidden="true" />
                        <span>{copy.sim.outputs.naming}</span>
                        <b>{fmtBRL(naming)}</b>
                      </li>
                      <li className={styles.layerRow}>
                        <i className={cn(styles.swatch, styles.segCorporate)} aria-hidden="true" />
                        <span>{copy.sim.outputs.corporate}</span>
                        <b>{fmtBRL(corporateRevenue)}</b>
                      </li>
                      <li className={styles.layerRow}>
                        <i className={cn(styles.swatch, styles.swatchSub)} aria-hidden="true" />
                        <span>{copy.sim.outputs.subscription}</span>
                        <b>{copy.sim.outputs.subscriptionValue(fmtInt(subscribers))}</b>
                        <span className={styles.subNote}>{copy.sim.outputs.subscriptionNote}</span>
                      </li>
                    </ul>
                  </div>
                  <p data-a="sim-result" className={styles.excluded}>
                    {copy.sim.outputs.excluded}
                  </p>
                </div>
              </div>
            </SimPanel>
          </div>
        </section>
      </div>

      <ActionBrief id="house" />

      <InteractiveTooltip state={tip.state} />
    </div>
  );
}
