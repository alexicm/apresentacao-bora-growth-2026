import type { SlideMeta } from "../types";

export const meta = {
  id: "portfolio",
  title: "A proposta: o pack",
  chapter: "pack",
  // s0 contagem e quadro por frente · s1 a leitura de cada coluna e o roteiro (cada frente leva ao slide dela)
  steps: 2,
  theme: "light",
  summary: "As 22 ações por frente e por fase: Fase 1, Fase 2 e ideias a testar.",
} as const satisfies SlideMeta;

export const copy = {
  label: "A proposta",
  // {total} vira o número de ações do pack, calculado em src/content/projects.ts.
  headline: ["A proposta: {total} ações.", "**Em ==duas fases== e ideias a testar.**"],
  lede: "O que eu faria de dentro da BORA, se aprovado. Cada ação tem ficha, métrica e prazo; as ideias só viram projeto depois de um teste.",
  caption: "O pack de growth por frente e por estágio",
  frontsLabel: "Frente",
  defs: {
    agora: "Primeiros 30 dias, se aprovado.",
    depois: "De 31 a 90 dias, com a base medindo.",
    ideia: "Hipótese: só com teste antes.",
  },
  notes: {
    agora: "Base e ganhos rápidos: medir, atrair e converter melhor.",
    depois: "Produtos e parcerias, quando BORA ID e CRM já medirem.",
    ideia: "Teste pequeno em Brasília antes de virar projeto.",
  },
  hint: "Clique numa ação para abrir a ficha, ou numa frente para ir ao slide dela.",
  /** Rótulo acessível do atalho de cada frente: {front} = nome, {n} = número do slide. */
  goTo: "Ir para a frente {front}, slide {n}",
  next: "A seguir: como faríamos →",
  tipMetric: "Métrica",
} as const;
