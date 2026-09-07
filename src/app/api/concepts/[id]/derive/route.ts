import { NextRequest, NextResponse } from "next/server";
import { ProjectConceptStore } from "@/lib/concepts/concept-store";
import { DerivationStore } from "@/lib/derivation/derivation-store";
import { DocumentDerivationService } from "@/lib/derivation/document-derivation-service";
import { CreateDerivationInput } from "@/types/derivation";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const conceptId = params.id;
    const store = DerivationStore.getInstance();
    const docs = store.getDocumentsByConcept(conceptId);

    return NextResponse.json({
      success: true,
      data: docs,
      count: docs.length,
    });
  } catch (error) {
    console.error("GET /api/concepts/[id]/derive error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const conceptId = params.id;
    const body = await req.json();

    const conceptStore = ProjectConceptStore.getInstance();
    const concept = conceptStore.getById(conceptId);
    if (!concept) {
      return NextResponse.json(
        { success: false, error: "프로젝트 컨셉을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const spec = conceptStore.getMasterSpec(conceptId);
    if (!spec) {
      return NextResponse.json(
        { success: false, error: "해당 프로젝트에 등록된 Master Specification이 없습니다. 먼저 마스터 사양을 작성해주세요." },
        { status: 400 }
      );
    }

    const input: CreateDerivationInput = {
      projectConceptId: conceptId,
      category: body.category,
      documentType: body.documentType,
      title: body.title,
      targetClassification: body.targetClassification,
      customExclusions: body.customExclusions,
    };

    const derivedDoc = DocumentDerivationService.derive(concept, spec, input);

    const store = DerivationStore.getInstance();
    store.saveDocument(derivedDoc);

    return NextResponse.json({
      success: true,
      data: derivedDoc,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/concepts/[id]/derive error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
