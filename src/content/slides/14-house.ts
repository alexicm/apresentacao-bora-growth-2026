import type { SlideMeta } from "../types";

export const meta = {
  id: "house",
  title: "BORA HOUSE",
  chapter: "later",
  // s0 o fim de semana · s1 quem é atendido · s2 receitas possíveis · s3 simulador · s4 ficha da ação
  steps: 5,
  theme: "light",
  summary: "O apoio da BORA nas provas, organizado como produto.",
} as const satisfies SlideMeta;

export const copy = {
  label: "BORA HOUSE",
  /** Cada linha precisa caber numa linha visual. */
  headline: ["Transforme suporte de prova", "em **produto de ==crescimento.==**"],
  fact: {
    status: "BORA atual",
    value: "50+",
    label: "provas com ponto de apoio em 2025",
    source: "Declarado pela BORA em boraassessoria.com (set/2026).",
  },
  // Linha em português do que é (padrão de ação explicada).
  lede: "O ponto de apoio que a BORA já monta nas provas, organizado como produto: público, parceiros e receita.",
  photo: {
    alt: "Atleta da BORA sorrindo bate um high-five com um colega de equipe no meio do percurso da Floripa 42K.",
    credit: "Foto: boraassessoria.com",
  },

  // Passo 0 — o fim de semana de prova, dia a dia
  timelineLabel: "Fim de semana de prova",
  days: [
    { id: "sex", day: "Sexta", items: ["Encontro da comunidade", "Conteúdo", "Parceiros"] },
    { id: "sab", day: "Sábado", items: ["Shakeout", "Teste de produto", "Café da manhã"] },
    { id: "dom", day: "Domingo", items: ["Suporte na prova", "Guarda-volumes", "Hidratação", "Recuperação", "Fotografia"] },
    { id: "pos", day: "Pós-prova", items: ["Conteúdo", "Resultados", "Follow-up"] },
  ],
  /** Dia de pico (destaque em volt). */
  peakDay: "dom",
  peakLabel: "Pico",

  // Passo 1 — exemplo: quem é atendido em cada momento
  matrix: {
    label: "Quem é atendido em cada momento",
    tag: "Exemplo",
    caption: "Uma BORA House na maratona da cidade",
    legendServed: "atendido",
    legendNone: "não participa",
    rows: [
      {
        id: "coaching",
        name: "Coaching",
        who: "atletas da assessoria",
        cells: ["Encontro com o treinador", "Shakeout com o grupo", "Suporte na prova", "Follow-up do treinador"],
      },
      {
        id: "pass",
        name: "PASS",
        who: "assinantes",
        cells: ["Encontro da comunidade", "Café da manhã", "Guarda-volumes e recuperação", "Fotos e resultados"],
      },
      {
        id: "powered",
        name: "Powered",
        who: "clubes parceiros",
        cells: ["Encontro dos clubes", "Shakeout do clube", "Ponto de apoio do clube", null],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        who: "time corporativo",
        cells: [null, null, "Pacote corporativo", "Conteúdo para o RH"],
      },
      {
        id: "brands",
        name: "Marcas",
        who: "patrocinadores",
        cells: ["Ativação no encontro", "Teste de produto", "Hidratação e recuperação", "Conteúdo da prova"],
      },
    ],
  },

  // Passo 2 — receitas possíveis
  revenue: {
    label: "Receitas possíveis",
    tag: "Hipótese",
    layers: [
      { name: "Naming rights", payer: "Marcas" },
      { name: "Ativações de marca", payer: "Marcas e parceiros" },
      { name: "Pacotes corporativos", payer: "Empresas" },
      { name: "Valor da assinatura", payer: "Coaching e PASS (retenção)" },
      { name: "Comissões de parceiros", payer: "Serviços vendidos na House" },
    ],
  },

  // Passo 3 — simulação
  sim: {
    title: "Simulador de uma BORA House",
    note: "Premissas ajustáveis ao vivo. Cota e pacote são preços hipotéticos, não dados da BORA.",
    audienceLabel: "Público na House",
    pricesLabel: "Preços hipotéticos",
    resultsLabel: "Resultado",
    inputs: {
      coaching: { label: "Atletas Coaching na prova", min: 0, max: 400, step: 10, value: 120 },
      pass: { label: "Assinantes PASS", min: 0, max: 400, step: 10, value: 80 },
      clubs: { label: "Clubes Powered presentes", min: 0, max: 10, step: 1, value: 3 },
      members: { label: "Membros por clube", min: 10, max: 120, step: 5, value: 40 },
      corporate: { label: "Time corporativo (pessoas)", min: 0, max: 200, step: 10, value: 30 },
      naming: { label: "Cota de naming", min: 0, max: 100000, step: 5000, value: 25000 },
      pack: { label: "Pacote corporativo por pessoa", min: 100, max: 1000, step: 25, value: 350 },
    },
    outputs: {
      people: "Pessoas atendidas",
      layers: "Receita por camada",
      naming: "Naming rights",
      corporate: "Pacotes corporativos",
      subscription: "Valor da assinatura",
      subscriptionValue: (n: string) => `${n} pessoas`,
      subscriptionNote: "Coaching + PASS: incluído na assinatura (retenção, sem cobrança avulsa)",
      total: "Receita total da House",
      excluded: "Fora da conta: ativações de marca e comissões de parceiros.",
    },
  },
} as const;
