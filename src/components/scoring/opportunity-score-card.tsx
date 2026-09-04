"use client";

import React from "react";
import { OpportunityScoreResult } from "@/types/scoring";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, ShieldAlert, CheckCircle2, TrendingUp, Info } from "lucide-react";

interface OpportunityScoreCardProps {
  score: OpportunityScoreResult;
}

export function OpportunityScoreCard({ score }: OpportunityScoreCardProps) {
  const getRecommendationBadge = (rec: OpportunityScoreResult["recommendation"]) => {
    switch (rec) {
      case "GO":
        return <Badge variant="success" className="text-xs px-2.5 py-0.5">추천: GO (적극 추진)</Badge>;
      case "GO_WITH_CONDITIONS":
        return <Badge variant="warning" className="text-xs px-2.5 py-0.5">추천: 조건부 GO</Badge>;
      case "HOLD":
        return <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-amber-500 text-amber-600">추천: HOLD (보류)</Badge>;
      case "NO_GO":
        return <Badge variant="destructive" className="text-xs px-2.5 py-0.5">추천: NO-GO (지원 비권장)</Badge>;
    }
  };

  const getScoreColor = (total: number) => {
    if (total >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (total >= 65) return "text-amber-600 dark:text-amber-400";
    return "text-destructive";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">
                RoboBid 기회 점수 (Opportunity Score)
              </CardTitle>
              {getRecommendationBadge(score.recommendation)}
            </div>
            <CardDescription className="text-xs mt-1">
              정량 룰과 사내 보유 역량을 기반으로 계산된 종합 기회 가치 지표입니다.
            </CardDescription>
          </div>
          {/* Big Score Number */}
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(score.totalScore)}`}>
              {score.totalScore}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ 100점</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Strictly Required Notice: Score != Win Probability */}
        <div className="p-3 rounded-lg bg-muted/50 border flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-foreground">지표 정의 고지:</strong> 본 점수는 사업 적합도 및 준비도를 나타내는 <strong>RoboBid Opportunity Score</strong>이며, <strong>수주 확률(Win Probability)이 아닙니다.</strong> 실제 수주 확률은 결과(Outcome) 데이터 축적 후 별도 모델로 제공됩니다.
          </div>
        </div>

        {/* 6 Category Score Bars */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            영역별 정량 평가 분해 (Score Breakdown)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {score.breakdown.map((item) => {
              const percent = Math.min(100, Math.round((item.score / item.maxScore) * 100));
              return (
                <div key={item.category} className="p-2.5 rounded-md border bg-background space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="font-mono text-muted-foreground">
                      <strong>{item.score}</strong> / {item.maxScore}점
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{item.reason}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Penalty If Any */}
        {score.riskPenalty > 0 && (
          <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 flex items-center justify-between text-xs text-destructive">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium">감점 페널티 적용 (Risk Penalty)</span>
            </div>
            <span className="font-mono font-bold">-{score.riskPenalty}점</span>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          {score.strengths.length > 0 && (
            <div className="p-3 rounded-md bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>주요 강점 (Strengths)</span>
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                {score.strengths.map((s, idx) => (
                  <li key={idx} className="leading-relaxed">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {score.weaknesses.length > 0 && (
            <div className="p-3 rounded-md bg-amber-500/5 border border-amber-500/20 space-y-1.5">
              <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>확인 및 보완 필요 (Points to Verify)</span>
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                {score.weaknesses.map((w, idx) => (
                  <li key={idx} className="leading-relaxed">{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
