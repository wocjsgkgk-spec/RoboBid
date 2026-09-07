import { NextRequest, NextResponse } from "next/server";
import { DerivationStore } from "@/lib/derivation/derivation-store";
import { DocumentDerivationService } from "@/lib/derivation/document-derivation-service";
import { ApproveDerivationInput } from "@/types/derivation";

interface RouteParams {
  params: {
    id: string;
    docId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const store = DerivationStore.getInstance();
    const doc = store.getDocumentById(params.docId);

    if (!doc || doc.projectConceptId !== params.id) {
      return NextResponse.json(
        { success: false, error: "파생 문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error("GET /api/concepts/[id]/derive/[docId] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const store = DerivationStore.getInstance();
    const doc = store.getDocumentById(params.docId);

    if (!doc || doc.projectConceptId !== params.id) {
      return NextResponse.json(
        { success: false, error: "파생 문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const body = await req.json();

    // 승인(Approval) 요청인 경우
    if (body.approve) {
      const approveInput: ApproveDerivationInput = {
        approvedBy: body.approvedBy,
        approvalNotes: body.approvalNotes,
      };
      const approvedDoc = DocumentDerivationService.approve(doc, approveInput);
      store.saveDocument(approvedDoc);

      return NextResponse.json({
        success: true,
        data: approvedDoc,
        message: "파생 문서 검토 및 승인이 완료되었습니다.",
      });
    }

    // 섹션 직접 수정 등 일반 업데이트
    if (body.sections) {
      doc.sections = body.sections;
      doc.updatedAt = new Date().toISOString();
      store.saveDocument(doc);
    }

    return NextResponse.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error("PATCH /api/concepts/[id]/derive/[docId] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const store = DerivationStore.getInstance();
    const doc = store.getDocumentById(params.docId);

    if (!doc || doc.projectConceptId !== params.id) {
      return NextResponse.json(
        { success: false, error: "파생 문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    store.deleteDocument(params.docId);

    return NextResponse.json({
      success: true,
      message: "파생 문서가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("DELETE /api/concepts/[id]/derive/[docId] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
