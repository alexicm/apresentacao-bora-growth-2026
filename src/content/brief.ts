// Textos da ficha da ação (ActionBrief), o mesmo formato no método, nos slides de produto e nas pastas (tecla P).
// O conteúdo de cada ação (o que é, por que importa, como executamos) fica em GROWTH_PROJECTS, em projects.ts.

import type { Stage } from "./projects";

export const BRIEF = {
  kicker: "Ficha da ação",
  plain: "O que é",
  why: "Por que importa",
  /** Ações rodando ou no backlog: como fazemos. Ideias: como testamos antes de investir. */
  how: { rodando: "Como executamos", backlog: "Como executamos", ideia: "Como validamos" } satisfies Record<Stage, string>,
  metric: "Como medimos",
  when: "Quando",
  goal: "Meta",
  goalValue: "A definir com o time",
  /** O que o estágio quer dizer para esta ação, agora. Rodando não é resultado. */
  stageNote: {
    rodando: "Já em execução. Próximo passo: meta e dono no Brasília Lab.",
    backlog: "Desenhado e priorizado. Entra na próxima janela.",
    ideia: "Hipótese. Só vira projeto se o teste bater a meta.",
  } satisfies Record<Stage, string>,
  core: "Produto atual",
  coreNote: "O produto que a BORA já vende. É a base do pack, não uma ação nova.",
} as const;
