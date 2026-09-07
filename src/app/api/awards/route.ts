import { NextRequest, NextResponse } from "next/server";
import { AwardStore } from "@/lib/award/award-store";
import { AwardTransitionService } from "@/lib/award/award-transition-service";
import { AwardTransitionInput } from "@/types/award";

export async function GET() {
  try {
    const store = AwardStore.getInstance();
    const projects = store.getAll();
    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("GET /api/awards error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: AwardTransitionInput = await req.json();

    if (!body.opportunityId) {
      return NextResponse.json(
        { success: false, error: "선정된 공고 식별자(opportunityId)는 필수입니다." },
        { status: 400 }
      );
    }

    const project = AwardTransitionService.transitionToDevelopmentProject(body);
    const store = AwardStore.getInstance();
    store.save(project);

    return NextResponse.json({
      success: true,
      data: project,
      message: "선정 공고가 성공적으로 개발 프로젝트로 전환되었습니다.",
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/awards error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const store = AwardStore.getInstance();
    store.clear();
    return NextResponse.json({
      success: true,
      message: "모든 선정 개발 프로젝트가 초기화되었습니다.",
    });
  } catch (error) {
    console.error("DELETE /api/awards error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
