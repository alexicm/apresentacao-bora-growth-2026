import type { SlideMeta } from "../types";

export const meta = {
  id: "expansion-pipeline",
  title: "O pipeline de expansão",
  chapter: "system",
  // s0 Rota A · s1 Rota B · s2 a cidade e as saídas · s3 comparativo e exemplos
  steps: 4,
  theme: "light",
  summary: "Duas rotas até uma nova cidade. As primeiras estações já rodam.",
} as const satisfies SlideMeta;

export const copy = {
  label: "Pipeline de expansão",
  title: "O pipeline de expansão",
  // Cada item precisa caber em uma linha a 1440px (revelação por máscara).
  headline: ["Duas rotas.", "**Uma cidade BORA.**"],
  lede: "O pipeline como um todo ainda é ideia. Mas as primeiras estações das duas rotas já rodam: POWERED, capitães, OPEN e desafios.",
  mapLabel:
    "Mapa do pipeline de expansão. Rota A, por parceiros: comunidade, BORA POWERED (já roda), parceiro estratégico, operação conjunta e unidade BORA. Rota B, por demanda: capitão (já roda), BORA OPEN (já roda), desafio (já roda), PASS (ideia), demanda por Coaching e unidade BORA. As duas seguem até a cidade BORA. Saídas possíveis: continuar Powered ou seguir como comunidade.",
  routeA: {
    badge: "A",
    name: "Rota A",
    kind: "Expansão por parceiros",
    stations: ["Comunidade", "BORA POWERED", "Parceiro estratégico", "Operação conjunta"],
    /** Ação por trás de cada estação (id em GROWTH_PROJECTS; null = etapa da rota). */
    stationIds: [null, "powered", null, null],
  },
  routeB: {
    badge: "B",
    name: "Rota B",
    kind: "Expansão por demanda",
    stations: ["Capitão", "BORA OPEN", "Desafio", "PASS", "Demanda por Coaching"],
    stationIds: ["captains", "open", "challenges", "pass", null],
  },
  legend: { rodando: "Já roda", ideia: "Ideia", step: "Etapa da rota" },
  unit: "Unidade BORA",
  city: "Cidade BORA",
  exits: {
    a: "Continuar Powered já é vitória.",
    b: ["Segue como comunidade,", "sem operação completa."],
  },
  // Cada item precisa caber em uma linha a 1440px.
  statement: ["Um pipeline,", "**==não uma obrigação.==**"],
  notes: ["Nem todo clube precisa virar BORA.", "Nem toda cidade precisa virar operação completa."],
  compare: {
    title: "Rota A × Rota B",
    columns: { criterion: "Critério", a: "Rota A · Parceiros", b: "Rota B · Demanda" },
    rows: [
      { criterion: "Velocidade", a: "Rápida: parte de uma comunidade que já existe", b: "Gradual: a comunidade nasce do zero" },
      { criterion: "Capital necessário", a: "Dividido com o parceiro", b: "Baixo no teste, alto só na abertura" },
      { criterion: "Controle da operação", a: "Compartilhado: a marca do parceiro pesa", b: "Total da BORA desde o primeiro treino" },
      { criterion: "Risco", a: "Desalinhamento com o parceiro", b: "A demanda não se confirmar (perda limitada ao teste)" },
      { criterion: "Quando usar", a: "Há um clube ou parceiro forte na cidade", b: "Não há parceiro, mas há sinais de demanda" },
    ],
  },
  exampleTag: "Exemplo ilustrativo",
  examples: [
    {
      route: "a",
      title: "Rota A, na prática",
      text: "Um clube forte de uma capital adota o BORA POWERED. Com resultado, vira parceiro estratégico e os dois abrem uma operação conjunta, que pode virar unidade BORA.",
    },
    {
      route: "b",
      title: "Rota B, na prática",
      text: "Numa cidade sem parceiro, capitães fazem Opens semanais. Desafios e PASS revelam quem quer mais; quando a demanda por Coaching se prova, a unidade abre.",
    },
  ],
} as const;
