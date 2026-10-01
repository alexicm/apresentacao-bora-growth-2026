import type { SlideMeta } from "../types";

export const meta = {
  id: "portfolio",
  title: "O pack",
  chapter: "pack",
  // s0 contagem por estágio · s1 o quadro por frente · s2 o que fazemos com cada coluna
  steps: 3,
  theme: "light",
  summary: "As ações e projetos de growth: o que já roda, o que está no backlog e o que é ideia.",
} as const satisfies SlideMeta;

export const copy = {
  label: "O pack",
  // {total} vira o número de ações do pack, calculado em src/content/projects.ts.
  // A 2ª linha muda sozinha conforme a proporção de ações rodando.
  headline: ["{total} ações e projetos.", "**A maioria já está ==rodando.==**"],
  headlineSome: ["{total} ações e projetos.", "**Parte já está ==rodando.==**"],
  lede: "Cada ação tem objetivo, métrica, dependências e horizonte. Uma parte já está em execução, outra está priorizada e outra ainda é ideia a validar.",
  caption: "O pack de growth por frente e por estágio",
  frontsLabel: "Frente",
  defs: {
    rodando: "Já em execução na BORA.",
    backlog: "Desenhado e priorizado.",
    ideia: "Hipótese a validar.",
  },
  notes: {
    rodando: "Cada ação tem dono, métrica e prazo. Resultado só entra aqui depois de medido.",
    backlog: "Próxima janela: ganhos rápidos de conversão.",
    ideia: "Validar pequeno, no Brasília Lab, antes de investir.",
  },
  hint: "Clique numa ação para abrir a ficha nas pastas (tecla P).",
  next: "A seguir: o método que faz cada ação andar →",
  tipMetric: "Métrica",
} as const;
