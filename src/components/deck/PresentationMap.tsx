"use client";

import { useEffect, useRef } from "react";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { CHAPTERS, SLIDES, type ChapterId } from "@/content/deck";
import { gsap } from "@/lib/gsap";
import { motionPrefs } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import { deck } from "./deck-store";
import { useDeck } from "./hooks";
import { ProjectFolders } from "./ProjectFolders";

const SHORTCUTS: Array<[string, string]> = [
  ["→  Space", "avançar"],
  ["←", "voltar"],
  ["M", "mapa"],
  ["P", "pastas de projetos"],
  ["F", "tela cheia"],
  ["ESC", "fechar"],
];

/**
 * Mapa da apresentação. Duas abas:
 * M · índice editorial por capítulo, com salto direto para qualquer slide;
 * P · pastas de projetos: cada ação do pack com ficha, estágio e atalho para o slide.
 */
export function PresentationMap() {
  const { overlay, current, mapTab } = useDeck();
  const open = overlay === "map";
  const rootRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<Element | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!open) {
      gsap.to(root, { autoAlpha: 0, duration: 0.25, ease: "power2.in" });
      document.documentElement.classList.remove("is-locked");
      return;
    }
    returnFocus.current = document.activeElement;
    document.documentElement.classList.add("is-locked");
    const pop = deck.pushEscape(() => deck.setOverlay(null));
    const items = root.querySelectorAll("[data-map-item]");
    gsap.set(root, { autoAlpha: 1 });
    if (!motionPrefs.reduced) {
      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(items, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.012, ease: "bora" });
    }
    const first = deck.getSnapshot().mapTab === "projects" ? root.querySelector<HTMLButtonElement>("#map-tab-projects") : root.querySelector<HTMLButtonElement>(`[data-map-item="${current}"]`);
    first?.focus({ preventScroll: true });
    return () => {
      pop();
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus({ preventScroll: true });
    };
    // `current` só importa no momento de abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Troca de aba com o mapa aberto: revela o novo conteúdo.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !open || motionPrefs.reduced) return;
    const items = root.querySelectorAll(mapTab === "projects" ? "[data-pf-item]" : "[data-map-item]");
    gsap.fromTo(items, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.015, ease: "bora" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTab]);

  const chapters = Object.keys(CHAPTERS) as ChapterId[];

  return (
    <div
      ref={rootRef}
      className="map-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Mapa da apresentação"
      aria-hidden={!open}
      style={{ visibility: "hidden", opacity: 0 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="t-label text-fg-3">BORA Growth · Pack de Ações e Projetos</p>
          <h2 className="t-headline mt-3 text-[length:var(--fs-display-s)]">
            {mapTab === "projects" ? (
              <>
                Pastas do <strong>pack</strong>
              </>
            ) : (
              <>
                Mapa da <strong>apresentação</strong>
              </>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="map-tabs" role="tablist" aria-label="Conteúdo do mapa">
            <button
              type="button"
              role="tab"
              id="map-tab-slides"
              aria-selected={mapTab === "slides"}
              aria-controls="map-panel-slides"
              className="map-tab"
              onClick={() => deck.setMapTab("slides")}
            >
              Slides <kbd>M</kbd>
            </button>
            <button
              type="button"
              role="tab"
              id="map-tab-projects"
              aria-selected={mapTab === "projects"}
              aria-controls="map-panel-projects"
              className="map-tab"
              onClick={() => deck.setMapTab("projects")}
            >
              Projetos <kbd>P</kbd>
            </button>
          </div>
          <button type="button" className="chrome-btn pointer-events-auto" onClick={() => deck.setOverlay(null)}>
            Fechar <kbd>ESC</kbd>
          </button>
        </div>
      </div>

      {mapTab === "projects" ? <ProjectFolders /> : null}

      <nav
        aria-label="Slides"
        id="map-panel-slides"
        role="tabpanel"
        aria-labelledby="map-tab-slides"
        className="map-columns mt-7"
        hidden={mapTab !== "slides"}
      >
        {chapters.map((ch) => (
          <div key={ch} className="map-chapter">
            <p className="t-label mb-3 flex gap-3 border-b border-line pb-3 text-fg-3" data-map-item-static>
              <span className="t-mono text-fg-4">{CHAPTERS[ch].roman}</span>
              {CHAPTERS[ch].title}
            </p>
            <ul>
              {SLIDES.map((s, i) =>
                s.chapter !== ch ? null : (
                  <li key={s.id}>
                    <button
                      type="button"
                      data-map-item={i}
                      className={cn("map-item group", i === current && "is-current")}
                      onClick={() => {
                        deck.setOverlay(null);
                        deck.goTo(i, 0, "cut");
                      }}
                    >
                      <span className="t-mono map-num">{pad2(i + 1)}</span>
                      <span className="min-w-0">
                        <span className="map-title">{s.title}</span>
                        <span className="map-summary">{s.summary}</span>
                      </span>
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-5">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {SHORTCUTS.map(([k, v]) => (
            <li key={k} className="t-label flex items-center gap-2 text-fg-3">
              <kbd className="kbd">{k}</kbd>
              {v}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <StageTag stage="rodando" />
          <StageTag stage="backlog" />
          <StageTag stage="ideia" />
          <Tag kind="current" />
          <Tag kind="illustrative">Exemplo · Hipótese · Simulação</Tag>
        </div>
      </div>
    </div>
  );
}
