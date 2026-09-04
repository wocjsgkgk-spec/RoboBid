import { describe, it, expect, beforeEach } from 'vitest';
import { ProposalService } from '@/lib/proposals/proposal-service';
import { Opportunity } from '@/types';

describe('Phase 7: Proposal Versioning & Audit Snapshots', () => {
  let service: ProposalService;

  const mockOpp: Opportunity = {
    id: 'opp-ver-001',
    organizationId: 'org-ver',
    providerId: 'KONEPS',
    sourceId: 'src-ver',
    title: '군용 다족보행 로봇 연구과제',
    announcingAgency: '국방과학연구소',
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
    service = new ProposalService();
    service.clearMemory();
  });

  it('제안서 생성 후 섹션을 수정하고 버전 스냅샷을 생성할 수 있어야 한다', () => {
    // 1. 제안서 생성
    const proposal = service.createProposalFromOpportunity(mockOpp);
    expect(proposal.currentVersion).toBe(1);

    // 2. 1.1 섹션 수정
    const updatedSec = service.updateSection(
      proposal.id,
      '1.1_NEEDS_BACKGROUND',
      '국방 다족보행 로봇의 야지 기동성 확보 필요성 상세 기술',
      'EDITED'
    );
    expect(updatedSec.status).toBe('EDITED');
    expect(updatedSec.version).toBe(2);

    // 3. 버전 스냅샷 생성
    const snapshot = service.createVersionSnapshot(
      proposal.id,
      'v1.0 1차 기술초안 완성',
      'user-pm-01'
    );

    expect(snapshot.versionNumber).toBe(1);
    expect(snapshot.changeSummary).toBe('v1.0 1차 기술초안 완성');
    expect(snapshot.snapshotData.sections.length).toBe(proposal.sections?.length);

    const savedNeedsSec = snapshot.snapshotData.sections.find(
      (s) => s.sectionCode === '1.1_NEEDS_BACKGROUND'
    );
    expect(savedNeedsSec?.contentMarkdown).toContain('국방 다족보행 로봇');

    // 4. 제안서의 다음 버전은 2로 증가해야 함
    const refreshedProposal = service.getProposal(proposal.id);
    expect(refreshedProposal?.currentVersion).toBe(2);

    // 5. 버전 이력 조회
    const versions = service.getVersions(proposal.id);
    expect(versions.length).toBe(1);
    expect(versions[0].versionNumber).toBe(1);
  });
});
