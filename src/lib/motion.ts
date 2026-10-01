// Sistema de motion: durações, curvas e presets reutilizáveis.
// Princípios: Reveal · Transformation · Connection · Focus · Cause and effect.
// Todo preset respeita prefers-reduced-motion (vira só opacidade, mais curto).
import { gsap } from "./gsap";

export const DUR = { xs: 0.3, s: 0.5, m: 0.8, l: 1.2, xl: 1.8 } as const;

export const EASE = {
  out: "bora", // expo-out da marca — entradas
  soft: "power2.out",
  inOut: "power3.inOut", // transformações e deslocamentos
  expo: "expo.out",
  in: "power2.in",
  linear: "none",
} as const;

/** Preferência de movimento reduzido, atualizada ao vivo. */
export const motionPrefs = { reduced: false };

if (typeof window !== "undefined") {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionPrefs.reduced = mq.matches;
  mq.addEventListener("change", (e) => {
    motionPrefs.reduced = e.matches;
  });
}

type TL = gsap.core.Timeline;
type Targets = gsap.TweenTarget;
type Pos = gsap.Position | undefined;
type Opts = { y?: number; x?: number; stagger?: number | gsap.StaggerVars; duration?: number; ease?: string };

const r = () => motionPrefs.reduced;

/** Reveal: surge com leve subida. */
export function rise(tl: TL, targets: Targets, pos?: Pos, o: Opts = {}) {
  return tl.from(
    targets,
    {
      autoAlpha: 0,
      y: r() ? 0 : (o.y ?? 28),
      x: r() ? 0 : (o.x ?? 0),
      duration: r() ? DUR.s : (o.duration ?? DUR.m),
      stagger: o.stagger ?? 0,
      ease: o.ease ?? EASE.out,
    },
    pos,
  );
}

/** Reveal sem deslocamento. */
export function fade(tl: TL, targets: Targets, pos?: Pos, o: Opts = {}) {
  return tl.from(
    targets,
    { autoAlpha: 0, duration: r() ? DUR.s : (o.duration ?? DUR.m), stagger: o.stagger ?? 0, ease: o.ease ?? EASE.soft },
    pos,
  );
}

/** Reveal por máscara: os alvos precisam estar dentro de `.split-line` (overflow oculto). */
export function unmask(tl: TL, targets: Targets, pos?: Pos, o: Opts = {}) {
  return tl.from(
    targets,
    {
      yPercent: r() ? 0 : 112,
      autoAlpha: r() ? 0 : 1,
      duration: r() ? DUR.s : (o.duration ?? DUR.l),
      stagger: o.stagger ?? 0.03,
      ease: o.ease ?? EASE.expo,
    },
    pos,
  );
}

/** Connection: desenha linhas SVG do início ao fim. */
export function draw(tl: TL, targets: Targets, pos?: Pos, o: Opts = {}) {
  if (r()) return tl.from(targets, { autoAlpha: 0, duration: DUR.s, stagger: o.stagger ?? 0 }, pos);
  return tl.from(
    targets,
    { drawSVG: "0%", duration: o.duration ?? DUR.l, stagger: o.stagger ?? 0, ease: o.ease ?? EASE.inOut },
    pos,
  );
}

/** Nós que nascem do centro (escala + opacidade). */
export function pop(tl: TL, targets: Targets, pos?: Pos, o: Opts = {}) {
  return tl.from(
    targets,
    {
      autoAlpha: 0,
      scale: r() ? 1 : 0.2,
      transformOrigin: "50% 50%",
      duration: r() ? DUR.s : (o.duration ?? DUR.m),
      stagger: o.stagger ?? 0,
      ease: o.ease ?? EASE.out,
    },
    pos,
  );
}

/** Focus: esmaece o que não é o assunto. */
export function dim(tl: TL, targets: Targets, pos?: Pos, amount = 0.28, o: Opts = {}) {
  return tl.to(targets, { opacity: amount, duration: o.duration ?? DUR.m, ease: EASE.soft }, pos);
}

/** Intervalo (respiro) dentro de uma timeline. */
export function hold(tl: TL, seconds: number, pos?: Pos) {
  return tl.to({}, { duration: r() ? Math.min(seconds, 0.2) : seconds }, pos);
}
