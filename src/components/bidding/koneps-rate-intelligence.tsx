"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Calculator,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KonepsPricingModal } from "@/components/bidding/koneps-pricing-modal";

interface RateBucket {
  range: string;
  rate: number;
  percentage: number;
  status: "LOW" | "POPULAR" | "HIGH";
  description: string;
}

const HISTOGRAM_DATA: RateBucket[] = [
  { range: "97.5% ~ 98.0%", rate: 97.8, percentage: 4, status: "LOW", description: "극저가 형성 구간" },
  { range: "98.0% ~ 98.5%", rate: 98.3, percentage: 8, status: "LOW", description: "저가 편향 예비가격" },
  { range: "98.5% ~ 99.0%", rate: 98.8, percentage: 14, status: "POPULAR", description: "다빈도 입찰 구간" },
  { range: "99.0% ~ 99.5%", rate: 99.3, percentage: 22, status: "POPULAR", description: "주요 낙찰 밀집 구간 A" },
  { range: "99.5% ~ 100.0%", rate: 99.8, percentage: 26, status: "POPULAR", description: "최다 빈도 골든존 (중앙값)" },
  { range: "100.0% ~ 100.5%", rate: 100.3, percentage: 16, status: "POPULAR", description: "주요 낙찰 밀집 구간 B" },
  { range: "100.5% ~ 101.0%", rate: 100.8, percentage: 7, status: "HIGH", description: "고가 편향 예비가격" },
  { range: "101.0% ~ 101.5%", rate: 101.3, percentage: 2, status: "HIGH", description: "희소 추첨 구간" },
  { range: "101.5% ~ 102.0%", rate: 101.8, percentage: 1, status: "HIGH", description: "극고가 형성 구간" },
];

