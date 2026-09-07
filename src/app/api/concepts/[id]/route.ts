import { NextRequest, NextResponse } from "next/server";
import { projectConceptStore } from "@/lib/concepts/concept-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const concept = projectConceptStore.getById(id);
    if (!concept) {
      return NextResponse.json({ success: false, error: "Concept not found" }, { status: 404 });
    }
    const spec = projectConceptStore.getMasterSpec(id);
    const versions = projectConceptStore.getSpecVersions(id);

    return NextResponse.json({
      success: true,
      concept,
      spec,
      versions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.linkedVaultAssetIds && Array.isArray(body.linkedVaultAssetIds)) {
      const updated = projectConceptStore.linkVaultAssets(id, body.linkedVaultAssetIds);
      return NextResponse.json({ success: true, concept: updated });
    }

    const updated = projectConceptStore.update(id, body);
    return NextResponse.json({ success: true, concept: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = projectConceptStore.delete(id);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
