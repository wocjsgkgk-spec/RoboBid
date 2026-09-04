import { describe, it, expect } from "vitest";
import { OpportunityScorer, OpportunityScoringInput } from "@/lib/scoring/opportunity-scorer";
import { Capability } from "@/types/capability";
import { EligibilityGateResult } from "@/types/eligibility";

describe("Strict Distinction: Opportunity Score != Win Probability", () => {
  it("should never frame Opportunity Score as Win Probability", () => {
    const opp: OpportunityScoringInput = {
      id: "opp-naming-check",
      title: "스마트팩토리 자동화",
      primaryDomain: "AUTOMATION_HARDWARE",
    };
    const caps: Capability[] = [];
    const eligibility: EligibilityGateResult = {
      opportunityId: "opp-naming-check",
      overallStatus: "PASS",
      passCount: 1,
      failCount: 0,
      reviewRequiredCount: 0,
      unknownCount: 0,
      checks: [],
      canProceedToBidDecision: true,
      evaluatedAt: new Date().toISOString(),
    };

    const result = OpportunityScorer.calculate(opp, caps, eligibility);

    // Rationale must explicitly state this is NOT a win probability
    expect(result.rationale).toContain("수주 확률이 아닌");
    expect(result.rationale).not.toContain("수주 확률 80%");
    expect(result.rationale).not.toContain("수주 성공률");
  });
});
