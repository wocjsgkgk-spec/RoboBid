import { z } from "zod";

export interface ScoreWeights {
  technicalWeight: number; // default: 25
  strategicWeight: number; // default: 20
  capabilityWeight: number; // default: 20
  evidenceWeight: number; // default: 15
  financialWeight: number; // default: 10
  scheduleWeight: number; // default: 10
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  technicalWeight: 25,
  strategicWeight: 20,
  capabilityWeight: 20,
  evidenceWeight: 15,
  financialWeight: 10,
  scheduleWeight: 10,
};

export interface ScoreBreakdownItem {
  category: string;
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  reason: string;
}

export interface OpportunityScoreResult {
  opportunityId: string;
  totalScore: number; // 0 to 100
  technicalFit: number;
  strategicFit: number;
  capabilityFit: number;
  evidenceReadiness: number;
  financialFit: number;
  scheduleReadiness: number;
  riskPenalty: number;
  breakdown: ScoreBreakdownItem[];
  recommendation: "GO" | "GO_WITH_CONDITIONS" | "HOLD" | "NO_GO";
  strengths: string[];
  weaknesses: string[];
  rationale: string;
  calculatedAt: string;
}
