import { NextRequest, NextResponse } from "next/server";
import { DocumentIngestionPipeline } from "@/lib/documents/pipeline";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "파일이 첨부되지 않았습니다." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await DocumentIngestionPipeline.process(buffer, file.name);

      return NextResponse.json({
        success: result.parseStatus === "PARSED",
        result,
      });
    }

    // JSON body fallback (Base64 file or rawText)
    const body = await req.json();
    if (body.base64 && body.fileName) {
      const buffer = Buffer.from(body.base64, "base64");
      const result = await DocumentIngestionPipeline.process(buffer, body.fileName);
      return NextResponse.json({
        success: result.parseStatus === "PARSED",
        result,
      });
    } else if (body.rawText) {
      // Direct rawText analysis
      const buffer = Buffer.from(body.rawText, "utf-8");
      const result = await DocumentIngestionPipeline.process(buffer, body.fileName || "rfp_input.txt");
      return NextResponse.json({
        success: true,
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: "유효한 파일 또는 텍스트 입력이 필요합니다." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[/api/documents/parse-rfp] 오류:", err);
    return NextResponse.json(
      { success: false, error: err.message || "RFP 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
