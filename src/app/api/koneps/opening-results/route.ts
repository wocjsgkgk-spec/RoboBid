import { NextRequest, NextResponse } from "next/server";
import { konepsOpeningService } from "@/lib/providers/koneps-opening-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bidNtceNo = searchParams.get("bidNtceNo") || undefined;
    const bidNtceNm = searchParams.get("bidNtceNm") || undefined;
    const pageNo = searchParams.get("pageNo") ? parseInt(searchParams.get("pageNo")!, 10) : 1;
    const numOfRows = searchParams.get("numOfRows") ? parseInt(searchParams.get("numOfRows")!, 10) : 10;

    const data = await konepsOpeningService.fetchOpeningResults({
      bidNtceNo,
      bidNtceNm,
      pageNo,
      numOfRows,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ourBidPrice, openingResult } = body;

    if (ourBidPrice !== undefined && openingResult) {
      const analysis = konepsOpeningService.analyzeBidAccuracy(
        Number(ourBidPrice),
        openingResult
      );
      return NextResponse.json({
        success: true,
        analysis,
      });
    }

    const data = await konepsOpeningService.fetchOpeningResults(body);
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
