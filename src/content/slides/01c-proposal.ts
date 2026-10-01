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
  // {total} vem de projects.ts (contagem do pack). Nada do pack está em andamento: tudo é proposta.
  lede: "Um pack de {total} ações que posso ajudar a BORA a fazer, de dentro, para crescer onde os corredores já estão: clubes, empresas, provas e bairros. Nada está em andamento: é uma proposta em duas fases, mais ideias para testar antes.",
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
      text: "O pack e o método. Depois, as ações em ordem: Fase 1, Fase 2, ideias a validar e como tudo se conecta.",
      chapters: ["pack", "start", "later", "ideas", "system"],
    },
    {
      title: "O plano",
      text: "O plano de 90 dias proposto, o número que mediria o resultado e o que preciso de vocês.",
      chapters: ["plan", "close"],
    },
  ],
  /** {from} e {to} = números dos slides. */
  range: "Slides {from} a {to}",
  /** Rótulo acessível do atalho: {title} = nome da parte. */
  goTo: "Ir para a parte {title}",
} as const;
