// Ordem da apresentação e capítulos.
// Os metadados de cada slide (título, passos, tema, resumo) ficam no arquivo do próprio slide
// em src/content/slides — lá também estão todos os textos.

import { meta as intro } from "./slides/01-intro";
import { meta as profile } from "./slides/01b-profile";
import { meta as proposal } from "./slides/01c-proposal";
import { meta as problem } from "./slides/02-problem";
import { meta as thesis } from "./slides/03-thesis";
import { meta as portfolio } from "./slides/03a-portfolio";
import { meta as method } from "./slides/03b-method";
import { meta as foundation } from "./slides/04a-foundation";
import { meta as network } from "./slides/04-network";
import { meta as open } from "./slides/05-open";
import { meta as powered } from "./slides/06-powered";
import { meta as landExpand } from "./slides/07-land-and-expand";
import { meta as boost } from "./slides/08-boost";
import { meta as enterprise } from "./slides/09-enterprise";
import { meta as league } from "./slides/10-league";
import { meta as challenges } from "./slides/11-challenges";
import { meta as pass } from "./slides/12-pass";
import { meta as captains } from "./slides/13-captains";
import { meta as house } from "./slides/14-house";
import { meta as os } from "./slides/15-os";
import { meta as flywheel } from "./slides/16-flywheel";
import { meta as pipeline } from "./slides/17-expansion-pipeline";
import { meta as ecosystem } from "./slides/18-ecosystem";
import { meta as brasilia } from "./slides/19-brasilia-lab";
import { meta as metrics } from "./slides/20-metrics";
import { meta as role } from "./slides/21-role";
import { meta as nextSteps } from "./slides/21a-next-steps";
import { meta as close } from "./slides/22-close";
import type { ChapterId } from "./types";

export type { ChapterId, SlideMeta } from "./types";

export const CHAPTERS: Record<ChapterId, { roman: string; title: string }> = {
  opening: { roman: "I", title: "Abertura" },
  shift: { roman: "II", title: "A virada" },
  pack: { roman: "III", title: "O pack" },
  running: { roman: "IV", title: "O que já roda" },
  next: { roman: "V", title: "O que vem depois" },
  system: { roman: "VI", title: "O sistema" },
  plan: { roman: "VII", title: "O plano" },
  close: { roman: "VIII", title: "Fechamento" },
};

export const SLIDES = [
  // I Abertura · começo
  intro,
  profile,
  proposal,
  // II A virada
  problem,
  thesis,
  // III O pack · meio
  portfolio,
  method,
  // IV O que já roda
  foundation,
  network,
  open,
  challenges,
  powered,
  landExpand,
  captains,
  house,
  enterprise,
  // V O que vem depois (ideias)
  pass,
  boost,
  league,
  // VI O sistema
  ecosystem,
  os,
  flywheel,
  pipeline,
  // VII O plano · fim
  brasilia,
  metrics,
  role,
  // VIII Fechamento
  nextSteps,
  close,
] as const;

export type SlideId = (typeof SLIDES)[number]["id"];

export const slideIndex = (id: SlideId) => SLIDES.findIndex((s) => s.id === id);
