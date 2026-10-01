import type { SlideMeta } from "../types";

export const meta = {
  id: "profile",
  title: "Quem apresenta",
  chapter: "opening",
  // s0 quem sou · s1 trajetória e formação · s2 o que trago para a BORA
  steps: 3,
  theme: "dark",
  summary: "Alex Rodrigues: growth, marketing e tecnologia.",
} as const satisfies SlideMeta;

// Fonte: currículo do Alex (Profile_Alex.pdf) e perfil público no LinkedIn. Nada aqui é estimativa.
export const copy = {
  label: "Quem apresenta",
  // Cada item precisa caber numa linha a 1440px (máscara por linha).
  headline: ["Alex Rodrigues.", "**Growth com método.**"],
  role: "Growth, marketing e tecnologia · Brasília",
  summary: "Mais de 10 anos conectando estratégia, tecnologia e dados para transformar visão em crescimento real.",
  linkedin: "linkedin.com/in/alexrodriguesdossantos",
  /** Foto opcional: salve a imagem em /public/brand/ e troque null pelo caminho (ex.: "/brand/alex.jpg"). */
  photo: null as string | null,
  monogram: "AR",
  photoAlt: "Alex Rodrigues",

  // ── Passo 0: em números ──────────────────────────────────────────────
  facts: [
    { value: "10+", label: "anos em marketing, growth e tecnologia" },
    { value: "6", label: "mercados: tecnologia, educação, varejo, automotivo, food service e A&B" },
    { value: "3", label: "modelos de negócio: B2B, B2C e SaaS" },
  ],
  skillsTitle: "No que eu trabalho",
  skills: ["Growth e experimentação", "CRM e reativação de base", "Canais de distribuição", "E-commerce", "Product marketing", "Dados e IA", "Gestão de times"],

  // ── Passo 1: trajetória ──────────────────────────────────────────────
  careerTitle: "Trajetória",
  careerNote: "Seleção das experiências mais ligadas ao pack.",
  career: [
    { company: "Palantir Technologies", role: "Deployment Strategist", years: "2025 até hoje", focus: "Dados e IA aplicados à operação de grandes empresas" },
    { company: "Unyleya Educacional", role: "Gerente de Projetos Sênior e Especialista Sênior em CRM", years: "2023 a 2025", focus: "Experimentação de growth, CRM e reativação de bases" },
    { company: "Contraktor", role: "Especialista em Growth Marketing (PLG)", years: "2023 a 2024", focus: "Aquisição, ativação e retenção num SaaS" },
    { company: "Cayena", role: "Especialista em Marketplace Sênior", years: "2022 a 2023", focus: "Product marketing num marketplace B2B" },
    { company: "Academia Evolve", role: "Gerente de Marketing", years: "2021 a 2022", focus: "Fitness: funil do tráfego à matrícula e rituais de performance" },
    { company: "L'Oréal", role: "Consultor Sênior de E-commerce", years: "2021", focus: "Estratégia digital de Elseve e Hair Color" },
    { company: "Direção Concursos", role: "Analista de Marketing Sênior", years: "2018 a 2020", focus: "Canais orgânicos, conteúdo e CRM" },
    { company: "Estratégia Educacional", role: "Analista de Marketing (Estrategista)", years: "2016 a 2018", focus: "Audiência e comunidade numa edtech em escala" },
    { company: "Instituto Coca-Cola Brasil", role: "Analista Educacional Sênior", years: "2013 a 2015", focus: "Projeto Coletivo Coca-Cola em Brasília" },
  ],
  educationTitle: "Formação",
  education: [
    { school: "Ibmec", course: "Ciências Econômicas (em curso)" },
    { school: "Harvard Business School Online", course: "Strategy Planning and Execution" },
    { school: "Universidade Anhembi Morumbi", course: "Administração" },
    { school: "PM3", course: "Product Management" },
    { school: "Fundação Roberto Marinho", course: "Licenciatura em Educação Social" },
  ],
  certificationsTitle: "Certificações",
  certifications: ["G4 Growth", "G4 Indicadores e Métricas", "G4 Digital Commerce"],

  // ── Passo 2: o que trago para a BORA ─────────────────────────────────
  bringTitle: "O que trago para a BORA",
  bringNote: "Cada experiência vira ferramenta para uma ação do pack.",
  bring: [
    { from: "Academia Evolve", skill: "Funil de academia, do tráfego à matrícula", actions: ["landing-cidade", "pre-cadastro", "crm-tracking"] },
    { from: "Unyleya · Contraktor", skill: "Experimentação contínua e reativação de base", actions: ["bora-id", "referral", "preco-unico"] },
    { from: "Cayena", skill: "Marketplace B2B e parcerias", actions: ["powered", "enterprise", "boost"] },
    { from: "Estratégia · Direção Concursos", skill: "Comunidade e conteúdo em escala", actions: ["open", "captains", "conteudo-intencao"] },
    { from: "Palantir", skill: "Dados e IA em operação", actions: ["os", "lab"] },
  ],
} as const;
