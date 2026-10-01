"use client";

import { useEffect, useRef } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/02-problem";
import { Flip, gsap } from "@/lib/gsap";
import { fade, hold, motionPrefs, rise, unmask } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S02Problem.module.css";

const RUNNERS = 14;
const byId = (list: readonly { id: string; label: string; caption: string }[], id: string) => list.find((s) => s.id === id);

/** Estações persistentes (existem nos dois modelos e se reorganizam com Flip) + estações novas. */
const PERSISTENT = ["ad", "lead", "whatsapp", "sales", "coaching"] as const;
const ENTERING = ["community", "revenue"] as const;

export function ProblemSlide() {
  const { index, step, entered, current } = useSlide();
  const flowRef = useRef<HTMLDivElement>(null);
  const isNew = useRef(false);
  const lastStep = useRef(step);

  const { scope } = useStepTimeline(({ step: at, q, reduced }) => {
    // Passo 0 — o que a BORA já construiu.
    at(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="fact"]'), 0.4, { stagger: 0.1, y: 14 });
      fade(tl, q('[data-a="source"]'), 0.9);
    });

    // Passo 1 — o funil de hoje: uma linha, um corredor de cada vez.
    at(1, (tl) => {
      fade(tl, q('[data-a="flow-label-old"]'), 0);
      tl.from(q('[data-a="rail"]'), { scaleX: 0, duration: reduced ? 0.4 : 1.5, ease: "power3.inOut" }, 0);
      rise(tl, q('[data-a="st-old"]'), 0.15, { stagger: 0.14, y: 16 });
      tl.from(q('[data-a="dot"]'), { scale: 0, autoAlpha: 0, duration: 0.5, stagger: 0.14, ease: "back.out(1.6)" }, 0.2);
      unmask(tl, q('[data-a="stmt-old"] .split-unit'), 0.7, { stagger: 0.05 });
      rise(tl, q('[data-a="lede-old"]'), 1.0);
    });

    // Passo 2 — a reorganização: comunidade vira a porta de entrada; mídia vira amplificador.
    at(2, (tl) => {
      tl.to(q('[data-a="tag-now"]'), { autoAlpha: 0, duration: 0.3 }, 0)
        .from(q('[data-a="tag-new"]'), { autoAlpha: 0, duration: 0.5 }, 0.3)
        .to(q('[data-a="flow-label-old"]'), { autoAlpha: 0, duration: 0.3 }, 0)
        .from(q('[data-a="flow-label-new"]'), { autoAlpha: 0, duration: 0.5 }, 0.35);

      // Rótulos: os antigos saem para cima, os novos entram (as posições mudam via Flip).
      tl.to(q('[data-a="st-old"]'), { autoAlpha: 0, y: reduced ? 0 : -12, duration: 0.45, stagger: 0.04, ease: "power2.in" }, 0.05)
        .from(q('[data-a="st-new"]'), { autoAlpha: 0, y: reduced ? 0 : 12, duration: 0.7, stagger: 0.06, ease: "bora" }, 0.8)
        .from(q('[data-a="st-enter"]'), { autoAlpha: 0, y: reduced ? 0 : 14, duration: 0.8, stagger: 0.12, ease: "bora" }, 0.9)
        .from(q('[data-a="dot-new"]'), { scale: 0, autoAlpha: 0, duration: 0.5, stagger: 0.06, transformOrigin: "50% 50%" }, 1.1)
        .to(q('[data-a="dot-ad"]'), { autoAlpha: 0, duration: 0.3 }, 0.1)
        .from(q('[data-a="branch"]'), { scaleY: 0, duration: 0.7, ease: "power2.out" }, 1.25);

      // Mensagem: de "um corredor de cada vez" para "não depender só de mídia".
      tl.to(q('[data-a="stmt-old"] .split-unit'), { yPercent: -115, duration: 0.5, stagger: 0.02, ease: "power2.in" }, 0.05)
        .to(q('[data-a="lede-old"]'), { autoAlpha: 0, duration: 0.3 }, 0.05);
      unmask(tl, q('[data-a="stmt-new"] .split-unit'), 0.6, { stagger: 0.04 });
      rise(tl, q('[data-a="lede-new"]'), 0.95);

      // Comparativo.
      fade(tl, q('[data-a="compare"]'), 0.9, { duration: 0.5 });
      rise(tl, q(".dt-row"), 1.05, { stagger: 0.08, y: 10 });
      hold(tl, 0.2);
    });
  });

  // Flip: a troca de layout (5 estações → 6 + ramal de mídia) acontece quando o passo muda.
  useEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;
    const wantNew = entered && step >= 2;
    const prev = lastStep.current;
    lastStep.current = step;
    if (wantNew === isNew.current) return;

    const targets = flow.querySelectorAll("[data-flip-id]");
    const state = Flip.getState(targets);
    flow.classList.toggle(styles.isNew, wantNew);
    isNew.current = wantNew;

    const animate = current && Math.abs(step - prev) <= 1 && !motionPrefs.reduced;
    if (!animate) return;
    Flip.from(state, {
      duration: 1.3,
      ease: "power3.inOut",
      absolute: true,
      simple: true,
      stagger: 0.025,
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, duration: 0.25 }),
    });
  }, [step, entered, current]);

  // Corredores: um de cada vez (hoje) × muitos ao mesmo tempo (rede). Só com o slide em cena.
  useEffect(() => {
    const flow = flowRef.current;
    if (!flow || !current || !entered || step < 1 || motionPrefs.reduced) return;
    const tracks = gsap.utils.toArray<HTMLElement>(flow.querySelectorAll('[data-a="track"]'));
    const trickle = flow.querySelector('[data-a="trickle"]');
    const ctx = gsap.context(() => {
      if (step === 1) {
        const [track] = tracks;
        const dot = track.firstElementChild;
        gsap
          .timeline({ repeat: -1, repeatDelay: 0.6, delay: 1.4 })
          .set(track, { xPercent: 0 })
          .to(dot, { opacity: 1, duration: 0.3 })
          .to(track, { xPercent: 100, duration: 4.6, ease: "none" }, "<")
          .to(dot, { opacity: 0, duration: 0.35 }, ">-0.35");
      } else {
        tracks.forEach((track, i) => {
          const dot = track.firstElementChild;
          gsap
            .timeline({ repeat: -1, delay: 1.5 + i * 0.34 })
            .fromTo(track, { xPercent: 0 }, { xPercent: 100, duration: 4.8, ease: "none" })
            .fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
            .to(dot, { opacity: 0, duration: 0.4 }, 4.4);
        });
        if (trickle) {
          gsap
            .timeline({ repeat: -1, repeatDelay: 1.2, delay: 2 })
            .fromTo(trickle, { y: 0, opacity: 0 }, { opacity: 1, duration: 0.2 })
            .to(trickle, { y: () => -((trickle.parentElement?.offsetHeight ?? 40) + 2), duration: 1.1, ease: "power1.in" }, "<")
            .to(trickle, { opacity: 0, duration: 0.2 }, ">-0.2");
        }
      }
    }, flow);
    return () => ctx.revert();
  }, [step, current, entered]);

  const renderStation = (id: string) => {
    const old = byId(copy.oldFlow, id);
    const next = byId(copy.newFlow, id);
    const entering = (ENTERING as readonly string[]).includes(id);
    const isAd = id === "ad";
    return (
      <div
        key={id}
        data-flip-id={id}
        data-station={id}
        data-a={entering ? "st-enter" : undefined}
        className={styles.station}
      >
        <div className={styles.swap}>
          {old && (
            <div data-a="st-old" className="flex flex-col gap-2">
              <span className={styles.label}>{old.label}</span>
              <span className={styles.caption}>{old.caption}</span>
            </div>
          )}
          {isAd ? (
            <div data-a="st-new" className="relative self-end">
              <span data-a="branch" className={styles.branch} aria-hidden="true">
                <span data-a="trickle" className={styles.trickle} />
              </span>
              <span className={styles.media}>
                <span className={styles.mediaLabel}>{copy.media.label}</span>
                <span className={styles.mediaCaption}>{copy.media.caption}</span>
              </span>
            </div>
          ) : (
            next && (
              <div data-a={entering ? undefined : "st-new"} className="flex flex-col gap-2">
                <span className={cn(styles.label, "font-semibold")}>{next.label}</span>
                <span className={styles.caption}>{next.caption}</span>
              </div>
            )
          )}
        </div>
        <span data-a={isAd ? "dot-ad" : "dot"} className={styles.dot} aria-hidden="true">
          {!isAd && <span data-a="dot-new" className={styles.dotNew} />}
        </span>
      </div>
    );
  };

  return (
    <div ref={scope} className="slide grid grid-rows-[auto_1fr_auto] gap-y-[clamp(10px,2vh,28px)]">
      <div className="grid-12 items-start gap-y-6">
        <SectionHeader
          index={index}
          label={copy.label}
          title={copy.headline}
          className="col-span-12 lg:col-span-8"
          titleClassName="!text-[clamp(30px,3.25vw,58px)]"
          tag={
            <span className="grid">
              <span data-a="tag-now" className="[grid-area:1/1]">
                <Tag kind="current">{copy.today}</Tag>
              </span>
              <span data-a="tag-new" className="[grid-area:1/1]">
                <Tag kind="proposed">{copy.proposed}</Tag>
              </span>
            </span>
          }
        />
        <div className="col-span-12 lg:col-span-3 lg:col-start-10">
          <dl className={styles.facts}>
            {copy.facts.map((f) => (
              <div key={f.label} data-a="fact" className={styles.fact}>
                <dt className={styles.factValue}>{f.value}</dt>
                <dd className={styles.factLabel}>{f.label}</dd>
              </div>
            ))}
          </dl>
          <p data-a="source" className="mt-3 text-[11.5px] leading-snug text-fg-3">
            {copy.factsSource}
          </p>
        </div>
      </div>

      <div className="self-center">
        <p className="t-label mb-[clamp(14px,2.6vh,30px)] grid text-fg-3">
          <span data-a="flow-label-old" className="[grid-area:1/1]">
            {copy.flowLabelOld}
          </span>
          <span data-a="flow-label-new" className="text-brand-text [grid-area:1/1]">
            {copy.flowLabelNew}
          </span>
        </p>
        <div ref={flowRef} role="group" className={styles.flow} aria-label={`${copy.flowLabelOld}: ${copy.oldFlow.map((s) => s.label).join(", ")}`}>
          {["community", ...PERSISTENT, "revenue"].map(renderStation)}
          <div data-a="rail" className={styles.rail} aria-hidden="true">
            <div className={styles.runners}>
              {Array.from({ length: RUNNERS }, (_, i) => (
                <span key={i} data-a="track" className={styles.track}>
                  <span className={styles.runner} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-12 items-end gap-y-6">
        <div className="col-span-12 grid lg:col-span-5 xl:col-span-6">
          <div className="[grid-area:1/1]">
            <div data-a="stmt-old">
              <SplitHeadline as="p" lines={copy.oldStatement} className={cn("t-headline", styles.statement)} />
            </div>
            <p data-a="lede-old" className={cn("t-lede mt-3 max-w-[48ch] text-[length:var(--fs-body)]", styles.support)}>
              {copy.oldLede}
            </p>
          </div>
          <div className="[grid-area:1/1]">
            <div data-a="stmt-new">
              <SplitHeadline as="p" lines={copy.newStatement} className={cn("t-headline", styles.statement)} />
            </div>
            <p data-a="lede-new" className={cn("t-lede mt-3 max-w-[48ch] text-[length:var(--fs-body)]", styles.support)}>
              {copy.newLede}
            </p>
          </div>
        </div>
        <div data-a="compare" className="col-span-12 lg:col-span-7 lg:col-start-6 xl:col-span-5 xl:col-start-8">
          <p className="t-label mb-2 text-fg-3">
            {copy.compare.title}
          </p>
          <DataTable
            dense
            className={styles.compare}
            caption={copy.compare.title}
            highlightKey="b"
            columns={[
              { key: "k", label: "" },
              { key: "a", label: copy.compare.colCurrent },
              { key: "b", label: copy.compare.colProposed },
            ]}
            rows={copy.compare.rows.map((r) => ({ ...r }))}
          />
        </div>
      </div>
    </div>
  );
}
