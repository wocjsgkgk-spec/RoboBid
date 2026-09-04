import { NextRequest, NextResponse } from "next/server";
import { DecisionService } from "@/lib/decision/decision-service";
import { DecisionType } from "@/types/decision";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const decision = body.decision as DecisionType;
    const reason = body.reason as string;
    const conditions = (body.conditions || []) as string[];
    const scoreAtDecision = Number(body.scoreAtDecision || 0);

    if (!decision || !reason) {
      return NextResponse.json(
        { success: false, error: "의사결정 구분(decision)과 사유(reason)는 필수 입력 사항입니다." },
        { status: 400 }
      );
    }

    const { decision: record, newOpportunityStatus } = DecisionService.recordDecision({
      opportunityId: params.id,
      organizationId: body.organizationId || "123e4567-e89b-12d3-a456-426614174000",
      userId: body.userId,
      userName: body.userName,
      decision,
      reason,
      conditions,
      scoreAtDecision,
      evidenceSnapshot: body.evidenceSnapshot,
    });

    return NextResponse.json({
      success: true,
      decision: record,
      newOpportunityStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
