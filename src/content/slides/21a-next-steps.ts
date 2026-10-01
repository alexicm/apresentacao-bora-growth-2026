import type { SlideMeta } from "../types";

export const meta = {
  id: "next-steps",
  title: "Próximos passos",
  chapter: "close",
  // s0 o que proponho à diretoria · s1 os próximos 90 dias e a cadência
  steps: 2,
  theme: "light",
  summary: "O que proponho à diretoria e o que acontece nos próximos 90 dias.",
} as const satisfies SlideMeta;

export const copy = {
  label: "Próximos passos",
  // Uma linha visual por item (a revelação é por máscara).
  headline: ["O que preciso de vocês", "**para começar.**"],
  lede: "Nada aqui pede uma aposta grande. O que já roda ganha meta e dono, e cada ideia só vira projeto se passar no teste.",
  asksLabel: "O que proponho à diretoria",
  asks: [
    {
      n: "01",
      title: "Validar o rumo",
      text: "Crescer por comunidades, com a Rede BORA ativa como o número que acompanhamos juntos.",
    },
    {
      n: "02",
      title: "Aprovar o Brasília Lab",
      text: "90 dias com ficha, meta e dono para cada ação. As ideias entram só como teste pequeno.",
    },
    {
      n: "03",
      title: "Definir parceiros e verba dos testes",
      text: "Com a Diretoria de Expansão: quais clubes, empresas e marcas entram nos pilotos, e com que orçamento.",
    },
  ],
  planLabel: "O que eu faço nos próximos 90 dias",
  plan: [
    { when: "0 a 30 dias", name: "Construir", text: "Ficha de cada ação, base de dados pronta (BORA ID, CRM e tracking) e mapa de clubes e capitães." },
    { when: "31 a 60 dias", name: "Pilotar", text: "Pilotos Powered, desafio 5K, PASS beta e turmas START em empresas." },
    { when: "61 a 90 dias", name: "Aprender", text: "Leitura de conversão e retenção, e o Playbook Brasília V1 para decidir o que escala." },
  ],
  cadence: { label: "Todo mês", text: "Revisão do portfólio com a diretoria: escalar, ajustar ou encerrar cada ação." },
  honesty: "Resultado só entra na revisão depois de medido.",
} as const;
