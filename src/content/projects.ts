// Fonte única dos produtos e projetos do BORA Growth (pack de ações e projetos de growth).
// Alimenta: o quadro do pack, os seis slides de frente, o plano de 90 dias, o flywheel e as pastas do mapa (P).
// stage (ordem proposta pelo Alex; tudo no pack é proposta, nada começou na BORA):
//   "agora" = Fase 1, primeiros 30 dias se aprovado · "depois" = Fase 2, 31 a 90 dias · "ideia" = só com teste antes.
// status (origem): "current" = já existia na BORA · "evolution" = evolui algo que existia · "proposed" = novo.

import type { SlideId } from "./deck";

export type ProjectId =
  | "os"
  | "open"
  | "powered"
  | "pass"
  | "challenges"
  | "enterprise"
  | "league"
  | "boost"
  | "captains"
  | "house"
  | "coaching";

export type ProjectStatus = "current" | "evolution" | "proposed";

/** Estágio de cada ação no pack de growth. Para mudar, edite `stage` em GROWTH_PROJECTS (fonte única). */
export type Stage = "agora" | "depois" | "ideia";
export const STAGES: Stage[] = ["agora", "depois", "ideia"];
export const STAGE_LABEL: Record<Stage, string> = { agora: "Fase 1", depois: "Fase 2", ideia: "Ideia" };
export const STAGE_PLURAL: Record<Stage, string> = { agora: "Fase 1", depois: "Fase 2", ideia: "Ideias" };
export const STAGE_DEF: Record<Stage, string> = {
  agora: "Primeiros 30 dias, se a proposta for aprovada.",
  depois: "De 31 a 90 dias, depois da base pronta.",
  ideia: "Só vira projeto se um teste pequeno bater a meta.",
};

export type Project = {
  id: ProjectId;
  name: string;
  short: string;
  status: ProjectStatus;
  layer: string;
  /** O que é, em 2 a 4 palavras em português (legenda no mapa da rede, ao lado do nome em inglês). */
  pt: string;
  /** Frase-conceito. */
  tagline: string;
  /** Uma linha. */
  summary: string;
  /** Explicação curta (painel lateral). */
  description: string;
  audience: string;
  /** Exemplo concreto e ilustrativo (sempre marcado como exemplo na tela). */
  example: string;
  /** Produtos que este produto alimenta (conexões destacadas no mapa). */
  feeds: ProjectId[];
  /** Slide de aprofundamento. */
  slide?: SlideId;
  /** O que a BORA já faz hoje (fato), quando houver. */
  note?: string;
};

