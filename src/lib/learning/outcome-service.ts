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
        evaluationFeedback: '물류창고 100시간 무중단 실증 계획 및 수요기업(풀필먼트사) 구매확약서가 구체적이며, TRL 6 시작품 완성도와 KOLAS 시험성적서 신뢰도가 높아 최고점으로 최종 선정됨.',
        awardAmount: 600000000,
        competitorCount: 4,
        internalPostmortem: '서면평가(92점) 통과 후 발표평가(97점)에서 실물 주행 시연 영상 및 수요처 매칭 확약서 제시가 결정적 가점 요인으로 작용함.',
        successReasons: ['수요기업 구매확약서', 'TRL 6 실증 신뢰도', 'KOLAS 공인시험 방안', '이노비즈 가점(2점)'],
        failureReasons: [],
        capabilityGaps: [],
        preparationDays: 14,
        submittedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        decidedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        opportunityTitle: '2026년도 유망 서비스로봇 실증 및 사업화 지원사업',
        agencyName: '한국로봇산업진흥원 (KIRIA)',
        category: 'ROBOT',
        opportunityBudget: 600000000,
        opportunityScore: 92,
        decision: 'GO',
      },
      {
        id: 'out-seed-002',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        opportunityId: 'a0000000-0000-0000-0000-000000000002',
        status: 'AWARDED',
        evaluationScore: 91.2,
        evaluationFeedback: '자율제조 AMR 안전제어 원천특허 및 소프트웨어 알고리즘 독창성 우수. 참여연구원 인건비 및 장비 도입비 비목 산정 타당.',
        awardAmount: 400000000,
        competitorCount: 3,
        internalPostmortem: 'R&D 개발 목표치의 정량적 지표(가반하중 500kg, 위치정밀도 ±10mm) 명확화 및 연구인력 우수성 증빙이 주효함.',
        successReasons: ['원천특허 보유', '연구인력 우수성', '비목 산정 타당성', '수출 실적 가점'],
        failureReasons: [],
        capabilityGaps: [],
        preparationDays: 10,
        submittedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        decidedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        opportunityTitle: '2026년도 중소기업 기술혁신개발사업 (수출지향형)',
        agencyName: '중소기업기술정보진흥원 (TIPA)',
        category: 'ROBOT',
        opportunityBudget: 400000000,
        opportunityScore: 89,
        decision: 'GO',
      },
      {
        id: 'out-seed-003',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        opportunityId: 'a0000000-0000-0000-0000-000000000003',
        status: 'REJECTED',
        evaluationScore: 78.5,
        evaluationFeedback: '대규모 컨소시엄(수요 대기업 1개사 필수 참여) 확약서 미비 및 10억원 이상 단일 공급 레퍼런스 부족으로 사업화 실현 가능성 항목 감점.',
        awardAmount: 0,
        competitorCount: 6,
        internalPostmortem: '서면평가는 통과하였으나 발표평가에서 컨소시엄 수요기업 참여 확약 미비로 감점. 향후 산자부 대형과제는 사전 컨소시엄 구성 필수.',
        successReasons: [],
        failureReasons: ['컨소시엄 수요기업 확약 미흡', '사업화 실적 부족', '위탁연구개발비 산정 근거 미비'],
        capabilityGaps: ['수요 대기업 협약 레퍼런스', '10억원 이상 납품 실적'],
        preparationDays: 8,
        submittedAt: new Date(Date.now() - 80 * 86400000).toISOString(),
        decidedAt: new Date(Date.now() - 50 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 80 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 50 * 86400000).toISOString(),
        opportunityTitle: '2026년 AI 융합 자율제조 선도과제',
        agencyName: '한국산업기술기획평가원 (KEIT)',
        category: 'AI',
        opportunityBudget: 800000000,
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
