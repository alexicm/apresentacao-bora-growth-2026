"use client";

import { useEffect, useRef, useState } from "react";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ValueCircuit, circuitLoop, type CircuitNode } from "@/components/diagrams/ValueCircuit";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { Slider } from "@/components/ui/Slider";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { copy, type BoostNodeId } from "@/content/slides/08-boost";
import { fmtBRL, fmtInt, fmtPct } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { draw, fade, motionPrefs, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import s from "./S08Boost.module.css";

// Posição de cada nó na cadeia linear (passo 1, % da largura) e no anel (passo 2, graus).
// A cadeia "se curva" sem cruzamentos: a ponta direita desce e volta pela esquerda.
const LAYOUT: Record<BoostNodeId, Pick<CircuitNode, "line" | "angle" | "place" | "accent">> = {
  brand: { line: 4, angle: 180, place: "left" },
  boost: { line: 33, angle: 252, place: "top", accent: true },
  clubs: { line: 62, angle: 324, place: "right" },
  runners: { line: 91, angle: 36, place: "right" },
  data: { angle: 108, place: "bottom" },
};
const NODES: CircuitNode[] = copy.nodes.map((n) => ({
  id: n.id,
  label: n.label,
  caption: LAYOUT[n.id].line !== undefined ? n.caption : undefined,
  ...LAYOUT[n.id],
}));
const TOKENS = copy.flow.map((f) => f.token);
const RECV_ACCENT = new Set<string>(["boost"]);

const SIM = copy.sim;
type Inputs = { budget: number; fee: number; clubs: number; members: number; participation: number };
const DEFAULTS: Inputs = {
  budget: SIM.inputs.budget.value,
  fee: SIM.inputs.fee.value,
  clubs: SIM.inputs.clubs.value,
  members: SIM.inputs.members.value,
  participation: SIM.inputs.participation.value,
};

const LINE = "[data-a='vc-node']:not([data-ring-only])";
const RING_ONLY = "[data-a='vc-node'][data-ring-only]";

export function BoostSlide() {
  const slide = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";

  // Simulação
  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const set = (k: keyof Inputs) => (v: number) => setInp((prev) => ({ ...prev, [k]: v }));
  const revenue = inp.budget * inp.fee;
  const perClub = (inp.budget - revenue) / inp.clubs;
  const reached = Math.round(inp.clubs * inp.members * inp.participation);
  const cpr = reached > 0 ? inp.budget / reached : 0;

  const { scope } = useStepTimeline(
    ({ step, q, reduced }) => {
      step(0, (tl) => {
        revealHeader(tl, q);
      });

      // 1 · A cadeia linear: Marca → BORA BOOST → Clubes Powered → Corredores (+ no que os créditos viram).
      step(1, (tl) => {
        if (flow) tl.set(q(LINE), { "--m": 1 }, 0);
        tl.from(
          q(`${LINE} [data-a='vc-dot']`),
          { autoAlpha: 0, scale: reduced ? 1 : 0.3, duration: reduced ? 0.4 : 0.6, ease: "bora", stagger: 0.26 },
          0,
        );
        rise(tl, q(`${LINE} [data-a='vc-label']`), 0.06, { stagger: 0.26, y: 12 });
        if (flow) {
          tl.set(q("[data-a='vc-link'], [data-a='vc-drop'], [data-a='vc-credit'], [data-a='vc-caption']"), { autoAlpha: 0 }, 0);
          return;
        }
        if (reduced) fade(tl, q("[data-a='vc-link']"), 0.25, { stagger: 0.2 });
        else tl.from(q("[data-a='vc-link']"), { scaleX: 0, duration: 0.5, ease: "power2.inOut", stagger: 0.26 }, 0.2);
        fade(tl, q("[data-a='vc-drop']"), 1.05);
        rise(tl, q("[data-a='vc-credit']"), 1.15, { stagger: 0.045, y: 10, duration: 0.6 });
      });

      // 2 · A cadeia se curva em circuito; nasce o nó de dados e o anel se fecha de volta na marca.
      step(2, (tl) => {
        if (!flow) {
          tl.to(q("[data-a='vc-credit'], [data-a='vc-drop'], [data-a='vc-link'], [data-a='vc-caption']"), {
            autoAlpha: 0,
            duration: 0.35,
            ease: "power2.in",
          }, 0);
          if (reduced) tl.set(q(LINE), { "--m": 1 }, 0.35);
          else tl.to(q(LINE), { "--m": 1, duration: 1.4, ease: "power3.inOut", stagger: 0.06 }, 0.15);
        }
        draw(tl, q("[data-a='vc-ring']"), flow ? 0 : 0.6, { duration: 1.3 });
        tl.from(q(`${RING_ONLY} [data-a='vc-dot']`), { autoAlpha: 0, scale: reduced ? 1 : 0.3, duration: 0.6, ease: "bora" }, flow ? 0.4 : 1.3);
        rise(tl, q(`${RING_ONLY} [data-a='vc-label']`), flow ? 0.45 : 1.35, { y: 10 });
        // Painéis do slot ficam ocultos (inclusive o contêiner) até o seu passo.
        tl.from(q("[data-a='legend']"), { autoAlpha: 0, duration: 0.01 }, 0);
        rise(tl, q("[data-a='legend'] [data-a='in']"), flow ? 0.3 : 0.9, { stagger: 0.08, y: 16 });
      });

      // 3 · Quem recebe o quê.
      step(3, (tl) => {
        if (!flow) tl.to(q("[data-a='legend']"), { autoAlpha: 0, y: reduced ? 0 : -14, duration: 0.4, ease: "power2.in" }, 0);
        tl.from(q("[data-a='table']"), { autoAlpha: 0, duration: 0.01 }, flow ? 0 : 0.25);
        rise(tl, q("[data-a='table'] [data-a='in']"), flow ? 0 : 0.3, { stagger: 0.07, y: 16 });
      });

      // 4 · Exemplo + simulação.
      step(4, (tl) => {
        if (!flow) {
          tl.to(q("[data-a='table']"), { autoAlpha: 0, y: reduced ? 0 : -14, duration: 0.4, ease: "power2.in" }, 0);
          tl.to(q("[data-a='vc']"), { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, 0.05);
        }
        rise(tl, q("[data-a='sim']"), flow ? 0 : 0.3, { y: 24, duration: 0.9 });
      });

      // 5 · A ficha da ação (ideia: como validamos).
      step(5, (tl) => revealBrief(tl, q));
    },
    [flow],
  );

  // Pacote em loop pelo circuito — só com o slide em cena, a partir do passo 2, sem movimento reduzido.
  const circuitRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLOListElement>(null);
  const looping = slide.current && slide.entered && slide.step >= 2 && !flow;
  useEffect(() => {
    const root = circuitRef.current;
    if (!looping || !root || motionPrefs.reduced) return;
    const rows = Array.from(legendRef.current?.querySelectorAll<HTMLElement>("[data-flow-row]") ?? []);
    const ctx = gsap.context(() => {
      circuitLoop(root, TOKENS, {
        delay: 1.6,
        onSegment: (i) => rows.forEach((r, k) => r.toggleAttribute("data-on", k === i)),
      });
    }, root);
    return () => {
      ctx.revert();
      rows.forEach((r) => r.removeAttribute("data-on"));
    };
  }, [looping]);

  return (
    <div ref={scope} className="slide flex flex-col gap-y-[clamp(16px,3vh,40px)] md:grid md:grid-rows-[auto_minmax(0,1fr)]">
      {/* Cabeçalho: manchete + o porquê em duas frases */}
      <div className="grid-12 items-end gap-y-5">
        <SectionHeader
          className="col-span-12 md:col-span-7"
          index={slide.index}
          label={copy.label}
          tag={<StageTag of="boost" />}
          title={copy.headline}
        />
        <p className="sh-lede t-lede col-span-12 max-w-[46ch] md:col-span-5 md:justify-self-end [&_strong]:font-medium [&_strong]:text-fg">
          <Emphasis text={copy.why} />
        </p>
      </div>

      <div className={s.stage} data-flow={flow ? "" : undefined}>
        <p className="sr-only">
          {copy.nodes.map((n) => n.label).join(" → ")} → {copy.nodes[0].label}. {copy.creditsLabel}: {copy.credits.join(", ")}.
        </p>

        <div className={s.circuitBox}>
          <ValueCircuit
            ref={circuitRef}
            nodes={NODES}
            credits={{ label: copy.creditsLabel, items: copy.credits, from: LAYOUT.clubs.line ?? 62 }}
          />
        </div>

        <div className={s.slot}>
          {/* 2 · Legenda: o que circula em cada trecho */}
          <section data-a="legend" className={s.panel} aria-label={copy.flowTitle}>
            <p data-a="in" className="t-label text-fg-3">
              {copy.flowTitle}
            </p>
            <ol ref={legendRef} className={s.flowList}>
              {copy.flow.map((f) => (
                <li key={f.token} data-a="in" data-flow-row="" className={s.flowRow}>
                  <span className={s.token}>{f.token}</span>
                  <div>
                    <span className={cn(s.route, "t-mono")}>{f.route}</span>
                    <p className={s.flowText}>{f.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 3 · Quem recebe o quê */}
          <section data-a="table" className={cn(s.panel, s.tablePanel)} aria-label={copy.receivesTitle}>
            <p data-a="in" className="t-label text-fg-3">
              {copy.receivesTitle}
            </p>
            <div className={s.recv}>
              {copy.receives.map((col) => (
                <div key={col.id} data-a="in">
                  <h3 className={cn(s.recvHead, "text-[clamp(13px,1vw,16px)] font-semibold tracking-[-0.01em] text-fg")}>
                    <span className={cn(s.recvDot, "mt-[0.32em] self-start")} data-accent={RECV_ACCENT.has(col.id) ? "" : undefined} aria-hidden="true" />
                    {col.who}
                  </h3>
                  <ul className={s.recvList} data-hero={col.items.length === 1 ? "" : undefined}>
                    {col.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p data-a="in" className="mt-[clamp(14px,2.4vh,26px)] max-w-[62ch] text-[length:var(--fs-body)] leading-relaxed text-fg-2 [&_strong]:font-semibold [&_strong]:text-fg">
              <Emphasis text={copy.receivesTakeaway} />
            </p>
          </section>

          {/* 4 · Exemplo + simulação */}
          <div data-a="sim" className={cn(s.panel, s.simPanel)}>
            <SimPanel title={SIM.title} note={SIM.note}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <Tag kind="example" className="shrink-0" />
                <p className="min-w-0 text-[length:var(--fs-body)] text-fg">
                  <strong className="font-semibold">{SIM.example}</strong>
                  <span className="text-fg-3"> {SIM.exampleDetail}</span>
                </p>
              </div>

              <div className="mt-[clamp(14px,2.6vh,28px)] grid grid-cols-1 gap-x-[var(--gutter)] gap-y-[clamp(10px,1.8vh,18px)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Slider {...SIM.inputs.budget} value={inp.budget} onChange={set("budget")} format={fmtBRL} />
                <Slider {...SIM.inputs.fee} value={inp.fee} onChange={set("fee")} format={fmtPct} />
                <Slider {...SIM.inputs.clubs} value={inp.clubs} onChange={set("clubs")} format={fmtInt} />
                <Slider {...SIM.inputs.members} value={inp.members} onChange={set("members")} format={fmtInt} />
                <Slider {...SIM.inputs.participation} value={inp.participation} onChange={set("participation")} format={fmtPct} />
              </div>

              <figure className="mt-[clamp(16px,3vh,32px)]">
                <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[12.5px] text-fg-3">
                  <span className="t-label">{SIM.splitTitle}</span>
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5">
                      <i className={s.swatch} data-bora="" aria-hidden="true" />
                      {SIM.splitBora} {fmtPct(inp.fee)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className={s.swatch} aria-hidden="true" />
                      {fmtInt(inp.clubs)} {SIM.splitClubs} {fmtBRL(perClub)}
                    </span>
                  </span>
                </figcaption>
                <div className={cn(s.split, "mt-2.5")} aria-hidden="true">
                  <span className={s.splitSeg} data-bora="" style={{ flexGrow: inp.fee }} />
                  {Array.from({ length: inp.clubs }, (_, i) => (
                    <span key={i} className={s.splitSeg} style={{ flexGrow: (1 - inp.fee) / inp.clubs }} />
                  ))}
                </div>
              </figure>

              <div className="mt-[clamp(16px,3vh,32px)] grid grid-cols-2 gap-x-[var(--gutter)] gap-y-4 border-t border-line pt-[clamp(14px,2.4vh,24px)] lg:grid-cols-4">
                <Stat value={perClub} label={SIM.outputs.perClub} format={fmtBRL} />
                <Stat value={reached} label={SIM.outputs.reached} format={fmtInt} />
                <Stat value={cpr} label={SIM.outputs.cpr} format={fmtBRL} />
                <Stat value={revenue} label={SIM.outputs.revenue} format={fmtBRL} accent />
              </div>
            </SimPanel>
          </div>
        </div>
      </div>

      <ActionBrief id="boost" />
    </div>
  );
}
