import { RequirementCandidate } from '@/types';
import { ProposalSection } from '@/types/proposal';
import {
  ComplianceAuditSummary,
  ComplianceStatus,
  RequirementMatrixItem,
  SubmissionChecklist,
  SubmissionConfirmationPayload,
} from '@/types/compliance';
import { ComplianceChecker } from './compliance-checker';
import { ProposalService, proposalService } from '@/lib/proposals/proposal-service';

export class SubmissionService {
  private checker: ComplianceChecker;
  private proposalService: ProposalService;

  // 메모리 저장소 (테스트 및 캐시)
  private memoryMatrix: Map<string, RequirementMatrixItem[]> = new Map();
  private memoryChecklists: Map<string, SubmissionChecklist> = new Map();

  constructor(checker?: ComplianceChecker, propService?: ProposalService) {
    this.checker = checker || new ComplianceChecker();
    this.proposalService = propService || proposalService;
  }

  /**
   * RTM 조회 또는 최초 생성
   */
  public getOrInitMatrix(
    proposalId: string,
    requirements: RequirementCandidate[] = [],
    sections: ProposalSection[] = []
  ): RequirementMatrixItem[] {
    const existing = this.memoryMatrix.get(proposalId);
    if (existing && existing.length > 0) {
      return existing;
    }

    const newMatrix = this.checker.buildRequirementMatrix(proposalId, requirements, sections);
    this.memoryMatrix.set(proposalId, newMatrix);
    return newMatrix;
  }

  /**
   * 사용자의 수동 RTM 검토 상태 갱신
   */
  public updateMatrixStatus(
    proposalId: string,
    matrixId: string,
    status: ComplianceStatus,
    notes?: string,
    reviewedBy?: string
  ): RequirementMatrixItem {
    const list = this.memoryMatrix.get(proposalId) || [];
    const item = list.find((m) => m.id === matrixId);

    if (!item) {
      throw new Error(`Matrix item not found: ${matrixId}`);
    }

    item.complianceStatus = status;
    if (notes !== undefined) item.evidenceNotes = notes;
    item.reviewedBy = reviewedBy || 'reviewer-user';
    item.reviewedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    return item;
  }

  /**
   * 제안서의 컴플라이언스 감사 집계 반환
   */
  public getAuditSummary(proposalId: string): ComplianceAuditSummary {
    const matrix = this.memoryMatrix.get(proposalId) || [];
    return this.checker.auditCompliance(matrix);
  }

  /**
   * 제출 체크리스트 조회 또는 기본값 생성
   */
  public getOrInitChecklist(proposalId: string): SubmissionChecklist {
    const existing = this.memoryChecklists.get(proposalId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const defaultChecklist: SubmissionChecklist = {
      id: crypto.randomUUID(),
      proposalId,
      allMandatorySatisfied: false,
      documentsReady: false,
      sealAndSignatureVerified: false,
      formatAndSizeVerified: false,
      submissionUrlVerified: false,
      submitterAssigned: false,
      finalFileName: null,
      finalFileHash: null,
      submissionUrl: null,
      submitterName: null,
      confirmedBy: null,
      submittedAt: null,
      submissionNotes: null,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryChecklists.set(proposalId, defaultChecklist);
    return defaultChecklist;
  }

  /**
   * 제출 체크리스트 항목 갱신
   */
  public updateChecklist(
    proposalId: string,
    updates: Partial<SubmissionChecklist>
  ): SubmissionChecklist {
    const current = this.getOrInitChecklist(proposalId);
    const updated: SubmissionChecklist = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.memoryChecklists.set(proposalId, updated);
    return updated;
  }

  /**
   * 사용자 최종 제출 확정 (Human Confirmation Only - Zero Auto-Submit)
   */
  public confirmSubmission(payload: SubmissionConfirmationPayload): {
    success: boolean;
    error?: string;
    submittedAt?: string;
  } {
    const { proposalId, submitterName, finalFileName, finalFileHash } = payload;
    const checklist = this.getOrInitChecklist(proposalId);
    const auditSummary = this.getAuditSummary(proposalId);

    // 1. 체크리스트 완비성 검증
    const validation = this.checker.validateSubmissionReadiness(
      {
        ...checklist,
        submitterAssigned: true,
        submitterName,
        finalFileName,
        finalFileHash,
      },
      auditSummary
    );

    if (!validation.ready) {
      return {
        success: false,
        error: `제출 전 검증 실패:\n- ${validation.missingItems.join('\n- ')}`,
      };
    }

    // 2. 인간 최종 제출 완료 처리
    const now = new Date().toISOString();
    checklist.allMandatorySatisfied = true;
    checklist.submitterAssigned = true;
    checklist.submitterName = submitterName;
    checklist.finalFileName = finalFileName;
    checklist.finalFileHash = finalFileHash;
    checklist.submissionUrl = payload.submissionUrl || checklist.submissionUrl;
    checklist.confirmedBy = payload.confirmedByUserId || 'user-admin';
    checklist.submittedAt = now;
    checklist.submissionNotes = payload.submissionNotes || '담당자에 의해 공식 접수 완료 확인됨';
    checklist.updatedAt = now;

    // 제안서 상태를 'SUBMITTED'로 전이
    this.proposalService.updateProposalStatus(proposalId, 'SUBMITTED');

    return {
      success: true,
      submittedAt: now,
    };
  }

  /**
   * 메모리 초기화 (테스트용)
   */
  public clearMemory(): void {
    this.memoryMatrix.clear();
    this.memoryChecklists.clear();
  }
}

export const submissionService = new SubmissionService();
