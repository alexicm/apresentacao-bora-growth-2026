import type { SlideMeta } from "../types";

export const meta = {
  id: "metrics",
  title: "O que medimos",
  chapter: "plan",
  // s0 a North Star · s1–s2 os cinco ramos e suas métricas · s3 simulações (composição e payback)
  steps: 4,
  theme: "light",
  summary: "Um número para acompanhar juntos (Rede BORA ativa) e as perguntas por trás dele.",
} as const satisfies SlideMeta;

export const copy = {
  label: "O que medimos",
  title: "O que medimos",
  // Cada item precisa caber numa linha a 1440px (máscara por linha).
  headline: ["Um número para", "**acompanhar juntos.**"],
  lede: "A Rede BORA ativa mostra se a estratégia avança: quantos BORA IDs tiveram atividade no mês. Cinco perguntas de negócio explicam o porquê.",
  northStarLabel: "North Star",
  northStar: "Rede BORA ativa",
  northStarDef: "BORA IDs ativos nos últimos 30 dias, somando Open, Powered, Enterprise, PASS e Coaching.",
  northStarTag: "Definição proposta",
  treeLabel: "Árvore de métricas: a North Star se desdobra em cinco ramos e suas métricas",
  metricsCount: "métricas",
  hint: "Passe o mouse ou foque uma métrica para ver a definição.",
  branches: [
    {
      name: "Rede",
      question: "A rede está crescendo?",
      metrics: [
        { name: "BORA IDs ativos", def: "IDs com atividade nos últimos 30 dias." },
        { name: "Participantes do Open", def: "Pessoas únicas nos treinos BORA OPEN." },
        { name: "Membros Powered", def: "Membros ativos em clubes Powered." },
        { name: "Membros Enterprise", def: "Colaboradores ativos em programas B2B." },
        { name: "Membros PASS", def: "Assinantes ativos do BORA PASS." },
      ],
    },
    {
      name: "Conversão",
      question: "A rede vira cliente?",
      metrics: [
        { name: "ID → PASS", def: "% de IDs que assinam o PASS, por coorte." },
        { name: "ID → Desafio", def: "% de IDs que entram em um desafio." },
        { name: "Desafio → Coaching", def: "% de concluintes que viram Coaching." },
        { name: "Powered → Coaching", def: "% de membros Powered que viram Coaching." },
        { name: "Enterprise → Coaching", def: "% de colaboradores que viram Coaching." },
      ],
    },
    {
      name: "Receita",
      question: "De onde vem a receita?",
      metrics: [
        { name: "MRR do Coaching", def: "Receita recorrente mensal do Coaching." },
        { name: "MRR do PASS", def: "Receita recorrente mensal do PASS." },
        { name: "ARR Enterprise", def: "Receita anual contratada com empresas." },
        { name: "Receita de marcas", def: "Boost, naming rights e ativações." },
        { name: "Receita por comunidade", def: "Receita atribuída a cada comunidade." },
      ],
    },
    {
      name: "Economia",
      question: "O crescimento se paga?",
      metrics: [
        { name: "CAC", def: "Custo incremental de aquisição ÷ novos pagantes." },
        { name: "Payback", def: "CAC ÷ margem de contribuição mensal." },
        { name: "Margem de contribuição", def: "Receita menos custos de treinador, app, estrutura, taxas e comissões." },
        { name: "Retenção", def: "Permanência por coorte (D30 / D90)." },
        { name: "Receita por treinador", def: "Receita ÷ treinadores ativos." },
      ],
    },
    {
      name: "Expansão",
      question: "A próxima cidade está pronta?",
      metrics: [
        { name: "Tempo até 100 membros ativos", def: "Dias até os primeiros 100 membros ativos numa cidade." },
        { name: "Custo para ativar uma cidade", def: "Investimento até a primeira operação validada." },
        { name: "Demanda antes do lançamento", def: "IDs, Open e desafios antes de abrir unidade." },
        { name: "Tempo até o break-even", def: "Meses até a unidade se pagar." },
      ],
    },
  ],

  // ── Simulações (passo 3) ────────────────────────────────────────────
  composition: {
    title: "Como a North Star se compõe",
    tag: "Simulação · dados demo",
    note: "Cenário ilustrativo de uma cidade, com IDs únicos por camada. Não são dados da BORA.",
    layers: [
      { key: "open", label: "Open", value: 600, max: 2000, network: true },
      { key: "powered", label: "Powered", value: 450, max: 1500, network: true },
      { key: "enterprise", label: "Enterprise", value: 250, max: 1000, network: true },
      { key: "pass", label: "PASS", value: 200, max: 1000, network: true },
      { key: "coaching", label: "Coaching", value: 350, max: 1500, network: false },
    ],
    total: "Rede BORA ativa (demo)",
    share: "da rede não depende de mídia paga",
    legendNetwork: "Camadas de rede",
    legendMedia: "Coaching (premissa: mídia paga)",
    premise: "Premissa conservadora: toda a camada Coaching conta como adquirida por mídia.",
    branchLink: "Ramo Rede",
  },
  payback: {
    title: "Payback",
    tag: "Simulação",
    note: "Premissas ajustáveis. Não são dados da BORA.",
    cac: "CAC",
    margin: "Margem de contribuição mensal",
    result: "meses de payback",
    formula: "Payback = CAC ÷ margem de contribuição mensal",
    perMonth: "/mês",
    months: "meses",
    over: "12+",
    branchLink: "Ramo Economia",
  },
} as const;
