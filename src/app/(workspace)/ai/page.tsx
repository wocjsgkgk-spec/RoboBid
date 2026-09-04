"use client";

import React from "react";
import { Bot, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BidOpsCopilot } from "@/components/ai/bidops-copilot";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              RoboBid AI 어시스턴트 (BidOps Copilot)
            </h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Evidence-First RAG</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            국가계약법 사정율·A값 투찰가 자문, 적격심사 100점 가점 분석, RFP 조달 규정 준수 검토를 지원하는 특화 AI 엔진입니다.
          </p>
        </div>
      </div>

      {/* Interactive Copilot Chat Console */}
      <BidOpsCopilot />

      {/* Security & Audit Statement */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">AI 판단 신뢰성 및 RLS 통제:</strong> RoboBid AI의 모든 조달 조언과 점수 근거는 조달청 원문 법령 및 사내 역량(Vault) 데이터에 기반하여 투명하게 인용(Citation)되며, 검증되지 않은 데이터로 환각(Hallucination)을 생성하지 않습니다.
        </div>
      </div>
    </div>
  );
}
