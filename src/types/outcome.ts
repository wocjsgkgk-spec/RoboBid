export type OutcomeStatus = 'SUBMITTED' | 'AWARDED' | 'REJECTED' | 'WITHDRAWN';

export interface OutcomeRecord {
  id: string;
  organizationId: string;
  opportunityId: string;
  proposalId?: string | null;
  status: OutcomeStatus;
  evaluationScore?: number | null; // e.g. 89.50
  evaluationFeedback?: string | null;
  awardAmount?: number | null; // 최종 수주액 (KRW)
  competitorCount?: number | null; // 경쟁사 수
  internalPostmortem?: string | null; // 사내 사후 회고
  successReasons: string[]; // 성공 요인 태그
  failureReasons: string[]; // 실패 요인 태그
  capabilityGaps: string[]; // 역량 격차 요인 태그
  preparationDays?: number | null; // 제안 준비 소요 일수
  submittedAt?: string | null;
  decidedAt?: string | null;
  recordedBy?: string | null;
  createdAt: string;
  updatedAt: string;

  // 조인/연계 메타데이터 (옵션)
  opportunityTitle?: string;
  agencyName?: string;
  category?: string;
  opportunityBudget?: number;
  opportunityScore?: number;
  decision?: 'GO' | 'HOLD' | 'NO_GO';
}

export interface OutcomeAuditLog {
  id: string;
  outcomeId: string;
  action: 'CREATE' | 'UPDATE';
  changedBy?: string | null;
  previousData?: Partial<OutcomeRecord> | null;
  newData: Partial<OutcomeRecord>;
  reason?: string | null;
  createdAt: string;
}

export interface DimensionMetric {
  key: string;
  total: number;
  awarded: number;
  rejected: number;
  withdrawn: number;
  winRate: number; // 0 ~ 100
  avgScore?: number;
  totalAwardAmount?: number;
}

export interface OutcomeAnalyticsSummary {
  totalCount: number;
  submittedCount: number;
  awardedCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  winRate: number; // (awarded / (awarded + rejected)) * 100
  avgEvaluationScore: number;
  totalAwardAmount: number;
  avgCompetitorCount: number;
  avgPreparationDays: number;

  // 다차원 집계
  byAgency: DimensionMetric[];
  byCategory: DimensionMetric[];
  byBudgetRange: DimensionMetric[];
  byScoreBracket: DimensionMetric[];
  byDecision: DimensionMetric[];

  // 원인 분석
  commonSuccessReasons: { reason: string; count: number }[];
  commonFailureReasons: { reason: string; count: number }[];
  topCapabilityGaps: { gap: string; count: number }[];
}

export interface BiasDiagnosisReport {
  sampleSize: number;
  isLowSample: boolean; // sampleSize < 10
  missingScoreRate: number; // 0 ~ 100%
  missingFeedbackRate: number; // 0 ~ 100%
  agencyConcentrationRisk: boolean; // 특정 단일 기관 비중 > 50%
  dominantAgency?: string;
  warnings: string[];
}
