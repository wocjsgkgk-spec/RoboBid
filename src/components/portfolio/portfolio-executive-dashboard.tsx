"use client";

import React from "react";
import { ExecutivePortfolioSummary } from "@/types/p1";
import { p1Store } from "@/lib/p1/p1-store";
import {
  Coins,
  TrendingUp,
  AlertTriangle,
  Clock,
  Briefcase,
  Users,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PortfolioExecutiveDashboard() {
  const summary = p1Store.getExecutivePortfolio();

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-primary" />
            총 수주 파이프라인 규모
          </div>
          <div className="text-2xl font-bold font-mono text-primary">
            {(summary.totalPipelineBudget / 100000000).toFixed(1)}억원
          </div>
          <p className="text-[10px] text-muted-foreground">현재 진행 중인 8개 사업 예산 합계</p>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            활성 수주 프로젝트
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {summary.activeBidsCount}개 사업
          </div>
          <p className="text-[10px] text-muted-foreground">GO 승인 후 작성 및 검토 중</p>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            D-14 접수 마감 임박
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {summary.d14UrgentCount}건
          </div>
          <p className="text-[10px] text-muted-foreground">2주 이내 최종 제출 집중 통제</p>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            집중 관리 고위험 사업
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">
            {summary.highRiskCount}건
          </div>
          <p className="text-[10px] text-muted-foreground">인증 지연 또는 서류 보강 필요</p>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            제출 준비 완료율
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {summary.proposalReadyCount}/{summary.activeBidsCount}
          </div>
          <p className="text-[10px] text-muted-foreground">품질 게이트 80점 이상 충족</p>
        </div>
      </div>

      {/* 2. Pipeline Funnel Breakdown */}
      <Card className="border shadow-sm bg-card">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                전사 수주 파이프라인 퍼널 (Enterprise Bid Funnel)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                발견부터 1차 관심, 자격 검증, 기술/사업성 평가, GO 확정, 최종 제출까지의 전사 현황
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              실시간 집계
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="text-[10px] text-muted-foreground font-semibold">1. 발견 (Inbox)</div>
              <div className="text-xl font-bold font-mono">{summary.pipelineBreakdown.DISCOVERY}건</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="text-[10px] text-muted-foreground font-semibold">2. 1차 관심</div>
              <div className="text-xl font-bold font-mono">{summary.pipelineBreakdown.INITIAL_INTEREST}건</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="text-[10px] text-muted-foreground font-semibold">3. 자격 검토</div>
              <div className="text-xl font-bold font-mono">{summary.pipelineBreakdown.ELIGIBILITY_REVIEW}건</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="text-[10px] text-muted-foreground font-semibold">4. 기술 적합성</div>
              <div className="text-xl font-bold font-mono text-purple-600">{summary.pipelineBreakdown.TECH_EVALUATION}건</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="text-[10px] text-muted-foreground font-semibold">5. 사업성 검토</div>
              <div className="text-xl font-bold font-mono text-indigo-600">{summary.pipelineBreakdown.BUSINESS_EVALUATION}건</div>
            </div>
            <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30 space-y-1">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">6. GO 확정 (작성)</div>
              <div className="text-xl font-bold font-mono text-emerald-600">{summary.pipelineBreakdown.GO_CONFIRMED}건</div>
            </div>
            <div className="p-3 rounded-lg border bg-primary/10 border-primary/30 space-y-1">
              <div className="text-[10px] text-primary font-semibold">7. 최종 제출</div>
              <div className="text-xl font-bold font-mono text-primary">{summary.pipelineBreakdown.SUBMITTED}건</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. PM & Manager Workload Balancing */}
      <Card className="border shadow-sm bg-card">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            수주 PM 및 담당자별 리소스 부하 (Workload Allocation)
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            특정 담당자에게 긴급 공모 및 제안서 작성이 편중되지 않도록 리소스를 균형 분배합니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.managerWorkloads.map((m) => (
              <div
                key={m.managerName}
                className="p-3.5 rounded-xl border bg-card space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">
                    {m.managerName}
                  </span>
                  <Badge variant="outline" className="text-xs font-mono">
                    담당 {(m.totalBudget / 100000000).toFixed(1)}억원
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>진행 중인 사업:</span>
                    <strong className="text-foreground">{m.activeCount}건</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>D-14 긴급 마감 과제:</span>
                    <strong className={m.urgentCount > 1 ? "text-rose-600 font-bold" : "text-foreground"}>
                      {m.urgentCount}건
                    </strong>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      m.urgentCount > 1 ? "bg-rose-500" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, m.activeCount * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
