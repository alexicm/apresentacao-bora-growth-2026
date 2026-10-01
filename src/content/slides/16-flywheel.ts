import type { SlideMeta } from "../types";

export const meta = {
  id: "flywheel",
  title: "A roda de crescimento",
  chapter: "system",
  // s0 a roda e o primeiro estágio · s1–s3 os estágios acendem (scroll) · s4 o que já roda e o que é ideia
  steps: 5,
  theme: "dark",
  summary: "Cada estágio da roda tem uma ação por trás, e o selo mostra quais já rodam.",
} as const satisfies SlideMeta;

export const copy = {
  label: "O flywheel",
  // Uma linha visual por item (a revelação é por máscara).
  title: ["Cada volta", "**começa maior.**"],
  // {rodando} e {ideia} = engrenagens da roda em cada estágio do pack (contadas de projects.ts).
  statement: ["{rodando} engrenagens já rodam.", "**{ideia} ainda são ideias.**"],
  lede: "IDs, desafios, House, clubes Powered e capitães já estão em execução. BOOST, PASS e novas cidades só entram depois de validados.",
  honesty: "A roda mostra a lógica do crescimento, não um resultado já medido.",
  hint: "Passe o mouse em um estágio para ver a ação por trás e o que ele puxa.",
  legendTitle: "O que move cada estágio",
  legend: { current: "Produto atual", result: "Resultado" },
  centerLabel: "BORA GROWTH",
  starter: { label: "OPEN", caption: "o empurrão inicial: treinos gratuitos geram IDs" },
  /** Rótulos do painel de causa e efeito. */
  info: { gear: "Engrenagem", result: "Resultado, não é uma ação" },
  // Cada estágio: rótulo, a ação que o move (`by` = id em GROWTH_PROJECTS; sem `by` = resultado)
  // e por que ele puxa o próximo estágio.
  stages: [
    { label: "Mais BORA IDs", gear: "BORA ID", by: "bora-id", why: "Cada pessoa com ID pode receber o convite para um desafio com meta." },
    { label: "Desafios", gear: "CHALLENGES", by: "challenges", why: "Quem cruza a chegada quer a próxima meta. Parte segue no Coaching." },
    { label: "Coaching", gear: "Coaching", by: "coaching", why: "O Coaching é a receita premium e recorrente." },
    { label: "Mais receita", why: "A receita paga estrutura, eventos e a BORA House." },
    { label: "Experiências melhores", gear: "HOUSE", by: "house", why: "Boas experiências atraem clubes que querem o mesmo para seus membros." },
    { label: "Mais clubes Powered", gear: "POWERED", by: "powered", why: "Cada clube Powered traz a comunidade inteira para a rede." },
    { label: "Mais comunidades", gear: "CAPTAINS", by: "captains", why: "Onde não há clube, capitães criam a comunidade do bairro." },
    { label: "Mais corredores", why: "Uma audiência real e medida atrai marcas." },
    { label: "Mais marcas", gear: "BOOST", by: "boost", why: "A verba das marcas vira benefícios e estrutura nos clubes." },
    { label: "Mais benefícios", gear: "PASS", by: "pass", why: "Com benefícios, quem já corre tem motivo para assinar o PASS e ficar." },
    { label: "Mais cidades", gear: "Pipeline", by: "pipeline", why: "Cada nova cidade gera novos IDs, e a roda recomeça maior." },
  ],
} as const;
