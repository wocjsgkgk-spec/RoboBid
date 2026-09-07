import { PortfolioGapAnalysis, PortfolioAdvisorRecommendation } from "@/types/portfolio-advisor";
import { AwardStore } from "@/lib/award/award-store";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { EarlySignalStore } from "@/lib/intelligence/early-signal-store";

export class PortfolioAdvisorService {
  /**
   * 연간 목표 정부지원금 대비 실시간 Gap 분석 및 지능형 어드바이저 권고안 생성
   */
  public static analyzePortfolioGap(targetAnnualGrant: number = 1_500_000_000): PortfolioGapAnalysis {
    const awardStore = AwardStore.getInstance();
    const awardedProjects = awardStore.getAll();
    const opportunities = opportunityStore.getAll();
    const earlySignalStore = EarlySignalStore.getInstance();
    const activeSignals = earlySignalStore.getActiveSignals();

    // 1. 확정된 정부지원금 합계 (Awarded)
    const awardedTotalGrant = awardedProjects.reduce(
      (sum, p) => sum + (p.fundingAllocation?.governmentGrant || 0),
      0
    );

    // 2. 심의/제안 진행 중인 정부지원금 합계 (In-Flight)
    const inFlightOpps = opportunities.filter(
      (o) =>
        o.status === "GO" ||
        o.status === "PROPOSAL_PREP" ||
        o.status === "PROPOSAL_IN_PROGRESS" ||
        o.status === "SUBMITTED" ||
        o.status === "SUBMISSION_READY"
    );
    const inFlightTotalGrant = inFlightOpps.reduce(
      (sum, o) => sum + (o.allocatedBudget || o.estimatedPrice || 0),
      0
    );

    // 3. Gap 산출
    const currentTotal = awardedTotalGrant + inFlightTotalGrant;
    const gapAmount = Math.max(0, targetAnnualGrant - currentTotal);
    const achievementRatePercent = targetAnnualGrant > 0
      ? Math.min(100, Math.round((awardedTotalGrant / targetAnnualGrant) * 100))
      : 0;
    const inFlightPotentialPercent = targetAnnualGrant > 0
      ? Math.min(100, Math.round((currentTotal / targetAnnualGrant) * 100))
      : 0;

    // 4. 주관부처/기관 편중도 분석
    const agencyCountMap: Record<string, number> = {};
    for (const p of awardedProjects) {
      const agency = p.agreement?.managingAgency || "미지정 전담기관";
      agencyCountMap[agency] = (agencyCountMap[agency] || 0) + (p.fundingAllocation?.governmentGrant || 0);
    }
    for (const o of inFlightOpps) {
      const agency = o.announcingAgency || "미지정 부처";
      agencyCountMap[agency] = (agencyCountMap[agency] || 0) + (o.allocatedBudget || 0);
    }

    let dominantAgency: string | null = null;
    let maxAgencyAmount = 0;
    for (const [agency, amount] of Object.entries(agencyCountMap)) {
      if (amount > maxAgencyAmount) {
        maxAgencyAmount = amount;
        dominantAgency = agency;
      }
    }
    const agencyConcentrationPercent = currentTotal > 0
      ? Math.round((maxAgencyAmount / currentTotal) * 100)
      : 0;

    // 5. 실시간 액션 권고안 도출
    const recommendations: PortfolioAdvisorRecommendation[] = [];

    // 권고 1: 예산 Gap 충족 권고
    if (gapAmount > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: "GAP_FILLER_OPPORTUNITY",
        priority: gapAmount >= 500_000_000 ? "HIGH" : "MEDIUM",
        title: `연간 목표 대비 ${(gapAmount / 100_000_000).toFixed(1)}억원 Gap 달성을 위한 공모 제안 필요`,
        description: `목표 ${(targetAnnualGrant / 100_000_000).toFixed(0)}억원 중 확정 ${achievementRatePercent}% 달성 상태입니다. 현재 접수 중인 고적합 공모에 추가 지원을 권장합니다.`,
        actionableLink: "/opportunities",
        impactAmount: gapAmount,
      });
    }

    // 권고 2: Early Signal 사전 준비
    if (activeSignals.length > 0) {
      const topSignal = activeSignals[0];
      recommendations.push({
        id: crypto.randomUUID(),
        type: "EARLY_SIGNAL_PREP",
        priority: "HIGH",
        title: `[조기 착수 권고] ${topSignal.agency} 사전예고 공모 대응`,
        description: `"${topSignal.title}" (${topSignal.announcementForecast.expectedPeriod} 공고 예상)에 대한 Concept 및 사전 수요기업 협약서 기획을 조기 착수하세요.`,
        actionableLink: "/intelligence",
        impactAmount: topSignal.announcementForecast.expectedBudget,
      });
    }

    // 권고 3: 전담기관 편중 리스크 경보
    if (agencyConcentrationPercent >= 70 && dominantAgency) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: "AGENCY_DIVERSIFICATION",
        priority: "MEDIUM",
        title: `[부처 다변화 권고] ${dominantAgency} 편중도 ${agencyConcentrationPercent}%`,
        description: "단일 전담기관 심사 기조 변화에 대응하기 위해 산자부(KIRIA/KEIT) 또는 과기정통부(NIPA/IITP) 사업으로 지원처를 분산하세요.",
        actionableLink: "/pipeline",
        impactAmount: 0,
      });
    }

    // 권고 4: 민간 자부담(현금) 유동성 점검
    if (awardedTotalGrant > 0) {
      const totalCashRequired = Math.round(awardedTotalGrant * 0.05); // 약 5~10% 추정
      recommendations.push({
        id: crypto.randomUUID(),
        type: "CASH_MATCH_ALERT",
        priority: "LOW",
        title: "선정 과제 민간 현금 자부담 매칭 계좌 잔액 확인",
        description: `현재 수행 과제에 대한 추정 민간 현금 부담금 약 ${(totalCashRequired / 100_000_000).toFixed(2)}억원에 대한 전용 계좌 예치 상태를 확인하세요.`,
        actionableLink: "/awards",
        impactAmount: totalCashRequired,
      });
    }

    return {
      targetAnnualGrant,
      awardedTotalGrant,
      inFlightTotalGrant,
      gapAmount,
      achievementRatePercent,
      inFlightPotentialPercent,
      dominantAgency,
      agencyConcentrationPercent,
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  }
}
