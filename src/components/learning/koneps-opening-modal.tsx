"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  TrendingDown,
  TrendingUp,
  Building,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KonepsOpeningResult } from "@/types/koneps-opening";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface KonepsOpeningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectResult?: (result: KonepsOpeningResult, ourBidPrice?: number) => void;
}

export function KonepsOpeningModal({
  open,
  onOpenChange,
  onSelectResult,
}: KonepsOpeningModalProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<KonepsOpeningResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<KonepsOpeningResult | null>(null);

  // Analysis simulation state
  const [ourBidPrice, setOurBidPrice] = useState<number>(310000000);
  const [analysis, setAnalysis] = useState<any | null>(null);

  if (!open) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const isNum = /^\d+$/.test(query.trim());
      const params = new URLSearchParams();
      if (isNum) {
        params.set("bidNtceNo", query.trim());
      } else if (query.trim()) {
        params.set("bidNtceNm", query.trim());
      }

      const res = await fetch(`/api/koneps/opening-results?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
        if (data.results.length > 0) {
          setSelectedResult(data.results[0]);
          runAnalysis(data.results[0], ourBidPrice);
        } else {
          setSelectedResult(null);
          setAnalysis(null);
          toast.info("조회된 개찰결과가 없습니다.");
        }
      }
    } catch (err: any) {
      toast.error(`개찰결과 조회 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async (result: KonepsOpeningResult, price: number) => {
    try {
      const res = await fetch("/api/koneps/opening-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ourBidPrice: price, openingResult: result }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (r: KonepsOpeningResult) => {
    setSelectedResult(r);
    runAnalysis(r, ourBidPrice);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    setOurBidPrice(val);
    if (selectedResult) {
      runAnalysis(selectedResult, val);
    }
  };

  const handleImportToAar = () => {
    if (!selectedResult) return;
    if (onSelectResult) {
      onSelectResult(selectedResult, ourBidPrice);
    }
    toast.success(`'${selectedResult.bidNtceNm}' 개찰결과가 성과 분석으로 이관되었습니다.`);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border rounded-xl shadow-2xl max-w-4xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                조달청 나라장터 개찰결과(Scsbid) 실시간 조회 및 사후 분석
              </h2>
              <p className="text-xs text-muted-foreground">
                실제 개찰 완료 공고를 조회하여 낙찰 1순위 투찰가, 예가 사상률, 경쟁사 입찰 패턴을 정밀 분석합니다.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="공고번호 (예: 20260831001) 또는 공고명/키워드 (예: 순찰로봇, 안전, SW)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="gap-1.5">
            <Search className="h-4 w-4" />
            <span>{isLoading ? "조회 중..." : "개찰결과 조회"}</span>
          </Button>
        </form>

        {/* Content Layout: Left List + Right Detail */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Results List (5 cols) */}
          <div className="md:col-span-5 space-y-3 border rounded-lg p-3 bg-muted/20 max-h-[450px] overflow-y-auto">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>개찰 공고 목록</span>
              <span>{results.length}건</span>
            </div>

            {results.length === 0 && !isLoading && (
              <div className="text-center py-12 text-xs text-muted-foreground">
                검색어를 입력하고 조회를 클릭하세요.
                <br />
                (빈 칸으로 조회 시 최근 개찰 실증 데이터가 로드됩니다)
              </div>
            )}

            {results.map((item) => {
              const isSelected = selectedResult?.bidNtceNo === item.bidNtceNo;
              return (
                <div
                  key={item.bidNtceNo}
                  onClick={() => handleSelect(item)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 hover:bg-card bg-card/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      No.{item.bidNtceNo}
                    </span>
                    <Badge variant={item.resultStatus === "SUCCESSFUL" ? "default" : "secondary"} className="text-[10px] py-0">
                      {item.resultStatus === "SUCCESSFUL" ? "낙찰완료" : "개찰완료"}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-1">
                    {item.bidNtceNm}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/40">
                    <span>{item.announcingAgency}</span>
                    <span className="font-semibold text-foreground">
                      {item.lwstBdrBidRate ? `${item.lwstBdrBidRate.toFixed(3)}%` : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detail & AAR Simulator (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {selectedResult ? (
              <div className="space-y-4">
                {/* Notice Summary Box */}
                <div className="p-4 bg-muted/30 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-primary font-semibold">
                        {selectedResult.bidNtceNo}-{selectedResult.bidNtceOrd}
                      </span>
                      <h3 className="text-sm font-bold text-foreground mt-0.5">
                        {selectedResult.bidNtceNm}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedResult.announcingAgency} · 참가업체 {selectedResult.totPrtcptBsnmCnt}개사
                      </p>
                    </div>
                  </div>

                  {/* Pricing Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t text-xs">
                    <div className="p-2 bg-card rounded border">
                      <div className="text-muted-foreground text-[10px]">기초금액</div>
                      <div className="font-mono font-semibold">
                        {selectedResult.bsisAmt ? formatCurrency(selectedResult.bsisAmt) : "-"}
                      </div>
                    </div>
                    <div className="p-2 bg-card rounded border">
                      <div className="text-muted-foreground text-[10px]">예정가격 (사상률)</div>
                      <div className="font-mono font-semibold">
                        {selectedResult.plnprc ? formatCurrency(selectedResult.plnprc) : "-"}
                        {selectedResult.estimatedPriceRate && (
                          <span className="text-[10px] text-primary ml-1">
                            ({selectedResult.estimatedPriceRate}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-card rounded border">
                      <div className="text-muted-foreground text-[10px]">1순위 낙찰가 (낙찰률)</div>
                      <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedResult.sucsfBidAmt ? formatCurrency(selectedResult.sucsfBidAmt) : "-"}
                        {selectedResult.sucsfBidRate && (
                          <span className="text-[10px] ml-1">
                            ({selectedResult.sucsfBidRate}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1st Place Company */}
                  <div className="p-2.5 bg-card border rounded flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">1순위 적격 심사 대상자:</span>
                    <span className="font-semibold text-foreground">
                      {selectedResult.sucsfBdrBsnmNm || selectedResult.lwstBdrBsnmNm || "비공개/진행중"}
                    </span>
                  </div>
                </div>

                {/* Our Bid Simulation & Deviation Analysis */}
                <div className="p-4 border rounded-lg space-y-3 bg-card shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                      자사 투찰가 사후 오차 분석 (AAR)
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      1순위 낙찰가 대비 오차율 정밀 검증
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">
                      자사 투찰 금액:
                    </label>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step={100000}
                        value={ourBidPrice}
                        onChange={handlePriceChange}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-background border rounded focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">원</span>
                  </div>

                  {analysis && (
                    <div className="p-3 bg-muted/30 border rounded space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">1순위와의 차액:</span>
                        <span
                          className={`font-mono font-bold ${
                            analysis.difference > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : analysis.difference < 0
                              ? "text-red-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {analysis.difference > 0 ? "+" : ""}
                          {analysis.difference.toLocaleString()}원 ({analysis.deviationRate > 0 ? "+" : ""}
                          {analysis.deviationRate}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground/80 leading-relaxed border-t pt-2 mt-1">
                        {analysis.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      onClick={handleImportToAar}
                      size="sm"
                      className="gap-1.5 w-full sm:w-auto"
                    >
                      <span>이 분석 결과를 성과·학습(AAR)으로 등록</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-muted-foreground border rounded-lg border-dashed">
                좌측 목록에서 분석할 개찰 공고를 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
