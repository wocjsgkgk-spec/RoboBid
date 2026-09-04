import { describe, it, expect, beforeEach } from 'vitest';
import { SubmissionService } from '@/lib/compliance/submission-service';
import { proposalService } from '@/lib/proposals/proposal-service';
import { Opportunity } from '@/types';

describe('Phase 8: Zero Auto-Submission & Human Confirmation Policy', () => {
  let submissionService: SubmissionService;

  const mockOpp: Opportunity = {
    id: 'opp-safe-001',
    organizationId: 'org-safe',
    providerId: 'KONEPS',
    sourceId: 'src-safe',
    title: '원자력 로봇 점검 시스템 사업',
    announcingAgency: '한국원자력연구원',
    bidType: 'R_AND_D',
    primaryDomain: 'ROBOT',
    status: 'GO',
    postedAt: '2026-09-01T00:00:00Z',
    submissionDeadline: '2026-10-15T18:00:00Z',
    contentHash: 'hash',
    currentVersion: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };

  beforeEach(() => {
    proposalService.clearMemory();
    submissionService = new SubmissionService(undefined, proposalService);
    submissionService.clearMemory();
  });

  it('시스템은 외부 조달망에 자동으로 공모를 제출하는 메서드를 제공하지 않아야 한다 (API 불변식)', () => {
    // submissionService 객체에 autoSubmit 등의 메서드가 존재하지 않는지 검증
    expect((submissionService as any).autoSubmit).toBeUndefined();
    expect((submissionService as any).submitDirectlyToG2B).toBeUndefined();
    expect((submissionService as any).executeRemoteSubmission).toBeUndefined();
  });

  it('체크리스트 미비 상태에서는 인간의 확정 시도도 차단되어야 한다', () => {
    const proposal = proposalService.createProposalFromOpportunity(mockOpp);

    // 체크리스트가 모두 false인 상태에서 확정 시도
    const result = submissionService.confirmSubmission({
      proposalId: proposal.id,
      submitterName: '홍길동 PM',
      finalFileName: 'final.pdf',
      finalFileHash: 'hash123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('제출 전 검증 실패');

    // 제안서 상태는 여전히 DRAFTING 유지
    const refreshed = proposalService.getProposal(proposal.id);
    expect(refreshed?.status).toBe('DRAFTING');
  });

  it('체크리스트가 모두 완비된 상태에서 인간 담당자가 최종 확정하면 제안서 상태가 SUBMITTED로 전이되어야 한다', () => {
    const proposal = proposalService.createProposalFromOpportunity(mockOpp);

    // 1. 체크리스트 완비
    submissionService.updateChecklist(proposal.id, {
      allMandatorySatisfied: true,
      documentsReady: true,
      sealAndSignatureVerified: true,
      formatAndSizeVerified: true,
      submissionUrlVerified: true,
      submitterAssigned: true,
      submitterName: '홍길동 책임연구원',
    });

    // 2. 인간 담당자가 최종 접수 확정
    const result = submissionService.confirmSubmission({
      proposalId: proposal.id,
      submitterName: '홍길동 책임연구원',
      submissionUrl: 'https://www.g2b.go.kr',
      finalFileName: '원자력로봇_최종본.pdf',
      finalFileHash: 'sha256-verified-hash-abcdef123456',
      submissionNotes: '나라장터 전자입찰 정상 완료 확인',
    });

    expect(result.success).toBe(true);
    expect(result.submittedAt).toBeDefined();

    // 3. 제안서 상태가 SUBMITTED로 안전하게 전이됨
    const refreshed = proposalService.getProposal(proposal.id);
    expect(refreshed?.status).toBe('SUBMITTED');
  });
});
