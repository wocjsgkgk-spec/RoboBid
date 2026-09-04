import { Opportunity } from './index';
import { OpportunityScore } from './scoring';
import { DecisionRecord } from './decision';
import { ProviderHealth } from '@/lib/providers/types';

export interface TodayActionItem {
  id: string;
  type: 'DECISION_REQUIRED' | 'DEADLINE_URGENT' | 'DOCUMENTS_MISSING' | 'PROVIDER_DEGRADED';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  title: string;
  description: string;
  linkUrl: string;
  dueAt?: string;
  daysRemaining?: number;
  opportunityId?: string;
}

export interface TodayBidOpsSummary {
  // 1. 반드시 처리할 업무 수치
  urgentActionCount: number;
  newRecommendationCount: number;
  pendingDecisionCount: number;
  urgentDeadlineCount: number;
  missingDocCount: number;
  providerAlertCount: number;

  // 2. 항목별 실데이터 리스트 (Zero Fake Data)
  actionItems: TodayActionItem[];
  recommendedOpportunities: Array<{
    opportunity: Opportunity;
    score: OpportunityScore;
  }>;
  pendingDecisions: Array<{
    opportunity: Opportunity;
    score?: OpportunityScore;
  }>;
  urgentDeadlines: Array<{
    opportunity: Opportunity;
    daysRemaining: number;
  }>;
  missingDocuments: Array<{
    opportunity: Opportunity;
    missingCount: number;
  }>;
  providerAlerts: ProviderHealth[];
  recentDecisions: Array<{
    decision: DecisionRecord;
    opportunityTitle: string;
  }>;
}
