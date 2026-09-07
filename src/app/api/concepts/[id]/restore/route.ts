import { NextRequest, NextResponse } from "next/server";
import { projectConceptStore } from "@/lib/concepts/concept-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const versionId = body.versionId;

    if (!versionId) {
      return NextResponse.json({ success: false, error: "versionId is required" }, { status: 400 });
    }

    const restoredSpec = projectConceptStore.restoreSpecVersion(
      id,
      versionId,
      body.approvedBy || "사업개발 PM"
    );

    const versions = projectConceptStore.getSpecVersions(id);
    const concept = projectConceptStore.getById(id);

    return NextResponse.json({
      success: true,
      concept,
      spec: restoredSpec,
      versions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
