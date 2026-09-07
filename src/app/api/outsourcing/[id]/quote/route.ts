import { NextRequest, NextResponse } from "next/server";
import { OutsourcingStore, OutsourcingService } from "@/lib/outsourcing/outsourcing-service";
import { ReceivedQuote, EvaluateQuoteInput } from "@/types/outsourcing";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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

    // Mode 1: Evaluate an existing quote
    if (body.action === "EVALUATE") {
      const evalInput: EvaluateQuoteInput = {
        quoteId: body.quoteId,
        techScore: body.techScore,
        priceScore: body.priceScore,
        scheduleScore: body.scheduleScore,
        managementScore: body.managementScore,
        evaluationNotes: body.evaluationNotes,
        evaluator: body.evaluator || "평가위원",
      };

      const evaluatedPkg = OutsourcingService.evaluateQuote(pkg, evalInput);
      store.save(evaluatedPkg);

      return NextResponse.json({
        success: true,
        data: evaluatedPkg,
        message: "견적 평가가 등록되었습니다.",
      });
    }

    // Mode 2: Submit a received quote from a vendor
    const newQuote: ReceivedQuote = {
      id: crypto.randomUUID(),
      vendorId: body.vendorId,
      vendorName: body.vendorName,
      quoteAmount: Number(body.quoteAmount),
      leadTimeWeeks: Number(body.leadTimeWeeks),
      submittedAt: new Date().toISOString(),
      notes: body.notes || "",
      complianceToSpec: body.complianceToSpec !== false,
    };

    pkg.receivedQuotes.push(newQuote);
    pkg.status = "SOURCING";
    pkg.updatedAt = new Date().toISOString();
    store.save(pkg);

    return NextResponse.json({
      success: true,
      data: pkg,
      message: `${newQuote.vendorName} 사의 견적서가 접수되었습니다.`,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/outsourcing/[id]/quote error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
