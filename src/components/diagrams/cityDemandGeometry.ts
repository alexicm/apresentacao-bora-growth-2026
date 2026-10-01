// Geometria da cidade abstrata do BORA CAPTAINS — determinística (mesmo resultado em qualquer render).
// Plano radial-concêntrico (um aceno ao traçado de Goiânia, sem ser um mapa real):
// bairros = células de Voronoi suavizadas; avenidas radiais e anel viário = arestas de Voronoi que correm nos vãos.
import { r2, seeded } from "@/lib/utils";

export type Pt = readonly [number, number];

export const CITY_W = 800;
export const CITY_H = 760;
/** Recorte visível (justo em torno do contorno da cidade). */
export const VIEW = { x: 36, y: 30, w: 728, h: 704 } as const;
const CX = 400;
const CY = 382;

const rnd = seeded(7);
const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (deg: number, r: number): Pt => [CX + r * Math.cos(rad(deg)), CY + r * Math.sin(rad(deg))];
const toPath = (poly: readonly Pt[]) => `M${poly.map(([x, y]) => `${r2(x)} ${r2(y)}`).join("L")}Z`;
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ── Contorno convexo da cidade ─────────────────────────────────────────
const OUTLINE: Pt[] = Array.from({ length: 72 }, (_, i) => {
  const t = (i / 72) * Math.PI * 2;
  const k = 1 + 0.03 * Math.cos(2 * t + 0.6) + 0.02 * Math.cos(3 * t + 1.9);
  return [CX + 356 * k * Math.cos(t), CY + 342 * k * Math.sin(t)] as Pt;
});

// ── Sítios: centro + anel interno (5) + anel externo (10), simétricos em torno das avenidas ──
const AVENUES = [-90, -18, 54, 126, 198];
type Site = { ring: number; p: Pt };
const SITES: Site[] = [{ ring: 0, p: [CX + 6, CY - 4] }];
AVENUES.forEach((a) =>
  SITES.push({
    ring: 1,
    p: polar(a + 36 + (rnd() - 0.5) * 10, 150 + (rnd() - 0.5) * 30),
  }),
);
AVENUES.forEach((a) => {
  SITES.push({
    ring: 2,
    p: polar(a - 18 + (rnd() - 0.5) * 7, 288 + (rnd() - 0.5) * 34),
  });
  SITES.push({
    ring: 2,
    p: polar(a + 18 + (rnd() - 0.5) * 7, 288 + (rnd() - 0.5) * 34),
  });
});

