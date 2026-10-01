"use client";

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { GrowthFront, GrowthProject } from "@/content/projects";
import { cn, r2 } from "@/lib/utils";
import styles from "./EcosystemMap.module.css";

/*
 * Mapa do portfólio de growth.
 * Prancheta de coordenadas fixas (ECO.W × ECO.H) escalada por inteiro para caber na caixa:
 * o desenho é idêntico em qualquer tela e os comprimentos dos traços (DrawSVG) nunca mudam.
 *
 * Leitura: colunas = frentes; dentro de cada coluna, quem depende fica acima de quem sustenta.
 * As dependências da Fundação correm por trilhos no rodapé (BORA ID, CRM, OS) e sobem até cada projeto.
 *
 * Alvos de animação (slide): [data-a="eco-head"], [data-a="eco-node"], [data-a="eco-edge"][data-depth],
 * [data-a="eco-dot"], [data-a="eco-rail-label"].
 */

export const ECO = {
  W: 1400,
  H: 404,
  X0: 24,
  COL_W: 194,
  GAP: 40,
  /** Corredores superiores: ponte do OS (A) e ponte para o Pipeline (B). */
  TOP_A: 36,
  TOP_B: 48,
  ROW0: 64,
  NODE_H: 32,
  PITCH: 42,
  LANE0: 370,
  LANE_GAP: 14,
} as const;

/** Ordem vertical em cada frente (topo → base): quem depende fica acima de quem sustenta. */
const ORDER: Record<GrowthFront, string[]> = {
  Fundação: ["os", "crm-tracking", "bora-id"],
  Aquisição: ["conteudo-intencao", "landing-cidade", "media", "referral", "creators", "captains", "open"],
  Distribuição: ["boost", "powered", "house"],
  Conversão: ["coaching", "pre-cadastro", "preco-unico", "challenges", "pass"],
  "Receita B2B": ["league", "enterprise"],
  Expansão: ["pipeline", "playbook", "lab"],
};

/** Trilhos da Fundação no rodapé, de cima para baixo. O BORA OS chega ao POWERED por uma ponte superior. */
const RAILS = ["bora-id", "crm-tracking"] as const;

type Pt = [number, number];
type Box = { x: number; y: number; w: number; h: number; col: number; row: number };
export type EcoEdge = { key: string; from: string; to: string; d: string; end: Pt; depth: number };

const colX = (c: number) => ECO.X0 + c * (ECO.COL_W + ECO.GAP);
const gutter = (c: number, k: 0 | 1) => colX(c) + ECO.COL_W + 12 + k * 16;
const lane = (k: number) => ECO.LANE0 + k * ECO.LANE_GAP;
const DROP = { "bora-id": 30, "crm-tracking": 46 } as Record<string, number>;
const SPINE = 16; // x do marcador de status (conectores verticais entre nós empilhados)

/** Polilinha ortogonal com cantos arredondados. */
function ortho(points: Pt[], radius = 7) {
  const pts = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
  // remove pontos colineares
  const clean = pts.filter((p, i) => {
    if (i === 0 || i === pts.length - 1) return true;
    const [a, b] = [pts[i - 1], pts[i + 1]];
    return !((a[0] === p[0] && p[0] === b[0]) || (a[1] === p[1] && p[1] === b[1]));
  });
  let d = `M${r2(clean[0][0])} ${r2(clean[0][1])}`;
  for (let i = 1; i < clean.length - 1; i++) {
    const [x0, y0] = clean[i - 1];
    const [x1, y1] = clean[i];
    const [x2, y2] = clean[i + 1];
    const d1 = Math.hypot(x1 - x0, y1 - y0);
    const d2 = Math.hypot(x2 - x1, y2 - y1);
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const ax = x1 - ((x1 - x0) / d1) * r;
    const ay = y1 - ((y1 - y0) / d1) * r;
    const bx = x1 + ((x2 - x1) / d2) * r;
    const by = y1 + ((y2 - y1) / d2) * r;
    d += ` L${r2(ax)} ${r2(ay)} Q${r2(x1)} ${r2(y1)} ${r2(bx)} ${r2(by)}`;
  }
  const last = clean[clean.length - 1];
  return `${d} L${r2(last[0])} ${r2(last[1])}`;
}

