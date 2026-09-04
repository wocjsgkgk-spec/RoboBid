import { NextRequest, NextResponse } from 'next/server';
import { submissionService } from '@/lib/compliance/submission-service';
import { proposalService } from '@/lib/proposals/proposal-service';
import { RequirementCandidate } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposal = proposalService.getProposal(params.id);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const matrix = submissionService.getOrInitMatrix(
      params.id,
      [],
      proposal.sections || []
    );
    const summary = submissionService.getAuditSummary(params.id);

    return NextResponse.json({ matrix, summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { requirements } = body;
    const proposal = proposalService.getProposal(params.id);

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const matrix = submissionService.getOrInitMatrix(
      params.id,
      (requirements || []) as RequirementCandidate[],
      proposal.sections || []
    );
    const summary = submissionService.getAuditSummary(params.id);

    return NextResponse.json({ success: true, matrix, summary });
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
    const { matrixId, status, notes, reviewedBy } = body;

    if (!matrixId || !status) {
      return NextResponse.json(
        { error: 'matrixId and status are required' },
        { status: 400 }
      );
    }

    const updated = submissionService.updateMatrixStatus(
      params.id,
      matrixId,
      status,
      notes,
      reviewedBy
    );
    const summary = submissionService.getAuditSummary(params.id);

    return NextResponse.json({ success: true, item: updated, summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
