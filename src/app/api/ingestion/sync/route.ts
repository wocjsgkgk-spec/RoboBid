import { NextRequest, NextResponse } from "next/server";
import { IngestionSyncEngine } from "@/lib/ingestion/sync-engine";
import { notificationService } from "@/lib/notifications/notification-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const providerId = (body.providerId as string) || "koneps";
    const keyword = (body.keyword as string) || "로봇";
    const fallbackToMock = body.fallbackToMock !== undefined ? Boolean(body.fallbackToMock) : true;

    const engine = new IngestionSyncEngine();

    if (providerId) {
      const result = await engine.syncProvider(providerId, [], { keyword, fallbackToMock });

      // 신규 공모 발견/동기화 시 텔레그램 및 인앱 알림 실시간 자동 발송
      if (result.status === "CONNECTED" && result.items && result.items.length > 0) {
        const topItem = result.items[0];
        const count = result.items.length;
        try {
          await notificationService.sendNotification({
            organizationId: "org-robobid-default",
            type: "HIGH_FIT_OPPORTUNITY",
            severity: "NORMAL",
            channels: ["IN_APP", "TELEGRAM"],
            title: `[신규 공모 수집] ${topItem.title}`,
            message: `키워드 '${keyword}' 관련 공모 ${count}건이 실시간 수집되었습니다.\n\n🏛️ 발주기관: ${topItem.announcingAgency}\n💰 배정예산: ${(topItem.allocatedBudget || 0).toLocaleString()}원\n📅 접수마감: ${topItem.submissionDeadline || "공고문 참조"}\n\n지금 바로 RoboBid AI에서 공모 적합도 분석을 시작하세요.`,
            linkUrl: topItem.canonicalUrl || "http://localhost:3005/opportunities",
            targetId: `sync-${providerId}-${Date.now()}`,
            metadata: {
              agency: topItem.announcingAgency,
              totalCount: count,
              keyword,
            },
          });
        } catch (notifErr) {
          console.error("Failed to send sync notification:", notifErr);
        }
      }

      return NextResponse.json({
        success: result.status === "CONNECTED",
        result,
      });
    }

    const results = await engine.syncAll();
    return NextResponse.json({
      success: true,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