export function layoutBoxes(fronts: readonly GrowthFront[]) {
  const boxes = new Map<string, Box>();
  fronts.forEach((front, col) => {
    (ORDER[front] ?? []).forEach((id, row) => {
      boxes.set(id, { x: colX(col), y: ECO.ROW0 + row * ECO.PITCH, w: ECO.COL_W, h: ECO.NODE_H, col, row });
    });
  });
  return boxes;
}

/** Profundidade de cada projeto no grafo de dependências (0 = base). */
export function depthOf(projects: readonly GrowthProject[]) {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const memo = new Map<string, number>();
  const visit = (id: string, seen = new Set<string>()): number => {
    if (memo.has(id)) return memo.get(id)!;
    const p = byId.get(id);
    if (!p || seen.has(id)) return 0;
    seen.add(id);
    const d = p.dependsOn.length ? 1 + Math.max(...p.dependsOn.map((x) => visit(x, seen))) : 0;
    memo.set(id, d);
    return d;
  };
  projects.forEach((p) => visit(p.id));
  return memo;
}

/** Rota de cada dependência (de quem sustenta → para quem depende). */
function route(from: string, to: string, b: Map<string, Box>): Pt[] {
  const f = b.get(from)!;
  const t = b.get(to)!;
  const L = (x: Box) => x.x;
  const R = (x: Box) => x.x + x.w;
  const T = (x: Box) => x.y;
  const B = (x: Box) => x.y + x.h;
  const CY = (x: Box) => x.y + x.h / 2;

  // Mesma coluna
  if (f.col === t.col) {
    if (f.row === t.row + 1) return [[L(f) + SPINE, T(f)], [L(t) + SPINE, B(t)]];
    return [[L(f), CY(f)], [L(f) - 12, CY(f)], [L(t) - 12, CY(t)], [L(t), CY(t)]];
  }

  // BORA OS → ponte pelo corredor superior até a calha à esquerda do destino
  if (from === "os") {
    const gx = gutter(f.col, 0);
    const tx = gutter(t.col - 1, 1);
    return [[R(f), CY(f)], [gx, CY(f)], [gx, ECO.TOP_A], [tx, ECO.TOP_A], [tx, CY(t)], [L(t), CY(t)]];
  }

  // Trilhos da Fundação
  const railIdx = RAILS.indexOf(from as (typeof RAILS)[number]);
  if (railIdx >= 0) {
    const isBottom = ![...b.values()].some((x) => x.col === t.col && x.row > t.row);
    // saída do projeto da Fundação até o trilho
    const fromBottom = ![...b.values()].some((x) => x.col === f.col && x.row > f.row);
    const exit: Pt[] = fromBottom
      ? [[L(f) + (DROP[from] ?? 30), B(f)], [L(f) + (DROP[from] ?? 30), lane(railIdx)]]
      : [[R(f), CY(f)], [gutter(f.col, railIdx === 1 ? 1 : 0), CY(f)], [gutter(f.col, railIdx === 1 ? 1 : 0), lane(railIdx)]];

    // vizinhos imediatos da Fundação: derivação direta da linha vertical do CRM
    if (!fromBottom && t.col === f.col + 1 && railIdx === 1 && !isBottom) {
      const gx = gutter(f.col, 1);
      return [[R(f), CY(f)], [gx, CY(f)], [gx, CY(t)], [L(t), CY(t)]];
    }
    if (isBottom) {
      const dx = L(t) + (DROP[from] ?? 30);
      return [...exit, [dx, lane(railIdx)], [dx, B(t)]];
    }
    // projeto acima da base da coluna: sobe pela calha à esquerda
    const gx = gutter(t.col - 1, 1);
    return [...exit, [gx, lane(railIdx)], [gx, CY(t)], [L(t), CY(t)]];
  }

  // Mesma linha, colunas vizinhas
  if (f.row === t.row && t.col === f.col + 1) return [[R(f), CY(f)], [L(t), CY(t)]];

  // Destino no topo da coluna, origem mais baixa: ponte pelo corredor superior
  if (t.row === 0 && f.row > 0) {
    const gx = gutter(f.col, 0);
    const dx = L(t) + 30;
    return [[R(f), CY(f)], [gx, CY(f)], [gx, ECO.TOP_B], [dx, ECO.TOP_B], [dx, T(t)]];
  }

  // Demais: sai pela direita, corre pela linha da origem e muda de linha na calha à esquerda do destino.
  // Colunas vizinhas usam a faixa interna da calha; saltos maiores, a externa (as verticais não se sobrepõem).
  const gx = gutter(t.col - 1, t.col - f.col === 1 ? 0 : 1);
  return [[R(f), CY(f)], [gx, CY(f)], [gx, CY(t)], [L(t), CY(t)]];
}

