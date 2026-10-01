"use client";

import { useEffect, useSyncExternalStore } from "react";
import { deck } from "@/components/deck/deck-store";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { METRO, MetroRoutes, metroAt } from "@/components/diagrams/MetroRoutes";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader, revealHeader, revealHighlights } from "@/components/ui/SectionHeader";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { stageOf } from "@/content/projects";
import { copy } from "@/content/slides/17-expansion-pipeline";
import { gsap } from "@/lib/gsap";
import { draw, fade, motionPrefs, pop, rise, unmask } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S17Pipeline.module.css";

/** Duração do traço de cada linha (s0 e s1). Estações acendem quando o traço passa por elas. */
const LINE_DUR = 1.3;

/** Pontos em loop: a maioria segue até a cidade; alguns saem pelas saídas legítimas. */
const PATTERN = ["flowA", "flowB", "flowExitA", "flowB", "flowA", "flowExitB", "flowA", "flowB"] as const;
const SPEED = 300; // unidades do viewBox por segundo

const getMode = () => deck.getSnapshot().mode;
const getServerMode = () => "deck" as const;

const ROUTE_STATIONS = {
  a: copy.routeA.stations,
  b: copy.routeB.stations,
} as const;

/** Estágio da ação por trás de cada estação (lido de projects.ts). */
const stagesOf = (ids: readonly (string | null)[]) => ids.map((id) => (id ? (stageOf(id) ?? null) : null));
const STAGES_A = stagesOf(copy.routeA.stationIds);
const STAGES_B = stagesOf(copy.routeB.stationIds);

