"use client";

import React, { useState } from "react";
import { CapabilityGapItem } from "@/types/p1";
import { p1Store } from "@/lib/p1/p1-store";
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Award,
  ArrowRight,
  TrendingDown,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CapabilityGapAnalysisProps {
  onOpenPartnerPool?: () => void;
}

export function CapabilityGapAnalysis({ onOpenPartnerPool }: CapabilityGapAnalysisProps) {
  const summary = p1Store.getCapabilityGapSummary();

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              사내 수주 역량 결격·부족 갭 분석 (Capability Gap Analysis)
            </h3>
            <Badge className="bg-rose-600 text-white text-[10px] font-bold">
              최근 공모 {summary.totalEvaluatedOpportunities}건 전수 진단
            </Badge>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            탈락 및 지원 포기의 주원인이 된 사내 미보유 인증·지역요건·기술을 도출하고, 컨소시엄 협력사 보강 대책을 제시합니다.
          </p>
        </div>

        {onOpenPartnerPool && (
          <Button
            size="sm"
            onClick={onOpenPartnerPool}
            className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-md shadow-rose-600/30"
          >
            <Users className="w-3.5 h-3.5" />
            <span>협력사(컨소시엄) 풀 열기</span>
          </Button>
        )}
      </div>

      {/* Gap Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.gaps.map((gap, i) => (
          <Card key={gap.id} className="border shadow-sm bg-card flex flex-col justify-between">
            <CardHeader className="pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  className={`text-[10px] ${
                    gap.impactLevel === "FATAL_DISQUALIFICATION"
                      ? "bg-rose-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {gap.impactLevel === "FATAL_DISQUALIFICATION" ? "실격 리스크" : "평가 감점"}
                </Badge>
                <span className="font-mono text-xs font-bold text-rose-600">
                  결격 {gap.frequencyCount}건 발생
                </span>
              </div>
              <CardTitle className="text-sm font-bold mt-2 leading-snug">
                {i + 1}. {gap.requiredItem}
              </CardTitle>
              <CardDescription className="text-xs mt-1 leading-relaxed">
                {gap.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              <div className="p-2.5 rounded-lg bg-muted/40 border text-xs space-y-1">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                  권장 극복 전략:
                </div>
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  {gap.recommendedAction === "PARTNER_CONSOR" ? (
                    <>
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>공동수급 협력사(컨소시엄) 보강</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>전문 연구인력 채용 / 직접 획득</span>
                    </>
                  )}
                </div>
                {gap.recommendedPartnerNames && (
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium pt-1">
                    추천 파트너: {gap.recommendedPartnerNames.join(", ")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
