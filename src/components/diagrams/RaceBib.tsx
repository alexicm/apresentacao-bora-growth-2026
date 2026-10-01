import { cn } from "@/lib/utils";
import styles from "./RaceBib.module.css";

type Props = {
  /** Código grande do número de peito (ex.: "10K", "1ª"). */
  code: string;
  /** Faixa superior (marca). */
  brand?: string;
  /** Faixa em volt (destaque). */
  accent?: boolean;
  className?: string;
};

/**
 * Número de peito minimalista: faixa da marca, código grande e os quatro furos dos alfinetes.
 * Decorativo (aria-hidden) — o nome do desafio deve vir como texto ao lado.
 */
export function RaceBib({ code, brand = "BORA", accent, className }: Props) {
  return (
    <span className={cn(styles.bib, accent && styles.accent, className)} aria-hidden="true">
      <span className={styles.band}>{brand}</span>
      <span className={styles.code} data-len={Math.min(Array.from(code).length, 4)}>
        {code}
      </span>
      <i className={cn(styles.pin, styles.tl)} />
      <i className={cn(styles.pin, styles.tr)} />
      <i className={cn(styles.pin, styles.bl)} />
      <i className={cn(styles.pin, styles.br)} />
    </span>
  );
}
