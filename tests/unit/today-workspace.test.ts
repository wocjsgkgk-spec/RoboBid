import { describe, it, expect } from 'vitest';
import { TodayService } from '@/lib/today/today-service';
import { Opportunity } from '@/types';
import { OpportunityScore } from '@/types/scoring';
import { ProviderHealth } from '@/lib/providers/types';

describe('Phase 6: Today Workspace Priority Aggregation (Zero Fake Data)', () => {
  const service = new TodayService();
  const refDate = new Date('2026-09-04T10:00:00Z');

  it('D-3 이내 마감 공모를 긴급 조치 업무로 올바르게 추출해야 한다', () => {
    const opportunities: Opportunity[] = [
      {
        id: 'opp-urgent',
        sourceId: 'src-1',
        organizationId: 'org-1',
        providerId: 'KONEPS',
        title: '긴급 마감 스마트 제조 로봇 공모',
        announcingAgency: '중소벤처기업부',
        bidType: 'R_AND_D',
        primaryDomain: 'ROBOT',
        status: 'REVIEW',
        postedAt: '2026-09-01T00:00:00Z',
        submissionDeadline: '2026-09-06T18:00:00Z', // 2 days away
        contentHash: 'hash-urgent',
        currentVersion: 1,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'opp-future',
        sourceId: 'src-2',
        organizationId: 'org-1',
        providerId: 'KONEPS',
        title: '충분한 여유가 있는 국방 로봇 공모',
        announcingAgency: '방위사업청',
        bidType: 'NATIONAL_PROJECT',
        primaryDomain: 'ROBOT',
        status: 'REVIEW',
        postedAt: '2026-09-01T00:00:00Z',
        submissionDeadline: '2026-10-15T18:00:00Z', // > 30 days away
        contentHash: 'hash-future',
        currentVersion: 1,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ];

    const summary = service.aggregateTodaySummary({
      opportunities,
      scores: new Map(),
      decisions: [],
      providerHealths: [],
      referenceDate: refDate,
    });

    expect(summary.urgentDeadlineCount).toBe(1);
    expect(summary.urgentDeadlines[0].opportunity.id).toBe('opp-urgent');
    expect(summary.urgentDeadlines[0].daysRemaining).toBeLessThanOrEqual(3);

    const deadlineAction = summary.actionItems.find((a) => a.type === 'DEADLINE_URGENT');
    expect(deadlineAction).toBeDefined();
    expect(deadlineAction?.priority).toBe('HIGH');
  });

  it('적합도 70점 이상 공모를 신규 AI 추천 리스트에 포함해야 한다', () => {
    const opportunities: Opportunity[] = [
      {
        id: 'opp-high',
        sourceId: 'src-1',
        organizationId: 'org-1',
        providerId: 'K_STARTUP',
        title: '고적합 무인 로봇 방역 과제',
        announcingAgency: '창업진흥원',
        bidType: 'R_AND_D',
        primaryDomain: 'ROBOT',
        status: 'DISCOVERED',
        postedAt: '2026-09-04T00:00:00Z',
        submissionDeadline: '2026-09-20T18:00:00Z',
        contentHash: 'hash-high',
        currentVersion: 1,
        createdAt: '2026-09-04T00:00:00Z',
        updatedAt: '2026-09-04T00:00:00Z',
      },
      {
        id: 'opp-low',
        sourceId: 'src-2',
        organizationId: 'org-1',
        providerId: 'K_STARTUP',
        title: '적합도 낮은 단순 용역',
        announcingAgency: '기타공공기관',
        bidType: 'SERVICE',
        primaryDomain: 'ROBOT',
        status: 'DISCOVERED',
        postedAt: '2026-09-04T00:00:00Z',
        submissionDeadline: '2026-09-20T18:00:00Z',
        contentHash: 'hash-low',
        currentVersion: 1,
        createdAt: '2026-09-04T00:00:00Z',
        updatedAt: '2026-09-04T00:00:00Z',
      },
    ];

    const scores = new Map<string, OpportunityScore>();
    scores.set('opp-high', {
      opportunityId: 'opp-high',
      totalScore: 84,
      technicalFit: 25,
      strategicFit: 20,
      capabilityFit: 18,
      evidenceReadiness: 12,
      financialFit: 5,
      scheduleReadiness: 4,
      riskPenalty: 0,
      breakdown: [],
      recommendation: 'GO',
      rationale: '기술 및 실적 완벽 부합',
      strengths: ['TRL 7 이상'],
      weaknesses: [],
      calculatedAt: '2026-09-04T00:00:00Z',
    });
    scores.set('opp-low', {
      opportunityId: 'opp-low',
      totalScore: 40,
      technicalFit: 10,
      strategicFit: 10,
      capabilityFit: 10,
      evidenceReadiness: 5,
      financialFit: 5,
      scheduleReadiness: 0,
      riskPenalty: 0,
      breakdown: [],
      recommendation: 'NO_GO',
      rationale: '역량 불일치',
      strengths: [],
      weaknesses: ['실적 없음'],
      calculatedAt: '2026-09-04T00:00:00Z',
    });

    const summary = service.aggregateTodaySummary({
      opportunities,
      scores,
      decisions: [],
      providerHealths: [],
      referenceDate: refDate,
    });

    expect(summary.newRecommendationCount).toBe(1);
    expect(summary.recommendedOpportunities[0].opportunity.id).toBe('opp-high');
    expect(summary.recommendedOpportunities[0].score.totalScore).toBe(84);
  });

  it('Provider 장애(DEGRADED/OFFLINE) 발생 시 긴급 조치 아이템으로 집계해야 한다', () => {
    const providerHealths: ProviderHealth[] = [
      {
        providerId: 'KONEPS',
        providerName: '조달청 나라장터',
        status: 'CONNECTED',
        latencyMs: 120,
        lastCheckedAt: '2026-09-04T10:00:00Z',
      },
      {
        providerId: 'IRIS',
        providerName: '범부처 통합연구지원시스템',
        status: 'FAILED',
        latencyMs: 5000,
        lastCheckedAt: '2026-09-04T10:00:00Z',
        error: 'Connection timeout',
      },
    ];

    const summary = service.aggregateTodaySummary({
      opportunities: [],
      scores: new Map(),
      decisions: [],
      providerHealths,
      referenceDate: refDate,
    });

    expect(summary.providerAlertCount).toBe(1);
    expect(summary.providerAlerts[0].providerId).toBe('IRIS');

    const providerAction = summary.actionItems.find((a) => a.type === 'PROVIDER_DEGRADED');
    expect(providerAction).toBeDefined();
    expect(providerAction?.priority).toBe('CRITICAL');
  });

  it('데이터가 비어있는 경우 가짜 통계를 만들지 않고 0건으로 정확히 반환해야 한다 (Zero Fake Data)', () => {
    const summary = service.aggregateTodaySummary({
      opportunities: [],
      scores: new Map(),
      decisions: [],
      providerHealths: [],
      referenceDate: refDate,
    });

    expect(summary.urgentActionCount).toBe(0);
    expect(summary.newRecommendationCount).toBe(0);
    expect(summary.pendingDecisionCount).toBe(0);
    expect(summary.urgentDeadlineCount).toBe(0);
    expect(summary.actionItems).toEqual([]);
    expect(summary.recommendedOpportunities).toEqual([]);
  });
});
