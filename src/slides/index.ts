import type { ComponentType } from "react";
import type { SlideId } from "@/content/deck";
import { HeroSlide } from "./S01Hero";
import { ProfileSlide } from "./S01bProfile";
import { ProposalSlide } from "./S01cProposal";
import { ProblemSlide } from "./S02Problem";
import { ThesisSlide } from "./S03Thesis";
import { PortfolioSlide } from "./S03aPortfolio";
import { MethodSlide } from "./S03bMethod";
import { FoundationSlide } from "./S04aFoundation";
import { NetworkSlide } from "./S04Network";
import { OpenSlide } from "./S05Open";
import { PoweredSlide } from "./S06Powered";
import { LandExpandSlide } from "./S07LandExpand";
import { BoostSlide } from "./S08Boost";
import { EnterpriseSlide } from "./S09Enterprise";
import { LeagueSlide } from "./S10League";
import { ChallengesSlide } from "./S11Challenges";
import { PassSlide } from "./S12Pass";
import { CaptainsSlide } from "./S13Captains";
import { HouseSlide } from "./S14House";
import { OsSlide } from "./S15Os";
import { FlywheelSlide } from "./S16Flywheel";
import { PipelineSlide } from "./S17Pipeline";
import { EcosystemSlide } from "./S18Ecosystem";
import { BrasiliaLabSlide } from "./S19BrasiliaLab";
import { MetricsSlide } from "./S20Metrics";
import { RoleSlide } from "./S21Role";
import { NextStepsSlide } from "./S21aNextSteps";
import { CloseSlide } from "./S22Close";

/** Mapa slide → componente. A ordem vem de src/content/deck.ts. */
export const SLIDE_COMPONENTS: Record<SlideId, ComponentType> = {
  intro: HeroSlide,
  profile: ProfileSlide,
  proposal: ProposalSlide,
  problem: ProblemSlide,
  thesis: ThesisSlide,
  portfolio: PortfolioSlide,
  method: MethodSlide,
  foundation: FoundationSlide,
  network: NetworkSlide,
  open: OpenSlide,
  powered: PoweredSlide,
  "land-and-expand": LandExpandSlide,
  boost: BoostSlide,
  enterprise: EnterpriseSlide,
  league: LeagueSlide,
  challenges: ChallengesSlide,
  pass: PassSlide,
  captains: CaptainsSlide,
  house: HouseSlide,
  os: OsSlide,
  flywheel: FlywheelSlide,
  "expansion-pipeline": PipelineSlide,
  ecosystem: EcosystemSlide,
  "brasilia-lab": BrasiliaLabSlide,
  metrics: MetricsSlide,
  role: RoleSlide,
  "next-steps": NextStepsSlide,
  close: CloseSlide,
};
