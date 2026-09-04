"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Layers,
  ExternalLink,
  RefreshCw,
  Building,
  Calculator,
  Award,
  UploadCloud,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Plus,
  Copy,
  Table,
  Kanban,
  FileUp,
  GitPullRequest,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { KonepsPricingModal } from "@/components/bidding/koneps-pricing-modal";
import { BidDecisionModal } from "@/components/opportunities/bid-decision-modal";
import { Opportunity360Workspace } from "@/components/opportunities/opportunity-360-workspace";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { Opportunity, BidType } from "@/types";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selected360Opportunity, setSelected360Opportunity] = useState<Opportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "KANBAN">("TABLE");
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // Form State for Manual Input
  const [formTitle, setFormTitle] = useState("");
  const [formAgency, setFormAgency] = useState("");
  const [formBidType, setFormBidType] = useState<BidType>("R_AND_D");
  const [formBudget, setFormBudget] = useState<number>(500000000);
  const [formDeadline, setFormDeadline] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [formUrl, setFormUrl] = useState("");

  // Pricing Modal State
  const [pricingModalTarget, setPricingModalTarget] = useState<{
    open: boolean;
    basePrice: number;
    title: string;
  }>({
    open: false,
    basePrice: 300000000,
    title: "공공조달 건",
  });

  // Decision Modal State
  const [decisionModalTarget, setDecisionModalTarget] = useState<{
    open: boolean;
    opportunity: Opportunity | null;
  }>({
    open: false,
    opportunity: null,
  });

  const loadData = () => {
    setIsLoading(true);
    try {
      const all = opportunityStore.getAll();
      setOpportunities(all);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncKoneps = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/ingestion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: "koneps",
          keyword: searchQuery.trim() || "로봇",
          fallbackToMock: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.result?.items?.length) {
        opportunityStore.upsertFromApi(data.result.items);
        toast.success(`조달청 나라장터 공고 ${data.result.items.length}건이 성공적으로 동기화되었습니다.`);
        loadData();
      } else {
        toast.info("동기화할 신규 공고가 없거나 조회에 실패했습니다.");
      }
    } catch (err: any) {
      toast.error(`동기화 중 오류 발생: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDuplicate = (id: string) => {
    const copy = opportunityStore.duplicate(id);
    toast.success(`'${copy.title}' 복제본이 Inbox에 생성되었습니다.`);
    loadData();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    opportunityStore.createManual({
      title: formTitle,
      announcingAgency: formAgency || "자체 등록 기관",
      bidType: formBidType,
      allocatedBudget: formBudget,
      submissionDeadline: `${formDeadline}T18:00:00Z`,
      canonicalUrl: formUrl || undefined,
      dataSource: "USER_INPUT",
      status: "INBOX",
    });

    toast.success("공모가 사용자 입력 데이터로 성공적으로 등록되었습니다.");
    setManualModalOpen(false);
    setFormTitle("");
    setFormAgency("");
    loadData();
  };

  const handleCsvImport = () => {
    const sampleRows = [
      {
        title: "2026 지자체 지능형 화재순찰로봇 실증 보급사업",
        agency: "소방청 / 경기도소방재난본부",
        budget: 650000000,
        deadline: "2026-09-28T18:00:00Z",
        bidType: "DEMONSTRATION" as BidType,
      },
      {
        title: "2026 제조현장 로봇활용 스마트공장 솔루션 지원사업",
        agency: "중소벤처기업진흥공단",
        budget: 420000000,
        deadline: "2026-10-05T18:00:00Z",
        bidType: "SUBSIDY_SUPPORT" as BidType,
      },
    ];
    opportunityStore.importBatchCsv(sampleRows);
    toast.success("CSV 샘플 공모 2건이 일괄 등록되었습니다.");
    setCsvModalOpen(false);
    loadData();
  };

  const filteredOpps = opportunities.filter((opp) => {
    if (selectedType !== "ALL" && opp.bidType !== selectedType) return false;
    if (selectedStatus !== "ALL" && opp.status !== selectedStatus) return false;
    if (
      searchQuery &&
      !opp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !opp.announcingAgency.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              공모 관리 시스템 (Opportunity Operations)
            </h1>
            <Badge variant="outline" className="text-xs">
              14단계 수명주기
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            직접 등록, 공고문 파일 업로드, CSV 일괄 가져오기를 통해 외부 공모를 인입하고 전주기를 관리합니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleSyncKoneps}
            disabled={isSyncing}
            size="sm"
            variant="secondary"
            className="gap-1.5 border border-primary/20 text-primary hover:bg-primary/10"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            <span>{isSyncing ? "동기화 중..." : "나라장터 실시간 동기화"}</span>
          </Button>
          <Button onClick={() => setManualModalOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>공모 직접 등록</span>
          </Button>
          <Button onClick={() => setCsvModalOpen(true)} size="sm" variant="outline" className="gap-1.5">
            <FileUp className="h-4 w-4" />
            <span>CSV 일괄 등록</span>
          </Button>
          <div className="border-l pl-2 flex items-center gap-1">
            <Button
              variant={viewMode === "TABLE" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("TABLE")}
              title="테이블 뷰"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "KANBAN" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("KANBAN")}
              title="칸반 뷰"
            >
              <Kanban className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. API Connection Status Info Box */}
      <div className="p-3 bg-muted/40 border rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            공공 API 수집 엔진: <strong className="text-foreground">조달청 나라장터 (KONEPS) 실시간 어댑터 활성화됨</strong> — 키워드 수집 및 개찰결과 자동 연동
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px]">
            API 수집 {opportunities.filter(o => o.dataSource === "API").length}건 / 총 {opportunities.length}건
          </span>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="공고명, 기관명 검색..."
              className="w-full pl-8 pr-3 py-1.5 bg-card border rounded-md text-foreground focus:outline-none"
            />
          </div>

          {/* BidType filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 px-2 bg-card border rounded-md text-foreground focus:outline-none"
          >
            <option value="ALL">전체 사업유형</option>
            <option value="R_AND_D">R&D 기술개발</option>
            <option value="DEMONSTRATION">실증사업</option>
            <option value="SUBSIDY_SUPPORT">정부지원사업</option>
            <option value="PROCUREMENT">구매·조달</option>
            <option value="SERVICE">용역</option>
            <option value="LOCAL_GOV">지자체 공모</option>
            <option value="NATIONAL_PROJECT">국비사업</option>
            <option value="PPP">민관협력(PPP)</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2 bg-card border rounded-md text-foreground focus:outline-none"
          >
            <option value="ALL">전체 상태</option>
            <option value="INBOX">접수대기 (INBOX)</option>
            <option value="REVIEWING">검토중</option>
            <option value="GO">참여결정 (GO)</option>
            <option value="HOLD">보류 (HOLD)</option>
            <option value="NO_GO">불참 (NO-GO)</option>
            <option value="SUBMISSION_READY">제출대기</option>
            <option value="SUBMITTED">제출완료</option>
          </select>
        </div>
      </div>

      {/* 4. Table View */}
      {viewMode === "TABLE" ? (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-3 w-28">출처/상태</th>
                  <th className="p-3">공모명 및 발주처</th>
                  <th className="p-3 w-24">사업유형</th>
                  <th className="p-3 w-32">배정 예산</th>
                  <th className="p-3 w-28">마감일자</th>
                  <th className="p-3 w-48 text-right">업무 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOpps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      해당 조건의 공모가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredOpps.map((opp) => (
                    <tr key={opp.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded w-fit ${
                              opp.status === "GO"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : opp.status === "HOLD"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : opp.status === "NO_GO"
                                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {opp.status}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {opp.dataSource || "DEMO"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground line-clamp-1">
                            {opp.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {opp.announcingAgency}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {opp.bidType}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono font-semibold">
                        {(opp.allocatedBudget || 0).toLocaleString()}원
                      </td>
                      <td className="p-3 font-mono text-destructive">
                        {opp.submissionDeadline.split("T")[0]}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            onClick={() => setSelected360Opportunity(opp)}
                            className="h-7 text-xs px-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            360°
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDecisionModalTarget({ open: true, opportunity: opp });
                            }}
                            className="h-7 text-xs px-2"
                          >
                            결정
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setPricingModalTarget({
                                open: true,
                                basePrice: opp.allocatedBudget || 300000000,
                                title: opp.title,
                              })
                            }
                            className="h-7 text-xs px-2"
                          >
                            투찰
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicate(opp.id)}
                            className="h-7 text-xs px-1.5 text-muted-foreground"
                            title="공모 복제"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          {["INBOX", "REVIEWING", "GO", "HOLD"].map((colStatus) => {
            const colOpps = filteredOpps.filter((o) => o.status === colStatus);
            return (
              <div key={colStatus} className="rounded-xl border bg-card/40 p-3 min-h-[400px]">
                <div className="flex justify-between items-center mb-3 pb-2 border-b">
                  <span className="font-bold text-foreground">{colStatus}</span>
                  <span className="font-mono text-muted-foreground">{colOpps.length}</span>
                </div>
                <div className="space-y-2.5">
                  {colOpps.map((opp) => (
                    <div key={opp.id} className="p-3 rounded-lg border bg-card shadow-sm space-y-1.5">
                      <span className="text-[10px] text-muted-foreground">{opp.announcingAgency}</span>
                      <h4 className="font-bold text-foreground line-clamp-2">{opp.title}</h4>
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="font-mono text-destructive text-[10px]">
                          {opp.submissionDeadline.split("T")[0]}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => setSelected360Opportunity(opp)}
                            className="h-6 text-[10px] px-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                          >
                            360°
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDecisionModalTarget({ open: true, opportunity: opp })}
                            className="h-6 text-[10px] px-2"
                          >
                            결정
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Input Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-xl shadow-xl p-5 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                공모 직접 수동 등록
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">공고명</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="예: 2026 로봇 혁신기술 R&D 과제 공모"
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">발주/공고 기관</label>
                <input
                  type="text"
                  required
                  value={formAgency}
                  onChange={(e) => setFormAgency(e.target.value)}
                  placeholder="예: 중소벤처기업부 / TIPA"
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">사업유형</label>
                  <select
                    value={formBidType}
                    onChange={(e) => setFormBidType(e.target.value as BidType)}
                    className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                  >
                    <option value="R_AND_D">R&D</option>
                    <option value="DEMONSTRATION">실증사업</option>
                    <option value="SUBSIDY_SUPPORT">정부지원사업</option>
                    <option value="PROCUREMENT">구매·조달</option>
                    <option value="SERVICE">용역</option>
                    <option value="LOCAL_GOV">지자체 공모</option>
                    <option value="NATIONAL_PROJECT">국비사업</option>
                    <option value="PPP">민관협력</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">배정예산 (원)</label>
                  <input
                    type="number"
                    step={10000000}
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border rounded-md text-foreground font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">접수 마감일자</label>
                <input
                  type="date"
                  required
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">원문 공고 URL (선택)</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setManualModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit" size="sm">
                  등록 완료
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Batch Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-xl shadow-xl p-5 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileUp className="h-4 w-4 text-primary" />
                CSV 파일 공모 일괄 등록
              </h3>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                닫기
              </button>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              CSV 파일(공고명, 발주처, 예산, 마감일, 사업유형 컬럼)을 업로드하여 여러 공모를 한 번에 인입합니다.
            </p>

            <div className="p-6 border border-dashed rounded-lg text-center space-y-2 bg-muted/20">
              <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">CSV 파일을 이곳에 끌어다 놓으세요</p>
              <span className="text-[11px] text-muted-foreground">또는 샘플 데이터 일괄 로드</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCsvModalOpen(false)}
              >
                취소
              </Button>
              <Button size="sm" onClick={handleCsvImport}>
                샘플 CSV 일괄 적재 실행
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bidding Pricing Simulator Modal */}
      <KonepsPricingModal
        isOpen={pricingModalTarget.open}
        onClose={() => setPricingModalTarget((prev) => ({ ...prev, open: false }))}
        initialBasePrice={pricingModalTarget.basePrice}
        initialTitle={pricingModalTarget.title}
      />

      {/* Decision Modal */}
      {decisionModalTarget.opportunity && (
        <BidDecisionModal
          open={decisionModalTarget.open}
          onOpenChange={(open) => setDecisionModalTarget((prev) => ({ ...prev, open }))}
          opportunity={decisionModalTarget.opportunity}
          onDecisionRecorded={() => {
            loadData();
          }}
        />
      )}

      {/* Opportunity 360° Workspace Modal */}
      {selected360Opportunity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-5xl h-[92vh] flex flex-col">
            <Opportunity360Workspace
              opportunity={selected360Opportunity}
              onClose={() => setSelected360Opportunity(null)}
              onOpenDecisionModal={(opp) => {
                setDecisionModalTarget({ open: true, opportunity: opp });
              }}
              onNavigateToProposal={() => {
                window.location.href = `/proposals`;
              }}
              onNavigateToRfp={() => {
                window.location.href = `/rfp`;
              }}
              onNavigateToBidRoom={() => {
                window.location.href = `/pipeline`;
              }}
              onCreateTask={() => {
                window.location.href = `/tasks`;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
