import type { ComponentType } from "react";
import type { SlideId } from "@/content/deck";
import { HeroSlide } from "./S01Hero";
import { ProfileSlide } from "./S01bProfile";
import { ProblemSlide } from "./S02Problem";
import { PortfolioSlide } from "./S03aPortfolio";
import { MethodSlide } from "./S03bMethod";
import { FundacaoSlide } from "./S24Fundacao";
import { AquisicaoSlide } from "./S25Aquisicao";
import { DistribuicaoSlide } from "./S26Distribuicao";
import { ConversaoSlide } from "./S27Conversao";
import { ReceitaB2BSlide } from "./S28ReceitaB2B";
import { ExpansaoSlide } from "./S29Expansao";
import { FlywheelSlide } from "./S16Flywheel";
import { PlanoSlide } from "./S30Plano";
import { NextStepsSlide } from "./S21aNextSteps";
import { CloseSlide } from "./S22Close";

/**
 * Mapa slide → componente da versão curta. A ordem vem de src/content/deck.ts.
 * Os slides da versão longa continuam em src/slides (S01cProposal, S03Thesis, S04Network, S04aFoundation,
 * S05Open, S06Powered, S07LandExpand, S08Boost, S09Enterprise, S10League, S11Challenges, S12Pass,
 * S13Captains, S14House, S15Os, S17Pipeline, S18Ecosystem, S19BrasiliaLab, S20Metrics, S21Role):
 * para restaurá-los, importe-os aqui e devolva as metas a SLIDES (ver o comentário em deck.ts).
 */
export const SLIDE_COMPONENTS: Record<SlideId, ComponentType> = {
  intro: HeroSlide,
  profile: ProfileSlide,
  problem: ProblemSlide,
  portfolio: PortfolioSlide,
  method: MethodSlide,
  fundacao: FundacaoSlide,
  aquisicao: AquisicaoSlide,
  distribuicao: DistribuicaoSlide,
  conversao: ConversaoSlide,
  "receita-b2b": ReceitaB2BSlide,
  expansao: ExpansaoSlide,
  flywheel: FlywheelSlide,
  plano: PlanoSlide,
  "next-steps": NextStepsSlide,
  close: CloseSlide,
};
