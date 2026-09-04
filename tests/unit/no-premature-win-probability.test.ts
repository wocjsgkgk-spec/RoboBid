import { describe, it, expect } from 'vitest';
import { OutcomeService } from '@/lib/learning/outcome-service';
import { OutcomeAnalytics } from '@/lib/learning/outcome-analytics';

describe('Phase 9: Zero Premature Win Probability Model (PRD Section 14, 22 Compliance)', () => {
  it('Outcome 서비스 및 애널리틱스는 예측 모델(Win Probability Model)이 아닌 사후 통계(Dataset & Post-hoc Analytics)로만 동작해야 한다', () => {
    const service = new OutcomeService();
    const analytics = new OutcomeAnalytics();

    // 불변식: 서비스 및 분석 클래스에 predictWinProbability 등의 예측 메서드가 운영 기능으로 노출되지 않음
    expect((service as any).predictWinProbability).toBeUndefined();
    expect((analytics as any).trainModel).toBeUndefined();
    expect((analytics as any).predict).toBeUndefined();
  });

  it('기록된 Outcome은 과거 실데이터(Awarded/Rejected) 기반의 사후 승률(Historical Win Rate)만을 계산해야 한다', () => {
    const analytics = new OutcomeAnalytics();

    const outcomes = [
      {
        id: '1',
        organizationId: 'org-1',
        opportunityId: 'opp-1',
        status: 'AWARDED' as const,
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
        status: 'REJECTED' as const,
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const summary = analytics.calculateSummary(outcomes);
    // Historical Win Rate = 50%
    expect(summary.winRate).toBe(50);

    // 아직 미확정(SUBMITTED)인 상태만 있을 경우 사후 승률은 0%이며 추정치를 조작하지 않음
    const pendingOutcomes = [
      {
        id: '3',
        organizationId: 'org-1',
        opportunityId: 'opp-3',
        status: 'SUBMITTED' as const,
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const pendingSummary = analytics.calculateSummary(pendingOutcomes);
    expect(pendingSummary.winRate).toBe(0);
  });
});
