import { NextRequest, NextResponse } from "next/server";
import { DocumentIngestionPipeline } from "@/lib/documents/pipeline";
import { LLMClient } from "@/lib/ai/llm-client";

async function runAiDeepAnalysis(rawText: string) {
  const llm = LLMClient.getInstance();
  if (llm.getActiveProvider() === "mock" || rawText.trim().length < 50) {
    return null;
  }

  try {
    const prompt = `대한민국 공공입찰 제안요청서(RFP) 심사 수석위원으로서 다음 공고문/RFP 원문을 정밀 분석하고, JSON 형태로 요약 및 위험 요소를 진단해주세요.
[RFP 본문 발췌]:
${rawText.slice(0, 4000)}

반드시 다음 JSON 형식으로만 응답하세요:
{
  "summary": "사업의 목적 및 핵심 과업 내용 2~3줄 요약",
  "keyRequirements": ["핵심 기술/기능 요구사항 3~5개 목록"],
  "riskClauses": ["독소조항, 지체상금, 위약벌, 실격 기준 등 입찰 위험요소 2~4개 목록"],
  "recommendedStrategy": "수주 경쟁력을 확보하기 위한 차별화 제안 전략",
  "estimatedDifficulty": "LOW" | "MEDIUM" | "HIGH"
}`;

    const res = await llm.generate({
      messages: [
        {
          role: "system",
          content: "대한민국 공공조달 및 국가 R&D 제안요청서(RFP) 감사 전문가입니다. JSON으로 응답합니다.",
        },
        { role: "user", content: prompt },
      ],
      responseFormat: "json",
      temperature: 0.3,
    });

    return JSON.parse(res.text);
  } catch (err: any) {
    console.warn("[/api/documents/parse-rfp] AI Deep Analysis skipped:", err.message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const enableAi = formData.get("enableAi") !== "false";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "파일이 첨부되지 않았습니다." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result: any = await DocumentIngestionPipeline.process(buffer, file.name);

      if (enableAi && result.parseStatus === "PARSED" && result.rawText) {
        result.aiAnalysis = await runAiDeepAnalysis(result.rawText);
      }

      return NextResponse.json({
        success: result.parseStatus === "PARSED",
        result,
      });
    }

    // JSON body fallback (Base64 file or rawText)
    const body = await req.json();
    const enableAi = body.enableAi !== false;

    if (body.base64 && body.fileName) {
      const buffer = Buffer.from(body.base64, "base64");
      const result: any = await DocumentIngestionPipeline.process(buffer, body.fileName);
      if (enableAi && result.parseStatus === "PARSED" && result.rawText) {
        result.aiAnalysis = await runAiDeepAnalysis(result.rawText);
      }
      return NextResponse.json({
        success: result.parseStatus === "PARSED",
        result,
      });
    } else if (body.rawText) {
      // Direct rawText analysis
      const buffer = Buffer.from(body.rawText, "utf-8");
      const result: any = await DocumentIngestionPipeline.process(buffer, body.fileName || "rfp_input.txt");
      if (enableAi && result.rawText) {
        result.aiAnalysis = await runAiDeepAnalysis(result.rawText);
      }
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
