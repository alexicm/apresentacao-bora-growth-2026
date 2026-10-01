"use client";

import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { copy } from "@/content/slides/21-role";
import { draw, fade, hold, rise } from "@/lib/motion";

/**
 * Dois lados com o mesmo peso visual (parceria, não hierarquia) e uma ponte no meio:
 * a diretoria decide onde e com quem; a frente de Estratégia de Expansão & Growth constrói o como.
 */
export function RoleSlide() {
  const { index } = useSlide();

  const { scope } = useStepTimeline(({ step, q }) => {
    step(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="side-head"]'), 0.4, { stagger: 0.15 });
    });
    step(1, (tl) => {
      rise(tl, q('[data-a="left-item"]'), 0, { stagger: 0.07, y: 12 });
    });
    step(2, (tl) => {
      rise(tl, q('[data-a="right-item"]'), 0, { stagger: 0.07, y: 12 });
    });
    step(3, (tl) => {
      tl.from(q('[data-a="bridge"]'), { autoAlpha: 0, scale: 0.94, duration: 0.9, ease: "bora" }, 0);
      rise(tl, q('[data-a="area"]'), 0.35, { stagger: 0.06, y: 8 });
      fade(tl, q('[data-a="flow"]'), 0.4, { stagger: 0.3 });
      draw(tl, q('[data-a="flow-line"]'), 0.5, { stagger: 0.3, duration: 0.9 });
      fade(tl, q('[data-a="flow-head"]'), 1.2, { stagger: 0.3, duration: 0.3 });
      hold(tl, 0.2);
    });
  });

  return (
    <div ref={scope} className="slide grid grid-rows-[auto_1fr] gap-y-[clamp(20px,4vh,48px)]">
      <SectionHeader
        index={index}
        label={copy.label}
        title={copy.headline}
        lede={copy.lede}
        className="max-w-[1000px]"
        titleClassName="!text-[clamp(34px,3.6vw,62px)]"
      />

      <div className="relative grid-12 items-start gap-y-10 self-center pb-[4vh]">
        {/* Esquerda — Diretoria de Expansão */}
        <section className="col-span-12 md:col-span-4" aria-labelledby="role-left">
          <div data-a="side-head" className="role-head">
            <p className="t-label text-fg-3">{copy.left.focus}</p>
            <h3 id="role-left" className="t-title mt-3 text-[length:var(--fs-display-s)]">
              {copy.left.title}
            </h3>
          </div>
          <ul className="role-list">
            {copy.left.items.map((it) => (
              <li key={it} data-a="left-item">
                {it}
              </li>
            ))}
          </ul>
        </section>

        {/* Centro — a ponte, com a relação de mão dupla: direção desce da diretoria, evidência volta */}
        <div className="col-span-12 flex flex-col items-stretch gap-4 md:col-span-4">
          <div data-a="flow" className="role-flow">
            <svg viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
              <path data-a="flow-line" d="M2 6 L292 6" />
              <path data-a="flow-head" d="M284 1 L294 6 L284 11" />
            </svg>
            <span className="t-label">{copy.flows.down}</span>
          </div>
          <div data-a="bridge" className="role-bridge">
            <p className="t-label text-brand-text">Frente proposta</p>
            <p className="mt-3 text-center text-[clamp(20px,1.8vw,30px)] font-bold leading-tight tracking-[-0.02em]">
              {copy.center}
            </p>
            <ul className="mt-5 flex flex-wrap justify-center gap-1.5">
              {copy.areas.map((a) => (
                <li key={a} data-a="area" className="role-area">
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div data-a="flow" className="role-flow role-flow--back">
            <svg viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
              <path data-a="flow-line" d="M298 6 L8 6" />
              <path data-a="flow-head" d="M16 1 L6 6 L16 11" />
            </svg>
            <span className="t-label">{copy.flows.up}</span>
          </div>
        </div>

        {/* Direita — Alex */}
        <section className="col-span-12 md:col-span-4 md:text-right" aria-labelledby="role-right">
          <div data-a="side-head" className="role-head md:items-end">
            <p className="t-label text-brand-text">{copy.right.focus}</p>
            <h3 id="role-right" className="t-title mt-3 text-[length:var(--fs-display-s)]">
              {copy.right.title}
            </h3>
          </div>
          <ul className="role-list md:[&>li]:justify-end">
            {copy.right.items.map((it) => (
              <li key={it} data-a="right-item">
                {it}
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}
