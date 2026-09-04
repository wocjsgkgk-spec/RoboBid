import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceStore } from '@/lib/evidence/evidence-store';

describe('EvidenceStore - Document Library & Reusable Recommendations', () => {
  let store: EvidenceStore;

  beforeEach(() => {
    store = EvidenceStore.getInstance();
    store.seedDefault();
  });

  it('initializes with default evidence documents across legal, patent, and performance categories', () => {
    const items = store.getAll();
    expect(items.length).toBeGreaterThanOrEqual(6);
    expect(items.some((i) => i.category === 'CORPORATE')).toBe(true);
    expect(items.some((i) => i.category === 'PATENT')).toBe(true);
    expect(items.some((i) => i.category === 'PERFORMANCE')).toBe(true);
  });

  it('recommends relevant documents for a given opportunity', () => {
    const recommended = store.getRecommendedForOpportunity('opp-koneps-agv-001');
    expect(recommended.length).toBeGreaterThan(0);
    expect(recommended.every((r) => r.reusableScore >= 90)).toBe(true);
  });

  it('creates new evidence item with tags and security level', () => {
    const created = store.create({
      name: '2026 기업부설연구소 신규 인정서',
      category: 'CERTIFICATE',
      fileExtension: 'pdf',
      fileSizeBytes: 450000,
      issueDate: '2026-02-01',
      expiryDate: '2029-01-31',
      isExpired: false,
      securityLevel: 'INTERNAL',
      assignee: '연구지원실',
      tags: ['연구소', '신규인정'],
      linkedOpportunityIds: [],
      linkedProposalIds: [],
      reusableScore: 92,
    });

    expect(created.id).toBeDefined();
    expect(store.getById(created.id)?.name).toBe('2026 기업부설연구소 신규 인정서');
  });
});
