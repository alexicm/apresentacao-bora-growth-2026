import type { SlideMeta } from "../types";

export const meta = {
  id: "problem",
  title: "O problema",
  chapter: "shift",
  steps: 3,
  theme: "light",
  summary: "Crescer atleta por atleta é linear e depende de mídia.",
} as const satisfies SlideMeta;

export const copy = {
  label: "O problema",
  headline: ["A BORA construiu uma assessoria.", "Agora precisa construir **distribuição.**"],
  facts: [
    { value: "3.000+", label: "atletas" },
    { value: "7", label: "regiões com núcleos" },
    { value: "50+", label: "provas com ponto de apoio em 2025" },
  ],
  factsSource: "Números declarados pela BORA em boraassessoria.com (set/2026).",
  today: "Hoje · BORA atual",
  flowLabelOld: "Como a BORA cresce hoje",
  flowLabelNew: "Como a BORA cresce em rede",
  oldFlow: [
    { id: "ad", label: "Anúncio", caption: "mídia paga" },
    { id: "lead", label: "Lead", caption: "formulário" },
    { id: "whatsapp", label: "WhatsApp", caption: "atendimento 1:1" },
    { id: "sales", label: "Venda", caption: "negociação" },
    { id: "coaching", label: "Assessoria", caption: "atleta ativo" },
  ],
  // Manchetes animadas por máscara: cada item do array precisa caber em UMA linha.
  oldStatement: ["Um corredor **de cada vez.**"],
  oldLede:
    "Cada novo atleta passa pelo mesmo funil: mídia, atendimento e venda individual. O crescimento é linear e cada ciclo recomeça do zero.",
  proposed: "BORA Growth · proposta",
  newFlow: [
    { id: "community", label: "Comunidade", caption: "onde já se corre" },
    { id: "lead", label: "Rede", caption: "clubes, empresas, capitães" },
    { id: "whatsapp", label: "Dados", caption: "um BORA ID por pessoa" },
    { id: "sales", label: "Intenção", caption: "a próxima meta" },
    { id: "coaching", label: "Produto", caption: "Open · PASS · Coaching" },
    { id: "revenue", label: "Receita", caption: "B2C, B2B e marcas" },
  ],
  media: { label: "Mídia", caption: "amplifica, não sustenta" },
  newStatement: ["Crescimento não pode", "depender **só de mídia.**"],
  newLede:
    "A mídia continua importante. Mas passa a amplificar um sistema de distribuição, em vez de sustentar o crescimento sozinha.",
  compare: {
    title: "Modelo atual × BORA Growth",
    colCurrent: "Modelo atual",
    colProposed: "BORA Growth",
    rows: [
      { k: "Porta de entrada", a: "Anúncio", b: "Comunidade" },
      { k: "Relação", a: "1 para 1", b: "1 para muitos" },
      { k: "Custo de cada novo atleta", a: "Recomeça do zero", b: "Diluído na rede" },
      { k: "Dados", a: "Espalhados no WhatsApp", b: "Um BORA ID por pessoa" },
      { k: "Receita", a: "Uma linha: assessoria", b: "Várias camadas" },
    ],
  },
} as const;
