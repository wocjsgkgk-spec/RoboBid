import { describe, it, expect } from "vitest";
import { Deduplicator, ExistingOpportunitySummary } from "@/lib/ingestion/deduplicator";
import { NormalizedOpportunityPayload } from "@/lib/providers/types";

describe("Ingestion Idempotency & Repeat Sync Test", () => {
  it("should insert on first run and deduplicate on second run with identical payload", () => {
    const rawBatch: NormalizedOpportunityPayload[] = [
      {
        sourceId: "KONEPS-101",
        title: "배송로봇 실증사업",
        announcingAgency: "한국로봇산업진흥원",
        bidType: "DEMONSTRATION",
        primaryDomain: "ROBOT",
        postedAt: "2026-09-01T09:00:00Z",
        submissionDeadline: "2026-09-20T18:00:00Z",
        canonicalUrl: "https://g2b.go.kr/101",
        rawPayload: { id: "101", title: "배송로봇 실증사업" },
        attachments: [],
      },
      {
        sourceId: "KONEPS-102",
        title: "스마트팩토리 AMR 도입",
        announcingAgency: "조달청",
        bidType: "PROCUREMENT",
        primaryDomain: "ROBOT",
        postedAt: "2026-09-01T09:00:00Z",
        submissionDeadline: "2026-09-22T18:00:00Z",
        canonicalUrl: "https://g2b.go.kr/102",
        rawPayload: { id: "102", title: "스마트팩토리 AMR 도입" },
        attachments: [],
      },
    ];

    const tracker: ExistingOpportunitySummary[] = [];

    // --- Run 1: First Ingestion ---
    let run1Inserted = 0;
    let run1Deduplicated = 0;

    for (const item of rawBatch) {
      const res = Deduplicator.evaluate(item, "koneps", tracker);
      if (res.isDuplicate) {
        run1Deduplicated++;
      } else {
        run1Inserted++;
        tracker.push({
          id: `opp-${item.sourceId}`,
          providerId: "koneps",
          sourceId: item.sourceId,
          title: item.title,
          announcingAgency: item.announcingAgency,
          postedAt: item.postedAt,
          submissionDeadline: item.submissionDeadline,
          canonicalUrl: item.canonicalUrl,
          contentHash: res.newContentHash,
          currentVersion: 1,
        });
      }
    }

    expect(run1Inserted).toBe(2);
    expect(run1Deduplicated).toBe(0);
    expect(tracker.length).toBe(2);

    // --- Run 2: Exact Repeat Ingestion ---
    let run2Inserted = 0;
    let run2Deduplicated = 0;

    for (const item of rawBatch) {
      const res = Deduplicator.evaluate(item, "koneps", tracker);
      if (res.isDuplicate) {
        run2Deduplicated++;
      } else {
        run2Inserted++;
      }
    }

    expect(run2Inserted).toBe(0);
    expect(run2Deduplicated).toBe(2);
    expect(tracker.length).toBe(2); // Total count unchanged, 100% idempotent
  });
});
