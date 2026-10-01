// Ordem da apresentação e capítulos (versão curta, 15 slides).
// Os metadados de cada slide (título, passos, tema, resumo) ficam no arquivo do próprio slide
// em src/content/slides — lá também estão todos os textos.
//
// Versão longa (28 slides): os slides que saíram continuam no projeto (src/content/slides e src/slides).
// Para restaurá-la, importe as metas abaixo e devolva-as a SLIDES e a SLIDE_COMPONENTS (src/slides/index.ts):
//   intro, profile, proposal (01c), problem, thesis (03), portfolio, network (04), method, foundation (04a),
//   open (05), challenges (11), powered (06), land-and-expand (07), captains (13), house (14), enterprise (09),
//   pass (12), boost (08), league (10), ecosystem (18), os (15), flywheel, expansion-pipeline (17),
//   brasilia-lab (19), metrics (20), role (21), next-steps, close.
// Os capítulos antigos (start, later, ideas, system) seguem válidos em ChapterId.

import { meta as intro } from "./slides/01-intro";
import { meta as profile } from "./slides/01b-profile";
import { meta as problem } from "./slides/02-problem";
import { meta as portfolio } from "./slides/03a-portfolio";
import { meta as method } from "./slides/03b-method";
import { meta as fundacao } from "./slides/24-frente-fundacao";
import { meta as aquisicao } from "./slides/25-frente-aquisicao";
import { meta as distribuicao } from "./slides/26-frente-distribuicao";
import { meta as conversao } from "./slides/27-frente-conversao";
import { meta as receitaB2b } from "./slides/28-frente-receita-b2b";
import { meta as expansao } from "./slides/29-frente-expansao";
import { meta as flywheel } from "./slides/16-flywheel";
import { meta as plano } from "./slides/30-plano";
import { meta as nextSteps } from "./slides/21a-next-steps";
import { meta as close } from "./slides/22-close";
import type { ChapterId } from "./types";

export type { ChapterId, SlideMeta } from "./types";

/** Capítulos da versão curta, na ordem em que aparecem (mapa M e cabeçalho). */
export const CHAPTERS = {
  opening: { roman: "I", title: "Abertura" },
  shift: { roman: "II", title: "Por que mudar" },
  pack: { roman: "III", title: "A proposta" },
  fronts: { roman: "IV", title: "As seis frentes" },
  plan: { roman: "V", title: "O plano" },
  close: { roman: "VI", title: "Fechamento" },
} as const satisfies Partial<Record<ChapterId, { roman: string; title: string }>>;

export type DeckChapterId = keyof typeof CHAPTERS;

export const SLIDES = [
  // I Abertura · começo
  intro,
  profile,
  // II Por que mudar: o problema e a tese
  problem,
  // III A proposta: o pack numa tela e como faríamos · meio
  portfolio,
  method,
  // IV As seis frentes: todas as 22 ações, cada uma com o que é e o primeiro passo
  fundacao,
  aquisicao,
  distribuicao,
  conversao,
  receitaB2b,
  expansao,
  // V O plano: como tudo se conecta e os 90 dias propostos · fim
  flywheel,
  plano,
  // VI Fechamento
  nextSteps,
  close,
] as const;

export type SlideId = (typeof SLIDES)[number]["id"];

export const slideIndex = (id: SlideId) => SLIDES.findIndex((s) => s.id === id);
