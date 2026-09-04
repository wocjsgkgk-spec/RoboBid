import { describe, it, expect } from "vitest";
import {
  QualificationEvaluator,
  CreditRatingGrade,
} from "@/lib/bidding/qualification-evaluator";

describe("QualificationEvaluator (조달청 적격심사 종합 모의 진단기)", () => {
  it("BBB- 이상의 신용평가등급은 경영상태 30점 만점을 부여해야 한다", () => {
    const grades: CreditRatingGrade[] = ["AAA", "AA", "A+", "A", "BBB+", "BBB", "BBB-"];
    for (const g of grades) {
      expect(QualificationEvaluator.getManagementScore(g)).toBe(30.0);
    }
    expect(QualificationEvaluator.getManagementScore("BB+")).toBe(29.5);
    expect(QualificationEvaluator.getManagementScore("B-")).toBe(27.0);
  });

  it("실적 누계액이 공고 추정가격의 100% 이상일 때 실적 만점 70점을 부여해야 한다", () => {
    const targetPrice = 500_000_000;
    const companyTrack = 600_000_000; // 120%
    const res = QualificationEvaluator.getTrackRecordScore(companyTrack, targetPrice);

    expect(res.score).toBe(70.0);
    expect(res.ratio).toBe(120.0);
  });

  it("실적이 70%~100% 미만일 때 66.5점을 부여해야 한다", () => {
    const targetPrice = 500_000_000;
    const companyTrack = 400_000_000; // 80%
    const res = QualificationEvaluator.getTrackRecordScore(companyTrack, targetPrice);

    expect(res.score).toBe(66.5);
    expect(res.ratio).toBe(80.0);
  });

  it("신인도 가점과 감점을 올바르게 합산하고 5점 상한을 준수해야 한다", () => {
    const res = QualificationEvaluator.evaluate({
      targetEstimatedPrice: 500_000_000,
      companyTrackRecordTotal: 500_000_000, // 100% -> 70점
      creditRating: "A", // 30점
      selectedBonuses: [
        "SME_CERT", // 1.5
        "FEMALE_BIZ", // 1.0
        "NEW_TECH_NET", // 1.5
        "INNOBIZ", // 1.0
        "YOUTH_HIRING", // 1.0 -> 합계 6.0점이지만 상한 5.0점
      ],
    });

    expect(res.managementScore).toBe(30.0);
    expect(res.trackRecordScore).toBe(70.0);
    expect(res.reliabilityBonusScore).toBe(5.0);
    expect(res.totalScore).toBe(100.0);
    expect(res.isPassed).toBe(true);
  });

  it("점수 미달 시 적절한 컨소시엄 및 가점 보강 권고사항을 제시해야 한다", () => {
    const res = QualificationEvaluator.evaluate({
      targetEstimatedPrice: 1_000_000_000,
      companyTrackRecordTotal: 200_000_000, // 20% -> 49점
      creditRating: "B-", // 27점
      passScoreThreshold: 85.0,
      selectedBonuses: [],
    });

    // 49 + 27 = 76점 (85점 미달)
    expect(res.totalScore).toBe(76.0);
    expect(res.isPassed).toBe(false);
    expect(res.recommendations.some((r) => r.includes("공동도급"))).toBe(true);
    expect(res.recommendations.some((r) => r.includes("부족합니다"))).toBe(true);
  });
});
