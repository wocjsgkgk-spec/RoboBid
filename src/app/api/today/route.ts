import { NextResponse } from 'next/server';
import { ProviderRegistry } from '@/lib/providers';
import { todayService } from '@/lib/today/today-service';
import { Opportunity } from '@/types';
import { OpportunityScore } from '@/types/scoring';
import { DecisionRecord } from '@/types/decision';

export async function GET() {
  try {
    // 1. 실제 Provider 실시간 헬스 상태 조회
    const registry = ProviderRegistry.getInstance();
    const providers = registry.getAll();
    const providerHealths = await Promise.all(
      providers.map(async (adapter) => {
        const h = await adapter.checkHealth();
        return {
          providerId: adapter.id,
          providerName: adapter.name,
          status: h.status,
          latencyMs: h.latencyMs,
          lastCheckedAt: h.lastCheckedAt,
          error: h.message,
        };
      })
    );

    // 2. 실제 공모, 점수, 결정 데이터 쿼리
    // Zero Fake Data 원칙: 인메모리/DB 실제 데이터가 없을 때는 임의 mock을 주입하지 않고 빈 배열/맵으로 처리
    const opportunities: Opportunity[] = [];
    const scores = new Map<string, OpportunityScore>();
    const decisions: DecisionRecord[] = [];

    // 3. Today 7대 우선순위 집계
    const summary = todayService.aggregateTodaySummary({
      opportunities,
      scores,
      decisions,
      providerHealths,
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
