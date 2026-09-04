import { NextRequest, NextResponse } from 'next/server';
import { proposalService } from '@/lib/proposals/proposal-service';
import { submissionService } from '@/lib/compliance/submission-service';
import { crossReviewEngine } from '@/lib/proposals/cross-review-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposal = proposalService.getProposal(params.id);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const sections = proposal.sections || [];
    const matrixItems = submissionService.getOrInitMatrix(params.id, [], sections);

    const reviewResult = crossReviewEngine.review(proposal, sections, matrixItems);

    return NextResponse.json({ review: reviewResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
