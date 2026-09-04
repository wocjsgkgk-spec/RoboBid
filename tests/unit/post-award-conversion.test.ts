import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectConversionService } from '@/lib/projects/project-conversion-service';

describe('Phase 11: Post-Award Project Conversion & Execution Planning', () => {
  let service: ProjectConversionService;

  beforeEach(() => {
    service = new ProjectConversionService();
  });

  it('선정된 공모를 프로젝트로 전환하면 WBS 마일스톤, 인력 계획, 외주 용역 초안이 일괄 생성되어야 한다', () => {
    const project = service.convertToProject({
      organizationId: 'org-test',
      opportunityId: 'opp-awarded-1',
      proposalId: 'prop-1',
      name: '원자력 고위험 작업 로봇 상용화 과제',
      totalBudget: 1_000_000_000,
      managingAgency: '한국에너지기술평가원',
      startDate: '2026-11-01',
      endDate: '2028-10-31',
    });

    expect(project.id).toBeDefined();
    expect(project.status).toBe('PLANNING');
    expect(project.totalBudget).toBe(1_000_000_000);
    expect(project.governmentGrant).toBe(750_000_000); // 75%
    expect(project.privateContribution).toBe(250_000_000); // 25%

    // WBS 마일스톤 4단계 검증
    expect(project.milestones).toHaveLength(4);
    expect(project.milestones[0].phaseNumber).toBe(1);
    expect(project.milestones[0].deliverables.length).toBeGreaterThan(0);

    // 인력 계획 및 채용 공고 초안 검증
    expect(project.workforce.length).toBeGreaterThanOrEqual(3);
    const hiringWorkforce = project.workforce.find((w) => w.isHiringNeeded);
    expect(hiringWorkforce).toBeDefined();
    expect(hiringWorkforce?.jobPostDraft).toContain('채용공고 초안');

    // 외주 용역 RFP 초안 검증
    expect(project.subcontracts).toHaveLength(1);
    expect(project.subcontracts[0].rfpDraft).toContain('외주 용역 제안요청서(RFP) 초안');
    expect(project.subcontracts[0].vendorComparisonNotes).toBeDefined();
  });
});
