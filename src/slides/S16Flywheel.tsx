"use client";

import { useEffect, useRef, useState } from "react";
import { deck } from "@/components/deck/deck-store";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { FW, Flywheel, type FlywheelKind, type FlywheelStage } from "@/components/diagrams/Flywheel";
import { SectionHeader, revealHeader, revealHighlights } from "@/components/ui/SectionHeader";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { growthById } from "@/content/projects";
import { copy, meta } from "@/content/slides/16-flywheel";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { draw, fade, hold, motionPrefs, rise, unmask } from "@/lib/motion";
import { pad2 } from "@/lib/utils";

const N = copy.stages.length;

/** Cada estágio com o que o move, lido de GROWTH_PROJECTS (fonte única do estágio). */
const STAGES: FlywheelStage[] = copy.stages.map((s) => {
  const g = "by" in s ? growthById(s.by) : undefined;
  const kind: FlywheelKind = !g ? "resultado" : g.core ? "atual" : g.stage;
  return { label: s.label, why: s.why, gear: "gear" in s ? s.gear : undefined, kind };
});
const countKind = (k: FlywheelKind) => STAGES.filter((s) => s.kind === k).length;
const STATEMENT = copy.statement.map((l) => l.replace("{fases}", String(countKind("agora") + countKind("depois"))).replace("{ideia}", String(countKind("ideia"))));
const CIRCLE = `M${FW.c} ${FW.c - FW.r} A${FW.r} ${FW.r} 0 1 1 ${FW.c - 0.01} ${FW.c - FW.r} Z`;

/** Acende o estágio i (e desenha o arco que chega nele). `k` encurta as durações (passo sem scroll). */
function lightStage(tl: gsap.core.Timeline, q: (s: string) => Element[], i: number, pos: gsap.Position, k = 1) {
  if (i > 0) {
    draw(tl, q(`[data-fw-arc="${i - 1}"]`), pos, { duration: 0.7 * k, ease: "none" });
    tl.fromTo(q(`[data-fw-arrow="${i - 1}"]`), { opacity: 0 }, { opacity: 1, duration: 0.2 * k }, `>-${0.1 * k}`);
  }
  tl.fromTo(q(`[data-fw-dot="${i}"] .fw-dot-lit`), { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.45 * k, ease: "bora" }, i > 0 ? `>-${0.15 * k}` : pos);
  tl.fromTo(q(`[data-fw-label="${i}"]`), { opacity: 0.2 }, { opacity: 1, duration: 0.45 * k }, "<");
}

/** Fecha o ciclo: o último estágio volta a gerar BORA IDs. */
function closeLoop(tl: gsap.core.Timeline, q: (s: string) => Element[], pos: gsap.Position) {
  draw(tl, q(`[data-fw-arc="${N - 1}"]`), pos, { duration: 0.8, ease: "none" });
  tl.fromTo(q(`[data-fw-arrow="${N - 1}"]`), { opacity: 0 }, { opacity: 1, duration: 0.2 }, ">-0.1");
}

