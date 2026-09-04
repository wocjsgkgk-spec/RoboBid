"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck,
  Calendar,
  AlertOctagon,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  ArrowRight,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { Opportunity } from "@/types";
import { toast } from "sonner";

interface SubmissionCheckItem {
  id: string;
  name: string;
  category: "PROPOSAL" | "LEGAL" | "FINANCE" | "SECURITY" | "FORMAT";
  isMandatory: boolean;
  isReady: boolean;
  detail: string;
  assignee: string;
}

const DEFAULT_CHECKLIST: SubmissionCheckItem[] = [
  {
    id: "sub-01",
    name: "제안서 본문 최종본 (PDF 변환 및 페이지 번호 검증)",
    category: "PROPOSAL",
    isMandatory: true,
    isReady: true,
    detail: "9개 챕터 85페이지, 4대 전문가 AI 크로스 리뷰 반영 완료",
    assignee: "이책임 (로봇연구소)",
  },
  {
    id: "sub-02",
    name: "법인인감증명서 및 사용인감계 (최근 3개월 이내 발급분)",
    category: "LEGAL",
    isMandatory: true,
    isReady: false,
    detail: "등기소 인감증명원 원본 스캔본 업로드 대기 중",
    assignee: "경영지원팀",
  },
  {
    id: "sub-03",
    name: "사업자등록증명원 & 중소기업확인서",
    category: "LEGAL",
    isMandatory: true,
    isReady: true,
    detail: "국세청 홈택스 및 중소벤처기업부 발급 유효본",
    assignee: "경영지원팀",
  },
  {
    id: "sub-04",
    name: "납품실적증명서 (수원 스마트 물류로봇 구축 실적)",
    category: "FINANCE",
    isMandatory: true,
    isReady: true,
    detail: "발주기관 관인 날인된 8.5억원 납품 실적 증명 첨부",
    assignee: "사업개발팀",
  },
  {
    id: "sub-05",
    name: "보안서약서 및 청렴계약이행서약서 (대표자 직인)",
    category: "SECURITY",
    isMandatory: true,
    isReady: false,
    detail: "대표이사 최종 서명 및 법인 직인 날인 확인 필요",
    assignee: "최법무 (규정준수팀)",
  },
  {
    id: "sub-06",
    name: "전자투찰 파일 용량 및 형식 검사 (300MB 이하, PDF/HWP)",
    category: "FORMAT",
    isMandatory: true,
    isReady: true,
    detail: "제출 패키지 총 42.8MB로 나라장터 업로드 제한(300MB) 정상 통과",
    assignee: "시스템 자동검증",
  },
];

export default function SubmissionsPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [checklist, setChecklist] = useState<SubmissionCheckItem[]>(DEFAULT_CHECKLIST);
  const [submittedConfirmed, setSubmittedConfirmed] = useState(false);

  useEffect(() => {
    const opps = opportunityStore.getAll();
    setOpportunities(opps);
    if (opps.length > 0) {
      setSelectedOppId(opps[0].id);
    }
  }, []);

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId);

  const toggleReady = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isReady: !item.isReady } : item))
    );
  };

  const readyCount = checklist.filter((item) => item.isReady).length;
  const readyPercent = Math.round((readyCount / checklist.length) * 100);
  const mandatoryMissing = checklist.filter((item) => item.isMandatory && !item.isReady);

  const handleFinalSubmit = () => {
    if (mandatoryMissing.length > 0) {
      toast.error("필수 서류가 아직 미완료 상태입니다. 모든 필수 서류를 준비한 후 제출을 확정하세요.");
      return;
    }
    setSubmittedConfirmed(true);
    if (selectedOpp) {
      opportunityStore.updateStatus(selectedOpp.id, "SUBMITTED");
    }
    toast.success("입찰서류 제출이 최종 확정 및 기록되었습니다.");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Send className="h-6 w-6 text-primary" />
              제출·마감 통제 센터 (Submission Control)
            </h1>
            <Badge variant="outline" className="text-xs">
              서류 누락 제로 보장
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            제안서 작성보다 더 중요한 최종 서류 누락 방지, 인감/직인 날인, 파일 용량 검증 및 D-Day 마감을 통제합니다.
          </p>
        </div>

        {/* Opportunity Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="h-9 px-3 text-xs bg-card border rounded-md text-foreground max-w-[280px] truncate focus:outline-none"
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Submission Readiness Banner */}
      <div className="p-5 rounded-xl border bg-card/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              제출 준비율 (Readiness)
            </span>
            <span className="text-2xl font-bold font-mono text-primary">{readyPercent}%</span>
            <span className="text-xs text-muted-foreground">({readyCount}/{checklist.length} 완료)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            공고 마감: <span className="font-mono text-destructive font-bold">{selectedOpp?.submissionDeadline.split("T")[0] || "D-5"} 18:00</span> · 
            나라장터(KONEPS) 전자투찰 시스템 접수
          </p>
        </div>

        {/* Progress Bar & Final Submit Button */}
        <div className="flex items-center gap-4">
          <div className="w-48 bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                readyPercent === 100 ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${readyPercent}%` }}
            />
          </div>

          <Button
            size="sm"
            onClick={handleFinalSubmit}
            disabled={submittedConfirmed || mandatoryMissing.length > 0}
            className={`gap-1.5 text-xs font-bold transition-all ${
              submittedConfirmed
                ? "bg-muted text-muted-foreground"
                : mandatoryMissing.length > 0
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30"
            }`}
          >
            {mandatoryMissing.length > 0 ? (
              <>
                <Lock className="h-3.5 w-3.5 text-rose-500" />
                <span>제출 잠금 (필수서류 {mandatoryMissing.length}건 미완료)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>{submittedConfirmed ? "제출 확정 완료" : "최종 제출 승인 (Sign-off)"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mandatory Missing Blocker Alert Banner */}
      {mandatoryMissing.length > 0 && !submittedConfirmed && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-in fade-in-50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-700 dark:text-rose-400 text-sm">
                  제출 불가 (Submission Locked) — 필수 서류 {mandatoryMissing.length}건 미완료
                </span>
                <Badge variant="destructive" className="text-[10px] font-bold">
                  실격 위험 차단
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                미완료 서류: <span className="font-semibold text-rose-600 dark:text-rose-300">{mandatoryMissing.map((m) => m.name).join(", ")}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                공공입찰 심사 규정상 필수 구비서류가 1건이라도 누락되면 자격 미달로 즉시 탈락 처리됩니다. 체크리스트에서 해당 항목을 완료 처리하거나 증빙을 연결하세요.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setChecklist((prev) => prev.map((item) => ({ ...item, isReady: true })));
              toast.success("모든 서류 준비 상태로 일괄 변경되었습니다 (시뮬레이션).");
            }}
            className="shrink-0 text-xs text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30"
          >
            일괄 완료 처리 (데모)
          </Button>
        </div>
      )}

      {/* 3. Checklist Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>제출 필수 서류 및 검증 항목 체크리스트</span>
            <span className="text-xs text-muted-foreground font-normal">
              클릭하여 준비 완료 상태를 토글할 수 있습니다.
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60 text-xs">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleReady(item.id)}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.isReady}
                    onChange={() => toggleReady(item.id)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          item.isReady ? "text-foreground line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.isMandatory && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-destructive/10 text-destructive font-bold">
                          필수
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{item.detail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted">
                    {item.assignee}
                  </span>
                  <Badge
                    variant={item.isReady ? "default" : "outline"}
                    className={`text-[10px] ${
                      item.isReady ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "text-destructive border-destructive/30"
                    }`}
                  >
                    {item.isReady ? "준비 완료" : "미완료"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
