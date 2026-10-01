import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Column<R> = {
  key: string;
  label: string;
  render?: (row: R) => ReactNode;
  align?: "left" | "right" | "center";
  /** Números: fonte mono tabular. */
  mono?: boolean;
  className?: string;
};

type Props<R> = {
  columns: Column<R>[];
  rows: readonly R[];
  caption?: string;
  /** Coluna em destaque (ex.: a proposta). */
  highlightKey?: string;
  rowKey?: (row: R, i: number) => string;
  className?: string;
  dense?: boolean;
};

/**
 * Tabela editorial: cabeçalho em rótulo, linhas finas, sem zebra.
 * Cada <tr> recebe a classe `dt-row` (alvo para revelar linha a linha com GSAP).
 */
export function DataTable<R extends Record<string, unknown>>({ columns, rows, caption, highlightKey, rowKey, className, dense }: Props<R>) {
  return (
    <table className={cn("data-table", dense && "data-table--dense", className)}>
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              scope="col"
              className={cn("t-label", c.align === "right" && "text-right", c.align === "center" && "text-center", c.key === highlightKey && "is-hl", c.className)}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={rowKey ? rowKey(row, i) : i} className="dt-row">
            {columns.map((c, ci) => {
              const content = c.render ? c.render(row) : (row[c.key] as ReactNode);
              const Cell = ci === 0 ? "th" : "td";
              return (
                <Cell
                  key={c.key}
                  scope={ci === 0 ? "row" : undefined}
                  className={cn(
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.mono && "t-mono",
                    c.key === highlightKey && "is-hl",
                    c.className,
                  )}
                >
                  {content}
                </Cell>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
