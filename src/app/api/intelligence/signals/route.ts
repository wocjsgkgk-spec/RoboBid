import { NextRequest, NextResponse } from "next/server";
import { EarlySignalStore } from "@/lib/intelligence/early-signal-store";
import { EarlySignalService } from "@/lib/intelligence/early-signal-service";
import { CreateEarlySignalInput } from "@/types/early-signal";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const store = EarlySignalStore.getInstance();
    let signals = store.getAll();

    if (activeOnly) {
      signals = store.getActiveSignals();
    }
    if (domain) {
      signals = signals.filter((s) => s.targetDomain.toLowerCase() === domain.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      data: signals,
      count: signals.length,
    });
  } catch (error) {
    console.error("GET /api/intelligence/signals error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode 1: Forecast calculation request
    if (body.action === "FORECAST") {
      const forecast = EarlySignalService.predictRecurringCalendar(
        body.agency || "",
        body.keywords || [],
        body.targetYear || 2027
      );
      return NextResponse.json({
        success: true,
        data: forecast,
      });
    }

    // Mode 2: Create new early signal
    const input: CreateEarlySignalInput = body;
    const store = EarlySignalStore.getInstance();
    const created = store.create(input);

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: "사전 신호가 성공적으로 등록되었습니다.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/intelligence/signals error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
