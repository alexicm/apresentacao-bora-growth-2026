import type { SlideMeta } from "../types";

export const meta = {
  id: "league",
  title: "BORA LEAGUE",
  chapter: "next",
  // s0 temporada + pontuação · s1 classificação semana a semana · s2 camadas de receita · s3 ficha da ação
  steps: 4,
  theme: "dark",
  summary: "Ideia: uma liga de corrida entre empresas, com várias camadas de receita.",
} as const satisfies SlideMeta;

export const copy = {
  label: "BORA LEAGUE",
  headline: ["Não vence o mais rápido.", "**==Vence quem aparece.==**"],
  // Linha em português do que é (padrão de ação explicada).
  lede: "Uma liga de corrida entre empresas, em temporadas de 8 semanas, que pontua participação e consistência.",

  season: "Temporada de 8 semanas",
  weekShort: "S",
  seasonMarks: { kickoff: "Times", challenge: "Desafio", final: "Evento final" },
  checkins: "check-ins semanais",
  seasonItems: ["Times", "Desafios", "Check-ins", "Consistência", "Participação", "Comunidade", "Evento final"],

  scoringTitle: "Proposta de pontuação",
  scoringCols: { category: "Categoria", action: "Ação", points: "Pontos" },
  scoring: [
    { id: "pp", category: "Participação", action: "Check-in semanal", points: "até 60 por semana" },
    { id: "pc", category: "Consistência", action: "Semanas seguidas ativas", points: "+5 por semana (até 25)" },
    { id: "de", category: "Desafios em equipe", action: "Treino coletivo concluído (sem. 2, 4 e 6)", points: "até 50" },
    { id: "ev", category: "Eventos", action: "Presença no evento final", points: "até 120" },
    { id: "cp", category: "Performance", action: "Evolução dentro da própria faixa", points: "até 12 por semana" },
  ],
  scoringNote: "Os pontos são proporcionais à fatia do time que participa. Empresa grande não vence só por ser grande.",

  leaderboardTitle: "Classificação",
  preseason: "Pré-temporada",
  weekLabel: "Semana",
  weekOf: "de",
  cols: { pos: "Pos.", company: "Empresa", points: "Pontos" },
  legend: { base: "Participação, consistência, desafios e eventos", perf: "Performance" },
  play: "Reproduzir",
  pause: "Pausar",
  replay: "Rever temporada",
  disclaimer: "Empresas ilustrativas: não são clientes. Pontuação simulada.",
  leaderTag: "Líder",

  // Temporada simulada e determinística: % do time com check-in por semana, fator de consistência,
  // sucesso nos desafios (sem. 2, 4, 6), presença no evento final e nível de performance.
  companies: [
    { id: "nubank", name: "Nubank", pp: [0.72, 0.76, 0.72, 0.66, 0.62, 0.6, 0.54, 0.58], pc: 0.52, de: [0.95, 0.7, 0.55], ev: 0.4, cp: 0.75 },
    { id: "inter", name: "Banco Inter", pp: [0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.86, 0.72], pc: 0.62, de: [0.6, 0.75, 0.85], ev: 0.7, cp: 0.55 },
    { id: "xp", name: "XP", pp: [0.8, 0.7, 0.52, 0.58, 0.56, 0.55, 0.6, 0.6], pc: 0.4, de: [0.8, 0.55, 0.55], ev: 0.7, cp: 1 },
    { id: "ambev", name: "Ambev", pp: [0.64, 0.68, 0.72, 0.74, 0.72, 0.7, 0.7, 0.72], pc: 0.7, de: [0.75, 0.95, 0.7], ev: 0.65, cp: 0.6 },
    { id: "meli", name: "Mercado Livre", pp: [0.68, 0.7, 0.8, 0.66, 0.66, 0.64, 0.64, 0.64], pc: 0.58, de: [0.65, 0.6, 0.75], ev: 0.6, cp: 0.8 },
    { id: "boticario", name: "Grupo Boticário", pp: [0.52, 0.58, 0.64, 0.7, 0.76, 0.82, 0.82, 0.84], pc: 0.85, de: [0.55, 0.8, 0.95], ev: 0.92, cp: 0.45 },
  ],
  // Pesos que transformam o perfil em pontos (iguais aos da tabela).
  scoringRules: { checkin: 60, streakStep: 5, streakCap: 5, challenge: 50, challengeWeeks: [2, 4, 6], final: 120, perf: 12 },

  stackHeadline: ["Um produto.", "**==Várias camadas== de receita.**"],
  stackLede: "A mesma temporada pode gerar receita de empresas, marcas e corredores: antes, durante e depois.",
  stackTitle: "Camadas de receita",
  stackProduct: "BORA LEAGUE",
  stackProductLine: "1 temporada · 8 semanas",
  stackPayersTitle: "Quem paga",
  payers: { company: "Empresa", brand: "Marca", runner: "Corredor" },
  when: { before: "Antes", during: "Durante", after: "Depois", next: "Próxima temporada" },
  // De baixo para cima: a base é o contrato; o topo é a renovação.
  stack: [
    { id: "contract", label: "Contrato da empresa", desc: "programa de treino dos colaboradores", payer: "company", when: "before" },
    { id: "entry", label: "Inscrição na liga", desc: "a vaga do time na temporada", payer: "company", when: "before" },
    { id: "naming", label: "Naming rights", desc: "uma marca dá nome à liga", payer: "brand", when: "before" },
    { id: "activation", label: "Ativações de marca", desc: "presença nos desafios e no evento final", payer: "brand", when: "during" },
    { id: "upgrade", label: "Upgrades para Coaching", desc: "colaboradores que viram atletas BORA", payer: "runner", when: "after" },
    { id: "renewal", label: "Renovação", desc: "a próxima temporada começa vendida", payer: "company", when: "next" },
  ],
} as const;

export type LeagueCompany = (typeof copy.companies)[number];
