import { describe, it, expect } from 'vitest';
import { OutcomeAnalytics } from '@/lib/learning/outcome-analytics';
import { OutcomeRecord } from '@/types/outcome';

describe('Phase 9: Data Bias & Missingness Diagnosis', () => {
  const analytics = new OutcomeAnalytics();

  it('표본이 10건 미만인 경우 소표본 경고(isLowSample: true)를 발생시켜야 한다', () => {
    const fewOutcomes: OutcomeRecord[] = [
      {
        id: '1',
        organizationId: 'org-1',
        opportunityId: 'opp-1',
        status: 'AWARDED',
        agencyName: '중소벤처기업부',
        evaluationScore: 88,
        evaluationFeedback: '우수',
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
        agencyName: '중소벤처기업부',
        evaluationScore: 92,
        evaluationFeedback: '탁월',
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const diagnosis = analytics.diagnoseBias(fewOutcomes);

    expect(diagnosis.sampleSize).toBe(2);
    expect(diagnosis.isLowSample).toBe(true);
    expect(diagnosis.warnings.some((w) => w.includes('통계적 신뢰 기준'))).toBe(true);
  });

  it('단일 발주기관의 비율이 50% 이상 집중된 경우 기관 편향 위험(agencyConcentrationRisk: true)을 감지해야 한다', () => {
    const biasedOutcomes: OutcomeRecord[] = [
      {
        id: '1',
        organizationId: 'org-1',
        opportunityId: 'opp-1',
        status: 'AWARDED',
        agencyName: '한국로봇산업진흥원',
        evaluationScore: 85,
        evaluationFeedback: '피드백',
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
        status: 'REJECTED',
        agencyName: '한국로봇산업진흥원',
        evaluationScore: 70,
        evaluationFeedback: '피드백',
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
        status: 'AWARDED',
        agencyName: '한국에너지기술평가원',
        evaluationScore: 90,
        evaluationFeedback: '피드백',
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
        status: 'AWARDED',
        agencyName: '한국로봇산업진흥원', // 3 / 4 = 75%
        evaluationScore: 91,
        evaluationFeedback: '피드백',
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const diagnosis = analytics.diagnoseBias(biasedOutcomes);

    expect(diagnosis.agencyConcentrationRisk).toBe(true);
    expect(diagnosis.dominantAgency).toBe('한국로봇산업진흥원');
    expect(diagnosis.warnings.some((w) => w.includes('특정 발주기관'))).toBe(true);
  });

  it('평가 점수 및 피드백 결측률이 높을 경우 경고를 표시해야 한다', () => {
    const missingOutcomes: OutcomeRecord[] = [
      {
        id: '1',
        organizationId: 'org-1',
        opportunityId: 'opp-1',
        status: 'SUBMITTED',
        evaluationScore: null,
        evaluationFeedback: '',
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
        status: 'REJECTED',
        evaluationScore: null,
        evaluationFeedback: '   ',
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
        status: 'AWARDED',
        evaluationScore: 88,
        evaluationFeedback: '기술 점수 우수',
        successReasons: [],
        failureReasons: [],
        capabilityGaps: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const diagnosis = analytics.diagnoseBias(missingOutcomes);

    expect(diagnosis.missingScoreRate).toBe(66.7);
    expect(diagnosis.missingFeedbackRate).toBe(66.7);
    expect(diagnosis.warnings.some((w) => w.includes('결측률'))).toBe(true);
  });
});
