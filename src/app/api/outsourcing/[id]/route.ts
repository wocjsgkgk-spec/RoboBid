import { NextRequest, NextResponse } from "next/server";
import { OutsourcingStore, OutsourcingService } from "@/lib/outsourcing/outsourcing-service";
import { ApproveOutsourcingPackageInput } from "@/types/outsourcing";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const store = OutsourcingStore.getInstance();
    const pkg = store.getById(params.id);

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "외주 발주 패키지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    console.error("GET /api/outsourcing/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const store = OutsourcingStore.getInstance();
    const pkg = store.getById(params.id);

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "외주 발주 패키지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Mode 1: Human Approval Gate
    if (body.approve) {
      const approveInput: ApproveOutsourcingPackageInput = {
        approvedBy: body.approvedBy,
        approvalNotes: body.approvalNotes,
      };
      const approved = OutsourcingService.approvePackage(pkg, approveInput);
      store.save(approved);

      return NextResponse.json({
        success: true,
        data: approved,
        message: "외주 발주 패키지가 성공적으로 승인되었습니다.",
      });
    }

    // Mode 2: General updates (vendor list, status)
    if (body.status) pkg.status = body.status;
    if (body.candidateVendors) pkg.candidateVendors = body.candidateVendors;
    if (body.sowContent) pkg.sowContent = body.sowContent;
    if (body.acceptanceCriteria) pkg.acceptanceCriteria = body.acceptanceCriteria;

    pkg.updatedAt = new Date().toISOString();
    store.save(pkg);

    return NextResponse.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    console.error("PATCH /api/outsourcing/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const store = OutsourcingStore.getInstance();
    const deleted = store.delete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "외주 발주 패키지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "외주 발주 패키지가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("DELETE /api/outsourcing/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
