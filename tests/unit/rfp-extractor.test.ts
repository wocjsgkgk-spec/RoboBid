import { describe, it, expect } from "vitest";
import { RfpExtractor } from "@/lib/documents/rfp-extractor";
import { RfpSection } from "@/types/document";

describe("RFP Requirement Extractor & Traceability Engine", () => {
  const sampleSections: RfpSection[] = [
    {
      id: "sec-1",
      title: "제2장 신청 및 지원자격",
      content:
        "신청 대상 기업은 공고일 기준 업력 7년 이내의 로봇 분야 중소기업이어야 한다. 부도 또는 파산 상태의 기업은 참여가 제한된다.",
      level: 1,
      pageNumber: 3,
    },
    {
      id: "sec-2",
      title: "제3장 과업지시 및 기술요구사항",
      content:
        "본 과업의 이동로봇은 ROS2 기반 미들웨어 통신을 지원하여야 한다. 장애물 감지용 라이다 센서는 360도 전방위 감지 기능을 갖추어야 함.",
      level: 1,
      pageNumber: 8,
    },
    {
      id: "sec-3",
      title: "제5장 제출서류 안내",
      content:
        "신청 기업은 사업계획서 원본 및 사업자등록증 사본을 반드시 마감시간 이전에 온라인 제출하여야 한다.",
      level: 1,
      pageNumber: 14,
    },
  ];

  it("should extract requirements grouped by category with mandatory flags", () => {
    const candidates = RfpExtractor.extractRequirements(sampleSections, "");

    expect(candidates.length).toBeGreaterThanOrEqual(3);

    // Check Eligibility
    const elg = candidates.find((c) => c.category === "ELIGIBILITY");
    expect(elg).toBeDefined();
    expect(elg?.reqCode).toMatch(/^REQ-ELG-\d{3}$/);
    expect(elg?.description).toContain("업력 7년 이내");
    expect(elg?.isMandatory).toBe(true);

    // Check Technical
    const tec = candidates.find((c) => c.category === "TECHNICAL");
    expect(tec).toBeDefined();
    expect(tec?.reqCode).toMatch(/^REQ-TEC-\d{3}$/);
    expect(tec?.description).toContain("ROS2 기반");
    expect(tec?.isMandatory).toBe(true);

    // Check Submission
    const sub = candidates.find((c) => c.category === "SUBMISSION");
    expect(sub).toBeDefined();
    expect(sub?.reqCode).toMatch(/^REQ-SUB-\d{3}$/);
  });

  it("should guarantee 100% citation traceability back to the source section and page", () => {
    const candidates = RfpExtractor.extractRequirements(sampleSections, "");

    for (const c of candidates) {
      expect(c.citationSection).toBeDefined();
      expect(c.citationPage).toBeGreaterThan(0);
      expect(c.citationQuote.length).toBeGreaterThan(5);
      // Citation quote must actually exist in sample sections
      const exists = sampleSections.some((s) => s.content.includes(c.citationQuote));
      expect(exists).toBe(true);
    }
  });
});
