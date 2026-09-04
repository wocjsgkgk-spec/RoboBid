import { Opportunity } from './index';
import { OpportunityScore } from './scoring';
import { DecisionRecord } from './decision';
import { ProviderHealth } from '@/lib/providers/types';

export type ActionItemType =
  | 'GO_DECISION_REQUIRED'
  | 'RFP_CONDITION_CHECK'
  | 'ASSIGNEE_REQUIRED'
  | 'EVIDENCE_MISSING'
  | 'PROPOSAL_REVIEW_PENDING'
  | 'COMPLIANCE_UNMET'
  | 'SUBMISSION_DOC_MISSING'
  | 'DEADLINE_URGENT'
  | 'CERT_EXPIRING'
  | 'REVIEWER_FEEDBACK'
  | 'DECISION_REQUIRED'
  | 'DOCUMENTS_MISSING'
  | 'PROVIDER_DEGRADED';

export interface TodayActionItem {
  id: string;
  type: ActionItemType;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  title: string;
  description: string;
  linkUrl: string;
  ctaLabel?: string;
  dueAt?: string;
  daysRemaining?: number;
  opportunityId?: string;
  opportunityTitle?: string;
  category?: 'DECISION' | 'COMPLIANCE' | 'PROPOSAL' | 'SUBMISSION' | 'CERTIFICATION' | 'SYSTEM';
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
