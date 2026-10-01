import type { SlideMeta } from "../types";

export const meta = {
  id: "aquisicao",
  title: "Aquisição",
  chapter: "fronts",
  // s0 as 7 ações · s1 o funil de um treino aberto (ilustrativo) · s2 simulador do OPEN · s3 ficha OPEN · s4 ficha CAPTAINS
  steps: 5,
  theme: "light",
  summary: "Sete ações para atrair corredores com origem medida. A principal: o BORA OPEN.",
} as const satisfies SlideMeta;

export const copy = {
  front: "Aquisição",
  headline: ["Atrair onde já se corre.", "**Com a ==origem medida.==**"],
  lede: "Sete ações para trazer gente nova sem depender só de anúncio. A principal é o treino aberto.",
  briefs: ["open", "captains"],

  // ── Passo 1: o funil de um treino aberto (os 80 pontos são as 80 pessoas do exemplo) ──
  example: {
    label: "BORA OPEN · um treino de sábado",
    where: "Parque da Cidade, Brasília",
    facts: "80 pessoas · 3 grupos de pace",
  },
  flow: [
    { label: "Treino aberto", caption: "Gratuito, toda semana" },
    { label: "BORA ID", caption: "O check-in gera o ID" },
    { label: "Comunidade", caption: "Volta e pertence" },
    { label: "Intenção", caption: "Quer uma meta" },
    { label: "Desafio", caption: "5K · 10K · 21K" },
    { label: "Coaching", caption: "Treino individual" },
  ],
  // Quantas pessoas (das 80 do exemplo) chegariam a cada estação. Números ilustrativos.
  funnelReach: [80, 80, 32, 10, 3, 1],
  funnelCaption: "Todos ganhariam um **BORA ID**. A maioria ficaria na comunidade. **Poucos seguiriam até o Coaching.**",
  funnelLegend: "Cada ponto é uma pessoa do treino.",
  funnelNote: "O OPEN não é coaching grátis: é a porta de entrada da comunidade.",

  // ── Passo 2: simulador ──
  sim: {
    title: "Simulador de um BORA OPEN",
    note: "Modelo simplificado de um ponto de treino. Premissas ajustáveis ao vivo; não são dados da BORA.",
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
    yearly: "Nesta simulação: ≈ **{n} novos atletas de Coaching em 12 meses**, vindos de um treino gratuito.",
  },
} as const;
