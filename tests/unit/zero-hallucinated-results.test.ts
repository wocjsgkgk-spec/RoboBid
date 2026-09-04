import { describe, it, expect } from 'vitest';
import { ProposalDraftingEngine } from '@/lib/proposals/drafting-engine';
import { CapabilityRecord, Opportunity } from '@/types';
import { STANDARD_PROPOSAL_TOC } from '@/types/proposal';

describe('Phase 7: Zero Hallucinated Company Results & Evidence Enforcement', () => {
  const draftingEngine = new ProposalDraftingEngine();

  const mockOpp: Opportunity = {
    id: 'opp-1',
    organizationId: 'org-1',
    providerId: 'KONEPS',
    sourceId: 'src-1',
    title: '특수목적 방역 로봇 실증 사업',
    announcingAgency: '질병관리청',
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

  it('등록된 사내 실적(EXPERIENCE)이 없을 때 가짜 실적을 날조하지 않고 TODO 태그를 남겨야 한다', () => {
    // 사내 역량이 전혀 없는 상태
    const emptyCapabilities: CapabilityRecord[] = [];

    const tocExperience = STANDARD_PROPOSAL_TOC.find(
      (t) => t.sectionCode === '5.2_PAST_EXPERIENCE'
    )!;

    const result = draftingEngine.generateSectionDraft({
      opportunity: mockOpp,
      tocItem: tocExperience,
      capabilities: emptyCapabilities,
      requirements: [],
    });

    // 가짜 실적 문자열이 없어야 함
    expect(result.contentMarkdown).not.toContain('삼성전자 납품 실적');
    expect(result.contentMarkdown).not.toContain('현대자동차 100억원 수주');
    // 대신 명확한 안내 TODO가 포함되어야 함
    expect(result.contentMarkdown).toContain('[TODO: Capability Vault에 유사 과제/사업 수주 및 납품 실적 데이터를 등록하여 주십시오');
    expect(result.hasTodos).toBe(true);
  });

  it('만료된(EXPIRED) 인증서나 특허는 증빙 인용에서 자동 배제되어야 한다', () => {
    const capabilitiesWithExpired: CapabilityRecord[] = [
      {
        id: 'cap-expired-cert',
        organizationId: 'org-1',
        type: 'CERTIFICATION',
        title: '만료된 ISO-9001 인증서',
        description: '유효기간이 2025년에 종료된 구형 인증서',
        metadata: { certNumber: 'EXP-123' },
        verificationStatus: 'EXPIRED', // 만료 상태
        validUntil: '2025-01-01',
        confidentiality: 'INTERNAL',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'cap-valid-cert',
        organizationId: 'org-1',
        type: 'CERTIFICATION',
        title: '유효한 KC 로봇 안전 인증서',
        description: '2028년까지 유효한 안전인증 증빙',
        metadata: { certNumber: 'KC-2026-999' },
        verificationStatus: 'VERIFIED',
        validUntil: '2028-12-31',
        confidentiality: 'INTERNAL',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    const tocCert = STANDARD_PROPOSAL_TOC.find(
      (t) => t.sectionCode === '2.2_CORE_TECHNOLOGIES'
    )!;

    const result = draftingEngine.generateSectionDraft({
      opportunity: mockOpp,
      tocItem: tocCert,
      capabilities: capabilitiesWithExpired,
      requirements: [],
      keywords: ['인증', '로봇', '안전'],
    });

    // 만료된 인증서는 인용 목록에 없어야 함
    const hasExpired = result.evidenceCitations.some((c) => c.sourceId === 'cap-expired-cert');
    expect(hasExpired).toBe(false);

    // 유효한 인증서는 정상 인용되어야 함
    const hasValid = result.evidenceCitations.some((c) => c.sourceId === 'cap-valid-cert');
    expect(hasValid).toBe(true);
  });
});
