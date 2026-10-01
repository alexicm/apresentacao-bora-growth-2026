import type { CSSProperties } from "react";
import { BoraShield } from "@/components/brand/BoraMark";
import type { Stage } from "@/content/projects";
import { cn } from "@/lib/utils";
import styles from "./MetroRoutes.module.css";

/**
 * Geometria do mapa (viewBox). Duas linhas horizontais (A em cima, B embaixo) que dobram a 45°
 * até a estação de integração e seguem em paralelo até o terminal.
 */
export const METRO = {
  w: 1200,
  h: 430,
  badgeX: 34,
  bend: 760,
  a: { y: 110, xs: [110, 300, 490, 680] },
  b: { y: 350, xs: [110, 255, 400, 545, 690] },
  unit: { x: 875, y: 230 },
  city: { x: 1100, y: 230, r: 30 },
  /** Separação entre as duas linhas no tronco compartilhado. */
  trunk: 5,
  /** Estação de onde sai cada saída tracejada (índice na linha). */
  exitFrom: { a: 1, b: 3 },
} as const;

const { a: A, b: B, unit: U, city: C, bend, trunk } = METRO;
const ya = U.y - trunk;
const yb = U.y + trunk;
const exA = A.xs[METRO.exitFrom.a];
const exB = B.xs[METRO.exitFrom.b];

/** Caminhos SVG (desenho e trajetos dos pontos animados). */
export const METRO_PATHS = {
  a: `M${METRO.badgeX} ${A.y} H${bend} L${U.x} ${ya}`,
  b: `M${METRO.badgeX} ${B.y} H${bend} L${U.x} ${yb}`,
  trunkA: `M${U.x} ${ya} H${C.x}`,
  trunkB: `M${U.x} ${yb} H${C.x}`,
  exitA: `M${exA} ${A.y} V${A.y + 28} Q${exA} ${A.y + 60} ${exA + 32} ${A.y + 60} H${exA + 52}`,
  exitB: `M${exB} ${B.y} V${B.y - 28} Q${exB} ${B.y - 60} ${exB + 32} ${B.y - 60} H${exB + 52}`,
  flowA: `M${A.xs[0]} ${A.y} H${bend} L${U.x} ${ya} H${C.x}`,
  flowB: `M${B.xs[0]} ${B.y} H${bend} L${U.x} ${yb} H${C.x}`,
  flowExitA: `M${A.xs[0]} ${A.y} H${exA} V${A.y + 28} Q${exA} ${A.y + 60} ${exA + 32} ${A.y + 60} H${exA + 58}`,
  flowExitB: `M${B.xs[0]} ${B.y} H${exB} V${B.y - 28} Q${exB} ${B.y - 60} ${exB + 32} ${B.y - 60} H${exB + 58}`,
} as const;

/** Comprimento da linha até a integração — usado para sincronizar estações com o traço. */
export const METRO_LENGTH = bend - METRO.badgeX + (U.x - bend) * Math.SQRT2;
/** Fração do traço em que a linha alcança `x` (trecho horizontal). */
export const metroAt = (x: number) => (x - METRO.badgeX) / METRO_LENGTH;

/** Pontos animados (comunidades/cidades percorrendo o pipeline). */
export const METRO_DOTS = 8;

const pos = (x: number, y: number): CSSProperties => ({
  left: `${(x / METRO.w) * 100}%`,
  top: `${(y / METRO.h) * 100}%`,
});

type Route = { badge: string; kind: string; stations: readonly string[] };
/** Estágio da ação por trás de cada estação (null = etapa da rota, sem ação própria). */
type RouteStages = readonly (Stage | null)[];

type Props = {
  routeA: Route;
  routeB: Route;
  unit: string;
  city: string;
  exits: { a: string; b: readonly string[] };
  /** Descrição completa do mapa para leitores de tela (vem do conteúdo do slide). */
  ariaLabel: string;
  /** Estágio de cada estação: volt = Fase 1 · contorno = Fase 2 · tracejado = ideia · contorno claro = etapa da rota. */
  stagesA?: RouteStages;
  stagesB?: RouteStages;
  /** Legenda dos estágios das estações (canto superior direito, área livre do mapa). */
  legend?: { agora: string; depois?: string; ideia: string; step: string };
  className?: string;
};

/**
 * Alvos de animação (data-a): line-a, line-b, trunk, st-a, st-b, lb-a, lb-b, badge-a, badge-b, kind-a, kind-b,
 * unit, unit-label, city, city-label, city-mark, exit, exit-end, exit-text, pulse, pulse-loop, dot, legend (+ data-path nos trajetos).
 */
