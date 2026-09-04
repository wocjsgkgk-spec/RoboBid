import { NextRequest, NextResponse } from "next/server";
import { EligibilityRuleEngine, OpportunityEligibilityInput } from "@/lib/eligibility/rule-engine";
import { Capability } from "@/types/capability";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const opportunity: OpportunityEligibilityInput = body.opportunity;
    const capabilities: Capability[] = body.capabilities || [];

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "공모 정보(opportunity)가 누락되었습니다." },
        { status: 400 }
      );
    }

    const result = EligibilityRuleEngine.evaluate(opportunity, capabilities);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
