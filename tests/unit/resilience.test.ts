import { describe, it, expect, vi } from 'vitest';
import { ResilienceService } from '@/lib/reliability/resilience';

describe('Phase 10: Resilience & Retry with Exponential Backoff', () => {
  it('일시적 실패 후 재시도 성공 시 최종 결과를 정상 반환해야 한다', async () => {
    let attempts = 0;
    const flakyOperation = async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Provider Network Timeout (504)');
      }
      return 'SUCCESS_DATA';
    };

    const result = await ResilienceService.executeWithRetry(flakyOperation, {
      maxRetries: 3,
      initialDelayMs: 10,
      factor: 1,
      jitter: false,
    });

    expect(result).toBe('SUCCESS_DATA');
    expect(attempts).toBe(2);
  });

  it('모든 재시도가 실패하면 마지막 에러를 던져야 한다', async () => {
    let attempts = 0;
    const alwaysFailing = async () => {
      attempts++;
      throw new Error('Persistent Outage (503)');
    };

    await expect(
      ResilienceService.executeWithRetry(alwaysFailing, {
        maxRetries: 3,
        initialDelayMs: 10,
        factor: 1,
        jitter: false,
      })
    ).rejects.toThrow('Persistent Outage (503)');

    expect(attempts).toBe(3);
  });

  it('기본 연산 실패 시 Fallback 함수를 안전하게 실행해야 한다 (Graceful Degradation)', async () => {
    const failingPrimary = async () => {
      throw new Error('AI API Limit Exceeded');
    };
    const fallbackTemplate = (err: any) => {
      return `FALLBACK_TEMPLATE_FOR_${err.message}`;
    };

    const result = await ResilienceService.executeWithFallback(
      failingPrimary,
      fallbackTemplate
    );

    expect(result).toContain('FALLBACK_TEMPLATE_FOR_AI API Limit Exceeded');
  });
});
