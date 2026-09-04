import React from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProposalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            제안서 워크스페이스 (Proposals)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            GO 결정이 완료된 공모의 RFP 요구사항 분석, 사업계획서 초안 작성 및 컴플라이언스 검증을 진행합니다.
          </p>
        </div>
        <Button size="sm" className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          <span>새 제안서 작성</span>
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <EmptyState
          icon={FileSpreadsheet}
          title="작성 중인 제안서가 없습니다"
          description="공모 파이프라인에서 'GO' 의사결정이 승인되면 자동으로 전용 제안서 워크스페이스가 생성됩니다."
        />
      </div>
    </div>
  );
}