export function buildEdges(projects: readonly GrowthProject[], fronts: readonly GrowthFront[]) {
  const boxes = layoutBoxes(fronts);
  const depth = depthOf(projects);
  const edges: EcoEdge[] = [];
  for (const p of projects) {
    for (const dep of p.dependsOn) {
      if (!boxes.has(dep) || !boxes.has(p.id)) continue;
      const pts = route(dep, p.id, boxes);
      edges.push({ key: `${dep}>${p.id}`, from: dep, to: p.id, d: ortho(pts), end: pts[pts.length - 1], depth: depth.get(dep) ?? 0 });
    }
  }
  return { boxes, edges };
}

/** Cadeia de dependências: ancestrais (o que sustenta) e descendentes (o que destrava). */
export function chainOf(id: string, projects: readonly GrowthProject[]) {
  const deps = new Map(projects.map((p) => [p.id, p.dependsOn]));
  const users = new Map<string, string[]>();
  projects.forEach((p) => p.dependsOn.forEach((d) => users.set(d, [...(users.get(d) ?? []), p.id])));
  const walk = (start: string, next: (x: string) => string[]) => {
    const out = new Set<string>();
    const stack = [...next(start)];
    while (stack.length) {
      const x = stack.pop()!;
      if (out.has(x)) continue;
      out.add(x);
      stack.push(...next(x));
    }
    return out;
  };
  return { up: walk(id, (x) => deps.get(x) ?? []), down: walk(id, (x) => users.get(x) ?? []) };
}

type Props = {
  projects: readonly GrowthProject[];
  fronts: readonly GrowthFront[];
  names: Record<string, string>;
  railLabels: Record<string, string>;
  ariaLabel: string;
  /** Ação em foco (hover ou seleção), no modo explorar. */
  focus: string | null;
  selected: string | null;
  mode: "explore" | "build";
  /** Modo montar: projetos ligados e dependências em aberto. */
  active: ReadonlySet<string>;
  missing: ReadonlySet<string>;
  missingTag: string;
  stateLabels: { on: string; off: string };
  /** Loops CSS (tracejado das dependências em aberto) só com o slide em cena e sem movimento reduzido. */
  animate?: boolean;
  onHover: (id: string | null) => void;
  onActivate: (id: string) => void;
  className?: string;
};

