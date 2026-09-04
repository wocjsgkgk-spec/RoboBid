import { describe, it, expect, beforeEach } from "vitest";
import { IngestionSyncEngine } from "./sync-engine";
import { opportunityStore } from "../opportunities/opportunity-store";

describe("KONEPS Live Sync & Store Ingestion (나라장터 실시간 수집 및 스토어 적재)", () => {
  beforeEach(() => {
    opportunityStore.seedDefault();
  });

  it("IngestionSyncEngine이 KONEPS 공고를 수집하고 정규화된 목록을 반환한다", async () => {
    const engine = new IngestionSyncEngine();
    const result = await engine.syncProvider("koneps", [], {
      keyword: "로봇",
      fallbackToMock: true,
    });

    expect(result.status).toBe("CONNECTED");
    expect(result.recordsReceived).toBeGreaterThan(0);
    expect(result.items).toBeDefined();
    expect(result.items?.length).toBeGreaterThan(0);

    const firstItem = result.items![0];
    expect(firstItem.title).toContain("로봇");
    expect(firstItem.primaryDomain).toBe("ROBOT");
    expect(firstItem.bidType).toBeDefined();
  });

  it("opportunityStore.upsertFromApi를 통해 수집된 공고가 API 데이터소스로 정상 적재된다", async () => {
    const engine = new IngestionSyncEngine();
    const result = await engine.syncProvider("koneps", [], {
      keyword: "로봇",
      fallbackToMock: true,
    });

    const initialCount = opportunityStore.count();
    const upserted = opportunityStore.upsertFromApi(result.items || []);

    expect(upserted.length).toBeGreaterThan(0);
    expect(opportunityStore.count()).toBe(initialCount + upserted.length);

    const apiOpps = opportunityStore.getAll().filter((o) => o.dataSource === "API");
    expect(apiOpps.length).toBe(upserted.length);

    const sample = apiOpps[0];
    expect(sample.providerId).toBe("koneps");
    expect(sample.status).toBe("INBOX");
    expect(sample.dataSource).toBe("API");
  });

  it("동일한 sourceId를 가진 공고를 다시 수집하면 신규 추가되지 않고 버전이 업데이트된다", () => {
    const mockPayload = {
      sourceId: "KONEPS-TEST-001-00",
      title: "2026 자율주행 테스트 공고",
      announcingAgency: "조달청",
      bidType: "SERVICE" as const,
      primaryDomain: "ROBOT",
      allocatedBudget: 300000000,
      submissionDeadline: new Date(Date.now() + 864000000).toISOString(),
    };

    // 1차 적재
    const firstBatch = opportunityStore.upsertFromApi([mockPayload]);
    expect(firstBatch.length).toBe(1);
    expect(firstBatch[0].currentVersion).toBe(1);
    const countAfterFirst = opportunityStore.count();

    // 2차 적재 (동일 sourceId, 예산 변경)
    const secondBatch = opportunityStore.upsertFromApi([
      {
        ...mockPayload,
        allocatedBudget: 350000000,
      },
    ]);

    expect(secondBatch.length).toBe(1);
    expect(secondBatch[0].currentVersion).toBe(2);
    expect(secondBatch[0].allocatedBudget).toBe(350000000);
    expect(opportunityStore.count()).toBe(countAfterFirst); // 갯수 증가 없음
  });
});
