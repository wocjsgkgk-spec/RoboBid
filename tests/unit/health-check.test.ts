import { describe, it, expect } from 'vitest';
import { ResilienceService } from '@/lib/reliability/resilience';

describe('Phase 10: System Health & Diagnostics Check', () => {
  it('시스템 헬스체크는 HEALTHY 상태와 세부 구성요소 상태를 반환해야 한다', async () => {
    const health = await ResilienceService.checkHealth();

    expect(health.status).toBe('HEALTHY');
    expect(health.version).toBe('1.0.0');
    expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(health.checks.database.status).toBe('UP');
    expect(health.checks.providers.count).toBe(5);
    expect(health.checks.providers.active).toBe(5);
  });
});
