"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Cpu,
  Layers,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { SemanticMatchResult, MissingCapabilityStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

interface FourteenAxisProfileCardProps {
  matchResult: SemanticMatchResult;
  conceptName: string;
  opportunityTitle: string;
}

export function FourteenAxisProfileCard({
  matchResult,
  conceptName,
  opportunityTitle,
}: FourteenAxisProfileCardProps) {
  const { profile14Axis, matchedProjectComponents, usableFundingAreas, evidence, uncertainty, reason } =
    matchResult;

  const getStatusBadge = (status: MissingCapabilityStatus) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">기보유 (AVAILABLE)</Badge>;
      case "PLANNED":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px]">과제 중 확보 (PLANNED)</Badge>;
      case "OUTSOURCE":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-[10px]">전문외주 조달 (OUTSOURCE)</Badge>;
      case "PARTNER_REQUIRED":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[10px]">수요처 파트너 필수 (PARTNER)</Badge>;
      case "UNAVAILABLE":
        return <Badge variant="destructive" className="text-[10px]">확보 불가 결격 (UNAVAILABLE)</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 1. Header Summary Card */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 border border-blue-200/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              14-Axis Semantic Match Intelligence
            </span>
            <h3 className="text-base font-bold text-foreground mt-1">
              [{conceptName}] ↔ [{opportunityTitle}]
            </h3>
          </div>

          <div className="flex items-baseline gap-1 bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-inner shrink-0">
            <span className="text-2xl font-black text-blue-600 font-mono">
              {matchResult.matchScore.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ 100점</span>
          </div>
        </div>

        <p className="text-xs text-blue-950 font-medium leading-relaxed bg-white/70 p-3 rounded-lg border border-blue-100">
          💡 <strong>핵심 판단:</strong> {reason}
        </p>

        {/* v2 Fit Score 하위 신호 배지 */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">하위 신호(Sub-signal):</span>
          <span className="bg-white px-2 py-0.5 rounded border font-mono">
            v2 Fit Score: {profile14Axis.subFitScore.totalScore}점
          </span>
          <span>(기술 {profile14Axis.subFitScore.breakdown[0]?.score || 0} / 자격 {profile14Axis.subFitScore.breakdown[1]?.score || 0} / 실적 {profile14Axis.subFitScore.breakdown[2]?.score || 0})</span>
        </div>
      </div>

      {/* 2. Semantic Utilization Mapping (우리 로봇의 어디에 활용하는가?) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Components */}
        <div className="border rounded-xl p-4 bg-card shadow-sm space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
            <Cpu className="h-4 w-4 text-blue-600" />
            지원금 활용 로봇 핵심 컴포넌트
          </h4>
          <ul className="space-y-1.5 pt-1">
            {matchedProjectComponents.map((comp, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                <span>{comp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Usable Funding Areas */}
        <div className="border rounded-xl p-4 bg-card shadow-sm space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
            <Layers className="h-4 w-4 text-emerald-600" />
            비목별 예산 충당 가능 영역
          </h4>
          <ul className="space-y-1.5 pt-1">
            {usableFundingAreas.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. 14-Axis Evaluation Profile Breakdown */}
      <div className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              14대 다각도 적합성 프로파일 (14-Axis Profile)
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              단일 점수가 아닌 자격, 예산, 기술, 실증, 사업화 전 영역의 설명 가능한 세부 지표를 제공합니다.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px]">
            총 {profile14Axis.axes.length}개 평가축
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profile14Axis.axes.map((axis) => {
            const ratio = (axis.score / axis.maxScore) * 100;
            return (
              <div key={axis.axisId} className="border rounded-lg p-3 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-muted-foreground font-bold">{axis.axisNumber}.</span>
                    <span className="font-semibold text-foreground">{axis.axisName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        axis.isDeterministic
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {axis.isDeterministic ? "정량판별 (Rule)" : "AI추론 (Semantic)"}
                    </span>
                  </div>

                  <div className="font-mono font-bold text-foreground">
                    <span className={ratio >= 80 ? "text-emerald-600" : ratio >= 50 ? "text-blue-600" : "text-amber-600"}>
                      {axis.score.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground text-[10px]"> / {axis.maxScore}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      ratio >= 80 ? "bg-emerald-500" : ratio >= 50 ? "bg-blue-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">{axis.rationale}</p>
                <div className="text-[10px] text-foreground/80 bg-white/60 p-1.5 rounded border font-mono">
                  근거: {axis.evidence}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Missing Capability Analysis */}
      <div className="border rounded-xl p-5 bg-card shadow-sm space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2 text-xs">
          <HelpCircle className="h-4 w-4 text-amber-600" />
          부족 역량 및 필수 자격 요건 (Capability Gap Analysis)
        </h4>

        {!profile14Axis.passMandatoryEligibility && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2 text-red-900">
            <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">필수 신청시점 자격 보완 필요:</span>
              <p className="text-[11px] mt-0.5">
                필수 신청자격 요건은 단순 계획(PLANNED)만으로 PASS 처리되지 않습니다. 공고 접수 전 실증처 MOU 등 필수 증빙을 기보유(AVAILABLE) 상태로 전환해야 합니다.
              </p>
            </div>
          </div>
        )}

        <div className="divide-y border rounded-lg overflow-hidden bg-muted/10">
          {profile14Axis.gaps.map((gap, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{gap.requirement}</span>
                  {gap.isMandatoryForSubmission && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0">필수 요건</Badge>
                  )}
                  <Badge variant="outline" className="text-[9px]">{gap.category}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{gap.detail}</p>
              </div>
              <div className="shrink-0">{getStatusBadge(gap.status)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Evidence & Transparent Uncertainty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Evidence */}
        <div className="border rounded-xl p-4 bg-card shadow-sm space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
            <FileText className="h-4 w-4 text-blue-600" />
            평가 근거 (Evidence Citations)
          </h4>
          <ul className="space-y-1.5 pt-1">
            {evidence.map((ev, idx) => (
              <li key={idx} className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded border">
                {ev}
              </li>
            ))}
          </ul>
        </div>

        {/* Uncertainty / Risk Warnings */}
        <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/50 shadow-sm space-y-2">
          <h4 className="font-semibold text-amber-900 flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            불확실성 및 사전 점검 리스크 (Uncertainty)
          </h4>
          <ul className="space-y-1.5 pt-1">
            {uncertainty.map((unc, idx) => (
              <li key={idx} className="text-[11px] text-amber-900 bg-white/80 p-2 rounded border border-amber-200">
                ⚠️ {unc}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
