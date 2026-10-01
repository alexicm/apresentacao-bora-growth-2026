"use client";

import type { CSSProperties, Ref } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import styles from "./ValueCircuit.module.css";

export type CircuitNode = {
  id: string;
  label: string;
  caption?: string;
  /** Posição na cadeia linear (0–100, % da largura do contêiner). Sem `line`, o nó só existe no anel. */
  line?: number;
  /** Posição no anel, em graus (0° = direita, sentido horário na tela). */
  angle: number;
  /** Lado do rótulo quando o nó está no anel. */
  place: "left" | "right" | "top" | "bottom";
  /** Nó em volt (a BORA). */
  accent?: boolean;
};

type Props = {
  nodes: readonly CircuitNode[];
  /** Lista pendurada num ponto da cadeia linear (ex.: no que os créditos viram). */
  credits?: { label: string; items: readonly string[]; from: number };
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

const PLACE: Record<CircuitNode["place"], { tx: string; ty: string }> = {
  left: { tx: "calc(-100% - 18px)", ty: "-50%" },
  right: { tx: "18px", ty: "-50%" },
  top: { tx: "-50%", ty: "calc(-100% - 16px)" },
  bottom: { tx: "-50%", ty: "16px" },
};

/** Arredonda para evitar diferenças de hidratação por ponto flutuante. */
const r4 = (n: number) => Math.round(n * 10000) / 10000;
const pt = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: r4(50 + 50 * Math.cos(a)), y: r4(50 + 50 * Math.sin(a)) };
};

/**
 * Circuito de valor: uma cadeia linear (passo "linha") que se curva num anel (passo "anel").
 * O slide orquestra a transição animando `--m` (0 → 1) nos nós `[data-a='vc-node']`.
 * Alvos: vc-link, vc-drop, vc-credit, vc-ring, vc-node, vc-dot, vc-label, vc-caption.
 * O pacote em loop é criado por `circuitLoop()`.
 */
