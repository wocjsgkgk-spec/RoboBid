import { describe, it, expect } from 'vitest';
import { OutcomeAnalytics } from '@/lib/learning/outcome-analytics';
import { OutcomeRecord } from '@/types/outcome';

describe('Phase 9: Opportunity Score vs Actual Outcome Analytics', () => {
  const analytics = new OutcomeAnalytics();

  it('Opportunity Score 구간별 실제 수주율(Win Rate)과 평균 평가점수를 정확하게 계산해야 한다', () => {
    const outcomes: OutcomeRecord[] = [
      // 90점 이상 (최우수)
      {
        id: '1',
        organizationId: 'org-1',
        opportunityId: 'opp-1',
        status: 'AWARDED',
        opportunityScore: 95,
        evaluationScore: 94.0,
        successReasons: [],
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
        opportunityScore: 91,
        evaluationScore: 90.0,
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
      // 80~89점 (우수)
      {
        id: '3',
        organizationId: 'org-1',
        opportunityId: 'opp-3',
        status: 'AWARDED',
        opportunityScore: 85,
        evaluationScore: 88.0,
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '4',
        organizationId: 'org-1',
        opportunityId: 'opp-4',
        status: 'REJECTED',
        opportunityScore: 82,
        evaluationScore: 78.0,
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
      // 60점 미만 (위험)
      {
        id: '5',
        organizationId: 'org-1',
        opportunityId: 'opp-5',
        status: 'REJECTED',
        opportunityScore: 55,
        evaluationScore: 62.0,
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const summary = analytics.calculateSummary(outcomes);
    const scoreBrackets = summary.byScoreBracket;

    const topBracket = scoreBrackets.find((b) => b.key.includes('90 ~ 100점'));
    expect(topBracket).toBeDefined();
    expect(topBracket?.total).toBe(2);
    expect(topBracket?.awarded).toBe(2);
    expect(topBracket?.winRate).toBe(100);
    expect(topBracket?.avgScore).toBe(92.0);

    const goodBracket = scoreBrackets.find((b) => b.key.includes('80 ~ 89점'));
    expect(goodBracket).toBeDefined();
    expect(goodBracket?.total).toBe(2);
    expect(goodBracket?.awarded).toBe(1);
    expect(goodBracket?.rejected).toBe(1);
    expect(goodBracket?.winRate).toBe(50);
    expect(goodBracket?.avgScore).toBe(83.0);

    const lowBracket = scoreBrackets.find((b) => b.key.includes('60점 미만'));
    expect(lowBracket).toBeDefined();
    expect(lowBracket?.total).toBe(1);
    expect(lowBracket?.awarded).toBe(0);
    expect(lowBracket?.rejected).toBe(1);
    expect(lowBracket?.winRate).toBe(0);
  });

  it('GO 의사결정과 실제 Outcome 수주율을 비교하여 의사결정 타당성을 검증해야 한다', () => {
    const outcomes: OutcomeRecord[] = [
      {
        id: '1',
        organizationId: 'org-1',
        opportunityId: 'opp-1',
        status: 'AWARDED',
        decision: 'GO',
        successReasons: [],
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
        decision: 'GO',
        successReasons: [],
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
        decision: 'HOLD',
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const summary = analytics.calculateSummary(outcomes);
    const goDecision = summary.byDecision.find((d) => d.key === 'GO');
    expect(goDecision).toBeDefined();
    expect(goDecision?.total).toBe(2);
    expect(goDecision?.awarded).toBe(2);
    expect(goDecision?.winRate).toBe(100);

    const holdDecision = summary.byDecision.find((d) => d.key === 'HOLD');
    expect(holdDecision).toBeDefined();
    expect(holdDecision?.winRate).toBe(0);
  });
});
