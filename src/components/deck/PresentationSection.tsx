"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { SLIDES } from "@/content/deck";
import { gsap, useGSAP } from "@/lib/gsap";
import { pad2 } from "@/lib/utils";
import { deck } from "./deck-store";
import { SlideContext, useSlideState } from "./hooks";
import { SlideErrorBoundary } from "./SlideErrorBoundary";

/**
 * Casca de cada slide: seção alta o bastante para os passos internos + palco sticky de 100svh.
 * O conteúdo monta sob demanda, quando a seção se aproxima da viewport.
 */
export function PresentationSection({ index, children }: { index: number; children: ReactNode }) {
  const meta = SLIDES[index];
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { mounted } = useSlideState(index);

  useEffect(() => {
    deck.register(index, sectionRef.current);
    return () => deck.register(index, null);
  }, [index]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || mounted) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) deck.ensureMounted(index);
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, mounted]);

  // Profundidade na troca: o slide que sai recua e esmaece enquanto o próximo o cobre.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          innerRef.current,
          { yPercent: 0, opacity: 1 },
          {
            yPercent: 34,
            opacity: 0.1,
            ease: "none",
            scrollTrigger: { trigger: sectionRef.current, start: "bottom bottom", end: "bottom top", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  const ctx = useMemo(
    () => ({ index, id: meta.id, steps: meta.steps, sectionRef, stageRef }),
    [index, meta.id, meta.steps],
  );

  return (
    <section
      ref={sectionRef}
      id={meta.id}
      data-slide={index}
      data-theme={meta.theme}
      className="deck-section"
      style={{ "--steps": meta.steps } as CSSProperties}
      aria-roledescription="slide"
      aria-label={`${pad2(index + 1)} · ${meta.title}`}
    >
      <div ref={stageRef} className="deck-stage">
        <div ref={innerRef} className="deck-inner">
          <SlideContext.Provider value={ctx}>
            <SlideErrorBoundary title={meta.title}>{mounted ? children : null}</SlideErrorBoundary>
          </SlideContext.Provider>
        </div>
      </div>
    </section>
  );
}