export const PROJECTS: Record<ProjectId, Project> = {
  os: {
    id: "os",
    name: "BORA OS",
    short: "OS",
    status: "proposed",
    layer: "Infraestrutura",
    pt: "A base comum de dados",
    tagline: "A camada que conecta tudo.",
    summary: "Identidade, dados e operação compartilhados por todos os produtos.",
    description:
      "Cada corredor ganharia um BORA ID que atravessa todos os produtos. CRM, eventos, assinaturas, parceiros e receita leriam e escreveriam na mesma camada, e a inteligência responderia onde crescer.",
    audience: "Todos os produtos da rede",
    example: "Uma pessoa faria check-in num Open, entraria num desafio de 5K e viraria Coaching: o histórico inteiro ficaria no mesmo BORA ID.",
    feeds: ["open", "powered", "pass", "challenges", "enterprise", "league", "boost", "captains", "house", "coaching"],
    slide: "fundacao",
  },
  open: {
    id: "open",
    name: "BORA OPEN",
    short: "OPEN",
    status: "proposed",
    layer: "Aquisição",
    pt: "Treinos abertos e gratuitos",
    tagline: "A porta de entrada gratuita para o ecossistema BORA.",
    summary: "Treinos abertos e gratuitos que geram BORA IDs.",
    description:
      "Corridas abertas e recorrentes, com check-in, grupos de pace e parceiros. Cada participante ganharia um BORA ID e viraria uma relação, não um clique de anúncio. Não seria coaching grátis: seria comunidade.",
    audience: "Corredores independentes",
    example: "Um treino aberto de sábado num parque: cada pessoa faria check-in, ganharia um BORA ID e receberia o convite para o próximo desafio.",
    feeds: ["challenges", "pass", "coaching"],
    slide: "aquisicao",
  },
  powered: {
    id: "powered",
    name: "BORA POWERED",
    short: "POWERED",
    status: "proposed",
    layer: "Distribuição",
    pt: "Clubes parceiros",
    tagline: "Seu clube. Powered by BORA.",
    summary: "Clubes independentes com a infraestrutura da BORA.",
    description:
      "O clube manteria nome, cultura e liderança. A BORA entraria com tecnologia, eventos, benefícios e programas de performance. Em troca, ganharia distribuição B2B2C recorrente.",
    audience: "Clubes de corrida e comunidades organizadas",
    example: "Um clube de bairro passaria a usar check-in e CRM da BORA, levaria tenda para a prova do mês e ofereceria bolsas de Coaching aos destaques.",
    feeds: ["challenges", "pass", "coaching", "boost"],
    slide: "distribuicao",
  },
  pass: {
    id: "pass",
    name: "BORA PASS",
    short: "PASS",
    status: "proposed",
    layer: "Assinatura",
    pt: "Assinatura de comunidade",
    tagline: "Você não precisa de um treinador BORA para pertencer à BORA.",
    summary: "Assinatura de pertencimento: eventos, House, benefícios e desafios.",
    description:
      "Assinatura para quem já corre, com ou sem treinador. Ampliaria o mercado de “quem procura um novo treinador” para “quem corre”.",
    audience: "Quem já corre, com ou sem treinador",
    example: "Uma corredora com treinador próprio assinaria o PASS para usar a BORA House nas provas, os benefícios de parceiros e os eventos.",
    feeds: ["coaching", "house", "challenges"],
    slide: "conversao",
  },
  challenges: {
    id: "challenges",
    name: "BORA CHALLENGES",
    short: "CHALLENGES",
    status: "proposed",
    layer: "Conversão",
    pt: "Desafios com meta",
    tagline: "Campanhas que viram assinaturas.",
    summary: "Programas com meta, prazo e linha de chegada.",
    description:
      "5K, 10K, 21K, 42K, primeira prova, retorno, recorde pessoal. O desafio venderia uma meta concreta; a assinatura viria depois, como continuidade natural.",
    audience: "Quem tem (ou precisa de) uma próxima meta",
    example: "Desafio 10K de 10 semanas com largada coletiva: quem cruzasse a linha de chegada receberia a proposta de Coaching para a meia.",
    feeds: ["coaching", "pass"],
    slide: "conversao",
  },
  enterprise: {
    id: "enterprise",
    name: "BORA ENTERPRISE",
    short: "ENTERPRISE",
    status: "evolution",
    layer: "B2B",
    pt: "Programas para empresas",
    tagline: "Corrida como plataforma de engajamento corporativo.",
    summary: "Programas de corrida para empresas.",
    description:
      "START, WORK RUN CLUB, RACE TEAM e LEAGUE: uma linha de maturidade para vender a RH, Gente & Cultura, Employer Branding, Benefícios e Marketing. Cada colaborador ativo viraria um BORA ID.",
    audience: "RH, Gente & Cultura, Employer Branding, Benefícios, Marketing",
    example: "Uma empresa começaria com uma turma START de 12 semanas e, no semestre seguinte, montaria um RACE TEAM para uma prova da cidade.",
    feeds: ["league", "coaching", "pass", "house"],
    slide: "receita-b2b",
    note: "Transformaria em linha de produto as ações corporativas que a BORA já divulga.",
  },
  league: {
    id: "league",
    name: "BORA LEAGUE",
    short: "LEAGUE",
    status: "proposed",
    layer: "B2B",
    pt: "Liga entre empresas",
    tagline: "Um produto. Várias camadas de receita.",
    summary: "Campeonato de corrida entre empresas.",
    description:
      "Temporadas de 8 semanas que pontuariam participação e consistência, não só velocidade. Contrato, inscrição, naming rights, ativações e upgrades para Coaching.",
    audience: "Empresas e marcas patrocinadoras",
    example: "Seis empresas disputariam uma temporada: pontuariam check-ins semanais, desafios em equipe e presença no evento final.",
    feeds: ["coaching", "boost", "house"],
    slide: "receita-b2b",
  },
  boost: {
    id: "boost",
    name: "BORA BOOST",
    short: "BOOST",
    status: "proposed",
    layer: "Capital de marcas",
    pt: "Verba de marcas",
    tagline: "Capital de crescimento para comunidades.",
    summary: "Verba de marcas virando infraestrutura para clubes.",
    description:
      "Marcas investiriam; a BORA administraria; clubes Powered receberiam créditos para fotografia, hidratação, eventos, uniformes e mais. A marca receberia participação, testes, conteúdo e vendas atribuídas.",
    audience: "Marcas que querem chegar a corredores reais",
    example: "Uma marca de hidratação financiaria postos em 10 clubes Powered e receberia check-ins, testes de produto e cupons usados.",
    feeds: ["powered", "house"],
    slide: "distribuicao",
  },
  captains: {
    id: "captains",
    name: "BORA CAPTAINS",
    short: "CAPTAINS",
    status: "proposed",
    layer: "Expansão",
    pt: "Líderes locais",
    tagline: "Construa demanda antes de construir infraestrutura.",
    summary: "Líderes locais que abrem bairros e cidades pela demanda.",
    description:
      "Capitães recrutados localmente fariam treinos abertos, formariam comunidade e testariam desafios e empresas. A operação completa só abriria com a demanda comprovada.",
    audience: "Líderes, treinadores e criadores locais",
    example: "Três capitães numa cidade nova fariam treinos abertos semanais; o hub só abriria quando dois bairros passassem da densidade mínima.",
    feeds: ["open", "challenges", "enterprise"],
    slide: "aquisicao",
  },
  house: {
    id: "house",
    name: "BORA HOUSE",
    short: "HOUSE",
    status: "evolution",
    layer: "Experiência",
    pt: "Apoio nas provas",
    tagline: "Transforme suporte de prova em produto de crescimento.",
    summary: "O fim de semana de prova como produto.",
    description:
      "Encontro, shakeout, estrutura, recuperação, fotografia e follow-up, atendendo Coaching, PASS, Powered, Enterprise e marcas ao mesmo tempo.",
    audience: "Todos os públicos da rede + marcas",
    example: "Na maratona da cidade, a House receberia atletas Coaching, assinantes PASS, um clube Powered e um time corporativo, com uma marca patrocinando a recuperação.",
    feeds: ["pass", "coaching", "boost"],
    slide: "distribuicao",
    note: "Evoluiria o apoio em provas que a BORA já oferece hoje.",
  },
  coaching: {
    id: "coaching",
    name: "BORA COACHING",
    short: "COACHING",
    status: "current",
    layer: "Núcleo premium",
    pt: "Produto atual",
    tagline: "O núcleo premium.",
    summary: "A assessoria que a BORA já opera.",
    description:
      "Treinador, planejamento individual, app Runy e apoio em provas. Continuaria sendo o produto premium, alimentado também pela rede e não só por mídia.",
    audience: "Quem busca performance individual",
    example: "Um atleta vindo de um desafio 10K entraria no Coaching com histórico, meta e comunidade. Não como um lead frio.",
    feeds: [],
  },
};

