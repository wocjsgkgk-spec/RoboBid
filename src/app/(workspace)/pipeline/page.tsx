"use client";

import React, { useState, useEffect } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  UserCheck,
  Building2,
  Briefcase,
  Layers,
  ChevronRight,
  CheckSquare,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pipelineStore } from "@/lib/pipeline/pipeline-store";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { taskStore } from "@/lib/tasks/task-store";
import { PipelineItem, PipelineStage, PIPELINE_STAGE_LABELS, BidRoom } from "@/types/pipeline";
import { Opportunity } from "@/types";
import { BidDecisionModal } from "@/components/opportunities/bid-decision-modal";
import { BidRoomView } from "@/components/pipeline/bid-room-view";
import { PortfolioExecutiveDashboard } from "@/components/portfolio/portfolio-executive-dashboard";
import { useRouter } from "next/navigation";

const STAGES: PipelineStage[] = [
  "DISCOVERY",
  "INITIAL_INTEREST",
  "ELIGIBILITY_REVIEW",
  "TECH_EVALUATION",
  "BUSINESS_EVALUATION",
  "DECIDED",
];

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [opportunities, setOpportunities] = useState<Map<string, Opportunity>>(new Map());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [pipelineViewMode, setPipelineViewMode] = useState<"FUNNEL" | "PORTFOLIO">("FUNNEL");
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedOppForDecision, setSelectedOppForDecision] = useState<Opportunity | null>(null);
  const [selectedBidRoom, setSelectedBidRoom] = useState<BidRoom | null>(null);
  const router = useRouter();

  const handleOpenBidRoom = (oppId: string) => {
    const opp = opportunities.get(oppId);
    const room = pipelineStore.getOrCreateBidRoom(oppId, opp);
    setSelectedBidRoom(room);
  };

  const loadData = () => {
    const pipeItems = pipelineStore.getAll();
    setItems(pipeItems);
    const oppsMap = new Map<string, Opportunity>();
    for (const opp of opportunityStore.getAll()) {
      oppsMap.set(opp.id, opp);
    }
    setOpportunities(oppsMap);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdvanceStage = (itemId: string, currentStage: PipelineStage) => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      pipelineStore.moveStage(itemId, nextStage);
      loadData();
    }
  };

  const handleBulkMove = (nextStage: PipelineStage) => {
    pipelineStore.bulkMoveStage(selectedItems, nextStage);
    setSelectedItems([]);
    loadData();
  };

  const toggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const filteredItems = items.filter((item) => {
    if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <GitPullRequest className="h-6 w-6 text-primary" />
              공모 검토 파이프라인 (Pipeline Hub)
            </h1>
            <Badge variant="outline" className="text-xs">
              {pipelineViewMode === "FUNNEL" ? "5단계 스크리닝" : "경영진 포트폴리오 분석"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {pipelineViewMode === "FUNNEL"
              ? "수집된 공모를 발견부터 1차 관심, 지원자격, 기술 적합성, 사업성 검증을 거쳐 최종 판단까지 체계적으로 선별합니다."
              : "수주 목표 대비 파이프라인 금액(42.5억), 부서별 리소스 부하율 및 12개월 타임라인을 경영진 관점에서 조망합니다."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border">
            <Button
              size="sm"
              variant={pipelineViewMode === "FUNNEL" ? "default" : "ghost"}
              className="h-8 text-xs font-medium"
              onClick={() => setPipelineViewMode("FUNNEL")}
            >
              <GitPullRequest className="h-3.5 w-3.5 mr-1.5" />
              5단계 퍼널
            </Button>
            <Button
              size="sm"
              variant={pipelineViewMode === "PORTFOLIO" ? "default" : "ghost"}
              className="h-8 text-xs font-medium"
              onClick={() => setPipelineViewMode("PORTFOLIO")}
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              경영진 포트폴리오 (P1)
            </Button>
          </div>

          {/* Priority filter (only in FUNNEL mode) */}
          {pipelineViewMode === "FUNNEL" && (
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-card border rounded-md text-foreground focus:outline-none"
            >
              <option value="ALL">전체 우선순위</option>
              <option value="URGENT">긴급 (URGENT)</option>
              <option value="HIGH">높음 (HIGH)</option>
              <option value="MEDIUM">보통 (MEDIUM)</option>
            </select>
          )}
        </div>
      </div>

      {pipelineViewMode === "PORTFOLIO" ? (
        <PortfolioExecutiveDashboard />
      ) : (
        <>

      {/* 2. Bulk Action Bar (when items selected) */}
      {selectedItems.length > 0 && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between animate-in fade-in duration-150">
          <span className="text-xs font-semibold text-primary">
            {selectedItems.length}개 공모 선택됨
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => handleBulkMove("ELIGIBILITY_REVIEW")}
            >
              자격 검토 단계로 일괄 이동
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => handleBulkMove("TECH_EVALUATION")}
            >
              기술 검토 단계로 일괄 이동
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setSelectedItems([])}
            >
              선택 취소
            </Button>
          </div>
        </div>
      )}

      {/* 3. Funnel Stages Grid (Kanban style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map((stage, idx) => {
          const stageConfig = PIPELINE_STAGE_LABELS[stage];
          const stageItems = filteredItems.filter((i) => i.stage === stage);

          return (
            <div
              key={stage}
              className="flex flex-col rounded-xl border bg-card/50 overflow-hidden min-h-[500px]"
            >
              {/* Stage Header */}
              <div className="p-3 border-b bg-muted/40 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {idx + 1}. {stageConfig.label}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-muted border">
                    {stageItems.length}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {stageConfig.desc}
                </span>
              </div>

              {/* Stage Items Container */}
              <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
                {stageItems.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-[11px] text-muted-foreground/60 border border-dashed rounded-lg">
                    대기 공모 없음
                  </div>
                ) : (
                  stageItems.map((item) => {
                    const opp = opportunities.get(item.opportunityId);
                    const isSelected = selectedItems.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border text-xs transition-all shadow-sm ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "bg-card hover:border-primary/40"
                        }`}
                      >
                        {/* Card Top: Checkbox & Priority */}
                        <div className="flex items-center justify-between mb-1.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-primary cursor-pointer"
                          />
                          <span
                            className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                              item.priority === "URGENT"
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : item.priority === "HIGH"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-foreground line-clamp-2 leading-tight">
                          {opp?.title || item.opportunityId}
                        </h4>

                        {/* Agency & Scores */}
                        <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>{opp?.announcingAgency || "발주기관"}</span>
                            <span className="font-mono text-primary font-bold">
                              기술 {item.techFitScore}점
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>자격 {item.eligibilityPassCount}/{item.eligibilityTotalCount} 통과</span>
                            <span className="font-mono text-foreground font-semibold">
                              사업 {item.businessFitScore}점
                            </span>
                          </div>
                        </div>

                        {/* Assignee & Notes */}
                        {item.notes && (
                          <p className="mt-2 p-1.5 rounded bg-muted/50 text-[10px] text-muted-foreground line-clamp-2">
                            {item.notes}
                          </p>
                        )}

                        <div className="mt-2 pt-2 border-t flex items-center justify-between gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenBidRoom(item.opportunityId)}
                            className="h-6 px-2 text-[10px] gap-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100"
                            title="전용 Bid Room 열기"
                          >
                            <Sparkles className="h-3 w-3" />
                            Bid Room
                          </Button>

                          {/* Action button */}
                          {stage !== "DECIDED" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAdvanceStage(item.id, stage)}
                              className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/10 gap-0.5"
                            >
                              다음 단계 <ChevronRight className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (opp) {
                                  setSelectedOppForDecision(opp);
                                  setDecisionModalOpen(true);
                                }
                              }}
                              className="h-6 px-2 text-[10px] text-emerald-600 border-emerald-500/30"
                            >
                              결정 확인
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

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

      {/* Bid Room Modal Overlay */}
      {selectedBidRoom && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col my-auto shadow-2xl">
            <BidRoomView
              bidRoom={selectedBidRoom}
              tasks={taskStore.getByOpportunityId(selectedBidRoom.opportunityId)}
              onClose={() => setSelectedBidRoom(null)}
              onOpenProposal={() => {
                setSelectedBidRoom(null);
                router.push("/proposals");
              }}
              onOpenSubmission={(oppId) => {
                setSelectedBidRoom(null);
                router.push("/submissions");
              }}
              onCreateTask={(oppId) => {
                setSelectedBidRoom(null);
                router.push("/tasks");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
