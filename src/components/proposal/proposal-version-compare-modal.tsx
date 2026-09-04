"use client";

import React, { useState } from "react";
import { ProposalVersionComparison, ProposalDiffItem } from "@/types/p1";
import {
  History,
  GitCompare,
  Sparkles,
  User,
  PlusCircle,
  MinusCircle,
  Edit3,
  X,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProposalVersionCompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalTitle: string;
  currentVersion: number;
}

export function ProposalVersionCompareModal({
  open,
  onOpenChange,
  proposalTitle,
  currentVersion,
}: ProposalVersionCompareModalProps) {
  const [baseVersion, setBaseVersion] = useState(Math.max(1, currentVersion - 1));
  const [targetVersion, setTargetVersion] = useState(currentVersion);

  if (!open) return null;

  // Mock comparison data between versions
  const comparisonData: ProposalVersionComparison = {
    proposalId: "prop-sample",
    baseVersion,
    targetVersion,
    stats: {
      addedCount: 2,
      removedCount: 1,
      modifiedCount: 3,
      aiModifiedCount: 2,
    },
    diffItems: [
      {
        id: "diff-01",
        sectionCode: "2.1_TECH_ARCHITECTURE",
        sectionTitle: "2.1 시스템 아키텍처 및 알고리즘",
        diffType: "MODIFIED",
        authorType: "AI",
        authorName: "Gemini Pro (기술 크로스리뷰)",
        changeReason: "평가위원 지적사항 반영: SLAM 센서 퓨전 위치추정 오차 수치(±10mm) 및 ROS2 브릿지 레이턴시(50ms 이내) 정량화 보강",
        oldContent: "실내 환경에서 LiDAR 센서를 기반으로 로봇의 위치를 추정하고 상위 WMS와 연동합니다.",
        newContent: "3D LiDAR SLAM 및 EKF 센서 퓨전을 통해 실내 비마커 환경에서 ±10mm 위치추정 정밀도를 보장하며, ROS2 Bridge를 통해 50ms 미만의 초저지연 WMS 제어 루프를 구현합니다.",
        timestamp: "2시간 전",
      },
      {
        id: "diff-02",
        sectionCode: "3.2_QUANTITATIVE_KPI",
        sectionTitle: "3.2 정량적 목표 및 성능 평가 지표",
        diffType: "ADDED",
        authorType: "HUMAN",
        authorName: "이책임 (로봇연구소)",
        changeReason: "사내 저장소 KTL 공인시험성적서(KTL-2024-ROBO-091) 급정동 0.45초 실측 데이터 1:1 인용 삽입",
        oldContent: "",
        newContent: "[공인기관 KTL 실측치]: 주행 중 돌발 장애물 감지 시 0.45초 이내 완전 정동(기준치 0.5초 대비 10% 초과 달성). 성적서 첨부 완료.",
        timestamp: "어제",
      },
      {
        id: "diff-03",
        sectionCode: "4.1_BUDGET_AND_BOM",
        sectionTitle: "4.1 사업비 소요 내역 및 부품 원가",
        diffType: "MODIFIED",
        authorType: "AI",
        authorName: "KONEPS 투찰 시뮬레이터",
        changeReason: "A값(비투찰 비용 4,200만원) 제외 순공사비 기준 사정률 100.12% 투찰선 자동 재계산 반영",
        oldContent: "하드웨어 BOM 총액 3억 8천만원 책정.",
        newContent: "하드웨어 BOM 3억 2천만원 + A값 4,200만원 분리 계상, 총 투찰금액 3억 6,215만원으로 최적화.",
        timestamp: "어제",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-card rounded-xl border shadow-2xl overflow-hidden animate-in fade-in-50 duration-200 my-auto">
        {/* Modal Header */}
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                제안서 버전 변경비교 (Version Diff)
              </h3>
              <Badge variant="outline" className="text-xs font-mono">
                v{baseVersion} ➔ v{targetVersion}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {proposalTitle} — 버전 간 수정·추가 내용 및 AI/사람 작성자 이력을 대조합니다.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Version Selector & Summary Pills */}
        <div className="p-3 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">비교 기준:</span>
            <select
              value={baseVersion}
              onChange={(e) => setBaseVersion(Number(e.target.value))}
              className="h-7 px-2 bg-background border rounded text-xs font-mono"
            >
              {Array.from({ length: currentVersion }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>
                  v{v}
                </option>
              ))}
            </select>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <select
              value={targetVersion}
              onChange={(e) => setTargetVersion(Number(e.target.value))}
              className="h-7 px-2 bg-background border rounded text-xs font-mono"
            >
              {Array.from({ length: currentVersion }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>
                  v{v} (현재)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 text-[10px] border border-emerald-500/20">
              +{comparisonData.stats.addedCount} 추가
            </Badge>
            <Badge className="bg-amber-600/10 text-amber-700 dark:text-amber-300 text-[10px] border border-amber-500/20">
              ~{comparisonData.stats.modifiedCount} 수정
            </Badge>
            <Badge className="bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 text-[10px] border border-indigo-500/20">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              {comparisonData.stats.aiModifiedCount} AI 수정
            </Badge>
          </div>
        </div>

        {/* Diff Items List */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {comparisonData.diffItems.map((item) => (
            <div key={item.id} className="p-3.5 rounded-xl border bg-card space-y-3 shadow-sm">
              {/* Diff Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary text-xs">
                    {item.sectionTitle}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      item.diffType === "ADDED"
                        ? "text-emerald-600 border-emerald-500/30"
                        : "text-amber-600 border-amber-500/30"
                    }`}
                  >
                    {item.diffType === "ADDED" ? "신규 추가" : "내용 수정"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    {item.authorType === "AI" ? (
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                    ) : (
                      <User className="w-3 h-3 text-slate-500" />
                    )}
                    {item.authorName}
                  </span>
                  <span>· {item.timestamp}</span>
                </div>
              </div>

              {/* Change Reason */}
              {item.changeReason && (
                <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg">
                  <span className="font-bold text-foreground mr-1">수정 사유:</span>
                  {item.changeReason}
                </p>
              )}

              {/* Side-by-Side or Unified Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                {/* Old Content */}
                <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-800 dark:text-rose-300">
                  <div className="text-[10px] text-rose-500 font-bold mb-1 flex items-center gap-1">
                    <MinusCircle className="w-3 h-3" /> 이전 버전 (v{baseVersion})
                  </div>
                  <div className="leading-relaxed">
                    {item.oldContent || "(이전 내용 없음)"}
                  </div>
                </div>

                {/* New Content */}
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  <div className="text-[10px] text-emerald-600 font-bold mb-1 flex items-center gap-1">
                    <PlusCircle className="w-3 h-3" /> 변경 후 (v{targetVersion})
                  </div>
                  <div className="leading-relaxed font-semibold">
                    {item.newContent}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/20 flex justify-end">
          <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            확인 닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
