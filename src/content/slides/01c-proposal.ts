import type { SlideMeta } from "../types";

export const meta = {
  id: "proposal",
  title: "A proposta",
  chapter: "opening",
  // s0 a proposta em uma frase · s1 o roteiro em três partes
  steps: 2,
  theme: "light",
  summary: "O que proponho, em uma frase, e o roteiro da conversa.",
} as const satisfies SlideMeta;

export const copy = {
  label: "A proposta",
  // Uma linha visual por item (a revelação é por máscara).
  headline: ["O que eu proponho:", "**crescer por ==comunidades.==**"],
  // {total} e {rodando} vêm de projects.ts (contagens do pack).
  lede: "Um pack de {total} ações para a BORA crescer onde os corredores já estão: clubes, empresas, provas e bairros. Delas, {rodando} já estão rodando; as outras são testadas em Brasília antes de escalar.",
  roadmapLabel: "Roteiro da conversa",
  // `chapters` = capítulos de src/content/deck.ts que formam cada parte (o intervalo de slides é calculado).
  acts: [
    {
      title: "Por que mudar",
      text: "Hoje a BORA cresce um atleta de cada vez. A tese: ir onde os corredores já estão.",
      chapters: ["shift"],
    },
    {
      title: "O que fazer e como",
      text: "As ações, o método, o que já roda, as ideias a validar e como tudo se conecta.",
      chapters: ["pack", "running", "next", "system"],
    },
    {
      title: "O plano",
      text: "Os próximos 90 dias em Brasília, o número que mede o resultado e o que preciso de vocês.",
      chapters: ["plan", "close"],
    },
  ],
  /** {from} e {to} = números dos slides. */
  range: "Slides {from} a {to}",
  /** Rótulo acessível do atalho: {title} = nome da parte. */
  goTo: "Ir para a parte {title}",
} as const;
