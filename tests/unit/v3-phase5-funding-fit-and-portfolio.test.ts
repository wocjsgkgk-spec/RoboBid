import { describe, it, expect, beforeEach } from "vitest";
import { FundingFitService } from "@/lib/funding/funding-fit-service";
import { FundingConflictService } from "@/lib/funding/funding-conflict-service";
import { FundingPortfolioStore } from "@/lib/funding/funding-portfolio-store";
import {
  ProjectBudgetCategory,
  PROJECT_BUDGET_CATEGORY_LABELS,
  ProjectConcept,
  MasterSpecification,
  OpportunityFundingTerms,
  FundingPortfolioItem,
} from "@/types";

describe("RoboBid AI v3.0 — Phase 5: Funding Fit, Portfolio & Conflict Engine", () => {
  const sampleProjectBudget: Record<ProjectBudgetCategory, number> = {
    LABOR: 320_000_000,
    MATERIALS: 64_000_000,
    PARTS: 144_000_000,
    EQUIPMENT: 64_000_000,
    OUTSOURCING: 96_000_000,
    VALIDATION: 32_000_000,
    SW_SERVER: 24_000_000,
    MARKETING: 16_000_000,
    CERTIFICATION: 16_000_000,
    OTHER: 24_000_000,
  }; // Total = 800_000_000 원

  const sampleFundingTerms: OpportunityFundingTerms = {
    maxGrantAmount: 500_000_000,
    selfFundingMinRatio: 0.20, // 20% 자부담 (정부지원금 80%)
    costRules: {
      LABOR: { category: "LABOR", status: "ALLOWED" },
      MATERIALS: { category: "MATERIALS", status: "ALLOWED" },
      PARTS: { category: "PARTS", status: "ALLOWED" },
      EQUIPMENT: { category: "EQUIPMENT", status: "CAPPED", capPercentage: 0.1, note: "장비비 10% 한도" },
      OUTSOURCING: { category: "OUTSOURCING", status: "ALLOWED" },
      VALIDATION: { category: "VALIDATION", status: "ALLOWED" },
      SW_SERVER: { category: "SW_SERVER", status: "ALLOWED" },
      MARKETING: { category: "MARKETING", status: "DISALLOWED", note: "마케팅비 불인정" },
      CERTIFICATION: { category: "CERTIFICATION", status: "ALLOWED" },
      OTHER: { category: "OTHER", status: "CAPPED", capPercentage: 0.05, note: "기타 간접비 5% 한도" },
    },
    specialConditions: ["신규 채용 인력에 한해 인건비 현금 지원", "민간부담금 20% 의무"],
  };

  // ==========================================================================
  // 1. Funding Fit 계산 검증
  // ==========================================================================
  describe("1. Funding Fit Engine (10개 비목 매칭 및 한도/자부담/Gap 계산)", () => {
    it("10개 비목의 총 개발비와 지원 인정 비용, 정부지원금, 자부담금을 정확히 계산한다", () => {
      const fit = FundingFitService.calculateFit(sampleProjectBudget, sampleFundingTerms);

      // 1. 총 개발비는 8억원
      expect(fit.project_cost).toBe(800_000_000);

      // 2. 마케팅비(16,000,000원)는 불인정되므로 0원
      const marketing = fit.coverage_by_category.find((c) => c.category === "MARKETING");
      expect(marketing).toBeDefined();
      expect(marketing?.isAllowed).toBe(false);
      expect(marketing?.eligibleCost).toBe(0);
      expect(marketing?.fundedGrantAmount).toBe(0);

      // 3. 장비비는 6,400만원 요청했으나 maxGrant(5억)의 10% = 5,000만원 상한 적용
      const equipment = fit.coverage_by_category.find((c) => c.category === "EQUIPMENT");
      expect(equipment?.eligibleCost).toBe(50_000_000);

      // 4. 정부지원금은 최대 한도 5억원을 초과할 수 없음
      expect(fit.grant_amount).toBeLessThanOrEqual(sampleFundingTerms.maxGrantAmount);
      expect(fit.grant_amount).toBe(500_000_000);

      // 5. 자부담금 산출 (20% 비율 반영)
      expect(fit.self_funding).toBeGreaterThan(0);

      // 6. 커버리지 산출: (5억원 / 8억원) * 100 = 62.5% -> 반올림 63%
      expect(fit.coverage).toBe(63);

      // 7. Unfunded Gap = 8억 - 5억 = 3억원
      expect(fit.unfunded_gap).toBe(300_000_000);

      // 8. 조건 목록 제공 확인
      expect(fit.conditions.length).toBeGreaterThanOrEqual(3);
    });

    it("ProjectConcept 객체를 입력받았을 때 10대 비목 예산을 자동 추출하여 Fit을 계산한다", () => {
      const concept: ProjectConcept = {
        id: "test-concept-01",
        organizationId: "00000000-0000-0000-0000-000000000001",
        name: "스마트 소방 로봇",
        summary: "화재 진압용 로봇",
        targetTrl: 5,
        requiredTechnology: ["ROS2"],
        estimatedBudget: 600_000_000,
        requiredFunding: 450_000_000,
        owner: "R&D팀",
        status: "CONCEPT",
        currentVersion: 1,
        linkedVaultAssetIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const fit = FundingFitService.calculateFit(concept, sampleFundingTerms);
      expect(fit.project_cost).toBe(600_000_000);
      expect(fit.coverage_by_category.length).toBe(10);
      expect(fit.coverage).toBeGreaterThan(0);
      expect(fit.unfunded_gap).toBe(fit.project_cost - fit.grant_amount);
    });
  });

  // ==========================================================================
  // 2. 비목별 Coverage 검증
  // ==========================================================================
  describe("2. Coverage by Category (비목별 충당률)", () => {
    it("10개 모든 비목의 요청액, 허용여부, 충당액, 충당비율이 누락 없이 제공된다", () => {
      const fit = FundingFitService.calculateFit(sampleProjectBudget, sampleFundingTerms);

      const allCategories: ProjectBudgetCategory[] = [
        "LABOR", "MATERIALS", "PARTS", "EQUIPMENT", "OUTSOURCING",
        "VALIDATION", "SW_SERVER", "MARKETING", "CERTIFICATION", "OTHER"
      ];

      for (const cat of allCategories) {
        const item = fit.coverage_by_category.find((c) => c.category === cat);
        expect(item).toBeDefined();
        expect(item?.categoryLabel).toBe(PROJECT_BUDGET_CATEGORY_LABELS[cat]);
        expect(item?.coverageRatio).toBeGreaterThanOrEqual(0);
        expect(item?.coverageRatio).toBeLessThanOrEqual(100);
      }
    });
  });

  // ==========================================================================
  // 3. 여러 Funding 조합 & 실제 Award와 Candidate 구분
  // ==========================================================================
  describe("3. Multi-Funding Portfolio & Award vs Candidate Distinction", () => {
    let portfolioStore: FundingPortfolioStore;

    beforeEach(() => {
      portfolioStore = FundingPortfolioStore.getInstance();
    });

    it("Target Cost 대비 Awarded, Under Review, Planned, Candidate가 엄격히 분리 집계된다", () => {
      const summary = portfolioStore.getSummary("c001-amr-logistics-robot");

      expect(summary.targetCost).toBe(800_000_000);

      // Candidate 금액은 절대로 Awarded에 합산되지 않아야 함
      expect(summary.candidate).toBeGreaterThan(0);
      expect(summary.awarded).toBeLessThan(summary.targetCost);

      // Awarded 기준 Coverage 계산: (awarded / targetCost) * 100
      const expectedCoverage = Math.round((summary.awarded / summary.targetCost) * 100);
      expect(summary.coverage).toBe(expectedCoverage);

      // Funding Gap = targetCost - awarded
      expect(summary.gap).toBe(summary.targetCost - summary.awarded);
    });

    it("새로운 지원금을 Candidate로 추가했을 때 Awarded는 변하지 않고 Candidate만 증가한다", () => {
      const initial = portfolioStore.getSummary("c001-amr-logistics-robot");
      const initialAwarded = initial.awarded;
      const initialCandidate = initial.candidate;

      const added = portfolioStore.add({
        projectConceptId: "c001-amr-logistics-robot",
        opportunityId: "opp-new-cand",
        opportunityTitle: "2026년 산학연 협력 R&D",
        announcingAgency: "중소벤처기업부",
        fundingType: "GOV_RND",
        status: "CANDIDATE",
        targetGrantAmount: 100_000_000,
        awardedGrantAmount: 0,
        selfFundingAmount: 20_000_000,
        period: { startDate: "2026-09-01", endDate: "2027-08-31" },
        allocatedCategories: { LABOR: 50_000_000, PARTS: 50_000_000 },
      });

      const updated = portfolioStore.getSummary("c001-amr-logistics-robot");
      expect(updated.awarded).toBe(initialAwarded); // Awarded 불변
      expect(updated.candidate).toBe(initialCandidate + 100_000_000); // Candidate만 증가

      // 상태를 AWARDED로 갱신하면 비로소 Awarded에 반영되고 Gap이 줄어듦
      portfolioStore.update(added.id, {
        status: "AWARDED",
        awardedGrantAmount: 100_000_000,
      });

      const finalSummary = portfolioStore.getSummary("c001-amr-logistics-robot");
      expect(finalSummary.awarded).toBe(initialAwarded + 100_000_000);
      expect(finalSummary.gap).toBe(initial.gap - 100_000_000);
      expect(finalSummary.coverage).toBeGreaterThan(initial.coverage);

      // Cleanup
      portfolioStore.remove(added.id);
    });
  });

  // ==========================================================================
  // 4. Funding Conflict Checker (7 Dimensions & Risk Levels)
  // ==========================================================================
  describe("4. Funding Conflict Checker Engine (중복수혜/중복계상 7개 영역 진단)", () => {
    const existingPortfolio: FundingPortfolioItem[] = [
      {
        id: "port-active-1",
        projectConceptId: "c001-amr-logistics-robot",
        opportunityId: "opp-active-1",
        opportunityTitle: "2025년 창업성장기술개발사업 (디딤돌)",
        announcingAgency: "중소벤처기업부",
        fundingType: "GOV_RND",
        status: "AWARDED",
        targetGrantAmount: 120_000_000,
        awardedGrantAmount: 120_000_000,
        selfFundingAmount: 24_000_000,
        period: { startDate: "2025-06-01", endDate: "2026-05-31" },
        allocatedCategories: { LABOR: 60_000_000, PARTS: 40_000_000, EQUIPMENT: 20_000_000 },
        assetsIncluded: ["Nvidia Jetson Orin 64GB"],
        partsIncluded: ["BLDC 서보모터 드라이버"],
        personnelIncluded: ["김수석"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    it("동일 프로젝트에 동일 지원사업 중복 신청 시 PROHIBITED 위험을 감지한다", () => {
      const report = FundingConflictService.checkConflicts(
        {
          opportunityTitle: "2025년 창업성장기술개발사업 (디딤돌)", // 동일 공고명
          announcingAgency: "중소벤처기업부",
          fundingType: "GOV_RND",
          period: { startDate: "2025-06-01", endDate: "2026-05-31" },
          allocatedCategories: { LABOR: 30_000_000 },
        },
        existingPortfolio
      );

      expect(report.overallRisk).toBe("PROHIBITED");
      expect(report.findings.some((f) => f.checkType === "SAME_PROJECT")).toBe(true);
    });

    it("기존 국비 과제에서 이미 구입한 자산/장비의 중복 구입을 감지하여 PROHIBITED로 경고한다", () => {
      const report = FundingConflictService.checkConflicts(
        {
          opportunityTitle: "2026년 지능형 로봇 실증사업",
          announcingAgency: "한국로봇산업진흥원",
          fundingType: "VALIDATION_GRANT",
          period: { startDate: "2026-01-01", endDate: "2026-12-31" },
          allocatedCategories: { EQUIPMENT: 20_000_000 },
          assetsIncluded: ["Nvidia Jetson Orin 64GB"], // 동일 장비 이중 구입
        },
        existingPortfolio
      );

      expect(report.overallRisk).toBe("PROHIBITED");
      const assetFinding = report.findings.find((f) => f.checkType === "SAME_ASSET");
      expect(assetFinding).toBeDefined();
      expect(assetFinding?.riskLevel).toBe("PROHIBITED");
    });

    it("참여 연구원의 단일 과제 참여율이 100%를 초과할 경우 PROHIBITED로 차단한다", () => {
      const report = FundingConflictService.checkConflicts(
        {
          opportunityTitle: "신규 R&D 사업",
          announcingAgency: "산업통상자원부",
          fundingType: "GOV_RND",
          period: { startDate: "2026-07-01", endDate: "2027-06-30" },
          allocatedCategories: { LABOR: 80_000_000 },
          personnelIncluded: [{ name: "최연구원", participationRate: 120 }], // 120% 참여율 위반
        },
        existingPortfolio
      );

      const laborFinding = report.findings.find((f) => f.checkType === "SAME_LABOR");
      expect(laborFinding).toBeDefined();
      expect(laborFinding?.riskLevel).toBe("PROHIBITED");
    });

    it("충돌 요인이 없는 독립적인 신규 지원사업은 SAFE 판정을 내린다", () => {
      const report = FundingConflictService.checkConflicts(
        {
          opportunityTitle: "2027년 차세대 해양 로봇 기술개발사업",
          announcingAgency: "해양수산부",
          fundingType: "GOV_RND",
          period: { startDate: "2027-01-01", endDate: "2027-12-31" }, // 기간 중복 없음
          allocatedCategories: { VALIDATION: 50_000_000 },
          assetsIncluded: ["수중 방수 테스트 수조"], // 새로운 장비
          partsIncluded: ["수중 추진 모터"], // 새로운 부품
          personnelIncluded: [{ name: "신규채용 박사", participationRate: 50 }],
        },
        existingPortfolio
      );

      expect(report.overallRisk).toBe("SAFE");
      expect(report.prohibitedCount).toBe(0);
    });

    it("법적 확정판단이 아님을 명시하는 고지문구(Disclaimer)를 필수로 포함한다", () => {
      const report = FundingConflictService.checkConflicts(
        {
          opportunityTitle: "테스트 공고",
          announcingAgency: "과학기술정보통신부",
          fundingType: "GOV_RND",
          period: { startDate: "2026-06-01", endDate: "2027-05-31" },
          allocatedCategories: {},
        },
        existingPortfolio
      );

      expect(report.disclaimer).toBeDefined();
      expect(report.disclaimer).toContain("법적 확정 판단이 아닙니다");
      expect(report.disclaimer).toContain("전담기관");
    });
  });
});
