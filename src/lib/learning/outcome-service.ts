import {
  OutcomeRecord,
  OutcomeStatus,
  OutcomeAuditLog,
  OutcomeAnalyticsSummary,
  BiasDiagnosisReport,
} from '@/types/outcome';
import { outcomeAnalytics, OutcomeAnalytics } from './outcome-analytics';

export interface CreateOutcomeInput {
  organizationId: string;
  opportunityId: string;
  proposalId?: string | null;
  status: OutcomeStatus;
  evaluationScore?: number | null;
  evaluationFeedback?: string | null;
  awardAmount?: number | null;
  competitorCount?: number | null;
  internalPostmortem?: string | null;
  successReasons?: string[];
  failureReasons?: string[];
  capabilityGaps?: string[];
  preparationDays?: number | null;
  submittedAt?: string | null;
  decidedAt?: string | null;

  // 메타데이터 연동
  opportunityTitle?: string;
  agencyName?: string;
  category?: string;
  opportunityBudget?: number;
  opportunityScore?: number;
  decision?: 'GO' | 'HOLD' | 'NO_GO';
}

export class OutcomeService {
  private analyticsEngine: OutcomeAnalytics;

  // 인메모리 저장소 (테스트 및 서버 런타임 캐시)
  private memoryOutcomes: Map<string, OutcomeRecord> = new Map();
  private memoryAuditLogs: Map<string, OutcomeAuditLog[]> = new Map();

  constructor(analytics?: OutcomeAnalytics) {
    this.analyticsEngine = analytics || outcomeAnalytics;
  }

  /**
   * 신규 지원 결과(Outcome) 기록 및 최초 Audit Log 생성
   */
  public recordOutcome(input: CreateOutcomeInput, userId?: string): OutcomeRecord {
    if (!input.organizationId || !input.opportunityId) {
      throw new Error('organizationId and opportunityId are required');
    }

    // 동일 공모 중복 등록 방지
    for (const existing of this.memoryOutcomes.values()) {
      if (
        existing.organizationId === input.organizationId &&
        existing.opportunityId === input.opportunityId
      ) {
        throw new Error(`Outcome already exists for opportunity: ${input.opportunityId}. Use updateOutcome instead.`);
      }
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const record: OutcomeRecord = {
      id,
      organizationId: input.organizationId,
      opportunityId: input.opportunityId,
      proposalId: input.proposalId || null,
      status: input.status,
      evaluationScore: input.evaluationScore ?? null,
      evaluationFeedback: input.evaluationFeedback ?? null,
      awardAmount: input.awardAmount ?? null,
      competitorCount: input.competitorCount ?? null,
      internalPostmortem: input.internalPostmortem ?? null,
      successReasons: input.successReasons || [],
      failureReasons: input.failureReasons || [],
      capabilityGaps: input.capabilityGaps || [],
      preparationDays: input.preparationDays ?? null,
      submittedAt: input.submittedAt || null,
      decidedAt: input.decidedAt || null,
      recordedBy: userId || 'user-analyst',
      createdAt: now,
      updatedAt: now,

      // 메타데이터
      opportunityTitle: input.opportunityTitle,
      agencyName: input.agencyName,
      category: input.category,
      opportunityBudget: input.opportunityBudget,
      opportunityScore: input.opportunityScore,
      decision: input.decision,
    };

    this.memoryOutcomes.set(id, record);

    // Audit Trail 기록
    const auditLog: OutcomeAuditLog = {
      id: crypto.randomUUID(),
      outcomeId: id,
      action: 'CREATE',
      changedBy: userId || 'user-analyst',
      previousData: null,
      newData: { ...record },
      reason: '최초 지원 결과 등록',
      createdAt: now,
    };

    this.memoryAuditLogs.set(id, [auditLog]);

    return record;
  }

  /**
   * 지원 결과(Outcome) 수정 및 변경 내역 감사 로그(Audit Log) 보존
   */
  public updateOutcome(
    id: string,
    updates: Partial<OutcomeRecord>,
    userId?: string,
    reason?: string
  ): OutcomeRecord {
    const existing = this.memoryOutcomes.get(id);
    if (!existing) {
      throw new Error(`Outcome not found: ${id}`);
    }

    const now = new Date().toISOString();
    const previousSnapshot = { ...existing };

    const updated: OutcomeRecord = {
      ...existing,
      ...updates,
      id: existing.id, // 불변
      organizationId: existing.organizationId, // 불변
      opportunityId: existing.opportunityId, // 불변
      updatedAt: now,
    };

    this.memoryOutcomes.set(id, updated);

    // Audit Log 기록
    const logs = this.memoryAuditLogs.get(id) || [];
    const auditLog: OutcomeAuditLog = {
      id: crypto.randomUUID(),
      outcomeId: id,
      action: 'UPDATE',
      changedBy: userId || 'user-analyst',
      previousData: previousSnapshot,
      newData: { ...updates },
      reason: reason || '지원 결과 정보 갱신',
      createdAt: now,
    };
    logs.unshift(auditLog);
    this.memoryAuditLogs.set(id, logs);

    return updated;
  }

  /**
   * Outcome 단건 조회
   */
  public getOutcome(id: string): OutcomeRecord | null {
    return this.memoryOutcomes.get(id) || null;
  }

  /**
   * 공모 ID로 Outcome 조회
   */
  public getOutcomeByOpportunity(opportunityId: string): OutcomeRecord | null {
    for (const item of this.memoryOutcomes.values()) {
      if (item.opportunityId === opportunityId) {
        return item;
      }
    }
    return null;
  }

  /**
   * 조직별 Outcome 목록 조회
   */
  public listOutcomes(
    organizationId: string,
    filters?: {
      status?: OutcomeStatus;
      category?: string;
      agencyName?: string;
    }
  ): OutcomeRecord[] {
    const results: OutcomeRecord[] = [];
    for (const item of this.memoryOutcomes.values()) {
      if (item.organizationId !== organizationId) continue;
      if (filters?.status && item.status !== filters.status) continue;
      if (filters?.category && item.category !== filters.category) continue;
      if (filters?.agencyName && item.agencyName !== filters.agencyName) continue;
      results.push(item);
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Outcome 감사 로그 이력 조회
   */
  public getAuditLogs(outcomeId: string): OutcomeAuditLog[] {
    return this.memoryAuditLogs.get(outcomeId) || [];
  }

  /**
   * 다차원 분석 및 편향 진단 보고서 생성
   */
  public getAnalytics(organizationId: string): {
    summary: OutcomeAnalyticsSummary;
    biasDiagnosis: BiasDiagnosisReport;
  } {
    const outcomes = this.listOutcomes(organizationId);
    const summary = this.analyticsEngine.calculateSummary(outcomes);
    const biasDiagnosis = this.analyticsEngine.diagnoseBias(outcomes);

    return {
      summary,
      biasDiagnosis,
    };
  }

  /**
   * 메모리 초기화 (테스트용)
   */
  public clearMemory(): void {
    this.memoryOutcomes.clear();
    this.memoryAuditLogs.clear();
  }
}

export const outcomeService = new OutcomeService();
