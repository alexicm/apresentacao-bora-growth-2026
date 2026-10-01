import type { SlideMeta } from "../types";

export const meta = {
  id: "captains",
  title: "BORA CAPTAINS",
  chapter: "running",
  // 7 passos do fluxo (o 1º junto com a manchete) + portão "Abrir operação?" + simulador + ficha da ação.
  steps: 10,
  theme: "dark",
  summary: "Líderes locais criam demanda no bairro antes de a BORA investir em estrutura.",
} as const satisfies SlideMeta;

export const copy = {
  label: "BORA CAPTAINS",
  title: "BORA CAPTAINS",
  // Cada item precisa caber em uma linha (revelação por máscara).
  headline: ["Primeiro a ==demanda.==", "**Depois a estrutura.**"],
  // Linha em português do que é (padrão de ação explicada).
  lede: "Líderes locais que puxam treinos abertos no próprio bairro. A estrutura só chega onde a demanda aparece.",
  city: "Goiânia",
  cityNote: "Exemplo conceitual · não é a próxima cidade",
  mapLabel: "Mapa abstrato de uma cidade dividida em bairros, com Goiânia como exemplo conceitual",
  steps: [
    { title: "Recrutar capitães", body: "Líderes locais com credibilidade no bairro." },
    { title: "Lançar o BORA OPEN", body: "Treinos abertos e gratuitos, com check-in." },
    { title: "Formar comunidade", body: "A frequência forma grupos e gera BORA IDs." },
    { title: "Lançar desafios", body: "Metas com prazo revelam intenção." },
    { title: "Testar empresas", body: "Primeiros programas com empresas do entorno." },
    { title: "Medir a demanda", body: "Densidade por bairro vira sinal." },
    { title: "Abrir a operação completa só com validação", body: "A estrutura vem depois da demanda." },
  ],
  legend: { captain: "Capitão", runner: "BORA ID", challenge: "Em desafio", company: "Empresa", hub: "BORA HUB" },
  hub: "BORA HUB",
  density: {
    title: "IDs recorrentes por bairro",
    threshold: "Limiar",
    // Valores ilustrativos do exemplo: medição (passo 6) → validação (passo 7).
    measured: [34, 29, 21],
    validated: [52, 46, 26],
    max: 60,
  },
  gate: {
    title: "Abrir operação?",
    caption: "Critérios para abrir operação",
    columns: { criterion: "Critério", signal: "Sinal", threshold: "Limiar hipotético" },
    rows: [
      { criterion: "Demanda", signal: "IDs recorrentes por bairro", threshold: "≥ 40 em 2+ bairros" },
      { criterion: "Comunidade", signal: "Pessoas por treino", threshold: "≥ 25, toda semana" },
      { criterion: "Retenção", signal: "Semanas medidas · % recorrente", threshold: "≥ 8 semanas · ≥ 30%" },
      { criterion: "Empresas", signal: "Empresas testando no entorno", threshold: "≥ 2" },
    ],
    yes: "Sim",
    decision: "Os quatro sinais apareceram: hora de abrir a operação completa.",
  },
  statement: ["Expansão **por demanda.**"],
  sim: {
    title: "Simulador de demanda da cidade",
    note: "Premissas ajustáveis, não são dados da BORA. Fixos no modelo: cerca de 8% de rostos novos a cada treino e bairros com atração diferente.",
    inputs: {
      captains: "Capitães",
      perSession: "Pessoas por treino",
      sessions: "Treinos semanais por capitão",
      weeks: "Semanas de teste",
      recurring: "% que vira ID recorrente",
      companies: "Empresas em teste",
    },
    results: { ids: "IDs recorrentes", hoods: "Bairros acima do limiar", open: "Abrir operação?" },
    of: "de",
    yes: "Sim",
    notYet: "Ainda não",
    gateLabel: "Critérios (limiares hipotéticos)",
    criteria: ["Demanda", "Comunidade", "Retenção", "Empresas"],
    defaults: { captains: 3, perSession: 40, sessions: 2, weeks: 12, recurring: 0.35, companies: 2 },
    thresholds: { idsPerHood: 40, hoods: 2, perSession: 25, weeks: 8, recurring: 0.3, companies: 2 },
    companyOptions: ["0", "1", "2", "3"],
  },
} as const;
