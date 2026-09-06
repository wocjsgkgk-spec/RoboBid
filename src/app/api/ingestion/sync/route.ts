import { NextRequest, NextResponse } from "next/server";
import { IngestionSyncEngine, SyncRunResult } from "@/lib/ingestion/sync-engine";
import { notificationService } from "@/lib/notifications/notification-service";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sources: string[] = Array.isArray(body.sources) && body.sources.length > 0
      ? body.sources
      : body.providerId
      ? [body.providerId]
      : ["koneps", "bizinfo"];
    const keyword = (body.keyword as string) || "로봇";
    const fallbackToMock = body.fallbackToMock !== undefined ? Boolean(body.fallbackToMock) : false;

    const engine = new IngestionSyncEngine();
    const results: SyncRunResult[] = [];
    let totalUpsertedCount = 0;
    const allNormalizedItems: any[] = [];

    for (const providerId of sources) {
      const result = await engine.syncProvider(providerId, [], { keyword, fallbackToMock });
      results.push(result);

      if (result.items && result.items.length > 0) {
        allNormalizedItems.push(...result.items);
        // Persist to in-memory opportunityStore
        const mappedForStore = result.items.map((item) => ({
          sourceId: item.sourceId,
          title: item.title,
          announcingAgency: item.announcingAgency,
          demandingAgency: item.demandingAgency,
          bidType: item.bidType,
          primaryDomain: item.primaryDomain,
          allocatedBudget: item.allocatedBudget,
          estimatedPrice: item.estimatedPrice,
          postedAt: item.postedAt,
          submissionDeadline: item.submissionDeadline,
          canonicalUrl: item.canonicalUrl,
          providerId,
        }));
        const upserted = opportunityStore.upsertFromApi(mappedForStore);
        totalUpsertedCount += upserted.length;
      }
    }

    // Send telegram & in-app notification if items were collected
    if (allNormalizedItems.length > 0) {
      const topItem = allNormalizedItems[0];
      const count = allNormalizedItems.length;
      try {
        await notificationService.sendNotification({
          organizationId: "org-robobid-default",
          type: "HIGH_FIT_OPPORTUNITY",
          severity: "NORMAL",
          channels: ["IN_APP", "TELEGRAM"],
          title: `[신규 공모 수집] ${topItem.title}`,
          message: `키워드 '${keyword}' 관련 공모 ${count}건(채널: ${sources.join(", ")})이 실시간 수집되었습니다.\n\n🏛️ 발주기관: ${topItem.announcingAgency}\n💰 배정예산: ${(topItem.allocatedBudget || 0).toLocaleString()}원\n📅 접수마감: ${topItem.submissionDeadline || "공고문 참조"}\n\n지금 바로 RoboBid AI에서 공모 적합도 분석을 시작하세요.`,
          linkUrl: topItem.canonicalUrl || "http://localhost:3005/opportunities",
          targetId: `sync-${sources.join("-")}-${Date.now()}`,
          metadata: {
            agency: topItem.announcingAgency,
            totalCount: count,
            keyword,
            sources,
          },
        });
      } catch (notifErr) {
        console.error("Failed to send sync notification:", notifErr);
      }
    }

    const anySuccess = results.some((r) => r.status === "CONNECTED");

    return NextResponse.json({
      success: anySuccess,
      sources,
      keyword,
      totalReceived: results.reduce((acc, r) => acc + r.recordsReceived, 0),
      totalUpserted: totalUpsertedCount,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

