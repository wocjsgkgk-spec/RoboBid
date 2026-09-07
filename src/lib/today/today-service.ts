import { Opportunity } from '@/types';
import { OpportunityScore } from '@/types/scoring';
import { DecisionRecord } from '@/types/decision';
import { ProviderHealth } from '@/lib/providers/types';
import { TodayActionItem, TodayBidOpsSummary } from '@/types/today';
import { EarlySignal } from '@/types/early-signal';
import { PortfolioGapAnalysis } from '@/types/portfolio-advisor';

export interface TodayDataInput {
  opportunities: Opportunity[];
  scores: Map<string, OpportunityScore>;
  decisions: DecisionRecord[];
  providerHealths: ProviderHealth[];
  earlySignals?: EarlySignal[];
  portfolioGap?: PortfolioGapAnalysis;
  awardedMilestones?: Array<{
    projectId: string;
    projectName: string;
    milestoneTitle: string;
    dueDate: string;
    daysRemaining: number;
  }>;
  vaultAlerts?: Array<{
    capabilityId: string;
    title: string;
    alertType: 'EXPIRED' | 'EXPIRING_SOON';
    daysUntilExpiry: number;
  }>;
  referenceDate?: Date;
}

export class TodayService {
  /**
   * 실데이터 기반 Today BidOps 현황 집계 (Zero Fake Data)
   */
  public aggregateTodaySummary(input: TodayDataInput): TodayBidOpsSummary {
    const today = input.referenceDate || new Date();
    const actionItems: TodayActionItem[] = [];

    // 1. D-3 마감 임박 공모 필터링
    const urgentDeadlines: Array<{ opportunity: Opportunity; daysRemaining: number }> = [];
    for (const opp of input.opportunities) {
      if (
        opp.submissionDeadline &&
        opp.status !== 'REJECTED' &&
        opp.status !== 'WITHDRAWN' &&
        opp.status !== 'AWARDED'
      ) {
        const deadlineDate = new Date(opp.submissionDeadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining >= 0 && daysRemaining <= 3) {
          urgentDeadlines.push({ opportunity: opp, daysRemaining });

          actionItems.push({
            id: `action-deadline-${opp.id}`,
            type: 'DEADLINE_URGENT',
            priority: daysRemaining <= 1 ? 'CRITICAL' : 'HIGH',
            title: `[D-${daysRemaining}] ${opp.title}`,
            description: `마감일: ${opp.submissionDeadline} (제안서 최종 제출 필요)`,
            linkUrl: `/opportunities?id=${opp.id}`,
            dueAt: opp.submissionDeadline,
            daysRemaining,
            opportunityId: opp.id,
          });
        }
      }
    }

    // 2. 신규 AI/Score 추천 공모 (적합도 점수 70점 이상)
    const recommendedOpportunities: Array<{ opportunity: Opportunity; score: OpportunityScore }> = [];
    for (const opp of input.opportunities) {
      const score = input.scores.get(opp.id);
      if (score && score.totalScore >= 70 && opp.status !== 'REJECTED' && opp.status !== 'WITHDRAWN') {
        recommendedOpportunities.push({ opportunity: opp, score });
      }
    }

    // 3. GO/HOLD/NO-GO 의사결정 대기 (결정 미완료 공모)
    const decidedOpportunityIds = new Set(input.decisions.map((d) => d.opportunityId));
    const pendingDecisions: Array<{ opportunity: Opportunity; score?: OpportunityScore }> = [];

    for (const opp of input.opportunities) {
      if (
        !decidedOpportunityIds.has(opp.id) &&
        (opp.status === 'DISCOVERED' || opp.status === 'TRIAGED' || opp.status === 'REVIEW')
      ) {
        const score = input.scores.get(opp.id);
        pendingDecisions.push({ opportunity: opp, score });

        const rec = score ? ((score as any).recommendedDecision || score.recommendation) : '';
        actionItems.push({
          id: `action-decision-${opp.id}`,
          type: 'DECISION_REQUIRED',
          priority: score && score.totalScore >= 70 ? 'HIGH' : 'NORMAL',
          title: `[GO/NO-GO 심의 대기] ${opp.title}`,
          description: score
            ? `산출 적합도: ${score.totalScore}점 (추천: ${rec})`
            : '스코어 산출 후 사업 참여 여부 확정 필요',
          linkUrl: `/opportunities?id=${opp.id}`,
          opportunityId: opp.id,
        });
      }
    }

    // 4. 서류 누락 또는 검토 필요 공모 (attachments 중 parsing_status가 REVIEW_REQUIRED 또는 FAILED)
    const missingDocuments: Array<{ opportunity: Opportunity; missingCount: number }> = [];
    for (const opp of input.opportunities) {
      const problematicDocs = (opp.attachments || []).filter(
        (doc: any) => doc.parsingStatus === 'REVIEW_REQUIRED' || doc.parsingStatus === 'FAILED'
      );
      if (problematicDocs.length > 0) {
        missingDocuments.push({
          opportunity: opp,
          missingCount: problematicDocs.length,
        });

        actionItems.push({
          id: `action-docs-${opp.id}`,
          type: 'DOCUMENTS_MISSING',
          priority: 'NORMAL',
          title: `[공고문 보완 필요] ${opp.title}`,
          description: `${problematicDocs.length}개 첨부파일(HWP/비표준 문서) 수동 검토 요망`,
          linkUrl: `/opportunities?id=${opp.id}`,
          opportunityId: opp.id,
        });
      }
    }

    // 5. Provider 장애 경고 (DEGRADED 또는 FAILED)
    const providerAlerts = input.providerHealths.filter(
      (h) => h.status === 'DEGRADED' || h.status === 'FAILED'
    );
    for (const ph of providerAlerts) {
      actionItems.push({
        id: `action-provider-${ph.providerName}`,
        type: 'PROVIDER_DEGRADED',
        priority: ph.status === 'FAILED' ? 'CRITICAL' : 'HIGH',
        title: `[공공 Provider 연동 장애] ${ph.providerName}`,
        description: `현재 상태: ${ph.status} (${ph.error || '응답 지연 또는 파싱 오류 감지'})`,
        linkUrl: '/settings',
      });
    }

    // 6. 최근 의사결정 내역 (Recent Decisions)
    const oppMap = new Map(input.opportunities.map((o) => [o.id, o.title]));
    const recentDecisions = input.decisions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((d) => ({
        decision: d,
        opportunityTitle: oppMap.get(d.opportunityId) || '미확인 공모',
      }));

    // 7. Early Signal 사전 대응 액션 아이템
    if (input.earlySignals && input.earlySignals.length > 0) {
      for (const sig of input.earlySignals.slice(0, 3)) {
        actionItems.push({
          id: `action-signal-${sig.id}`,
          type: 'RFP_CONDITION_CHECK',
          priority: sig.announcementForecast.confidence === 'HIGH' ? 'HIGH' : 'NORMAL',
          title: `[Early Signal 사전예고] ${sig.title}`,
          description: `예측 공고기: ${sig.announcementForecast.expectedPeriod} (${sig.agency}) — 사전 요구사항 점검 필요`,
          linkUrl: '/intelligence',
          category: 'COMPLIANCE',
        });
      }
    }

    // 8. Awarded 과제 마일스톤 D-Day 액션 아이템
    if (input.awardedMilestones && input.awardedMilestones.length > 0) {
      for (const ms of input.awardedMilestones) {
        if (ms.daysRemaining <= 14) {
          actionItems.push({
            id: `action-milestone-${ms.projectId}-${ms.milestoneTitle}`,
            type: 'DEADLINE_URGENT',
            priority: ms.daysRemaining <= 5 ? 'CRITICAL' : 'HIGH',
            title: `[과제 마일스톤 D-${ms.daysRemaining}] ${ms.milestoneTitle}`,
            description: `프로젝트: ${ms.projectName} (기한: ${ms.dueDate})`,
            linkUrl: '/awards',
            category: 'SUBMISSION',
            dueAt: ms.dueDate,
            daysRemaining: ms.daysRemaining,
          });
        }
      }
    }

    // 9. 역량/증빙 자산 만료 알림 액션 아이템
    if (input.vaultAlerts && input.vaultAlerts.length > 0) {
      for (const va of input.vaultAlerts) {
        actionItems.push({
          id: `action-vault-${va.capabilityId}`,
          type: 'CERT_EXPIRING',
          priority: va.alertType === 'EXPIRED' ? 'CRITICAL' : 'HIGH',
          title: `[역량/증빙 만료 주의] ${va.title}`,
          description: va.alertType === 'EXPIRED' ? '유효기간이 만료되었습니다. 즉시 갱신 필요' : `${va.daysUntilExpiry}일 후 만료 예정`,
          linkUrl: '/vault',
          category: 'CERTIFICATION',
        });
      }
    }

    // 액션 아이템 우선순위 정렬: CRITICAL -> HIGH -> NORMAL
    const priorityWeight: Record<string, number> = { CRITICAL: 3, HIGH: 2, NORMAL: 1 };
    actionItems.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    return {
      urgentActionCount: actionItems.length,
      newRecommendationCount: recommendedOpportunities.length,
      pendingDecisionCount: pendingDecisions.length,
      urgentDeadlineCount: urgentDeadlines.length,
      missingDocCount: missingDocuments.length,
      providerAlertCount: providerAlerts.length,
      earlySignalCount: input.earlySignals?.length || 0,
      portfolioGapAmount: input.portfolioGap?.gapAmount || 0,
      actionItems,
      recommendedOpportunities,
      pendingDecisions,
      urgentDeadlines,
      missingDocuments,
      providerAlerts,
      recentDecisions,
      earlySignals: input.earlySignals,
      portfolioGap: input.portfolioGap,
      awardedMilestones: input.awardedMilestones,
      vaultAlerts: input.vaultAlerts,
    };
  }
}

export const todayService = new TodayService();
