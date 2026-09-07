import { NextRequest, NextResponse } from "next/server";
import { AwardStore } from "@/lib/award/award-store";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const store = AwardStore.getInstance();
    const project = store.getById(params.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "선정 개발 프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("GET /api/awards/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
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

    if (body.status) {
      project.status = body.status;
    }
    if (body.agreement) {
      project.agreement = { ...project.agreement, ...body.agreement };
    }
    if (body.milestones) {
      project.milestones = body.milestones;
    }
    if (body.workItems) {
      project.workItems = body.workItems;
    }
    if (body.deliverables) {
      project.deliverables = body.deliverables;
    }

    project.updatedAt = new Date().toISOString();
    store.save(project);

    return NextResponse.json({
      success: true,
      data: project,
      message: "개발 프로젝트가 수정되었습니다.",
    });
  } catch (error) {
    console.error("PATCH /api/awards/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const store = AwardStore.getInstance();
    const deleted = store.delete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "삭제할 개발 프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "개발 프로젝트가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("DELETE /api/awards/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
