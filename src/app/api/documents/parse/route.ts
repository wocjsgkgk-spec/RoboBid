import { NextRequest, NextResponse } from "next/server";
import { DocumentIngestionPipeline } from "@/lib/documents/pipeline";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "업로드할 파일이 전달되지 않았습니다." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await DocumentIngestionPipeline.process(buffer, file.name);

    return NextResponse.json({
      success: result.parseStatus === "PARSED" || result.parseStatus === "REVIEW_REQUIRED",
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
