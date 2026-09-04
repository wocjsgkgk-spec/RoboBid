import { NextRequest, NextResponse } from "next/server";
import { OpportunityScorer, OpportunityScoringInput } from "@/lib/scoring/opportunity-scorer";
import { Capability } from "@/types/capability";
import { EligibilityGateResult } from "@/types/eligibility";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const opportunity: OpportunityScoringInput = body.opportunity || {
      id: params.id,
      title: "공모 사업",
      primaryDomain: "ROBOT",
    };
    const capabilities: Capability[] = body.capabilities || [];
    const eligibility: EligibilityGateResult = body.eligibility || {
      opportunityId: params.id,
      overallStatus: "PASS",
      passCount: 1,
      failCount: 0,
      reviewRequiredCount: 0,
      unknownCount: 0,
      checks: [],
      canProceedToBidDecision: true,
      evaluatedAt: new Date().toISOString(),
    };

    const scoreResult = OpportunityScorer.calculate(opportunity, capabilities, eligibility);

    return NextResponse.json({
      success: true,
      score: scoreResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
