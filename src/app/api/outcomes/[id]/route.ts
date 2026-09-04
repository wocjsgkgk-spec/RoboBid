import { NextRequest, NextResponse } from 'next/server';
import { outcomeService } from '@/lib/learning/outcome-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const outcome = outcomeService.getOutcome(params.id);
    if (!outcome) {
      return NextResponse.json({ error: 'Outcome not found' }, { status: 404 });
    }

    const auditLogs = outcomeService.getAuditLogs(params.id);

    return NextResponse.json({ outcome, auditLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { updates, userId, reason } = body;

    if (!updates) {
      return NextResponse.json(
        { error: 'updates payload is required' },
        { status: 400 }
      );
    }

    const updated = outcomeService.updateOutcome(
      params.id,
      updates,
      userId,
      reason
    );

    const auditLogs = outcomeService.getAuditLogs(params.id);

    return NextResponse.json({ outcome: updated, auditLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
