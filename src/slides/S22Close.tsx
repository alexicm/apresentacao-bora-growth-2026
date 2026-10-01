"use client";

import { useMemo } from "react";
import { BoraLockup } from "@/components/brand/BoraLockup";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { DotField, gatherDots, type Cluster } from "@/components/diagrams/DotField";
import { revealHighlights } from "@/components/ui/SectionHeader";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { copy } from "@/content/slides/22-close";
import { draw, fade, hold, motionPrefs, rise, unmask } from "@/lib/motion";

// Comunidades espalhadas pelo país (abstrato) — agora conectadas: a rede (viewBox 1440×900).
const CLUSTERS: Cluster[] = [
  { x: 930, y: 170, r: 30 },
  { x: 1120, y: 120, r: 24 },
  { x: 1300, y: 210, r: 34 },
  { x: 1040, y: 330, r: 40 },
  { x: 1240, y: 400, r: 30 },
  { x: 880, y: 470, r: 28 },
  { x: 1120, y: 560, r: 44 },
  { x: 1330, y: 600, r: 26 },
  { x: 980, y: 680, r: 30 },
  { x: 1220, y: 760, r: 24 },
];
// Ligações entre comunidades (índices em CLUSTERS).
const LINKS: Array<[number, number]> = [
  [0, 1], [1, 2], [0, 3], [1, 3], [2, 4], [3, 4], [3, 5], [3, 6], [4, 6], [4, 7], [5, 6], [6, 7], [5, 8], [6, 8], [6, 9], [7, 9], [8, 9],
];

export function CloseSlide() {
  const links = useMemo(() => LINKS.map(([a, b]) => ({ a: CLUSTERS[a], b: CLUSTERS[b] })), []);

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    // 0 — a oportunidade é maior; os corredores viram comunidades, e as comunidades viram rede.
    step(0, (tl) => {
      fade(tl, q('[data-a="field"]'), 0, { duration: 1 });
      if (!reduced) gatherDots(tl, q(".dot"), 0.2, 1.8);
      tl.to(q(".dot-hub"), { opacity: 1, duration: 0.5, stagger: 0.05 }, 1.2);
      draw(tl, q('[data-a="link"]'), 1.5, { stagger: 0.05, duration: 0.9 });
      rise(tl, q('[data-a="small"]'), 0.3);
      unmask(tl, q('[data-a="headline"] .split-unit'), 0.7, { stagger: 0.06, duration: 1.3 });
      revealHighlights(tl, q('[data-a="headline"] .hl'), 1.8);
    });
    // 1 — BORA. Brasília é o laboratório. O Brasil é o projeto.
    step(1, (tl) => {
      tl.fromTo(q('[data-a="rule"]'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power3.inOut" }, 0);
      tl.from(q('[data-a="lockup"]'), { autoAlpha: 0, y: reduced ? 0 : 18, duration: 1.1, ease: "bora" }, 0.3);
      unmask(tl, q('[data-a="closing"] .split-unit'), 0.6, { stagger: 0.05 });
      tl.fromTo(q('[data-a="contours"]'), { autoAlpha: 0, scale: reduced ? 1 : 0.9 }, { autoAlpha: 1, scale: 1, duration: 2, ease: "power2.out" }, 0.2);
      hold(tl, 0.4);
    });
  });

  return (
    <div ref={scope} className="slide close grid grid-rows-[1fr_auto]">
      {/* O invólucro fixa a intensidade (CSS); o GSAP anima só o elemento interno. */}
      <div className="close-contours" aria-hidden="true">
        <div data-a="contours" className="contours h-full w-full" />
      </div>
      <div data-a="field" className="absolute inset-0" aria-hidden="true">
        <DotField className="dot-field" clusters={CLUSTERS} count={170} seed={23} loose={motionPrefs.reduced ? 0 : 0.05} />
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          {links.map((l, i) => (
            <line key={i} data-a="link" x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} className="close-link" />
          ))}
        </svg>
      </div>

      <div className="relative self-center">
        <p data-a="small" className="t-lede max-w-[40ch] text-fg-2">
          {copy.small}
        </p>
        <div data-a="headline" className="mt-[clamp(10px,2vh,24px)]">
          <SplitHeadline as="h2" lines={copy.headline} className="t-display text-[length:var(--fs-display-xl)]" />
        </div>
      </div>

      <footer className="relative">
        <div data-a="rule" className="h-px origin-left bg-line-strong" />
        <div className="mt-[clamp(16px,3vh,32px)] flex flex-wrap items-end justify-between gap-8">
          <div data-a="lockup">
            <BoraLockup className="lockup w-[clamp(180px,17vw,300px)] text-fg" />
          </div>
          <div data-a="closing" className="text-right">
            <SplitHeadline as="p" lines={copy.closing} className="t-headline text-[clamp(26px,2.6vw,46px)]" />
          </div>
        </div>
      </footer>
    </div>
  );
}
