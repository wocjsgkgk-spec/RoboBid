import { NextRequest, NextResponse } from "next/server";
import { IngestionSyncEngine } from "@/lib/ingestion/sync-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const providerId = body.providerId as string | undefined;
    const keyword = body.keyword as string | undefined;

    const engine = new IngestionSyncEngine();

    if (providerId) {
      const result = await engine.syncProvider(providerId, [], { keyword });
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
