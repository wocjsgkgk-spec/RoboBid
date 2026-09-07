"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  XCircle,
  X,
  FileCheck,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DecisionType } from "@/types/decision";
import { toast } from "@/components/ui/sonner-toast";

interface BidDecisionModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  opportunity: {
    id: string;
    title: string;
    announcingAgency: string;
    allocatedBudget?: number | null;
    status: string;
    primaryDomain: string;
    fundingType?: string;
  };
  onDecisionRecorded?: () => void;
}

export function BidDecisionModal({
  isOpen,
  open,
  onClose,
  onOpenChange,
  opportunity,
  onDecisionRecorded,
}: BidDecisionModalProps) {
  const visible = open ?? isOpen ?? false;
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const isFunding = Boolean(
    opportunity.fundingType &&
    opportunity.fundingType !== "PROCUREMENT" &&
    opportunity.fundingType !== "SERVICE_CONTRACT"
  );

  const [decision, setDecision] = useState<DecisionType>(isFunding ? "APPLY" : "GO");
  const [reason, setReason] = useState(
    isFunding
      ? "사내 TRL 및 로봇 핵심기술 규격이 공고 목적과 부합하며, 비목별 지원금 충당률이 양호하여 지원 신청을 추진함."
      : "사내 TRL 7 실증 기술 및 특허 일치도가 높으며 사업 예산 적정함."
  );
  const [conditionsText, setConditionsText] = useState(
    isFunding
      ? "컨소시엄 참여기업 확약서 확보\n시제품 제작 외주처 견적 확정"
      : "D-10 이전 기술초안 완료\n컨소시엄 지분율 확정"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("의사결정 사유를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isConditional = decision === "GO_WITH_CONDITIONS" || decision === "APPLY_WITH_CONDITIONS";
      const conditions = isConditional
        ? conditionsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_DECISION",
          opportunityId: opportunity.id,
          decision,
          reason,
          conditions,
          scoreAtDecision: opportunity.primaryDomain === "ROBOT" ? 92 : 86,
        }),
      });

      if (res.ok) {
        toast.success(`[${decision}] 의사결정이 확정되었습니다.`, {
          description: isFunding
            ? "지원사업 Workspace 및 Today 대시보드에 실시간 반영되었습니다."
            : "Today 대시보드 및 공모 상태에 실시간 반영되었습니다.",
        });
        if (onDecisionRecorded) onDecisionRecorded();
        handleClose();
      } else {
        const data = await res.json();
        toast.error("결정 저장 실패", { description: data.error });
      }
    } catch (err: any) {
      toast.error("통신 오류", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const decisionOptions: Array<{ type: DecisionType; label: string; desc: string; icon: any; color: string }> = isFunding
    ? [
        {
          type: "APPLY",
          label: "APPLY (지원 결정)",
          desc: "사업계획서 작성 및 지원서류 제출을 본격 착수합니다.",
          icon: CheckCircle2,
          color: "border-emerald-500 bg-emerald-50/20 text-emerald-600",
        },
        {
          type: "APPLY_WITH_CONDITIONS",
          label: "조건부 지원",
          desc: "컨소시엄 구성, 자부담 매칭 등 선결조건 충족 시 지원합니다.",
          icon: AlertTriangle,
          color: "border-amber-500 bg-amber-50/20 text-amber-600",
        },
        {
          type: "HOLD",
          label: "HOLD (보류)",
          desc: "공고 지침 추가 확인 또는 팀 내 자금 우선순위 검토 후 재심의합니다.",
          icon: PauseCircle,
          color: "border-blue-500 bg-blue-50/20 text-blue-600",
        },
        {
          type: "PASS",
          label: "PASS (미지원)",
          desc: "당사 개발 로드맵 부적합 또는 지원 요건 미달로 지원을 패스합니다.",
          icon: XCircle,
          color: "border-destructive bg-destructive/10 text-destructive",
        },
      ]
    : [
        {
          type: "GO",
          label: "GO (참여 확정)",
          desc: "제안서 작성 및 인력 배정을 즉시 착수합니다.",
          icon: CheckCircle2,
          color: "border-emerald-500 bg-emerald-50/20 text-emerald-600",
        },
        {
          type: "GO_WITH_CONDITIONS",
          label: "조건부 GO",
          desc: "선결 조건(컨소시엄, 인증 갱신 등) 충족 시 참여합니다.",
          icon: AlertTriangle,
          color: "border-amber-500 bg-amber-50/20 text-amber-600",
        },
        {
          type: "HOLD",
          label: "HOLD (보류)",
          desc: "질의응답 확인 또는 경쟁 구도 추가 분석 후 재심의합니다.",
          icon: PauseCircle,
          color: "border-blue-500 bg-blue-50/20 text-blue-600",
        },
        {
          type: "NO_GO",
          label: "NO-GO (불참)",
          desc: "수익성 미달, 실적 요건 불충족 등으로 입찰을 포기합니다.",
          icon: XCircle,
          color: "border-destructive bg-destructive/10 text-destructive",
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                입찰 참여 의사결정 (Bid Decision Workflow)
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1">{opportunity.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Opportunity Quick Info */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/60 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">발주 주관기관:</span>
              <span className="font-semibold text-foreground">{opportunity.announcingAgency}</span>
            </div>
            {opportunity.allocatedBudget && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">배정 예산:</span>
                <span className="font-bold text-primary">
                  {(opportunity.allocatedBudget / 100000000).toFixed(2)}억원 (
                  {opportunity.allocatedBudget.toLocaleString("ko-KR")}원)
                </span>
              </div>
            )}
          </div>

          {/* Decision Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">결정 유형 선택</label>
            <div className="grid grid-cols-2 gap-2">
              {decisionOptions.map((opt) => {
                const isSelected = decision === opt.type;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setDecision(opt.type)}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `${opt.color} ring-1 font-bold shadow-xs`
                        : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decision Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">의사결정 사유 (Audit Log 보관)</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="사내 기술 정합성, 일정 여력, 원가 타당성 등 결정 사유를 입력하십시오."
              className="w-full text-xs bg-background border border-input rounded-lg p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Conditions Text (if GO_WITH_CONDITIONS) */}
          {decision === "GO_WITH_CONDITIONS" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>착수 전제 조건 (줄바꿈 구분)</span>
                <Badge variant="secondary" className="text-[10px]">
                  필수 이행 항목
                </Badge>
              </label>
              <textarea
                rows={2}
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                placeholder="예: D-10 이전 기술 초안 완료&#10;공동수급 지분율 70:30 확정"
                className="w-full text-xs bg-background border border-input rounded-lg p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 cursor-pointer font-semibold"
            >
              <Send className="h-3.5 w-3.5" />
              <span>결정 확정 및 상태 갱신</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
