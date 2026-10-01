import { cn } from "@/lib/utils";

/**
 * Status epistêmico — deixa explícito o que existe hoje, o que é proposta e o que é exemplo.
 * current / evolution → o que a BORA já tem (sólido, neutro)
 * proposed             → proposta do BORA Growth (volt)
 * demais               → exemplo, hipótese, simulação, dado ilustrativo (contorno tracejado)
 */
export type TagKind =
  | "current"
  | "evolution"
  | "proposed"
  | "illustrative"
  | "example"
  | "fictional"
  | "concept"
  | "demo"
  | "hypothesis"
  | "target"
  | "simulation";

const LABELS: Record<TagKind, string> = {
  current: "BORA atual",
  evolution: "Evolução do atual",
  proposed: "Proposta",
  illustrative: "Ilustrativo",
  example: "Exemplo",
  fictional: "Exemplo fictício",
  concept: "Conceito",
  demo: "Dados demo",
  hypothesis: "Hipótese",
  target: "Arquitetura-alvo",
  simulation: "Simulação",
};

export function Tag({ kind, children, className }: { kind: TagKind; children?: React.ReactNode; className?: string }) {
  const tone = kind === "current" || kind === "evolution" ? "current" : kind === "proposed" ? "proposed" : "concept";
  return (
    <span className={cn("tag", `tag--${tone}`, className)}>
      <i aria-hidden="true" className="tag-dot" />
      {children ?? LABELS[kind]}
    </span>
  );
}
