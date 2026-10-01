import { cn, r2 } from "@/lib/utils";
import styles from "./ChallengeRoutes.module.css";

/**
 * Rotas de prova até um mesmo ponto de chegada (ex.: OPEN → 5K → 10K → COACHING e CLUBE → 21K → COACHING).
 * Desenhadas como percursos (curvas suaves, como um traçado de GPS), não como fluxograma.
 *
 * Alvos de animação (data-a): route-path (com data-route="a|b"), route-stop, route-label, route-name,
 * route-finish, route-finish-label, route-finish-pulse, route-runner (pontos em cx=cy=0, para MotionPath; data-route indica a rota).
 * Os corredores ficam invisíveis até o slide animá-los.
 */

export const ROUTES_VIEW = { w: 1200, h: 330 } as const;
const FINISH: Pt = [1110, 168];

type Pt = readonly [number, number];
type RouteGeom = { points: readonly Pt[]; stops: readonly number[]; side: "above" | "below" };

/** Geometria das duas rotas: pontos do traçado e índices das paradas (o último ponto é a chegada). */
export const ROUTE_GEOMETRY: Record<"a" | "b", RouteGeom> = {
  a: {
    points: [[48, 70], [220, 38], [392, 88], [560, 114], [736, 62], [930, 96], FINISH],
    stops: [0, 2, 4],
    side: "above",
  },
  b: {
    points: [[48, 268], [240, 292], [420, 248], [604, 228], [800, 282], [972, 238], FINISH],
    stops: [0, 3],
    side: "below",
  },
};

/** Curva suave (Catmull-Rom → Bézier) passando por todos os pontos. */
function smoothPath(points: readonly Pt[]) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r2(c1[0])},${r2(c1[1])} ${r2(c2[0])},${r2(c2[1])} ${p2[0]},${p2[1]}`;
  }
  return d;
}

type Route = { id: "a" | "b"; name: string; stops: readonly string[] };

type Props = {
  routes: readonly Route[];
  finish: { label: string; caption: string };
  /** Corredores por rota (pontos animados pelo slide). */
  runners?: number;
  className?: string;
};

const pctX = (x: number) => `${r2((x / ROUTES_VIEW.w) * 100)}%`;
const pctY = (y: number) => `${r2((y / ROUTES_VIEW.h) * 100)}%`;

export function ChallengeRoutes({ routes, finish, runners = 7, className }: Props) {
  return (
    <div className={cn(styles.routes, className)}>
      <svg viewBox={`0 0 ${ROUTES_VIEW.w} ${ROUTES_VIEW.h}`} className={styles.svg} aria-hidden="true" focusable="false">
        {routes.map((r) => (
          <path key={r.id} data-a="route-path" data-route={r.id} className={styles.path} d={smoothPath(ROUTE_GEOMETRY[r.id].points)} />
        ))}
        {routes.map((r) =>
          Array.from({ length: runners }, (_, i) => (
            <circle key={`${r.id}-${i}`} data-a="route-runner" data-route={r.id} className={styles.runner} cx={0} cy={0} r={5} />
          )),
        )}
        {routes.map((r) =>
          ROUTE_GEOMETRY[r.id].stops.map((si, k) => {
            const [x, y] = ROUTE_GEOMETRY[r.id].points[si];
            return (
              <circle
                key={`${r.id}-stop-${k}`}
                data-a="route-stop"
                className={cn(styles.stop, k === 0 && styles.start)}
                cx={x}
                cy={y}
                r={k === 0 ? 6.5 : 6}
              />
            );
          }),
        )}
        <circle data-a="route-finish-pulse" className={styles.finishPulse} cx={FINISH[0]} cy={FINISH[1]} r={12} />
        <g data-a="route-finish">
          <circle className={styles.finishHalo} cx={FINISH[0]} cy={FINISH[1]} r={22} />
          <circle className={styles.finish} cx={FINISH[0]} cy={FINISH[1]} r={11} />
        </g>
      </svg>

      {routes.map((r) => {
        const g = ROUTE_GEOMETRY[r.id];
        return r.stops.map((label, k) => {
          const [x, y] = g.points[g.stops[k]];
          return (
            <div
              key={`${r.id}-label-${k}`}
              data-a="route-label"
              className={cn(styles.label, g.side === "above" ? styles.above : styles.below, k === 0 && styles.labelStart)}
              style={{ left: pctX(x), top: pctY(y) }}
            >
              {k === 0 && (
                <span data-a="route-name" className={styles.routeName}>
                  {r.name}
                </span>
              )}
              <span className={styles.stopName}>{label}</span>
            </div>
          );
        });
      })}

      <div data-a="route-finish-label" className={styles.finishLabel} style={{ top: pctY(FINISH[1] + 28) }}>
        <span className={styles.finishName}>{finish.label}</span>
        <span className={styles.finishCaption}>{finish.caption}</span>
      </div>
    </div>
  );
}
