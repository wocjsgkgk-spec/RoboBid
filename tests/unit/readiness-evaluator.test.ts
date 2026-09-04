import { describe, it, expect, beforeEach } from 'vitest';
import { ReadinessEvaluator } from '@/lib/intelligence/readiness-evaluator';
import { OutcomeService } from '@/lib/learning/outcome-service';

describe('Phase 11: Readiness Quantitative Evaluation & Model Gate', () => {
  let outcomeService: OutcomeService;
  let evaluator: ReadinessEvaluator;

  beforeEach(() => {
    outcomeService = new OutcomeService();
    evaluator = new ReadinessEvaluator(outcomeService);
  });

  it('축적된 결과 표본이 100건 미만인 경우 머신러닝 Win Probability 모델 배포에 대해 엄격히 NO-GO 판정을 내려야 한다', () => {
    // 5건의 결과 등록
    for (let i = 1; i <= 5; i++) {
      outcomeService.recordOutcome({
        organizationId: 'org-1',
        opportunityId: `opp-${i}`,
        status: i % 2 === 0 ? 'AWARDED' : 'REJECTED',
        evaluationScore: 85 + i,
        evaluationFeedback: '우수',
      });
    }

    const readiness = evaluator.evaluate('org-1');

    expect(readiness.labeledOutcomeCount).toBe(5);
    expect(readiness.awardedCount).toBe(2);
    expect(readiness.rejectedCount).toBe(3);
    expect(readiness.winProbabilityModelDecision).toBe('NO_GO');
    expect(readiness.decisionReason).toContain('100건');
    expect(readiness.dataAccumulationPlan).toHaveLength(4);
  });

  it('8대 지표(클래스 밸런스, 결측률, 프로바이더 커버리지, 피드백 등)를 정확한 수치로 산출해야 한다', () => {
    outcomeService.recordOutcome({
      organizationId: 'org-2',
      opportunityId: 'opp-1',
      status: 'AWARDED',
      evaluationScore: 90,
      evaluationFeedback: '피드백 완비',
    });
    outcomeService.recordOutcome({
      organizationId: 'org-2',
      opportunityId: 'opp-2',
      status: 'REJECTED',
      evaluationScore: null, // 결측
      evaluationFeedback: '', // 결측
    });

    const readiness = evaluator.evaluate('org-2');

    expect(readiness.labeledOutcomeCount).toBe(2);
    expect(readiness.classBalanceRatio).toBe(1.0); // 1:1
    expect(readiness.missingDataRate).toBe(50); // 2/4
    expect(readiness.providerCoverageRate).toBe(100);
    expect(readiness.feedbackCount).toBe(1);
    expect(readiness.postAwardDemandCount).toBe(1);
  });
});
