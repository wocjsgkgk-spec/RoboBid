import { RequirementCandidate } from '@/types';
import { ProposalSection } from '@/types/proposal';
import {
  ComplianceAuditSummary,
  ComplianceStatus,
  RequirementMatrixItem,
  SubmissionChecklist,
} from '@/types/compliance';

export class ComplianceChecker {
  /**
   * RFP 요구사항과 제안서 섹션을 교차 분석하여 RTM (Requirement Traceability Matrix) 생성
   */
  public buildRequirementMatrix(
    proposalId: string,
    requirements: RequirementCandidate[],
    sections: ProposalSection[]
  ): RequirementMatrixItem[] {
    const matrix: RequirementMatrixItem[] = [];
    const now = new Date().toISOString();

    for (const req of requirements) {
      let matchedSectionCode: string | null = null;
      let matchedSnippet: string | null = null;
      let evidenceNotes: string | null = null;
      let status: ComplianceStatus = 'MISSING';

      // 1. 제안서 섹션의 증빙 Citation 직접 바인딩 검사
      for (const sec of sections) {
        const directCitation = sec.evidenceCitations.find(
          (c) => c.sourceId === req.reqCode || c.sourceTitle.includes(req.reqCode)
        );

        if (directCitation) {
          matchedSectionCode = sec.sectionCode;
          matchedSnippet = directCitation.quoteSnippet;
          evidenceNotes = `섹션 ${sec.title}에서 증빙 Citation으로 1:1 직접 바인딩됨`;
          status = 'SATISFIED';
          break;
        }
      }

      // 2. Citation이 없는 경우, 제안서 본문 텍스트 내 키워드 매칭 분석
      if (status === 'MISSING') {
        const keywords = [req.title, ...(req.description ? req.description.split(' ').slice(0, 3) : [])]
          .filter((k) => k && k.length > 1);

        for (const sec of sections) {
          if (!sec.contentMarkdown) continue;

          let matchCount = 0;
          for (const kw of keywords) {
            if (sec.contentMarkdown.includes(kw)) {
              matchCount++;
            }
          }

          if (matchCount >= 2) {
            matchedSectionCode = sec.sectionCode;
            matchedSnippet = sec.contentMarkdown.slice(0, 100);
            evidenceNotes = `본문 키워드(${matchCount}개) 부분 일치 감지`;
            status = 'PARTIAL';
            break;
          } else if (matchCount === 1) {
            matchedSectionCode = sec.sectionCode;
            matchedSnippet = sec.contentMarkdown.slice(0, 100);
            evidenceNotes = `단일 키워드 언급됨 (검토 필요)`;
            status = 'REVIEW_REQUIRED';
            break;
          }
        }
      }

      matrix.push({
        id: `rtm-${req.reqCode}`,
        proposalId,
        requirementCode: req.reqCode,
        category: req.category,
        originalText: `${req.title}: ${req.description}`,
        isMandatory: req.isMandatory,
        sourceLocation: req.citationSection || `P.${req.citationPage || 1}`,
        mappedSectionCode: matchedSectionCode,
        complianceStatus: status,
        matchedTextSnippet: matchedSnippet,
        evidenceNotes: evidenceNotes,
        reviewedBy: null,
        reviewedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    return matrix;
  }

  /**
   * RTM 항목들을 집계하여 컴플라이언스 준수율 및 필수 누락 차단 평가
   */
  public auditCompliance(matrixItems: RequirementMatrixItem[]): ComplianceAuditSummary {
    const totalCount = matrixItems.length;
    let satisfiedCount = 0;
    let partialCount = 0;
    let missingCount = 0;
    let notApplicableCount = 0;
    let reviewRequiredCount = 0;
    let mandatoryMissingCount = 0;
    const blockingWarnings: string[] = [];

    for (const item of matrixItems) {
      switch (item.complianceStatus) {
        case 'SATISFIED':
          satisfiedCount++;
          break;
        case 'PARTIAL':
          partialCount++;
          if (item.isMandatory) {
            blockingWarnings.push(
              `[필수요건 미완성] ${item.requirementCode} (${item.originalText.slice(0, 30)}...) 요건이 부분 충족 상태입니다. 보완이 필요합니다.`
            );
          }
          break;
        case 'MISSING':
          missingCount++;
          if (item.isMandatory) {
            mandatoryMissingCount++;
            blockingWarnings.push(
              `🚨 [제출 차단: 필수요건 누락] ${item.requirementCode}: "${item.originalText.slice(0, 40)}..." 요건이 제안서 본문에 전혀 반영되지 않았습니다.`
            );
          }
          break;
        case 'NOT_APPLICABLE':
          notApplicableCount++;
          break;
        case 'REVIEW_REQUIRED':
          reviewRequiredCount++;
          if (item.isMandatory) {
            blockingWarnings.push(
              `[필수요건 검토 요망] ${item.requirementCode}에 대한 담당자의 최종 충족 여부 확인이 필요합니다.`
            );
          }
          break;
      }
    }

    const complianceRatePercent =
      totalCount > 0 ? Math.round(((satisfiedCount + notApplicableCount) / totalCount) * 100) : 100;

    // 필수 요건 누락이 1건이라도 있으면 절대 제출 불가 (Strict Gate)
    const canSubmit = mandatoryMissingCount === 0 && blockingWarnings.length === 0;

    return {
      totalCount,
      satisfiedCount,
      partialCount,
      missingCount,
      notApplicableCount,
      reviewRequiredCount,
      mandatoryMissingCount,
      complianceRatePercent,
      canSubmit,
      blockingWarnings,
    };
  }

  /**
   * 제출 전 7대 체크리스트 완비 여부 검증
   */
  public validateSubmissionReadiness(
    checklist: SubmissionChecklist,
    auditSummary: ComplianceAuditSummary
  ): { ready: boolean; missingItems: string[] } {
    const missingItems: string[] = [];

    if (!auditSummary.canSubmit || auditSummary.mandatoryMissingCount > 0) {
      missingItems.push('RFP 필수 요구조건 중 미반영(MISSING) 항목이 존재합니다.');
    }

    if (!checklist.documentsReady) {
      missingItems.push('필수 제출 서류(사업자등록증, 재무제표, 4대보험 등) 구비 확인이 누락되었습니다.');
    }

    if (!checklist.sealAndSignatureVerified) {
      missingItems.push('법인 인감 날인 및 대표자 서명 확인이 완료되지 않았습니다.');
    }

    if (!checklist.formatAndSizeVerified) {
      missingItems.push('제출 파일 포맷(PDF/HWP) 및 용량 규격(100MB 이하) 검증이 누락되었습니다.');
    }

    if (!checklist.submissionUrlVerified) {
      missingItems.push('공식 공모 접수 URL 및 접수 시스템 확인이 필요합니다.');
    }

    if (!checklist.submitterAssigned || !checklist.submitterName) {
      missingItems.push('공모 최종 제출 담당자(Submitter)가 지정되지 않았습니다.');
    }

    if (!checklist.finalFileHash) {
      missingItems.push('제출용 최종 산출물 파일의 무결성 해시(SHA-256)가 등록되지 않았습니다.');
    }

    return {
      ready: missingItems.length === 0,
      missingItems,
    };
  }
}

export const complianceChecker = new ComplianceChecker();
