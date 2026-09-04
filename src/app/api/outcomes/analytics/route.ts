import { NextRequest, NextResponse } from 'next/server';
import { outcomeService } from '@/lib/learning/outcome-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId') || 'org-robobid-default';

  try {
    const analyticsData = outcomeService.getAnalytics(organizationId);
    return NextResponse.json(analyticsData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