export function FlywheelSlide() {
  const { index, step, current, entered, sectionRef } = useSlide();
  const { mode } = useDeck();
  const [active, setActive] = useState<number | null>(null);
  const motion = useRef<gsap.core.Animation[]>([]);
  const scrub = mode === "deck" && !motionPrefs.reduced;

  const { scope } = useStepTimeline(
    ({ step: at, q }) => {
      at(0, (tl) => {
        revealHeader(tl, q);
        fade(tl, q('[data-a="fw-ring"], .fw-ghost'), 0.2, { duration: 1.2 });
        fade(tl, q('[data-a="fw-center"]'), 0.4, { duration: 1 });
        fade(tl, q('[data-a="fw-starter"]'), 0.7);
        lightStage(tl, q, 0, 1.0);
        rise(tl, q('[data-a="fw-info"]'), 1.2);
      });
      // Passo 1: em modo apresentação a roda é construída pelo scroll (scrub, abaixo);
      // no modo fluxo / movimento reduzido, o passo acende todos os estágios, mais depressa.
      at(1, (tl) => {
        if (scrub) {
          hold(tl, 0.6);
          return;
        }
        for (let i = 1; i < N; i++) lightStage(tl, q, i, i === 1 ? 0 : ">-0.08", 0.3);
        closeLoop(tl, q, ">");
      });
      // Passo 2: a roda ganha movimento; a leitura por fase (o que é Fase 1 ou 2 e o que é ideia).
      at(2, (tl) => {
        unmask(tl, q('[data-a="statement"] .split-unit'), 0, { stagger: 0.05 });
        revealHighlights(tl, q('[data-a="statement"] .hl'), 0.8);
        rise(tl, q('[data-a="statement-lede"]'), 0.5);
        hold(tl, 0.3);
      });
    },
    [scrub],
  );

  // Scrub: o scroll entre os passos 0 e 1 acende os estágios um a um.
  useGSAP(
    () => {
      const section = sectionRef.current;
      const root = scope.current;
      if (!scrub || !section || !root) return;
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ paused: true });
      for (let i = 1; i < N; i++) lightStage(tl, q, i, i === 1 ? 0 : ">-0.2");
      closeLoop(tl, q, ">");
      const stepLen = () => (section.offsetHeight - window.innerHeight) / (meta.steps - 1);
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.max(1, stepLen())}`,
        scrub: 1.4,
        animation: tl,
        invalidateOnRefresh: true,
      });
    },
    { scope, dependencies: [scrub] },
  );

  // Passo final: a roda "começa parada e ganha movimento" — anel e cometas giram, cada vez mais rápido.
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || !entered || step < 2 || motionPrefs.reduced) return;
    const ring = root.querySelector('[data-a="fw-ring"]');
    const contours = root.querySelector(".fw-contours");
    const layer = root.querySelector('[data-a="fw-comets"]');
    const anims: gsap.core.Animation[] = [];
    anims.push(gsap.to(ring, { rotation: 360, svgOrigin: `${FW.c} ${FW.c}`, duration: 110, repeat: -1, ease: "none" }));
    anims.push(gsap.to(contours, { rotation: -360, duration: 160, repeat: -1, ease: "none" }));
    const NS = "http://www.w3.org/2000/svg";
    for (let k = 0; k < 3; k++) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("r", "5");
      c.setAttribute("class", "fw-comet");
      layer?.appendChild(c);
      const t = gsap.to(c, { motionPath: { path: CIRCLE }, duration: 16, repeat: -1, ease: "none" });
      t.progress(k / 3);
      anims.push(t);
    }
    anims.forEach((a) => a.timeScale(0));
    gsap.to(anims, { timeScale: 1, duration: 3.5, ease: "power2.in", delay: 0.4 });
    motion.current = anims;
    return () => {
      anims.forEach((a) => a.kill());
      layer?.replaceChildren();
      motion.current = [];
    };
  }, [step, current, entered, scope]);

  // Hover pausa a roda (desacelera até parar) e retoma ao sair.
  useEffect(() => {
    if (!motion.current.length) return;
    gsap.to(motion.current, { timeScale: active === null ? 1 : 0, duration: 0.6, ease: "power2.out", overwrite: true });
  }, [active]);

  const a = active;
  const prevIdx = a === null ? null : (a - 1 + N) % N;
  const nextIdx = a === null ? null : (a + 1) % N;

  return (
    <div ref={scope} className="slide grid-12 items-center gap-y-6">
      <div className="col-span-12 flex h-full flex-col justify-between py-2 lg:col-span-4">
        <SectionHeader index={index} label={copy.label} title={copy.title} titleClassName="!text-[clamp(30px,3.1vw,56px)]" />

        <div>
          <div data-a="statement">
            <SplitHeadline as="p" lines={STATEMENT} className="t-headline text-[clamp(26px,2.5vw,44px)]" />
          </div>
          <p data-a="statement-lede" className="t-lede mt-4 max-w-[40ch] text-[length:var(--fs-body)]">
            {copy.lede}
          </p>
          <p data-a="statement-lede" className="mt-2 max-w-[40ch] text-[12.5px] leading-snug text-fg-3">
            {copy.honesty}
          </p>
        </div>

        <div data-a="fw-info" className="fw-info" aria-live="polite">
          {a === null || prevIdx === null || nextIdx === null ? (
            <>
              <p className="t-label text-fg-3">{copy.legendTitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StageTag stage="agora" />
                <StageTag stage="depois" />
                <StageTag stage="ideia" />
                <Tag kind="current">{copy.legend.current}</Tag>
                <span className="fw-legend-result">
                  <i aria-hidden="true" />
                  {copy.legend.result}
                </span>
              </div>
              <p className="mt-3 text-[12.5px] leading-snug text-fg-3">{copy.hint}</p>
            </>
          ) : (
            <>
              <p className="flex flex-wrap items-center gap-2 t-label text-brand-text">
                <span>
                  {pad2(a + 1)} · {copy.stages[a].label}
                </span>
                <FlywheelGear stage={STAGES[a]} resultLabel={copy.info.result} />
              </p>
              <p className="mt-3 text-[13.5px] leading-snug text-fg-2">
                <span className="text-fg-3">← {copy.stages[prevIdx].label}: </span>
                {copy.stages[prevIdx].why}
              </p>
              <p className="mt-2 text-[13.5px] leading-snug text-fg">
                <span className="text-fg-3">→ {copy.stages[nextIdx].label}: </span>
                {copy.stages[a].why}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="col-span-12 flex items-center justify-center lg:col-span-8">
        <Flywheel
          className="w-full max-w-[min(100%,calc(100svh-2*var(--chrome-h)-24px))]"
          stages={STAGES}
          starter={copy.starter}
          centerLabel={copy.centerLabel}
          active={active}
          onActive={(i) => {
            setActive(i);
            if (i !== null) deck.markStarted();
          }}
        />
      </div>
    </div>
  );
}

/** Selo da engrenagem no painel de causa e efeito. */
function FlywheelGear({ stage, resultLabel }: { stage: FlywheelStage; resultLabel: string }) {
  if (stage.kind === "resultado") return <span className="fw-legend-result normal-case tracking-normal">{resultLabel}</span>;
  if (stage.kind === "atual") return <Tag kind="current">{stage.gear}</Tag>;
  if (!stage.kind) return null;
  return <StageTag stage={stage.kind} label={stage.gear} />;
}
