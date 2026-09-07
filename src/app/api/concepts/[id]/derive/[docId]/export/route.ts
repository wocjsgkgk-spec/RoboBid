import { NextRequest, NextResponse } from "next/server";
import { DerivationStore } from "@/lib/derivation/derivation-store";
import { DocumentDerivationService } from "@/lib/derivation/document-derivation-service";

interface RouteParams {
  params: {
    id: string;
    docId: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const store = DerivationStore.getInstance();
    const doc = store.getDocumentById(params.docId);

    if (!doc || doc.projectConceptId !== params.id) {
      return NextResponse.json(
        { success: false, error: "파생 문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const format = (body.format || "markdown") as "markdown" | "html" | "json";
    const useRedactedVersion = body.useRedactedVersion !== false;

    // Gate Check: Zero-Unauthorized-Export
    if (!doc.isApproved) {
      return NextResponse.json(
        {
          success: false,
          error: "보안 규정 위반: 사용자 검토 및 승인(Approval)을 거치지 않은 파생 문서는 외부로 내보낼 수 없습니다.",
          requiresApproval: true,
        },
        { status: 403 }
      );
    }

    const exportedContent = DocumentDerivationService.exportToFormat(
      doc,
      format,
      useRedactedVersion
    );

    return NextResponse.json({
      success: true,
      format,
      filename: `${doc.title.replace(/[\s/\\?%*:|"<>]/g, "_")}.${format === "html" ? "html" : format === "json" ? "json" : "md"}`,
      content: exportedContent,
      docId: doc.id,
      isApproved: doc.isApproved,
      approvedBy: doc.approvedBy,
      redactionSummary: doc.redactionSummary,
    });
  } catch (error) {
    console.error("POST /api/concepts/[id]/derive/[docId]/export error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
