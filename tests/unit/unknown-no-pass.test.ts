import { describe, it, expect } from "vitest";
import { EligibilityRuleEngine, OpportunityEligibilityInput } from "@/lib/eligibility/rule-engine";
import { Capability } from "@/types/capability";

describe("Strict Zero-Unknown-Pass Rule Verification", () => {
  it("should NEVER convert UNKNOWN to PASS when required capability information is missing", () => {
    // Empty capability vault (no profile registered)
    const emptyCapabilities: Capability[] = [];

    const opp: OpportunityEligibilityInput = {
      id: "opp-strict-test",
      title: "2026년 첨단 로봇 실증 공모사업",
      announcingAgency: "한국로봇산업진흥원",
      requirements: [
        {
          reqCode: "REQ-ELG-001",
          title: "업력제한",
          description: "공고일 기준 창업 7년 이내의 중소기업이어야 한다.",
          category: "ELIGIBILITY",
          isMandatory: true,
          citationQuote: "창업 7년 이내의 중소기업",
        },
      ],
    };

    const result = EligibilityRuleEngine.evaluate(opp, emptyCapabilities);

    // Strict Rule: UNKNOWN must NOT become PASS!
    expect(result.overallStatus).not.toBe("PASS");
    expect(result.overallStatus).toBe("UNKNOWN");
    expect(result.unknownCount).toBeGreaterThanOrEqual(1);
    expect(result.canProceedToBidDecision).toBe(false);

    const check = result.checks.find((c) => c.ruleCode === "RULE-AGE");
    expect(check?.status).toBe("UNKNOWN");
    expect(check?.reason).toContain("사내 회사 프로필(설립일자)이 등록되지 않아");
  });
});
