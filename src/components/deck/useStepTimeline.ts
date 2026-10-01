"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { motionPrefs } from "@/lib/motion";
import { deck } from "./deck-store";
import { useSlide } from "./hooks";

export type StepApi = {
  /** Timeline mestre (use `step()` em vez de escrever nela diretamente). */
  tl: gsap.core.Timeline;
  /**
   * Constrói as animações do passo `n` numa sub-timeline própria (posições relativas ao início do passo)
   * e marca o rótulo `s{n}` ao final dela.
   */
  step: (n: number, build: (tl: gsap.core.Timeline) => void) => void;
  /** Seletor com escopo no palco do slide. */
  q: (selector: string) => Element[];
  reduced: boolean;
};

const labelTime = (tl: gsap.core.Timeline, step: number) => tl.labels[`s${step}`] ?? tl.duration();

/**
 * Timeline por passos, sincronizada com a apresentação.
 * - Entrar no slide toca o passo 0; → toca o próximo trecho no tempo desenhado.
 * - Voltar rebobina rápido; pular vários passos alcança em no máximo ~1s.
 * - Sair por baixo (voltar ao slide anterior) reinicia o slide, pronto para entrar de novo.
 *
 * Retorna `scope`: anexe à raiz do slide (`<div ref={scope} className="slide">`).
 * (O ref do palco pertence a um ancestral e ainda não existe durante os layout effects do slide.)
 */
export function useStepTimeline(build: (api: StepApi) => void, deps: unknown[] = []) {
  const slide = useSlide();
  const scopeRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const playRef = useRef<gsap.core.Tween | null>(null);
  const lastStep = useRef(-1);
  const built = useRef(false);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;
      const rebuild = built.current;
      built.current = true;
      const tl = gsap.timeline({ paused: true });
      const api: StepApi = {
        tl,
        q: gsap.utils.selector(scope),
        reduced: motionPrefs.reduced,
        // Cada passo é uma sub-timeline: posições (0, 0.3, "<"…) são relativas ao início do passo.
        step: (n, fn) => {
          const segment = gsap.timeline();
          fn(segment);
          tl.add(segment);
          tl.addLabel(`s${n}`);
        },
      };
      build(api);

      if (process.env.NODE_ENV !== "production") {
        const labels = Object.keys(tl.labels).filter((l) => /^s\d+$/.test(l)).length;
        if (labels !== slide.steps) {
          console.warn(`[deck] "${slide.id}": a timeline tem ${labels} passos, deck.ts declara ${slide.steps}.`);
        }
      }

      tlRef.current = tl;

      // Reconstrução por `deps` (ex.: troca de modo, dados): o efeito de sincronia não roda de novo,
      // então a timeline nova vai direto ao passo atual.
      if (rebuild && slide.entered) {
        tl.seek(labelTime(tl, slide.step), false);
        lastStep.current = slide.step;
      }

      return () => {
        playRef.current?.kill();
        tlRef.current = null;
        // A timeline nova recomeça do zero; o efeito abaixo a leva ao passo atual.
        lastStep.current = -1;
      };
    },
    { scope: scopeRef, dependencies: deps, revertOnUpdate: true },
  );

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    playRef.current?.kill();

    if (!slide.entered) {
      tl.pause(0);
      lastStep.current = -1;
      return;
    }

    const target = labelTime(tl, slide.step);
    const dist = target - tl.time();
    const prev = lastStep.current;
    lastStep.current = slide.step;
    if (Math.abs(dist) < 1e-3) return;

    let duration: number;
    if (dist < 0) duration = Math.min(-dist * 0.5, 0.9);
    // Celular (rolagem livre): o slide inteiro toca de uma vez, em no máximo ~3 s.
    else if (deck.getSnapshot().mode === "flow") duration = Math.min(dist, 3.2);
    else if (slide.step - prev <= 1) duration = dist;
    else duration = Math.min(dist, Math.max(1, dist * 0.35));

    playRef.current = tl.tweenTo(target, { duration, ease: "none" });
  }, [slide.entered, slide.step]);

  return { scope: scopeRef, timeline: tlRef };
}
