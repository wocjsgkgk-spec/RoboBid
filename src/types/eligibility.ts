import { z } from "zod";

export const EligibilityStatusSchema = z.enum([
  "PASS",
  "FAIL",
  "REVIEW_REQUIRED",
  "UNKNOWN",
]);
export type EligibilityStatus = z.infer<typeof EligibilityStatusSchema>;

export interface EligibilityCheckItem {
  ruleCode: string;
  ruleName: string;
  status: EligibilityStatus;
  rfpRequirement: string;
  rfpCitationSection?: string;
  rfpCitationQuote?: string; // Exact quote from RFP document
  matchedCapabilityId?: string;
  matchedCapabilityTitle?: string;
  reason: string;
  isMandatory: boolean;
}

export interface EligibilityGateResult {
  opportunityId: string;
  overallStatus: EligibilityStatus;
  passCount: number;
  failCount: number;
  reviewRequiredCount: number;
  unknownCount: number;
  checks: EligibilityCheckItem[];
  canProceedToBidDecision: boolean; // True only if overallStatus === 'PASS' or conditional GO
  evaluatedAt: string;
}
