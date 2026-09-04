"use client";

import React, { useState } from "react";
import { ProposalApprovalState, ApprovalStep } from "@/types/p1";
import { p1Store } from "@/lib/p1/p1-store";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Send,
  UserCheck,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner-toast";

interface ApprovalWorkflowCardProps {
  proposalId: string;
  onFullyApproved?: () => void;
}

export function ApprovalWorkflowCard({ proposalId, onFullyApproved }: ApprovalWorkflowCardProps) {
  const [approval, setApproval] = useState<ProposalApprovalState>(
    p1Store.getProposalApproval(proposalId)
  );
  const [activeComment, setActiveComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = approval.steps[approval.currentStepIndex];

  const handleApprove = (stepIndex: number) => {
    setIsSubmitting(true);
    try {
      const comment = activeComment.trim() || "검토 기준 충족 확인 및 다음 단계 승인 진행";
      const updated = p1Store.approveStep(proposalId, stepIndex, comment);
      setApproval({ ...updated });
      setActiveComment("");
      toast.success(`${approval.steps[stepIndex].roleTitle} 승인 완료`);

      if (updated.isFullyApproved && onFullyApproved) {
        onFullyApproved();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border shadow-md bg-card">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-bold">
                사내 제안서 승인 및 결재선 (Review & Approval Workflow)
              </CardTitle>
              <Badge
                className={
                  approval.isFullyApproved
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-indigo-600 text-white"
                }
              >
                {approval.isFullyApproved ? "최종 전결 승인 완료" : `현재 ${approval.currentStepIndex + 1}단계 심의 중`}
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              작성자 ➔ 기술검토(CTO) ➔ 사업검토(이사) ➔ 최종 승인(CEO)의 4단계 내부 결재선을 통과해야 조달청 최종 접수가 가능합니다.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* 4 Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {approval.steps.map((step, idx) => {
            const isDone = step.status === "APPROVED";
            const isCurrent = idx === approval.currentStepIndex && !approval.isFullyApproved;
            const isWaiting = step.status === "PENDING";

            return (
              <div
                key={step.stepIndex}
                className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isDone
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : isCurrent
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border/60 bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase">
                      STEP {idx + 1}
                    </span>
                    <Badge
                      className={`text-[9px] ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-primary text-primary-foreground font-bold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? "승인 완료" : isCurrent ? "심의 중" : "대기"}
                    </Badge>
                  </div>
                  <div className="font-bold text-foreground leading-snug">
                    {step.roleTitle}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    결재권자: {step.reviewerName}
                  </div>
                  {step.comment && (
                    <p className="text-[10px] text-muted-foreground bg-muted/40 p-1.5 rounded mt-1 line-clamp-2">
                      &ldquo;{step.comment}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t flex items-center justify-between text-[10px] text-muted-foreground">
                  {step.approvedAt ? (
                    <span className="font-mono text-emerald-600">
                      {new Date(step.approvedAt).toLocaleDateString()} 승인
                    </span>
                  ) : (
                    <span>결재 대기</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Pending Action Box */}
        {!approval.isFullyApproved && currentStep && (
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  현재 결재 단계: {currentStep.roleTitle} ({currentStep.reviewerName})
                </span>
              </div>
              <input
                type="text"
                placeholder="심의 의견 및 조건부 승인 메모 입력 (선택)..."
                value={activeComment}
                onChange={(e) => setActiveComment(e.target.value)}
                className="w-full h-8 px-2.5 bg-background border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleApprove(approval.currentStepIndex)}
              className="shrink-0 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{approval.currentStepIndex === 3 ? "최종 전결 승인 (Sign-off)" : "단계 승인 처리"}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
