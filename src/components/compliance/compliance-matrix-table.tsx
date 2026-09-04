"use client";

import React, { useState } from "react";
import { RequirementMatrixItem, ComplianceStatus } from "@/types/compliance";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MinusCircle,
  ShieldAlert,
  FileText,
  Award,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ComplianceMatrixTableProps {
  items: RequirementMatrixItem[];
  proposalTitle?: string;
  onStatusChange?: (itemId: string, newStatus: ComplianceStatus) => void;
  onLinkEvidence?: (itemId: string) => void;
}

export function ComplianceMatrixTable({
  items,
  proposalTitle,
  onStatusChange,
  onLinkEvidence,
}: ComplianceMatrixTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const totalCount = items.length;
  const mandatoryCount = items.filter((i) => i.isMandatory).length;
  const satisfiedCount = items.filter((i) => i.complianceStatus === "SATISFIED").length;
  const partialCount = items.filter((i) => i.complianceStatus === "PARTIAL").length;
  const missingCount = items.filter((i) => i.complianceStatus === "MISSING").length;
  const mandatoryMissingCount = items.filter((i) => i.isMandatory && i.complianceStatus === "MISSING").length;
  const reviewCount = items.filter((i) => i.complianceStatus === "REVIEW_REQUIRED").length;

  const filteredItems = items.filter((item) => {
    if (filterStatus !== "ALL" && item.complianceStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.requirementCode.toLowerCase().includes(q) ||
        item.originalText.toLowerCase().includes(q) ||
        (item.evidenceNotes && item.evidenceNotes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case "SATISFIED":
        return <Badge className="bg-emerald-600 text-white text-[10px] font-bold"><CheckCircle2 className="w-3 h-3 mr-1" />SATISFIED</Badge>;
      case "PARTIAL":
        return <Badge className="bg-blue-600 text-white text-[10px] font-bold"><HelpCircle className="w-3 h-3 mr-1" />PARTIAL</Badge>;
      case "MISSING":
        return <Badge className="bg-rose-600 text-white text-[10px] font-bold"><XCircle className="w-3 h-3 mr-1" />MISSING</Badge>;
      case "REVIEW_REQUIRED":
        return <Badge className="bg-amber-500 text-white text-[10px] font-bold"><AlertTriangle className="w-3 h-3 mr-1" />REVIEW</Badge>;
      case "NOT_APPLICABLE":
        return <Badge variant="outline" className="text-slate-400 text-[10px] font-medium"><MinusCircle className="w-3 h-3 mr-1" />N/A</Badge>;
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              RFP 요구조건 적합성 매트릭스 (Compliance Matrix)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              {proposalTitle ? `[${proposalTitle}] ` : ""}제안요청서 전 항목 대조 및 사내 실증·특허 자산 1:1 매핑
            </CardDescription>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="요구조건/근거 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Blocker Alert Banner */}
        {mandatoryMissingCount > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">제출 차단 경고 (Submission Blocker):</span> 필수 요구사항 중{" "}
              <strong>{mandatoryMissingCount}건이 미충족(MISSING)</strong> 상태입니다. 보완되지 않을 시 제안서 최종 제출이 차단됩니다.
            </div>
          </div>
        )}

        {/* 5-Key Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 text-xs">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`p-2 rounded-lg border text-left transition-colors ${
              filterStatus === "ALL" ? "bg-slate-100 dark:bg-slate-800 border-slate-400" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="text-[10px] text-slate-500 font-medium">전체 요구사항</div>
            <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">{totalCount}건</div>
          </button>

          <button
            onClick={() => setFilterStatus("SATISFIED")}
            className={`p-2 rounded-lg border text-left transition-colors ${
              filterStatus === "SATISFIED" ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="text-[10px] text-emerald-600 font-medium">충족 (SATISFIED)</div>
            <div className="text-base font-bold font-mono text-emerald-600">{satisfiedCount}건</div>
          </button>

          <button
            onClick={() => setFilterStatus("PARTIAL")}
            className={`p-2 rounded-lg border text-left transition-colors ${
              filterStatus === "PARTIAL" ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="text-[10px] text-blue-600 font-medium">부분충족 (PARTIAL)</div>
            <div className="text-base font-bold font-mono text-blue-600">{partialCount}건</div>
          </button>

          <button
            onClick={() => setFilterStatus("MISSING")}
            className={`p-2 rounded-lg border text-left transition-colors ${
              filterStatus === "MISSING" ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="text-[10px] text-rose-600 font-medium">누락 (MISSING)</div>
            <div className="text-base font-bold font-mono text-rose-600">{missingCount}건</div>
          </button>

          <button
            onClick={() => setFilterStatus("REVIEW_REQUIRED")}
            className={`p-2 rounded-lg border text-left transition-colors ${
              filterStatus === "REVIEW_REQUIRED" ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="text-[10px] text-amber-600 font-medium">확인필요 (REVIEW)</div>
            <div className="text-base font-bold font-mono text-amber-600">{reviewCount}건</div>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-semibold">
              <tr>
                <th className="p-3 w-24">코드 / 구분</th>
                <th className="p-3">RFP 요구사항 내용</th>
                <th className="p-3 w-24">출처</th>
                <th className="p-3 w-28 text-center">충족 상태</th>
                <th className="p-3">사내 증빙 근거 (Vault)</th>
                <th className="p-3 w-32">제안서 해당 절</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    해당 조건의 요구사항이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.requirementCode}</div>
                      <div className="mt-0.5">
                        {item.isMandatory ? (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 px-1 py-0.2 rounded border border-rose-200 dark:border-rose-900">
                            필수
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">
                            일반
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900 dark:text-white leading-relaxed">
                        {item.originalText}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{item.category}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {item.sourceLocation || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {getStatusBadge(item.complianceStatus)}
                    </td>
                    <td className="p-3">
                      {item.evidenceNotes ? (
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[220px]">{item.evidenceNotes}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">증빙 미연계</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-medium text-[11px]">
                        {item.mappedSectionCode || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
