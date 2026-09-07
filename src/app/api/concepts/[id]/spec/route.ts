import { NextRequest, NextResponse } from "next/server";
import { projectConceptStore } from "@/lib/concepts/concept-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const spec = projectConceptStore.getMasterSpec(id);
    const versions = projectConceptStore.getSpecVersions(id);

    return NextResponse.json({
      success: true,
      spec,
      versions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Diff 승인 반영 모드
    if (body.approvedDiffs && typeof body.approvedDiffs === "object") {
      const result = projectConceptStore.applyApprovedDiff(
        id,
        body.approvedDiffs,
        body.changeSummary || "AI 제안 사항 검토 후 사용자 승인 반영",
        body.approvedBy || "사업개발 PM"
      );
      return NextResponse.json({
        success: true,
        concept: result.concept,
        spec: result.spec,
        version: result.version,
      });
    }

    // 2. 직접 수동 업데이트 모드
    const result = projectConceptStore.saveMasterSpec(
      id,
      body.specUpdates || {},
      body.changeSummary || "Master Specification 사용자 수동 편집",
      body.approvedBy || "사업개발 PM"
    );

    return NextResponse.json({
      success: true,
      spec: result.spec,
      version: result.version,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
