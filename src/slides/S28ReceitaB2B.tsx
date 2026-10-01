"use client";

import { useState, type CSSProperties } from "react";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Stat } from "@/components/ui/Stat";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/28-frente-receita-b2b";
import { fmtBRL, fmtInt, fmtPct } from "@/lib/format";
import { pop, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { FrontFrame, revealBriefStep, revealFront, showVisual } from "./FrontFrame";
import styles from "./S28ReceitaB2B.module.css";

const SIM = copy.sim;
type Inputs = { eligible: number; adoption: number; completion: number; conversion: number; price: number };
const DEFAULTS: Inputs = {
  eligible: SIM.inputs.eligible.value,
  adoption: SIM.inputs.adoption.value,
  completion: SIM.inputs.completion.value,
  conversion: SIM.inputs.conversion.value,
  price: SIM.inputs.price.value,
};
const WAFFLE = Array.from({ length: 100 }, (_, i) => i);

/**
 * Frente 5 · Receita B2B. s0 as duas ações · s1 a linha do ENTERPRISE e o simulador de um programa corporativo ·
 * s2 e s3 as fichas de BORA ENTERPRISE e BORA LEAGUE.
 */
export function ReceitaB2BSlide() {
  const { index } = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";

  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const set = (k: keyof Inputs) => (v: number) => setInp((prev) => ({ ...prev, [k]: v }));
  const participants = Math.round(inp.eligible * inp.adoption);
  const finishers = Math.round(participants * inp.completion);
  const conversions = Math.round(finishers * inp.conversion);
  const revenue = participants * inp.price;
  const pDots = Math.round(inp.adoption * 100);
  const fDots = Math.round(pDots * inp.completion);
  const cDots = conversions > 0 ? Math.max(1, Math.round(fDots * inp.conversion)) : 0;

  const { scope } = useStepTimeline(
    ({ step, q, reduced }) => {
      step(0, (tl) => revealFront(tl, q));
      step(1, (tl) => {
        const t = showVisual(tl, q, flow, reduced);
        rise(tl, q('[data-a="rung"]'), t, { stagger: 0.1, y: 10, duration: 0.6 });
        rise(tl, q('[data-a="sim"]'), t + 0.35, { y: 20, duration: 0.8 });
        pop(tl, q('[data-a="w"]'), t + 0.7, { stagger: { each: 0.006, from: "start" }, duration: 0.35 });
      });
      step(2, (tl) => revealBriefStep(tl, q, 0, { flow }));
      step(3, (tl) => revealBriefStep(tl, q, 1, { flow }));
    },
    [flow],
  );

  return (
    <FrontFrame scope={scope} index={index} copy={copy}>
      <div className={styles.wrap}>
        <ol className={styles.ladder} aria-label={copy.ladderLabel}>
          {copy.ladder.map((r, i) => (
            <li key={r.name} data-a="rung" className="flex items-center gap-[10px]">
              {i > 0 && (
                <span className={styles.rungArrow} aria-hidden="true">
                  →
                </span>
              )}
              <span className={cn(styles.rung, "stageId" in r && styles.rungIdea)}>
                <span className={styles.rungName}>{r.name}</span>
                <span className={styles.rungLine}>{r.line}</span>
              </span>
              {"stageId" in r && <StageTag of={r.stageId} />}
            </li>
          ))}
        </ol>

        <div data-a="sim" className={styles.sim}>
          <SimPanel title={SIM.title} note={SIM.note}>
            <div className={styles.simBody}>
              <p className={styles.example}>
                <Tag kind="example" className="shrink-0" />
                <strong className="font-semibold">{SIM.example}</strong>
                <span className="text-fg-3">{SIM.exampleDetail}</span>
              </p>
              <div className={styles.sliders}>
                <Slider {...SIM.inputs.eligible} value={inp.eligible} onChange={set("eligible")} format={fmtInt} />
                <Slider {...SIM.inputs.adoption} value={inp.adoption} onChange={set("adoption")} format={fmtPct} />
                <Slider {...SIM.inputs.completion} value={inp.completion} onChange={set("completion")} format={fmtPct} />
                <Slider {...SIM.inputs.conversion} value={inp.conversion} onChange={set("conversion")} format={fmtPct} />
                <Slider {...SIM.inputs.price} value={inp.price} onChange={set("price")} format={fmtBRL} />
              </div>
              {/* Funil em pontos: só onde há espaço (o mesmo dado está nos números abaixo). */}
              <figure className={styles.figure} aria-hidden="true">
                <div className={styles.waffle}>
                  {WAFFLE.map((i) => (
                    <span key={i} data-a="w" className={styles.w} data-k={i < cDots ? 3 : i < fDots ? 2 : i < pDots ? 1 : 0} />
                  ))}
                </div>
                <figcaption className={styles.caption}>{SIM.waffleCaption}</figcaption>
                <ul className={styles.legend}>
                  {SIM.waffleLegend.map((l, k) => (
                    <li key={l}>
                      <span className={cn(styles.w, styles.swatch)} data-k={k} style={{ "--w-dot": "9px" } as CSSProperties} />
                      {l}
                    </li>
                  ))}
                </ul>
              </figure>
              <div className={styles.stats}>
                <Stat value={participants} label={SIM.outputs.participants} format={fmtInt} />
                <Stat value={finishers} label={SIM.outputs.finishers} format={fmtInt} />
                <Stat value={conversions} label={SIM.outputs.conversions} format={fmtInt} />
                <Stat value={revenue} label={SIM.outputs.revenue} format={fmtBRL} accent />
              </div>
            </div>
          </SimPanel>
        </div>
      </div>
    </FrontFrame>
  );
}