export function PipelineSlide() {
  const { index, step, entered, current } = useSlide();
  const mode = useSyncExternalStore(deck.subscribe, getMode, getServerMode);
  const flow = mode === "flow";

  const { scope } = useStepTimeline(
    ({ step: at, q, reduced }) => {
      const els = (name: string) => q(`[data-a="${name}"]`);
      const dur = reduced ? 0.5 : LINE_DUR;

      /** Uma linha que se desenha e acende as estações na ordem em que o traço passa. */
      const drawRoute = (tl: gsap.core.Timeline, route: "a" | "b", start: number) => {
        pop(tl, els(`badge-${route}`), start, { duration: 0.5 });
        fade(tl, els(`kind-${route}`), start + 0.15, { duration: 0.6 });
        if (reduced) tl.from(els(`line-${route}`), { autoAlpha: 0, duration: dur }, start);
        else tl.from(els(`line-${route}`), { drawSVG: "0%", duration: dur, ease: "none" }, start);
        const xs = METRO[route].xs;
        els(`st-${route}`).forEach((st, i) => pop(tl, st, start + metroAt(xs[i]) * dur, { duration: 0.45 }));
        els(`lb-${route}`).forEach((lb, i) =>
          rise(tl, lb, start + metroAt(xs[i]) * dur + 0.05, {
            y: route === "a" ? 10 : -10,
            duration: 0.6,
          }),
        );
      };

      // s0 — Rota A, estação por estação.
      at(0, (tl) => {
        revealHeader(tl, q);
        drawRoute(tl, "a", 0.4);
        pop(tl, els("unit"), 0.4 + dur, { duration: 0.5 });
        rise(tl, els("unit-label"), 0.45 + dur, { y: 8 });
        fade(tl, els("legend"), 0.6 + dur, { duration: 0.6 });
      });

      // s1 — Rota B chega à mesma integração.
      at(1, (tl) => {
        drawRoute(tl, "b", 0);
        tl.to(
          els("unit"),
          {
            scale: 1.18,
            transformOrigin: "50% 50%",
            duration: 0.22,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
          },
          dur,
        );
      });

      // s2 — tronco até a Cidade BORA + saídas legítimas + a mensagem.
      at(2, (tl) => {
        draw(tl, els("trunk"), 0, {
          duration: reduced ? 0.4 : 0.8,
          ease: "power2.inOut",
        });
        pop(tl, els("city"), 0.65, { duration: 0.7 });
        pop(tl, els("city-mark"), 0.8, { duration: 0.6 });
        rise(tl, els("city-label"), 0.85, { y: 10 });
        if (!reduced) {
          tl.fromTo(
            els("pulse"),
            { scale: 1, opacity: 0.8 },
            {
              scale: 1.9,
              opacity: 0,
              transformOrigin: "50% 50%",
              duration: 1.1,
              ease: "power2.out",
              immediateRender: false,
            },
            0.9,
          );
        }
        fade(tl, els("exit"), 1.0, { stagger: 0.15, duration: 0.6 });
        pop(tl, els("exit-end"), 1.2, { stagger: 0.15, duration: 0.45 });
        rise(tl, els("exit-text"), 1.25, { stagger: 0.15, y: 8 });
        tl.from(els("statement"), { autoAlpha: 0, duration: 0.01 }, 0.5);
        unmask(tl, q('[data-a="statement"] .split-unit'), 0.5, {
          stagger: 0.05,
        });
        revealHighlights(tl, q('[data-a="statement"] .hl'), 1.25);
        rise(tl, els("note"), 1.1, { stagger: 0.12, y: 10 });
      });

      // s3 — comparativo (hipótese) + um exemplo por rota.
      at(3, (tl) => {
        if (!flow)
          tl.to(
            els("map"),
            {
              autoAlpha: 0,
              y: reduced ? 0 : -12,
              duration: 0.5,
              ease: "power2.in",
            },
            0,
          );
        tl.from(els("compare"), { autoAlpha: 0, duration: 0.3 }, flow ? 0 : 0.35);
        rise(tl, els("compare-head"), flow ? 0 : 0.4, { y: 12 });
        rise(tl, q(".dt-row"), flow ? 0.05 : 0.5, { stagger: 0.07, y: 10 });
        rise(tl, els("example"), flow ? 0.1 : 0.65, { stagger: 0.14, y: 16 });
      });
    },
    [flow],
  );

  // Pipeline em movimento: pontos percorrem as rotas; alguns param nas saídas (só em cena, s2).
  useEffect(() => {
    const root = scope.current;
    if (!root || !current || !entered || step !== 2 || motionPrefs.reduced) return;
    const dots = gsap.utils.toArray<SVGCircleElement>(root.querySelectorAll('[data-a="dot"]'));
    const pulse = root.querySelector('[data-a="pulse-loop"]');
    const path = (name: string) => root.querySelector<SVGPathElement>(`[data-path="${name}"]`);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, delay: 2.2 });
      PATTERN.forEach((name, i) => {
        const p = path(name);
        const dot = dots[i];
        if (!p || !dot) return;
        const len = p.getTotalLength();
        const d = len / SPEED;
        const t0 = i * 0.9;
        const toCity = name === "flowA" || name === "flowB";
        tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0)
          .to(
            dot,
            {
              motionPath: { path: p, align: p, alignOrigin: [0.5, 0.5] },
              duration: d,
              ease: "none",
            },
            t0,
          )
          .to(dot, { opacity: 0, duration: toCity ? 0.25 : 0.6 }, t0 + d - (toCity ? 0.1 : -0.5));
        if (toCity && pulse) {
          tl.fromTo(
            pulse,
            { scale: 1, opacity: 0.7 },
            {
              scale: 1.7,
              opacity: 0,
              transformOrigin: "50% 50%",
              duration: 0.9,
              ease: "power2.out",
            },
            t0 + d - 0.1,
          );
        }
      });
    }, root);
    return () => ctx.revert();
  }, [scope, step, current, entered]);

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className={cn("grid-12 gap-y-6", styles.top)}>
        <SectionHeader
          index={index}
          label={copy.label}
          title={copy.headline}
          lede={copy.lede}
          tag={<StageTag of="pipeline" />}
          className="col-span-12 lg:col-span-7"
        />
        <div data-a="statement" className="col-span-12 lg:col-span-5">
          <SplitHeadline as="p" lines={copy.statement} className={cn("t-headline", styles.statement)} />
          <ul className={styles.notes}>
            {copy.notes.map((n) => (
              <li key={n} data-a="note" className={styles.note}>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.stage}>
        <div data-a="map" className={styles.mapWrap}>
          <MetroRoutes
            ariaLabel={copy.mapLabel}
            routeA={copy.routeA}
            routeB={copy.routeB}
            unit={copy.unit}
            city={copy.city}
            exits={copy.exits}
            stagesA={STAGES_A}
            stagesB={STAGES_B}
            legend={copy.legend}
          />
        </div>

        <div data-a="compare" className={cn("grid-12 gap-y-8", styles.compare)}>
          <div className="col-span-12 lg:col-span-7">
            <div data-a="compare-head" className={styles.compareHead}>
              <h3 className={cn("t-title", styles.compareTitle)}>{copy.compare.title}</h3>
              <Tag kind="hypothesis" />
            </div>
            <div className={styles.tableScroll}>
              <DataTable
                caption={copy.compare.title}
                className={styles.table}
                columns={[
                  { key: "criterion", label: copy.compare.columns.criterion },
                  { key: "a", label: copy.compare.columns.a },
                  { key: "b", label: copy.compare.columns.b },
                ]}
                rows={copy.compare.rows.map((r) => ({ ...r }))}
              />
            </div>
          </div>

          <div className={cn("col-span-12 lg:col-span-5", styles.examples)}>
            {copy.examples.map((ex) => {
              const isA = ex.route === "a";
              const route = isA ? copy.routeA : copy.routeB;
              return (
                <article key={ex.route} data-a="example" className={cn(styles.example, isA ? styles.exampleA : styles.exampleB)}>
                  <header className={styles.exampleHead}>
                    <span className={styles.exampleBadge} aria-hidden="true">
                      {route.badge}
                    </span>
                    <h4 className={styles.exampleTitle}>{ex.title}</h4>
                    <Tag kind="illustrative">{copy.exampleTag}</Tag>
                  </header>
                  <span className={styles.strip} aria-hidden="true">
                    {ROUTE_STATIONS[ex.route].map((s) => (
                      <i key={s} className={styles.stripDot} />
                    ))}
                    <i className={cn(styles.stripDot, styles.stripEnd)} />
                  </span>
                  <p className={styles.exampleText}>{ex.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
