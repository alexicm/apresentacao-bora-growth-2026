"use client";

import { useEffect, useRef } from "react";
import { SLIDES } from "@/content/deck";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { motionPrefs } from "@/lib/motion";
import { SLIDE_COMPONENTS } from "@/slides";
import { Chrome } from "./Chrome";
import { deck } from "./deck-store";
import { KeyboardNavigation } from "./KeyboardNavigation";
import { PresentationMap } from "./PresentationMap";
import { PresentationSection } from "./PresentationSection";
import { ProgressIndicator } from "./ProgressIndicator";

export function Deck() {
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    deck.measure();

    // Deep link: /#powered abre direto no slide.
    const id = decodeURIComponent(window.location.hash.slice(1));
    const start = SLIDES.findIndex((s) => s.id === id);
    if (start > 0) deck.goTo(start, 0, "instant");
    else {
      window.scrollTo(0, 0);
      deck.update(0);
    }

    // Um único ScrollTrigger global deriva o estado; o encaixe nos passos é do próprio motor
    // (no fim do scroll natural), para que a navegação por teclado/mapa sempre tenha prioridade.
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: () => deck.update() });
    const onScrollEnd = () => deck.snapNow();
    ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);

    const before = () => deck.beforeRefresh();
    const after = () => deck.afterRefresh();
    ScrollTrigger.addEventListener("refreshInit", before);
    ScrollTrigger.addEventListener("refresh", after);

    const onFullscreen = () => deck.setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);

    // "Corte" para saltos longos (mapa): cortina rápida em vez de rolar por 10 slides.
    deck.setCutHandler((jump) => {
      const curtain = curtainRef.current;
      if (!curtain || motionPrefs.reduced) return jump();
      gsap
        .timeline()
        .to(curtain, { autoAlpha: 1, duration: 0.28, ease: "power2.in" })
        .add(jump)
        .to(curtain, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, "+=0.12");
    });

    // API de ensaio/QA: window.__deck.goTo(5, 2)
    Object.assign(window, {
      __deck: {
        goTo: (i: number, s = 0) => deck.goTo(i, s, "instant"),
        next: () => deck.next(),
        prev: () => deck.prev(),
        state: () => ({ ...deck.getSnapshot(), slide: deck.getSlide(deck.getSnapshot().current) }),
      },
    });

    return () => {
      st.kill();
      ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
      ScrollTrigger.removeEventListener("refreshInit", before);
      ScrollTrigger.removeEventListener("refresh", after);
      document.removeEventListener("fullscreenchange", onFullscreen);
      deck.setCutHandler(null);
    };
  }, []);

  return (
    <>
      <Chrome />
      <main id="deck" aria-label="BORA Growth · Pack de Ações e Projetos">
        {SLIDES.map((s, i) => {
          const Slide = SLIDE_COMPONENTS[s.id];
          return (
            <PresentationSection key={s.id} index={i}>
              <Slide />
            </PresentationSection>
          );
        })}
      </main>
      <ProgressIndicator />
      <PresentationMap />
      <KeyboardNavigation />
      <div ref={curtainRef} className="curtain" aria-hidden="true" />
    </>
  );
}
