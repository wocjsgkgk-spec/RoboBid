import { describe, it, expect } from "vitest";
import { VaultManager } from "@/lib/vault/vault-manager";
import { Capability } from "@/types/capability";
import { EligibilityRuleEngine, OpportunityEligibilityInput } from "@/lib/eligibility/rule-engine";

describe("Vault Expiration Warnings & Certification Validity", () => {
  const referenceDate = new Date("2026-09-04");

  it("should accurately detect expired and expiring soon capabilities", () => {
    const rawCaps: Capability[] = [
      {
        id: "cap-cert-expired",
        organizationId: "org-1",
        type: "CERTIFICATION",
        title: "만료된 이노비즈 인증서",
        validUntil: "2026-08-31", // 과거 -> 만료됨
        verificationStatus: "VERIFIED",
        confidentiality: "CONFIDENTIAL",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "cap-cert-soon",
        organizationId: "org-1",
        type: "CERTIFICATION",
        title: "만료 임박 벤처기업확인서",
        validUntil: "2026-09-20", // 16일 남음 -> 30일 이내 만료 임박
        verificationStatus: "VERIFIED",
        confidentiality: "CONFIDENTIAL",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "cap-cert-valid",
        organizationId: "org-1",
        type: "CERTIFICATION",
        title: "유효한 연구전담부서 인증서",
        validUntil: "2028-12-31", // 2년 이상 남음
        verificationStatus: "VERIFIED",
        confidentiality: "CONFIDENTIAL",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ];

    const enriched = VaultManager.enrichWithAlerts(rawCaps, referenceDate);

    // 1. Expired check
    expect(enriched[0].isExpired).toBe(true);
    expect(enriched[0].verificationStatus).toBe("EXPIRED");
    expect(enriched[0].daysRemaining).toBeLessThan(0);

    // 2. Expiring soon check
    expect(enriched[1].isExpired).toBe(false);
    expect(enriched[1].isExpiringSoon).toBe(true);
    expect(enriched[1].daysRemaining).toBeGreaterThanOrEqual(15);
    expect(enriched[1].daysRemaining).toBeLessThanOrEqual(18);

    // 3. Valid check
    expect(enriched[2].isExpired).toBe(false);
    expect(enriched[2].isExpiringSoon).toBe(false);
    expect(enriched[2].verificationStatus).toBe("VERIFIED");
  });

  it("should FAIL eligibility when mandatory certificate exists but is EXPIRED", () => {
    // Only expired innobiz cert exists
    const capabilitiesWithExpiredCert: Capability[] = [
      {
        id: "cap-innobiz-expired",
        organizationId: "org-1",
        type: "CERTIFICATION",
        title: "이노비즈 기술혁신형 인증서",
        validUntil: "2026-08-01",
        verificationStatus: "EXPIRED", // 만료된 상태
        confidentiality: "CONFIDENTIAL",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ];

    const opp: OpportunityEligibilityInput = {
      id: "opp-innobiz-mandatory",
      title: "기술혁신형 이노비즈 필수 공모사업",
      announcingAgency: "중소벤처기업부",
      requirements: [
        {
          reqCode: "REQ-ELG-001",
          title: "필수 자격",
          description: "이노비즈 인증 보유 기업 필수 참여",
          category: "ELIGIBILITY",
          isMandatory: true,
          citationQuote: "이노비즈 인증 보유 기업 필수",
        },
      ],
    };

    const result = EligibilityRuleEngine.evaluate(
      opp,
      capabilitiesWithExpiredCert,
      referenceDate
    );

    expect(result.overallStatus).toBe("FAIL");
    const certCheck = result.checks.find((c) => c.ruleCode.includes("RULE-CERT"));
    expect(certCheck?.status).toBe("FAIL");
    expect(certCheck?.reason).toContain("유효 인증이 사내 역량 저장소에 존재하지 않습니다");
  });
});
