import { describe, it, expect } from 'vitest';
import { ComplianceChecker } from '@/lib/compliance/compliance-checker';
import { RequirementMatrixItem } from '@/types/compliance';

describe('Phase 8: Missing Mandatory Warning & Submission Blocking Gate', () => {
  const checker = new ComplianceChecker();

  it('필수 요구조건이 1건이라도 MISSING이면 canSubmit이 false이고 차단 경고를 발생시켜야 한다', () => {
    const matrix: RequirementMatrixItem[] = [
      {
        id: 'rtm-1',
        proposalId: 'prop-1',
        requirementCode: 'REQ-MAND-01',
        category: 'TECHNICAL',
        originalText: '필수 안전센서 이중화 탑재 요건',
        isMandatory: true, // 필수
        complianceStatus: 'MISSING', // 누락
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'rtm-2',
        proposalId: 'prop-1',
        requirementCode: 'REQ-MAND-02',
        category: 'TECHNICAL',
        originalText: '위치 추정 정밀도 ±15mm 달성 요건',
        isMandatory: true,
        complianceStatus: 'SATISFIED',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'rtm-3',
        proposalId: 'prop-1',
        requirementCode: 'REQ-OPT-01',
        category: 'OTHER',
        originalText: '원격 관제 UI 가점 요건',
        isMandatory: false, // 선택
        complianceStatus: 'MISSING', // 선택 요건 누락
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ];

    const audit = checker.auditCompliance(matrix);

    expect(audit.totalCount).toBe(3);
    expect(audit.mandatoryMissingCount).toBe(1); // 필수 누락 1건
    expect(audit.missingCount).toBe(2); // 전체 누락 2건
    expect(audit.canSubmit).toBe(false); // 제출 차단!
    expect(audit.blockingWarnings.length).toBeGreaterThanOrEqual(1);
    expect(audit.blockingWarnings[0]).toContain('🚨 [제출 차단: 필수요건 누락]');
    expect(audit.blockingWarnings[0]).toContain('REQ-MAND-01');
  });

  it('모든 필수 요구조건이 충족되면 canSubmit이 true로 전이되어야 한다', () => {
    const satisfiedMatrix: RequirementMatrixItem[] = [
      {
        id: 'rtm-1',
        proposalId: 'prop-1',
        requirementCode: 'REQ-MAND-01',
        category: 'TECHNICAL',
        originalText: '필수 안전센서 탑재',
        isMandatory: true,
        complianceStatus: 'SATISFIED',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'rtm-2',
        proposalId: 'prop-1',
        requirementCode: 'REQ-MAND-02',
        category: 'TECHNICAL',
        originalText: '정밀도 요건',
        isMandatory: true,
        complianceStatus: 'SATISFIED',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'rtm-3',
        proposalId: 'prop-1',
        requirementCode: 'REQ-OPT-01',
        category: 'OTHER',
        originalText: '가점 요건',
        isMandatory: false,
        complianceStatus: 'MISSING', // 선택 요건 누락은 제출 차단 사유가 아님
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ];

    const audit = checker.auditCompliance(satisfiedMatrix);

    expect(audit.mandatoryMissingCount).toBe(0);
    expect(audit.canSubmit).toBe(true);
    expect(audit.blockingWarnings.length).toBe(0);
  });
});
