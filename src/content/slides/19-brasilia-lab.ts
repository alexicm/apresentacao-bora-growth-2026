import type { SlideMeta } from "../types";

export const meta = {
  id: "brasilia-lab",
  title: "BORA Brasília Lab",
  chapter: "plan",
  steps: 6,
  theme: "dark",
  summary: "Os próximos 90 dias: construir, pilotar e aprender em Brasília antes de escalar.",
} as const satisfies SlideMeta;

/** Janela de trabalho de cada frente (dias do plano, 0–90). Datas ilustrativas. */
export type LabItem = { label: string; from: number; to: number };
export type LabPhase = { id: string; index: string; range: string; name: string; start: number; end: number; items: readonly LabItem[] };
/** Experimento com janela em semanas do plano (1–13). */
export type LabExperiment = { product: string; action: string; hypothesis: string; experiment: string; metric: string; from: number; to: number };

export const copy = {
  label: "Brasília Lab · 90 dias",
  title: "BORA Brasília Lab",
  // Cada item precisa caber em uma linha a 1440px (a revelação é por máscara).
  headline: ["Brasília não é só um lançamento.", "É o **==primeiro laboratório.==**"],
  lede: "Nos próximos 90 dias, cada ação do pack ganha ficha, meta e dono. O que já roda passa a ser medido; as ideias viram testes pequenos. Outra cidade, só depois.",
  days: "dias",
  dayPrefix: "Dia",
  /** Conector de intervalos ("0 a 30 dias", "semanas 2 a 5"). */
  to: "a",
  phases: [
    {
      id: "build",
      index: "01",
      range: "0 a 30 dias",
      name: "Construir",
      start: 0,
      end: 30,
      items: [
        { label: "BORA Base", from: 0, to: 12 },
        { label: "CRM", from: 0, to: 20 },
        { label: "BORA ID", from: 4, to: 20 },
        { label: "Migração Somma", from: 6, to: 26 },
        { label: "Tracking", from: 10, to: 28 },
        { label: "Opens com check-in", from: 7, to: 14 },
        { label: "Mapeamento de clubes", from: 0, to: 30 },
        { label: "Mapeamento de capitães", from: 12, to: 30 },
      ],
    },
    {
      id: "pilot",
      index: "02",
      range: "31 a 60 dias",
      name: "Pilotar",
      start: 31,
      end: 60,
      items: [
        { label: "Pilotos Powered", from: 31, to: 60 },
        { label: "Desafio 5K", from: 36, to: 60 },
        { label: "PASS beta", from: 43, to: 60 },
        { label: "Pipeline de empresas", from: 31, to: 56 },
        { label: "Primeiro parceiro Boost", from: 45, to: 60 },
      ],
    },
    {
      id: "learn",
      index: "03",
      range: "61 a 90 dias",
      name: "Aprender",
      start: 61,
      end: 90,
      items: [
        { label: "Análise de coortes", from: 61, to: 80 },
        { label: "Conversão", from: 61, to: 74 },
        { label: "Retenção", from: 64, to: 84 },
        { label: "CAC", from: 68, to: 82 },
        { label: "Resultados Powered", from: 70, to: 84 },
        { label: "Resultados Enterprise", from: 74, to: 86 },
        { label: "Playbook Brasília", from: 80, to: 90 },
      ],
    },
  ] as const satisfies readonly LabPhase[],
  output: {
    kicker: "Playbook",
    playbook: "Playbook BORA Brasília",
    version: "V1",
    caption: "O que bater a meta, com as métricas, vira roteiro replicável.",
    next: "Próxima cidade",
    nextCaption: "Escolhida pelos dados, não por intuição.",
  },
  experiments: {
    title: "Experimentos do laboratório",
    // O Lab está rodando; a lista é o plano de testes dele (não são resultados).
    tag: "Plano de testes",
    columns: { hypothesis: "Hipótese", experiment: "Experimento", metric: "Métrica de sucesso", weeks: "Semanas" },
    liveLabel: "em andamento nesta semana",
    rows: [
      {
        product: "Open",
        action: "open",
        hypothesis: "Treinos abertos geram IDs recorrentes",
        experiment: "4 Opens no Parque da Cidade",
        metric: "% de IDs que voltam",
        from: 2,
        to: 5,
      },
      {
        product: "Powered",
        action: "powered",
        hypothesis: "Clubes adotam a estrutura BORA sem perder identidade",
        experiment: "3 clubes piloto com check-in e CRM",
        metric: "% de membros com BORA ID ativo",
        from: 5,
        to: 9,
      },
      {
        product: "Challenges",
        action: "challenges",
        hypothesis: "Uma meta com prazo gera intenção de compra",
        experiment: "Desafio 5K de 6 semanas",
        metric: "% de concluintes que pedem Coaching",
        from: 6,
        to: 12,
      },
      {
        product: "PASS beta",
        action: "pass",
        hypothesis: "Quem já corre paga para pertencer",
        experiment: "PASS beta com 50 convidados",
        metric: "% que renova no 2º mês",
        from: 7,
        to: 13,
      },
      {
        product: "Enterprise",
        action: "enterprise",
        hypothesis: "Empresas compram corrida como engajamento",
        experiment: "2 turmas START em empresas locais",
        metric: "Presença semanal por turma",
        from: 5,
        to: 12,
      },
      {
        product: "Boost",
        action: "boost",
        hypothesis: "Marcas pagam por acesso a comunidades reais",
        experiment: "1 marca financia benefícios em clubes Powered",
        metric: "Check-ins e cupons usados",
        from: 8,
        to: 12,
      },
    ] as const satisfies readonly LabExperiment[],
  },
  scrubber: {
    title: "Semana a semana",
    tag: "Cronograma ilustrativo",
    note: "Janelas ilustrativas por frente. Não são dados da BORA.",
    slider: "Semana do plano",
    weekPrefix: "Semana",
    weeks: 13,
    defaultWeek: 6,
    phaseLabel: "Fase",
    stats: { done: "Plano concluído", active: "Frentes ativas", running: "Experimentos rodando" },
    activeLabel: "Frentes em andamento",
  },
} as const;
