import type { SlideMeta } from "../types";

export const meta = {
  id: "fundacao",
  title: "Fundação",
  chapter: "fronts",
  // s0 as 3 ações · s1 o caminho de um BORA ID (exemplo fictício) · s2 ficha BORA ID · s3 ficha CRM + tracking
  steps: 4,
  theme: "dark",
  summary: "BORA ID, CRM + tracking e BORA OS: saber quem é cada corredor e de onde veio.",
} as const satisfies SlideMeta;

// As ações (nome, fase, o que é, primeiro passo, métrica) vêm de GROWTH_PROJECTS em src/content/projects.ts.
export const copy = {
  front: "Fundação",
  // Uma linha visual por item (a revelação é por máscara).
  headline: ["Sem dado, não há rede.", "**Primeiro, ==um ID por corredor.==**"],
  lede: "Antes de qualquer canal novo: saber quem é cada corredor, de onde veio e o que fez.",
  briefs: ["bora-id", "crm-tracking"],

  journey: {
    label: "O caminho de um BORA ID",
    who: "Júlia",
    id: "ID #0417",
    stops: [
      { when: "Sábado, 7h", what: "Check-in no treino aberto", record: "Origem: BORA OPEN" },
      { when: "Semana 3", what: "Entra no Desafio 5K", record: "Meta e prazo" },
      { when: "Semana 10", what: "Cruza a linha de chegada", record: "Quer a próxima meta" },
      { when: "Mês 4", what: "Assina o Coaching", record: "Receita com origem" },
    ],
    moral: "O mesmo ID do primeiro treino à assinatura. **Sem ele, cada etapa ficaria num lugar diferente.**",
    ariaLabel:
      "Exemplo fictício: Júlia faz check-in num treino aberto, entra num desafio 5K, cruza a chegada e assina o Coaching. Tudo fica no mesmo BORA ID.",
  },
} as const;
