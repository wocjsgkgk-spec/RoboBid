"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Clock,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  DollarSign,
  PieChart,
  Layers,
  ChevronRight,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FundingPortfolioItem,
  FundingPortfolioSummary,
  FundingPortfolioStatus,
  FundingConflictReport,
  FundingFitResult,
  ProjectConcept,
  ProjectBudgetCategory,
  PROJECT_BUDGET_CATEGORY_LABELS,
} from "@/types";
import { FundingFitService } from "@/lib/funding/funding-fit-service";
import { FundingConflictService } from "@/lib/funding/funding-conflict-service";

const STATUS_CONFIG: Record<FundingPortfolioStatus, { label: string; color: string; bg: string }> = {
  CANDIDATE: { label: "후보 검토 (Candidate)", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
  PLANNED: { label: "지원 계획 (Planned)", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
  APPLIED: { label: "접수 완료 (Applied)", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  UNDER_REVIEW: { label: "심사 진행 (Under Review)", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
  AWARDED: { label: "최종 선정 (Awarded)", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  REJECTED: { label: "미선정 (Rejected)", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
  CANCELLED: { label: "지원 취소 (Cancelled)", color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-900" },
};

export function V3FundingPortfolioWorkspace() {
  const [concepts, setConcepts] = useState<ProjectConcept[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("c001-amr-logistics-robot");
  const [summary, setSummary] = useState<FundingPortfolioSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"PORTFOLIO" | "FIT_SIMULATOR" | "CONFLICT_CHECK">("PORTFOLIO");
  const [isLoading, setIsLoading] = useState(false);

  // Fit Simulator State
  const [fitResult, setFitResult] = useState<FundingFitResult | null>(null);
  const [simulatedBudget, setSimulatedBudget] = useState<number>(800_000_000);
  const [simulatedGrantCap, setSimulatedGrantCap] = useState<number>(500_000_000);
  const [simulatedSelfRatio, setSimulatedSelfRatio] = useState<number>(20);

  // Conflict Checker State
  const [conflictReport, setConflictReport] = useState<FundingConflictReport | null>(null);
  const [newOppTitle, setNewOppTitle] = useState("");
  const [newAgency, setNewAgency] = useState("중소벤처기업부");
  const [newAmount, setNewAmount] = useState(200_000_000);
  const [newStatus, setNewStatus] = useState<FundingPortfolioStatus>("CANDIDATE");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Projects
      const cRes = await fetch("/api/concepts");
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.concepts && cData.concepts.length > 0) {
          setConcepts(cData.concepts);
          if (!selectedProjectId && cData.concepts[0]) {
            setSelectedProjectId(cData.concepts[0].id);
          }
        }
      }

      // 2. Portfolio Summary
      const pRes = await fetch(`/api/portfolio?projectId=${selectedProjectId}`);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.summary) {
          setSummary(pData.summary);
        }
      }
    } catch (e) {
      console.error("Failed to load portfolio data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  // Recalculate Fit Simulator
  useEffect(() => {
    const selectedConcept = concepts.find((c) => c.id === selectedProjectId);
    const totalBudget = simulatedBudget || selectedConcept?.estimatedBudget || 800_000_000;
    const baseBudget = selectedConcept
      ? FundingFitService.extractProjectBudget(selectedConcept)
      : {
          LABOR: Math.round(totalBudget * 0.4),
          MATERIALS: Math.round(totalBudget * 0.08),
          PARTS: Math.round(totalBudget * 0.18),
          EQUIPMENT: Math.round(totalBudget * 0.08),
          OUTSOURCING: Math.round(totalBudget * 0.12),
          VALIDATION: Math.round(totalBudget * 0.04),
          SW_SERVER: Math.round(totalBudget * 0.03),
          MARKETING: Math.round(totalBudget * 0.02),
          CERTIFICATION: Math.round(totalBudget * 0.02),
          OTHER: Math.round(totalBudget * 0.03),
        };

    const terms = FundingFitService.getDefaultFundingTerms({
      allocatedBudget: simulatedGrantCap,
    });
    terms.maxGrantAmount = simulatedGrantCap;
    terms.selfFundingMinRatio = simulatedSelfRatio / 100;

    const result = FundingFitService.calculateFit(baseBudget, terms);
    setFitResult(result);
  }, [selectedProjectId, concepts, simulatedBudget, simulatedGrantCap, simulatedSelfRatio]);

  // Run Conflict Check on current portfolio
  const runConflictCheck = () => {
    if (!summary || summary.items.length === 0) return;
    const candidateOpp = summary.items[summary.items.length - 1]; // test last item or simulated
    const report = FundingConflictService.checkConflicts(
      {
        opportunityTitle: candidateOpp.opportunityTitle,
        announcingAgency: candidateOpp.announcingAgency,
        fundingType: candidateOpp.fundingType,
        period: candidateOpp.period,
        allocatedCategories: candidateOpp.allocatedCategories,
        assetsIncluded: candidateOpp.assetsIncluded,
        partsIncluded: candidateOpp.partsIncluded,
        personnelIncluded: [
          { name: "김수석", participationRate: 60 },
          { name: "박책임", participationRate: 50 },
        ],
      },
      summary.items.slice(0, summary.items.length - 1)
    );
    setConflictReport(report);
  };

  useEffect(() => {
    if (summary && summary.items.length > 0) {
      runConflictCheck();
    }
  }, [summary]);

  const handleUpdateStatus = async (itemId: string, newStatus: FundingPortfolioStatus) => {
    try {
      const res = await fetch(`/api/portfolio/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("해당 지원사업을 포트폴리오에서 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/portfolio/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error("Failed to delete item:", e);
    }
  };

  const handleAddNewItem = async () => {
    if (!newOppTitle) {
      alert("공고명을 입력해주세요.");
      return;
    }
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectConceptId: selectedProjectId,
          opportunityTitle: newOppTitle,
          announcingAgency: newAgency,
          targetGrantAmount: Number(newAmount),
          awardedGrantAmount: newStatus === "AWARDED" ? Number(newAmount) : 0,
          status: newStatus,
          period: {
            startDate: "2026-06-01",
            endDate: "2027-05-31",
          },
          allocatedCategories: {
            LABOR: Math.round(Number(newAmount) * 0.4),
            PARTS: Math.round(Number(newAmount) * 0.3),
            OUTSOURCING: Math.round(Number(newAmount) * 0.3),
          },
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewOppTitle("");
        loadData();
      }
    } catch (e) {
      console.error("Failed to add portfolio item:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Project Selector & View Mode Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                V3 Multi-Funding Strategy
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                실시간 연동
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              자금 지원 포트폴리오 (Funding Portfolio & Conflict Engine)
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">대상 프로젝트:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {concepts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-xs gap-1.5 bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90"
          >
            <Plus className="w-3.5 h-3.5" />
            지원사업 추가
          </Button>
        </div>
      </div>

      {/* 2. Executive Portfolio KPI Metrics (7 Crucial Dimensions) */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Target Cost */}
          <div className="p-3.5 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              Target Cost
            </div>
            <div className="text-lg font-bold font-mono text-foreground">
              {(summary.targetCost / 100_000_000).toFixed(1)}억원
            </div>
            <p className="text-[10px] text-muted-foreground">목표 총 개발비</p>
          </div>

          {/* Awarded (Separated from Candidate!) */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm space-y-1">
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Awarded
            </div>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {(summary.awarded / 100_000_000).toFixed(2)}억원
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium">선정·확보 완료 금액</p>
          </div>

          {/* Under Review */}
          <div className="p-3.5 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Under Review
            </div>
            <div className="text-lg font-bold font-mono text-amber-600">
              {(summary.underReview / 100_000_000).toFixed(1)}억원
            </div>
            <p className="text-[10px] text-muted-foreground">심사 진행 중</p>
          </div>

          {/* Planned */}
          <div className="p-3.5 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Planned
            </div>
            <div className="text-lg font-bold font-mono text-blue-600">
              {(summary.planned / 100_000_000).toFixed(1)}억원
            </div>
            <p className="text-[10px] text-muted-foreground">공고 확인 지원예정</p>
          </div>

          {/* Candidate */}
          <div className="p-3.5 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              Candidate
            </div>
            <div className="text-lg font-bold font-mono text-slate-600 dark:text-slate-300">
              {(summary.candidate / 100_000_000).toFixed(1)}억원
            </div>
            <p className="text-[10px] text-muted-foreground">후보 탐색 단계</p>
          </div>

          {/* Gap */}
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm space-y-1">
            <div className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Funding Gap
            </div>
            <div className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
              {(summary.gap / 100_000_000).toFixed(1)}억원
            </div>
            <p className="text-[10px] text-rose-600 dark:text-rose-500 font-medium">잔여 부족 개발비</p>
          </div>

          {/* Coverage Gauge */}
          <div className="p-3.5 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="text-[11px] text-primary font-semibold flex items-center gap-1">
              <PieChart className="w-3.5 h-3.5 text-primary" />
              Coverage
            </div>
            <div className="text-lg font-bold font-mono text-primary">
              {summary.coverage}%
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.coverage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex border-b border-muted">
        <button
          onClick={() => setActiveTab("PORTFOLIO")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "PORTFOLIO"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-4 h-4" />
          포트폴리오 결합 관리 ({summary?.items.length || 0}건)
        </button>
        <button
          onClick={() => setActiveTab("FIT_SIMULATOR")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "FIT_SIMULATOR"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Funding Fit 시뮬레이터 (10대 비목 매칭)
        </button>
        <button
          onClick={() => setActiveTab("CONFLICT_CHECK")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "CONFLICT_CHECK"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          중복수혜·비목 충돌 검사 (Conflict Engine)
          {conflictReport && conflictReport.overallRisk !== "SAFE" && (
            <Badge variant="destructive" className="ml-1 text-[9px] px-1.5 py-0">
              {conflictReport.overallRisk}
            </Badge>
          )}
        </button>
      </div>

      {/* TAB 1: Portfolio Items List */}
      {activeTab === "PORTFOLIO" && summary && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  프로젝트 연결 지원사업 파이프라인
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  로봇 개발 아이템에 다중 지원금을 조합하여 예산 충당률을 극대화합니다.
                </CardDescription>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                합계: {(summary.pipelineTotal / 100_000_000).toFixed(1)}억원 예정
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {summary.items.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.CANDIDATE;
              const isAwarded = item.status === "AWARDED";

              return (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color} border-none`}>
                        {statusCfg.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">{item.announcingAgency}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ({item.period.startDate} ~ {item.period.endDate})
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-foreground">{item.opportunityTitle}</h4>

                    {/* Allocated categories preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(item.allocatedCategories).map(([catKey, amount]) => {
                        if (!amount || amount <= 0) return null;
                        const label = PROJECT_BUDGET_CATEGORY_LABELS[catKey as ProjectBudgetCategory] || catKey;
                        return (
                          <span
                            key={catKey}
                            className="inline-flex items-center text-[10px] bg-muted px-2 py-0.5 rounded text-foreground/80 font-mono"
                          >
                            {label}: {(amount / 10_000_000).toFixed(1)}천만
                          </span>
                        );
                      })}
                    </div>

                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic flex items-center gap-1 pt-0.5">
                        <Info className="w-3 h-3 text-muted-foreground" />
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 min-w-[200px] border-t md:border-t-0 pt-2 md:pt-0">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">지원금액</div>
                      <div className="text-base font-bold font-mono text-primary">
                        {(item.targetGrantAmount / 100_000_000).toFixed(2)}억원
                      </div>
                      {item.selfFundingAmount > 0 && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          (자부담 {(item.selfFundingAmount / 10_000_000).toFixed(0)}천만원)
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as FundingPortfolioStatus)}
                        className="text-xs font-semibold px-2 py-1 rounded border bg-background text-foreground shadow-sm"
                      >
                        <option value="CANDIDATE">CANDIDATE (후보)</option>
                        <option value="PLANNED">PLANNED (계획)</option>
                        <option value="APPLIED">APPLIED (접수)</option>
                        <option value="UNDER_REVIEW">UNDER_REVIEW (심사)</option>
                        <option value="AWARDED">AWARDED (선정)</option>
                        <option value="REJECTED">REJECTED (탈락)</option>
                        <option value="CANCELLED">CANCELLED (취소)</option>
                      </select>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item.id)}
                        className="w-7 h-7 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Funding Fit Simulator (10 Budget Categories) */}
      {activeTab === "FIT_SIMULATOR" && fitResult && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card className="border shadow-sm bg-muted/20">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  프로젝트 목표 총 예산 (KRW)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="10000000"
                    value={simulatedBudget}
                    onChange={(e) => setSimulatedBudget(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-1.5 rounded border bg-background"
                  />
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {(simulatedBudget / 100_000_000).toFixed(1)}억원
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  지원사업 정부지원금 한도 (KRW)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="10000000"
                    value={simulatedGrantCap}
                    onChange={(e) => setSimulatedGrantCap(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-1.5 rounded border bg-background"
                  />
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {(simulatedGrantCap / 100_000_000).toFixed(1)}억원
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  의무 자부담(민간부담금) 비율 (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={simulatedSelfRatio}
                    onChange={(e) => setSimulatedSelfRatio(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-1.5 rounded border bg-background"
                  />
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {simulatedSelfRatio}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fit Calculation Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
              <div className="text-[11px] text-muted-foreground font-semibold">총 프로젝트 비용</div>
              <div className="text-xl font-bold font-mono">{(fitResult.project_cost / 100_000_000).toFixed(1)}억원</div>
              <p className="text-[10px] text-muted-foreground">10개 개발 비목 합계</p>
            </div>

            <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 shadow-sm space-y-1">
              <div className="text-[11px] text-primary font-semibold">지원 가능액 (정부지원금)</div>
              <div className="text-xl font-bold font-mono text-primary">
                {(fitResult.grant_amount / 100_000_000).toFixed(2)}억원
              </div>
              <p className="text-[10px] text-primary/80">공고 한도 및 인정 비목 적용</p>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
              <div className="text-[11px] text-amber-600 font-semibold">기업 자부담 예상액</div>
              <div className="text-xl font-bold font-mono text-amber-600">
                {(fitResult.self_funding / 10_000_000).toFixed(0)}천만원
              </div>
              <p className="text-[10px] text-muted-foreground">현금/현물 의무 매칭</p>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
              <div className="text-[11px] text-rose-600 font-semibold">미지원 잔여 갭 (Unfunded Gap)</div>
              <div className="text-xl font-bold font-mono text-rose-600">
                {(fitResult.unfunded_gap / 100_000_000).toFixed(1)}억원
              </div>
              <p className="text-[10px] text-muted-foreground">추가 펀딩 조합 필요</p>
            </div>
          </div>

          {/* 10 Budget Categories Table */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>10개 비목별 예산 충당 분석 (Coverage by Category)</span>
                <Badge variant="outline" className="text-xs font-mono text-primary">
                  전체 커버리지 {fitResult.coverage}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">비목</th>
                      <th className="py-2.5 px-3 text-right">요청 예산 (원)</th>
                      <th className="py-2.5 px-3 text-center">허용 여부</th>
                      <th className="py-2.5 px-3 text-right">인정 사업비 (원)</th>
                      <th className="py-2.5 px-3 text-right">지원 충당액 (원)</th>
                      <th className="py-2.5 px-3 text-center">비목 충당률</th>
                      <th className="py-2.5 px-3">지침 및 비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    {fitResult.coverage_by_category.map((row) => (
                      <tr key={row.category} className="hover:bg-muted/10">
                        <td className="py-2.5 px-3 font-semibold font-sans text-foreground">
                          {row.categoryLabel}
                        </td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">
                          {row.requestedCost.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {row.isAllowed ? (
                            <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-none text-[10px]">
                              허용
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              불가
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {row.eligibleCost.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-primary">
                          {row.fundedGrantAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`font-bold ${row.coverageRatio >= 80 ? "text-emerald-600" : row.coverageRatio > 0 ? "text-amber-600" : "text-rose-500"}`}>
                            {row.coverageRatio}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-muted-foreground text-[11px]">
                          {row.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Conditions & Rules */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
            <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary" />
              협약 및 사업비 인정 가이드라인
            </h5>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {fitResult.conditions.map((cond, idx) => (
                <li key={idx}>{cond}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: Conflict Risk Radar (7 Dimensions) */}
      {activeTab === "CONFLICT_CHECK" && conflictReport && (
        <div className="space-y-6">
          {/* Risk Level Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              conflictReport.overallRisk === "SAFE"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200"
                : conflictReport.overallRisk === "POTENTIAL_CONFLICT"
                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200"
                : conflictReport.overallRisk === "REVIEW_REQUIRED"
                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200"
                : "bg-rose-50 dark:bg-rose-950/30 border-rose-200"
            }`}
          >
            {conflictReport.overallRisk === "SAFE" ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : conflictReport.overallRisk === "PROHIBITED" ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  포트폴리오 중복 충돌 종합 진단:
                </h4>
                <Badge
                  className={`text-xs font-bold ${
                    conflictReport.overallRisk === "SAFE"
                      ? "bg-emerald-600 text-white"
                      : conflictReport.overallRisk === "PROHIBITED"
                      ? "bg-rose-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {conflictReport.overallRisk}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                총 {conflictReport.findings.length}개 위험 요인이 감지되었습니다. (금지 항목: {conflictReport.prohibitedCount}건, 주의 및 전담기관 검토 요망: {conflictReport.warningCount}건)
              </p>
            </div>
          </div>

          {/* 7-Dimension Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conflictReport.findings.map((f, idx) => (
              <Card key={idx} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {f.checkType}
                    </Badge>
                    <Badge
                      className={`text-[10px] font-bold ${
                        f.riskLevel === "PROHIBITED"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : f.riskLevel === "POTENTIAL_CONFLICT"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      } border-none`}
                    >
                      {f.riskLevel}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold mt-1 text-foreground">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-muted-foreground leading-relaxed">{f.description}</p>

                  {f.conflictingOpportunityTitles.length > 0 && (
                    <div className="text-[11px] font-semibold text-primary">
                      관련 사업: {f.conflictingOpportunityTitles.join(", ")}
                    </div>
                  )}

                  <div className="p-2.5 rounded bg-muted/40 text-foreground/90 space-y-1">
                    <div className="font-semibold text-xs text-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      대응 가이드
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{f.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mandatory Advisory Legal Disclaimer */}
          <div className="p-4 rounded-xl border border-muted bg-muted/20 text-muted-foreground text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <HelpCircle className="w-4 h-4 text-primary" />
              규정 검토 준수 및 안내 고지
            </div>
            <p>{conflictReport.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Add New Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                포트폴리오 지원사업 신규 추가
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">지원사업 공고명</label>
                <input
                  type="text"
                  placeholder="예: 2026년 지능형 로봇 기술혁신 R&D"
                  value={newOppTitle}
                  onChange={(e) => setNewOppTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">공고 주관/전담기관</label>
                <input
                  type="text"
                  placeholder="예: 중소벤처기업부, 한국산업기술진흥원"
                  value={newAgency}
                  onChange={(e) => setNewAgency(e.target.value)}
                  className="w-full px-3 py-2 rounded border bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground block mb-1">예상 지원금 (원)</label>
                  <input
                    type="number"
                    step="10000000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded border bg-background text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">진행 상태</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as FundingPortfolioStatus)}
                    className="w-full px-3 py-2 rounded border bg-background text-foreground font-semibold"
                  >
                    <option value="CANDIDATE">CANDIDATE (후보)</option>
                    <option value="PLANNED">PLANNED (계획)</option>
                    <option value="APPLIED">APPLIED (접수)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW (심사)</option>
                    <option value="AWARDED">AWARDED (선정)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button size="sm" variant="ghost" onClick={() => setShowAddModal(false)}>
                취소
              </Button>
              <Button size="sm" onClick={handleAddNewItem} className="bg-primary text-primary-foreground">
                포트폴리오에 등록
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
