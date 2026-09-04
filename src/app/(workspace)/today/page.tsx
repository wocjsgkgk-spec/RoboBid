import React from "react";
import {
  CalendarCheck,
  Sparkles,
  Clock,
  FileCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export default function TodayPage() {
  // Phase 1 원칙: Sample/Fake 운영 데이터를 임의로 주입하지 않고 실제 상태를 정확히 반영
  const pendingTasksCount = 0;
  const newRecommendationsCount = 0;
  const urgentProposalsCount = 0;
  const missingDocumentsCount = 0;

  return (
    <div className="space-y-6">
      {/* Title & Today Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            오늘 (Today BidOps)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            오늘 집중해야 할 공모 검토, GO/NO-GO 의사결정, 제안서 작성 업무 현황입니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/opportunities">
            <Button size="sm" className="gap-2">
              <span>공모 탐색하기</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Priority Action Metrics (업무 중심 카운트) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase">신규 AI 추천</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {newRecommendationsCount}
              <span className="text-xs font-normal text-muted-foreground ml-1">건</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase">검토 대기 (GO/NO-GO)</span>
              <CalendarCheck className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {pendingTasksCount}
              <span className="text-xs font-normal text-muted-foreground ml-1">건</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-sm">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase">마감 임박 (D-3 이하)</span>
              <Clock className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {urgentProposalsCount}
              <span className="text-xs font-normal text-muted-foreground ml-1">건</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-400 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase">제출서류 누락</span>
              <AlertTriangle className="h-4 w-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {missingDocumentsCount}
              <span className="text-xs font-normal text-muted-foreground ml-1">건</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Work Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">
                  RoboBid AI 추천 공모
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  회사 Capability와 적합도가 높은 로봇·특수목적 하드웨어 공모입니다.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                실데이터 동기화 대기
              </Badge>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Sparkles}
                title="추천된 신규 공모가 없습니다"
                description="Phase 2에서 공공데이터 Provider(나라장터, K-Startup, 기업마당) 연동이 완료되면 실시간으로 공모가 수집·추천됩니다."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Today Tasks & System Notice */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                오늘의 처리 업무
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                당일 마감 및 승인이 필요한 항목입니다.
              </p>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={FileCheck}
                title="오늘 처리할 긴급 업무가 없습니다"
                description="모든 공모 검토 및 제안서 작성 업무가 정상 상태입니다."
              />
            </CardContent>
          </Card>

          <Card className="bg-muted/40 border-dashed">
            <CardHeader className="p-4 pb-2">
              <span className="text-xs font-semibold text-foreground">
                Phase 1 아키텍처 안내
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              RoboBid AI는 가짜 통계나 임의 샘플 공고를 주입하지 않습니다. 공식 Open API 어댑터가 기동되는 즉시 실제 공고가 파이프라인에 반영됩니다.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
