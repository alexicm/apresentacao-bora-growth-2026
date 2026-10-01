import type { SlideMeta } from "../types";

export const meta = {
  id: "land-and-expand",
  title: "Entrar e expandir",
  chapter: "running",
  // s0 escada · s1–s7 um degrau por → (s7 inclui a simulação) · s8 princípio + tabela
  steps: 9,
  theme: "light",
  summary: "Aprofundar a relação com o clube degrau por degrau.",
} as const satisfies SlideMeta;

export const copy = {
  label: "BORA POWERED · entrar e expandir",
  headline: ["Entrar pequeno.", "**Expandir junto.**"],
  lede: "A BORA entra pela tecnologia e aprofunda a parceria um degrau por vez. Cada passo deixa o clube mais forte antes de pedir algo em troca.",
  axis: { y: "Profundidade da parceria", x: "Tempo" },
  stepLabel: "Degrau {n} de {total}",

  // Clube fictício (o mesmo do slide BORA POWERED).
  club: {
    name: "Sunset Run Club",
    monogram: "SRC",
    intro: "Clube de bairro com 150 membros, liderança própria e treinos três vezes por semana.",
    hint: "Acompanhe a parceria do Sunset com a BORA, um degrau por vez.",
  },
  legend: { done: "Degrau conquistado", next: "Próximos degraus" },
  gains: { club: "O clube ganha", bora: "A BORA ganha" },

  steps: [
    {
      title: "Tecnologia",
      body: "BORA OS Lite: check-in, CRM e eventos para o clube.",
      example: "O Sunset troca a planilha e o grupo de WhatsApp pelo check-in e pelo CRM da BORA.",
      club: "Gestão sem planilha",
      bora: "BORA IDs e dados de engajamento",
    },
    {
      title: "Experiência",
      body: "Tenda, estrutura e suporte em provas.",
      example: "Na prova da cidade, os membros do Sunset têm tenda, guarda-volumes e hidratação da BORA.",
      club: "Estrutura profissional nas provas",
      bora: "Presença no dia que mais importa",
    },
    {
      title: "Benefícios",
      body: "BORA PASS e parceiros para os membros.",
      example: "Membros do Sunset passam a ter acesso ao BORA PASS e a descontos de parceiros.",
      club: "Vantagens que ajudam a reter membros",
      bora: "Assinantes PASS e parceiros ativos",
    },
    {
      title: "Bolsas",
      body: "Atletas selecionados recebem BORA Coaching.",
      example: "Os três destaques da temporada do Sunset ganham bolsas de BORA Coaching.",
      club: "Destaques com treinador",
      bora: "Prova viva do Coaching no clube",
    },
    {
      title: "Desafios",
      body: "Programas de 5K, 10K e 21K dentro do clube.",
      example: "O Sunset lança com a BORA um Desafio 10K de 10 semanas para os membros.",
      club: "Metas coletivas e engajamento",
      bora: "Intenção de performance identificada",
    },
    {
      title: "Conversão",
      body: "Quem busca performance migra para o Coaching.",
      example: "Quem terminou o 10K e quer baixar o tempo entra no BORA Coaching sem sair do clube.",
      club: "Membros evoluindo sem sair do clube",
      bora: "Novos atletas de Coaching",
    },
    {
      title: "Participação na receita",
      short: "Receita",
      body: "O clube participa economicamente.",
      example: "Cada membro do Sunset que vira Coaching gera repasse mensal ao clube.",
      club: "Nova receita recorrente",
      bora: "Canal de distribuição B2B2C",
    },
  ],

  sim: {
    title: "Quanto o clube recebe",
    note: "Exemplo fictício com premissas hipotéticas. Não são dados reais.",
    inputs: {
      members: "Membros do clube",
      conversion: "Viram Coaching",
      fee: "Mensalidade hipotética",
      share: "Repasse ao clube",
    },
    outputs: {
      athletes: "Novos atletas de Coaching",
      revenue: "Receita mensal gerada",
      share: "Repasse ao clube/mês",
    },
    yearly: "≈ **{n} por ano** para o clube. E o atleta continua no clube.",
  },

  quote: ["Não roube a comunidade.", "**Torne a comunidade ==mais valiosa.==**"],
  table: { title: "O que cada lado ganha", step: "Degrau", tag: "Modelo de parceria" },
} as const;
