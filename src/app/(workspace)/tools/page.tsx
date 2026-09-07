"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Award,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Copy,
  Check,
  Shuffle,
  Users2,
  PieChart,
  Percent,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QualificationChecklistCard } from "@/components/bidding/qualification-checklist-card";
import { BidopsFormulaGuide } from "@/components/bidding/bidops-formula-guide";
import {
  KonepsPricingCalculator,
  BiddingPriceSimulationResult,
} from "@/lib/bidding/koneps-pricing-calculator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Opportunity } from "@/types";
import Link from "next/link";
import { toast } from "sonner";

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<"KONEPS" | "QUALIFICATION" | "RND_BUDGET" | "FORMULA_GUIDE">("KONEPS");

  // KONEPS Pricing State
  const [basePrice, setBasePrice] = useState<number>(500000000);
  const [lowerLimitRate, setLowerLimitRate] = useState<number>(87.995);
  const [aValue, setAValue] = useState<number>(25000000);
  const [roundingMethod, setRoundingMethod] = useState<"CEIL" | "ROUND" | "FLOOR">("CEIL");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([1, 4, 8, 12]);
  const [copied, setCopied] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [isApplying, setIsApplying] = useState(false);

  const openApplyDialog = async () => {
    setApplyDialogOpen(true);
    try {
      const res = await fetch("/api/opportunities?limit=100");
      const data = await res.json();
      if (data.opportunities && data.opportunities.length > 0) {
        setOpportunities(data.opportunities);
        if (!selectedOppId) {
          setSelectedOppId(data.opportunities[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load opportunities:", e);
    }
  };

  const handleApplyToPipeline = async () => {
    if (!selectedOppId) {
      toast.error("적용할 공모를 선택해주세요.");
      return;
    }
    setIsApplying(true);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PRICE",
          opportunityId: selectedOppId,
          estimatedPrice: konepsResult.drawnMinBidPrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `투찰 목표가(${konepsResult.drawnMinBidPrice.toLocaleString()}원)가 공모 파이프라인에 정상 반영되었습니다.`
        );
        setApplyDialogOpen(false);
      } else {
        toast.error(data.error || "반영에 실패했습니다.");
      }
    } catch (e: any) {
      toast.error(e.message || "오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  // R&D Co-funding Calculator State
  const [totalRndBudget, setTotalRndBudget] = useState<number>(1000000000); // 10억원
  const [companyScale, setCompanyScale] = useState<"SME" | "MIDDLE" | "LARGE">("SME"); // 중소 75% 국비, 25% 민간부담
  const [laborRatio, setLaborRatio] = useState<number>(45); // 인건비 45%

  const konepsResult: BiddingPriceSimulationResult = useMemo(() => {
    return KonepsPricingCalculator.simulate(
      {
        basePrice: Math.max(basePrice, 1000000),
        lowerLimitRate,
        aValue,
        roundingMethod,
      },
      selectedIndices.length === 4 ? selectedIndices : undefined
    );
  }, [basePrice, lowerLimitRate, aValue, roundingMethod, selectedIndices]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("투찰권장가가 클립보드에 복사되었습니다.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomDraw = () => {
    const indices: number[] = [];
    while (indices.length < 4) {
      const rand = Math.floor(Math.random() * 15);
      if (!indices.includes(rand)) indices.push(rand);
    }
    setSelectedIndices(indices);
  };

  // R&D Budget Calculations
  const rndGovSupportRate = companyScale === "SME" ? 0.75 : companyScale === "MIDDLE" ? 0.60 : 0.50;
  const rndGovGrant = Math.round(totalRndBudget * rndGovSupportRate);
  const rndPrivateMatching = totalRndBudget - rndGovGrant;
  const rndCashRatio = companyScale === "SME" ? 0.10 : 0.15; // 민간부담금 중 현금 비율 10%
  const rndCashMatching = Math.round(rndPrivateMatching * rndCashRatio);
  const rndInKindMatching = rndPrivateMatching - rndCashMatching; // 현물(인건비/장비)

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            공공입찰·R&D 특화 계산기 허브 (BidOps Tools)
          </h1>
          <Badge variant="outline" className="text-xs">
            법정 산식 준수
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          국가계약법 A값 공제 투찰가 계산, 조달청 100점 적격심사 모의 진단 및 R&D 정부지원금 자기부담금 산식을 지원합니다.
        </p>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b pb-2">
        <Button
          variant={activeTab === "KONEPS" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("KONEPS")}
          className="text-xs gap-1.5"
        >
          <TrendingDown className="h-4 w-4" />
          <span>나라장터(KONEPS) 투찰가 & 사정율</span>
        </Button>
        <Button
          variant={activeTab === "QUALIFICATION" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("QUALIFICATION")}
          className="text-xs gap-1.5"
        >
          <Award className="h-4 w-4" />
          <span>공공입찰 적격심사 100점 진단기</span>
        </Button>
        <Button
          variant={activeTab === "RND_BUDGET" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("RND_BUDGET")}
          className="text-xs gap-1.5"
        >
          <DollarSign className="h-4 w-4" />
          <span>R&D 사업비 & 자기부담금 시뮬레이터</span>
        </Button>
        <Button
          variant={activeTab === "FORMULA_GUIDE" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("FORMULA_GUIDE")}
          className="text-xs gap-1.5 font-bold"
        >
          <Scale className="h-4 w-4 text-primary" />
          <span>산식·근거·법정규정 백서</span>
          <Badge variant="outline" className="text-[10px] ml-1 bg-primary/10 text-primary border-primary/30">
            필수 확인
          </Badge>
        </Button>
      </div>

      {/* TAB 1: KONEPS Pricing Calculator */}
      {activeTab === "KONEPS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Controls */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">입찰 조건 입력</CardTitle>
                <CardDescription className="text-xs">
                  공고서에 명시된 기초금액과 A값을 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">
                    기초금액 (원)
                  </label>
                  <input
                    type="number"
                    step={1000000}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border rounded-md font-mono text-foreground focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {basePrice.toLocaleString()}원
                  </span>
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">
                    낙찰하한율 (%)
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    {[
                      { rate: 87.995, label: "용역 87.995%" },
                      { rate: 80.495, label: "물품 80.495%" },
                      { rate: 86.745, label: "기술 86.745%" },
                    ].map((item) => (
                      <button
                        key={item.rate}
                        type="button"
                        onClick={() => setLowerLimitRate(item.rate)}
                        className={`px-2 py-1 text-[10px] rounded border font-mono ${
                          lowerLimitRate === item.rate
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step={0.001}
                    value={lowerLimitRate}
                    onChange={(e) => setLowerLimitRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border rounded-md font-mono text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">
                    A값 (국민연금 등 고정비, 원)
                  </label>
                  <input
                    type="number"
                    step={1000000}
                    value={aValue}
                    onChange={(e) => setAValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border rounded-md font-mono text-foreground focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {aValue.toLocaleString()}원 (공제 적용 공식)
                  </span>
                </div>

                <div>
                  <label className="block text-muted-foreground font-medium mb-1">
                    단수 처리 방식 (원단위)
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { key: "CEIL", label: "절상 (안전 권장)" },
                      { key: "ROUND", label: "반올림" },
                      { key: "FLOOR", label: "절하" },
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setRoundingMethod(m.key as any)}
                        className={`py-1.5 text-[10px] rounded border font-medium ${
                          roundingMethod === m.key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results & 15 Random Multiple Reserve Prices */}
            <div className="md:col-span-2 space-y-4">
              {/* Recommended Price Display Banner */}
              <div className="p-5 rounded-xl border bg-card/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground">
                    최종 권장 투찰 금액 (A값 공제 반영)
                  </span>
                  <div className="text-2xl font-bold font-mono text-primary mt-1">
                    {konepsResult.drawnMinBidPrice.toLocaleString()}원
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    예정가격 대비 {( (konepsResult.drawnMinBidPrice / konepsResult.drawnEstimatedPrice) * 100 ).toFixed(3)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    onClick={() => handleCopy(konepsResult.drawnMinBidPrice.toString())}
                    variant="outline"
                    className="gap-1.5 text-xs font-bold"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "복사 완료!" : "투찰가 복사"}</span>
                  </Button>
                  <Button
                    onClick={openApplyDialog}
                    className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <TrendingDown className="h-4 w-4" />
                    <span>파이프라인에 적용</span>
                  </Button>
                </div>
              </div>

              {/* 15 Reserve Prices Grid */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold">15개 복수예비가격 추첨 시뮬레이션</CardTitle>
                      <CardDescription className="text-xs">
                        기초금액 ±3% 난수 중 4개를 선택하여 산술평균 예정가격을 도출합니다.
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRandomDraw}
                      className="h-7 text-xs gap-1"
                    >
                      <Shuffle className="h-3.5 w-3.5" /> 자동 4개 추첨
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                    {konepsResult.preliminaryPrices.map((p, idx) => {
                      const isSelected = selectedIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedIndices(selectedIndices.filter((i) => i !== idx));
                            } else if (selectedIndices.length < 4) {
                              setSelectedIndices([...selectedIndices, idx]);
                            }
                          }}
                          className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 font-bold text-primary"
                              : "bg-muted/30 text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          <span className="block text-[10px] font-mono">No. {idx + 1}</span>
                          <span className="block font-mono text-[11px] mt-0.5">
                            {p.price.toLocaleString()}원
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Qualification Evaluator */}
      {activeTab === "QUALIFICATION" && (
        <QualificationChecklistCard
          targetEstimatedPrice={basePrice}
          initialTrackRecord={450000000}
        />
      )}

      {/* TAB 3: R&D Co-funding Calculator */}
      {activeTab === "RND_BUDGET" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">R&D 사업비 조건</CardTitle>
              <CardDescription className="text-xs">
                정부 R&D 혁신법 기준 민간부담금 비율을 계산합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  총 연구개발비 (원)
                </label>
                <input
                  type="number"
                  step={10000000}
                  value={totalRndBudget}
                  onChange={(e) => setTotalRndBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border rounded-md font-mono text-foreground focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground">
                  {(totalRndBudget / 100000000).toFixed(1)}억원
                </span>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  주관기업 규모
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { key: "SME", label: "중소기업 (75%)" },
                    { key: "MIDDLE", label: "중견기업 (60%)" },
                    { key: "LARGE", label: "대기업 (50%)" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setCompanyScale(s.key as any)}
                      className={`py-1.5 text-[10px] rounded border font-medium ${
                        companyScale === s.key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  인건비 비중 (%)
                </label>
                <input
                  type="number"
                  value={laborRatio}
                  onChange={(e) => setLaborRatio(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border rounded-md font-mono text-foreground focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground">
                  연구원 현물 출자 가능 인건비
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">비목별 정부출연금 및 자기부담금 산출표</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                  <span className="text-[11px] text-muted-foreground">정부 지원금 (국비)</span>
                  <div className="text-xl font-bold font-mono text-primary mt-1">
                    {rndGovGrant.toLocaleString()}원
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {(rndGovSupportRate * 100).toFixed(0)}% 국비 보조
                  </span>
                </div>

                <div className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
                  <span className="text-[11px] text-muted-foreground">민간 현금 부담금</span>
                  <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                    {rndCashMatching.toLocaleString()}원
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    실제 납입 필요 자금
                  </span>
                </div>

                <div className="p-3 rounded-lg border bg-muted/40">
                  <span className="text-[11px] text-muted-foreground">민간 현물 부담금</span>
                  <div className="text-xl font-bold font-mono text-foreground mt-1">
                    {rndInKindMatching.toLocaleString()}원
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    기존 인건비·장비 대체
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border space-y-1.5 text-[11px] text-muted-foreground">
                <div className="font-bold text-foreground">💡 R&D 사업계획서 작성 팁</div>
                <p>• 중소기업의 경우 기존 연구인력 인건비를 100% 현물로 계상하여 회사 현금 유출을 최소화할 수 있습니다.</p>
                <p>• 신규 채용 청년인력의 경우 인건비 전액을 정부지원금(현금)으로 지원받을 수 있습니다.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: Formula & Regulations Guide */}
      {activeTab === "FORMULA_GUIDE" && <BidopsFormulaGuide />}

      {/* Apply to Pipeline Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              공모 파이프라인에 투찰가 반영
            </DialogTitle>
            <DialogDescription className="text-xs">
              A값 공제 계산 결과인 <strong>{konepsResult.drawnMinBidPrice.toLocaleString()}원</strong>을 선택하신 공모의 목표 투찰가(Estimated Price)로 저장합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {opportunities.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/40 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  현재 등록된 공모가 없습니다. 공모 탐색 메뉴에서 공고를 먼저 등록하거나 수집해 주세요.
                </p>
                <Link href="/opportunities">
                  <Button size="sm" variant="outline" className="text-xs mt-2">
                    공모 탐색 바로가기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  적용할 공모 선택
                </label>
                <select
                  value={selectedOppId}
                  onChange={(e) => setSelectedOppId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      [{opp.announcingAgency}] {opp.title.slice(0, 35)}...
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  반영 후 해당 공모의 상세 카드 및 제안서/제출마감 점검 화면에서 목표가가 동기화됩니다.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApplyDialogOpen(false)}
              className="text-xs"
            >
              취소
            </Button>
            {opportunities.length > 0 && (
              <Button
                size="sm"
                onClick={handleApplyToPipeline}
                disabled={isApplying || !selectedOppId}
                className="text-xs font-bold gap-1.5"
              >
                {isApplying ? "반영 중..." : "목표가 확정 반영"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
