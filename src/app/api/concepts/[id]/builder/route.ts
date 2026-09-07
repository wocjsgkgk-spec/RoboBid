import { NextRequest, NextResponse } from "next/server";
import { projectConceptStore } from "@/lib/concepts/concept-store";
import { ProgressiveBuilderService } from "@/lib/concepts/progressive-builder-service";
import { ProgressiveBuilderStep } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const step: ProgressiveBuilderStep = body.step || "PROBLEM";

    const concept = projectConceptStore.getById(id);
    if (!concept) {
      return NextResponse.json({ success: false, error: "Concept not found" }, { status: 404 });
    }

    const currentSpec = projectConceptStore.getMasterSpec(id);
    const suggestion = ProgressiveBuilderService.generateStepSuggestion(concept, currentSpec, step);

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
