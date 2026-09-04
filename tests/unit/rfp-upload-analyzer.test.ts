import { describe, it, expect } from "vitest";
import { DocumentIngestionPipeline } from "@/lib/documents/pipeline";
import { RfpExtractor } from "@/lib/documents/rfp-extractor";
import { RfpSection } from "@/types/document";

describe("RfpUploadAnalyzer & Pipeline (RFP 첨부문서 파서)", () => {
  it("RFP 섹션에서 기술요구 및 제출서류 요구사항을 정확히 추출해야 한다", () => {
    const sampleSections: RfpSection[] = [
      {
        id: "sec-1",
        title: "제3장 기술요구사항",
        content:
          "본 과업의 이동로봇은 ROS2 기반 미들웨어 통신을 지원하여야 한다. 최대 적재하중 1,500kg 이상을 충족해야 함.",
        level: 1,
        pageNumber: 5,
      },
      {
        id: "sec-2",
        title: "제5장 제출서류 안내",
        content:
          "신청 기업은 사업계획서 원본 및 사업자등록증 사본을 반드시 마감시간 이전에 온라인 제출하여야 한다.",
        level: 1,
        pageNumber: 12,
      },
    ];

    const candidates = RfpExtractor.extractRequirements(sampleSections, "");

    expect(candidates.length).toBeGreaterThanOrEqual(2);

    const tec = candidates.find((c) => c.category === "TECHNICAL");
    expect(tec).toBeDefined();
    expect(tec?.isMandatory).toBe(true);

    const sub = candidates.find((c) => c.category === "SUBMISSION");
    expect(sub).toBeDefined();
  });

  it("텍스트 파일 파이프라인 처리 시 보안 검증을 통과하고 PARSED 상태를 반환해야 한다", async () => {
    const rawContent = `
[공고문] 2026 로봇 구매 입찰 공고
배정예산: 500,000,000원
납품기한: 계약 후 90일 이내
    `.trim();

    const buffer = Buffer.from(rawContent, "utf-8");
    const result = await DocumentIngestionPipeline.process(buffer, "sample_notice.txt");

    expect(result.parseStatus).toBe("PARSED");
    expect(result.rawText.length).toBeGreaterThan(20);
    expect(result.sections.length).toBeGreaterThanOrEqual(1);
  });
});
