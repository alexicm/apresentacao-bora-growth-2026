"use client";

import { useEffect, useId, useState } from "react";
import { BoraLockup } from "@/components/brand/BoraLockup";
import { BoraWordmark } from "@/components/brand/BoraMark";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { InteractiveTooltip, useTooltip } from "@/components/ui/InteractiveTooltip";
import { revealHeader, SectionHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { PROJECTS, type ProjectId } from "@/content/projects";
import { copy } from "@/content/slides/03-thesis";
import { gsap } from "@/lib/gsap";
import { draw, fade, motionPrefs, pop, rise } from "@/lib/motion";
import { cn, r2, seeded } from "@/lib/utils";
import styles from "./S03Thesis.module.css";

// ── Geometria do campo (viewBox 1000×1000; lugares em frações do lado do quadrado) ─────────────
const VB = 1000;
const C = VB / 2;
/** Raio do anel da rede (fração do campo). */
const RING = 0.28;
const CORE_R = 68;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

type Align = "alignTop" | "alignRight" | "alignBottom" | "alignLeft";
const alignFor = (slot: number): Align => (slot === 0 ? "alignTop" : slot === 6 ? "alignBottom" : slot < 6 ? "alignRight" : "alignLeft");

/** Antes da convergência: lugares espalhados (x < 0 = abaixo do cabeçalho, na coluna da esquerda). */
const SCATTER: Record<string, { u: number; v: number }> = {
  independent: { u: 0.4, v: 0.5 },
  condos: { u: -0.56, v: 0.9 },
  clubs: { u: 0.6, v: 0.15 },
  gyms: { u: 0.3, v: 0.86 },
  communities: { u: 0.44, v: 0.05 },
  races: { u: 0.72, v: 0.73 },
  athletes: { u: 0.84, v: 0.44 },
  universities: { u: -0.12, v: 0.63 },
  companies: { u: 0.15, v: 0.3 },
  stores: { u: 0.08, v: 0.72 },
  creators: { u: 0.92, v: 0.12 },
  leaders: { u: -0.36, v: 0.77 },
};

const PLACES = copy.places.map((p, i) => {
  const a = ((-90 + p.slot * 30) * Math.PI) / 180;
  const rnd = seeded(101 + i * 7);
  const count = 7 + ((i * 3) % 5);
  const dots = Array.from({ length: count }, () => {
    const ang = rnd() * Math.PI * 2;
    const d = 6.5 + Math.sqrt(rnd()) * 9.5;
    return { x: r2(20 + d * Math.cos(ang)), y: r2(20 + d * Math.sin(ang)), r: r2(1.6 + rnd() * 0.8) };
  });
  return {
    ...p,
    project: PROJECTS[p.channel as ProjectId],
    scatter: SCATTER[p.id] ?? { u: 0.5, v: 0.5 },
    ring: { u: 0.5 + RING * Math.cos(a), v: 0.5 + RING * Math.sin(a) },
    align: alignFor(p.slot),
    dots,
  };
});
type Place = (typeof PLACES)[number];
const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p])) as Record<string, Place>;

/** Corredores soltos (ambiente): espalhados → sugados pelo núcleo → circulam no anel. */
const AMBIENT = (() => {
  const rnd = seeded(31);
  const out: { x: number; y: number; ox: number; oy: number; r: number }[] = [];
  while (out.length < 96) {
    const u = -0.72 + rnd() * 1.72;
    const v = rnd();
    const a = rnd() * Math.PI * 2;
    const rr = RING * VB + (rnd() - 0.5) * 60;
    const big = rnd() < 0.08;
    if (u < -0.02 && v < 0.56) continue; // zona do cabeçalho
    out.push({ x: r2(u * VB), y: r2(v * VB), ox: r2(C + rr * Math.cos(a)), oy: r2(C + rr * Math.sin(a)), r: big ? 3.2 : 2.2 });
  }
  return out;
})();

