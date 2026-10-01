// Textos da ficha da ação (ActionBrief), o mesmo formato no método, nos slides de produto e nas pastas (tecla P).
// O conteúdo de cada ação (o que é, por que importa, como executar) fica em GROWTH_PROJECTS, em projects.ts.
// Tudo no pack é proposta: a ficha descreve o que faríamos, na ordem sugerida pelo Alex.

import type { Stage } from "./projects";

export const BRIEF = {
  kicker: "Ficha da ação",
  plain: "O que é",
  why: "Por que importa",
  /** Ações para começar já ou da próxima fase: como executar. Ideias: como testar antes de investir. */
  how: { agora: "Como executar", depois: "Como executar", ideia: "Como validar" } satisfies Record<Stage, string>,
  metric: "Como medir",
  when: "Quando",
  goal: "Meta",
  goalValue: "A definir com o time",
  /** Onde a ação entra na ordem proposta. É proposta, não resultado. */
  stageNote: {
    agora: "Proposta para os primeiros 30 dias: começaria com ficha, meta e dono.",
    depois: "Proposta para 31 a 90 dias, quando a base já estivesse medindo.",
    ideia: "Hipótese. Só vira projeto se um teste pequeno bater a meta.",
  } satisfies Record<Stage, string>,
  core: "Produto atual",
  coreNote: "O produto que a BORA já vende. É a base do pack, não uma ação nova.",
} as const;