/** Produtos em órbita no mapa da rede, na ordem de revelação. */
export const NETWORK_ORDER: ProjectId[] = ["open", "powered", "enterprise", "pass", "challenges", "league", "boost", "captains", "house"];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  current: "BORA atual",
  evolution: "Evolução do atual",
  proposed: "Proposta",
};

// ── Ecossistema de projetos de growth ────────────────────────────────────
// Portfólio completo: produtos da rede + programas de aquisição + projetos de fundação. Tudo é proposta.
// Horizonte refere-se ao plano Brasília Lab (0–30, 31–60, 61–90 dias) ou depois dele.

export type GrowthFront = "Fundação" | "Aquisição" | "Distribuição" | "Conversão" | "Receita B2B" | "Expansão";
export type Horizon = "0–30" | "31–60" | "61–90" | "90+";

export type GrowthProject = {
  id: string;
  name: string;
  front: GrowthFront;
  /** Estágio no pack (Fase 1 / Fase 2 / Ideia). Tudo é proposta. */
  stage: Stage;
  status: ProjectStatus;
  /** O que é, em português simples (uma frase). Aparece na ficha, nas pastas e no slide "A base do funil". */
  plain: string;
  /** Por que importa (uma frase, sem prometer resultado). */
  why: string;
  /** Como executamos (ou, para ideias, como validamos): três passos simples. São plano, não resultado. */
  howTo: readonly [string, string, string];
  goal: string;
  kpi: string;
  horizon: Horizon;
  dependsOn: string[];
  /** Produto correspondente, quando for um produto da rede. */
  product?: ProjectId;
  /** Produto atual da BORA (Coaching): base do pack, fora da contagem de ações. */
  core?: boolean;
};

