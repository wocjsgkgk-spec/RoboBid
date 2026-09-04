import { NextRequest, NextResponse } from 'next/server';
import { outcomeService } from '@/lib/learning/outcome-service';
import { OutcomeStatus } from '@/types/outcome';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId') || 'org-robobid-default';
  const status = searchParams.get('status') as OutcomeStatus | undefined;
  const category = searchParams.get('category') || undefined;
  const agencyName = searchParams.get('agencyName') || undefined;

  try {
    const outcomes = outcomeService.listOutcomes(organizationId, {
      status: status || undefined,
      category,
      agencyName,
    });
    return NextResponse.json({ outcomes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId = 'org-robobid-default',
      opportunityId,
      proposalId,
      status = 'SUBMITTED',
      evaluationScore,
      evaluationFeedback,
      awardAmount,
      competitorCount,
      internalPostmortem,
      successReasons,
      failureReasons,
      capabilityGaps,
      preparationDays,
      submittedAt,
      decidedAt,
      opportunityTitle,
      agencyName,
      category,
      opportunityBudget,
      opportunityScore,
      decision,
      userId,
    } = body;

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'opportunityId is required' },
        { status: 400 }
      );
    }

    const record = outcomeService.recordOutcome(
      {
        organizationId,
        opportunityId,
        proposalId,
        status,
        evaluationScore,
        evaluationFeedback,
        awardAmount,
        competitorCount,
        internalPostmortem,
        successReasons,
        failureReasons,
        capabilityGaps,
        preparationDays,
        submittedAt,
        decidedAt,
        opportunityTitle,
        agencyName,
        category,
        opportunityBudget,
        opportunityScore,
        decision,
      },
      userId
    );

    return NextResponse.json({ outcome: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
