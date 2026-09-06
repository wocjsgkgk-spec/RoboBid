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
  Calculator,
  Award,
  FileSpreadsheet,
  CheckSquare,
  Send,
  FileText,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TodayBidOpsSummary } from "@/types/today";
import { taskStore } from "@/lib/tasks/task-store";
import { Task, TaskStatus } from "@/types/task";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { BidDecisionModal } from "@/components/opportunities/bid-decision-modal";
import { ActionCenter } from "@/components/today/action-center";
import { TodayActionItem } from "@/types/today";
import { Opportunity } from "@/types";

export default function TodayPage() {
  const [summary, setSummary] = useState<TodayBidOpsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedOppForDecision, setSelectedOppForDecision] = useState<Opportunity | null>(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/today");
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
      setTasks(taskStore.getAll());
      setOpportunities(opportunityStore.getAll());
    } catch (err) {
      console.error("Failed to fetch today data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncKoneps = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/ingestion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: "koneps", keyword: "로봇", fallbackToMock: true }),
      });
      const data = await res.json();
      if (data.success && data.result?.items?.length) {
        opportunityStore.upsertFromApi(data.result.items);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTaskStatus = (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    taskStore.updateStatus(taskId, nextStatus);
    setTasks([...taskStore.getAll()]);
  };

  // 긴급 처리 및 미결정 공모
  const urgentTasks = tasks.filter((t) => t.status !== "DONE");
  const pendingDecisions = opportunities.filter(
    (o) => o.status === "INBOX" || o.status === "NEW" || o.status === "REVIEWING" || o.status === "DISCOVERED"
  );
  const imminentDeadlines = opportunities.filter((o) => {
    const diffDays = Math.ceil((new Date(o.submissionDeadline).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <div className="space-y-6">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CalendarCheck className="h-6 w-6 text-primary" />
              오늘의 수주 업무 (Today Operations)
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              실시간 동기화
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            로그인 후 30초 내에 오늘 반드시 처리해야 할 과제, D-Day 마감, 미결정 안건을 확인합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncKoneps}
            disabled={isSyncing}
            className="gap-1.5 border border-primary/20 text-primary hover:bg-primary/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "수집 중..." : "나라장터 실시간 동기화"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>새로고침</span>
          </Button>
          <Link href="/opportunities">
            <Button size="sm" className="gap-2">
              <span>공모 관리</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Action Center (출근 즉시 처리할 우선순위 조치) */}
      <ActionCenter
        actionItems={[
          ...(summary?.actionItems || []),
          ...pendingDecisions.slice(0, 2).map((p) => {
            const daysLeft = Math.max(1, Math.ceil((new Date(p.submissionDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            return {
              id: `action-decide-${p.id}`,
              type: "GO_DECISION_REQUIRED" as const,
              priority: "HIGH" as const,
              title: `${p.title} — GO/NO-GO 참여 결정 대기`,
              description: `추천 적합도 85점. 접수 마감 D-${daysLeft}일 전으로 신속한 참여 판단이 요구됩니다.`,
              linkUrl: `/opportunities`,
              ctaLabel: "GO 결정하기",
              opportunityId: p.id,
              opportunityTitle: p.title,
              daysRemaining: daysLeft,
              category: "DECISION" as const,
            };
          }),
          ...imminentDeadlines.slice(0, 1).map((d) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(d.submissionDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            return {
              id: `action-deadline-${d.id}`,
              type: "DEADLINE_URGENT" as const,
              priority: "CRITICAL" as const,
              title: `${d.title} — D-${daysLeft} 마감 임박`,
              description: "필수 서류 날인 및 전자문서 규격 검증을 완료하고 마감 최소 4시간 전 사전 접수를 완료하세요.",
              linkUrl: `/submissions`,
              ctaLabel: "제출 점검",
              opportunityId: d.id,
              opportunityTitle: d.title,
              daysRemaining: daysLeft,
              category: "SUBMISSION" as const,
            };
          }),
          {
            id: "action-cert-iso",
            type: "CERT_EXPIRING" as const,
            priority: "NORMAL" as const,
            title: "기업부설연구소 인증서 갱신 준비 (만료 D-43)",
            description: "국가연구개발사업 가점 유지를 위해 만료 30일 전 과기정통부 연구개발인력 현황 갱신 필수.",
            linkUrl: `/vault`,
            ctaLabel: "자산 확인",
            category: "CERTIFICATION" as const,
          },
        ]}
      />

      {/* 3. Quick Action KPI Grid (30초 파악용 지표) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>오늘 할 일 (미완료)</span>
            <CheckSquare className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">{urgentTasks.length}</span>
            <span className="text-xs text-muted-foreground">건</span>
          </div>
          <Link href="/tasks" className="mt-2 text-[11px] text-primary hover:underline flex items-center gap-1">
            업무 목록 바로가기 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>D-7 이내 마감 임박</span>
            <Clock className="h-4 w-4 text-destructive" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-destructive">{imminentDeadlines.length}</span>
            <span className="text-xs text-muted-foreground">건</span>
          </div>
          <Link href="/submissions" className="mt-2 text-[11px] text-destructive hover:underline flex items-center gap-1">
            제출 통제 센터 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>지원여부 미결정 안건</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600">{pendingDecisions.length}</span>
            <span className="text-xs text-muted-foreground">건</span>
          </div>
          <Link href="/pipeline" className="mt-2 text-[11px] text-amber-600 hover:underline flex items-center gap-1">
            검토 파이프라인 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>고적합 추천 공모</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-primary">
              {summary?.recommendedOpportunities?.length || 3}
            </span>
            <span className="text-xs text-muted-foreground">건</span>
          </div>
          <span className="mt-2 text-[11px] text-muted-foreground">
            사내 TRL 및 특허 역량 86% 이상 매칭
          </span>
        </div>
      </div>

      {/* 3. Section: 오늘 반드시 처리할 업무 (Interactive Tasks Checklist) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <div>
                <CardTitle className="text-base font-bold">오늘 처리할 업무 (Today Tasks)</CardTitle>
                <CardDescription className="text-xs">
                  체크박스를 클릭하면 실시간으로 완료 상태가 저장됩니다.
                </CardDescription>
              </div>
            </div>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                전체 업무 ({tasks.length}건) <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {tasks.slice(0, 4).map((task) => {
              const isDone = task.status === "DONE";
              return (
                <div
                  key={task.id}
                  className="py-2.5 flex items-start justify-between gap-3 hover:bg-muted/40 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleTaskStatus(task.id, task.status)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-semibold ${
                          isDone ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        {task.description} · <span className="text-foreground/80 font-medium">연계: {task.opportunityTitle}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border">
                      {task.assignee}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        task.priority === "URGENT"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : task.priority === "HIGH"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {task.priority === "URGENT" ? "D-2 긴급" : task.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Section: D-Day 임박 및 지원판단 미결정 안건 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: D-Day 임박 공모 */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3 bg-destructive/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <Clock className="h-4 w-4" />
                <CardTitle className="text-sm font-bold">D-Day 긴급 공모 (접수 마감 임박)</CardTitle>
              </div>
              <Link href="/submissions">
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-destructive hover:bg-destructive/10">
                  제출 관리 <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-2.5">
              {(imminentDeadlines.length > 0 ? imminentDeadlines : opportunities).slice(0, 3).map((opp) => {
                const diffDays = Math.ceil(
                  (new Date(opp.submissionDeadline).getTime() - Date.now()) / (1000 * 3600 * 24)
                );
                const displayDays = diffDays >= 0 ? `D-${diffDays}` : "마감완료";
                return (
                  <div
                    key={opp.id}
                    className="p-3 rounded-lg border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-foreground line-clamp-1">{opp.title}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {opp.announcingAgency} · 예산 {(opp.allocatedBudget || 0).toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-destructive/10 text-destructive font-bold rounded">
                        {displayDays}
                      </span>
                      <Link href="/submissions">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2" title="제출 마감 점검">
                          제출
                        </Button>
                      </Link>
                      <Link href="/rfp">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-primary" title="RFP 요구사항 분석">
                          RFP
                        </Button>
                      </Link>
                      <Link href="/tools">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-amber-600" title="A값 투찰금액 계산">
                          투찰
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
              {opportunities.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  현재 등록된 공모가 없습니다.{" "}
                  <Link href="/opportunities" className="text-primary underline">
                    공모 관리에서 수집
                  </Link>
                  하세요.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: GO/HOLD/NO-GO 의사결정 대기 */}
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3 bg-amber-500/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <CardTitle className="text-sm font-bold">지원판단 (GO/HOLD/NO-GO) 대기</CardTitle>
              </div>
              <Link href="/pipeline">
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-amber-700 dark:text-amber-400 hover:bg-amber-500/10">
                  파이프라인 <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-2.5">
              {pendingDecisions.slice(0, 2).map((opp) => (
                <div
                  key={opp.id}
                  className="p-3 rounded-lg border bg-card/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-foreground line-clamp-1">{opp.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {opp.announcingAgency} · {opp.bidType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold rounded">
                      검토 필요
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5 text-primary border-primary/30 hover:bg-primary/10"
                      onClick={() => {
                        setSelectedOppForDecision(opp);
                        setDecisionModalOpen(true);
                      }}
                    >
                      결정하기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Section: 추천 3선 공고 및 실전 투찰도구 바로가기 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-bold">사내 역량 맞춤 추천 공고 3선</CardTitle>
                <CardDescription className="text-xs">
                  등록된 특허 및 TRL 7단계 물류로봇 실증 데이터 매칭 분석 결과입니다.
                </CardDescription>
              </div>
            </div>
            <Link href="/opportunities">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                공모 전체보기 <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opportunities.slice(0, 3).map((opp, idx) => {
              const matchScore = idx === 0 ? 92 : idx === 1 ? 92 : 86;
              return (
                <div
                  key={opp.id}
                  className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {opp.bidType}
                      </Badge>
                      <span className="text-xs font-bold font-mono text-primary">
                        적합도 {matchScore}점
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                      {opp.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {opp.announcingAgency} · 예산 {(opp.allocatedBudget || 0).toLocaleString()}원
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                    <Link href={`/rfp`}>
                      <span className="text-primary hover:underline flex items-center gap-1 text-[11px]">
                        RFP 분석 <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                    <Link href={`/tools`}>
                      <span className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]">
                        투찰 시뮬레이션
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 6. Section: 실전 입찰 전략 툴킷 (Quick BidOps Hub) */}
      <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">실전 입찰 도구 통합 허브</span>
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
              1-클릭 접근
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            A값 공제 투찰가 계산기, 적격심사 100점 진단기, R&D 사업비 자기부담금 시뮬레이터를 활용하세요.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/tools">
            <Button size="sm" variant="default" className="text-xs gap-1.5 shadow-sm">
              <Calculator className="h-3.5 w-3.5" />
              <span>입찰도구 열기</span>
            </Button>
          </Link>
          <Link href="/rfp">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>RFP 심층 분석</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedOppForDecision && (
        <BidDecisionModal
          open={decisionModalOpen}
          onOpenChange={setDecisionModalOpen}
          opportunity={selectedOppForDecision}
          onDecisionRecorded={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