export function EcosystemMap({
  projects,
  fronts,
  names,
  railLabels,
  ariaLabel,
  focus,
  selected,
  mode,
  active,
  missing,
  missingTag,
  stateLabels,
  animate = true,
  onHover,
  onActivate,
  className,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ s: 1, y: 0 });
  const { boxes, edges } = useMemo(() => buildEdges(projects, fronts), [projects, fronts]);
  const byId = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      // A margem esquerda (ECO.X0) guarda o colchete ID → OS e pode avançar sobre o respiro do slide.
      const s = Math.min(w / (ECO.W - ECO.X0), h / ECO.H);
      setFit({ s, y: Math.max(0, (h - ECO.H * s) / 2) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const build = mode === "build";
  const chain = useMemo(() => (focus && !build ? chainOf(focus, projects) : null), [focus, build, projects]);

  const nodeState = (id: string) => {
    if (!chain || !focus) return "idle";
    if (id === focus) return "focus";
    if (chain.up.has(id)) return "up";
    if (chain.down.has(id)) return "down";
    return "dim";
  };
  const edgeState = (e: EcoEdge) => {
    if (!chain || !focus) return "idle";
    if (e.to === focus || chain.up.has(e.to)) return "up";
    if (e.from === focus || chain.down.has(e.from)) return "down";
    return "dim";
  };
  const edgeSim = (e: EcoEdge) => {
    if (!build) return undefined;
    const a = active.has(e.from);
    const b = active.has(e.to);
    if (a && b) return "on";
    if (b && !a) return "missing";
    return "off";
  };
  const highlighted = edges.filter((e) => {
    const st = edgeState(e);
    return st === "up" || st === "down";
  });
  const missingEdges = build ? edges.filter((e) => edgeSim(e) === "missing") : [];

  const frontCount = (front: GrowthFront) => {
    const ids = ORDER[front] ?? [];
    return { total: ids.length, on: ids.filter((id) => active.has(id)).length };
  };

  // Rótulos dos trilhos, no início de cada um (BORA ID sob a Fundação; CRM logo após a calha).
  const railTags = RAILS.map((id, k) => {
    const src = boxes.get(id);
    if (!src) return null;
    const startX = k === 0 ? src.x + (DROP[id] ?? 30) : gutter(src.col, 1);
    return { id, x: startX + 10, y: k === 0 ? lane(k) - 6 : lane(k) + 13 };
  });

  return (
    <div ref={boxRef} className={cn(styles.box, className)}>
      <div
        className={cn(styles.artboard, build && styles.isBuild, chain && styles.hasFocus, !animate && styles.isStill)}
        style={{ width: ECO.W, height: ECO.H, transform: `translate(${r2(-ECO.X0 * fit.s)}px, ${r2(fit.y)}px) scale(${fit.s})`, "--s": fit.s } as CSSProperties}
        role="group"
        aria-label={ariaLabel}
      >
        <svg className={styles.svg} width={ECO.W} height={ECO.H} viewBox={`0 0 ${ECO.W} ${ECO.H}`} aria-hidden="true">
          <g>
            {edges.map((e) => (
              <path
                key={e.key}
                d={e.d}
                data-a="eco-edge"
                data-depth={e.depth}
                data-state={edgeState(e)}
                data-sim={edgeSim(e)}
                className={styles.edge}
              />
            ))}
          </g>
          {/* Camada de destaque: cópias por cima (não animadas pela timeline), com traço que corre da origem. */}
          <g>
            {highlighted.map((e) => (
              <path key={`${focus}-${e.key}`} d={e.d} pathLength={1} data-state={edgeState(e)} className={styles.trace} />
            ))}
            {missingEdges.map((e) => (
              <path key={`m-${e.key}`} d={e.d} className={styles.missingEdge} />
            ))}
          </g>
          <g>
            {edges.map((e) => (
              <circle
                key={e.key}
                cx={e.end[0]}
                cy={e.end[1]}
                r={2.6}
                data-a="eco-dot"
                data-state={edgeState(e)}
                data-sim={edgeSim(e)}
                className={styles.dot}
              />
            ))}
          </g>

        </svg>

        {/* Rótulos dos trilhos em HTML (texto SVG dentro da prancheta escalada podia ficar com a pintura defasada). */}
        {railTags.map(
          (r) =>
            r && (
              <span key={r.id} data-a="eco-rail-label" className={styles.railLabel} style={{ left: r.x, top: r.y - 9 }}>
                {railLabels[r.id]}
              </span>
            ),
        )}

        {fronts.map((front, col) => {
          const { on, total } = frontCount(front);
          return (
            <div key={front} data-a="eco-head" className={styles.head} style={{ left: colX(col), width: ECO.COL_W }}>
              <span className={styles.headText}>
                <span className="t-label">{front}</span>
                <span className={cn("t-mono", styles.headCount)}>{build ? `${on}/${total}` : total}</span>
              </span>
              <span className={styles.headRule} aria-hidden="true">
                <span className={styles.headFill} style={{ transform: `scaleX(${build ? on / Math.max(1, total) : 0})` }} />
              </span>
            </div>
          );
        })}

        {[...boxes.entries()].map(([id, box]) => {
          const p = byId.get(id);
          if (!p) return null;
          const name = names[id] ?? p.name;
          const sim = build ? (active.has(id) ? "on" : missing.has(id) ? "missing" : "off") : undefined;
          return (
            <button
              key={id}
              type="button"
              data-a="eco-node"
              data-id={id}
              className={styles.node}
              style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
              onMouseEnter={() => onHover(id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(id)}
              onBlur={() => onHover(null)}
              onClick={() => onActivate(id)}
              aria-pressed={build ? active.has(id) : selected === id}
              aria-label={build ? `${p.name}: ${active.has(id) ? stateLabels.on : stateLabels.off}` : `${p.name} · ${p.front}`}
            >
              <span className={styles.nodeInner} data-stage={p.stage} data-core={p.core ? "true" : undefined} data-state={nodeState(id)} data-sim={sim}>
                <span className={styles.mark} aria-hidden="true" />
                <span className={styles.name}>{name}</span>
                {sim === "missing" && <span className={styles.missingTag}>{missingTag}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
