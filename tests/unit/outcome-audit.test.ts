import { describe, it, expect, beforeEach } from 'vitest';
import { OutcomeService } from '@/lib/learning/outcome-service';

describe('Phase 9: Outcome Audit Trail & Integrity', () => {
  let outcomeService: OutcomeService;

  beforeEach(() => {
    outcomeService = new OutcomeService();
  });

  it('Outcome을 최초 등록하면 CREATE 액션의 감사 로그가 자동으로 생성되어야 한다', () => {
    const record = outcomeService.recordOutcome(
      {
        organizationId: 'org-1',
        opportunityId: 'opp-100',
        status: 'SUBMITTED',
        opportunityTitle: '원전 해체 로봇 개발',
        agencyName: '한국수력원자력',
        category: 'ROBOT',
        opportunityScore: 88,
        decision: 'GO',
      },
      'user-pmo-01'
    );

    expect(record.id).toBeDefined();
    expect(record.status).toBe('SUBMITTED');

    const logs = outcomeService.getAuditLogs(record.id);
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('CREATE');
    expect(logs[0].changedBy).toBe('user-pmo-01');
    expect(logs[0].previousData).toBeNull();
    expect(logs[0].newData.status).toBe('SUBMITTED');
  });

  it('Outcome 정보를 수정하면 UPDATE 감사 로그에 이전 데이터 스냅샷과 수정 내용이 온전히 기록되어야 한다', () => {
    const record = outcomeService.recordOutcome(
      {
        organizationId: 'org-1',
        opportunityId: 'opp-200',
        status: 'SUBMITTED',
      },
      'user-pmo-01'
    );

    // 결과 발표 후 선정 상태 및 심사점수 반영
    const updated = outcomeService.updateOutcome(
      record.id,
      {
        status: 'AWARDED',
        evaluationScore: 92.4,
        awardAmount: 750_000_000,
        evaluationFeedback: '로봇 제어 기술의 현장 적용 가능성이 매우 우수함',
        successReasons: ['현장 실증 레퍼런스', '핵심 특허 보유'],
      },
      'user-exec-02',
      '최종 선정 공문 접수에 따른 결과 확정'
    );

    expect(updated.status).toBe('AWARDED');
    expect(updated.evaluationScore).toBe(92.4);

    const logs = outcomeService.getAuditLogs(record.id);
    expect(logs).toHaveLength(2);

    const latestLog = logs[0];
    expect(latestLog.action).toBe('UPDATE');
    expect(latestLog.changedBy).toBe('user-exec-02');
    expect(latestLog.reason).toBe('최종 선정 공문 접수에 따른 결과 확정');
    expect(latestLog.previousData?.status).toBe('SUBMITTED');
    expect(latestLog.newData.status).toBe('AWARDED');
    expect(latestLog.newData.evaluationScore).toBe(92.4);
  });

  it('동일 공모(opportunityId)에 대해 중복으로 새 Outcome을 생성하려고 하면 에러를 발생시켜야 한다', () => {
    outcomeService.recordOutcome({
      organizationId: 'org-1',
      opportunityId: 'opp-unique-1',
      status: 'SUBMITTED',
    });

    expect(() => {
      outcomeService.recordOutcome({
        organizationId: 'org-1',
        opportunityId: 'opp-unique-1',
        status: 'AWARDED',
      });
    }).toThrow(/already exists/);
  });
});
