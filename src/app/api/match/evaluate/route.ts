import { NextRequest, NextResponse } from "next/server";
import { projectConceptStore } from "@/lib/concepts/concept-store";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { vaultStore } from "@/lib/vault/vault-store";
import { SemanticMatcherService } from "@/lib/matching/semantic-matcher-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conceptId, opportunityId } = body;

    if (!opportunityId) {
      return NextResponse.json({ success: false, error: "opportunityId is required" }, { status: 400 });
    }

    const opp = opportunityStore.getById(opportunityId);
    if (!opp) {
      return NextResponse.json({ success: false, error: "Opportunity not found" }, { status: 404 });
    }

    // Concept 선택 (지정되지 않은 경우 첫 번째 가용 콘셉트 자동 선택)
    const allConcepts = projectConceptStore.getAll();
    const targetConcept = conceptId
      ? projectConceptStore.getById(conceptId)
      : allConcepts[0];

    if (!targetConcept) {
      return NextResponse.json({ success: false, error: "No ProjectConcept available" }, { status: 404 });
    }

    const spec = projectConceptStore.getMasterSpec(targetConcept.id);
    const capabilities = vaultStore.getAll();

    const evaluationResult = SemanticMatcherService.evaluate(
      targetConcept,
      spec,
      opp,
      capabilities
    );

    return NextResponse.json({
      success: true,
      concept: targetConcept,
      opportunity: opp,
      result: evaluationResult,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
