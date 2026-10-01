"use client";

import { useRef } from "react";
import { SLIDES } from "@/content/deck";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, pad2 } from "@/lib/utils";
import { deck } from "./deck-store";
import { useDeck } from "./hooks";

/** "06 / 21" + marcadores dos passos do slide atual + linha de progresso global. */
export function ProgressIndicator() {
  const { current, step, steps, fullscreen, mode } = useDeck();
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } },
    );
  });

  const meta = SLIDES[current];

  return (
    <>
      <div data-theme={meta.theme} className="chrome chrome--bottom">
        {current > 0 && (
          <p key={meta.id} className="chrome-fade t-label hidden text-fg-3 md:block">
            {meta.title}
          </p>
        )}

        <div className="pointer-events-auto ml-auto flex items-center gap-5">
          {mode === "deck" && steps > 1 && (
            <ol className="flex items-center gap-[5px]" aria-label={`Passo ${step + 1} de ${steps}`}>
              {Array.from({ length: steps }, (_, i) => (
                <li
                  key={i}
                  className={cn("h-[2px] w-3 transition-colors duration-300", i <= step ? "bg-brand-text" : "bg-line-strong")}
                />
              ))}
            </ol>
          )}
          <p className="t-label t-mono text-fg-2" aria-live="polite" aria-atomic="true">
            <span className="sr-only">Slide </span>
            <span className="text-fg">{pad2(current + 1)}</span>
            <span className="text-fg-4"> / </span>
            {pad2(SLIDES.length)}
            <span className="sr-only">: {meta.title}</span>
          </p>
          <div className="hidden items-center gap-1 md:flex">
            <button type="button" className="chrome-btn" onClick={() => deck.toggleMap("slides")} aria-label="Abrir mapa (M)">
              Mapa <kbd>M</kbd>
            </button>
            <button type="button" className="chrome-btn" onClick={() => deck.toggleMap("projects")} aria-label="Abrir pastas de projetos (P)">
              Projetos <kbd>P</kbd>
            </button>
            <button
              type="button"
              className="chrome-btn"
              onClick={() => deck.toggleFullscreen()}
              aria-label={fullscreen ? "Sair da tela cheia (F)" : "Tela cheia (F)"}
            >
              {fullscreen ? "Sair" : "Tela cheia"} <kbd>F</kbd>
            </button>
          </div>
        </div>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div ref={lineRef} className="progress-bar" />
      </div>
    </>
  );
}
