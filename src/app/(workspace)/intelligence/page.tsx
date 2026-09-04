import React from "react";
import { Database, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function IntelligencePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            자료·인텔리전스 (Company Capability Vault)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            회사의 보유기술, 제품, 특허, 인증, 수행실적, 인력역량을 안전하게 보관하고 RFP 매칭의 증빙(Evidence)으로 활용합니다.
          </p>
        </div>
        <Button size="sm" className="gap-2" disabled>
          <Upload className="h-4 w-4" />
          <span>역량 자료 등록</span>
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <EmptyState
          icon={Database}
          title="등록된 사내 역량 자산이 없습니다"
          description="Phase 4에서 Company Capability Vault가 구현되면 특허, 실적, 인증서 및 기술자료를 체계적으로 등록하고 관리할 수 있습니다."
        />
      </div>

      <div className="p-4 rounded-lg bg-muted/40 border flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">기밀 보호 정책 안내:</strong> 사내 역량 및 제안 실적 자료는 암호화되어 분리 보관되며, 데이터 학습을 진행하지 않는 전용 보안 파이프라인에서만 처리됩니다.
        </div>
      </div>
    </div>
  );
}
