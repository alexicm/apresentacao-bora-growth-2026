import type { SlideMeta } from "../types";

export const meta = {
  id: "network",
  title: "A Rede BORA",
  chapter: "pack",
  // s0 o núcleo (BORA OS) · s1–s3 as três primeiras portas · s4 a rede inteira
  steps: 5,
  theme: "dark",
  summary: "Os nove produtos propostos para a rede, em volta de um único BORA ID.",
} as const satisfies SlideMeta;

export const copy = {
  label: "Os produtos",
  headline: ["A **Rede BORA.**"],
  lede: "Nove produtos propostos, ligados por um único BORA ID. Cada um seria uma porta de entrada diferente, e o selo mostra quando ele entraria: Fase 1, Fase 2 ou ideia a validar.",
  hint: "Clique em um produto para ver o papel dele na rede.",
  coreCaption: "Identidade · Dados · Operação",
  coachingCaption: "Produto atual",
  panel: {
    layer: "Camada",
    audience: "Para quem",
    feeds: "Alimenta",
    example: "Exemplo",
    goTo: "Ver o produto",
    close: "Fechar",
  },
} as const;
