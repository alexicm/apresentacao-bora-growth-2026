import type { SlideMeta } from "../types";

export const meta = {
  id: "receita-b2b",
  title: "Receita B2B",
  chapter: "fronts",
  // s0 as 2 ações · s1 simulador de um programa corporativo · s2 ficha ENTERPRISE · s3 ficha LEAGUE
  steps: 4,
  theme: "dark",
  summary: "ENTERPRISE e LEAGUE: programas de corrida vendidos a empresas.",
} as const satisfies SlideMeta;

export const copy = {
  front: "Receita B2B",
  headline: ["Corrida como benefício.", "**Uma venda, ==muitos corredores.==**"],
  lede: "Programas de corrida para RH e Benefícios, do primeiro 5K ao time de prova. A liga entre empresas fica como ideia.",
  briefs: ["enterprise", "league"],

  // Linha de maturidade do ENTERPRISE (o último degrau é o LEAGUE, ideia).
  ladderLabel: "Do primeiro programa à liga",
  ladder: [
    { name: "START", line: "turma até o 5K" },
    { name: "WORK RUN CLUB", line: "clube semanal" },
    { name: "RACE TEAM", line: "time para uma prova" },
    { name: "LEAGUE", line: "liga entre empresas", stageId: "league" },
  ],

  sim: {
    title: "Simulador de um programa corporativo",
    note: "Premissas ajustáveis ao vivo. Não são dados, clientes nem preços da BORA.",
    example: "Empresa com 800 colaboradores.",
    exampleDetail: "Uma turma BORA START aberta a todos.",
    inputs: {
      eligible: { label: "Colaboradores elegíveis", min: 100, max: 5000, step: 50, value: 800 },
      adoption: { label: "Adesão ao programa", min: 0.02, max: 0.4, step: 0.01, value: 0.12 },
      completion: { label: "Concluem o programa", min: 0.3, max: 0.95, step: 0.05, value: 0.7 },
      conversion: { label: "Concluintes → Coaching", min: 0, max: 0.3, step: 0.01, value: 0.1 },
      price: { label: "Valor hipotético por pessoa", min: 60, max: 600, step: 10, value: 180 },
    },
    outputs: {
      participants: "Participantes (novos BORA IDs)",
      finishers: "Concluem o programa",
      conversions: "Viram atletas de Coaching",
      revenue: "Receita do contrato",
    },
    waffleCaption: "Cada ponto = 1% dos colaboradores elegíveis",
    waffleLegend: ["Colaboradores", "Participantes", "Concluintes", "Coaching"],
  },
} as const;
