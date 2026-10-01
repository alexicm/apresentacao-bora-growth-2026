import type { SlideMeta } from "../types";

export const meta = {
  id: "foundation",
  title: "A base do funil",
  chapter: "start",
  // s0 medir e atrair · s1 converter e o atalho para as fichas
  steps: 2,
  theme: "light",
  summary: "Fase 1, por onde começar: medir, atrair e converter melhor no funil de hoje.",
} as const satisfies SlideMeta;

// As ações (nome, estágio, o que é, métrica) vêm de GROWTH_PROJECTS em src/content/projects.ts.
export const copy = {
  label: "Fase 1 · a base",
  // Uma linha visual por item (a revelação é por máscara).
  headline: ["Por onde começar:", "**a base do funil.**"],
  // {n} = ações de base na Fase 1 · {total} = ações da Fase 1 no pack.
  lede: "Das {total} ações da Fase 1, {n} são de base: medir cada corredor, atrair com origem medida e converter quem já chega. Nenhuma depende de produto novo.",
  groups: [
    { id: "medir", title: "Medir", sub: "Saber quem é cada corredor e de onde veio.", ids: ["bora-id", "crm-tracking", "os"] },
    {
      id: "atrair",
      title: "Atrair",
      sub: "Trazer gente nova, com a origem medida.",
      ids: ["landing-cidade", "conteudo-intencao", "referral", "creators", "media"],
    },
    { id: "converter", title: "Converter", sub: "Transformar pré-cadastro em venda.", ids: ["preco-unico", "pre-cadastro"] },
  ],
  metric: "Métrica",
  hint: "BORA OS e influenciadores ficam para a Fase 2. Clique numa ação para ver a ficha completa.",
  next: "A seguir: BORA OPEN, o produto da Fase 1 →",
} as const;
