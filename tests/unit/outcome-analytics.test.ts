import { describe, it, expect } from 'vitest';
import { OutcomeAnalytics } from '@/lib/learning/outcome-analytics';
import { OutcomeRecord } from '@/types/outcome';

describe('Phase 9: Multi-Dimensional Outcome Analytics', () => {
  const analytics = new OutcomeAnalytics();

  const mockOutcomes: OutcomeRecord[] = [
    {
      id: '1',
      organizationId: 'org-1',
      opportunityId: 'opp-1',
      status: 'AWARDED',
      agencyName: '한국에너지기술평가원',
      category: 'ENERGY',
      opportunityBudget: 400_000_000,
      awardAmount: 380_000_000,
      competitorCount: 4,
      preparationDays: 14,
      evaluationScore: 89.2,
      successReasons: ['수요처 연계 확실', '기술 완성도 우수'],
      failureReasons: [],
      capabilityGaps: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '2',
      organizationId: 'org-1',
      opportunityId: 'opp-2',
      status: 'AWARDED',
      agencyName: '한국로봇산업진흥원',
      category: 'ROBOT',
      opportunityBudget: 800_000_000,
      awardAmount: 760_000_000,
      competitorCount: 6,
      preparationDays: 20,
      evaluationScore: 94.5,
      successReasons: ['수요처 연계 확실', '특허 보유'],
      failureReasons: [],
      capabilityGaps: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '3',
      organizationId: 'org-1',
      opportunityId: 'opp-3',
      status: 'REJECTED',
      agencyName: '한국로봇산업진흥원',
      category: 'ROBOT',
      opportunityBudget: 250_000_000,
      competitorCount: 8,
      preparationDays: 7,
      evaluationScore: 71.0,
      successReasons: [],
      failureReasons: ['가격 경쟁력 부족', '유사 실적 미비'],
      capabilityGaps: ['양산 실증 트랙레코드', '가격 경쟁력'],
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('기관별 및 분야별 승률과 집계 지표를 정확하게 산출해야 한다', () => {
    const summary = analytics.calculateSummary(mockOutcomes);

    expect(summary.totalCount).toBe(3);
    expect(summary.awardedCount).toBe(2);
    expect(summary.rejectedCount).toBe(1);
    expect(summary.winRate).toBe(66.7);
    expect(summary.totalAwardAmount).toBe(1_140_000_000);
    expect(summary.avgCompetitorCount).toBe(6.0); // (4+6+8)/3 = 6.0
    expect(summary.avgPreparationDays).toBe(13.7); // (14+20+7)/3 = 13.666 -> 13.7

    // 기관별
    const robotAgency = summary.byAgency.find((a) => a.key === '한국로봇산업진흥원');
    expect(robotAgency).toBeDefined();
    expect(robotAgency?.total).toBe(2);
    expect(robotAgency?.awarded).toBe(1);
    expect(robotAgency?.winRate).toBe(50.0);

    // 분야별
    const energyCat = summary.byCategory.find((c) => c.key === 'ENERGY');
    expect(energyCat).toBeDefined();
    expect(energyCat?.winRate).toBe(100.0);
  });

  it('주요 성공 요인과 실패 역량 격차(Capability Gaps)의 빈도를 순위별로 정렬해야 한다', () => {
    const summary = analytics.calculateSummary(mockOutcomes);

    expect(summary.commonSuccessReasons[0]).toEqual({
      reason: '수요처 연계 확실',
      count: 2,
    });

    expect(summary.topCapabilityGaps).toContainEqual({
      gap: '양산 실증 트랙레코드',
      count: 1,
    });
  });
});
