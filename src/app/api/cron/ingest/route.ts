import { NextRequest, NextResponse } from "next/server";
import { IngestionSyncEngine, SyncRunResult } from "@/lib/ingestion/sync-engine";
import { notificationService } from "@/lib/notifications/notification-service";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";

export const dynamic = "force-dynamic";

/**
 * RoboBid AI — Automated Ingestion Cron Endpoint
 * Scheduled via vercel.json (0 6,18 * * *) or external scheduler.
 * Supports both GET and POST requests.
 */
export async function GET(req: NextRequest) {
  return handleCronIngest(req);
}

export async function POST(req: NextRequest) {
  return handleCronIngest(req);
}

async function handleCronIngest(req: NextRequest) {
  try {
    // Check optional bearer token authorization if CRON_SECRET is configured
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keyword = req.nextUrl.searchParams.get("keyword") || "로봇";
    const sources = ["bizinfo", "koneps"];
    const engine = new IngestionSyncEngine();
    const results: SyncRunResult[] = [];
    let totalUpsertedCount = 0;
    const allNormalizedItems: any[] = [];

    for (const providerId of sources) {
      const result = await engine.syncProvider(providerId, [], { keyword, fallbackToMock: false });
      results.push(result);

      if (result.items && result.items.length > 0) {
        allNormalizedItems.push(...result.items);
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

    // Trigger Telegram & In-App Notification if items were collected
    if (allNormalizedItems.length > 0) {
      const topItem = allNormalizedItems[0];
      const count = allNormalizedItems.length;
      try {
        await notificationService.sendNotification({
          organizationId: "org-robobid-default",
          type: "HIGH_FIT_OPPORTUNITY",
          severity: "NORMAL",
          channels: ["IN_APP", "TELEGRAM"],
          title: `[정기 자동 수집] ${topItem.title}`,
          message: `[RoboBid Cron] 키워드 '${keyword}' 관련 공모 ${count}건이 자동 수집되었습니다.\n\n🏛️ 발주기관: ${topItem.announcingAgency}\n💰 배정예산: ${(topItem.allocatedBudget || 0).toLocaleString()}원\n📅 접수마감: ${topItem.submissionDeadline || "공고문 참조"}\n\n시스템에 저장되어 공모 목록에서 확인 가능합니다.`,
          linkUrl: topItem.canonicalUrl || "/opportunities",
          targetId: `cron-sync-${Date.now()}`,
          metadata: {
            agency: topItem.announcingAgency,
            totalCount: count,
            keyword,
            sources,
            triggeredAt: new Date().toISOString(),
          },
        });
      } catch (notifErr) {
        console.error("Cron notification error:", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      keyword,
      sources,
      totalReceived: results.reduce((acc, r) => acc + r.recordsReceived, 0),
      totalUpserted: totalUpsertedCount,
      results: results.map((r) => ({
        providerId: r.providerId,
        status: r.status,
        recordsReceived: r.recordsReceived,
        durationMs: r.durationMs,
      })),
    });
  } catch (err: any) {
    console.error("Cron Ingest Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
