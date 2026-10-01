import type { SlideMeta } from "../types";

export const meta = {
  id: "conversao",
  title: "Conversão",
  chapter: "fronts",
  // s0 as 4 ações · s1 rotas até o Coaching · s2 ficha CHALLENGES · s3 ficha PASS
  steps: 4,
  theme: "light",
  summary: "CHALLENGES, preço único, pré-cadastro e PASS: transformar interesse em assinatura.",
} as const satisfies SlideMeta;

export const copy = {
  front: "Conversão",
  headline: ["Venda a próxima meta.", "**A assinatura ==vem depois.==**"],
  lede: "Desafios com data dão o motivo para começar. Preço único e pré-cadastro tiram o atrito da venda.",
  /** Nota no topo: o produto atual é onde a frente chega. */
  note: "Destino desta frente: o BORA COACHING, que a BORA já vende.",
  briefs: ["challenges", "pass"],

  visualLabel: "Rotas até o Coaching",
  routes: [
    { id: "a", name: "Rota de entrada", stops: ["OPEN", "Desafio 5K", "Desafio 10K"] },
    { id: "b", name: "Rota de clube", stops: ["Clube Powered", "Desafio 21K"] },
  ],
  finishStop: { label: "Coaching", caption: "a assinatura vem depois" },
  routesLegend: "Cada ponto é um corredor. Nem todos chegariam ao fim, e tudo bem: cada etapa já seria um produto.",
  example: "Turma **BORA 10K** de 10 semanas, com largada coletiva: quem cruzasse a chegada receberia o convite para treinar a meia no Coaching.",
} as const;
