"use client";

import type { CSSProperties, ReactNode } from "react";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { cn } from "@/lib/utils";
import styles from "./MetricTree.module.css";

/*
 * Árvore de métricas: North Star (raiz) → ramos → métricas (folhas), em estilo "árvore de arquivos".
 * Conectores ortogonais em CSS — cada segmento cresce a partir de uma ponta (scaleX/scaleY), então a árvore
 * é responsiva sem medir nada.
 *
 * Alvos de animação: [data-a="mt-root"], [data-a="mt-drop"], [data-a="mt-bus"], [data-a="mt-bdrop"],
 * [data-a="mt-bnode"], [data-a="mt-branch"], [data-a="mt-leaves"], [data-a="mt-spine-head"], [data-a="mt-spine"], [data-a="mt-stub"],
 * [data-a="mt-leaf"]. Ramos com data-dim="true" podem ser esmaecidos pelo slide.
 */

export type Metric = { name: string; def: string };
export type Branch = { name: string; question: string; metrics: readonly Metric[] };

type Props = {
  root: { label: string; title: string; def: string; tag?: ReactNode };
  branches: readonly Branch[];
  countLabel: string;
  ariaLabel: string;
  /** Ramos ligados à simulação: os demais recebem data-dim="true" (alvo do slide). */
  linked?: readonly number[];
  /** Acende o nó volt dos ramos ligados. */
  linkedActive?: boolean;
  onLeafEnter?: (el: Element, metric: Metric, branch: Branch) => void;
  onLeafLeave?: () => void;
  /** Conteúdo sobreposto à área das folhas (ex.: simulações do passo final). */
  overlay?: ReactNode;
  className?: string;
};

export function MetricTree({
  root,
  branches,
  countLabel,
  ariaLabel,
  linked = [],
  linkedActive,
  onLeafEnter,
  onLeafLeave,
  overlay,
  className,
}: Props) {
  return (
    <div className={cn(styles.tree, className)} role="group" aria-label={ariaLabel}>
      <div className={styles.rootRow}>
        <div data-a="mt-root" className={styles.root}>
          <div className={styles.rootMeta}>
            <i className={styles.star} aria-hidden="true" />
            <span className="t-label text-fg-2">{root.label}</span>
            {root.tag}
          </div>
          <div className={styles.rootBody}>
            <p className={styles.rootTitle}>
              <Emphasis text={root.title} />
            </p>
            <p className={styles.rootDef}>{root.def}</p>
          </div>
        </div>
      </div>

      <div className={styles.trunk} aria-hidden="true">
        <span data-a="mt-drop" className={styles.drop} />
        <span data-a="mt-bus" className={styles.busL} />
        <span data-a="mt-bus" className={styles.busR} />
      </div>

      <div className={styles.branches}>
        {branches.map((b, bi) => (
          <div
            key={b.name}
            className={cn(styles.branch, linkedActive && linked.includes(bi) && styles.isLinked)}
            style={{ "--c": bi + 1, "--r": bi * 2 + 1 } as CSSProperties}
            data-dim={linked.length > 0 && !linked.includes(bi)}
          >
            <span data-a="mt-bdrop" className={styles.bdrop} aria-hidden="true" />
            <span data-a="mt-spine-head" className={styles.spineHead} aria-hidden="true" />
            <div className={styles.bHead}>
              <span data-a="mt-bnode" className={styles.bnode} aria-hidden="true">
                <span className={styles.bnodeInner} />
              </span>
              <div data-a="mt-branch" className={styles.bLabel}>
                <p className={styles.bName}>
                  <span className="t-label">{b.name}</span>
                  <span className={styles.bCount}>
                    {b.metrics.length} {countLabel}
                  </span>
                </p>
                <p className={styles.bQuestion}>{b.question}</p>
              </div>
            </div>
          </div>
        ))}
        {branches.map((b, bi) => (
          <div key={`${b.name}-leaves`} data-a="mt-leaves" className={styles.leaves} style={{ "--c": bi + 1, "--r": bi * 2 + 2 } as CSSProperties}>
            <span data-a="mt-spine" className={styles.spine} aria-hidden="true" />
            <ul className={styles.leafList} aria-label={b.name}>
              {b.metrics.map((m) => (
                <li key={m.name} className={styles.leaf}>
                  <span data-a="mt-stub" className={styles.stub} aria-hidden="true" />
                  <button
                    type="button"
                    data-a="mt-leaf"
                    className={styles.leafBtn}
                    aria-label={`${m.name}: ${m.def}`}
                    onMouseEnter={(e) => onLeafEnter?.(e.currentTarget, m, b)}
                    onMouseLeave={() => onLeafLeave?.()}
                    onFocus={(e) => onLeafEnter?.(e.currentTarget, m, b)}
                    onBlur={() => onLeafLeave?.()}
                  >
                    <span className={styles.leafText}>{m.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {overlay && <div className={styles.overlay}>{overlay}</div>}
      </div>
    </div>
  );
}
