import type { SlideMeta } from "../types";

export const meta = {
  id: "foundation",
  title: "A base do funil",
  chapter: "running",
  // s0 medir e atrair (rodando) · s1 converter (backlog) e o atalho para as fichas
  steps: 2,
  theme: "light",
  summary: "O que já roda no funil de hoje: medir, atrair e converter.",
} as const satisfies SlideMeta;

// As ações (nome, estágio, o que é, métrica) vêm de GROWTH_PROJECTS em src/content/projects.ts.
export const copy = {
  label: "A base do funil",
  // Uma linha visual por item (a revelação é por máscara).
  headline: ["Antes dos produtos,", "**a base do funil.**"],
  // {n} = ações de base rodando · {total} = ações rodando no pack · {backlog} = ações de base no backlog.
  lede: "Das {total} ações que já rodam, {n} não são produtos novos: medem e atraem melhor no funil que a BORA já tem. Outras {backlog} entram na próxima janela para converter mais.",
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
  hint: "Clique numa ação para ver a ficha completa: como executamos, métrica e prazo.",
  next: "A seguir: os produtos da Rede BORA →",
} as const;
