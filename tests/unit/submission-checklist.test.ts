import { describe, it, expect } from 'vitest';
import { ComplianceChecker } from '@/lib/compliance/compliance-checker';
import { ComplianceAuditSummary, SubmissionChecklist } from '@/types/compliance';

describe('Phase 8: Pre-flight Submission Checklist Validation', () => {
  const checker = new ComplianceChecker();

  const mockAuditPassed: ComplianceAuditSummary = {
    totalCount: 5,
    satisfiedCount: 5,
    partialCount: 0,
    missingCount: 0,
    notApplicableCount: 0,
    reviewRequiredCount: 0,
    mandatoryMissingCount: 0,
    complianceRatePercent: 100,
    canSubmit: true,
    blockingWarnings: [],
  };

  it('체크리스트 항목이 누락된 경우 미비 항목 목록을 반환하고 ready: false여야 한다', () => {
    const incompleteChecklist: SubmissionChecklist = {
      id: 'chk-1',
      proposalId: 'prop-1',
      allMandatorySatisfied: true,
      documentsReady: true,
      sealAndSignatureVerified: false, // 미확인
      formatAndSizeVerified: true,
      submissionUrlVerified: true,
      submitterAssigned: false, // 미지정
      submitterName: null,
      finalFileHash: null, // 해시 미등록
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    const validation = checker.validateSubmissionReadiness(incompleteChecklist, mockAuditPassed);

    expect(validation.ready).toBe(false);
    expect(validation.missingItems.length).toBeGreaterThanOrEqual(3);
    expect(validation.missingItems.some((i) => i.includes('법인 인감 날인'))).toBe(true);
    expect(validation.missingItems.some((i) => i.includes('담당자(Submitter)'))).toBe(true);
    expect(validation.missingItems.some((i) => i.includes('무결성 해시'))).toBe(true);
  });

  it('7대 체크리스트가 모두 완비된 경우 ready: true여야 한다', () => {
    const completedChecklist: SubmissionChecklist = {
      id: 'chk-1',
      proposalId: 'prop-1',
      allMandatorySatisfied: true,
      documentsReady: true,
      sealAndSignatureVerified: true,
      formatAndSizeVerified: true,
      submissionUrlVerified: true,
      submitterAssigned: true,
      submitterName: '김철수 책임연구원',
      finalFileName: '제안서_최종제출본.pdf',
      finalFileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    const validation = checker.validateSubmissionReadiness(completedChecklist, mockAuditPassed);

    expect(validation.ready).toBe(true);
    expect(validation.missingItems.length).toBe(0);
  });
});
