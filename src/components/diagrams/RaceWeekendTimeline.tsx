import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./RaceWeekendTimeline.module.css";

type Day = { id: string; day: string; items: readonly string[] };
type MatrixRow = { id: string; name: string; who: string; cells: readonly (string | null)[] };

type Props = {
  label: string;
  days: readonly Day[];
  /** Dia de pico (marco e pontos em volt). */
  peakDay?: string;
  peakLabel?: string;
  matrix?: {
    label: string;
    tag?: ReactNode;
    caption?: string;
    legend?: { served: string; none: string };
    rows: readonly MatrixRow[];
  };
  /** Aprofundamento (hover/foco) de cada ponto da matriz. */
  onCellEnter?: (anchor: Element, text: string) => void;
  onCellLeave?: () => void;
  className?: string;
};

/**
 * Timeline do fim de semana de prova (SEXTA → SÁBADO → DOMINGO → PÓS-PROVA) e, opcionalmente,
 * a matriz "quem é atendido em cada momento" no mesmo grid de colunas.
 *
 * Alvos de animação (data-a): rwt-label, rwt-day (data-day), rwt-rail, rwt-node, rwt-items,
 * rwt-mx-head, rwt-mx-row, rwt-dot (data-col = índice do dia).
 */
export function RaceWeekendTimeline({ label, days, peakDay, peakLabel, matrix, onCellEnter, onCellLeave, className }: Props) {
  return (
    <div className={cn(styles.wrap, className)}>
      <p data-a="rwt-label" className={cn("t-label", styles.tlLabel)}>
        {label}
      </p>

      {days.map((d, i) => (
        <div key={d.id} data-a="rwt-day" data-day={i} className={styles.dayHead} style={{ gridColumn: i + 2 }}>
          <span className={styles.dayName}>{d.day}</span>
          {d.id === peakDay && peakLabel && <span className={styles.peakPill}>{peakLabel}</span>}
        </div>
      ))}

      <div className={styles.railRow} aria-hidden="true">
        <span data-a="rwt-rail" className={styles.rail} />
        <div className={styles.nodes}>
          {days.map((d) => (
            <span key={d.id} data-a="rwt-node" className={cn(styles.node, d.id === peakDay && styles.nodePeak)} />
          ))}
        </div>
      </div>

      {days.map((d, i) => (
        <ul
          key={d.id}
          data-a="rwt-items"
          aria-label={d.day}
          className={cn(styles.items, d.id === peakDay && styles.itemsPeak)}
          style={{ gridColumn: i + 2 }}
        >
          {d.items.map((it) => (
            <li key={it} className={styles.item}>
              {it}
            </li>
          ))}
        </ul>
      ))}

      {matrix && (
        <>
          <div data-a="rwt-mx-head" className={styles.mxHead}>
            <span className={cn("t-label", styles.mxLabel)}>{matrix.label}</span>
            {matrix.tag}
            {matrix.caption && <span className={styles.mxCaption}>{matrix.caption}</span>}
            {matrix.legend && (
              <span className={styles.mxLegend} aria-hidden="true">
                <span>
                  <i className={styles.dot} />
                  {matrix.legend.served}
                </span>
                <span>
                  <i className={styles.none} />
                  {matrix.legend.none}
                </span>
              </span>
            )}
          </div>
          {matrix.rows.map((r) => (
            <div key={r.id} data-a="rwt-mx-row" className={styles.mxRow}>
              <div className={styles.mxName}>
                <strong>{r.name}</strong>
                <span>{r.who}</span>
              </div>
              {days.map((d, i) => {
                const text = r.cells[i];
                const peak = d.id === peakDay;
                return (
                  <div key={d.id} className={styles.cell}>
                    {text ? (
                      <button
                        type="button"
                        data-a="rwt-dot"
                        data-col={i}
                        className={styles.dotBtn}
                        aria-label={`${r.name} · ${d.day}: ${text}`}
                        onMouseEnter={(e) => onCellEnter?.(e.currentTarget, text)}
                        onMouseLeave={onCellLeave}
                        onFocus={(e) => onCellEnter?.(e.currentTarget, text)}
                        onBlur={onCellLeave}
                      >
                        <i className={cn(styles.dot, peak && styles.dotPeak)} aria-hidden="true" />
                      </button>
                    ) : (
                      <i
                        data-a="rwt-dot"
                        data-col={i}
                        className={styles.none}
                        aria-label={`${r.name} · ${d.day}: ${matrix.legend?.none ?? "·"}`}
                        role="img"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
