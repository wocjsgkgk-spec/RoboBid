import { describe, it, expect } from 'vitest';
import { ProposalDraftingEngine } from '@/lib/proposals/drafting-engine';
import { ProposalService } from '@/lib/proposals/proposal-service';
import { CapabilityRecord, Opportunity, RequirementCandidate } from '@/types';
import { STANDARD_PROPOSAL_TOC } from '@/types/proposal';

describe('Phase 7: Proposal Drafting Engine & Evidence Binding', () => {
  const draftingEngine = new ProposalDraftingEngine();
  const proposalService = new ProposalService(draftingEngine);

  const mockOpp: Opportunity = {
    id: 'opp-robot-001',
    organizationId: 'org-001',
    providerId: 'KONEPS',
    sourceId: 'src-123',
    title: '지능형 물류 배송 자율주행 로봇 실증 사업',
    announcingAgency: '한국로봇산업진흥원',
    bidType: 'R_AND_D',
    primaryDomain: 'ROBOT',
    allocatedBudget: 500000000,
    status: 'GO',
    postedAt: '2026-09-01T00:00:00Z',
    submissionDeadline: '2026-10-15T18:00:00Z',
    contentHash: 'hash-robot',
    currentVersion: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };

  const mockCapabilities: CapabilityRecord[] = [
    {
      id: 'cap-patent-1',
      organizationId: 'org-001',
      type: 'PATENT',
      title: '다중 센서 융합 기반 자율 이동 로봇의 장애물 회피 시스템 및 방법',
      description: 'LiDAR 및 Depth 카메라 데이터를 결합하여 30ms 이내 실시간 장애물 회피 궤적을 생성하는 특허 기술',
      metadata: { patentNumber: '10-2024-0012345' },
      verificationStatus: 'VERIFIED',
      confidentiality: 'INTERNAL',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'cap-tech-1',
      organizationId: 'org-001',
      type: 'TECHNOLOGY',
      title: '임베디드 Edge AI 구동 ROS2 기반 로봇 플랫폼',
      description: 'TRL 6단계 달성, 실내외 500시간 주행 테스트 완료',
      metadata: { trlLevel: 6 },
      verificationStatus: 'VERIFIED',
      confidentiality: 'INTERNAL',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const mockRequirements: RequirementCandidate[] = [
    {
      reqCode: 'REQ-TECH-01',
      category: 'TECHNICAL',
      title: '장애물 감지 및 실시간 회피 주행 기능',
      description: '반경 20m 이내 보행자 및 이동 장애물을 실시간 감지하여 감속 또는 우회 주행할 것',
      citationQuote: '제3조 제2항: 자율주행 로봇은 20m 이내 보행자를 감지하여야 함',
      citationSection: '제3장 기술요구사항',
      isMandatory: true,
      citationPage: 5,
    },
  ];

  it('표준 제안서 목차(TOC) 9개 섹션을 정상 초기화해야 한다', () => {
    const proposal = proposalService.createProposalFromOpportunity(mockOpp);
    expect(proposal.sections).toBeDefined();
    expect(proposal.sections?.length).toBe(STANDARD_PROPOSAL_TOC.length);
    expect(proposal.sections?.[0].sectionCode).toBe('1.1_NEEDS_BACKGROUND');
    expect(proposal.sections?.[0].status).toBe('EMPTY');
  });

  it('RAG 기반 초안 생성 시 RFP 요구사항 및 사내 역량 Citation을 바인딩해야 한다', () => {
    const sectionResult = draftingEngine.generateSectionDraft({
      opportunity: mockOpp,
      tocItem: STANDARD_PROPOSAL_TOC[0], // 1.1 필요성
      capabilities: mockCapabilities,
      requirements: mockRequirements,
      keywords: ['로봇', '자율주행', '회피'],
    });

    expect(sectionResult.contentMarkdown).toContain('한국로봇산업진흥원');
    expect(sectionResult.contentMarkdown).toContain(mockOpp.title);
    expect(sectionResult.evidenceCitations.length).toBeGreaterThan(0);

    const hasRfpCitation = sectionResult.evidenceCitations.some(
      (c) => c.sourceType === 'RFP_REQUIREMENT'
    );
    expect(hasRfpCitation).toBe(true);
  });

  it('확정되지 않은 추정치는 [가정: ...] 태그를 명확히 포함해야 한다', () => {
    const sectionResult = draftingEngine.generateSectionDraft({
      opportunity: mockOpp,
      tocItem: STANDARD_PROPOSAL_TOC[0], // 1.1 필요성
      capabilities: mockCapabilities,
      requirements: mockRequirements,
    });

    expect(sectionResult.hasAssumptions).toBe(true);
    expect(sectionResult.contentMarkdown).toContain('[가정:');
  });

  it('미확인 항목 또는 사내 등록 미비 항목은 [TODO: ...] 태그를 명확히 포함해야 한다', () => {
    const sectionResult = draftingEngine.generateSectionDraft({
      opportunity: mockOpp,
      tocItem: STANDARD_PROPOSAL_TOC[1], // 1.2 최종 목표
      capabilities: mockCapabilities,
      requirements: mockRequirements,
    });

    expect(sectionResult.hasTodos).toBe(true);
    expect(sectionResult.contentMarkdown).toContain('[TODO:');
  });
});
