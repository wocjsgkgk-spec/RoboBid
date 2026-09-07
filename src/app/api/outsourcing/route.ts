import { NextRequest, NextResponse } from "next/server";
import { OutsourcingStore, OutsourcingService } from "@/lib/outsourcing/outsourcing-service";
import { CreateOutsourcingPackageInput, OutsourcingPackage } from "@/types/outsourcing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conceptId = searchParams.get("conceptId");
    const store = OutsourcingStore.getInstance();

    const packages = conceptId
      ? store.getByConceptId(conceptId)
      : store.getAll();

    return NextResponse.json({
      success: true,
      data: packages,
      count: packages.length,
    });
  } catch (error) {
    console.error("GET /api/outsourcing error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = OutsourcingStore.getInstance();

    // Mode 1: Auto-extract from Master Spec
    if (body.action === "EXTRACT" && body.projectConceptId) {
      const extracted = OutsourcingService.extractOutsourceScopes(body.projectConceptId);
      extracted.forEach((p) => store.save(p));

      return NextResponse.json({
        success: true,
        data: extracted,
        message: `${extracted.length}개의 외주 과업 Scope가 성공적으로 추출되었습니다.`,
      }, { status: 201 });
    }

    // Mode 2: Manual Create
    const input: CreateOutsourcingPackageInput = body;
    const now = new Date().toISOString();
    const newPkg: OutsourcingPackage = {
      id: crypto.randomUUID(),
      projectConceptId: input.projectConceptId,
      developmentProjectId: input.developmentProjectId || null,
      taskCategory: input.taskCategory,
      taskTitle: input.taskTitle,
      description: input.description || "",
      sowContent: input.sowContent || "",
      acceptanceCriteria: input.acceptanceCriteria || "",
      deliverables: input.deliverables || [],
      budgetCap: input.budgetCap || 0,
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      approvalNotes: null,
      candidateVendors: [],
      receivedQuotes: [],
      quoteEvaluations: [],
      status: "SCOPE_DEFINED",
      createdAt: now,
      updatedAt: now,
    };

    store.save(newPkg);

    return NextResponse.json({
      success: true,
      data: newPkg,
      message: "외주 발주 패키지가 생성되었습니다.",
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/outsourcing error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
