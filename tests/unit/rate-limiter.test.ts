import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '@/lib/security/rate-limiter';

describe('Phase 10: API Rate Limiter (DoS Protection)', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    // 1초 윈도우 당 3회 허용
    limiter = new RateLimiter({ windowMs: 1000, maxRequests: 3 });
  });

  it('한도 내의 요청은 정상 허용되고 남은 횟수가 차감되어야 한다', () => {
    const res1 = limiter.check('192.168.1.10');
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.check('192.168.1.10');
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.check('192.168.1.10');
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('한도를 초과하는 요청은 차단되어야 한다 (HTTP 429)', () => {
    limiter.check('192.168.1.20');
    limiter.check('192.168.1.20');
    limiter.check('192.168.1.20');

    // 4번째 요청은 차단
    const blockedRes = limiter.check('192.168.1.20');
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  it('다른 IP/키는 독립적인 쿼터를 가져야 한다', () => {
    limiter.check('ip-a');
    limiter.check('ip-a');
    limiter.check('ip-a');
    expect(limiter.check('ip-a').allowed).toBe(false);

    // ip-b는 허용
    expect(limiter.check('ip-b').allowed).toBe(true);
  });
});
