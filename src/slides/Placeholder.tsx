"use client";

import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SLIDES } from "@/content/deck";
import { rise } from "@/lib/motion";
import { pad2 } from "@/lib/utils";

/** Slide provisório — usado enquanto a tela definitiva não existe. */
export function Placeholder() {
  const { index } = useSlide();
  const meta = SLIDES[index];

  const { scope } = useStepTimeline(({ step, q }) => {
    step(0, (tl) => {
      rise(tl, q(".ph-head"), 0, { stagger: 0.08 });
      rise(tl, q(".ph-step-0"), 0.2);
    });
    for (let s = 1; s < meta.steps; s++) step(s, (tl) => rise(tl, q(`.ph-step-${s}`), 0));
  });

  return (
    <div ref={scope} className="slide flex flex-col justify-center gap-10">
      <div>
        <p className="ph-head t-label text-fg-3">
          {pad2(index + 1)} · Em produção
        </p>
        <h2 className="ph-head t-headline mt-4 text-[length:var(--fs-display-m)]">
          <strong>{meta.title}</strong>
        </h2>
        <p className="ph-head t-lede mt-4 max-w-[40ch]">{meta.summary}</p>
      </div>
      <ol className="flex flex-wrap gap-2">
        {Array.from({ length: meta.steps }, (_, s) => (
          <li key={s} className={`ph-step-${s} t-label border border-line-strong px-3 py-2 text-fg-2`}>
            Passo {s + 1}
          </li>
        ))}
      </ol>
    </div>
  );
}
