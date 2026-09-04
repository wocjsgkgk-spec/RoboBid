import {
  OutcomeRecord,
  OutcomeAnalyticsSummary,
  BiasDiagnosisReport,
  DimensionMetric,
} from '@/types/outcome';

export class OutcomeAnalytics {
  /**
   * 전체 집계 및 다차원 메트릭 산출
   */
  public calculateSummary(outcomes: OutcomeRecord[]): OutcomeAnalyticsSummary {
    const totalCount = outcomes.length;
    let submittedCount = 0;
    let awardedCount = 0;
    let rejectedCount = 0;
    let withdrawnCount = 0;

    let sumScore = 0;
    let scoreCount = 0;
    let totalAwardAmount = 0;
    let sumCompetitors = 0;
    let competitorCountItems = 0;
    let sumPrepDays = 0;
    let prepDaysItems = 0;

    // 원인 및 갭 카운터
    const successReasonMap = new Map<string, number>();
    const failureReasonMap = new Map<string, number>();
    const gapMap = new Map<string, number>();

    for (const o of outcomes) {
      if (o.status === 'SUBMITTED') submittedCount++;
      else if (o.status === 'AWARDED') awardedCount++;
      else if (o.status === 'REJECTED') rejectedCount++;
      else if (o.status === 'WITHDRAWN') withdrawnCount++;

      if (o.evaluationScore !== undefined && o.evaluationScore !== null) {
        sumScore += o.evaluationScore;
        scoreCount++;
      }

      if (o.awardAmount && o.status === 'AWARDED') {
        totalAwardAmount += o.awardAmount;
      }

      if (o.competitorCount !== undefined && o.competitorCount !== null) {
        sumCompetitors += o.competitorCount;
        competitorCountItems++;
      }

      if (o.preparationDays !== undefined && o.preparationDays !== null) {
        sumPrepDays += o.preparationDays;
        prepDaysItems++;
      }

      for (const r of o.successReasons || []) {
        successReasonMap.set(r, (successReasonMap.get(r) || 0) + 1);
      }
      for (const r of o.failureReasons || []) {
        failureReasonMap.set(r, (failureReasonMap.get(r) || 0) + 1);
      }
      for (const g of o.capabilityGaps || []) {
        gapMap.set(g, (gapMap.get(g) || 0) + 1);
      }
    }

    const decidedTotal = awardedCount + rejectedCount;
    const winRate = decidedTotal > 0 ? Math.round((awardedCount / decidedTotal) * 1000) / 10 : 0;
    const avgEvaluationScore = scoreCount > 0 ? Math.round((sumScore / scoreCount) * 10) / 10 : 0;
    const avgCompetitorCount = competitorCountItems > 0 ? Math.round((sumCompetitors / competitorCountItems) * 10) / 10 : 0;
    const avgPreparationDays = prepDaysItems > 0 ? Math.round((sumPrepDays / prepDaysItems) * 10) / 10 : 0;

    // 다차원 집계
    const byAgency = this.groupByDimension(outcomes, (o) => o.agencyName || '미지정 기관');
    const byCategory = this.groupByDimension(outcomes, (o) => o.category || '기타');
    const byBudgetRange = this.groupByDimension(outcomes, (o) => this.getBudgetRange(o.opportunityBudget));
    const byScoreBracket = this.groupByDimension(outcomes, (o) => this.getScoreBracket(o.opportunityScore));
    const byDecision = this.groupByDimension(outcomes, (o) => o.decision || '미지정');

    const commonSuccessReasons = Array.from(successReasonMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    const commonFailureReasons = Array.from(failureReasonMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    const topCapabilityGaps = Array.from(gapMap.entries())
      .map(([gap, count]) => ({ gap, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCount,
      submittedCount,
      awardedCount,
      rejectedCount,
      withdrawnCount,
      winRate,
      avgEvaluationScore,
      totalAwardAmount,
      avgCompetitorCount,
      avgPreparationDays,
      byAgency,
      byCategory,
      byBudgetRange,
      byScoreBracket,
      byDecision,
      commonSuccessReasons,
      commonFailureReasons,
      topCapabilityGaps,
    };
  }

  /**
   * 차원별 그룹핑 헬퍼
   */
  private groupByDimension(
    outcomes: OutcomeRecord[],
    keyExtractor: (o: OutcomeRecord) => string
  ): DimensionMetric[] {
    const map = new Map<string, {
      total: number;
      awarded: number;
      rejected: number;
      withdrawn: number;
      sumScore: number;
      scoreCount: number;
      totalAwardAmount: number;
    }>();

    for (const o of outcomes) {
      const key = keyExtractor(o);
      const cur = map.get(key) || {
        total: 0,
        awarded: 0,
        rejected: 0,
        withdrawn: 0,
        sumScore: 0,
        scoreCount: 0,
        totalAwardAmount: 0,
      };

      cur.total++;
      if (o.status === 'AWARDED') {
        cur.awarded++;
        if (o.awardAmount) cur.totalAwardAmount += o.awardAmount;
      } else if (o.status === 'REJECTED') {
        cur.rejected++;
      } else if (o.status === 'WITHDRAWN') {
        cur.withdrawn++;
      }

      if (o.evaluationScore !== undefined && o.evaluationScore !== null) {
        cur.sumScore += o.evaluationScore;
        cur.scoreCount++;
      }

      map.set(key, cur);
    }

    return Array.from(map.entries()).map(([key, data]) => {
      const decided = data.awarded + data.rejected;
      const winRate = decided > 0 ? Math.round((data.awarded / decided) * 1000) / 10 : 0;
      const avgScore = data.scoreCount > 0 ? Math.round((data.sumScore / data.scoreCount) * 10) / 10 : undefined;
      return {
        key,
        total: data.total,
        awarded: data.awarded,
        rejected: data.rejected,
        withdrawn: data.withdrawn,
        winRate,
        avgScore,
        totalAwardAmount: data.totalAwardAmount,
      };
    }).sort((a, b) => b.total - a.total);
  }

  /**
   * 예산 구간 분류
   */
  private getBudgetRange(budget?: number | null): string {
    if (budget === undefined || budget === null) return '미정 / 비공개';
    if (budget < 100_000_000) return '1억원 미만';
    if (budget < 300_000_000) return '1억원 ~ 3억원';
    if (budget < 500_000_000) return '3억원 ~ 5억원';
    if (budget < 1_000_000_000) return '5억원 ~ 10억원';
    return '10억원 이상';
  }

  /**
   * Opportunity Score 구간 분류
   */
  private getScoreBracket(score?: number | null): string {
    if (score === undefined || score === null) return '스코어 미산정';
    if (score >= 90) return '90 ~ 100점 (최우수)';
    if (score >= 80) return '80 ~ 89점 (우수)';
    if (score >= 70) return '70 ~ 79점 (보통)';
    if (score >= 60) return '60 ~ 69점 (주의)';
    return '60점 미만 (위험)';
  }

  /**
   * 데이터 누락 및 표본 편향 진단 보고
   */
  public diagnoseBias(outcomes: OutcomeRecord[]): BiasDiagnosisReport {
    const sampleSize = outcomes.length;
    const isLowSample = sampleSize < 10;
    const warnings: string[] = [];

    if (sampleSize === 0) {
      return {
        sampleSize: 0,
        isLowSample: true,
        missingScoreRate: 0,
        missingFeedbackRate: 0,
        agencyConcentrationRisk: false,
        warnings: ['축적된 공모 지원 결과 데이터가 없습니다. 최소 10건 이상의 결과 축적이 필요합니다.'],
      };
    }

    if (isLowSample) {
      warnings.push(`현재 축적된 표본 수(${sampleSize}건)가 통계적 신뢰 기준(최소 10건)보다 적어 일부 수치에 왜곡이 있을 수 있습니다.`);
    }

    // 결측치 계산
    let missingScoreCount = 0;
    let missingFeedbackCount = 0;
    const agencyCounts = new Map<string, number>();

    for (const o of outcomes) {
      if (o.evaluationScore === undefined || o.evaluationScore === null) {
        missingScoreCount++;
      }
      if (!o.evaluationFeedback || o.evaluationFeedback.trim().length === 0) {
        missingFeedbackCount++;
      }
      const agency = o.agencyName || '미지정';
      agencyCounts.set(agency, (agencyCounts.get(agency) || 0) + 1);
    }

    const missingScoreRate = Math.round((missingScoreCount / sampleSize) * 1000) / 10;
    const missingFeedbackRate = Math.round((missingFeedbackCount / sampleSize) * 1000) / 10;

    if (missingScoreRate > 30) {
      warnings.push(`심사 평가점수 결측률이 ${missingScoreRate}%로 높습니다. 공문 상의 정량 점수를 보완해 주세요.`);
    }

    if (missingFeedbackRate > 40) {
      warnings.push(`심사위원 총평/피드백 결측률이 ${missingFeedbackRate}%로 높습니다. 사후 회고 텍스트를 입력하면 분석 정확도가 향상됩니다.`);
    }

    // 기관 쏠림 편향 검사 (단일 기관이 50% 이상 차지)
    let dominantAgency: string | undefined;
    let agencyConcentrationRisk = false;

    for (const [agency, count] of agencyCounts.entries()) {
      if (count / sampleSize >= 0.5 && sampleSize >= 3) {
        agencyConcentrationRisk = true;
        dominantAgency = agency;
        warnings.push(`특정 발주기관('${agency}', ${Math.round((count / sampleSize) * 100)}%)에 데이터가 집중되어 있어 전사 보편 모델로 일반화 시 편향 위험이 있습니다.`);
        break;
      }
    }

    return {
      sampleSize,
      isLowSample,
      missingScoreRate,
      missingFeedbackRate,
      agencyConcentrationRisk,
      dominantAgency,
      warnings,
    };
  }
}

export const outcomeAnalytics = new OutcomeAnalytics();
