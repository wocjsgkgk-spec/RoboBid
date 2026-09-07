import { z } from "zod";
import { OpportunityScoreResult } from "./scoring";

// ============================================================================
// RoboBid AI v3.0 — 14-Axis Evaluation & Semantic Match Types
// ============================================================================

export const MissingCapabilityStatusSchema = z.enum([
  "AVAILABLE",         // 기 보유
  "PLANNED",           // 과제 중 개발/채용 계획
  "OUTSOURCE",         // 전문 외주 용역 조달
  "PARTNER_REQUIRED",  // 수요처/연구소 컨소시엄 구성 필수
  "UNAVAILABLE",       // 확보 불가 결격 사유
]);
export type MissingCapabilityStatus = z.infer<typeof MissingCapabilityStatusSchema>;

export interface CapabilityGapItem {
  requirement: string;
  category: "ELIGIBILITY" | "TECHNOLOGY" | "FACILITY" | "CERTIFICATION" | "WORKFORCE";
  status: MissingCapabilityStatus;
  detail: string;
  actionPlan?: string;
  isMandatoryForSubmission: boolean; // 필수 신청시점 자격 여부
}

export interface EvaluationAxisScore {
  axisId: string;
  axisNumber: number;
  axisName: string;
  score: number; // 0 ~ maxScore
  maxScore: number;
  category: "ELIGIBILITY_BUDGET" | "TECHNICAL_CAPABILITY" | "FEASIBILITY_READINESS" | "BUSINESS_FOLLOWUP";
  rationale: string;
  evidence: string;
  isDeterministic: boolean;
}

export interface Evaluation14AxisProfile {
  axes: EvaluationAxisScore[];
  totalScore: number; // 0 ~ 100
  subFitScore: OpportunityScoreResult; // 기존 v2 Fit Score 하위 신호로 재사용
  gaps: CapabilityGapItem[];
  passMandatoryEligibility: boolean; // 필수 신청자격 만족 여부 (PLANNED만으로는 false)
  overallSummary: string;
}

export interface SemanticMatchResult {
  matchScore: number; // 0 ~ 100
  reason: string;
  matchedProjectComponents: string[];
  usableFundingAreas: string[];
  evidence: string[];
  uncertainty: string[];
  profile14Axis: Evaluation14AxisProfile;
}
