"use client";

import React from "react";
import { ProposalQualityGate, QualityGateIssue } from "@/types/proposal";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QualityGateCardProps {
  gate: ProposalQualityGate;
  onResolveIssue?: (issue: QualityGateIssue) => void;
  onApproveReady?: (proposalId: string) => void;
}

export function QualityGateCard({ gate, onResolveIssue, onApproveReady }: QualityGateCardProps) {
  const isPass = gate.isReady && gate.blockerCount === 0;

  return (
    <Card className={`border shadow-md ${
      isPass
        ? "border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900"
        : "border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900"
    }`}>
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isPass ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-pulse" />
              )}
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                제안서 품질 게이트 (Proposal Quality Gate)
              </CardTitle>
              <Badge className={isPass ? "bg-emerald-600 text-white" : "bg-rose-600 text-white font-bold"}>
                {isPass ? "READY (승인 가능)" : "NOT READY (제출 불가)"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              4대 평가위원 모의 심사 및 10대 평가 축을 통과해야만 최종 제출 준비 상태로 승격할 수 있습니다.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium">품질 완성도 점수</div>
              <div className={`text-xl font-bold font-mono ${isPass ? "text-emerald-600" : "text-rose-600"}`}>
                {gate.readinessScore} <span className="text-xs text-slate-400 font-normal">/ 100점</span>
              </div>
            </div>
            {isPass && onApproveReady && (
              <Button
                size="sm"
                onClick={() => onApproveReady(gate.proposalId)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                제출 승인
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Blocker & High Issues Alert Box */}
        {gate.blockerCount > 0 && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>제출 차단 요인 (Blockers): {gate.blockerCount}건 즉시 조치 필요</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              본 제안서에는 필수 제출 서류 누락 또는 실격 사유가 포함되어 있어, 조치 전까지 최종 제출 체크리스트가 잠금 처리됩니다.
            </p>
          </div>
        )}

        {/* Issues List */}
        <div className="space-y-2">
          <div className="font-bold text-slate-800 dark:text-slate-200">보완 요구사항 및 개선 권고사항</div>
          {gate.issues.map((issue) => {
            const isBlocker = issue.severity === "BLOCKER";
            const isHigh = issue.severity === "HIGH";

            return (
              <div
                key={issue.id}
                className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isBlocker
                    ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                    : isHigh
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      isBlocker ? "bg-rose-600 text-white text-[10px]" : isHigh ? "bg-amber-500 text-white text-[10px]" : "bg-blue-600 text-white text-[10px]"
                    }>
                      {issue.severity}
                    </Badge>
                    <span className="font-bold text-slate-900 dark:text-white">{issue.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">{issue.description}</p>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>개선 액션: {issue.actionRecommendation}</span>
                  </div>
                </div>

                {onResolveIssue && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolveIssue(issue)}
                    className="text-xs shrink-0 h-7"
                  >
                    보완하기
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* 10 Evaluation Axes Grid */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="font-bold text-slate-800 dark:text-slate-200 mb-2">10대 평가 축 검증 현황</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {gate.evaluationAxes.map((axis, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="text-[10px] text-slate-500 truncate">{axis.label}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold font-mono text-slate-900 dark:text-white">{axis.score}점</span>
                  <span className={`text-[10px] font-bold ${
                    axis.status === "PASS" ? "text-emerald-500" : axis.status === "WARN" ? "text-amber-500" : "text-rose-500"
                  }`}>
                    {axis.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