// ── Voronoi por recorte de semiplanos (n pequeno → simples e robusto) ───
function clipHalf(poly: Pt[], a: Pt, b: Pt): Pt[] {
  const nx = b[0] - a[0];
  const ny = b[1] - a[1];
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const dp = (p[0] - mx) * nx + (p[1] - my) * ny;
    const dq = (q[0] - mx) * nx + (q[1] - my) * ny;
    if (dp <= 0) out.push(p);
    if (dp <= 0 !== dq <= 0) {
      const t = dp / (dp - dq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return out;
}
const centroidOf = (poly: readonly Pt[]): Pt => {
  let x = 0;
  let y = 0;
  for (const p of poly) {
    x += p[0];
    y += p[1];
  }
  return [x / poly.length, y / poly.length];
};
function inset(poly: readonly Pt[], g: number): Pt[] {
  const c = centroidOf(poly);
  return poly.map(([x, y]) => {
    const dx = x - c[0];
    const dy = y - c[1];
    const k = Math.max(0, 1 - g / Math.hypot(dx, dy));
    return [c[0] + dx * k, c[1] + dy * k] as Pt;
  });
}
function chaikin(poly: readonly Pt[], n: number): Pt[] {
  let p: Pt[] = [...poly];
  for (let k = 0; k < n; k++) {
    const o: Pt[] = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i];
      const b = p[(i + 1) % p.length];
      o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    p = o;
  }
  return p;
}
function inside(poly: readonly Pt[], [x, y]: Pt) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Aresta de Voronoi entre os sítios i e j (ou null se não forem vizinhos). */
function edge(i: number, j: number): [Pt, Pt] | null {
  const a = SITES[i].p;
  const b = SITES[j].p;
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const d: Pt = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
  let t0 = -2000;
  let t1 = 2000;
  const cons = (n: Pt, c: number) => {
    const k = n[0] * d[0] + n[1] * d[1];
    const v = c - (n[0] * m[0] + n[1] * m[1]);
    if (Math.abs(k) < 1e-9) {
      if (v < 0) t1 = t0 - 1;
      return;
    }
    if (k > 0) t1 = Math.min(t1, v / k);
    else t0 = Math.max(t0, v / k);
  };
  for (let q = 0; q < OUTLINE.length; q++) {
    const p = OUTLINE[q];
    const r = OUTLINE[(q + 1) % OUTLINE.length];
    let n: Pt = [r[1] - p[1], -(r[0] - p[0])];
    if (n[0] * (CX - p[0]) + n[1] * (CY - p[1]) > 0) n = [-n[0], -n[1]];
    cons(n, n[0] * p[0] + n[1] * p[1]);
  }
  SITES.forEach((s, k) => {
    if (k === i || k === j) return;
    const n: Pt = [s.p[0] - a[0], s.p[1] - a[1]];
    cons(n, n[0] * ((a[0] + s.p[0]) / 2) + n[1] * ((a[1] + s.p[1]) / 2));
  });
  if (t1 - t0 < 1) return null;
  return [
    [m[0] + t0 * d[0], m[1] + t0 * d[1]],
    [m[0] + t1 * d[0], m[1] + t1 * d[1]],
  ];
}

// ── Bairros ─────────────────────────────────────────────────────────────
export type Cell = {
  index: number;
  ring: number;
  centroid: Pt;
  /** Caminho suavizado (o bairro desenhado). */
  d: string;
  /** Polígono interno para sortear pontos sem encostar na rua. */
  core: Pt[];
  /** Raio aproximado (para escalas). */
  radius: number;
};

const rawCells = SITES.map((s, i) => {
  let poly = [...OUTLINE];
  SITES.forEach((o, j) => {
    if (j !== i) poly = clipHalf(poly, s.p, o.p);
  });
  return { site: s, poly };
});

export const CELLS: Cell[] = rawCells.map((c, i) => {
  const centroid = centroidOf(c.poly);
  const radius = Math.min(...c.poly.map((p) => dist(p, centroid)));
  return {
    index: i,
    ring: c.site.ring,
    centroid: [r2(centroid[0]), r2(centroid[1])],
    d: toPath(chaikin(inset(c.poly, 7), 3)),
    core: inset(c.poly, 16),
    radius,
  };
});

export const OUTLINE_PATH = toPath(OUTLINE);

// ── Avenidas radiais e anel viário (arestas que correm nos vãos) ────────
const angleOf = (p: Pt) => (Math.atan2(p[1] - CY, p[0] - CX) * 180) / Math.PI;
const angDiff = (x: number, y: number) => ((x - y + 540) % 360) - 180;
const aveSegs: Array<{ ave: number; seg: [Pt, Pt] }> = [];
const ringPts: Pt[] = [];
for (let i = 0; i < SITES.length; i++) {
  for (let j = i + 1; j < SITES.length; j++) {
    const e = edge(i, j);
    if (!e) continue;
    const ri = SITES[i].ring;
    const rj = SITES[j].ring;
    const mid: Pt = [(e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2];
    if (ri === rj && ri > 0) {
      const ave = AVENUES.findIndex((a) => Math.abs(angDiff(angleOf(mid), a)) < 10);
      if (ave >= 0) aveSegs.push({ ave, seg: e });
    }
    if (ri + rj === 3 && ri * rj === 2) ringPts.push(e[0], e[1]);
  }
}

/** Uma avenida por ângulo: do vão do centro até o contorno (polilinha, com as pequenas quebras do traçado). */
export const AVENUE_PATHS: string[] = AVENUES.map((_, k) => {
  const pts = aveSegs
    .filter((s) => s.ave === k)
    .flatMap((s) => s.seg)
    .sort((p, q) => dist(p, [CX, CY]) - dist(q, [CX, CY]));
  return `M${pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join("L")}`;
});

/** Anel viário: pontos das arestas anel interno × externo, ordenados por ângulo e suavizados. */
export const RING_PATH = (() => {
  const sorted = [...ringPts].sort((p, q) => angleOf(p) - angleOf(q));
  const dedup: Pt[] = [];
  for (const p of sorted) if (!dedup.some((q) => dist(p, q) < 6)) dedup.push(p);
  return toPath(chaikin(dedup, 2));
})();

// ── Capitães, corredores, empresas e hub ────────────────────────────────
/** Ordem em que os capitães entram (o simulador acrescenta na mesma ordem). */
const SLOT_CELLS = [4, 3, 8, 1, 12, 14, 10, 6];
/** Atração relativa de cada bairro (ilustrativa) — calibrada para o exemplo: 52 / 46 / 26 IDs. */
export const SLOT_PULL = [1.31, 1.16, 0.65, 0.95, 1.05, 0.8, 1.2, 0.85];
export const MAX_DOTS = 40;

function gauss() {
  const u = Math.max(1e-6, rnd());
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export type Slot = {
  cell: number;
  letter: string;
  at: Pt;
  pull: number;
  /** Até MAX_DOTS posições, da mais próxima à mais distante do capitão. */
  dots: Pt[];
  /** Ponto de origem de cada corredor (para a animação de "chegada" à comunidade). */
  from: Pt[];
  halo: number;
};

export const SLOTS: Slot[] = SLOT_CELLS.map((ci, s) => {
  const cell = CELLS[ci];
  const at = cell.centroid;
  const sd = cell.radius * 0.42;
  const dots: Pt[] = [];
  let guard = 0;
  while (dots.length < MAX_DOTS && guard++ < 6000) {
    const p: Pt = [at[0] + gauss() * sd, at[1] + gauss() * sd];
    if (!inside(cell.core, p) || dist(p, at) < 13) continue;
    if (dots.some((q) => dist(p, q) < 8.5)) continue;
    dots.push([r2(p[0]), r2(p[1])]);
  }
  dots.sort((p, q) => dist(p, at) - dist(q, at));
  const from = dots.map(() => polar(rnd() * 360, 120 + rnd() * 210)).map(([x, y]) => [r2(x), r2(y)] as Pt);
  const halo = Math.max(...dots.slice(0, 30).map((p) => dist(p, at))) + 12;
  // Letras na ordem em que os capitães entram: A, B, C… (fácil de citar ao vivo).
  return {
    cell: ci,
    letter: String.fromCharCode(65 + s),
    at,
    pull: SLOT_PULL[s],
    dots,
    from,
    halo: r2(halo),
  };
});

/** Corredores espalhados pela cidade (um por bairro sem capitão). */
export const SCATTER: Pt[] = CELLS.filter((c) => !SLOT_CELLS.slice(0, 3).includes(c.index)).map((c) => {
  for (let k = 0; k < 200; k++) {
    const p: Pt = [c.centroid[0] + (rnd() - 0.5) * c.radius * 1.2, c.centroid[1] + (rnd() - 0.5) * c.radius * 1.2];
    if (inside(c.core, p)) return [r2(p[0]), r2(p[1])] as Pt;
  }
  return c.centroid;
});

/** Empresas testando programas (até 3, perto dos três primeiros capitães). */
export const COMPANIES: Array<{ p: Pt; slot: number }> = [0, 1, 2].map((s) => {
  const slot = SLOTS[s];
  const cell = CELLS[slot.cell];
  for (let k = 0; k < 400; k++) {
    const a = rnd() * Math.PI * 2;
    const r = 40 + rnd() * 18;
    const p: Pt = [slot.at[0] + Math.cos(a) * r, slot.at[1] + Math.sin(a) * r];
    if (!inside(cell.core, p)) continue;
    if (slot.dots.slice(0, 30).some((q) => dist(p, q) < 11)) continue;
    return { p: [r2(p[0]), r2(p[1])] as Pt, slot: s };
  }
  return { p: [slot.at[0] + 30, slot.at[1] - 30] as Pt, slot: s };
});

/** O BORA HUB nasce na avenida entre os dois bairros que passam do limiar. */
export const HUB: Pt = (() => {
  const e = edge(SLOT_CELLS[0], SLOT_CELLS[1]);
  if (!e) return [CX, CY];
  return [r2((e[0][0] + e[1][0]) / 2), r2((e[0][1] + e[1][1]) / 2)];
})();

/** Posição em % do quadro (para rótulos HTML sobre o SVG). */
export const pct = ([x, y]: Pt) => ({
  left: `${((x - VIEW.x) / VIEW.w) * 100}%`,
  top: `${((y - VIEW.y) / VIEW.h) * 100}%`,
});
