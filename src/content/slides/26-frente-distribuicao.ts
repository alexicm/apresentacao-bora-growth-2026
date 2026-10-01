import type { SlideMeta } from "../types";

export const meta = {
  id: "distribuicao",
  title: "Distribuição",
  chapter: "fronts",
  // s0 as 3 ações · s1 o clube sem a BORA · s2 o clube com a BORA · s3 ficha POWERED · s4 ficha HOUSE
  steps: 5,
  theme: "dark",
  summary: "POWERED, HOUSE e BOOST: clubes, provas e marcas como canais da BORA.",
} as const satisfies SlideMeta;

export const copy = {
  front: "Distribuição",
  headline: ["Um clube parceiro traz", "**a ==comunidade inteira.==**"],
  lede: "Clubes e provas já reúnem corredores. A BORA daria estrutura, sem tirar a identidade de ninguém.",
  briefs: ["powered", "house"],

  // Clube fictício de exemplo (o mesmo da versão longa).
  visualLabel: "BORA POWERED · um clube de bairro",
  club: { name: "Sunset", suffix: "Run Club" },
  poweredBy: "Powered by BORA",
  toggleLabel: "Operação do clube",
  toggle: { without: "Sem a BORA", with: "Com a BORA" },
  withoutItems: ["Grupos de WhatsApp", "Planilhas", "Pix manual", "Lista no papel", "Patrocínio avulso", "Eventos improvisados"],
  withoutCaption: "Operação manual e fragmentada. Tudo depende do líder.",
  withCaption: "A BORA entraria com estrutura. O clube continuaria sendo o clube.",
  boraTitle: "A BORA traria",
  boraItems: ["Tecnologia", "Check-in", "CRM", "Eventos", "BORA House", "Benefícios", "Patrocinadores", "Experiências", "Bolsas", "Programas de performance"],
  clubTitle: "O clube traria",
  clubItems: ["Comunidade", "Distribuição", "Liderança", "Cultura", "Audiência"],
  equation: "A BORA não compraria o clube nem disputaria seus membros: trocaria estrutura por distribuição.",
} as const;
