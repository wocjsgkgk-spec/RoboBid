import { NextRequest, NextResponse } from "next/server";
import { FundingConflictService } from "@/lib/funding/funding-conflict-service";
import { fundingPortfolioStore } from "@/lib/funding/funding-portfolio-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidate, projectConceptId } = body;

    if (!candidate || !candidate.opportunityTitle) {
      return NextResponse.json(
        { success: false, error: "Candidate funding details with opportunityTitle are required" },
        { status: 400 }
      );
    }

    const portfolio = projectConceptId
      ? fundingPortfolioStore.getByProject(projectConceptId)
      : fundingPortfolioStore.getAll();

    const report = FundingConflictService.checkConflicts(candidate, portfolio);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check funding conflicts" },
      { status: 500 }
    );
  }
}
