import type { SlideMeta } from "../types";

export const meta = {
  id: "challenges",
  title: "BORA CHALLENGES",
  chapter: "later",
  // s0 assinatura × desafio · s1 catálogo · s2 rotas até o Coaching · s3 simulador · s4 ficha da ação
  steps: 5,
  theme: "light",
  summary: "Desafios com meta e prazo que levam ao Coaching.",
} as const satisfies SlideMeta;

export const copy = {
  label: "BORA CHALLENGES",
  /** Cada linha precisa caber numa linha visual. */
  headline: ["Venda a ==próxima meta==", "antes de vender **a assinatura.**"],
  // Linha em português do que é (padrão de ação explicada).
  tagline: "Desafios com meta e prazo, como 5K, 10K e 21K, que levam ao **Coaching.**",

  // Passo 0 — assinatura × desafio
  contrastLabel: "Assinatura × desafio",
  subscription: { title: "Assinatura", body: "Permanente e abstrata. Não tem começo, meio nem fim." },
  challenge: { title: "Desafio", body: "Tem meta, prazo e linha de chegada." },
  start: "Largada",
  finish: "Chegada",
  attributes: ["Meta", "Prazo", "Identidade", "Comunidade", "Evento", "Transformação"],

  // Passo 1 — catálogo (tabela com números de peito)
  catalogLabel: "Catálogo",
  catalogNote: "Nomes provisórios",
  catalogCaption: "Sete metas concretas, cada uma com prazo e próximo passo.",
  columns: {
    challenge: "Desafio",
    goal: "Meta",
    duration: "Duração sugerida",
    audience: "Para quem",
    next: "Próximo passo",
  },
  bibBrand: "BORA",
  catalog: [
    {
      code: "5K",
      name: "BORA 5K",
      goal: "Correr 5 km sem parar",
      duration: "8 semanas",
      audience: "Quem está começando ou vem do Open",
      next: "BORA 10K",
    },
    {
      code: "10K",
      name: "BORA 10K",
      goal: "Completar os primeiros 10 km",
      duration: "10 semanas",
      audience: "Quem já corre 5 km",
      next: "BORA 21K ou Coaching",
    },
    {
      code: "21K",
      name: "BORA 21K",
      goal: "A primeira meia maratona",
      duration: "14 semanas",
      audience: "Quem já corre 10 km",
      next: "BORA 42K ou Coaching",
    },
    {
      code: "42K",
      name: "BORA 42K",
      goal: "A maratona",
      duration: "20 semanas",
      audience: "Quem já completou uma meia",
      next: "Coaching",
    },
    {
      code: "1ª",
      name: "BORA PRIMEIRA PROVA",
      goal: "Cruzar a primeira linha de chegada",
      duration: "6 semanas",
      audience: "Quem nunca fez uma prova",
      next: "BORA 5K ou BORA 10K",
    },
    {
      code: "↺",
      name: "BORA DE VOLTA",
      goal: "Voltar a correr com regularidade",
      duration: "8 semanas",
      audience: "Quem parou de correr",
      next: "BORA 5K ou PASS",
    },
    {
      code: "RP",
      name: "BORA RECORDE",
      goal: "Bater o recorde pessoal",
      duration: "12 semanas",
      audience: "Quem quer baixar o tempo",
      next: "Coaching",
    },
  ],

  // Passo 2 — rotas até o Coaching
  routesLabel: "Rotas até o Coaching",
  routes: [
    { id: "a", name: "Rota de entrada", stops: ["OPEN", "Desafio 5K", "Desafio 10K"] },
    { id: "b", name: "Rota de clube", stops: ["Clube Powered", "Desafio 21K"] },
  ],
  finishStop: { label: "Coaching", caption: "a assinatura vem depois" },
  routesLegend: "Cada ponto é um corredor. Nem todos chegam ao fim, e tudo bem: cada etapa já é um produto.",
  example: {
    tag: "Exemplo",
    text: "Turma **BORA 10K** de 10 semanas, com largada coletiva: quem cruza a linha de chegada recebe o convite para treinar a meia no Coaching.",
  },
  insight: "O desafio vende uma meta concreta. A assinatura vem depois, como **continuidade natural.**",

  // Passo 3 — simulação
  sim: {
    title: "Simulador de uma turma de desafio",
    note: "Premissas ajustáveis ao vivo. Não são dados da BORA.",
    assumptionsLabel: "Premissas",
    resultsLabel: "Resultado da turma",
    inputs: {
      enrolled: { label: "Inscritos na turma", min: 20, max: 400, step: 10, value: 120 },
      completion: { label: "% que conclui o desafio", min: 0.3, max: 0.95, step: 0.05, value: 0.7 },
      toCoaching: { label: "% dos concluintes que viram Coaching", min: 0, max: 0.4, step: 0.01, value: 0.18 },
      toNext: { label: "% dos concluintes que entram no próximo desafio", min: 0, max: 0.7, step: 0.05, value: 0.35 },
    },
    nodes: { start: "Largada", finish: "Chegada", coaching: "Coaching", next: "Próximo desafio" },
    outputs: {
      reactivated: "IDs reativados (cada inscrito volta a ter uma meta)",
      completers: "Concluintes",
      coaching: "Novos atletas Coaching",
      next: "Inscritos na próxima turma",
    },
    completionRate: (pct: string) => `${pct} concluem`,
    branchRate: (coaching: string, next: string) => `${coaching} viram Coaching · ${next} seguem para o próximo desafio`,
  },
} as const;
