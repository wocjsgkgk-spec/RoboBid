export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
}

export interface RateLimitOptions {
  windowMs?: number; // 기본 60,000ms (1분)
  maxRequests?: number; // 윈도우 당 최대 요청 수
}

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private hits: Map<string, number[]> = new Map();

  constructor(options?: RateLimitOptions) {
    this.windowMs = options?.windowMs ?? 60_000;
    this.maxRequests = options?.maxRequests ?? 60;
  }

  /**
   * 슬라이딩 윈도우 방식으로 요청 허용 여부 판정
   */
  public check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 해당 키의 이전 타임스탬프 배열 가져오기
    let timestamps = this.hits.get(key) || [];

    // 윈도우 이전의 만료된 요청 제거
    timestamps = timestamps.filter((t) => t > windowStart);

    const isAllowed = timestamps.length < this.maxRequests;

    if (isAllowed) {
      timestamps.push(now);
      this.hits.set(key, timestamps);
    }

    const remaining = Math.max(0, this.maxRequests - timestamps.length);
    const oldestTimestamp = timestamps[0] || now;
    const resetTimeMs = oldestTimestamp + this.windowMs;

    return {
      allowed: isAllowed,
      limit: this.maxRequests,
      remaining,
      resetTimeMs,
    };
  }

  /**
   * 키 리셋
   */
  public reset(key: string): void {
    this.hits.delete(key);
  }

  /**
   * 전체 메모리 초기화 (테스트용)
   */
  public clear(): void {
    this.hits.clear();
  }
}

// 기본 싱글톤 (API 전체 보호용 100회/분, 인증용 10회/분)
export const globalApiRateLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 100 });
export const authRateLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 10 });
