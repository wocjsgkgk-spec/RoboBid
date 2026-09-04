import { NextRequest, NextResponse } from 'next/server';
import { submissionService } from '@/lib/compliance/submission-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const checklist = submissionService.getOrInitChecklist(params.id);
    const auditSummary = submissionService.getAuditSummary(params.id);

    return NextResponse.json({ checklist, auditSummary });
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
    const updated = submissionService.updateChecklist(params.id, body);
    const auditSummary = submissionService.getAuditSummary(params.id);

    return NextResponse.json({ checklist: updated, auditSummary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
