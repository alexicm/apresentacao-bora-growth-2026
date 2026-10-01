import type { SlideMeta } from "../types";

export const meta = {
  id: "powered",
  title: "BORA POWERED",
  chapter: "later",
  // s0 o clube · s1 sem a BORA · s2 com a BORA · s3 a equação · s4 ficha da ação
  steps: 5,
  theme: "dark",
  summary: "Clubes independentes usam a estrutura da BORA, sem perder a identidade.",
} as const satisfies SlideMeta;

export const copy = {
  label: "BORA POWERED",
  title: "BORA POWERED",
  // Uma linha visual por item (a revelação usa máscara por linha).
  headline: ["Seu clube.", "**Powered**", "**by BORA.**"],
  // Linha em português do que é (padrão de ação explicada).
  lede: "Clubes de corrida independentes usam a estrutura da BORA sem perder nome, cultura e liderança.",
  club: { name: "Sunset", suffix: "Run Club", monogram: "SRC" },
  poweredBy: "Powered by BORA",
  toggle: { without: "Sem a BORA", with: "Com a BORA" },
  withoutItems: ["Grupos de WhatsApp", "Planilhas", "Pix manual", "Lista no papel", "Patrocínio avulso", "Eventos improvisados"],
  withoutCaption: "Operação manual e fragmentada. Tudo depende do líder.",
  withCaption: "Infraestrutura e distribuição conectadas. O clube continua sendo o clube.",
  boraTitle: "A BORA traz",
  boraItems: ["Tecnologia", "Check-in", "CRM", "Eventos", "BORA House", "Benefícios", "Patrocinadores", "Experiências", "Bolsas", "Programas de performance"],
  clubTitle: "O clube traz",
  clubItems: ["Comunidade", "Distribuição", "Liderança", "Cultura", "Audiência"],
  equation: ["Clube", "BORA", "Distribuição B2B2C"],
  equationLede: "A BORA não compra o clube nem disputa seus membros: oferece infraestrutura em troca de distribuição.",
} as const;
