import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tag } from "./Tag";

type Props = {
  title: string;
  /** Aviso obrigatório: deixa claro que são premissas, não dados da BORA. */
  note?: string;
  children: ReactNode;
  className?: string;
  /** Rótulo da tag (padrão: "Simulação"). */
  tag?: string;
};

/**
 * Moldura padrão das simulações interativas.
 * Regra: toda simulação mostra a tag e a nota — premissas ajustáveis nunca parecem dado real.
 */
export function SimPanel({ title, note = "Premissas ajustáveis ao vivo. Não são dados da BORA.", children, className, tag }: Props) {
  return (
    <section className={cn("sim-panel", className)} aria-label={`Simulação: ${title}`}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="t-title text-[length:var(--fs-title)]">{title}</h3>
        <Tag kind="simulation">{tag}</Tag>
      </header>
      <p className="mt-1.5 text-[12.5px] text-fg-3">{note}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
