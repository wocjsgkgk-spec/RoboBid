import { describe, it, expect, beforeEach } from 'vitest';
import { OpportunityStore } from '@/lib/opportunities/opportunity-store';

describe('OpportunityStore - Manual Creation & CSV Batch Import', () => {
  let store: OpportunityStore;

  beforeEach(() => {
    store = OpportunityStore.getInstance();
    store.seedDefault();
  });

  it('manually creates an opportunity with USER_INPUT dataSource', () => {
    const created = store.createManual({
      title: '2026 지자체 지능형 화재순찰로봇 구축사업',
      announcingAgency: '소방청',
      bidType: 'DEMONSTRATION',
      allocatedBudget: 750000000,
      submissionDeadline: '2026-10-15T18:00:00Z',
    });

    expect(created.id).toBeDefined();
    expect(created.dataSource).toBe('USER_INPUT');
    expect(created.status).toBe('INBOX');
    expect(store.getById(created.id)).toBeDefined();
  });

  it('duplicates an opportunity with [복사본] prefix and INBOX status', () => {
    const opps = store.getAll();
    const source = opps[0];

    const copy = store.duplicate(source.id);
    expect(copy.id).not.toBe(source.id);
    expect(copy.title).toContain('[복사본]');
    expect(copy.status).toBe('INBOX');
    expect(copy.dataSource).toBe('USER_INPUT');
  });

  it('imports batch rows via CSV importer with IMPORTED dataSource', () => {
    const rows = [
      {
        title: 'CSV 1호 스마트물류 R&D',
        agency: '과기정통부',
        budget: 500000000,
        deadline: '2026-11-01T18:00:00Z',
      },
      {
        title: 'CSV 2호 지능형 AMR 구매',
        agency: '조달청',
        budget: 300000000,
        deadline: '2026-11-15T18:00:00Z',
      },
    ];

    const imported = store.importBatchCsv(rows);
    expect(imported.length).toBe(2);
    expect(imported[0].dataSource).toBe('IMPORTED');
    expect(imported[1].dataSource).toBe('IMPORTED');
    expect(store.getById(imported[0].id)).toBeDefined();
  });

  it('updates opportunity status across 14-stage lifecycle', () => {
    const opps = store.getAll();
    const opp = opps[0];

    const updated = store.updateStatus(opp.id, 'SUBMISSION_READY');
    expect(updated.status).toBe('SUBMISSION_READY');
    expect(store.getById(opp.id)?.status).toBe('SUBMISSION_READY');
  });
});
