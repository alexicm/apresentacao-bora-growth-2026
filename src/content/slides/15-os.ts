import type { SlideMeta } from "../types";

export const meta = {
  id: "os",
  title: "BORA OS",
  chapter: "system",
  // s0 o núcleo · s1 módulos + jornada de um ID · s2 integrações possíveis · s3 o que o OS vai responder · s4 resposta (demo)
  steps: 5,
  theme: "dark",
  summary: "A base comum de dados, já rodando: um BORA ID por corredor.",
} as const satisfies SlideMeta;

export type OsModule =
  | "CRM"
  | "OPEN"
  | "POWERED"
  | "ENTERPRISE"
  | "ASSINATURAS"
  | "EVENTOS"
  | "GROWTH"
  | "PARCEIROS"
  | "RECEITA"
  | "INTELIGÊNCIA";

export const copy = {
  label: "BORA OS",
  title: "BORA OS",
  // Cada item precisa caber numa linha a 1440px (máscara por linha).
  headline: ["O BORA OS", "**já está rodando.**"],
  lede: "Um BORA ID por corredor, do primeiro Open ao Coaching. **Já em execução: BORA ID, CRM e tracking.** Os módulos e as integrações entram por etapas.",

  // ── Diagrama ─────────────────────────────────────────────────────────
  diagramLabel: "BORA OS: camada de identidade no centro, dez módulos ao redor e integrações possíveis nas bordas",
  osLabel: "BORA OS",
  core: "Camada de identidade BORA",
  coreKicker: "BORA ID",
  coreCaption: "Um corredor · Um ID · Todos os pontos de contato",
  modules: ["CRM", "OPEN", "POWERED", "ENTERPRISE", "ASSINATURAS", "EVENTOS", "GROWTH", "PARCEIROS", "RECEITA", "INTELIGÊNCIA"] as OsModule[],
  integrationsTitle: "Integrações possíveis",
  /** Portas nas bordas do chip, agrupadas pelo tipo de dado. */
  ports: [
    { side: "top", group: "Aquisição", items: ["Site", "Meta", "Google"] },
    { side: "right", group: "Transação", items: ["Pagamentos", "WhatsApp"] },
    { side: "bottom", group: "Presença", items: ["Check-in", "Eventos"] },
    { side: "left", group: "Treino", items: ["Runy", "Strava*"] },
  ] as const,
  integrationsTag: "Integrações: arquitetura-alvo",
  footnote: "Portas tracejadas = integrações possíveis, nem todas ativas hoje. *Strava onde for técnica e contratualmente possível.",

  // ── Exemplo: o caminho de um BORA ID (passos 1–2) ───────────────────
  journey: {
    title: "O caminho de um BORA ID",
    who: "Júlia (fictícia)",
    id: "ID #0417",
    stops: [
      { when: "Sáb · 07h", what: "Check-in no BORA OPEN", modules: ["OPEN", "EVENTOS", "CRM"] as OsModule[] },
      { when: "Semana 3", what: "Entra no Desafio 5K", modules: ["GROWTH", "EVENTOS", "RECEITA"] as OsModule[] },
      { when: "Semana 11", what: "Assina o BORA PASS", modules: ["ASSINATURAS", "PARCEIROS", "RECEITA"] as OsModule[] },
      { when: "Mês 5", what: "Vira cliente de Coaching", modules: ["ASSINATURAS", "RECEITA", "INTELIGÊNCIA", "CRM"] as OsModule[] },
    ],
    moral: "O mesmo ID do primeiro treino à assinatura: nenhum dado recomeça do zero.",
  },

  // ── Perguntas (passo 3) e resposta demo (passo 4) ───────────────────
  question: "O que o OS **vai responder.**",
  questionLines: ["O que o OS", "**vai responder.**"],
  questionsLabel: "Perguntas que só uma base comum responde",
  answerLabel: "Resposta",
  answerHint: "Clique numa pergunta para trocar a resposta.",
  osToggle: { label: "Fonte dos dados", without: "Sem OS", with: "Com OS" },
  withoutOs: "Sem uma camada comum, os dados ficariam espalhados em planilhas, WhatsApp, app e plataformas de inscrição. E a pergunta ficaria sem resposta.",
  /** Célula sem valor no modo "Sem OS". */
  noData: "sem dado",
  readingLabel: "Leitura (demo)",
  demoNote: "Nomes fictícios e números de demonstração. Não são dados da BORA.",
  questions: [
    {
      q: "Qual clube gera mais clientes de Coaching?",
      modules: ["POWERED", "CRM", "RECEITA"] as OsModule[],
      demo: {
        cols: ["Clube", "Membros ativos", "Clientes (90\u00a0d)", "Conversão"],
        rows: [
          ["Clube Aurora", "118", "14", "11,9%"],
          ["Sunset Run Club", "142", "11", "7,7%"],
          ["Pace Norte", "87", "6", "6,9%"],
          ["Trilha Leste", "64", "3", "4,7%"],
        ],
        reading: "Clube Aurora converte mais: prioridade para bolsas de Coaching e para o Boost.",
      },
    },
    {
      q: "Qual capitão gera a maior retenção?",
      modules: ["GROWTH", "ASSINATURAS", "CRM"] as OsModule[],
      demo: {
        cols: ["Capitão", "Bairro", "IDs gerados", "Retenção D90"],
        rows: [
          ["Capitã Ana", "Bairro Norte", "64", "71%"],
          ["Capitã Bia", "Centro", "41", "63%"],
          ["Capitão Léo", "Bairro Lago", "88", "52%"],
          ["Capitão Rui", "Bairro Sul", "57", "44%"],
        ],
        reading: "Ana gera menos IDs que Léo, mas retém mais: o roteiro dela vira padrão.",
      },
    },
    {
      q: "Qual desafio gera o melhor LTV?",
      modules: ["GROWTH", "RECEITA", "INTELIGÊNCIA"] as OsModule[],
      demo: {
        cols: ["Desafio", "Concluintes", "→ Coaching", "LTV relativo"],
        rows: [
          ["Primeira meia (21K)", "74", "19%", "1,8×"],
          ["Desafio 10K", "180", "14%", "1,5×"],
          ["Retorno à corrida", "66", "11%", "1,2×"],
          ["Desafio 5K", "260", "8%", "1,0×"],
        ],
        reading: "A meia forma menos gente, mas gera o maior LTV: merece mais verba de lançamento.",
      },
    },
    {
      q: "Qual cidade tem demanda latente?",
      modules: ["OPEN", "EVENTOS", "INTELIGÊNCIA"] as OsModule[],
      demo: {
        cols: ["Cidade", "IDs sem unidade", "Open (90\u00a0d)", "Sinal"],
        rows: [
          ["Cidade A", "412", "260", "Alto"],
          ["Cidade C", "180", "140", "Médio"],
          ["Cidade B", "230", "95", "Médio"],
          ["Cidade D", "75", "20", "Baixo"],
        ],
        reading: "A Cidade A já tem demanda antes da unidade: candidata ao próximo playbook.",
      },
    },
    {
      q: "Qual empresa gera mais upgrades?",
      modules: ["ENTERPRISE", "ASSINATURAS", "RECEITA"] as OsModule[],
      demo: {
        cols: ["Empresa", "Colaboradores", "Upgrades", "Taxa"],
        rows: [
          ["Empresa A", "210", "19", "9,0%"],
          ["Empresa C", "120", "8", "6,7%"],
          ["Empresa B", "340", "17", "5,0%"],
          ["Empresa D", "95", "3", "3,2%"],
        ],
        reading: "A Empresa A tem menos gente e mais upgrades: vira o modelo da próxima venda B2B.",
      },
    },
    {
      q: "Qual evento produz os corredores mais qualificados?",
      modules: ["EVENTOS", "CRM", "INTELIGÊNCIA"] as OsModule[],
      demo: {
        cols: ["Evento", "Participantes", "Assinantes", "Qualificação"],
        rows: [
          ["Largada coletiva 10K", "220", "31", "1,9"],
          ["Treino de pista", "60", "9", "1,7"],
          ["Corrida noturna", "150", "18", "1,4"],
          ["Open de sábado", "480", "22", "0,8"],
        ],
        reading: "O Open traz volume; a largada coletiva do 10K traz os corredores mais qualificados.",
      },
    },
  ],
} as const;
