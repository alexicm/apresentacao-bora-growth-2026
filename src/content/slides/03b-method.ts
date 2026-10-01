import type { SlideMeta } from "../types";

export const meta = {
  id: "method",
  title: "O método",
  chapter: "pack",
  // s0 o ciclo (estágios do pack ↔ fases) · s1 priorizar com ICE (simulação) · s2 a ficha de cada ação · s3 cadência e artefatos
  steps: 4,
  theme: "dark",
  summary: "Como uma ideia vira projeto rodando: priorizar, testar, medir e escalar.",
} as const satisfies SlideMeta;

export const copy = {
  label: "O método",
  // Cada item precisa caber numa linha a 1440px (máscara por linha).
  headline: ["Ideia boa não basta.", "**Precisa de ==método.==**"],
  lede: "Toda ação do pack passa pelo mesmo ciclo, da ideia ao projeto rodando, com meta, dono e decisão.",

  // ── Passo 0: o ciclo ─────────────────────────────────────────────────
  cycle: {
    ariaLabel: "Ciclo de growth em cinco fases, ligado aos estágios do pack",
    rowPack: "No pack",
    rowMethod: "No método",
    /** Contagem por estágio (lida de projects.ts): "5 ações". */
    countOne: "ação",
    countMany: "ações",
    phases: [
      { n: "01", name: "Descobrir", desc: "Registrar a ideia como hipótese: problema, público e aposta." },
      { n: "02", name: "Priorizar", desc: "Ordenar o backlog por ICE: impacto, confiança e facilidade." },
      { n: "03", name: "Testar", desc: "Piloto pequeno, com dono, prazo, meta e orçamento." },
      { n: "04", name: "Medir", desc: "Ler o resultado contra a meta definida antes do teste." },
      { n: "05", name: "Escalar ou encerrar", desc: "Virou playbook? Escala. Se não, ajusta ou encerra." },
    ],
    /** Estágio do pack ↔ fases do método (índices em `phases`). */
    bands: [
      { stage: "ideia", from: 0, to: 0 },
      { stage: "backlog", from: 1, to: 1 },
      { stage: "rodando", from: 2, to: 4 },
    ],
    loop: "O aprendizado volta para o backlog",
  },

  // ── Passo 1: priorizar com ICE (simulação) ───────────────────────────
  ice: {
    title: "Priorizar com ICE",
    sub: "Notas iniciais para discussão, de 1 a 10. Clique numa ação para ajustar.",
    listLabel: "Ranking ICE das ações do pack que ainda não estão rodando",
    cols: { rank: "#", action: "Ação", i: "I", c: "C", e: "E", score: "Score" },
    colTitles: { i: "Impacto", c: "Confiança", e: "Facilidade", score: "Score ICE", rank: "Posição" },
    cut: "Próxima janela",
    formulaLabel: "Fórmula",
    formulas: [
      { value: "product", label: "I × C × E" },
      { value: "mean", label: "Média" },
    ],
    formulaText: {
      product: "Score ICE = Impacto × Confiança × Facilidade",
      mean: "Score ICE = (Impacto + Confiança + Facilidade) ÷ 3",
    },
    sliders: [
      { key: "i", label: "Impacto", hint: "Quanto move a Rede BORA ativa." },
      { key: "c", label: "Confiança", hint: "Quanta evidência já existe." },
      { key: "e", label: "Facilidade", hint: "Custo, prazo e dependências." },
    ],
    tag: "Simulação",
    note: "A priorização real é feita com o time, com dados do Brasília Lab.",
    score: "Score ICE",
    /** {r} = posição, {n} = total. */
    rank: "{r}º de {n} no ranking",
    reset: "Restaurar notas iniciais",
    /** Notas iniciais para discussão (impacto, confiança, facilidade), por id de GROWTH_PROJECTS. */
    initial: {
      "preco-unico": [7, 8, 9],
      "pre-cadastro": [7, 7, 8],
      pass: [8, 5, 5],
      boost: [7, 4, 5],
      playbook: [8, 6, 6],
      league: [7, 4, 3],
      pipeline: [9, 4, 3],
    },
    defaultSelected: "pass",
  },

  // ── Passo 2: a ficha de cada ação ────────────────────────────────────
  // A mesma ficha (ActionBrief) fecha cada slide de produto. Aqui ela aparece anotada com as fases do ciclo,
  // ao lado dos campos de gestão (dono, orçamento e critério de decisão).
  sheet: {
    title: "A ficha de cada ação",
    sub: "Toda ação do pack tem esta ficha, e ela fecha cada slide de produto. Exemplo: o BORA OPEN, que já está rodando.",
    /** Ação usada como exemplo (o que é, por que importa, como executamos, métrica e prazo vêm de GROWTH_PROJECTS). */
    actionId: "open",
    /** Fase do ciclo em cada bloco da ficha (índices em cycle.phases). */
    phases: { why: 0, how: 2, metric: 3 },
    mgmt: {
      title: "Como a ação é gerida",
      tag: "Proposta",
      fields: [
        { key: "owner", label: "Dono", phase: 2, value: "Growth", caption: "Um dono por ação." },
        { key: "cost", label: "Orçamento", phase: 2, value: "A definir com o time", caption: "Fechado antes do piloto." },
      ],
      decision: {
        label: "Critério de decisão",
        phase: 4,
        options: [
          { key: "escalar", label: "Escalar", rule: "Bateu a meta no prazo.", then: "Vira playbook e ganha escala." },
          { key: "ajustar", label: "Ajustar", rule: "Ficou perto da meta.", then: "Muda uma variável e volta para Testar." },
          { key: "encerrar", label: "Encerrar", rule: "Ficou longe, sem sinal de melhora.", then: "O aprendizado volta para o backlog." },
        ],
      },
    },
  },

  // ── Passo 3: cadência e organização ──────────────────────────────────
  cadence: {
    title: "Cadência e organização",
    sub: "Ritmo fixo para o ciclo não parar.",
    tag: "Proposta de cadência",
    ariaLabel: "Rituais de growth ao longo das 13 semanas de um trimestre",
    cols: { freq: "Ritmo", ritual: "Ritual", weeks: "Semanas do trimestre", phases: "Fases" },
    weeks: 13,
    /** {n} = encontros no trimestre. */
    weeksAria: "{n} encontros nas 13 semanas",
    all: "Todas",
    rituals: [
      {
        freq: "Semanal",
        name: "Reunião de growth",
        desc: "Números, experimentos rodando e decisões.",
        weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        phases: [2, 3],
      },
      {
        freq: "Quinzenal",
        name: "Revisão do backlog",
        desc: "Novas ideias entram e as notas ICE são revistas.",
        weeks: [1, 3, 5, 7, 9, 11, 13],
        phases: [0, 1],
      },
      {
        freq: "Mensal",
        name: "Revisão do portfólio",
        desc: "Com a diretoria: escalar, ajustar ou encerrar.",
        weeks: [4, 9, 13],
        phases: [4],
      },
      {
        freq: "Trimestral",
        name: "Plano de 90 dias",
        desc: "Metas por frente para o trimestre.",
        weeks: [1],
        phases: [0, 1, 2, 3, 4],
      },
    ],
    artifactsTitle: "Artefatos",
    artifacts: [
      { key: "board", name: "Quadro do pack", desc: "Cada ação com seu estágio, à vista de todos." },
      { key: "sheet", name: "Ficha por ação", desc: "O que é, como executamos, métrica, meta, dono e critério de decisão." },
      { key: "panel", name: "Painel de métricas", desc: "North Star: ==Rede BORA ativa==." },
    ],
  },
} as const;
