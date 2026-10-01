import type { SlideMeta } from "../types";

export const meta = {
  id: "role",
  title: "O papel",
  chapter: "plan",
  steps: 4,
  theme: "dark",
  summary: "A diretoria decide onde e com quem. O Alex constrói o como.",
} as const satisfies SlideMeta;

export const copy = {
  label: "O papel",
  title: "O papel",
  // Cada item precisa caber numa linha a 1440px (máscara por linha).
  headline: ["A diretoria decide onde.", "**Eu construo o como.**"],
  left: {
    title: "Diretor de Expansão",
    focus: "Onde e com quem",
    items: ["Onde expandir.", "Com quem fazer parceria.", "Alocação de capital.", "Negociações estratégicas.", "Mercados."],
  },
  right: {
    title: "Alex Rodrigues",
    focus: "Como",
    items: [
      "Como criar demanda.",
      "Como entrar.",
      "Como construir canais.",
      "Como medir.",
      "Como automatizar.",
      "Como construir o B2B.",
      "Como transformar experimentos em playbooks.",
    ],
  },
  center: "Estratégia de Expansão & Growth",
  areas: ["Growth", "Inteligência de Expansão", "Novos Negócios", "Operações de Receita", "Tecnologia"],
  flows: { down: "Direção", up: "Evidências e playbooks" },
  lede: "A Diretoria de Expansão escolhe mercados, parceiros e capital. A frente de Growth cria a demanda, mede e devolve evidência para cada decisão.",
} as const;