export function KonepsRateIntelligence() {
  const [selectedBasePrice, setSelectedBasePrice] = useState<number>(350000000);
  const [selectedSector, setSelectedSector] = useState<"SERVICE" | "GOODS" | "TECH">("SERVICE");
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Sector Lower Limit Rates
  const sectorInfo = {
    SERVICE: { name: "일반/SW용역", lowerLimit: 87.995, desc: "로봇 관제, AI 알고리즘 구축, SI 개발 등" },
    GOODS: { name: "물품구매(제조)", lowerLimit: 80.495, desc: "AGV 물류로봇, 센서 하드웨어, 완제품 납품 등" },
    TECH: { name: "기술용역", lowerLimit: 86.745, desc: "설계, 감리, R&D 타당성 엔지니어링 용역 등" },
  };

  const currentSector = sectorInfo[selectedSector];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                나라장터 사정율 인텔리전스 & 낙찰분포 히스토그램
              </h2>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                KONEPS 통계 분석
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              최근 공공입찰 15개 복수예비가격 추첨 패턴과 98%~102% 사정율 정규분포(Bell Curve)를 분석하여 최적 낙찰 투찰가를 도출합니다.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setPricingModalOpen(true)}
            className="gap-2 shadow-xs shrink-0"
          >
            <Calculator className="h-4 w-4" />
            <span>실전 투찰가 시뮬레이터</span>
          </Button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">사업 분야 선택</label>
          <div className="flex gap-2">
            {(Object.keys(sectorInfo) as Array<keyof typeof sectorInfo>).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSector(sec)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                  selectedSector === sec
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {sectorInfo[sec].name} ({sectorInfo[sec].lowerLimit}%)
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">{currentSector.desc}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">모의 기초금액 (원)</label>
            <span className="text-xs font-bold text-primary">
              {(selectedBasePrice / 100000000).toFixed(1)}억원 ({selectedBasePrice.toLocaleString("ko-KR")}원)
            </span>
          </div>
          <input
            type="range"
            min="50000000"
            max="2000000000"
            step="10000000"
            value={selectedBasePrice}
            onChange={(e) => setSelectedBasePrice(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5,000만원</span>
            <span>5억원</span>
            <span>10억원</span>
            <span>20억원</span>
          </div>
        </div>
      </div>

      {/* Bell Curve Histogram Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span>사정율(Assessment Rate) 추첨 빈도 분포도 (97.5% ~ 102.0%)</span>
                <Badge variant="secondary" className="text-[10px]">
                  정규분포 68-95 법칙 적용
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                기초금액 기준 15개 복수예비가격 중 무작위 4개가 추첨되어 산술평균되는 예정가격 사정율의 통계적 빈도입니다.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded bg-primary/20" /> 일반 구간
              </span>
              <span className="flex items-center gap-1 font-semibold text-primary">
                <span className="h-2.5 w-2.5 rounded bg-primary" /> 골든존 (최다 낙찰)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-56 flex items-end justify-between gap-2 pt-8 pb-2 px-2 bg-muted/10 rounded-xl border border-border/50">
            {HISTOGRAM_DATA.map((bucket) => {
              const isGolden = bucket.percentage >= 20;
              const heightPct = Math.round((bucket.percentage / 26) * 100);
              const estPrice = Math.round(selectedBasePrice * (bucket.rate / 100));
              const bidLowerPrice = Math.round(estPrice * (currentSector.lowerLimit / 100));

              return (
                <div
                  key={bucket.range}
                  className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-20 z-20 hidden group-hover:flex flex-col items-center bg-popover text-popover-foreground border border-border text-[11px] p-2 rounded-lg shadow-xl whitespace-nowrap min-w-[140px] pointer-events-none">
                    <span className="font-bold">{bucket.range}</span>
                    <span className="text-primary font-semibold">
                      추첨 확률: {bucket.percentage}%
                    </span>
                    <span className="text-muted-foreground">
                      투찰선: {(bidLowerPrice / 10000).toLocaleString("ko-KR")}만원
                    </span>
                  </div>

                  {/* Percentage label */}
                  <span className={`text-[11px] font-bold ${isGolden ? "text-primary scale-105" : "text-muted-foreground"}`}>
                    {bucket.percentage}%
                  </span>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-90 ${
                      isGolden
                        ? "bg-primary shadow-md shadow-primary/20"
                        : "bg-primary/30 group-hover:bg-primary/50"
                    }`}
                  />

                  {/* Range Label */}
                  <span className="text-[10px] text-muted-foreground font-mono truncate max-w-full text-center mt-1">
                    {bucket.rate.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Golden Zone Target Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg border border-primary/30 bg-primary/5 space-y-1">
              <span className="text-xs font-semibold text-primary block">최다 밀집 사정율 (골든존)</span>
              <p className="text-lg font-bold text-foreground">99.300% ~ 99.850%</p>
              <p className="text-[11px] text-muted-foreground">
                전체 개찰 결과의 약 48%가 이 0.5%p 범위 내에서 최종 결정됩니다.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
              <span className="text-xs font-semibold text-foreground block">
                {currentSector.name} 권장 투찰 금액
              </span>
              <p className="text-lg font-bold text-primary">
                {(
                  Math.round(selectedBasePrice * 0.995 * (currentSector.lowerLimit / 100)) / 10000
                ).toLocaleString("ko-KR")}
                만원
              </p>
              <p className="text-[11px] text-muted-foreground">
                사정율 99.5% 가정 시 낙찰하한선 (소수점 올림 처리)
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
              <span className="text-xs font-semibold text-foreground block">
                적격심사 1순위 통과 기준
              </span>
              <p className="text-lg font-bold text-emerald-600">낙찰하한율 이상 최저가</p>
              <p className="text-[11px] text-muted-foreground">
                낙찰하한율 미달 시 무조건 탈락, 동가 발생 시 적격심사 점수 우선
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tactical Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">1. A값 공제 산식 활용법</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            국민건강보험료, 연금보험료 등 비투찰 고정비(A값)가 공고에 명시된 경우,
            <code className="text-primary font-semibold ml-1">
              (예정가격 - A) × 하한율 + A
            </code>
            산식을 적용해야 탈락을 면합니다. 단순 요율 곱셈 투찰 시 하한가 미달로 탈락합니다.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-foreground">2. 1원 차이 탈락 방지 (CEIL)</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            낙찰하한가 산출 시 원 단위 소수점이 발생하면 반드시 <strong>절상(CEIL, 올림)</strong>해야
            합니다. 1원이라도 하한선 밑으로 내려가면 최저가 자격이 박탈되고 2순위 업체에 낙찰권이 넘어갑니다.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold text-foreground">3. 경쟁사 심리 배팅 전략</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            다수 경쟁자가 100.0% 중앙값을 정조준하므로, 경쟁 강도가 높은 건일수록
            <strong> 99.4% ~ 99.6%</strong> 구간의 4개 추첨 조합을 노려 근소한 가격 우위를 확보하는 전략이 유효합니다.
          </p>
        </div>
      </div>

      {/* Modal */}
      <KonepsPricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        initialBasePrice={selectedBasePrice}
        initialTitle={`${currentSector.name} 투찰 시뮬레이션 (${(selectedBasePrice / 100000000).toFixed(1)}억원)`}
      />
    </div>
  );
}
