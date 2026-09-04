import { describe, it, expect } from 'vitest';
import { CrossReviewEngine } from '@/lib/proposals/cross-review-engine';
import { Proposal, ProposalSection } from '@/types/proposal';
import { RequirementMatrixItem } from '@/types/compliance';

describe('Phase 11: 4 Specialist Cross-Review Agents', () => {
  const engine = new CrossReviewEngine();

  const mockProposal: Proposal = {
    id: 'prop-cross-1',
    organizationId: 'org-1',
    opportunityId: 'opp-1',
    title: '특수목적 원전 해체 로봇 시스템 개발 제안서',
    status: 'DRAFTING',
    currentVersion: 1,
    metadata: {},
    createdAt: '',
    updatedAt: '',
  };

  const mockSections: ProposalSection[] = [
    {
      id: 's-1',
      proposalId: 'prop-cross-1',
      sectionCode: '1.1_NEEDS_BACKGROUND',
      title: '개발 필요성 및 배경',
      orderIndex: 1,
      contentMarkdown: '국내 원전 해체 및 극한 환경 로봇 작업의 필요성과 시장성 분석 내용이 상세히 기술되어 있으며...'.repeat(5),
      evidenceCitations: [],
      status: 'AI_GENERATED',
      version: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 's-2',
      proposalId: 'prop-cross-1',
      sectionCode: '2.1_TECH_ARCHITECTURE',
      title: '기술 아키텍처',
      orderIndex: 2,
      contentMarkdown: '본 로봇 시스템의 아키텍처는 고신뢰성 제어기와 다자유도 매니퓰레이터로 구성되며...',
      evidenceCitations: [
        {
          id: 'cit-1',
          sourceType: 'CAPABILITY',
          sourceTitle: '원격 매니퓰레이터 제어 특허',
          sourceId: 'cap-1',
          quoteSnippet: '원격 제어 알고리즘 특허',
          relevanceReason: '핵심 기술 증빙',
        },
      ],
      status: 'AI_GENERATED',
      version: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 's-3',
      proposalId: 'prop-cross-1',
      sectionCode: '4.1_BUDGET_BOM',
      title: '사업비 소요 내역',
      orderIndex: 3,
      contentMarkdown: '정부 R&D 출연금 75% 및 민간 부담금 25% 비율에 따라 BOM 부품 원가를 산출함...',
      evidenceCitations: [],
      status: 'AI_GENERATED',
      version: 1,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const mockMatrix: RequirementMatrixItem[] = [
    {
      id: 'm-1',
      proposalId: 'prop-cross-1',
      requirementCode: 'REQ-01',
      category: 'FUNC',
      originalText: '내방사선 차폐 성능',
      isMandatory: true,
      complianceStatus: 'SATISFIED',
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('4대 전문가(전략, 재무, 기술, 컴플라이언스) 에이전트가 종합 교차 검토를 수행해야 한다', () => {
    const result = engine.review(mockProposal, mockSections, mockMatrix);

    expect(result.proposalId).toBe('prop-cross-1');
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.findings).toHaveLength(4);

    const roles = result.findings.map((f) => f.role);
    expect(roles).toContain('STRATEGY');
    expect(roles).toContain('FINANCIAL');
    expect(roles).toContain('TECHNICAL');
    expect(roles).toContain('COMPLIANCE');
  });

  it('필수 요구조건이 누락(MISSING)된 경우 컴플라이언스 에이전트가 경고(WARN/CRITICAL) 및 권고사항을 도출해야 한다', () => {
    const missingMatrix: RequirementMatrixItem[] = [
      {
        id: 'm-2',
        proposalId: 'prop-cross-1',
        requirementCode: 'REQ-MANDATORY-X',
        category: 'PERF',
        originalText: '방폭 인증 획득 필수',
        isMandatory: true,
        complianceStatus: 'MISSING', // 누락
        createdAt: '',
        updatedAt: '',
      },
    ];

    const result = engine.review(mockProposal, mockSections, missingMatrix);
    const compFinding = result.findings.find((f) => f.role === 'COMPLIANCE');

    expect(compFinding).toBeDefined();
    expect(compFinding?.score).toBeLessThan(80);
    expect(compFinding?.recommendations.some((r) => r.includes('REQ-MANDATORY-X'))).toBe(true);
  });
});
