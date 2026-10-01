import type { SlideMeta } from "../types";

export const meta = {
  id: "plano",
  title: "O plano proposto",
  chapter: "plan",
  // s0 Construir · s1 Pilotar, Aprender e a saída (playbook) · s2 o número que mediria tudo
  steps: 3,
  theme: "light",
  summary: "Se aprovado: 90 dias em Brasília, em três tempos, medidos pela Rede BORA ativa.",
} as const satisfies SlideMeta;

// As ações de cada janela vêm do `horizon` de GROWTH_PROJECTS (projects.ts). É um calendário proposto, não um cronograma iniciado.
export const copy = {
  label: "O plano proposto · 90 dias",
  // Uma linha visual por item (a revelação é por máscara).
  headline: ["Se aprovado, 90 dias", "**em ==três tempos.==**"],
  lede: "Um calendário proposto para Brasília: cada ação ganharia ficha, meta e dono, e as ideias entrariam só como teste.",
  phases: [
    { id: "build", range: "0 a 30 dias · Fase 1", name: "Construir", text: "Base de dados, páginas, preço único e o primeiro treino aberto.", horizon: "0–30" },
    { id: "pilot", range: "31 a 60 dias · Fase 2", name: "Pilotar", text: "Pilotos pequenos com clubes, desafios, provas e empresas. O PASS como teste.", horizon: "31–60" },
    { id: "learn", range: "61 a 90 dias · Fase 2", name: "Aprender", text: "Ler os números, testar o BOOST e fechar o Playbook Brasília V1.", horizon: "61–90" },
  ],
  later: { range: "90+ dias", name: "Depois", text: "A próxima cidade seria escolhida pelos dados.", horizon: "90+" },
  northStar: {
    label: "O número que mediria tudo",
    name: "Rede BORA ativa",
    def: "BORA IDs com atividade nos últimos 30 dias, somando Open, Powered, Enterprise, PASS e Coaching.",
    tag: "Definição proposta",
    questionsLabel: "As perguntas por trás dele",
    questions: ["A rede está crescendo?", "A rede vira cliente?", "De onde vem a receita?", "O crescimento se paga?", "A próxima cidade está pronta?"],
  },
  honesty: "Resultado só entraria na conversa depois de medido.",
} as const;
