"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn, pad2, r2 } from "@/lib/utils";
import styles from "./ArchitectureDiagram.module.css";

/*
 * BORA OS como infraestrutura: um chip.
 * Núcleo = camada de identidade (BORA ID); módulos ao redor ligados por trilhas ortogonais;
 * integrações possíveis como portas tracejadas nas bordas (arquitetura-alvo).
 * Prancheta fixa (OS.W × OS.H) escalada por inteiro — os comprimentos das trilhas (DrawSVG) nunca mudam.
 *
 * Alvos de animação: [data-a="os-frame"], [data-a="os-grid"], [data-a="os-tick"], [data-a="os-core"],
 * [data-a="os-label"], [data-a="os-tag"], [data-a="os-mod"], [data-a="os-trace"], [data-a="os-pin"],
 * [data-a="os-pad"], [data-a="os-stub"], [data-a="os-port-label"], [data-a="os-group"].
 */

export const OS = { W: 820, H: 730 } as const;

const FRAME = { x: 110, y: 84, w: 600, h: 556, r: 30 };
const MOD = { w: 140, h: 44 };
const CORE = { x: 320, y: 250, w: 180, h: 220 };

type Pt = [number, number];
type Side = "top" | "right" | "bottom" | "left";

/** Posição de cada módulo (canto superior esquerdo) e a trilha até o núcleo. */
const LAYOUT: Record<string, { x: number; y: number; trace: Pt[] }> = {
  GROWTH: { x: 160, y: 124, trace: [[230, 168], [230, 209], [350, 209], [350, 250]] },
  CRM: { x: 340, y: 124, trace: [[410, 168], [410, 250]] },
  INTELIGÊNCIA: { x: 520, y: 124, trace: [[590, 168], [590, 209], [470, 209], [470, 250]] },
  ENTERPRISE: { x: 134, y: 278, trace: [[274, 300], [320, 300]] },
  PARCEIROS: { x: 134, y: 398, trace: [[274, 420], [320, 420]] },
  RECEITA: { x: 546, y: 278, trace: [[546, 300], [500, 300]] },
  ASSINATURAS: { x: 546, y: 398, trace: [[546, 420], [500, 420]] },
  OPEN: { x: 160, y: 556, trace: [[230, 556], [230, 511], [350, 511], [350, 470]] },
  EVENTOS: { x: 340, y: 556, trace: [[410, 556], [410, 470]] },
  POWERED: { x: 520, y: 556, trace: [[590, 556], [590, 511], [470, 511], [470, 470]] },
};

/** Coordenadas das portas ao longo de cada borda. */
const PORT_AT: Record<Side, number[]> = {
  top: [300, 410, 520],
  right: [322, 398],
  bottom: [355, 465],
  left: [322, 398],
};

function ortho(points: Pt[], radius = 8) {
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const d1 = Math.hypot(x1 - x0, y1 - y0);
    const d2 = Math.hypot(x2 - x1, y2 - y1);
    const r = Math.min(radius, d1 / 2, d2 / 2);
    d += ` L${r2(x1 - ((x1 - x0) / d1) * r)} ${r2(y1 - ((y1 - y0) / d1) * r)} Q${x1} ${y1} ${r2(x1 + ((x2 - x1) / d2) * r)} ${r2(y1 + ((y2 - y1) / d2) * r)}`;
  }
  const last = points[points.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}

