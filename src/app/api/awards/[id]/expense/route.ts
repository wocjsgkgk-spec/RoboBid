import { NextRequest, NextResponse } from "next/server";
import { AwardStore } from "@/lib/award/award-store";
import { AwardTransitionService } from "@/lib/award/award-transition-service";
import { ProjectBudgetCategory } from "@/types/funding";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const store = AwardStore.getInstance();
    const project = store.getById(params.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "선정 개발 프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const category: ProjectBudgetCategory = body.category;
    const expenseAmount: number = Number(body.amount);

    if (!category || isNaN(expenseAmount) || expenseAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "유효한 비목(category)과 집행 금액(amount > 0)을 입력해주세요." },
        { status: 400 }
      );
    }

    const updated = AwardTransitionService.recordExpense(project, category, expenseAmount);
    store.save(updated);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `${category} 비목에서 ${expenseAmount.toLocaleString()}원이 집행 처리되었습니다.`,
    });
  } catch (error) {
    console.error("POST /api/awards/[id]/expense error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
