import type { SlideMeta } from "../types";

export const meta = {
  id: "network",
  title: "A Rede BORA",
  chapter: "running",
  // s0 o núcleo (BORA OS) · s1–s3 as três primeiras portas · s4 a rede inteira
  steps: 5,
  theme: "dark",
  summary: "Os nove produtos da rede, em volta de um único BORA ID.",
} as const satisfies SlideMeta;

export const copy = {
  label: "Os produtos",
  headline: ["A **Rede BORA.**"],
  // {rodando} e {ideia} = produtos da rede em cada estágio (contados de projects.ts).
  lede: "Nove produtos ligados por um único BORA ID: {rodando} já rodam e {ideia} são ideias. Cada um é uma porta de entrada diferente para a BORA.",
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
