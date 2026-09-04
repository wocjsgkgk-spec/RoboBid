import React from "react";
import { Bot, Sparkles, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              RoboBid AI 어시스턴트
            </h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Evidence-First</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            공모 요약, 자격 요건 판정, 기회 점수 근거 설명 및 제안서 초안 작성을 지원하는 특화 AI 엔진입니다.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <EmptyState
          icon={Bot}
          title="활성화된 AI 분석 세션이 없습니다"
          description="공모 상세 화면에서 [RoboBid AI 심층 분석]을 실행하거나 제안서 워크스페이스에서 초안 생성을 요청할 수 있습니다."
        />
      </div>

      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong className="font-semibold">AI 판단 투명성 원칙:</strong> RoboBid AI의 모든 기회 점수 및 자격 판정은 원문 RFP 문장 인용(Citation)과 사내 보유 역량 매칭 데이터에 기반하며, 근거 없는 임의 판정이나 환각(Hallucination)은 배제됩니다.
        </div>
      </div>
    </div>
  );
}
