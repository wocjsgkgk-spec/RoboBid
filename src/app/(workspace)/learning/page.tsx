import React from "react";
import { TrendingUp, Award } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            성과·학습 (Outcome Learning)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            제출된 공모의 최종 선정 및 탈락 결과, 심사위원 평가의견을 축적하여 추천과 점수 모델의 정확도를 개선합니다.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <EmptyState
          icon={TrendingUp}
          title="축적된 입찰 결과 데이터가 없습니다"
          description="실제 사업계획서 제출 및 선정/탈락 결과가 기록된 이후, 통계적 승률 및 피드백 분석 보고서가 제공됩니다."
        />
      </div>
    </div>
  );
}
