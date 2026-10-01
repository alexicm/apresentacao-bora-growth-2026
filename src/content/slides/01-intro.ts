import type { SlideMeta } from "../types";

export const meta = {
  id: "intro",
  title: "Conquistar comunidades",
  chapter: "opening",
  steps: 1,
  theme: "dark",
  summary: "Não é sobre conquistar corredores. É sobre conquistar comunidades.",
} as const satisfies SlideMeta;

export const copy = {
  session: "Sessão estratégica · 2026",
  // Abaixo do lockup BORA / GROWTH.
  pack: "Pack de Ações e Projetos",
  // Voz da BORA (como no site: "Não é sobre ser rápido. É sobre começar."). Uma linha por item.
  headline: ["Não é sobre conquistar corredores.", "É sobre conquistar ==comunidades.=="],
  // A proposta em uma frase (o roteiro vem no slide "A proposta").
  subheadline: "Ações e projetos de growth para a BORA crescer pelas comunidades onde os corredores já estão.",
  hint: "→ avançar · M mapa · P projetos · F tela cheia",
  photoAlt: "Comunidade BORA reunida: centenas de atletas com a camiseta verde da BORA, de braços para o alto.",
} as const;
