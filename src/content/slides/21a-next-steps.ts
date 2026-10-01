import type { SlideMeta } from "../types";

export const meta = {
  id: "next-steps",
  title: "O que proponho",
  chapter: "close",
  // s0 as três decisões · s1 como dividiríamos o trabalho e a cadência
  steps: 2,
  theme: "dark",
  summary: "Três decisões para começar, se fizer sentido, e como dividiríamos o trabalho.",
} as const satisfies SlideMeta;

export const copy = {
  label: "O que proponho",
  // Uma linha visual por item (a revelação é por máscara).
  headline: ["O que proponho", "**à diretoria.**"],
  lede: "Nada começa sem aprovação. Se fizer sentido, o primeiro passo seria o teste de 90 dias em Brasília.",
  asksLabel: "Três decisões",
  asks: [
    {
      n: "01",
      title: "Validar o rumo",
      text: "Crescer por comunidades, com a Rede BORA ativa como o número a acompanhar juntos.",
    },
    {
      n: "02",
      title: "Aprovar o teste de 90 dias",
      text: "Brasília como laboratório: ficha, meta e dono para cada ação, e as ideias só como teste pequeno.",
    },
    {
      n: "03",
      title: "Definir parceiros e verba",
      text: "Com a Diretoria de Expansão: quais clubes, empresas e marcas entrariam nos testes, e com que orçamento.",
    },
  ],
  roleLabel: "Como dividiríamos o trabalho",
  board: { title: "A diretoria decidiria", items: ["Onde expandir", "Com quem fazer parceria", "Quanto investir"] },
  me: { title: "Eu construiria", items: ["A demanda e os canais", "A base de dados e as métricas", "Os testes e os playbooks"] },
  flows: { down: "Direção", up: "Evidência e playbooks" },
  cadence: { label: "Todo mês", text: "Revisão com a diretoria: escalar, ajustar ou encerrar cada ação." },
  honesty: "Resultado só entraria na revisão depois de medido.",
} as const;
