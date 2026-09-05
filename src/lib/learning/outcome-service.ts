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
    // Initial state is completely clean (0 outcomes)
  }

  public clearAll(): void {
    this.memoryOutcomes.clear();
    this.memoryAuditLogs.clear();
  }

  public seedDefault(): void {
    const seedRecords: OutcomeRecord[] = [
      {
        id: 'out-seed-001',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        opportunityId: 'a0000000-0000-0000-0000-000000000001',
        status: 'AWARDED',
        evaluationScore: 94.5,
        evaluationFeedback: 'TRL 7 기반의 실증 데이터가 우수하며, 국가계약법 A값 공제 산식을 정확히 준수한 투찰가가 최우수 평가됨.',
        awardAmount: 835000000,
        competitorCount: 4,
        internalPostmortem: 'A값 분리 투찰로 하한선 탈락 방지 및 기술점수 1위 달성',
        successReasons: ['TRL 실증 신뢰도', '사정율 정밀 투찰', '특허 증빙 매핑'],
        failureReasons: [],
        capabilityGaps: [],
        preparationDays: 14,
        submittedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        decidedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        opportunityTitle: '항만 물류 무인 자율주행 AGV 로봇 4대 구매 및 통합 관제 시스템 구축',
        agencyName: '부산항만공사 / 조달청',
        category: 'ROBOT',
        opportunityBudget: 850000000,
        opportunityScore: 92,
        decision: 'GO',
      },
      {
        id: 'out-seed-002',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        opportunityId: 'a0000000-0000-0000-0000-000000000002',
        status: 'AWARDED',
        evaluationScore: 91.2,
        evaluationFeedback: '이노비즈 가점 및 협동로봇 충돌회피 알고리즘 특허 연계로 정량/정성 평가 우수.',
        awardAmount: 410000000,
        competitorCount: 3,
        internalPostmortem: 'R&D 타당성 및 사내 인력 석박사 역량 증빙이 주효함',
        successReasons: ['이노비즈 가점', '원천특허 보유', '연구인력 우수성'],
        failureReasons: [],
        capabilityGaps: [],
        preparationDays: 10,
        submittedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        decidedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        opportunityTitle: '2026년도 제조공정 고도화를 위한 AI 협동로봇 안전제어 및 충돌회피 솔루션 개발',
        agencyName: '중소기업기술정보진흥원 (TIPA)',
        category: 'ROBOT',
        opportunityBudget: 420000000,
        opportunityScore: 89,
        decision: 'GO',
      },
      {
        id: 'out-seed-003',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        opportunityId: 'a0000000-0000-0000-0000-000000000003',
        status: 'REJECTED',
        evaluationScore: 78.0,
        evaluationFeedback: '유사 규모 단일 10억원 이상 납품 실적 배점에서 감점 발생.',
        awardAmount: 0,
        competitorCount: 6,
        internalPostmortem: '단독 입찰 한계 노출. 향후 대형 사업은 공동수급체(컨소시엄 70:30) 구성 필수',
        successReasons: [],
        failureReasons: ['유사 실적 규모 부족', '단독 입찰 감점'],
        capabilityGaps: ['10억원 이상 단일 납품 레퍼런스'],
        preparationDays: 8,
        submittedAt: new Date(Date.now() - 80 * 86400000).toISOString(),
        decidedAt: new Date(Date.now() - 50 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 80 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 50 * 86400000).toISOString(),
        opportunityTitle: '스마트 물류창고 대규모 군집 로봇 제어 시스템 구축',
        agencyName: '정보통신산업진흥원 (NIPA)',
        category: 'AI',
        opportunityBudget: 280000000,
        opportunityScore: 75,
        decision: 'GO',
      },
    ];

    for (const rec of seedRecords) {
      this.memoryOutcomes.set(rec.id, rec);
    }
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
      const matchesOrg =
        item.organizationId === organizationId ||
        ((organizationId === 'org-robobid-default' || !organizationId) &&
          item.organizationId === 'b0000000-0000-0000-0000-000000000001');
      if (!matchesOrg) continue;
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