export function ThesisSlide() {
  const { index, step, current } = useSlide();
  const gradId = useId();
  const [active, setActive] = useState<string | null>(null);

  const { scope } = useStepTimeline(({ step: at, q, reduced }) => {
    const layers = q('[data-a="layer"]');
    const clusters = q('[data-a="p-cluster"]');
    const labels = q('[data-a="p-label"]');
    const lines = q('[data-a="line"]');
    const spokes = q('[data-a="spoke"]');
    const ambient = q('[data-a="ambient"]');
    PLACES.forEach((p, i) => gsap.set(layers[i], { xPercent: p.scatter.u * 100, yPercent: p.scatter.v * 100 }));

    // Passo 0 — os lugares onde os corredores já estão, espalhados.
    at(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="lede"]'), 0.45, { y: 14 });
      fade(tl, ambient, 0.3, { stagger: { each: 0.006, from: "random" }, duration: 1 });
      tl.from(layers, { autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: "power2.out" }, 0.5);
      if (!reduced) tl.from(clusters, { scale: 0.2, transformOrigin: "50% 50%", duration: 1, stagger: 0.07, ease: "bora" }, 0.5);
    });

    // Passo 1 — tudo converge no núcleo BORA (linhas se desenham, os lugares percorrem as linhas).
    at(1, (tl) => {
      if (reduced) {
        fade(tl, lines, 0);
        tl.to(layers, { autoAlpha: 0, duration: 0.3 }, 0.35);
        tl.set(layers, { xPercent: 50, yPercent: 50 }, 0.7);
        tl.to(lines, { autoAlpha: 0, duration: 0.3 }, 0.6);
        tl.to(ambient, { autoAlpha: 0, duration: 0.3 }, 0.3);
      } else {
        draw(tl, lines, 0, { duration: 0.7, stagger: 0.035, ease: "power2.inOut" });
        tl.to(layers, { xPercent: 50, yPercent: 50, duration: 1.05, ease: "power3.inOut", stagger: 0.035 }, 0.4);
        tl.to(lines, { drawSVG: "100% 100%", duration: 1.05, ease: "power3.inOut", stagger: 0.035 }, 0.4);
        tl.to(clusters, { scale: 0.35, duration: 1.05, ease: "power3.inOut", stagger: 0.035 }, 0.4);
        tl.to(labels, { autoAlpha: 0, duration: 0.35, stagger: 0.035, ease: "power1.in" }, 0.4);
        tl.to(layers, { autoAlpha: 0, duration: 0.25, stagger: 0.035 }, 1.2);
        tl.to(
          ambient,
          {
            x: (i: number) => C - AMBIENT[i].x,
            y: (i: number) => C - AMBIENT[i].y,
            autoAlpha: 0,
            duration: 1.15,
            ease: "power3.in",
            stagger: { each: 0.003, from: "random" },
          },
          0.25,
        );
      }
      pop(tl, q('[data-a="core"]'), reduced ? 0.6 : 1.05, { duration: 0.8 });
      fade(tl, q('[data-a="glow"]'), reduced ? 0.6 : 1.05, { duration: 0.9 });
      pop(tl, q('[data-a="core-mark"]'), reduced ? 0.7 : 1.25, { duration: 0.7 });
      rise(tl, q('[data-a="example"]'), reduced ? 0.5 : 1.0, { y: 16 });
      rise(tl, q('[data-a="ex-in"]'), reduced ? 0.6 : 1.15, { stagger: 0.1, y: 10 });
    });

    // Passo 2 — o núcleo se expande na rede (BORA GROWTH), cada lugar com seu canal de entrada.
    at(2, (tl) => {
      tl.to(q('[data-a="core"]'), { scale: reduced ? 1 : 4.3, autoAlpha: 0, transformOrigin: "50% 50%", duration: reduced ? 0.4 : 1, ease: "power3.inOut" }, 0);
      tl.to(q('[data-a="glow"]'), { scale: reduced ? 1 : 2.2, autoAlpha: 0, transformOrigin: "50% 50%", duration: reduced ? 0.4 : 1, ease: "power3.inOut" }, 0);
      tl.to(q('[data-a="core-mark"]'), { autoAlpha: 0, scale: reduced ? 1 : 1.3, duration: 0.45, ease: "power2.in" }, 0);
      tl.from(
        q('[data-a="ring"], [data-a="halo"]'),
        { scale: reduced ? 1 : 0.24, autoAlpha: 0, transformOrigin: "50% 50%", duration: reduced ? 0.5 : 1.05, ease: "power3.inOut", stagger: 0.05 },
        0.02,
      );
      fade(tl, q('[data-a="orbit-ring"]'), 0.9, { duration: 0.8 });
      pop(tl, q('[data-a="lockup"]'), 0.65, { duration: 0.9 });

      if (reduced) {
        PLACES.forEach((p, i) => tl.set(layers[i], { xPercent: p.ring.u * 100, yPercent: p.ring.v * 100 }, 0.1));
        tl.to(layers, { autoAlpha: 1, duration: 0.4 }, 0.2);
        fade(tl, spokes, 0.3);
        AMBIENT.forEach((d, i) => tl.set(ambient[i], { x: d.ox - d.x, y: d.oy - d.y }, 0.1));
        tl.to(ambient, { autoAlpha: 1, duration: 0.4 }, 0.2);
      } else {
        tl.to(layers, { autoAlpha: 1, duration: 0.25, stagger: 0.04 }, 0.35);
        tl.to(
          layers,
          {
            xPercent: (i: number) => PLACES[i].ring.u * 100,
            yPercent: (i: number) => PLACES[i].ring.v * 100,
            duration: 1.05,
            ease: "power3.out",
            stagger: 0.04,
          },
          0.35,
        );
        tl.to(clusters, { scale: 1, duration: 1, ease: "bora", stagger: 0.04 }, 0.4);
        draw(tl, spokes, 0.35, { duration: 1.05, stagger: 0.04, ease: "power3.out" });
        tl.to(labels, { autoAlpha: 1, duration: 0.5, stagger: 0.04 }, 0.95);
        tl.to(
          ambient,
          {
            x: (i: number) => AMBIENT[i].ox - AMBIENT[i].x,
            y: (i: number) => AMBIENT[i].oy - AMBIENT[i].y,
            autoAlpha: 1,
            duration: 1.2,
            ease: "power3.out",
            stagger: { each: 0.003, from: "random" },
          },
          0.45,
        );
      }
      tl.from(q('[data-a="p-channel"]'), { autoAlpha: 0, y: reduced ? 0 : 4, duration: 0.5, stagger: 0.04 }, reduced ? 0.4 : 1.15);
      pop(tl, q('[data-a="p-hub"]'), reduced ? 0.4 : 1.0, { stagger: 0.04, duration: 0.5 });

      // Coluna esquerda: a explicação dá lugar à legenda dos canais.
      tl.to(q('[data-a="lede"]'), { autoAlpha: 0, y: reduced ? 0 : -10, duration: 0.4, ease: "power2.in" }, 0);
      tl.from(q('[data-a="legend"]'), { autoAlpha: 0, duration: 0.01 }, 0.4);
      rise(tl, q('[data-a="legend-in"]'), 0.45, { stagger: 0.07, y: 10 });
    });
  });

  const tip = useTooltip(scope);

  // Loops: lugares flutuam (passo 0) · corredores circulam no anel (passo 2). Só com o slide em cena.
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || motionPrefs.reduced) return;
    const floats = Array.from(root.querySelectorAll<HTMLElement>('[data-a="float"]'));
    const orbit = root.querySelector('[data-a="orbit"]');
    const loops: gsap.core.Tween[] = [];
    if (step === 0) {
      floats.forEach((el, i) => {
        const rnd = seeded(i + 7);
        loops.push(
          gsap.to(el, {
            x: (rnd() - 0.5) * 16,
            y: (rnd() - 0.5) * 14,
            duration: 2.6 + rnd() * 1.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.4 + rnd() * 0.8,
          }),
        );
      });
    }
    if (step === 2 && orbit) {
      loops.push(gsap.to(orbit, { rotation: "+=360", svgOrigin: `${C} ${C}`, duration: 150, ease: "none", repeat: -1, delay: 1.8 }));
    }
    return () => {
      loops.forEach((t) => t.kill());
      if (floats.length) gsap.to(floats, { x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: true });
      if (orbit) {
        const r = Number(gsap.getProperty(orbit, "rotation")) % 360;
        if (r) gsap.to(orbit, { rotation: r > 180 ? 360 : 0, svgOrigin: `${C} ${C}`, duration: 0.6, ease: "power2.inOut", overwrite: true, onComplete: () => void gsap.set(orbit, { rotation: 0, svgOrigin: `${C} ${C}` }) });
      }
    };
  }, [current, step, scope]);

  // Parallax sutil com o mouse (desligado em toque e movimento reduzido).
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || motionPrefs.reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const near = root.querySelector('[data-a="parallax"]');
    const far = root.querySelector('[data-a="par-head"]');
    if (!near || !far) return;
    const nx = gsap.quickTo(near, "x", { duration: 0.9, ease: "power3" });
    const ny = gsap.quickTo(near, "y", { duration: 0.9, ease: "power3" });
    const fx = gsap.quickTo(far, "x", { duration: 1.2, ease: "power3" });
    const fy = gsap.quickTo(far, "y", { duration: 1.2, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX / window.innerWidth - 0.5;
      const dy = e.clientY / window.innerHeight - 0.5;
      nx(-dx * 18);
      ny(-dy * 14);
      fx(dx * 6);
      fy(dy * 4);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.to([near, far], { x: 0, y: 0, duration: 0.6, ease: "power2.out" });
    };
  }, [current, scope]);

  const enter = (p: Place, el: HTMLElement) => {
    setActive(p.channel);
    tip.show(
      el,
      <>
        <span className="t-label block text-fg-3">{copy.channelPrefix}</span>
        <strong className="mt-1 block text-[14px] text-brand-text">{p.project.name}</strong>
        <span className="mt-1 block text-fg-2">{p.note}</span>
      </>,
      p.ring.v < 0.3 && step === 2 ? "bottom" : "top",
    );
  };
  const leave = () => {
    setActive(null);
    tip.hide();
  };

  return (
    <div ref={scope} className="slide">
      <div className={styles.stage}>
        {/* ── Coluna esquerda: tese, explicação → legenda, exemplo ── */}
        <div className={styles.left}>
          <div data-a="par-head">
            <SectionHeader index={index} label={copy.label} title={copy.headline} />
            <div className={styles.leftSwap}>
              <div data-a="lede">
                <p className={cn("t-lede", styles.lede)}>{copy.lede}</p>
                <p className={styles.hint}>
                  <span className={styles.hintDot} aria-hidden="true" />
                  {copy.hint}
                </p>
              </div>
              <div data-a="legend">
                <p data-a="legend-in" className="t-label text-fg-3">
                  {copy.channelsTitle}
                </p>
                <ul className={styles.legendList}>
                  {copy.legend.map((l) => {
                    const place = PLACE_BY_ID[l.place];
                    const project = PROJECTS[l.channel as ProjectId];
                    return (
                      <li key={l.place} data-a="legend-in">
                        <button
                          type="button"
                          className={styles.legendRow}
                          data-on={active === l.channel ? "true" : undefined}
                          aria-label={`${place.label}. ${copy.channelPrefix}: ${project.name}`}
                          onPointerEnter={() => setActive(l.channel)}
                          onPointerLeave={() => setActive(null)}
                          onFocus={() => setActive(l.channel)}
                          onBlur={() => setActive(null)}
                        >
                          <span className={styles.legendPlace}>{place.label}</span>
                          <span className={styles.legendLeader} aria-hidden="true" />
                          <span className={styles.legendChannel}>{project.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <aside data-a="example" className={styles.example}>
            <div data-a="ex-in" className={styles.exampleHead}>
              <Tag kind="example">{copy.example.tag}</Tag>
              <span className={styles.exampleTitle}>{copy.example.title}</span>
            </div>
            <div data-a="ex-in" className={styles.compare}>
              <div>
                <OneByOneArt />
                <span className={styles.cmpValue}>{copy.example.oneByOne.value}</span>
                <span className={styles.cmpLabel}>{copy.example.oneByOne.label}</span>
              </div>
              <span className={styles.versus} aria-hidden="true">
                {copy.example.versus}
              </span>
              <div className={styles.cmpTogether}>
                <TogetherArt />
                <span className={styles.cmpValue}>{copy.example.together.value}</span>
                <span className={styles.cmpLabel}>{copy.example.together.label}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Campo: lugares → núcleo → rede ── */}
        <div className={styles.field} data-active={active ?? undefined}>
          <div data-a="parallax" className={styles.parallax}>
            <svg viewBox={`0 0 ${VB} ${VB}`} className={styles.svg} aria-hidden="true" focusable="false">
              <defs>
                <radialGradient id={gradId}>
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g data-a="orbit">
                <circle data-a="orbit-ring" className={styles.orbitRing} cx={C} cy={C} r={RING * VB - 58} />
                <g opacity={0.32}>
                  {AMBIENT.map((d, i) => (
                    <circle key={i} data-a="ambient" className={styles.ambient} cx={d.x} cy={d.y} r={d.r} />
                  ))}
                </g>
              </g>
              {PLACES.map((p) => (
                <line
                  key={`s-${p.id}`}
                  data-a="spoke"
                  data-on={active === p.channel ? "true" : undefined}
                  className={styles.spoke}
                  x1={C}
                  y1={C}
                  x2={r2(p.ring.u * VB)}
                  y2={r2(p.ring.v * VB)}
                />
              ))}
              {PLACES.map((p) => (
                <line
                  key={`l-${p.id}`}
                  data-a="line"
                  className={styles.line}
                  x1={r2(p.scatter.u * VB)}
                  y1={r2(p.scatter.v * VB)}
                  x2={C}
                  y2={C}
                />
              ))}
              <circle data-a="halo" className={styles.halo} cx={C} cy={C} r={RING * VB} />
              <circle data-a="ring" className={styles.ring} cx={C} cy={C} r={RING * VB} />
              <circle data-a="glow" cx={C} cy={C} r={CORE_R * 2.6} fill={`url(#${gradId})`} />
              <circle data-a="core" className={styles.core} cx={C} cy={C} r={CORE_R} />
            </svg>

            <div data-a="core-mark" className={styles.coreMark} aria-hidden="true">
              <BoraWordmark className="block h-auto w-full" title="" />
            </div>
            <div data-a="lockup" className={styles.lockup}>
              <BoraLockup className="lockup w-full" />
            </div>

            {PLACES.map((p) => (
              <div key={p.id} data-a="layer" className={styles.layer}>
                <div data-a="float" className={styles.float}>
                  <button
                    type="button"
                    className={cn(styles.place, styles[p.align])}
                    data-place={p.id}
                    data-on={active === p.channel ? "true" : undefined}
                    aria-label={`${p.label}. ${copy.channelPrefix}: ${p.project.name}`}
                    onPointerEnter={(e) => enter(p, e.currentTarget)}
                    onPointerLeave={leave}
                    onFocus={(e) => enter(p, e.currentTarget)}
                    onBlur={leave}
                  >
                    <svg data-a="p-cluster" viewBox="0 0 40 40" className={styles.cluster} aria-hidden="true" focusable="false">
                      {p.dots.map((d, i) => (
                        <circle key={i} className={styles.clusterDot} cx={d.x} cy={d.y} r={d.r} />
                      ))}
                      <circle data-a="p-hub" className={styles.clusterHub} cx={20} cy={20} r={3.4} />
                    </svg>
                    <span data-a="p-label" className={styles.placeLabel}>
                      <span className={styles.placeName}>{p.label}</span>
                      <span data-a="p-channel" className={styles.placeChannel}>
                        {p.project.name}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <InteractiveTooltip state={tip.state} />
    </div>
  );
}

/** 150 conversas individuais: 150 pontos isolados. */
function OneByOneArt() {
  return (
    <svg viewBox="0 0 90 60" className={styles.cmpArt} aria-hidden="true" focusable="false">
      {Array.from({ length: 150 }, (_, i) => (
        <circle key={i} className={styles.gridDot} cx={3 + (i % 15) * 6} cy={3 + Math.floor(i / 15) * 6} r={1.3} />
      ))}
    </svg>
  );
}

/** 1 parceria: um aglomerado de 150 pontos, uma linha até a BORA. */
function TogetherArt() {
  return (
    <svg viewBox="0 0 120 60" className={styles.cmpArt} aria-hidden="true" focusable="false">
      {Array.from({ length: 150 }, (_, i) => {
        const radius = 2.3 * Math.sqrt(i + 0.5);
        const angle = i * GOLDEN;
        return <circle key={i} className={styles.clubDot} cx={r2(30 + radius * Math.cos(angle))} cy={r2(30 + radius * Math.sin(angle))} r={1.05} />;
      })}
      <line className={styles.clubLine} x1={62} y1={30} x2={98} y2={30} />
      <circle className={styles.clubNode} cx={104} cy={30} r={5.5} />
    </svg>
  );
}
