import { NextResponse } from 'next/server';
import { ResilienceService } from '@/lib/reliability/resilience';

export async function GET() {
  try {
    const health = await ResilienceService.checkHealth();
    return NextResponse.json(health, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
