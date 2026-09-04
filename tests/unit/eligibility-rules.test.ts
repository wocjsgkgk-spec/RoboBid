import { describe, it, expect } from "vitest";
import { EligibilityRuleEngine, OpportunityEligibilityInput } from "@/lib/eligibility/rule-engine";
import { Capability } from "@/types/capability";

describe("Eligibility Rule Engine — Deterministic PASS / FAIL Scenarios", () => {
  const baseCompanyCapabilities: Capability[] = [
    {
      id: "cap-profile-1",
      organizationId: "org-1",
      type: "COMPANY_PROFILE",
      title: "회사 기본 프로필",
      metadata: {
        establishedDate: "2023-01-15", // 약 3.6년 업력
        headquartersRegion: "대구광역시 북구",
        companyScale: "SME", // 중소기업
      },
      verificationStatus: "VERIFIED",
      confidentiality: "CONFIDENTIAL",
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "cap-cert-1",
      organizationId: "org-1",
      type: "CERTIFICATION",
      title: "이노비즈(Inno-Biz) 기술혁신형 중소기업 인증서",
      validUntil: "2028-12-31",
      verificationStatus: "VERIFIED",
      confidentiality: "CONFIDENTIAL",
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "cap-fin-1",
      organizationId: "org-1",
      type: "FINANCIAL_PROFILE",
      title: "2025년 결산 재무제표",
      metadata: {
        fiscalYear: 2025,
        revenueKrw: 2500000000,
        capitalImpairment: false, // 자본잠식 없음
      },
      verificationStatus: "VERIFIED",
      confidentiality: "RESTRICTED",
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    },
  ];

  it("should PASS when business age, region, and scale requirements match", () => {
    const opp: OpportunityEligibilityInput = {
      id: "opp-daegu-robot",
      title: "2026년 대구광역시 서비스로봇 실증 지원사업",
      announcingAgency: "대구테크노파크",
      requirements: [
        {
          reqCode: "REQ-ELG-001",
          title: "신청자격",
          description: "공고일 기준 창업 7년 이내의 대구광역시 소재 중소기업이어야 한다.",
          category: "ELIGIBILITY",
          isMandatory: true,
          citationSection: "신청자격",
          citationQuote: "창업 7년 이내의 대구광역시 소재 중소기업",
        },
      ],
    };

    const result = EligibilityRuleEngine.evaluate(
      opp,
      baseCompanyCapabilities,
      new Date("2026-09-04")
    );

    expect(result.overallStatus).toBe("PASS");
    expect(result.failCount).toBe(0);
    expect(result.passCount).toBeGreaterThanOrEqual(2);
    expect(result.canProceedToBidDecision).toBe(true);
  });

  it("should FAIL when business age exceeds maximum allowed years (e.g. 3 years)", () => {
    const opp: OpportunityEligibilityInput = {
      id: "opp-early-stage",
      title: "초기창업패키지 지원사업 (3년 이내 기업)",
      announcingAgency: "창업진흥원",
      requirements: [
        {
          reqCode: "REQ-ELG-001",
          title: "신청자격",
          description: "공고일 기준 창업 3년 이내의 초기 중소기업에 한함",
          category: "ELIGIBILITY",
          isMandatory: true,
          citationQuote: "창업 3년 이내의 초기 중소기업",
        },
      ],
    };

    // 회사 업력: 2023-01-15 ~ 2026-09-04 = 약 3.6년 (3년 초과)
    const result = EligibilityRuleEngine.evaluate(
      opp,
      baseCompanyCapabilities,
      new Date("2026-09-04")
    );

    expect(result.overallStatus).toBe("FAIL");
    expect(result.failCount).toBe(1);
    expect(result.canProceedToBidDecision).toBe(false);

    const ageCheck = result.checks.find((c) => c.ruleCode === "RULE-AGE");
    expect(ageCheck?.status).toBe("FAIL");
    expect(ageCheck?.reason).toContain("초과하여 부적격");
  });

  it("should FAIL when region requirement conflicts with company headquarters", () => {
    const opp: OpportunityEligibilityInput = {
      id: "opp-busan-only",
      title: "부산광역시 물류로봇 보조금 공모사업",
      announcingAgency: "부산경제진흥원",
      requirements: [
        {
          reqCode: "REQ-ELG-001",
          title: "신청자격",
          description: "부산광역시 소재 로봇 기업에 한함",
          category: "ELIGIBILITY",
          isMandatory: true,
          citationQuote: "부산광역시 소재 로봇 기업",
        },
      ],
    };

    // 회사 소재지: 대구광역시 -> 부산 불일치
    const result = EligibilityRuleEngine.evaluate(
      opp,
      baseCompanyCapabilities,
      new Date("2026-09-04")
    );

    expect(result.overallStatus).toBe("FAIL");
    const regCheck = result.checks.find((c) => c.ruleCode.includes("RULE-REGION"));
    expect(regCheck?.status).toBe("FAIL");
    expect(regCheck?.reason).toContain("불일치");
  });
});
