import type { SlideMeta } from "../types";

export const meta = {
  id: "expansao",
  title: "Expansão",
  chapter: "fronts",
  // s0 as 3 ações · s1 as duas rotas até uma nova cidade · s2 ficha Brasília Lab · s3 ficha Pipeline
  steps: 4,
  theme: "light",
  summary: "Brasília Lab, playbook e pipeline: testar aqui e só depois abrir outra cidade.",
} as const satisfies SlideMeta;

export const copy = {
  front: "Expansão",
  headline: ["Primeiro Brasília.", "**Outra cidade, ==só com dado.==**"],
  lede: "Se aprovado, Brasília seria o laboratório. Outra cidade só abriria com parceiro forte ou demanda medida.",
  briefs: ["lab", "pipeline"],

  visualLabel: "Pipeline de expansão · duas rotas",
  mapLabel:
    "Pipeline de expansão proposto. Rota A, por parceiros: comunidade, BORA POWERED (Fase 2), parceiro estratégico, operação conjunta e unidade BORA. Rota B, por demanda: capitão (Fase 2), BORA OPEN (Fase 1), desafio (Fase 2), PASS (ideia), demanda por Coaching e unidade BORA. As duas chegam à cidade BORA. Saídas possíveis: continuar Powered ou seguir como comunidade.",
  routeA: {
    badge: "A",
    kind: "Por parceiros",
    stations: ["Comunidade", "BORA POWERED", "Parceiro estratégico", "Operação conjunta"],
    /** Ação por trás de cada estação (id em GROWTH_PROJECTS; null = etapa da rota). */
    stationIds: [null, "powered", null, null],
  },
  routeB: {
    badge: "B",
    kind: "Por demanda",
    stations: ["Capitão", "BORA OPEN", "Desafio", "PASS", "Demanda por Coaching"],
    stationIds: ["captains", "open", "challenges", "pass", null],
  },
  legend: { agora: "Fase 1", depois: "Fase 2", ideia: "Ideia", step: "Etapa da rota" },
  unit: "Unidade BORA",
  city: "Cidade BORA",
  exits: {
    a: "Continuar Powered já seria vitória.",
    b: ["Seguir como comunidade,", "sem operação completa."],
  },
  mapNote: "Um pipeline, não uma obrigação: nem todo clube precisaria virar BORA, nem toda cidade, operação completa.",
} as const;
