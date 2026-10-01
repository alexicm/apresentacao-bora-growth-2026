import type { SlideMeta } from "../types";

export const meta = {
  id: "boost",
  title: "BORA BOOST",
  chapter: "ideas",
  // s0 por quê · s1 cadeia linear · s2 a cadeia vira circuito · s3 quem recebe o quê · s4 exemplo + simulador · s5 ficha da ação
  steps: 6,
  theme: "dark",
  summary: "Ideia: verba de marcas vira estrutura e experiências para os clubes.",
} as const satisfies SlideMeta;

export const copy = {
  label: "BORA BOOST",
  headline: ["Capital de crescimento", "**para ==comunidades.==**"],
  // Linha em português do que é (padrão de ação explicada).
  why: "Marcas financiam estrutura e experiências nos clubes Powered. **A BORA administra a verba e mede o resultado para a marca.**",

  // Cadeia linear (passo 1) → circuito (passo 2). A ordem é a do circuito.
  nodes: [
    { id: "brand", label: "Marca", caption: "coloca a verba" },
    { id: "boost", label: "BORA BOOST", caption: "administra" },
    { id: "clubs", label: "Clubes Powered", caption: "recebem créditos" },
    { id: "runners", label: "Corredores", caption: "vivem a experiência" },
    { id: "data", label: "Dados / resultado", caption: "provam o retorno" },
  ],
  creditsLabel: "Os créditos viram",
  credits: ["Fotografia", "Hidratação", "Eventos", "Uniformes", "Recuperação", "Teste de produto", "Estrutura", "Experiências de prova"],

  // O que circula em cada trecho do circuito (o "pacote" muda de nome a cada nó).
  flowTitle: "Como o dinheiro circula",
  flow: [
    { token: "R$", route: "Marca → BORA", text: "A marca investe em comunidades reais, não em impressões." },
    { token: "Créditos", route: "BORA → Clubes", text: "A BORA converte a verba em créditos para fotografia, hidratação, eventos, uniformes…" },
    { token: "Experiência", route: "Clubes → Corredores", text: "O clube entrega um treino, uma prova, um encontro melhor." },
    { token: "Check-ins", route: "Corredores → Dados", text: "Cada participação vira dado, medido no BORA ID." },
    { token: "Resultados", route: "Dados → Marca", text: "A marca recebe o resultado medido e reinveste." },
  ],

  receivesTitle: "Quem recebe o quê",
  receives: [
    { id: "brand", who: "A marca recebe", items: ["Participantes", "Testes de produto", "Conteúdo", "Check-ins", "Leads qualificados", "Uso de cupons", "Vendas atribuídas"] },
    { id: "boost", who: "A BORA recebe", items: ["Receita", "Distribuição", "Dados", "Rede BORA mais forte"] },
    { id: "clubs", who: "O clube recebe", items: ["Infraestrutura", "Experiências melhores", "Crescimento", "Patrocinadores"] },
    { id: "runners", who: "O corredor recebe", items: ["Uma experiência de comunidade melhor"] },
  ],
  receivesTakeaway: "**O mesmo real trabalha quatro vezes:** vira infraestrutura para o clube, experiência para o corredor, dado para a BORA e resultado para a marca.",

  sim: {
    title: "Simulador de uma campanha BOOST",
    note: "Premissas ajustáveis ao vivo. Não são dados, clientes nem preços da BORA.",
    example: "Uma marca de hidratação financia postos em 10 clubes Powered",
    exampleDetail: "e recebe check-ins, testes de produto e cupons usados.",
    inputs: {
      budget: { label: "Verba da marca", min: 10000, max: 300000, step: 5000, value: 60000 },
      fee: { label: "Taxa de gestão BORA", min: 0.1, max: 0.35, step: 0.01, value: 0.2 },
      clubs: { label: "Clubes Powered participantes", min: 2, max: 30, step: 1, value: 10 },
      members: { label: "Membros médios por clube", min: 30, max: 400, step: 10, value: 120 },
      participation: { label: "Participação nas ativações", min: 0.1, max: 0.9, step: 0.05, value: 0.45 },
    },
    splitTitle: "Para onde vai a verba",
    splitBora: "BORA",
    splitClubs: "clubes ×",
    outputs: {
      perClub: "Crédito por clube",
      reached: "Corredores alcançados",
      cpr: "Custo por corredor alcançado (marca)",
      revenue: "Receita BORA",
    },
  },
} as const;

export type BoostNodeId = (typeof copy.nodes)[number]["id"];
