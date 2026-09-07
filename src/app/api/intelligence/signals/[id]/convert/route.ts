import { NextRequest, NextResponse } from "next/server";
import { EarlySignalService } from "@/lib/intelligence/early-signal-service";
import { ConvertSignalToOpportunityInput } from "@/types/early-signal";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const input: ConvertSignalToOpportunityInput = {
      signalId: params.id,
      officialAnnouncementNumber: body.officialAnnouncementNumber || `NOTC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      officialTitle: body.officialTitle,
      submissionDeadline: body.submissionDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      allocatedBudget: body.allocatedBudget,
    };

    const opportunity = EarlySignalService.convertToOpportunity(input);

    return NextResponse.json({
      success: true,
      data: opportunity,
      message: "사전 신호가 정식 공모로 성공적으로 전환되었습니다.",
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/intelligence/signals/[id]/convert error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
