"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  ShieldAlert,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ComplianceAuditSummary,
  ComplianceStatus,
  RequirementMatrixItem,
} from "@/types/compliance";

interface ComplianceMatrixViewProps {
  matrix: RequirementMatrixItem[];
  summary: ComplianceAuditSummary;
  onUpdateStatus: (matrixId: string, status: ComplianceStatus) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function ComplianceMatrixView({
  matrix,
  summary,
  onUpdateStatus,
  onRefresh,
}: ComplianceMatrixViewProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleStatusChange = async (matrixId: string, status: ComplianceStatus) => {
    setUpdatingId(matrixId);
    try {
      await onUpdateStatus(matrixId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: ComplianceStatus, isMandatory: boolean) => {
    switch (status) {
      case "SATISFIED":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>충족 (SATISFIED)</span>
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge variant="secondary" className="text-amber-600 dark:text-amber-400 gap-1 text-[11px]">
            <AlertTriangle className="h-3 w-3" />
            <span>부분 충족 (PARTIAL)</span>
          </Badge>
        );
      case "MISSING":
        return (
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <XCircle className="h-3 w-3" />
            <span>누락 (MISSING)</span>
          </Badge>
        );
      case "NOT_APPLICABLE":
        return (
          <Badge variant="outline" className="text-muted-foreground text-[11px]">
            해당 없음 (N/A)
          </Badge>
        );
      case "REVIEW_REQUIRED":
      default:
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-400 gap-1 text-[11px]">
            <HelpCircle className="h-3 w-3" />
            <span>검토 필요</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Blocking Warning Banner if mandatory is missing */}
      {summary.mandatoryMissingCount > 0 && (
        <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <ShieldAlert className="h-5 w-5" />
            <span>🚨 제출 차단 경고: RFP 필수 요구조건 {summary.mandatoryMissingCount}건 누락</span>
          </div>
          <p className="text-xs text-destructive/90">
            필수 요구조건이 제안서 본문에 반영되지 않은 상태에서는 최종 제출 확정이 시스템 차원에서 차단됩니다.
          </p>
          <ul className="text-xs text-destructive space-y-1 list-disc pl-5 pt-1">
            {summary.blockingWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="p-4 pb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              요구조건 충족률
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {summary.complianceRatePercent}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              총 {summary.totalCount}개 요건 중 {summary.satisfiedCount}개 충족
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="p-4 pb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              필수 요건 누락
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-destructive">
              {summary.mandatoryMissingCount}건
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summary.mandatoryMissingCount === 0 ? "모든 필수 요건 충족 완료" : "제출 전 반드시 보완 요망"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-4 pb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              부분 충족 / 보완
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {summary.partialCount}건
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">키워드 일부 반영 상태</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-400">
          <CardHeader className="p-4 pb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              검토 필요 (Review)
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {summary.reviewRequiredCount}건
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">작성자 수동 확인 요망</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. RTM Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-base font-semibold">
              RFP 요구사항 추적 매트릭스 (RTM)
            </CardTitle>
            <CardDescription className="text-xs">
              공고 원문 요구조건과 제안서 각 섹션의 1:1 반영 여부 및 증빙 추적성
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshClick}
            disabled={refreshing}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>매트릭스 재동기화</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
              <tr>
                <th className="p-3 w-28">요건 코드</th>
                <th className="p-3 w-20">구분</th>
                <th className="p-3">RFP 요구조건 원문 및 출처</th>
                <th className="p-3 w-40">매핑된 제안서 섹션</th>
                <th className="p-3 w-36">충족 상태</th>
                <th className="p-3 w-36">수동 판정 변경</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {matrix.length > 0 ? (
                matrix.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      item.isMandatory && item.complianceStatus === "MISSING"
                        ? "bg-destructive/5"
                        : ""
                    }`}
                  >
                    <td className="p-3 font-mono font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{item.requirementCode}</span>
                        {item.isMandatory && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">
                            필수
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.category}</td>
                    <td className="p-3 space-y-1">
                      <div className="font-medium text-foreground">{item.originalText}</div>
                      {item.sourceLocation && (
                        <div className="text-[10px] text-muted-foreground">
                          출처: {item.sourceLocation}
                        </div>
                      )}
                      {item.evidenceNotes && (
                        <div className="text-[11px] text-primary/80">
                          {item.evidenceNotes}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {item.mappedSectionCode || (
                        <span className="text-destructive font-sans">미지정 (미반영)</span>
                      )}
                    </td>
                    <td className="p-3">
                      {getStatusBadge(item.complianceStatus, item.isMandatory)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStatusChange(item.id, "SATISFIED")}
                          disabled={updatingId === item.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] border ${
                            item.complianceStatus === "SATISFIED"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "hover:bg-muted"
                          }`}
                        >
                          충족
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, "PARTIAL")}
                          disabled={updatingId === item.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] border ${
                            item.complianceStatus === "PARTIAL"
                              ? "bg-amber-500 text-white border-amber-500"
                              : "hover:bg-muted"
                          }`}
                        >
                          부분
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, "MISSING")}
                          disabled={updatingId === item.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] border ${
                            item.complianceStatus === "MISSING"
                              ? "bg-destructive text-white border-destructive"
                              : "hover:bg-muted"
                          }`}
                        >
                          누락
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    등록된 RFP 요구사항이 없습니다. Phase 3 RFP 추출기가 요구조건을 감지하면 자동으로 RTM이 생성됩니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
