import { describe, it, expect } from "vitest";
import { OpportunityScorer, OpportunityScoringInput } from "@/lib/scoring/opportunity-scorer";
import { Capability } from "@/types/capability";
import { EligibilityGateResult } from "@/types/eligibility";
import { DEFAULT_SCORE_WEIGHTS } from "@/types/scoring";

describe("Opportunity Scoring Engine — Deterministic Weight & Calculation Tests", () => {
  const referenceDate = new Date("2026-09-04T00:00:00Z");

  const sampleCapabilities: Capability[] = [
    {
      id: "cap-1",
      organizationId: "org-1",
      type: "TECHNOLOGY",
      title: "ROS2 자율주행 알고리즘 및 AMR 제어 기술",
      verificationStatus: "VERIFIED",
      confidentiality: "CONFIDENTIAL",
      evidenceFileName: "tech_spec.pdf",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "cap-2",
      organizationId: "org-1",
      type: "PATENT",
      title: "무인이송로봇 충돌방지 센서 융합 특허",
      verificationStatus: "VERIFIED",
      confidentiality: "CONFIDENTIAL",
      evidenceFileName: "patent_cert.pdf",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "cap-3",
      organizationId: "org-1",
      type: "PROJECT_HISTORY",
      title: "대구 테크노파크 스마트 물류로봇 1차 실증 사업",
      verificationStatus: "VERIFIED",
      confidentiality: "CONFIDENTIAL",
      evidenceFileName: "completion_cert.pdf",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ];

  const passEligibility: EligibilityGateResult = {
    opportunityId: "opp-1",
    overallStatus: "PASS",
    passCount: 3,
    failCount: 0,
    reviewRequiredCount: 0,
    unknownCount: 0,
    checks: [],
    canProceedToBidDecision: true,
    evaluatedAt: referenceDate.toISOString(),
  };

  const sampleOpp: OpportunityScoringInput = {
    id: "opp-1",
    title: "2026년 공공시설 무인이송로봇 AMR 실증 지원사업",
    primaryDomain: "ROBOT",
    allocatedBudget: 500000000,
    submissionDeadline: "2026-09-30T18:00:00Z", // D-26 충분한 일정
    rawText: "ROS2 기반 AMR 자율주행 실증 및 과업지시서",
  };

  it("should calculate identical scores on repeated runs with same input (Deterministic Idempotency)", () => {
    const run1 = OpportunityScorer.calculate(sampleOpp, sampleCapabilities, passEligibility, DEFAULT_SCORE_WEIGHTS, referenceDate);
    const run2 = OpportunityScorer.calculate(sampleOpp, sampleCapabilities, passEligibility, DEFAULT_SCORE_WEIGHTS, referenceDate);

    expect(run1.totalScore).toBe(run2.totalScore);
    expect(run1.technicalFit).toBe(run2.technicalFit);
    expect(run1.strategicFit).toBe(run2.strategicFit);
    expect(run1.capabilityFit).toBe(run2.capabilityFit);
    expect(run1.recommendation).toBe(run2.recommendation);
    expect(run1.totalScore).toBeGreaterThanOrEqual(75);
    expect(run1.recommendation).toBe("GO");
  });

  it("should sum default category weights to exactly 100", () => {
    const sum =
      DEFAULT_SCORE_WEIGHTS.technicalWeight +
      DEFAULT_SCORE_WEIGHTS.strategicWeight +
      DEFAULT_SCORE_WEIGHTS.capabilityWeight +
      DEFAULT_SCORE_WEIGHTS.evidenceWeight +
      DEFAULT_SCORE_WEIGHTS.financialWeight +
      DEFAULT_SCORE_WEIGHTS.scheduleWeight;

    expect(sum).toBe(100);
  });

  it("should apply severe risk penalty and recommend NO_GO when eligibility is FAIL", () => {
    const failEligibility: EligibilityGateResult = {
      opportunityId: "opp-1",
      overallStatus: "FAIL",
      passCount: 1,
      failCount: 2,
      reviewRequiredCount: 0,
      unknownCount: 0,
      checks: [],
      canProceedToBidDecision: false,
      evaluatedAt: referenceDate.toISOString(),
    };

    const res = OpportunityScorer.calculate(sampleOpp, sampleCapabilities, failEligibility, DEFAULT_SCORE_WEIGHTS, referenceDate);

    expect(res.riskPenalty).toBeGreaterThanOrEqual(30);
    expect(res.recommendation).toBe("NO_GO");
    expect(res.weaknesses).toContain("지원자격 불충족(FAIL) 항목 존재");
  });
});
