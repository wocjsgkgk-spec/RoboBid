"use client";

import React, { useState } from "react";
import { AgencyIntelligenceRecord } from "@/types/p1";
import { p1Store } from "@/lib/p1/p1-store";
import {
  Building2,
  TrendingUp,
  Award,
  AlertCircle,
  Lightbulb,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AgencyIntelligenceView() {
  const [agencies, setAgencies] = useState<AgencyIntelligenceRecord[]>(
    p1Store.getAgencyIntelligenceList()
  );
  const [selectedId, setSelectedId] = useState<string>(agencies[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = agencies.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.agencyName.toLowerCase().includes(q) ||
        a.internalStrategyNotes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selected = agencies.find((a) => a.id === selectedId) || agencies[0];

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground ml-1" />
          <input
            type="text"
            placeholder="발주기관명 검색 (TIPA, 조달청, NIPA 등)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          총 {agencies.length}개 주요 공공 발주기관 분석
        </Badge>
      </div>

      {/* Main Grid: Agency List on Left, Deep Intel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Agency Cards */}
        <div className="lg:col-span-4 space-y-2.5">
          {filtered.map((agency) => {
            const isSelected = agency.id === selected?.id;
            return (
              <div
                key={agency.id}
                onClick={() => setSelectedId(agency.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "bg-card hover:border-border/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {agency.agencyType === "RESEARCH_INST"
                      ? "전문연구기관"
                      : agency.agencyType === "CENTRAL_GOV"
                      ? "중앙행정기관"
                      : "공공기관"}
                  </Badge>
                  <span className="text-[11px] font-mono font-bold text-primary">
                    수주율 {agency.winRatePercent}%
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">
                  {agency.agencyName}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t">
                  <span>과거 지원: {agency.totalBidsCount}건</span>
                  <span>
                    선정 <strong className="text-emerald-600">{agency.wonBidsCount}</strong> · 탈락 {agency.lostBidsCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Intelligence View */}
        <div className="lg:col-span-8">
          {selected ? (
            <Card className="border shadow-sm bg-card">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg font-bold">
                        {selected.agencyName}
                      </CardTitle>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
                        {selected.annualBudgetRange}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      자사 과거 입찰 지원 {selected.totalBidsCount}회 중 {selected.wonBidsCount}회 선정 (수주 성공률 {selected.winRatePercent}%)
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[10px] text-muted-foreground">선정 (WON)</div>
                      <div className="text-lg font-bold font-mono text-emerald-600">{selected.wonBidsCount}건</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                      <div className="text-[10px] text-muted-foreground">탈락 (LOST)</div>
                      <div className="text-lg font-bold font-mono text-rose-600">{selected.lostBidsCount}건</div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-5">
                {/* 1. Evaluation Focus Patterns */}
                <div>
                  <h5 className="text-xs font-bold text-foreground mb-2.5 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    기관 핵심 평가위원 성향 및 중점 착안사항
                  </h5>
                  <div className="space-y-2.5">
                    {selected.evaluationFocusPatterns.map((pat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border bg-muted/30 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground flex items-center gap-2">
                            {pat.axis}
                            <Badge
                              className={`text-[9px] ${
                                pat.importance === "CRITICAL"
                                  ? "bg-rose-600 text-white"
                                  : "bg-amber-500 text-white"
                              }`}
                            >
                              {pat.importance}
                            </Badge>
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {pat.description}
                        </p>
                        <div className="p-2 rounded bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-[11px] flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="mr-1">수주 공략 팁:</strong>
                            {pat.tip}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Internal Strategy Memo */}
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <h6 className="text-xs font-bold text-primary">
                      사내 수주 전략 메모 (Internal Strategy Notes)
                    </h6>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {selected.internalStrategyNotes}
                  </p>
                </div>

                {/* 3. Recent Bidding History */}
                <div>
                  <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    최근 입찰 참가 이력
                  </h5>
                  <div className="divide-y border rounded-lg overflow-hidden text-xs">
                    {selected.recentAnnouncements.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 flex items-center justify-between gap-3 bg-card"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {item.year}년도 · 예산 {(item.budget / 100000000).toFixed(1)}억원
                          </div>
                        </div>
                        <Badge
                          className={
                            item.outcome === "WON"
                              ? "bg-emerald-600 text-white"
                              : item.outcome === "LOST"
                              ? "bg-muted text-muted-foreground"
                              : "bg-indigo-600 text-white"
                          }
                        >
                          {item.outcome === "WON"
                            ? "최종 선정"
                            : item.outcome === "LOST"
                            ? "탈락"
                            : "진행 중"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
