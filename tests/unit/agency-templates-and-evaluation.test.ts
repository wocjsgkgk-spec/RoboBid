import { describe, it, expect } from "vitest";
import { AGENCY_TEMPLATES } from "../../src/lib/proposals/agency-templates";
import { AgencyEvaluationService } from "../../src/lib/scoring/agency-evaluation-criteria";
import { STANDARD_CAPABILITIES_SEED } from "../../src/lib/vault/standard-capabilities-seed";

describe("Agency Templates and Bonus Points Evaluation", () => {
  it("should provide 4 standard public agency templates with mandatory docs and TOC", () => {
    expect(AGENCY_TEMPLATES.KONEPS).toBeDefined();
    expect(AGENCY_TEMPLATES.NIPA_NIA).toBeDefined();
    expect(AGENCY_TEMPLATES.TIPA_MSS).toBeDefined();
    expect(AGENCY_TEMPLATES.IRIS_RND).toBeDefined();

    // KONEPS verification
    expect(AGENCY_TEMPLATES.KONEPS.sections.length).toBe(5);
    expect(AGENCY_TEMPLATES.KONEPS.mandatoryDocuments.length).toBeGreaterThan(0);

    // TIPA verification
    expect(AGENCY_TEMPLATES.TIPA_MSS.sections.length).toBe(5);
    expect(AGENCY_TEMPLATES.TIPA_MSS.primaryBidTypes).toContain("R_AND_D");
  });

  it("should evaluate bonus points correctly from company capability vault assets", () => {
    const konepsEval = AgencyEvaluationService.evaluateAgencyBonus("KONEPS", STANDARD_CAPABILITIES_SEED);
    expect(konepsEval.agencyType).toBe("KONEPS");
    expect(konepsEval.effectiveBonusPoints).toBeGreaterThan(0);
    // KONEPS max allowable bonus is 3.0 points
    expect(konepsEval.effectiveBonusPoints).toBeLessThanOrEqual(3.0);

    const tipaEval = AgencyEvaluationService.evaluateAgencyBonus("TIPA_MSS", STANDARD_CAPABILITIES_SEED);
    expect(tipaEval.agencyType).toBe("TIPA_MSS");
    // Should recognize Venture, InnoBiz, Research Lab, and Registered Patents
    const ventureBonus = tipaEval.bonusItems.find((b) => b.id === "BONUS_VENTURE");
    expect(ventureBonus?.isEligible).toBe(true);
    expect(ventureBonus?.awardedPoints).toBe(1.0);

    const labBonus = tipaEval.bonusItems.find((b) => b.id === "BONUS_RESEARCH_LAB");
    expect(labBonus?.isEligible).toBe(true);

    // TIPA max allowable bonus is 5.0 points
    expect(tipaEval.effectiveBonusPoints).toBeLessThanOrEqual(5.0);
  });
});
