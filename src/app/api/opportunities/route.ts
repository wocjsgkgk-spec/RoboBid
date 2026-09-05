import { NextRequest, NextResponse } from "next/server";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { notificationService } from "@/lib/notifications/notification-service";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const provider = searchParams.get("provider") || "ALL";
  const bidType = searchParams.get("bidType") || "ALL";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  let list = opportunityStore.getAll();

  if (search) {
    list = list.filter(
      (o) =>
        o.title.toLowerCase().includes(search) ||
        o.announcingAgency.toLowerCase().includes(search) ||
        (o.demandingAgency && o.demandingAgency.toLowerCase().includes(search))
    );
  }

  if (provider !== "ALL") {
    list = list.filter((o) => o.providerId.toLowerCase() === provider.toLowerCase());
  }

  if (bidType !== "ALL") {
    list = list.filter((o) => o.bidType === bidType);
  }

  const totalCount = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    opportunities: paginated,
    totalCount,
    page,
    limit,
    filters: {
      search,
      provider,
      bidType,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "SEED_DEFAULT") {
      opportunityStore.seedDefault();
      return NextResponse.json({
        success: true,
        opportunities: opportunityStore.getAll(),
        message: "표준 실전 공모 3종이 성공적으로 적재되었습니다.",
      });
    }

    if (body.action === "RECORD_DECISION") {
      const result = opportunityStore.recordDecision({
        opportunityId: body.opportunityId,
        organizationId: body.organizationId || "b0000000-0000-0000-0000-000000000001",
        userId: body.userId || "usr-current",
        userName: body.userName || "사업개발 담당자",
        decision: body.decision,
        reason: body.reason,
        conditions: body.conditions,
        scoreAtDecision: body.scoreAtDecision || 80,
      });

      // GO 결정 시 텔레그램 알림 자동 전송
      if (body.decision === "GO" && result.opportunity) {
        try {
          await notificationService.sendNotification({
            organizationId: body.organizationId || "org-robobid-default",
            type: "DECISION_REQUEST",
            severity: "NORMAL",
            channels: ["IN_APP", "TELEGRAM"],
            title: `[입찰 추진 확정 (GO)] ${result.opportunity.title}`,
            message: `사업개발팀에서 공모 입찰 추진(GO)을 확정하고 Bid Room을 활성화했습니다.\n\n🏛️ 발주처: ${result.opportunity.announcingAgency}\n💰 배정예산: ${(result.opportunity.allocatedBudget || 0).toLocaleString()}원\n사유: ${body.reason || "전략적 부합도 우수 및 수주 가능성 높음"}\n\n지금 바로 제안서 작성을 시작하세요.`,
            linkUrl: "http://localhost:3005/proposals",
            targetId: body.opportunityId,
            metadata: {
              agency: result.opportunity.announcingAgency,
              decision: "GO",
            },
          });
        } catch (e) {
          console.error("Failed to dispatch GO notification:", e);
        }
      }

      return NextResponse.json({
        success: true,
        decision: result.decision,
        opportunity: result.opportunity,
      });
    }

    if (body.action === "UPDATE_PRICE") {
      const opp = opportunityStore.getById(body.opportunityId);
      if (!opp) {
        return NextResponse.json({ success: false, error: "공고를 찾을 수 없습니다." }, { status: 404 });
      }
      opp.estimatedPrice = body.estimatedPrice;
      opp.updatedAt = new Date().toISOString();
      opportunityStore.save(opp);
      return NextResponse.json({ success: true, opportunity: opp });
    }

    if (body.opportunity) {
      const saved = opportunityStore.save(body.opportunity);

      // 신규 공모 등록 시 텔레그램 알림 자동 발송
      try {
        await notificationService.sendNotification({
          organizationId: "org-robobid-default",
          type: "HIGH_FIT_OPPORTUNITY",
          severity: "NORMAL",
          channels: ["IN_APP", "TELEGRAM"],
          title: `[공모 등록 알림] ${saved.title}`,
          message: `새로운 입찰·지원사업 공모가 등록되었습니다.\n\n🏛️ 발주기관: ${saved.announcingAgency}\n💰 배정예산: ${(saved.allocatedBudget || 0).toLocaleString()}원\n📅 접수마감: ${saved.submissionDeadline?.split("T")[0] || "공고문 참조"}\n\nRoboBid AI에서 즉시 적합도 및 RFP 요구사항을 분석하세요.`,
          linkUrl: saved.canonicalUrl || "http://localhost:3005/opportunities",
          targetId: saved.id,
          metadata: {
            agency: saved.announcingAgency,
            score: (saved as any).fitScore || (saved as any).technicalFitScore || 80,
          },
        });
      } catch (e) {
        console.error("Failed to dispatch opportunity notification:", e);
      }

      return NextResponse.json({
        success: true,
        opportunity: saved,
      });
    }

    return NextResponse.json({ error: "Invalid action or payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
