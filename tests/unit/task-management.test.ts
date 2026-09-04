import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from '@/lib/tasks/task-store';

describe('TaskStore - Collaborative Action Items', () => {
  let store: TaskStore;

  beforeEach(() => {
    store = TaskStore.getInstance();
    store.seedDefault();
  });

  it('initializes with seed tasks and calculates completion stats', () => {
    const tasks = store.getAll();
    expect(tasks.length).toBeGreaterThanOrEqual(5);
    const todoTasks = tasks.filter((t) => t.status !== 'DONE');
    expect(todoTasks.length).toBeGreaterThan(0);
  });

  it('toggles task status between TODO and DONE', () => {
    const tasks = store.getAll();
    const task = tasks[0];

    const doneTask = store.updateStatus(task.id, 'DONE');
    expect(doneTask.status).toBe('DONE');

    const todoTask = store.updateStatus(task.id, 'TODO');
    expect(todoTask.status).toBe('TODO');
  });

  it('creates a new task linked to an opportunity', () => {
    const created = store.create({
      title: '테스트용 신규 RFP 검토 업무',
      description: '기술요건 대조',
      opportunityId: 'opp-koneps-agv-001',
      opportunityTitle: 'AGV 실증사업',
      assignee: '김엔지니어',
      dueDate: '2026-09-30',
      priority: 'HIGH',
      status: 'TODO',
      category: 'RFP_REVIEW',
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('테스트용 신규 RFP 검토 업무');
    expect(store.getById(created.id)).toBeDefined();
  });

  it('filters tasks by opportunityId', () => {
    const firstTask = store.getAll().find((t) => t.opportunityId);
    expect(firstTask).toBeDefined();
    const targetOppId = firstTask!.opportunityId!;
    const oppTasks = store.getByOpportunityId(targetOppId);
    expect(oppTasks.length).toBeGreaterThan(0);
    expect(oppTasks.every((t) => t.opportunityId === targetOppId)).toBe(true);
  });
});
