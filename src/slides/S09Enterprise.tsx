"use client";

import { useId, useRef, useState, type CSSProperties } from "react";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ProgramShape } from "@/components/diagrams/ProgramShape";
import { UseCasePanel } from "@/components/diagrams/UseCasePanel";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { StageDots, StageTag } from "@/components/ui/StageTag";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { STAGE_LABEL, stageOf } from "@/content/projects";
import { copy, type EnterpriseProduct, type EnterpriseProductId } from "@/content/slides/09-enterprise";
import { fmtBRL, fmtInt, fmtPct } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { fade, hold, motionPrefs, rise } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import s from "./S09Enterprise.module.css";

type View = EnterpriseProductId | "sim";
type Inputs = { eligible: number; adoption: number; completion: number; conversion: number; price: number };

const PRODUCTS = copy.products;
/** Passo em que o simulador assume o palco (depois dos quatro produtos). */
const SIM_STEP = PRODUCTS.length;
const SIM = copy.sim;
const DEFAULTS: Inputs = {
  eligible: SIM.inputs.eligible.value,
  adoption: SIM.inputs.adoption.value,
  completion: SIM.inputs.completion.value,
  conversion: SIM.inputs.conversion.value,
  price: SIM.inputs.price.value,
};
const WAFFLE = Array.from({ length: 100 }, (_, i) => i);
/** Degraus da linha que ainda não estão rodando (ex.: BORA LEAGUE, ideia) levam o estágio próprio. */
const stageIdOf = (p: EnterpriseProduct) => ("stageId" in p ? p.stageId : undefined);

