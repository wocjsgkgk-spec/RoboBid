"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Sparkles,
  Clock,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Radio,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import Link from "next/link";
import { TodayBidOpsSummary } from "@/types/today";

export default function TodayPage() {
  const [summary, setSummary] = useState<TodayBidOpsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/today");
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch today bidops summary:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  const urgentActionCount = summary?.urgentActionCount || 0;
  const newRecommendationCount = summary?.newRecommendationCount || 0;
  const pendingDecisionCount = summary?.pendingDecisionCount || 0;
  const urgentDeadlineCount = summary?.urgentDeadlineCount || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              오늘 (Today BidOps)
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              실시간 동기화
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            오늘 반드시 착수·의사결정해야 하는 공모 및 긴급 마감 현황을 한 화면에서 시작합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTodayData}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>새로고침</span>
          </Button>
          <Link href="/opportunities">
            <Button size="sm" className="gap-2">
              <span>전체 공모 탐색</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Priority 1: 반드시 처리할 긴급 업무 배너 (Action Items) */}
      {summary && summary.actionItems.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide">
              오늘 반드시 처리할 긴급 업무 ({summary.actionItems.length}건)
            </h2>
          </div>
          <div className="space-y-2">
            {summary.actionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-md bg-background border text-sm shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={item.priority === "CRITICAL" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {item.priority}
                  </Badge>
                  <div>
                    <div className="font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
                <Link href={item.linkUrl}>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <span>이동</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Core Metrics: 업무 중심 4대 정량 지표 (Zero Fake Data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="긴급 조치 업무"
          value={`${urgentActionCount}건`}
          subtitle="D-3 마감 / 필수 조치"
          icon={AlertTriangle}
          badgeText={urgentActionCount > 0 ? "ACTION REQUIRED" : "NORMAL"}
          badgeVariant={urgentActionCount > 0 ? "destructive" : "secondary"}
          className="border-l-4 border-l-destructive"
        />

        <MetricCard
          title="고적합 신규 추천"
          value={`${newRecommendationCount}건`}
          subtitle="적합도 점수 70점 이상"
          icon={Sparkles}
          badgeText={newRecommendationCount > 0 ? "HIGH MATCH" : "NONE"}
          badgeVariant={newRecommendationCount > 0 ? "success" : "secondary"}
          className="border-l-4 border-l-primary"
        />

        <MetricCard
          title="GO / NO-GO 대기"
          value={`${pendingDecisionCount}건`}
          subtitle="검토 및 조건 승인 요망"
          icon={CalendarCheck}
          badgeText={pendingDecisionCount > 0 ? "PENDING" : "CLEAR"}
          badgeVariant={pendingDecisionCount > 0 ? "warning" : "secondary"}
          className="border-l-4 border-l-amber-500"
        />

        <MetricCard
          title="마감 임박 (D-3)"
          value={`${urgentDeadlineCount}건`}
          subtitle="제출 서류 최종 확인"
          icon={Clock}
          badgeText={urgentDeadlineCount > 0 ? "DEADLINE" : "SAFE"}
          badgeVariant={urgentDeadlineCount > 0 ? "warning" : "secondary"}
          className="border-l-4 border-l-orange-500"
        />
      </div>

      {/* 4. Main Work Sections (2 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Recommendations & Pending Decisions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: 고적합 신규 추천 공모 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  신규 고적합 추천 공모
                </CardTitle>
                <CardDescription className="text-xs">
                  사내 역량(TRL, 특허, 인력)과 적합도가 70점 이상으로 산출된 공모입니다.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {summary?.recommendedOpportunities.length || 0}건
              </Badge>
            </CardHeader>
            <CardContent>
              {summary && summary.recommendedOpportunities.length > 0 ? (
                <div className="space-y-3">
                  {summary.recommendedOpportunities.map(({ opportunity, score }) => (
                    <div
                      key={opportunity.id}
                      className="p-3 border rounded-lg hover:border-primary/50 transition-colors flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {opportunity.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {opportunity.announcingAgency}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-3">
                          <span>적합도 점수: <strong className="text-primary">{score.totalScore}점</strong></span>
                          <span>추천: <strong>{(score as any).recommendedDecision || score.recommendation}</strong></span>
                          {opportunity.submissionDeadline && <span>마감: {opportunity.submissionDeadline}</span>}
                        </div>
                      </div>
                      <Link href={`/opportunities?id=${opportunity.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          <span>검토하기</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Sparkles}
                  title="현재 추천된 고적합 공모가 없습니다"
                  description="공공데이터 동기화 엔진(KONEPS, K-Startup, 기업마당 등)에서 새로운 공고가 수집되고 점수가 산출되면 자동으로 표시됩니다."
                />
              )}
            </CardContent>
          </Card>

          {/* Section: GO / NO-GO 의사결정 대기 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  GO / HOLD / NO-GO 심의 대기
                </CardTitle>
                <CardDescription className="text-xs">
                  검토자가 승인 사유 및 조건을 입력하여 최종 추진 결정을 내려야 하는 항목입니다.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {summary?.pendingDecisions.length || 0}건
              </Badge>
            </CardHeader>
            <CardContent>
              {summary && summary.pendingDecisions.length > 0 ? (
                <div className="space-y-3">
                  {summary.pendingDecisions.map(({ opportunity, score }) => (
                    <div
                      key={opportunity.id}
                      className="p-3 border rounded-lg flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="font-semibold text-sm text-foreground">
                          {opportunity.title}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {score
                            ? `산출 적합도: ${score.totalScore}점 | 추천: ${(score as any).recommendedDecision || score.recommendation}`
                            : "적합도 스코어 미산출"}
                        </div>
                      </div>
                      <Link href={`/opportunities?id=${opportunity.id}`}>
                        <Button size="sm" className="text-xs">
                          심의 확정
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileCheck}
                  title="심의 대기 중인 공모가 없습니다"
                  description="현재 등록된 모든 공모의 의사결정이 완료되었거나 신규 검토 대상이 없습니다."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Provider Health & Recent Decisions */}
        <div className="space-y-6">
          {/* Section: 공공데이터 Provider 실시간 가동 현황 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-emerald-500" />
                  <span>공공 Provider 가동 상태</span>
                </CardTitle>
                <Link href="/settings">
                  <span className="text-xs text-muted-foreground hover:underline">설정</span>
                </Link>
              </div>
              <CardDescription className="text-xs">
                실시간 OpenAPI 헬스체크 (Zero Fake Connected)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary?.providerAlerts && summary.providerAlerts.length > 0 ? (
                summary.providerAlerts.map((p) => (
                  <div
                    key={p.providerId}
                    className="p-2.5 rounded-md border border-destructive/20 bg-destructive/5 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-destructive">{p.providerName}</div>
                      <div className="text-muted-foreground">{p.error || "응답 지연 감지"}</div>
                    </div>
                    <Badge variant="destructive" className="text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted/30 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>5대 공공데이터 Provider 연동 상태가 정상입니다.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: 최근 의사결정 이력 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <History className="h-4 w-4 text-muted-foreground" />
                <span>최근 확정된 의사결정</span>
              </CardTitle>
              <CardDescription className="text-xs">
                인간 검토자에 의해 최종 확정된 감사 이력
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.recentDecisions && summary.recentDecisions.length > 0 ? (
                <div className="space-y-2.5">
                  {summary.recentDecisions.map(({ decision, opportunityTitle }) => (
                    <div
                      key={decision.id}
                      className="p-2.5 rounded-md border text-xs space-y-1 bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate max-w-[160px]">
                          {opportunityTitle}
                        </span>
                        <Badge
                          variant={decision.decision === "GO" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {decision.decision}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-1">{decision.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarCheck}
                  title="최근 의사결정 이력이 없습니다"
                  description="GO / NO-GO 결정이 등록되면 최근 이력이 순차적으로 표시됩니다."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
