"use client";

import { useEffect, useMemo, useState } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";
import { revealHeader, revealHighlights } from "@/components/ui/SectionHeader";
import { Emphasis, SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { Toggle } from "@/components/ui/Toggle";
import { copy } from "@/content/slides/15-os";
import { draw, fade, motionPrefs, pop, rise, unmask } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import styles from "./S15Os.module.css";

type Source = "with" | "without";
const STOPS = copy.journey.stops;
const QUESTIONS = copy.questions;

export function OsSlide() {
  const { index, step, current } = useSlide();
  const [hoverStop, setHoverStop] = useState<number | null>(null);
  const [autoStop, setAutoStop] = useState(0);
  const [hoverQ, setHoverQ] = useState<number | null>(null);
  const [pickQ, setPickQ] = useState<number | null>(null);
  const [source, setSource] = useState<Source>("with");

  // Exemplo vivo: a jornada avança sozinha enquanto o slide está em cena (pausa no hover; nunca com movimento reduzido).
  const journeyOn = step === 1 || step === 2;
  const cycling = current && journeyOn && hoverStop === null && !motionPrefs.reduced;
  useEffect(() => {
    if (!cycling) return;
    const id = window.setInterval(() => setAutoStop((s) => (s + 1) % STOPS.length), 2600);
    return () => window.clearInterval(id);
  }, [cycling]);

  const activeStop = journeyOn ? (hoverStop ?? (motionPrefs.reduced ? null : autoStop)) : null;
  const answerQ = pickQ ?? 0;
  const focusQ = step >= 3 ? (hoverQ ?? pickQ ?? (step >= 4 ? 0 : null)) : null;
  const offline = step >= 4 && source === "without";

  const highlight = useMemo(() => {
    if (focusQ !== null) return new Set<string>(QUESTIONS[focusQ].modules);
    if (activeStop !== null) return new Set<string>(STOPS[activeStop].modules);
    return null;
  }, [focusQ, activeStop]);

  const { scope } = useStepTimeline(({ step: at, q, reduced }) => {
    // 0 — o núcleo: a camada de identidade dentro do chip.
    at(0, (tl) => {
      revealHeader(tl, q);
      draw(tl, q('[data-a="os-frame"]'), 0.25, { duration: 1.3 });
      fade(tl, q('[data-a="os-grid"]'), 0.5, { duration: 1 });
      fade(tl, q('[data-a="os-tick"]'), 0.9, { stagger: 0.06, duration: 0.5 });
      pop(tl, q('[data-a="os-core"]'), 0.7, { duration: 0.9 });
      fade(tl, q('[data-a="os-label"]'), 1.0, { duration: 0.6 });
      fade(tl, q('[data-a="os-tag"]'), 1.1, { duration: 0.6 });
    });

    // 1 — os módulos se ligam ao núcleo; exemplo da jornada de um BORA ID.
    at(1, (tl) => {
      pop(tl, q('[data-a="os-mod"]'), 0, { stagger: 0.045, duration: 0.6 });
      draw(tl, q('[data-a="os-trace"]'), 0.2, { stagger: 0.045, duration: 0.7 });
      pop(tl, q('[data-a="os-pin"]'), 0.75, { stagger: 0.03, duration: 0.35 });
      rise(tl, q('[data-a="journey"]'), 0.35, { y: 16 });
      rise(tl, q('[data-a="stop"]'), 0.55, { stagger: 0.09, y: 10, duration: 0.6 });
      fade(tl, q('[data-a="moral"]'), 1.0, { duration: 0.6 });
    });

    // 2 — integrações possíveis nas bordas (tracejado = arquitetura-alvo; o OS em si já roda).
    at(2, (tl) => {
      pop(tl, q('[data-a="os-pad"]'), 0, { stagger: 0.04, duration: 0.4 });
      fade(tl, q('[data-a="os-stub"]'), 0.1, { stagger: 0.04, duration: 0.4 });
      fade(tl, q('[data-a="os-port-label"]'), 0.25, { stagger: 0.04, duration: 0.5 });
      fade(tl, q('[data-a="os-group"]'), 0.5, { stagger: 0.06, duration: 0.5 });
      fade(tl, q('[data-a="footnote"]'), 0.6, { duration: 0.6 });
    });

    // 3 — a pergunta: o que a BORA deveria saber?
    at(3, (tl) => {
      const titleA = q(".sh-title .split-unit");
      if (reduced) tl.to(titleA, { autoAlpha: 0, duration: 0.3 }, 0);
      else tl.to(titleA, { yPercent: -135, autoAlpha: 0, duration: 0.5, stagger: 0.03, ease: "power2.in" }, 0);
      unmask(tl, q('[data-a="title-b"] .split-unit'), 0.45, { stagger: 0.05 });
      revealHighlights(tl, q('[data-a="title-b"] .hl'), 1.0);
      tl.to(q('[data-a="layer-a"]'), { autoAlpha: 0, y: reduced ? 0 : -12, duration: 0.45, ease: "power2.in" }, 0);
      fade(tl, q('[data-a="layer-b"]'), 0.4, { duration: 0.4 });
      rise(tl, q('[data-a="q-label"]'), 0.5, { y: 10 });
      rise(tl, q('[data-a="q-item"]'), 0.6, { stagger: 0.07, y: 10, duration: 0.6 });
    });

    // 4 — a resposta (dados demo): por que o OS importa.
    at(4, (tl) => {
      rise(tl, q('[data-a="answer"]'), 0, { y: 16 });
      rise(tl, q('[data-a="a-row"]'), 0.25, { stagger: 0.07, y: 8, duration: 0.5 });
    });
  });

  const demo = QUESTIONS[answerQ].demo;

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className={styles.left}>
        <header className="section-header">
          <div className="sh-meta flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="t-label t-mono text-fg-3">{pad2(index + 1)}</span>
            <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
            <span className="t-label text-fg-2">{copy.label}</span>
            <StageTag of="os" />
          </div>
          <div className={styles.titles}>
            <SplitHeadline as="h2" lines={copy.headline} className={cn("sh-title t-headline", styles.headline)} />
            <div data-a="title-b">
              <SplitHeadline as="p" lines={copy.questionLines} className={cn("t-headline", styles.headline)} />
            </div>
          </div>
        </header>

        <div className={styles.body}>
          {/* Passos 0–2: explicação + exemplo da jornada */}
          <div data-a="layer-a">
            <p className={cn("sh-lede t-lede", styles.lede)}>
              <Emphasis text={copy.lede} />
            </p>
            <section data-a="journey" className={styles.journey} aria-label={copy.journey.title}>
              <div className={styles.jHead}>
                <p className="t-label text-fg-2">{copy.journey.title}</p>
                <Tag kind="fictional" />
              </div>
              <p className={styles.jWho}>
                <b>{copy.journey.who}</b> · <span className="t-mono">{copy.journey.id}</span>
              </p>
              <ol className={styles.stops}>
                {STOPS.map((s, i) => (
                  <li key={s.what} data-a="stop">
                    <button
                      type="button"
                      className={styles.stop}
                      data-active={activeStop === i}
                      aria-pressed={activeStop === i}
                      onMouseEnter={() => setHoverStop(i)}
                      onMouseLeave={() => setHoverStop(null)}
                      onFocus={() => setHoverStop(i)}
                      onBlur={() => setHoverStop(null)}
                      onClick={() => setAutoStop(i)}
                    >
                      <span className={styles.stopDot} aria-hidden="true" />
                      <span className={styles.stopWhen}>{s.when}</span>
                      <span>
                        <span className={styles.stopWhat}>{s.what}</span>
                        <span className={styles.stopMods}>{s.modules.join(" · ")}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p data-a="moral" className={styles.moral}>
                {copy.journey.moral}
              </p>
            </section>
          </div>

          {/* Passos 3–4: perguntas e resposta demo */}
          <div data-a="layer-b">
            <p data-a="q-label" className="t-label text-fg-3">
              {copy.questionsLabel}
            </p>
            <ol className={styles.qList}>
              {QUESTIONS.map((item, i) => (
                <li key={item.q} data-a="q-item">
                  <button
                    type="button"
                    className={styles.q}
                    data-on={focusQ === i}
                    aria-pressed={answerQ === i && step >= 4}
                    onMouseEnter={() => setHoverQ(i)}
                    onMouseLeave={() => setHoverQ(null)}
                    onFocus={() => setHoverQ(i)}
                    onBlur={() => setHoverQ(null)}
                    onClick={() => setPickQ(i)}
                  >
                    <span className={styles.qIdx}>{pad2(i + 1)}</span>
                    <span className={styles.qText}>{item.q}</span>
                    <span className={styles.qMark} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>

            <section data-a="answer" className={styles.answer} aria-live="polite">
              <div className={styles.aHead}>
                <p className={cn("t-label text-fg-2", styles.aLabel)}>{copy.answerLabel}</p>
                <Tag kind="demo" />
                <div className={styles.aHeadRight}>
                  <Toggle
                    size="sm"
                    label={copy.osToggle.label}
                    value={source}
                    onChange={setSource}
                    options={[
                      { value: "without", label: copy.osToggle.without },
                      { value: "with", label: copy.osToggle.with },
                    ]}
                  />
                </div>
              </div>
              <table className={cn("data-table data-table--dense", styles.aTable)}>
                <caption className="sr-only">{QUESTIONS[answerQ].q}</caption>
                <colgroup>
                  {demo.cols.map((c) => (
                    <col key={c} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    {demo.cols.map((c, ci) => (
                      <th key={c} scope="col" className={cn("t-label", ci > 0 && styles.num)}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demo.rows.map((r, ri) => (
                    <tr key={ri} data-a="a-row" className={cn("dt-row", ri === 0 && !offline && styles.best)}>
                      <th scope="row">
                        {ri === 0 && !offline && <i className={styles.bestMark} aria-hidden="true" />}
                        {r[0]}
                      </th>
                      {r.slice(1).map((v, vi) => (
                        <td key={vi} className={cn("t-mono", styles.num, vi === r.length - 2 && styles.key)}>
                          {offline ? <span className={styles.unknown}>{copy.noData}</span> : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.reading}>
                <b>{copy.readingLabel}</b>
                {offline ? copy.withoutOs : demo.reading}
              </p>
              <p className={styles.demoNote}>{copy.demoNote}</p>
            </section>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <ArchitectureDiagram
          className={styles.diagram}
          modules={copy.modules}
          ports={copy.ports}
          labels={{ os: copy.osLabel, core: copy.core, coreKicker: copy.coreKicker, coreCaption: copy.coreCaption }}
          tag={<StageTag of="os" />}
          ariaLabel={copy.diagramLabel}
          highlight={highlight}
          pulse={current && step >= 1 && !motionPrefs.reduced}
          offline={offline}
        />
        <div data-a="footnote" className={styles.footnote}>
          <Tag kind="target">{copy.integrationsTag}</Tag>
          <span>{copy.footnote}</span>
        </div>
      </div>
    </div>
  );
}