export function ValueCircuit({ nodes, credits, className, ref }: Props) {
  const first = pt(nodes[0].angle);
  const opposite = pt(nodes[0].angle + 180);
  // Anel começando no primeiro nó, no sentido horário (dois meios-arcos).
  const ringD = `M ${first.x} ${first.y} A 50 50 0 1 1 ${opposite.x} ${opposite.y} A 50 50 0 1 1 ${first.x} ${first.y}`;
  const arcs = nodes.map((n, i) => {
    const a = pt(n.angle);
    const b = pt(nodes[(i + 1) % nodes.length].angle);
    return `M ${a.x} ${a.y} A 50 50 0 0 1 ${b.x} ${b.y}`;
  });
  const lineNodes = nodes.filter((n) => n.line !== undefined);

  return (
    <div ref={ref} data-a="vc" className={cn(styles.vc, className)} aria-hidden="true">
      {lineNodes.slice(0, -1).map((n, i) => (
        <span
          key={n.id}
          data-a="vc-link"
          className={styles.link}
          style={{ "--a": n.line, "--b": lineNodes[i + 1].line } as CSSProperties}
        />
      ))}

      {credits && (
        <>
          <span data-a="vc-drop" className={styles.drop} style={{ "--from": credits.from } as CSSProperties} />
          <div className={styles.credits}>
            <span data-a="vc-credit" className={cn(styles.creditsLabel, "t-label text-fg-3")}>
              {credits.label}
            </span>
            {credits.items.map((c) => (
              <span key={c} data-a="vc-credit" className={styles.credit}>
                {c}
              </span>
            ))}
          </div>
        </>
      )}

      <div className={styles.ring}>
        <svg className={styles.ringSvg} viewBox="0 0 100 100" focusable="false">
          <path data-a="vc-ring" d={ringD} fill="none" stroke="var(--line)" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
          {arcs.map((d, i) => (
            <path
              key={i}
              data-a="vc-arc"
              className={styles.arc}
              d={d}
              fill="none"
              stroke="var(--brand)"
              strokeWidth={2.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div data-a="vc-orbit" className={styles.orbit}>
          <div data-a="vc-packet" className={styles.packet}>
            <span className={styles.packetDot} />
            <span className={styles.packetTag}>
              <span data-a="vc-packet-in" className={styles.packetIn} />
            </span>
          </div>
        </div>
      </div>

      {nodes.map((n) => {
        const a = (n.angle * Math.PI) / 180;
        const place = PLACE[n.place];
        const ringOnly = n.line === undefined;
        return (
          <div
            key={n.id}
            data-a="vc-node"
            data-node={n.id}
            data-angle={n.angle}
            data-ring-only={ringOnly ? "" : undefined}
            data-accent={n.accent ? "" : undefined}
            className={styles.node}
            style={
              {
                "--lx": n.line ?? 50,
                "--cos": r4(Math.cos(a)),
                "--sin": r4(Math.sin(a)),
                ...(ringOnly ? { "--m": 1 } : null),
              } as CSSProperties
            }
          >
            <span data-a="vc-halo" className={styles.halo} />
            <span data-a="vc-dot" className={styles.dot} />
            <span className={styles.label} style={{ "--tx1": place.tx, "--ty1": place.ty } as CSSProperties}>
              <span data-a="vc-label" className={styles.labelIn}>
                <span className={styles.name}>{n.label}</span>
                {n.caption && (
                  <span data-a="vc-caption" className={styles.caption}>
                    {n.caption}
                  </span>
                )}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

type LoopOptions = {
  /** Duração do trajeto entre dois nós (s). */
  travel?: number;
  /** Pausa em cada nó (s). */
  dwell?: number;
  delay?: number;
  /** Chamado quando o pacote parte do nó `i` (útil para sincronizar uma legenda). */
  onSegment?: (i: number) => void;
};

/**
 * Pacote volt que percorre o anel, mudando de nome a cada nó (ex.: R$ → Créditos → …),
 * com um rastro que acompanha o trajeto e um pulso no nó de chegada.
 * Retorna a timeline (infinita) — mate-a (ou reverta o gsap.context) ao sair do slide.
 * Não chame com movimento reduzido.
 */
export function circuitLoop(root: Element, tokens: readonly string[], o: LoopOptions = {}) {
  const q = gsap.utils.selector(root);
  const orbit = q("[data-a='vc-orbit']")[0];
  const packet = q("[data-a='vc-packet']")[0];
  const inner = q("[data-a='vc-packet-in']")[0] as HTMLElement | undefined;
  const arcs = q("[data-a='vc-arc']");
  const halos = q("[data-a='vc-halo']");
  const nodes = q("[data-a='vc-node']") as HTMLElement[];
  if (!orbit || !packet || !inner || !arcs.length) return gsap.timeline();

  const n = arcs.length;
  const T = o.travel ?? 1.15;
  const D = o.dwell ?? 0.5;
  const span = 360 / n;
  // Rotação da órbita que leva o pacote (preso no topo, 270°) até o primeiro nó.
  const r0 = Number(nodes[0]?.dataset.angle ?? 0) - 270;

  gsap.set(orbit, { rotation: r0 });
  gsap.set(inner, { rotation: -r0 });
  inner.textContent = tokens[0] ?? "";
  gsap.set(arcs, { autoAlpha: 1, drawSVG: "0% 0%" });

  const segment = (tl: gsap.core.Timeline, i: number) => {
    tl.call(() => {
      inner.textContent = tokens[i] ?? "";
      o.onSegment?.(i);
    });
    tl.fromTo(inner, { scale: 0.82 }, { scale: 1, duration: 0.45, ease: "bora", immediateRender: false });
    tl.to(orbit, { rotation: `+=${span}`, duration: T, ease: "power2.inOut" }, "<")
      .to(inner, { rotation: `-=${span}`, duration: T, ease: "power2.inOut" }, "<")
      .fromTo(arcs[i], { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: T, ease: "power2.inOut", immediateRender: false }, "<")
      .to(arcs[(i - 1 + n) % n], { drawSVG: "100% 100%", duration: T, ease: "power2.inOut" }, "<")
      .fromTo(
        halos[(i + 1) % n],
        { scale: 0.5, autoAlpha: 0.9 },
        { scale: 2.6, autoAlpha: 0, duration: 0.9, ease: "power2.out", immediateRender: false },
        ">-0.08",
      )
      .to({}, { duration: D }, "<");
  };

  const master = gsap.timeline({ delay: o.delay ?? 0 });
  master.fromTo(packet, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
  // Primeiro trecho uma vez; depois o ciclo começa no trecho 1 — assim o rastro nunca "salta" na repetição.
  const intro = gsap.timeline();
  segment(intro, 0);
  master.add(intro, "<");
  const cycle = gsap.timeline({ repeat: -1 });
  for (let k = 1; k <= n; k++) segment(cycle, k % n);
  master.add(cycle);
  return master;
}
