import { NextRequest, NextResponse } from "next/server";
import { OutsourcingService } from "@/lib/outsourcing/outsourcing-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conceptId = searchParams.get("conceptId") || "c001-amr-logistics-robot";

    const gaps = OutsourcingService.analyzeCapabilityGaps(conceptId);

    return NextResponse.json({
      success: true,
      data: gaps,
      count: gaps.length,
    });
  } catch (error) {
    console.error("GET /api/outsourcing/gap-analysis error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