export function MetroRoutes({ routeA, routeB, unit, city, exits, ariaLabel, stagesA, stagesB, legend, className }: Props) {
  const stClass = (st: Stage | null | undefined) => (st ? styles[`st_${st}`] : stagesA || stagesB ? styles.st_none : undefined);
  return (
    <div
      className={cn(styles.box, className)}
      style={{ "--metro-ratio": `${METRO.w} / ${METRO.h}` } as CSSProperties}
      role="img"
      aria-label={ariaLabel}
    >
      <svg className={styles.svg} viewBox={`0 0 ${METRO.w} ${METRO.h}`} aria-hidden="true" focusable="false">
        {/* trajetos invisíveis para os pontos */}
        <path data-path="flowA" className={styles.motion} d={METRO_PATHS.flowA} />
        <path data-path="flowB" className={styles.motion} d={METRO_PATHS.flowB} />
        <path data-path="flowExitA" className={styles.motion} d={METRO_PATHS.flowExitA} />
        <path data-path="flowExitB" className={styles.motion} d={METRO_PATHS.flowExitB} />

        {/* saídas legítimas (tracejado = opcional) */}
        <path data-a="exit" className={cn(styles.exit, styles.exitA)} d={METRO_PATHS.exitA} />
        <path data-a="exit" className={cn(styles.exit, styles.exitB)} d={METRO_PATHS.exitB} />
        <circle data-a="exit-end" className={cn(styles.terminus, styles.terminusA)} cx={exA + 58} cy={A.y + 60} r={5} />
        <circle data-a="exit-end" className={cn(styles.terminus, styles.terminusB)} cx={exB + 58} cy={B.y - 60} r={5} />

        {/* tronco compartilhado */}
        <path data-a="trunk" className={cn(styles.line, styles.lineA)} d={METRO_PATHS.trunkA} />
        <path data-a="trunk" className={cn(styles.line, styles.lineB)} d={METRO_PATHS.trunkB} />

        {/* linhas */}
        <path data-a="line-a" className={cn(styles.line, styles.lineA)} d={METRO_PATHS.a} />
        <path data-a="line-b" className={cn(styles.line, styles.lineB)} d={METRO_PATHS.b} />

        {A.xs.map((x, i) => (
          <circle key={x} data-a="st-a" className={cn(styles.station, styles.stationA, stClass(stagesA?.[i]))} cx={x} cy={A.y} r={9} />
        ))}
        {B.xs.map((x, i) => (
          <circle key={x} data-a="st-b" className={cn(styles.station, styles.stationB, stClass(stagesB?.[i]))} cx={x} cy={B.y} r={9} />
        ))}

        {/* integração: Unidade BORA */}
        <rect data-a="unit" className={styles.unit} x={U.x - 13} y={U.y - 22} width={26} height={44} rx={13} />

        {/* terminal: Cidade BORA */}
        <circle data-a="pulse" className={styles.pulse} cx={C.x} cy={C.y} r={C.r} />
        <circle data-a="pulse-loop" className={styles.pulse} cx={C.x} cy={C.y} r={C.r} />
        <circle data-a="city" className={styles.city} cx={C.x} cy={C.y} r={C.r} />

        {Array.from({ length: METRO_DOTS }, (_, i) => (
          <circle key={i} data-a="dot" className={styles.dot} cx={0} cy={0} r={5.5} />
        ))}
      </svg>

      {/* Rótulos (texto real) */}
      <span data-a="badge-a" className={cn(styles.label, styles.badge, styles.badgeA)} style={pos(METRO.badgeX, A.y)} aria-hidden="true">
        {routeA.badge}
      </span>
      <span data-a="badge-b" className={cn(styles.label, styles.badge, styles.badgeB)} style={pos(METRO.badgeX, B.y)} aria-hidden="true">
        {routeB.badge}
      </span>
      <span data-a="kind-a" className={cn(styles.label, "t-label", styles.kind, styles.kindA)} style={pos(METRO.badgeX - 16, A.y + 34)}>
        {routeA.kind}
      </span>
      <span data-a="kind-b" className={cn(styles.label, "t-label", styles.kind, styles.kindB)} style={pos(METRO.badgeX - 16, B.y - 34)}>
        {routeB.kind}
      </span>

      {routeA.stations.map((s, i) => (
        <span key={s} data-a="lb-a" className={cn(styles.label, styles.above)} style={pos(A.xs[i], A.y - 22)}>
          <span className={cn(styles.stationName, styles.wrap)}>{s}</span>
        </span>
      ))}
      {routeB.stations.map((s, i) => (
        <span key={s} data-a="lb-b" className={cn(styles.label, styles.below)} style={pos(B.xs[i], B.y + 22)}>
          <span className={cn(styles.stationName, styles.wrap)}>{s}</span>
        </span>
      ))}

      <span data-a="unit-label" className={cn(styles.label, styles.rightUp)} style={pos(U.x + 22, U.y - 22)}>
        <span className={styles.unitName}>{unit}</span>
      </span>
      <span data-a="city-label" className={cn(styles.label, styles.below)} style={pos(C.x, C.y + C.r + 14)}>
        <span className={styles.cityName}>{city}</span>
      </span>
      <span data-a="city-mark" className={styles.cityMark} style={pos(C.x, C.y)} aria-hidden="true">
        <BoraShield className="block h-auto w-full" title="" />
      </span>

      <span data-a="exit-text" className={cn(styles.label, styles.right)} style={pos(exA + 72, A.y + 60)}>
        <span className={styles.exitText}>{exits.a}</span>
      </span>
      <span data-a="exit-text" className={cn(styles.label, styles.right)} style={pos(exB + 72, B.y - 60)}>
        {exits.b.map((line) => (
          <span key={line} className={styles.exitText}>
            {line}
          </span>
        ))}
      </span>

      {legend && (
        <ul data-a="legend" className={styles.legend} style={pos(METRO.w, 6)}>
          <li>
            <i className={cn(styles.swatch, styles.swAgora)} aria-hidden="true" />
            {legend.agora}
          </li>
          {legend.depois && (
            <li>
              <i className={styles.swatch} aria-hidden="true" />
              {legend.depois}
            </li>
          )}
          <li>
            <i className={cn(styles.swatch, styles.swIdeia)} aria-hidden="true" />
            {legend.ideia}
          </li>
          <li>
            <i className={cn(styles.swatch, styles.swNone)} aria-hidden="true" />
            {legend.step}
          </li>
        </ul>
      )}
    </div>
  );
}
