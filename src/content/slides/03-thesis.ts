import type { SlideMeta } from "../types";

export const meta = {
  id: "thesis",
  title: "A tese",
  chapter: "shift",
  // s0 lugares dispersos · s1 convergem no núcleo BORA · s2 o núcleo vira a rede (lockup BORA GROWTH)
  steps: 3,
  theme: "dark",
  summary: "Ir onde os corredores já estão.",
} as const satisfies SlideMeta;

export const copy = {
  label: "A tese",
  // Uma linha visual por item (a revelação por máscara exige isso).
  headline: ["Vá onde os", "corredores", "**já estão.**"],
  lede: "Corredores já estão organizados em clubes, empresas, academias, condomínios e provas. A tese é conectar esses lugares, em vez de disputar pessoas uma a uma.",
  hint: "Passe o mouse em uma comunidade para ver o canal de entrada.",
  coreLabel: "BORA",
  networkLabel: "BORA GROWTH",
  channelPrefix: "Canal de entrada",
  channelsTitle: "Canais de entrada",

  // `channel` = id em src/content/projects.ts · `slot` = posição no anel (0 = topo, sentido horário, 30° cada)
  places: [
    { id: "clubs", label: "Clubes de corrida", channel: "powered", slot: 2, note: "O clube manteria a identidade e ganharia infraestrutura." },
    { id: "companies", label: "Empresas", channel: "enterprise", slot: 8, note: "Programas de corrida para colaboradores." },
    { id: "independent", label: "Corredores independentes", channel: "open", slot: 0, note: "Treinos abertos e gratuitos gerariam BORA IDs." },
    { id: "leaders", label: "Líderes locais", channel: "captains", slot: 11, note: "Líderes abririam bairros e cidades pela demanda." },
    { id: "athletes", label: "Atletas que já treinam", channel: "pass", slot: 6, note: "Quem já corre pertenceria sem trocar de treinador." },
    { id: "gyms", label: "Academias", channel: "powered", slot: 3, note: "Academias e estúdios como pontos parceiros." },
    { id: "condos", label: "Condomínios", channel: "open", slot: 1, note: "Treinos abertos onde as pessoas moram." },
    { id: "creators", label: "Criadores", channel: "captains", slot: 10, note: "Audiência local que puxaria comunidade." },
    { id: "races", label: "Provas", channel: "house", slot: 5, note: "O fim de semana de prova como porta de entrada." },
    { id: "universities", label: "Universidades", channel: "challenges", slot: 7, note: "Desafios com meta, prazo e identidade." },
    { id: "stores", label: "Lojas", channel: "boost", slot: 9, note: "Lojas e marcas financiariam experiências." },
    { id: "communities", label: "Comunidades", channel: "powered", slot: 4, note: "Grupos já organizados entrariam na rede." },
  ],
  // Legenda "Canais de entrada": os cinco mapeamentos principais (lugar → canal).
  legend: [
    { place: "clubs", channel: "powered" },
    { place: "companies", channel: "enterprise" },
    { place: "independent", channel: "open" },
    { place: "leaders", channel: "captains" },
    { place: "athletes", channel: "pass" },
  ],

  example: {
    tag: "Exemplo ilustrativo",
    title: "Para alcançar 150 corredores:",
    versus: "×",
    oneByOne: { value: "150", label: "conversas individuais" },
    together: { value: "1", label: "parceria com um clube de 150 membros" },
  },
} as const;
