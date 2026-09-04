import { describe, it, expect } from 'vitest';
import { ProjectConversionService } from '@/lib/projects/project-conversion-service';

describe('Phase 11: Zero Auto-Contract & Zero Auto-Hire Invariants (PRD & Phase 11 Rules)', () => {
  it('시스템은 외부 업체와의 자동 계약 체결 및 자동 채용 확정 API를 제공하지 않아야 한다 (불변식)', () => {
    const service = new ProjectConversionService();

    // 불변식: 외부 전자서명/자동계약/자동채용 메서드 배제 확인
    expect((service as any).executeAutoContract).toBeUndefined();
    expect((service as any).signExternalSubcontract).toBeUndefined();
    expect((service as any).hireApplicantAutomatically).toBeUndefined();
  });

  it('프로젝트 전환 시 생성된 외주 및 인력 산출물은 반드시 검토용 초안(Draft)이어야 한다', () => {
    const service = new ProjectConversionService();
    const project = service.convertToProject({
      organizationId: 'org-test',
      opportunityId: 'opp-1',
      name: '로봇 사업',
      totalBudget: 400_000_000,
    });

    for (const sub of project.subcontracts) {
      expect(sub.rfpDraft).toContain('초안');
    }

    const hiringItem = project.workforce.find((w) => w.isHiringNeeded);
    expect(hiringItem?.jobPostDraft).toContain('초안');
  });
});
