import { STAGE_LABEL, stageOf, type Stage } from "@/content/projects";
import { cn } from "@/lib/utils";

const FILLED: Record<Stage, number> = { agora: 3, depois: 2, ideia: 1 };

/**
 * Estágio da ação no pack (ordem proposta): ●●● Começar já · ●●○ Próxima fase · ●○○ Ideia.
 * Começar já = volt sólido · Próxima fase = contorno · Ideia = tracejado (hipótese).
 * Passe `stage` ou o id da ação em `of` (lido de GROWTH_PROJECTS, a fonte única).
 */
export function StageTag({ stage, of, label, className }: { stage?: Stage; of?: string; label?: string; className?: string }) {
  const s = stage ?? (of ? stageOf(of) : undefined);
  if (!s) return null;
  return (
    <span className={cn("stage", `stage--${s}`, className)}>
      <StageDots stage={s} />
      {label ?? STAGE_LABEL[s]}
    </span>
  );
}

export function StageDots({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span className={cn("stage-dots", className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <i key={i} data-on={i < FILLED[stage] ? "" : undefined} />
      ))}
    </span>
  );
}
