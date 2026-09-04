import { describe, it, expect } from "vitest";
import { Deduplicator, ExistingOpportunitySummary } from "@/lib/ingestion/deduplicator";
import { NormalizedOpportunityPayload } from "@/lib/providers/types";

describe("Deduplication & Amendment Detection Engine", () => {
  const existingList: ExistingOpportunitySummary[] = [
    {
      id: "opp-001",
      providerId: "koneps",
      sourceId: "20260901001-00",
      title: "2026년 공공 배송로봇 실증사업 공고",
      announcingAgency: "한국로봇산업진흥원",
      postedAt: "2026-09-01T09:00:00.000Z",
      submissionDeadline: "2026-09-20T18:00:00.000Z",
      canonicalUrl: "https://www.g2b.go.kr/notice/1",
      contentHash: Deduplicator.computeHash({ id: "1", deadline: "2026-09-20" }),
      currentVersion: 1,
    },
  ];

  it("should detect exact duplicate by provider and source_id", () => {
    const candidate: NormalizedOpportunityPayload = {
      sourceId: "20260901001-00",
      title: "2026년 공공 배송로봇 실증사업 공고",
      announcingAgency: "한국로봇산업진흥원",
      bidType: "DEMONSTRATION",
      primaryDomain: "ROBOT",
      postedAt: "2026-09-01T09:00:00.000Z",
      submissionDeadline: "2026-09-20T18:00:00.000Z",
      canonicalUrl: "https://www.g2b.go.kr/notice/1",
      rawPayload: { id: "1", deadline: "2026-09-20" },
      attachments: [],
    };

    const result = Deduplicator.evaluate(candidate, "koneps", existingList);
    expect(result.isDuplicate).toBe(true);
    expect(result.isAmendment).toBe(false);
    expect(result.matchedBy).toBe("source_id");
  });

  it("should detect amendment when payload/deadline changes for the same source_id", () => {
    const amendedCandidate: NormalizedOpportunityPayload = {
      sourceId: "20260901001-00",
      title: "[정정공고] 2026년 공공 배송로봇 실증사업 공고",
      announcingAgency: "한국로봇산업진흥원",
      bidType: "DEMONSTRATION",
      primaryDomain: "ROBOT",
      postedAt: "2026-09-01T09:00:00.000Z",
      submissionDeadline: "2026-09-25T18:00:00.000Z", // 마감 연장
      canonicalUrl: "https://www.g2b.go.kr/notice/1",
      rawPayload: { id: "1", deadline: "2026-09-25" }, // 해시 변경됨
      attachments: [],
    };

    const result = Deduplicator.evaluate(amendedCandidate, "koneps", existingList);
    expect(result.isDuplicate).toBe(false);
    expect(result.isAmendment).toBe(true);
    expect(result.existingOpportunityId).toBe("opp-001");
  });

  it("should detect duplicate by normalized title and agency when source IDs differ across sources", () => {
    const crossPlatformCandidate: NormalizedOpportunityPayload = {
      sourceId: "KSTARTUP-888",
      title: "[긴급] 2026년 공공 배송 로봇 실증사업 공고", // bracket and spacing differs
      announcingAgency: "한국로봇산업진흥원",
      bidType: "DEMONSTRATION",
      primaryDomain: "ROBOT",
      postedAt: "2026-09-01T09:00:00.000Z",
      submissionDeadline: "2026-09-20T18:00:00.000Z",
      rawPayload: { different_key: "value" },
      attachments: [],
    };

    const result = Deduplicator.evaluate(crossPlatformCandidate, "k_startup", existingList);
    expect(result.isDuplicate).toBe(true);
    expect(result.matchedBy).toBe("title_agency_dates");
  });

  it("should classify a completely new opportunity as non-duplicate", () => {
    const brandNew: NormalizedOpportunityPayload = {
      sourceId: "20260902999-00",
      title: "스마트팩토리 무인이송로봇 AGV 도입 사업",
      announcingAgency: "중소벤처기업진흥공단",
      bidType: "PROCUREMENT",
      primaryDomain: "ROBOT",
      postedAt: "2026-09-02T09:00:00.000Z",
      submissionDeadline: "2026-09-30T18:00:00.000Z",
      rawPayload: { new_item: true },
      attachments: [],
    };

    const result = Deduplicator.evaluate(brandNew, "koneps", existingList);
    expect(result.isDuplicate).toBe(false);
    expect(result.isAmendment).toBe(false);
  });
});
