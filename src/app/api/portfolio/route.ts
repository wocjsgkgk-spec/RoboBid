import { NextRequest, NextResponse } from "next/server";
import { fundingPortfolioStore } from "@/lib/funding/funding-portfolio-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || undefined;

    const summary = fundingPortfolioStore.getSummary(projectId);
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch funding portfolio" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.projectConceptId || !body.opportunityTitle) {
      return NextResponse.json(
        { success: false, error: "projectConceptId and opportunityTitle are required" },
        { status: 400 }
      );
    }

    const newItem = fundingPortfolioStore.add({
      projectConceptId: body.projectConceptId,
      opportunityId: body.opportunityId || `opp-${crypto.randomUUID()}`,
      opportunityTitle: body.opportunityTitle,
      announcingAgency: body.announcingAgency || "공공 전담기관",
      fundingType: body.fundingType || "GOV_RND",
      status: body.status || "CANDIDATE",
      targetGrantAmount: Number(body.targetGrantAmount) || 0,
      awardedGrantAmount: Number(body.awardedGrantAmount) || 0,
      selfFundingAmount: Number(body.selfFundingAmount) || 0,
      period: body.period || {
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      allocatedCategories: body.allocatedCategories || {},
      assetsIncluded: body.assetsIncluded || [],
      partsIncluded: body.partsIncluded || [],
      personnelIncluded: body.personnelIncluded || [],
      notes: body.notes || "",
    });

    return NextResponse.json({
      success: true,
      item: newItem,
      summary: fundingPortfolioStore.getSummary(body.projectConceptId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create funding portfolio item" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    fundingPortfolioStore.clearAll();
    return NextResponse.json({
      success: true,
      message: "자금 지원 포트폴리오가 모두 초기화되었습니다.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear funding portfolio" },
      { status: 500 }
    );
  }
}