function roundedRect({ x, y, w, h, r }: typeof FRAME) {
  // Caminho contínuo (para o DrawSVG desenhar a moldura num traço só), começando no topo-esquerdo.
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y}`;
}

type PortGroup = { side: Side; group: string; items: readonly string[] };

type Props = {
  modules: readonly string[];
  ports: readonly PortGroup[];
  labels: { os: string; core: string; coreKicker: string; coreCaption: string };
  tag?: ReactNode;
  ariaLabel: string;
  /** Módulos em destaque (pergunta ou etapa da jornada). */
  highlight: ReadonlySet<string> | null;
  /** Pulsos de dados nas trilhas (só com o slide em cena e sem movimento reduzido). */
  pulse: boolean;
  /** "Sem OS": núcleo apagado, módulos desconectados. */
  offline?: boolean;
  className?: string;
};

export function ArchitectureDiagram({ modules, ports, labels, tag, ariaLabel, highlight, pulse, offline, className }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [fit, setFit] = useState({ s: 1, x: 0, y: 0 });

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / OS.W, h / OS.H);
      setFit({ s, x: Math.max(0, (w - OS.W * s) / 2), y: Math.max(0, (h - OS.H * s) / 2) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const traces = useMemo(
    () => modules.filter((m) => LAYOUT[m]).map((m) => ({ id: m, d: ortho(LAYOUT[m].trace), end: LAYOUT[m].trace[LAYOUT[m].trace.length - 1] })),
    [modules],
  );
  const hlKey = highlight ? [...highlight].sort().join("|") : "";
  const hlOf = (m: string) => (offline || !highlight ? "idle" : highlight.has(m) ? "on" : "off");

  // Pulsos: um traço volt curto corre de cada módulo até o núcleo, em loop (só enquanto `pulse`).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !pulse || offline) return;
    const ctx = gsap.context(() => {
      const all = Array.from(svg.querySelectorAll<SVGPathElement>("[data-pulse]"));
      const focus = hlKey ? hlKey.split("|") : null;
      const paths = focus ? all.filter((p) => focus.includes(p.dataset.pulse ?? "")) : all;
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        const dash = 14;
        gsap.set(p, { strokeDasharray: `${dash} ${len + dash * 2}`, strokeDashoffset: dash, opacity: 1 });
        gsap.to(p, {
          strokeDashoffset: -len,
          duration: 0.5 + len / 260,
          ease: "power1.in",
          repeat: -1,
          repeatDelay: focus ? 0.5 + (i % 3) * 0.25 : 1.4 + ((i * 0.37) % 1) * 2.4,
          delay: focus ? i * 0.18 : ((i * 0.53) % 1) * 2,
        });
      });
    }, svg);
    return () => ctx.revert();
  }, [pulse, offline, hlKey]);

  const portGeo = (side: Side, at: number) => {
    const { x, y, w, h } = FRAME;
    switch (side) {
      case "top":
        return { stub: [[at, y - 22], [at, y]] as Pt[], pad: { x: at - 7, y: y - 3, w: 14, h: 6 }, label: { left: at, top: y - 42, align: "center" as const } };
      case "bottom":
        return { stub: [[at, y + h], [at, y + h + 22]] as Pt[], pad: { x: at - 7, y: y + h - 3, w: 14, h: 6 }, label: { left: at, top: y + h + 28, align: "center" as const } };
      case "left":
        return { stub: [[x - 18, at], [x, at]] as Pt[], pad: { x: x - 3, y: at - 7, w: 6, h: 14 }, label: { left: x - 24, top: at - 8, align: "right" as const } };
      case "right":
        return { stub: [[x + w, at], [x + w + 18, at]] as Pt[], pad: { x: x + w - 3, y: at - 7, w: 6, h: 14 }, label: { left: x + w + 24, top: at - 8, align: "left" as const } };
    }
  };
  const groupGeo = (side: Side) => {
    const { x, y, w, h } = FRAME;
    switch (side) {
      case "top":
        return { left: x + w / 2, top: 12, align: "center" as const };
      case "bottom":
        return { left: x + w / 2, top: y + h + 52, align: "center" as const };
      case "left":
        return { left: x - 24, top: PORT_AT.left[0] - 36, align: "right" as const };
      case "right":
        return { left: x + w + 24, top: PORT_AT.right[0] - 36, align: "left" as const };
    }
  };
  const alignStyle = (left: number, top: number, align: "left" | "center" | "right"): CSSProperties => ({
    left,
    top,
    transform: align === "center" ? "translateX(-50%)" : align === "right" ? "translateX(-100%)" : undefined,
    textAlign: align,
  });

  return (
    <div ref={boxRef} className={cn(styles.box, className)}>
      <div
        className={cn(styles.artboard, offline && styles.isOffline)}
        style={{ width: OS.W, height: OS.H, transform: `translate(${r2(fit.x)}px, ${r2(fit.y)}px) scale(${fit.s})`, "--s": fit.s } as CSSProperties}
        role="img"
        aria-label={ariaLabel}
      >
        <svg ref={svgRef} className={styles.svg} width={OS.W} height={OS.H} viewBox={`0 0 ${OS.W} ${OS.H}`} aria-hidden="true">
          <defs>
            <pattern id="os-dots" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="0.9" className={styles.gridDot} />
            </pattern>
            <clipPath id="os-clip">
              <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx={FRAME.r} />
            </clipPath>
          </defs>

          <g data-a="os-grid">
            <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx={FRAME.r} className={styles.frameFill} />
            <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="url(#os-dots)" clipPath="url(#os-clip)" />
          </g>
          <path data-a="os-frame" d={roundedRect(FRAME)} className={styles.frame} />
          {[
            [FRAME.x - 10, FRAME.y - 10, 1, 1],
            [FRAME.x + FRAME.w + 10, FRAME.y - 10, -1, 1],
            [FRAME.x - 10, FRAME.y + FRAME.h + 10, 1, -1],
            [FRAME.x + FRAME.w + 10, FRAME.y + FRAME.h + 10, -1, -1],
          ].map(([x, y, sx, sy], i) => (
            <path key={i} data-a="os-tick" d={`M${x} ${y + 9 * sy} V${y} H${x + 9 * sx}`} className={styles.tick} />
          ))}

          {/* Portas: tracejadas (arquitetura-alvo) */}
          {ports.flatMap((g) =>
            g.items.map((item, i) => {
              const geo = portGeo(g.side, PORT_AT[g.side][i] ?? PORT_AT[g.side][0]);
              return (
                <g key={item}>
                  <path data-a="os-stub" d={`M${geo.stub[0][0]} ${geo.stub[0][1]} L${geo.stub[1][0]} ${geo.stub[1][1]}`} className={styles.stub} />
                  <rect data-a="os-pad" x={geo.pad.x} y={geo.pad.y} width={geo.pad.w} height={geo.pad.h} rx={2} className={styles.pad} />
                </g>
              );
            }),
          )}

          {traces.map((t) => (
            <path key={t.id} data-a="os-trace" data-hl={hlOf(t.id)} d={t.d} className={styles.trace} />
          ))}
          {traces.map((t) => (
            <path key={`p-${t.id}`} data-pulse={t.id} d={t.d} className={styles.pulse} />
          ))}
          {traces.map((t) => (
            <circle key={`pin-${t.id}`} data-a="os-pin" data-hl={hlOf(t.id)} cx={t.end[0]} cy={t.end[1]} r={3.2} className={styles.pin} />
          ))}
        </svg>

        <span data-a="os-label" className={styles.osLabel} style={{ left: FRAME.x + 26, top: FRAME.y + 18 }}>
          {labels.os}
        </span>
        {tag && (
          <span data-a="os-tag" className={styles.osTag} style={{ right: OS.W - (FRAME.x + FRAME.w) + 22, top: FRAME.y + 11 }}>
            {tag}
          </span>
        )}

        {ports.map((g) => {
          const gg = groupGeo(g.side);
          return (
            <span key={g.group} data-a="os-group" className={styles.groupLabel} style={alignStyle(gg.left, gg.top, gg.align)}>
              {g.group}
            </span>
          );
        })}
        {ports.flatMap((g) =>
          g.items.map((item, i) => {
            const geo = portGeo(g.side, PORT_AT[g.side][i] ?? PORT_AT[g.side][0]);
            return (
              <span key={item} data-a="os-port-label" className={styles.portLabel} style={alignStyle(geo.label.left, geo.label.top, geo.label.align)}>
                {item}
              </span>
            );
          }),
        )}

        {modules.map((m, i) => {
          const pos = LAYOUT[m];
          if (!pos) return null;
          return (
            <div key={m} data-a="os-mod" className={styles.mod} style={{ left: pos.x, top: pos.y, width: MOD.w, height: MOD.h }}>
              <div className={styles.modInner} data-hl={hlOf(m)}>
                <span className={styles.modIdx}>{pad2(i + 1)}</span>
                <span>{m}</span>
              </div>
            </div>
          );
        })}

        <div data-a="os-core" className={styles.core} style={{ left: CORE.x, top: CORE.y, width: CORE.w, height: CORE.h }}>
          <div className={styles.coreInner}>
            <span className={styles.ring} aria-hidden="true" />
            <span className={styles.coreKicker}>{labels.coreKicker}</span>
            <strong className={styles.coreTitle}>{labels.core}</strong>
            <span className={styles.coreCaption}>{labels.coreCaption}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
