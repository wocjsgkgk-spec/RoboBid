import { describe, it, expect, beforeEach } from "vitest";
import { EarlySignalStore } from "@/lib/intelligence/early-signal-store";
import { EarlySignalService } from "@/lib/intelligence/early-signal-service";
import { PortfolioAdvisorService } from "@/lib/portfolio/portfolio-advisor";
import { todayService } from "@/lib/today/today-service";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { AwardStore } from "@/lib/award/award-store";
import { CreateEarlySignalInput } from "@/types/early-signal";

describe("Phase 10 — Intelligence, Early Signal, Portfolio Advisor & Today v3", () => {
  beforeEach(() => {
    EarlySignalStore.getInstance().clear();
    // Re-seed default signals for fresh test isolation
    const store = EarlySignalStore.getInstance();
    store.create({
      title: "2027년도 유망 서비스로봇 실증 및 사업화 지원사업 (사전예고)",
      agency: "한국로봇산업진흥원 (KIRIA)",
      sourceType: "PRE_NOTICE",
      expectedPeriod: "2027년 2월 2~3주차",
      expectedBudget: 500_000_000,
      confidence: "HIGH",
      basisYears: 3,
      historicalDates: ["2024-02-14", "2025-02-17", "2026-02-19"],
      rationale: "최근 3개년 2월 중순 반복 공고 이력",
      targetDomain: "ROBOT",
      keyRequirementsSnippet: "물류/제조 현장 100시간 무중단 실증 레퍼런스 필요",
      sourceUrl: "https://www.kiria.org",
    });
  });

  describe("1. Early Signal Store & Active Filtering", () => {
    it("should retrieve active early signals and filter by target domain", () => {
      const store = EarlySignalStore.getInstance();
      const allSignals = store.getAll();
      expect(allSignals.length).toBeGreaterThanOrEqual(1);

      const activeSignals = store.getActiveSignals();
      expect(activeSignals.length).toBeGreaterThanOrEqual(1);
      expect(activeSignals[0].status).not.toBe("CONVERTED_TO_OPPORTUNITY");

      const robotSignals = store.getByDomain("ROBOT");
      expect(robotSignals.length).toBeGreaterThanOrEqual(1);
      expect(robotSignals[0].targetDomain).toBe("ROBOT");
    });

    it("should create new early signals with auto-generated id and timestamps", () => {
      const store = EarlySignalStore.getInstance();
      const input: CreateEarlySignalInput = {
        title: "2027 스마트팩토리 AI 솔루션 보급 확산 사업계획안",
        agency: "스마트제조혁신추진단",
        sourceType: "BUSINESS_PLAN",
        expectedPeriod: "2027년 3월",
        expectedBudget: 300_000_000,
        confidence: "MEDIUM",
        targetDomain: "AI",
      };

      const created = store.create(input);
      expect(created.id).toBeTruthy();
      expect(created.status).toBe("SIGNAL");
      expect(created.announcementForecast.isForecast).toBe(true);
      expect(created.announcementForecast.isOfficial).toBe(false);
      expect(created.detectedAt).toBeTruthy();
    });
  });

  describe("2. Recurring Calendar Forecast Engine (Non-official Disclaimer Invariant)", () => {
    it("should generate recurring calendar forecasts based on historical multi-year patterns", () => {
      const forecastTIPA = EarlySignalService.predictRecurringCalendar(
        "중소기업기술정보진흥원 (TIPA)",
        ["기술혁신", "수출지향형"],
        2027
      );

      expect(forecastTIPA.expectedPeriod).toContain("2027년");
      expect(forecastTIPA.confidence).toBe("HIGH");
      expect(forecastTIPA.basisYears).toBeGreaterThanOrEqual(3);
      expect(forecastTIPA.historicalDates.length).toBeGreaterThanOrEqual(3);

      // Strict Invariants: Cannot be treated as official confirmed announcements
      expect(forecastTIPA.isForecast).toBe(true);
      expect(forecastTIPA.isOfficial).toBe(false);
      expect(forecastTIPA.rationale).toContain("반복 공고");
    });

    it("should handle specialized domain forecasting (e.g. NIPA 바우처)", () => {
      const forecastNIPA = EarlySignalService.predictRecurringCalendar(
        "NIPA",
        ["AI바우처", "추경"],
        2027
      );

      expect(forecastNIPA.expectedPeriod).toContain("2027년");
      expect(forecastNIPA.confidence).toBe("HIGH");
      expect(forecastNIPA.isForecast).toBe(true);
      expect(forecastNIPA.isOfficial).toBe(false);
    });
  });

  describe("3. Early Signal to Opportunity Conversion & Lineage Tracking", () => {
    it("should convert an early signal into an active Opportunity preserving lineage", () => {
      const store = EarlySignalStore.getInstance();
      const signal = store.getActiveSignals()[0];
      expect(signal).toBeDefined();

      const opp = EarlySignalService.convertToOpportunity({
        signalId: signal.id,
        officialAnnouncementNumber: "NOTC-2027-KIRIA-001",
        officialTitle: "2027년도 유망 서비스로봇 실증 및 사업화 지원사업 정식 공고",
        submissionDeadline: "2027-03-31",
        allocatedBudget: 500_000_000,
      });

      expect(opp.id).toBeTruthy();
      expect(opp.sourceId).toBe("NOTC-2027-KIRIA-001");
      expect(opp.status).toBe("OPEN");
      expect(opp.submissionDeadline).toBe("2027-03-31");
      expect(opp.allocatedBudget).toBe(500_000_000);
      expect(opp.originSource).toContain(signal.id);

      // Check signal update
      const updatedSignal = store.getById(signal.id);
      expect(updatedSignal?.status).toBe("CONVERTED_TO_OPPORTUNITY");
      expect(updatedSignal?.convertedOpportunityId).toBe(opp.id);
    });
  });

  describe("4. Portfolio Advisor Service & Real-time Gap Analysis", () => {
    it("should accurately calculate funding gap and generate strategic advisor recommendations", () => {
      const targetGrant = 1_500_000_000; // 15억원
      const analysis = PortfolioAdvisorService.analyzePortfolioGap(targetGrant);

      expect(analysis.targetAnnualGrant).toBe(targetGrant);
      expect(analysis.gapAmount).toBeGreaterThanOrEqual(0);
      expect(analysis.achievementRatePercent).toBeGreaterThanOrEqual(0);
      expect(analysis.achievementRatePercent).toBeLessThanOrEqual(100);
      expect(analysis.recommendations.length).toBeGreaterThanOrEqual(1);

      // Verify recommendation types
      const types = analysis.recommendations.map((r) => r.type);
      expect(types.some((t) => t === "GAP_FILLER_OPPORTUNITY" || t === "EARLY_SIGNAL_PREP")).toBe(true);

      const earlySignalRec = analysis.recommendations.find((r) => r.type === "EARLY_SIGNAL_PREP");
      if (earlySignalRec) {
        expect(earlySignalRec.actionableLink).toBeTruthy();
        expect(earlySignalRec.priority).toBe("HIGH");
      }
    });
  });

  describe("5. Today v3 Multi-source Intelligence Aggregation (9-Priority Completeness)", () => {
    it("should aggregate all 9 priority operational intelligence feeds into TodayBidOpsSummary", () => {
      const opportunities = opportunityStore.getAll();
      const earlySignals = EarlySignalStore.getInstance().getActiveSignals();
      const portfolioGap = PortfolioAdvisorService.analyzePortfolioGap(1_500_000_000);

      const summary = todayService.aggregateTodaySummary({
        opportunities,
        scores: new Map(),
        decisions: [],
        providerHealths: [],
        earlySignals,
        portfolioGap,
        awardedMilestones: [
          {
            projectId: "p-001",
            projectName: "물류 로봇 실증",
            milestoneTitle: "중간 보고서 제출",
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            daysRemaining: 5,
          },
        ],
        vaultAlerts: [
          {
            capabilityId: "cap-001",
            title: "벤처기업 확인서",
            alertType: "EXPIRING_SOON",
            daysUntilExpiry: 20,
          },
        ],
      });

      // 1. Check counts
      expect(summary.earlySignalCount).toBe(earlySignals.length);
      expect(summary.portfolioGapAmount).toBe(portfolioGap.gapAmount);

      // 2. Check early signal action items included
      const signalAction = summary.actionItems.find((a) => a.id.startsWith("action-signal-"));
      expect(signalAction).toBeDefined();

      // 3. Check milestone action item included
      const milestoneAction = summary.actionItems.find((a) => a.id.startsWith("action-milestone-"));
      expect(milestoneAction).toBeDefined();
      expect(milestoneAction?.daysRemaining).toBe(5);

      // 4. Check vault alert action item included
      const vaultAction = summary.actionItems.find((a) => a.id.startsWith("action-vault-"));
      expect(vaultAction).toBeDefined();
      expect(vaultAction?.type).toBe("CERT_EXPIRING");

      // 5. Check portfolioGap and earlySignals attached
      expect(summary.portfolioGap).toBeDefined();
      expect(summary.earlySignals).toBeDefined();
      expect(summary.awardedMilestones?.length).toBe(1);
      expect(summary.vaultAlerts?.length).toBe(1);
    });
  });
});
