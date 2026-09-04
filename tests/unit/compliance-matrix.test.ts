import { describe, it, expect } from 'vitest';
import { ComplianceChecker } from '@/lib/compliance/compliance-checker';
import { RequirementCandidate } from '@/types';
import { ProposalSection } from '@/types/proposal';

describe('Phase 8: Requirement Traceability Matrix (RTM) Engine', () => {
  const checker = new ComplianceChecker();

  const mockRequirements: RequirementCandidate[] = [
    {
      reqCode: 'REQ-TECH-01',
      category: 'TECHNICAL',
      title: '실시간 다중 장애물 회피 알고리즘',
      description: '반경 20m 이내 보행자 및 이동 장애물을 실시간 감지하여 감속 또는 우회 주행할 것',
      citationQuote: '자율주행 로봇은 20m 이내 보행자를 감지하여야 함',
      citationSection: '제3장 기술요구사항',
      isMandatory: true,
      citationPage: 5,
    },
    {
      reqCode: 'REQ-QUAL-01',
      category: 'EVALUATION',
      title: '공인인증기관 시험성적서 제출',
      description: '한국로봇산업진흥원 등 공인시험기관의 성능 시험성적서를 최종 평가 시 제출할 것',
      citationQuote: '공인인증기관 시험성적서 필수 제출',
      citationSection: '제5장 평가방법',
      isMandatory: true,
      citationPage: 12,
    },
    {
      reqCode: 'REQ-OPT-01',
      category: 'OTHER',
      title: '원격 관제 앱 지원',
      description: '모바일 스마트폰 전용 실시간 모니터링 앱 제공 시 가점 부여',
      citationQuote: '모바일 앱 제공 시 가점 2점',
      citationSection: '제6장 가점사항',
      isMandatory: false,
      citationPage: 15,
    },
  ];

  it('제안서 섹션에 Citation으로 직접 바인딩된 요구사항은 SATISFIED로 판정해야 한다', () => {
    const mockSections: ProposalSection[] = [
      {
        id: 'sec-1',
        proposalId: 'prop-1',
        sectionCode: '2.1_TECH_ARCHITECTURE',
        title: '2.1 기술 아키텍처',
        orderIndex: 0,
        contentMarkdown: '장애물 회피 시스템 상세 기술',
        evidenceCitations: [
          {
            id: 'cite-1',
            sourceType: 'RFP_REQUIREMENT',
            sourceId: 'REQ-TECH-01',
            sourceTitle: '[RFP요구:REQ-TECH-01] 실시간 다중 장애물 회피',
            quoteSnippet: '자율주행 로봇 20m 감지',
            relevanceReason: '요구조건 부합',
          },
        ],
        status: 'AI_GENERATED',
        version: 1,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ];

    const matrix = checker.buildRequirementMatrix('prop-1', mockRequirements, mockSections);

    const techItem = matrix.find((m) => m.requirementCode === 'REQ-TECH-01');
    expect(techItem).toBeDefined();
    expect(techItem?.complianceStatus).toBe('SATISFIED');
    expect(techItem?.mappedSectionCode).toBe('2.1_TECH_ARCHITECTURE');
  });

  it('제안서 본문 및 증빙에 전혀 언급되지 않은 요구조건은 MISSING으로 판정해야 한다', () => {
    const emptySections: ProposalSection[] = [];
    const matrix = checker.buildRequirementMatrix('prop-1', mockRequirements, emptySections);

    const qualItem = matrix.find((m) => m.requirementCode === 'REQ-QUAL-01');
    expect(qualItem?.complianceStatus).toBe('MISSING');
    expect(qualItem?.mappedSectionCode).toBeNull();
  });
});
