import type { SlideMeta } from "../types";

export const meta = {
  id: "ecosystem",
  title: "Ecossistema de growth",
  chapter: "system",
  // s0 o mapa (dependências) · s1 a tabela · s2 monte o portfólio (simulação)
  steps: 3,
  theme: "light",
  summary: "Todas as ações do pack e como dependem umas das outras: a base já roda.",
} as const satisfies SlideMeta;

// As ações em si vêm de GROWTH_PROJECTS em src/content/projects.ts (estágio, frente, KPI, dependências).
export const copy = {
  label: "Ecossistema de growth",
  title: "Ecossistema de ações de growth",
  // Cada item precisa caber numa linha a 1440px (máscara por linha).
  headline: ["A base já roda.", "**O resto se apoia nela.**"],
  // {n} = ações que dependem (direta ou indiretamente) de BORA ID ou CRM · {m} = demais ações do pack.
  lede: "BORA ID e CRM já estão rodando, e {n} das outras {m} ações dependem deles. Nenhuma ação funciona sozinha: as ideias entram quando a base já mede.",

  views: { map: "Mapa", table: "Tabela" },
  viewLabel: "Ver o portfólio como",

  /** Números do painel: "22 ações · 6 frentes · 24 dependências". */
  stats: { actions: "ações no pack", fronts: "frentes", deps: "dependências" },

  // ── Mapa ───────────────────────────────────────────────────────────────
  mapLabel: "Mapa do portfólio de growth: seis frentes, ações por estágio e dependências",
  /** Nomes curtos no mapa (o nome completo aparece no painel e na tabela). */
  mapNames: {
    "crm-tracking": "CRM + tracking",
    referral: "Indicação",
    creators: "Influenciadores",
    "landing-cidade": "Landing por cidade",
    "conteudo-intencao": "Conteúdo por intenção",
    media: "Mídia paga",
    "preco-unico": "Preço único",
    "pre-cadastro": "Pré-cadastro",
    lab: "Brasília Lab",
    playbook: "Playbook de cidade",
    pipeline: "Pipeline de expansão",
  } as Record<string, string>,
  /** Nomes curtos para listas de dependências. */
  shortNames: {
    "bora-id": "BORA ID",
    "crm-tracking": "CRM",
    os: "BORA OS",
    open: "OPEN",
    captains: "CAPTAINS",
    powered: "POWERED",
    house: "HOUSE",
    enterprise: "ENTERPRISE",
    lab: "Brasília Lab",
    playbook: "Playbook",
    challenges: "CHALLENGES",
    pass: "PASS",
    boost: "BOOST",
    league: "LEAGUE",
    pipeline: "Pipeline",
    "preco-unico": "Preço único",
    "pre-cadastro": "Pré-cadastro",
    "landing-cidade": "Landing",
    "conteudo-intencao": "Conteúdo",
  } as Record<string, string>,
  railLabels: { "bora-id": "Trilho BORA ID", "crm-tracking": "Trilho CRM" } as Record<string, string>,

  legend: {
    title: "Estágios do pack",
    base: "Base do pack: o BORA COACHING, produto atual",
    baseTag: "Base",
    upstream: "Depende de",
    downstream: "Destrava",
    rails: "Trilhos = Fundação",
  },

  // ── Painel da ação (passo 0) ─────────────────────────────────────────
  inspector: {
    hint: "Passe o mouse ou clique numa ação para ver objetivo, KPI, horizonte e a cadeia de dependências.",
    goal: "Objetivo",
    kpi: "KPI principal",
    deps: "Depende de",
    unlocks: "Destrava",
    noDeps: "Nenhuma (é base)",
    noUnlocks: "Ponta da cadeia",
    coreNote: "Produto atual da BORA, base do pack",
  },

  // ── Tabela (passo 1) ────────────────────────────────────────────────
  columns: { action: "Ação", front: "Frente", stage: "Estágio", goal: "Objetivo", kpi: "KPI principal", horizon: "Quando", deps: "Depende de" },
  tableCaption: "Portfólio de ações de growth: ação, frente, estágio, objetivo, KPI, horizonte e dependências",
  filterLabel: "Filtrar por frente",
  filterAll: "Todas",
  horizonNote: "Quando: janela do plano Brasília Lab (90+ dias = depois dele).",
  noDeps: "·",

  // ── Simulação (passo 2) ─────────────────────────────────────────────
  sim: {
    title: "Monte o portfólio",
    note: "Ilustrativo: ligue por estágio ou clique nas ações do mapa. Não é um plano aprovado.",
    presetsLabel: "Ligar por estágio",
    presets: [
      { value: "rodando", label: "Rodando hoje" },
      { value: "backlog", label: "+ Backlog" },
      { value: "tudo", label: "Tudo" },
    ],
    custom: "Seleção personalizada",
    fronts: "Frentes cobertas",
    on: "ligada",
    off: "desligada",
    activeLabel: "ações do pack ligadas",
    layers: "Camadas da North Star",
    layerNames: { open: "Open", powered: "Powered", enterprise: "Enterprise", pass: "PASS", coaching: "Coaching" },
    layersMissing: "Falta ligar",
    layersAll: "Todas as camadas ligadas",
    measurable: "Mensurável: BORA ID e CRM ligados",
    /** {x} = o que falta ligar (BORA ID, CRM ou os dois). */
    notMeasurable: "Sem {x}, a Rede BORA ativa não é mensurável",
    idName: "BORA ID",
    crmName: "CRM",
    and: "e",
    missing: "Dependências em aberto",
    dependsOn: "depende de",
    noMissing: "Nenhuma. Cada ação ligada tem o que precisa.",
    more: "outras",
    of: "de",
    missingTag: "Falta",
  },
} as const;