export const HORIZON_LABEL: Record<Horizon, string> = { "0–30": "0 a 30 dias", "31–60": "31 a 60 dias", "61–90": "61 a 90 dias", "90+": "90+ dias" };
export const horizonLabel = (h: Horizon) => HORIZON_LABEL[h];

export const GROWTH_FRONTS: GrowthFront[] = ["Fundação", "Aquisição", "Distribuição", "Conversão", "Receita B2B", "Expansão"];

export const GROWTH_PROJECTS: GrowthProject[] = [
  // ── Fundação ──
  {
    id: "bora-id",
    name: "BORA ID",
    front: "Fundação",
    stage: "agora",
    status: "proposed",
    plain: "Um cadastro único por corredor, o mesmo em todos os produtos.",
    why: "Sem saber quem é quem, não dá para medir a rede nem acompanhar cada pessoa.",
    howTo: [
      "Criar o ID no primeiro contato: check-in, formulário ou compra.",
      "Usar o mesmo ID em treinos, desafios, eventos e Coaching.",
      "Conferir cadastros duplicados toda semana.",
    ],
    goal: "Uma identidade por corredor em todos os produtos.",
    kpi: "BORA IDs ativos",
    horizon: "0–30",
    dependsOn: [],
  },
  {
    id: "crm-tracking",
    name: "CRM + tracking",
    front: "Fundação",
    stage: "agora",
    status: "proposed",
    plain: "Registrar de onde cada pessoa veio e o que fez até comprar.",
    why: "Mostraria quais canais trazem atletas que ficam, e não só cliques.",
    howTo: [
      "Padronizar a origem (link rastreável e cupom) em toda campanha.",
      "Levar cada lead e cada venda para o CRM, ligados ao BORA ID.",
      "Ler a receita por canal num painel semanal.",
    ],
    goal: "Origem, jornada e conversão medidas de ponta a ponta.",
    kpi: "% de receita com origem conhecida",
    horizon: "0–30",
    dependsOn: ["bora-id"],
  },
  {
    id: "os",
    name: "BORA OS",
    front: "Fundação",
    stage: "depois",
    status: "proposed",
    plain: "A base de dados comum que ligaria todos os produtos ao BORA ID.",
    why: "Permitiria responder qual clube, desafio ou evento traz os melhores atletas.",
    howTo: [
      "Ligar check-in, CRM e pagamentos ao BORA ID.",
      "Acrescentar um módulo por vez: Open, Powered, Enterprise.",
      "Abrir integrações (app Runy, inscrições) quando forem possíveis.",
    ],
    goal: "Módulos e integrações sobre a mesma camada de dados.",
    kpi: "Módulos ativos no OS",
    horizon: "31–60",
    dependsOn: ["bora-id", "crm-tracking"],
    product: "os",
  },
  // ── Aquisição ──
  {
    id: "open",
    name: "BORA OPEN",
    front: "Aquisição",
    stage: "agora",
    status: "proposed",
    plain: "Treinos abertos e gratuitos, toda semana, com check-in.",
    why: "Pode trazer corredores novos sem anúncio, e cada um vira uma relação.",
    howTo: [
      "Fazer o treino aos sábados num ponto fixo, com grupos de pace.",
      "Fazer check-in de todos: cada pessoa ganha um BORA ID.",
      "Convidar quem volta para um desafio com meta.",
    ],
    goal: "Gerar BORA IDs com treinos abertos e recorrentes.",
    kpi: "Participantes do Open",
    horizon: "0–30",
    dependsOn: ["bora-id"],
    product: "open",
  },
  {
    id: "captains",
    name: "BORA CAPTAINS",
    front: "Aquisição",
    stage: "depois",
    status: "proposed",
    plain: "Líderes locais que puxariam treinos abertos no próprio bairro.",
    why: "Criaria demanda num lugar novo antes de gastar com estrutura.",
    howTo: [
      "Escolher capitães com credibilidade no bairro.",
      "Cada capitão faria um Open semanal, com check-in.",
      "Abrir estrutura só onde a demanda medida passar do limiar.",
    ],
    goal: "Criar demanda local com líderes da comunidade.",
    kpi: "IDs por capitão",
    horizon: "31–60",
    dependsOn: ["open"],
    product: "captains",
  },
  {
    id: "referral",
    name: "Programa de indicação",
    front: "Aquisição",
    stage: "agora",
    status: "proposed",
    plain: "Um código de indicação para cada atleta trazer amigos.",
    why: "Cada atleta viraria um canal, com custo conhecido por indicação.",
    howTo: [
      "Dar um código de indicação a cada atleta ativo.",
      "Definir a recompensa de quem indica e de quem chega.",
      "Medir no CRM quantos indicados viram pagantes.",
    ],
    goal: "Atletas trazendo atletas, com atribuição por código.",
    kpi: "Novos pagantes indicados",
    horizon: "0–30",
    dependsOn: ["crm-tracking"],
  },
  {
    id: "creators",
    name: "Programa de influenciadores",
    front: "Aquisição",
    stage: "depois",
    status: "proposed",
    plain: "Criadores de conteúdo que divulgariam a BORA com cupom e comissão.",
    why: "Alcançaria públicos novos, pagando só pelo que for vendido.",
    howTo: [
      "Selecionar criadores de corrida com público na cidade.",
      "Dar a cada um cupom e comissão próprios.",
      "Revisar a lista todo mês pelas vendas de cada cupom.",
    ],
    goal: "Criadores com cupom e comissão atribuídos.",
    kpi: "Vendas atribuídas por cupom",
    horizon: "31–60",
    dependsOn: ["crm-tracking"],
  },
  {
    id: "landing-cidade",
    name: "Landing por cidade",
    front: "Aquisição",
    stage: "agora",
    status: "proposed",
    plain: "Uma página por cidade e núcleo, com o próximo passo claro.",
    why: "Quem procura assessoria na cidade encontraria local, horário e plano.",
    howTo: [
      "Criar uma página para cada cidade e núcleo.",
      "Mostrar local, horários, plano e o botão de pré-cadastro.",
      "Comparar visitas e pré-cadastros de cada página.",
    ],
    goal: "Uma página por cidade, núcleo e objetivo, com o próximo passo claro.",
    kpi: "Visitas que viram pré-cadastro",
    horizon: "0–30",
    dependsOn: ["crm-tracking"],
  },
  {
    id: "conteudo-intencao",
    name: "Conteúdo por intenção",
    front: "Aquisição",
    stage: "agora",
    status: "proposed",
    plain: "Conteúdo para cada objetivo: primeiro 5K, meia, voltar a correr.",
    why: "Atrairia quem já tem uma meta e levaria ao desafio certo.",
    howTo: [
      "Listar as metas que os corredores mais buscam.",
      "Produzir uma série de conteúdos para cada meta.",
      "Fechar cada conteúdo com o convite para o desafio daquela meta.",
    ],
    goal: "Conteúdo para cada objetivo (5K, meia, voltar a correr) que leva ao desafio certo.",
    kpi: "Leads por intenção",
    horizon: "0–30",
    dependsOn: [],
  },
  {
    id: "media",
    name: "Mídia paga",
    front: "Aquisição",
    stage: "agora",
    status: "current",
    plain: "Anúncios pagos para amplificar a rede, em vez de sustentá-la.",
    why: "A mídia continua útil, mas cada real precisa de origem medida.",
    howTo: [
      "Anunciar treinos abertos, desafios e páginas por cidade.",
      "Medir o custo por pré-cadastro e por venda em cada canal.",
      "Levar a verba para os canais com menor custo por venda.",
    ],
    goal: "Amplificar a rede, sem sustentar o crescimento sozinha.",
    kpi: "CAC por canal",
    horizon: "0–30",
    dependsOn: ["crm-tracking"],
  },
  // ── Distribuição ──
  {
    id: "powered",
    name: "BORA POWERED",
    front: "Distribuição",
    stage: "depois",
    status: "proposed",
    plain: "Clubes de corrida independentes com a estrutura da BORA, sem perder a identidade.",
    why: "Um clube parceiro traria a comunidade inteira de uma vez.",
    howTo: [
      "Mapear clubes com liderança ativa.",
      "Entrar pela tecnologia: check-in e CRM para o clube.",
      "Subir um degrau por vez: provas, benefícios e bolsas.",
    ],
    goal: "Clubes independentes com a infraestrutura da BORA.",
    kpi: "Membros Powered",
    horizon: "31–60",
    dependsOn: ["os"],
    product: "powered",
  },
  {
    id: "boost",
    name: "BORA BOOST",
    front: "Distribuição",
    stage: "ideia",
    status: "proposed",
    plain: "Verba de marcas para estrutura e experiências nos clubes Powered.",
    why: "Pode trazer receita de marcas e melhorar a experiência nos clubes.",
    howTo: [
      "Montar uma proposta com uma marca e poucos clubes Powered.",
      "Fazer uma ação com check-ins e cupons medidos.",
      "Entregar o resultado à marca e ver se ela renova.",
    ],
    goal: "Transformar verba de marcas em benefícios para clubes.",
    kpi: "Receita de marcas",
    horizon: "61–90",
    dependsOn: ["powered"],
    product: "boost",
  },
  {
    id: "house",
    name: "BORA HOUSE",
    front: "Distribuição",
    stage: "depois",
    status: "evolution",
    plain: "O apoio que a BORA já dá nas provas, organizado como produto.",
    why: "O fim de semana de prova junta atletas, clubes, empresas e marcas.",
    howTo: [
      "Escolher as provas do calendário com mais atletas BORA.",
      "Montar a House: encontro, apoio na prova e recuperação.",
      "Fechar com o pós-prova: fotos, resultados e a próxima meta.",
    ],
    goal: "Fim de semana de prova como produto.",
    kpi: "Participantes por prova",
    horizon: "31–60",
    dependsOn: ["bora-id"],
    product: "house",
  },
  // ── Conversão ──
  {
    id: "challenges",
    name: "BORA CHALLENGES",
    front: "Conversão",
    stage: "depois",
    status: "proposed",
    plain: "Desafios com meta e prazo: 5K, 10K, 21K, primeira prova.",
    why: "A meta com data dá o motivo para começar. O Coaching vem como continuação.",
    howTo: [
      "Lançar uma turma por vez, com largada e chegada marcadas.",
      "Acompanhar a turma com treinos, check-ins e grupo.",
      "Na chegada, oferecer o próximo desafio ou o Coaching.",
    ],
    goal: "Metas com prazo que levam à assinatura.",
    kpi: "Desafio → Coaching",
    horizon: "31–60",
    dependsOn: ["open"],
    product: "challenges",
  },
  {
    id: "preco-unico",
    name: "Preço único",
    front: "Conversão",
    stage: "agora",
    status: "proposed",
    plain: "A mesma tabela de planos e preços em todos os canais.",
    why: "Preço diferente em cada lugar gera dúvida e atrasa a venda.",
    howTo: [
      "Levantar todos os planos e preços publicados hoje.",
      "Definir uma tabela única com a diretoria.",
      "Publicar a mesma tabela no site, nas páginas e no atendimento.",
    ],
    goal: "A mesma matriz de planos e preços em todas as páginas e canais.",
    kpi: "Pré-cadastro → venda",
    horizon: "0–30",
    dependsOn: [],
  },
  {
    id: "pre-cadastro",
    name: "Pré-cadastro com plano",
    front: "Conversão",
    stage: "agora",
    status: "proposed",
    plain: "Um formulário que mostra plano, valor e próximo passo antes do contato.",
    why: "Quem chegasse ao atendimento já saberia o que vai comprar.",
    howTo: [
      "Colocar plano e valor no formulário de pré-cadastro.",
      "Enviar o próximo passo automático por WhatsApp.",
      "Medir quantos pré-cadastros viram venda.",
    ],
    goal: "Mostrar plano, valor e próximo passo no formulário, antes do contato.",
    kpi: "Pré-cadastros que viram venda",
    horizon: "0–30",
    dependsOn: ["preco-unico"],
  },
  {
    id: "pass",
    name: "BORA PASS",
    front: "Conversão",
    stage: "ideia",
    status: "proposed",
    plain: "Assinatura de comunidade para quem já corre, com ou sem treinador.",
    why: "Abriria a BORA para quem não quer trocar de treinador.",
    howTo: [
      "Montar um PASS beta com benefícios simples: apoio em provas e eventos.",
      "Convidar 50 corredores para testar por dois meses.",
      "Ver quantos renovam no segundo mês.",
    ],
    goal: "Pertencimento pago para quem já corre.",
    kpi: "Membros PASS",
    horizon: "31–60",
    dependsOn: ["bora-id", "house"],
    product: "pass",
  },
  {
    id: "coaching",
    name: "BORA COACHING",
    front: "Conversão",
    stage: "agora",
    status: "current",
    core: true,
    plain: "A assessoria que a BORA já vende: treinador, plano individual e app.",
    why: "É a receita principal. A proposta é que a rede passe a alimentá-la.",
    howTo: [
      "Receber atletas vindos de desafios, clubes e empresas.",
      "Registrar a origem de cada atleta no BORA ID.",
      "Acompanhar receita e permanência por origem.",
    ],
    goal: "Que a rede passe a alimentar o produto atual.",
    kpi: "MRR do Coaching",
    horizon: "0–30",
    dependsOn: [],
    product: "coaching",
  },
  // ── Receita B2B ──
  {
    id: "enterprise",
    name: "BORA ENTERPRISE",
    front: "Receita B2B",
    stage: "depois",
    status: "evolution",
    plain: "Programas de corrida para empresas, do primeiro 5K ao time de prova.",
    why: "Um contrato traria receita e muitos corredores de uma vez.",
    howTo: [
      "Começar pelo START: uma turma de 8 a 12 semanas até o 5K.",
      "Vender para RH e Benefícios, com um evento de conclusão.",
      "Renovar como clube recorrente ou como time de prova.",
    ],
    goal: "Programas de corrida vendidos a empresas.",
    kpi: "ARR Enterprise",
    horizon: "31–60",
    dependsOn: ["crm-tracking"],
    product: "enterprise",
  },
  {
    id: "league",
    name: "BORA LEAGUE",
    front: "Receita B2B",
    stage: "ideia",
    status: "proposed",
    plain: "Uma liga de corrida entre empresas, em temporadas de 8 semanas.",
    why: "Engajaria vários times ao mesmo tempo e abriria espaço para patrocínio.",
    howTo: [
      "Convidar as empresas dos primeiros programas Enterprise.",
      "Fazer uma temporada curta, que pontue participação.",
      "Testar um patrocinador para o evento final.",
    ],
    goal: "Temporadas entre empresas com várias camadas de receita.",
    kpi: "Empresas por temporada",
    horizon: "90+",
    dependsOn: ["enterprise"],
    product: "league",
  },
  // ── Expansão ──
  {
    id: "lab",
    name: "Brasília Lab",
    front: "Expansão",
    stage: "agora",
    status: "proposed",
    plain: "Brasília como laboratório: tudo seria testado aqui antes de escalar.",
    why: "Errar pequeno numa cidade custa menos do que errar no país todo.",
    howTo: [
      "Dar ficha, meta e dono a cada experimento.",
      "Organizar em três fases: construir, pilotar e aprender.",
      "Fechar os 90 dias com um playbook do que bateu a meta.",
    ],
    goal: "Testar todas as hipóteses numa cidade antes de replicar.",
    kpi: "Hipóteses validadas",
    horizon: "0–30",
    dependsOn: ["bora-id", "crm-tracking"],
  },
  {
    id: "playbook",
    name: "Playbook de cidade",
    front: "Expansão",
    stage: "ideia",
    status: "proposed",
    plain: "Um roteiro para repetir em outra cidade o que der certo em Brasília.",
    why: "Sem roteiro, cada cidade nova recomeça do zero.",
    howTo: [
      "Registrar o passo a passo do que bater a meta no Lab.",
      "Juntar custo, prazo e métrica de cada etapa.",
      "Testar o roteiro numa segunda praça antes de padronizar.",
    ],
    goal: "Transformar o que bater a meta em Brasília num roteiro replicável.",
    kpi: "Tempo até 100 membros ativos",
    horizon: "61–90",
    dependsOn: ["lab"],
  },
  {
    id: "pipeline",
    name: "Pipeline de expansão",
    front: "Expansão",
    stage: "ideia",
    status: "proposed",
    plain: "Duas rotas para abrir cidades: por parceiros ou por demanda.",
    why: "A BORA só abriria operação onde houvesse parceiro forte ou demanda medida.",
    howTo: [
      "Listar cidades com clube forte ou com demanda medida.",
      "Começar pelas primeiras estações: Powered ou capitães.",
      "Abrir unidade só quando os critérios forem atingidos.",
    ],
    goal: "Rotas por parceiro e por demanda até novas cidades.",
    kpi: "Cidades com demanda validada",
    horizon: "90+",
    dependsOn: ["playbook", "captains", "powered"],
  },
];

/** Ações do pack (sem o produto atual, que é a base). */
export const PACK = GROWTH_PROJECTS.filter((g) => !g.core);

export const growthById = (id: string) => GROWTH_PROJECTS.find((g) => g.id === id);

/** Estágio de uma ação ou produto pelo id (os ids dos produtos são os mesmos nas duas listas). */
export const stageOf = (id: string): Stage | undefined => growthById(id)?.stage;

/** Slide de cada frente (versão curta): cada ação abre o slide da frente dela. */
export const FRONT_SLIDE: Record<GrowthFront, SlideId> = {
  Fundação: "fundacao",
  Aquisição: "aquisicao",
  Distribuição: "distribuicao",
  Conversão: "conversao",
  "Receita B2B": "receita-b2b",
  Expansão: "expansao",
};

/** Slide de aprofundamento de cada ação (pastas do mapa: "Abrir o slide"). */
export const GROWTH_SLIDE: Record<string, SlideId> = Object.fromEntries(GROWTH_PROJECTS.map((g) => [g.id, FRONT_SLIDE[g.front]]));
