import { NextRequest, NextResponse } from 'next/server';
import { readinessEvaluator } from '@/lib/intelligence/readiness-evaluator';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId') || 'org-robobid-default';

  try {
    const metrics = readinessEvaluator.evaluate(organizationId);
    return NextResponse.json({ readiness: metrics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
