import { describe, it, expect, beforeEach } from 'vitest';
import { PipelineStore } from '@/lib/pipeline/pipeline-store';

describe('PipelineStore - 5-Stage Funnel & Bulk Actions', () => {
  let store: PipelineStore;

  beforeEach(() => {
    store = PipelineStore.getInstance();
    store.seedDefault();
  });

  it('initializes with 3 default evaluation funnel items', () => {
    const items = store.getAll();
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items[0]).toHaveProperty('techFitScore');
    expect(items[0]).toHaveProperty('businessFitScore');
  });

  it('moves an item to the next funnel stage', () => {
    const items = store.getAll();
    const item = items[0];
    const originalStage = item.stage;

    const updated = store.moveStage(item.id, 'DECIDED');
    expect(updated.stage).toBe('DECIDED');
    expect(updated.stage).not.toBe(originalStage);
  });

  it('bulk moves multiple items to ELIGIBILITY_REVIEW', () => {
    const items = store.getAll();
    const ids = [items[0].id, items[1].id];

    const count = store.bulkMoveStage(ids, 'ELIGIBILITY_REVIEW');
    expect(count).toBe(2);

    expect(store.getAll().find((i) => i.id === ids[0])?.stage).toBe('ELIGIBILITY_REVIEW');
    expect(store.getAll().find((i) => i.id === ids[1])?.stage).toBe('ELIGIBILITY_REVIEW');
  });

  it('assigns user to a pipeline item', () => {
    const items = store.getAll();
    const item = items[0];

    const updated = store.assignUser(item.id, '박수석 (전략기획팀)');
    expect(updated.assignee).toBe('박수석 (전략기획팀)');
  });
});
