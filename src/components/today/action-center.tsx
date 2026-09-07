"use client";

import React from "react";
import { TodayActionItem } from "@/types/today";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Award,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ActionCenterProps {
  actionItems: TodayActionItem[];
  onActionClick?: (item: TodayActionItem) => void;
}

export function ActionCenter({ actionItems, onActionClick }: ActionCenterProps) {
  // RoboBid AI v3.0: 순수 정부 지원금 및 로봇 개발 과제만 노출 (단순 용역/인력파견/적격심사 배제)
  const fundingOnlyItems = actionItems.filter((item) => {
    const text = `${item.title || ""} ${item.description || ""} ${item.opportunityTitle || ""}`.toLowerCase();
    if (
      text.includes("용역") ||
      text.includes("컨설팅") ||
      text.includes("자문") ||
      text.includes("멘토링") ||
      text.includes("인력") ||
      text.includes("청소") ||
      text.includes("경비") ||
      text.includes("유지관리") ||
      text.includes("적격심사") ||
      text.includes("마케팅")
    ) {
      return false;
    }
    return true;
  });

  // Sort priority: CRITICAL first, then HIGH, then NORMAL
  const sortedItems = [...fundingOnlyItems].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, NORMAL: 2 };
    return order[a.priority] - order[b.priority];
  });

  const criticalCount = fundingOnlyItems.filter((i) => i.priority === "CRITICAL").length;
  const highCount = fundingOnlyItems.filter((i) => i.priority === "HIGH").length;

  return (
    <Card className="border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-500 animate-pulse" />
                오늘의 우선 조치 (Action Center)
              </CardTitle>
              {criticalCount > 0 && (
                <Badge className="bg-rose-600 text-white font-bold text-[11px] animate-bounce">
                  긴급 {criticalCount}건
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              단순 알림(Notification)이 아닌, 담당자가 직접 판단하고 처리해야 하는 필수 업무입니다.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">대기 중 조치:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {fundingOnlyItems.length}건
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {sortedItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            오늘 처리해야 할 긴급 액션 아이템이 모두 완료되었습니다!
          </div>
        ) : (
          sortedItems.map((item) => {
            const isCritical = item.priority === "CRITICAL";
            const isHigh = item.priority === "HIGH";

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCritical
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-slate-900 dark:text-slate-100"
                    : isHigh
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-slate-900 dark:text-slate-100"
                    : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={`text-[10px] font-bold px-2 py-0.2 ${
                        isCritical
                          ? "bg-rose-600 text-white"
                          : isHigh
                          ? "bg-amber-500 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {item.priority}
                    </Badge>
                    {item.opportunityTitle && (
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[240px]">
                        [{item.opportunityTitle}]
                      </span>
                    )}
                    {item.daysRemaining !== undefined && (
                      <span className={`text-[11px] font-mono font-bold ${
                        item.daysRemaining <= 2 ? "text-rose-600 dark:text-rose-400" : "text-slate-500"
                      }`}>
                        {item.daysRemaining <= 0 ? "D-Day (오늘 마감)" : `D-${item.daysRemaining}`}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {item.title}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                {/* 1-Click Action CTA */}
                <div className="shrink-0 flex items-center gap-2">
                  {onActionClick ? (
                    <Button
                      size="sm"
                      onClick={() => onActionClick(item)}
                      className={`text-xs font-semibold shadow-sm h-8 px-3 ${
                        isCritical
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : isHigh
                          ? "bg-amber-600 hover:bg-amber-500 text-white"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {item.ctaLabel || "즉시 처리"}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <Link href={item.linkUrl}>
                      <Button
                        size="sm"
                        className={`text-xs font-semibold shadow-sm h-8 px-3 ${
                          isCritical
                            ? "bg-rose-600 hover:bg-rose-500 text-white"
                            : isHigh
                            ? "bg-amber-600 hover:bg-amber-500 text-white"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        {item.ctaLabel || "즉시 처리"}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
