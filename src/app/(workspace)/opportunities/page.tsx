import React from "react";
import { Search, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function OpportunitiesPage() {
  const STATUS_TABS = [
    { label: "전체", count: 0 },
    { label: "신규/추천", count: 0 },
    { label: "검토중", count: 0 },
    { label: "GO", count: 0 },
    { label: "HOLD", count: 0 },
    { label: "NO-GO", count: 0 },
    { label: "제안중", count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            공모 파이프라인 (Opportunities)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            조달청, K-Startup, 기업마당 등에서 수집된 공공 공모사업 목록과 자격·기회점수를 확인합니다.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-card p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="공고명, 수요기관, 핵심 키워드(로봇, AMR, 드론, 센서 등) 검색..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            disabled
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <Filter className="h-4 w-4" />
            <span>상세 필터</span>
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b pb-2">
        {STATUS_TABS.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              idx === 0
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Opportunities Table / Empty State */}
      <div className="rounded-lg border bg-card shadow-sm">
        <EmptyState
          icon={Layers}
          title="등록된 공모가 없습니다"
          description="Phase 2에서 Provider 동기화가 활성화되면 실시간 수집된 공고가 표시됩니다. (운영 DB에 임의 Fake 공고를 생성하지 않습니다)"
        />
      </div>
    </div>
  );
}