export function EnterpriseSlide() {
  const slide = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";
  const uid = useId();
  const panelId = `${uid}-panel`;
  const simId = `${uid}-sim`;

  // O passo do apresentador escolhe o produto (START → RUN CLUB → RACE TEAM → LEAGUE → simulador).
  // Um clique vale até o próximo passo — assim → e clique convivem sem estado duplicado.
  const [pick, setPick] = useState<{ step: number; view: View } | null>(null);
  const auto: View = flow ? PRODUCTS[0].id : slide.step >= SIM_STEP ? "sim" : PRODUCTS[slide.step].id;
  const active: View = pick && pick.step === slide.step ? pick.view : auto;
  const view: "product" | "sim" = active === "sim" ? "sim" : "product";
  const sel = active === "sim" ? -1 : PRODUCTS.findIndex((p) => p.id === active);
  const productIndex = sel >= 0 ? sel : Math.min(slide.step, PRODUCTS.length - 1);
  const product = PRODUCTS[productIndex];
  const choose = (v: View) => setPick({ step: slide.step, view: v });

  // Simulação
  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const set = (k: keyof Inputs) => (v: number) => setInp((prev) => ({ ...prev, [k]: v }));
  const participants = Math.round(inp.eligible * inp.adoption);
  const finishers = Math.round(participants * inp.completion);
  const conversions = Math.round(finishers * inp.conversion);
  const revenue = participants * inp.price;
  const pDots = Math.round(inp.adoption * 100);
  const fDots = Math.round(pDots * inp.completion);
  const cDots = conversions > 0 ? Math.max(1, Math.round(fDots * inp.conversion)) : 0;

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    step(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q("[data-a='buyer']"), 0.55, { stagger: 0.05, y: 10 });
      fade(tl, q("[data-a='rail-title']"), 0.35);
      rise(tl, q("[data-a='item']"), 0.45, { stagger: 0.1, y: 14 });
      // O trilho se desenha de cima para baixo, segmento a segmento.
      if (reduced) fade(tl, q("[data-a='seg']"), 0.6);
      else tl.from(q("[data-a='seg']"), { scaleY: 0, duration: 0.42, ease: "power2.inOut", stagger: 0.32 }, 0.62);
      rise(tl, q("[data-a='stage']"), 0.65, { y: 32, duration: 1.1 });
      rise(tl, q("[data-a='cta']"), 1.1, { y: 10 });
      fade(tl, q("[data-a='foot']"), 1.25);
    });
    // Passos 1–3 trocam o produto e o 4 abre o simulador (estado React); a timeline só marca o tempo.
    for (let n = 1; n <= SIM_STEP; n++) step(n, (tl) => hold(tl, 0.8));
    // Último passo — a ficha da ação.
    step(SIM_STEP + 1, (tl) => revealBrief(tl, q));
  });

  // Troca painel ↔ simulador (imperativa: não é passo da timeline, também responde a clique).
  const productRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<HTMLDivElement>(null);
  const shownView = useRef<string | null>(null);
  useGSAP(
    () => {
      const pv = productRef.current;
      const sv = simRef.current;
      if (!pv || !sv) return;
      if (flow) {
        gsap.set([pv, sv], { clearProps: "opacity,visibility,transform" });
        shownView.current = null;
        return;
      }
      const show = view === "sim" ? sv : pv;
      const hide = view === "sim" ? pv : sv;
      if (shownView.current === null) {
        gsap.set(hide, { autoAlpha: 0 });
        gsap.set(show, { autoAlpha: 1, y: 0 });
      } else if (shownView.current !== view) {
        const r = motionPrefs.reduced;
        gsap.to(hide, { autoAlpha: 0, y: r ? 0 : -14, duration: r ? 0.2 : 0.38, ease: "power2.in", overwrite: true });
        gsap.fromTo(
          show,
          { autoAlpha: 0, y: r ? 0 : 22 },
          { autoAlpha: 1, y: 0, duration: r ? 0.3 : 0.85, delay: r ? 0 : 0.18, ease: "bora", overwrite: true },
        );
      }
      shownView.current = view;
      return () => {
        shownView.current = null;
      };
    },
    { dependencies: [view, flow] },
  );

  return (
    <div ref={scope} className="slide flex flex-col gap-y-[clamp(18px,3.4vh,44px)] md:grid md:grid-rows-[auto_minmax(0,1fr)]">
      {/* Cabeçalho: manchete à esquerda; explicação (≥ 1280px) + compradores à direita */}
      <div className="grid-12 items-end gap-y-5">
        <SectionHeader
          className="col-span-12 md:col-span-8"
          index={slide.index}
          label={copy.label}
          tag={<StageTag of="enterprise" />}
          title={copy.headline}
        />
        <div className="col-span-12 md:col-span-4">
          <p className="sh-lede t-lede hidden max-w-[44ch] xl:block">{copy.lede}</p>
          <div className="xl:mt-[clamp(12px,2vh,20px)]">
            <p data-a="buyer" className="t-label text-fg-3">
              {copy.buyersTitle}
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {copy.buyers.map((b) => (
                <li
                  key={b}
                  data-a="buyer"
                  className="inline-flex h-[30px] items-center rounded-[var(--radius-pill)] border border-line-strong px-3 text-[12.5px] font-medium text-fg-2"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sistema: trilho de maturidade + palco (produto ou simulação) */}
      <div className="grid-12 min-h-0 gap-y-6">
        <div className="col-span-12 flex min-h-0 flex-col md:col-span-4">
          <p data-a="rail-title" className="t-label flex items-center gap-2 text-fg-3">
            {copy.maturity}
            <span aria-hidden="true">→</span>
          </p>
          <ol className={cn(s.rail, "mt-[clamp(14px,2.4vh,26px)] flex-1")} aria-label={copy.railAria}>
            {PRODUCTS.map((p, i) => {
              const state = active === "sim" || i < sel ? "past" : i === sel ? "active" : "next";
              const filled = active === "sim" || i < sel;
              return (
                <li key={p.id} className={s.item}>
                  {i < PRODUCTS.length - 1 && (
                    <span data-a="seg" className={s.seg} aria-hidden="true">
                      <span className={s.segFill} style={{ transform: `scaleY(${filled ? 1 : 0})` }} />
                    </span>
                  )}
                  <div data-a="item" className="h-full">
                    <button
                      type="button"
                      className={s.btn}
                      data-state={state}
                      aria-pressed={i === sel}
                      aria-controls={panelId}
                      onClick={() => choose(p.id)}
                    >
                      <span className={s.dot} aria-hidden="true" />
                      <span className={cn(s.kicker, "t-label")}>
                        <span className="t-mono">{pad2(i + 1)}</span>
                        {p.stage}
                        <StageMark id={stageIdOf(p)} />
                      </span>
                      <span className={s.name}>{p.name}</span>
                      <span className={s.caption}>
                        {p.line} · {p.span}
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          <div data-a="cta" className="mt-4">
            <button
              type="button"
              className={cn("pill", view === "sim" && "pill--brand")}
              aria-pressed={view === "sim"}
              aria-controls={simId}
              onClick={() => choose("sim")}
            >
              <span aria-hidden="true">↳</span>
              {copy.simCta}
            </button>
          </div>
          <p data-a="foot" className="mt-[clamp(12px,2vh,20px)] max-w-[38ch] text-[12.5px] leading-snug text-fg-3">
            {copy.disclaimer}
          </p>
        </div>

        <div data-a="stage" className="col-span-12 flex min-h-0 flex-col md:col-span-8">
          <div className={cn(s.stage, "min-h-0 flex-1")} data-flow={flow ? "" : undefined}>
            <div ref={productRef} className={s.view} data-view="product" inert={!flow && view !== "product"}>
              <UseCasePanel
                id={product.id}
                panelId={panelId}
                className="h-full"
                kicker={
                  <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span>
                      <span className="t-mono">
                        {pad2(productIndex + 1)} / {pad2(PRODUCTS.length)}
                      </span>
                      {"  ·  "}
                      {product.stage}
                    </span>
                    {stageIdOf(product) && <StageTag of={stageIdOf(product)} />}
                  </span>
                }
                title={product.name}
                statementLabel={copy.fields.objective}
                statement={product.objective}
                visual={<ProgramShape kind={product.shape} labels={product.shapeLabels} className={s.shape} />}
                visualClassName={s.visual}
                fields={[
                  { key: "duration", label: copy.fields.duration, value: product.duration },
                  { key: "delivery", label: copy.fields.delivery, value: product.delivery },
                  { key: "revenue", label: copy.fields.revenue, value: product.revenue },
                  { key: "conversion", label: copy.fields.conversion, value: product.conversion, accent: true },
                ]}
              />
            </div>

            <div ref={simRef} id={simId} className={s.view} data-view="sim" inert={!flow && view !== "sim"}>
              <SimPanel title={SIM.title} note={SIM.note} className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)]">
                <div className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Tag kind="example" className="shrink-0" />
                    <p className="min-w-0 text-[length:var(--fs-body)] text-fg">
                      <strong className="font-semibold">{SIM.example}</strong>
                      <span className="text-fg-3"> {SIM.exampleDetail}</span>
                    </p>
                  </div>

                  <div className="grid flex-1 grid-cols-1 content-center items-center gap-x-[var(--gutter)] gap-y-5 py-[clamp(8px,1.4vh,26px)] xl:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-[clamp(8px,1.7vh,26px)] sm:grid-cols-2">
                      <Slider {...SIM.inputs.eligible} value={inp.eligible} onChange={set("eligible")} format={fmtInt} />
                      <Slider {...SIM.inputs.adoption} value={inp.adoption} onChange={set("adoption")} format={fmtPct} />
                      <Slider {...SIM.inputs.completion} value={inp.completion} onChange={set("completion")} format={fmtPct} />
                      <Slider {...SIM.inputs.conversion} value={inp.conversion} onChange={set("conversion")} format={fmtPct} />
                      <Slider {...SIM.inputs.price} value={inp.price} onChange={set("price")} format={fmtBRL} />
                    </div>

                    {/* Funil em pontos: só onde há espaço (o mesmo dado está nos números abaixo). */}
                    <figure className="hidden flex-col gap-3 xl:flex xl:border-l xl:border-line xl:pl-[var(--gutter)]" aria-hidden="true">
                      <div className={s.waffle}>
                        {WAFFLE.map((i) => (
                          <span key={i} className={s.w} data-k={i < cDots ? 3 : i < fDots ? 2 : i < pDots ? 1 : 0} />
                        ))}
                      </div>
                      <figcaption className="text-[11.5px] leading-snug text-fg-3">{SIM.waffleCaption}</figcaption>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px] text-fg-2">
                        {SIM.waffleLegend.map((l, k) => (
                          <li key={l} className="flex items-center gap-1.5">
                            <span className={cn(s.swatch, s.w)} data-k={k} style={{ "--w-dot": "9px" } as CSSProperties} />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </figure>
                  </div>

                  <div className="grid grid-cols-2 gap-x-[var(--gutter)] gap-y-4 border-t border-line pt-[clamp(12px,2.2vh,22px)] lg:grid-cols-4">
                    <Stat value={participants} label={SIM.outputs.participants} format={fmtInt} />
                    <Stat value={finishers} label={SIM.outputs.finishers} format={fmtInt} />
                    <Stat value={conversions} label={SIM.outputs.conversions} format={fmtInt} />
                    <Stat value={revenue} label={SIM.outputs.revenue} format={fmtBRL} accent />
                  </div>
                </div>
              </SimPanel>
            </div>
          </div>
        </div>
      </div>

      <ActionBrief id="enterprise" />
    </div>
  );
}

/** Marca compacta de estágio para o trilho (●○○ Ideia), quando o degrau não está rodando. */
function StageMark({ id }: { id?: string }) {
  const stage = id ? stageOf(id) : undefined;
  if (!stage) return null;
  return (
    <span className={s.stageMark}>
      <StageDots stage={stage} />
      {STAGE_LABEL[stage]}
    </span>
  );
}
