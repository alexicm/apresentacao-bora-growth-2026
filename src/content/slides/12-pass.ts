import type { SlideMeta } from "../types";

export const meta = {
  id: "pass",
  title: "BORA PASS",
  chapter: "next",
  // s0 a frase · s1 três níveis · s2 o mercado se expande · s3 simulador · s4 ficha da ação
  steps: 5,
  theme: "dark",
  summary: "Ideia: uma assinatura de comunidade para quem já corre, com ou sem treinador.",
} as const satisfies SlideMeta;

export const copy = {
  label: "BORA PASS",
  /** Manchete — passo 0 sozinha, enorme; depois vira o título compacto do slide. */
  headline: ["Você não precisa de um", "treinador BORA para", "**==pertencer à BORA.==**"],
  // Linha em português do que é (padrão de ação explicada).
  plain: "Uma assinatura de comunidade para quem já corre, com ou sem treinador: eventos, BORA House, benefícios e desafios.",

  // Passo 1 — arquitetura em três níveis
  tiersLabel: "Arquitetura",
  tiersCaption: "Três níveis, uma mesma identidade: do gratuito ao premium.",
  includesLabel: "Inclui",
  audienceLabel: "Para quem",
  tiers: [
    {
      id: "id",
      brand: "BORA",
      name: "ID",
      kind: "Grátis",
      items: ["Perfil", "Eventos abertos", "Acesso básico à comunidade"],
      audience: "Quem está chegando à comunidade",
    },
    {
      id: "pass",
      brand: "BORA",
      name: "PASS",
      kind: "Assinatura",
      items: ["Eventos", "BORA House", "Benefícios", "Parceiros", "Experiências especiais", "Convidados", "Desafios"],
      audience: "Quem já corre, com ou sem treinador",
    },
    {
      id: "coaching",
      brand: "BORA",
      name: "COACHING",
      kind: "Premium",
      /** Linha herdada (marcada com "+"): o Coaching inclui o que importa do ecossistema. */
      inherits: "Tudo o que for relevante do ecossistema",
      items: ["Treinador individual", "Plano de treino individual", "Planejamento de performance", "Feedback"],
      audience: "Quem busca performance individual",
    },
  ],

  // Passo 2 — o mercado endereçável se expande
  market: {
    lede: "Se validado, o BORA PASS amplia o mercado endereçável:",
    /** Cada linha precisa caber numa linha visual (máscara do unmask). */
    from: ["de quem procura", "um novo treinador"],
    to: "para **==quem corre.==**",
    tag: "Conceito · fora de escala",
    small: { title: "Mercado tradicional", body: "Quem procura um novo treinador" },
    large: { title: "Mercado da corrida", body: "Quem corre" },
    caption: "Cada ponto é um corredor. O círculo pequeno é onde a assessoria compete hoje.",
  },
  persona: {
    tag: "Exemplo fictício",
    text: "Corredora com treinador próprio assina o PASS para usar a **BORA House nas provas.**",
  },

  // Passo 3 — simulação
  sim: {
    title: "Simulador do BORA PASS",
    note: "Premissas ajustáveis ao vivo. Não são dados da BORA, e o preço é hipotético.",
    assumptionsLabel: "Premissas",
    resultsLabel: "Resultado",
    inputs: {
      ids: { label: "BORA IDs ativos", min: 1000, max: 20000, step: 500, value: 5000 },
      share: { label: "% que assina o PASS", min: 0.01, max: 0.15, step: 0.01, value: 0.04 },
      price: { label: "Preço hipotético por mês", min: 19, max: 149, step: 10, value: 49 },
      upgrade: { label: "% de assinantes PASS que viram Coaching em 12 meses", min: 0, max: 0.25, step: 0.01, value: 0.08 },
    },
    nodes: {
      id: { name: "BORA ID", unit: "IDs ativos" },
      pass: { name: "BORA PASS" },
      coaching: { name: "BORA COACHING" },
    },
    outputs: {
      subscribers: "Assinantes PASS",
      mrr: "MRR do PASS",
      coaching: "Novos atletas Coaching por ano",
    },
    subscribeRate: (pct: string) => `${pct} assinam`,
    upgradeRate: (pct: string) => `${pct} em 12 meses`,
    perYear: (value: string) => `≈ ${value} por ano`,
  },
} as const;
