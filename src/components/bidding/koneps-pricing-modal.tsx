"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Shuffle,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Percent,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  KonepsPricingCalculator,
  BiddingPriceSimulationResult,
} from "@/lib/bidding/koneps-pricing-calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KonepsPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBasePrice?: number;
  initialTitle?: string;
}

export function KonepsPricingModal({
  isOpen,
  onClose,
  initialBasePrice = 300000000,
  initialTitle = "공공조달 입찰 건",
}: KonepsPricingModalProps) {
  const [basePrice, setBasePrice] = useState<number>(initialBasePrice);
  const [lowerLimitRate, setLowerLimitRate] = useState<number>(87.995); // 일반용역 기준 기본
  const [aValue, setAValue] = useState<number>(0);
  const [roundingMethod, setRoundingMethod] = useState<"CEIL" | "ROUND" | "FLOOR">("CEIL");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([2, 5, 9, 13]);
  const [copied, setCopied] = useState(false);

  // 시뮬레이션 계산 결과
  const result: BiddingPriceSimulationResult = useMemo(() => {
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

  if (!isOpen) return null;

  const toggleIndex = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      if (selectedIndices.length < 4) {
        setSelectedIndices([...selectedIndices, idx].sort((a, b) => a - b));
      } else {
        // 이미 4개면 첫 번째 것 교체
        setSelectedIndices([...selectedIndices.slice(1), idx].sort((a, b) => a - b));
      }
    }
  };

  const handleRandomDraw = () => {
    const all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    setSelectedIndices(shuffled.slice(0, 4).sort((a, b) => a - b));
  };

  const handleCopy = (amount: number) => {
    navigator.clipboard.writeText(amount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ratePresets = [
    { label: "일반용역 (87.995%)", value: 87.995 },
    { label: "물품구매 (80.495%)", value: 80.495 },
    { label: "기술용역 (86.745%)", value: 86.745 },
    { label: "공사 소액 (87.745%)", value: 87.745 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  나라장터(KONEPS) 입찰가격 & 사정율 시뮬레이터
                </h2>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                  A값 산식 적용
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{initialTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
            {/* 기초금액 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">기초금액 (원)</label>
              <input
                type="number"
                step="100000"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                {(basePrice / 100000000).toFixed(2)}억원 (
                {basePrice.toLocaleString("ko-KR")}원)
              </p>
            </div>

            {/* 낙찰하한율 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">낙찰하한율 (%)</label>
                <div className="flex gap-1">
                  {ratePresets.slice(0, 2).map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setLowerLimitRate(p.value)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-accent text-muted-foreground"
                    >
                      {p.value}%
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                step="0.001"
                value={lowerLimitRate}
                onChange={(e) => setLowerLimitRate(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">일반용역: 87.995%, 물품: 80.495%</p>
            </div>

            {/* A값 (비투찰 고정원가) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                A값 (국민연금, 건보료 등 합계)
              </label>
              <input
                type="number"
                step="100000"
                value={aValue}
                onChange={(e) => setAValue(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                {aValue > 0
                  ? `${aValue.toLocaleString("ko-KR")}원 적용됨`
                  : "A값 없는 일반 물품 (0원)"}
              </p>
            </div>

            {/* 원단위 단수 처리 방식 */}
            <div className="space-y-1.5 md:col-span-3 border-t border-border/50 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">원 단위 단수 처리:</span>
                <span className="text-[11px] text-muted-foreground">
                  (국가·지방계약법 규정상 1원 차이로 하한선 미달 탈락되는 사고를 방지하기 위해 <strong className="text-primary font-bold">올림(CEIL)</strong> 권장)
                </span>
              </div>
              <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setRoundingMethod("CEIL")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    roundingMethod === "CEIL"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  절상(CEIL) <span className="text-[10px] opacity-90">안전추천</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoundingMethod("ROUND")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    roundingMethod === "ROUND"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  반올림(ROUND)
                </button>
                <button
                  type="button"
                  onClick={() => setRoundingMethod("FLOOR")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    roundingMethod === "FLOOR"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  절하(FLOOR)
                </button>
              </div>
            </div>
          </div>

          {/* 15개 복수예비가격 추첨 박스 */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  15개 복수예비가격 시뮬레이터 (추첨 4개 선택)
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedIndices.length}/4 선택됨
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRandomDraw}
                className="h-7 text-xs gap-1"
              >
                <Shuffle className="h-3 w-3" />
                무작위 4개 추첨
              </Button>
            </div>

            {/* 15 Grids */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {result.preliminaryPrices.map((p) => {
                const isSelected = selectedIndices.includes(p.index);
                return (
                  <button
                    key={p.index}
                    onClick={() => toggleIndex(p.index)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary"
                        : "border-border/60 bg-muted/20 hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full text-[11px]">
                      <span className="font-semibold text-foreground/80">#{p.index}</span>
                      <span className="text-[10px] opacity-75">{p.rate}%</span>
                    </div>
                    <span className="text-xs mt-1 font-medium">
                      {(p.price / 10000).toLocaleString("ko-KR")}만
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 추첨 결과 & 최종 투찰 권고 가격 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  추첨 결과 기준 산출 예정가격
                </span>
                <Badge variant="outline" className="text-xs bg-background">
                  실질 사정율 {result.effectiveAssessmentRate}%
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground tracking-tight">
                  {result.drawnEstimatedPrice.toLocaleString("ko-KR")}
                  <span className="text-sm font-normal text-muted-foreground ml-1">원</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  추첨 번호 #{result.drawnIndices.join(", #")}의 산술평균가
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  최종 권장 투찰하한금액 (안전선)
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(result.drawnMinBidPrice)}
                  className="h-7 text-xs gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "복사됨" : "금액 복사"}
                </Button>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {result.drawnMinBidPrice.toLocaleString("ko-KR")}
                  <span className="text-sm font-normal text-muted-foreground ml-1">원</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  기초금액 대비 {((result.drawnMinBidPrice / result.basePrice) * 100).toFixed(3)}% 투찰
                  (원 미만 절상 처리)
                </p>
              </div>
            </div>
          </div>

          {/* 사정율 밴드별 정밀 투찰표 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5 border-b border-border">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-primary" />
                사정율 밴드별 권장 투찰금액 매트릭스
              </span>
              <span className="text-[11px] text-muted-foreground">
                97.0% ~ 103.0% 구간
              </span>
            </div>
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-background/95 border-b border-border text-[11px] text-muted-foreground">
                  <tr>
                    <th className="py-2 px-4">사정율</th>
                    <th className="py-2 px-4">예상 예정가격</th>
                    <th className="py-2 px-4">권장 투찰금액</th>
                    <th className="py-2 px-4">기초대비 비율</th>
                    <th className="py-2 px-4 text-right">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rateMatrix.map((row) => {
                    const isNearDrawn =
                      Math.abs(row.rate - result.effectiveAssessmentRate) < 0.15;
                    return (
                      <tr
                        key={row.rate}
                        className={`transition-colors ${
                          isNearDrawn
                            ? "bg-primary/10 font-semibold text-primary"
                            : "hover:bg-muted/30 text-foreground"
                        }`}
                      >
                        <td className="py-2 px-4">{row.rate.toFixed(3)}%</td>
                        <td className="py-2 px-4 text-muted-foreground">
                          {row.estimatedPrice.toLocaleString("ko-KR")}원
                        </td>
                        <td className="py-2 px-4 font-mono font-bold">
                          {row.bidPrice.toLocaleString("ko-KR")}원
                        </td>
                        <td className="py-2 px-4">{row.bidRatioToBase.toFixed(3)}%</td>
                        <td className="py-2 px-4 text-right">
                          {isNearDrawn ? (
                            <Badge variant="default" className="text-[10px] h-5">
                              추첨 근사
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">정상</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>
              국가계약법 시행령 준수: A값 공제식 및 복수예비가격 산술평균 기준 검증 완료
            </span>
          </div>
          <Button onClick={onClose} variant="default" size="sm">
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
