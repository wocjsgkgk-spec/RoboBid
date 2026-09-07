import { NextRequest, NextResponse } from "next/server";
import { projectConceptStore } from "@/lib/concepts/concept-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const list = projectConceptStore.getAll();
    return NextResponse.json({
      success: true,
      concepts: list,
      totalCount: list.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "프로젝트 명칭을 입력해주세요." },
        { status: 400 }
      );
    }

    // 1줄 빠른 등록 모드 지원
    if (body.isQuickIdea) {
      const quickConcept = projectConceptStore.createQuickIdea(body.name, body.summary);
      return NextResponse.json({
        success: true,
        concept: quickConcept,
        concepts: projectConceptStore.getAll(),
      });
    }

    const created = projectConceptStore.create({
      name: body.name,
      summary: body.summary || "",
      problemStatement: body.problemStatement,
      productConcept: body.productConcept,
      technicalConcept: body.technicalConcept,
      targetTrl: body.targetTrl,
      requiredTechnology: body.requiredTechnology,
      estimatedBudget: body.estimatedBudget,
      requiredFunding: body.requiredFunding,
      linkedVaultAssetIds: body.linkedVaultAssetIds,
    });

    return NextResponse.json({
      success: true,
      concept: created,
      concepts: projectConceptStore.getAll(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
