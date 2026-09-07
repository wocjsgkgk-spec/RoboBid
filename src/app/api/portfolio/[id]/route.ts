import { NextRequest, NextResponse } from "next/server";
import { fundingPortfolioStore } from "@/lib/funding/funding-portfolio-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = fundingPortfolioStore.update(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: updated,
      summary: fundingPortfolioStore.getSummary(updated.projectConceptId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = fundingPortfolioStore.getById(id);
    const projectId = item?.projectConceptId;

    const removed = fundingPortfolioStore.remove(id);
    if (!removed) {
      return NextResponse.json(
        { success: false, error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      summary: fundingPortfolioStore.getSummary(projectId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
