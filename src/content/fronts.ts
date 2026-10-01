// Textos fixos dos seis slides de frente (versão curta do deck).
// Cada frente lista TODAS as ações dela, lidas de GROWTH_PROJECTS (projects.ts): o que é, primeiro passo e métrica.
// Tudo no pack é proposta: a tabela descreve o que faríamos, e o "primeiro passo" vale só se aprovado.

export const FRONT_UI = {
  /** {n} = posição da frente · {total} = número de frentes · {front} = nome. */
  label: "Frente {n} de {total} · {front}",
  cols: { action: "Ação", stage: "Fase", plain: "O que é", first: "Primeiro passo", kpi: "Como medir" },
  countOne: "ação nesta frente",
  countMany: "ações nesta frente",
  tableLabel: "Ações da frente {front}",
  hint: "Clique numa ação para abrir a ficha completa.",
  /** {names} = ações com ficha nos próximos passos. */
  briefs: "Fichas a seguir: {names}.",
  and: "e",
} as const;

export const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
