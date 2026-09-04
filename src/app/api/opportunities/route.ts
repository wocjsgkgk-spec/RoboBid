import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const provider = searchParams.get("provider") || "";
  const bidType = searchParams.get("bidType") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  // Phase 2: In Supabase connected environment, query opportunities table
  // Here we return structured empty or populated results adhering to Zero Fake Data rule
  return NextResponse.json({
    opportunities: [],
    totalCount: 0,
    page,
    limit,
    filters: {
      search,
      provider,
      bidType,
    },
  });
}
