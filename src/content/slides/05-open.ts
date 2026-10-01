import type { SlideMeta } from "../types";

export const meta = {
  id: "open",
  title: "BORA OPEN",
  chapter: "start",
  // s0 exemplo · s1 o funil · s2 OPEN ≠ Coaching · s3 simulador · s4 ficha da ação
  steps: 5,
  theme: "light",
  summary: "Treinos abertos e gratuitos: a porta de entrada que gera BORA IDs.",
} as const satisfies SlideMeta;

export const copy = {
  label: "Aquisição",
  title: ["**BORA OPEN**"],
  // Linha em português do que é (padrão de ação explicada).
  tagline: "Treinos abertos e **gratuitos**, toda semana, com check-in. É a porta de entrada da BORA: cada pessoa ganha um BORA ID.",

  // Exemplo que abre o slide — os 80 pontos do funil são as 80 pessoas deste treino.
  example: {
    when: "Sábado, 7h",
    where: "Parque da Cidade · Brasília",
    facts: [
      { value: "80", label: "pessoas" },
      { value: "3", label: "grupos de pace" },
      { value: "1", label: "parceiro de hidratação" },
    ],
  },

  flowLabel: "Um treino aberto, seis estações",
  flow: [
    { label: "Treino aberto", caption: "Gratuito, toda semana" },
    { label: "BORA ID", caption: "O check-in gera o ID" },
    { label: "Comunidade", caption: "Volta e pertence" },
    { label: "Intenção", caption: "Quer uma meta" },
    { label: "Desafio", caption: "5K · 10K · 21K" },
    { label: "Coaching", caption: "Treino individual" },
  ],
  // Quantas pessoas (das 80 do exemplo) chegam a cada estação — números ilustrativos.
  funnelReach: [80, 80, 32, 10, 3, 1],
  funnelCaption: "Todos ganham um **BORA ID**. A maioria fica na comunidade. **Poucos seguem até o Coaching.**",
  funnelLegend: "Cada ponto é uma pessoa do treino de sábado.",

  compare: {
    headline: "OPEN não é **coaching grátis.**",
    versus: "≠",
    roleLabel: "Papel na rede",
    open: {
      title: "BORA OPEN",
      kind: "Grátis · coletivo",
      items: ["Comunidade", "Experiência em grupo", "Check-in", "Eventos", "Grupos de pace", "Parceiros"],
      role: "Aquisição: gera BORA IDs",
    },
    coaching: {
      title: "BORA COACHING",
      kind: "Pago · individual",
      items: ["Treino individual", "Treinador", "Planejamento", "Performance", "Feedback"],
      role: "Receita: o núcleo premium",
    },
  },

  objective: {
    label: "Objetivo",
    text: "Transformar comunidade em ==canal recorrente de aquisição.==",
  },

  sim: {
    title: "Simulador de um BORA OPEN",
    note: "Modelo simplificado de um ponto de OPEN. Premissas ajustáveis ao vivo; não são dados da BORA.",
    inputs: {
      participants: "Participantes por treino",
      sessions: "Treinos por mês",
      returning: "Voltam no mês seguinte",
      challenge: "Entram num desafio",
      conversion: "Desafio → Coaching",
    },
    checkins: "{p} × {t} = {n} check-ins no mês",
    arrow: "→",
    outputs: {
      ids: { label: "Novos BORA IDs/mês", hint: "chegam pela primeira vez" },
      community: { label: "Comunidade ativa", hint: "voltaram no mês" },
      challenges: { label: "Desafios iniciados", hint: "{pct} da comunidade ativa" },
      coaching: { label: "Novos Coaching/mês", hint: "{pct} dos desafios" },
    },
    yearly: "≈ **{n} novos atletas de Coaching em 12 meses**, vindos de um treino gratuito.",
  },
} as const;
