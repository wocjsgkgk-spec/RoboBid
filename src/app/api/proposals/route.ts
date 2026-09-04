import { NextRequest, NextResponse } from 'next/server';
import { proposalService } from '@/lib/proposals/proposal-service';
import { Opportunity } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') || 'org-robobid-default';

  try {
    const proposals = proposalService.listProposals(orgId);
    return NextResponse.json({ proposals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity, userId } = body;

    if (!opportunity || !opportunity.id) {
      return NextResponse.json(
        { error: 'Valid Opportunity object is required to create a proposal' },
        { status: 400 }
      );
    }

    const proposal = proposalService.createProposalFromOpportunity(
      opportunity as Opportunity,
      { userId }
    );

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
