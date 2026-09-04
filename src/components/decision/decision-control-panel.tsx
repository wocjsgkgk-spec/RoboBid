"use client";

import React, { useState } from "react";
import { DecisionType, BidDecision } from "@/types/decision";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, AlertTriangle, UserCheck, Plus, Trash2 } from "lucide-react";

interface DecisionControlPanelProps {
  opportunityId: string;
  currentDecision?: BidDecision | null;
  scoreAtDecision: number;
  onDecisionSubmitted?: (decision: BidDecision) => void;
}

export function DecisionControlPanel({
  opportunityId,
  currentDecision,
  scoreAtDecision,
  onDecisionSubmitted,
}: DecisionControlPanelProps) {
  const [selectedType, setSelectedType] = useState<DecisionType>("GO");
  const [reason, setReason] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [newConditionInput, setNewConditionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleAddCondition = () => {
    if (newConditionInput.trim()) {
      setConditions([...conditions, newConditionInput.trim()]);
      setNewConditionInput("");
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: selectedType,
          reason,
          conditions,
          scoreAtDecision,
        }),
      });

      const data = await res.json();
      if (data.success && onDecisionSubmitted) {
        onDecisionSubmitted(data.decision);
        setShowForm(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDecisionBadge = (type: DecisionType) => {
    switch (type) {
      case "GO":
        return <Badge variant="success" className="gap-1 font-bold">GO (지원 결정)</Badge>;
      case "GO_WITH_CONDITIONS":
        return <Badge variant="warning" className="gap-1 font-bold">조건부 GO</Badge>;
      case "HOLD":
        return <Badge variant="outline" className="gap-1 font-bold border-amber-500 text-amber-600">HOLD (검토 보류)</Badge>;
      case "NO_GO":
        return <Badge variant="destructive" className="gap-1 font-bold">NO-GO (지원 안함)</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">
                입찰 의사결정 (GO / HOLD / NO-GO)
              </CardTitle>
              {currentDecision && getDecisionBadge(currentDecision.decision)}
            </div>
            <CardDescription className="text-xs mt-1">
              공모 분석 결과를 검토한 후 사업 참여 여부를 결정하고 승인 조건을 기록합니다.
            </CardDescription>
          </div>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <UserCheck className="h-4 w-4" />
              <span>{currentDecision ? "의사결정 변경" : "의사결정 기록"}</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Existing Decision Details if any */}
        {currentDecision && !showForm && (
          <div className="p-3.5 rounded-lg border bg-muted/20 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>결정자: <strong>{currentDecision.userName || "담당자"}</strong></span>
              <span>결정 일시: {new Date(currentDecision.createdAt).toLocaleString("ko-KR")}</span>
            </div>
            <div className="font-medium text-foreground pt-1">
              사유: {currentDecision.reason}
            </div>
            {currentDecision.conditions.length > 0 && (
              <div className="pt-1 space-y-1">
                <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                  이행 조건 (Conditions):
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  {currentDecision.conditions.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Decision Input Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* 4 Decision Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">의사결정 구분</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["GO", "GO_WITH_CONDITIONS", "HOLD", "NO_GO"] as DecisionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`py-2 px-3 text-xs font-bold rounded-md border transition-all ${
                      selectedType === type
                        ? type === "GO"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : type === "GO_WITH_CONDITIONS"
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : type === "HOLD"
                          ? "bg-slate-700 text-white border-slate-700 shadow-sm"
                          : "bg-destructive text-white border-destructive shadow-sm"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {type === "GO"
                      ? "GO"
                      : type === "GO_WITH_CONDITIONS"
                      ? "조건부 GO"
                      : type === "HOLD"
                      ? "HOLD"
                      : "NO-GO"}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">결정 근거 및 사유 (필수)</label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="예: 사내 보유 AMR 로봇 기술과 과업지시서가 정확히 부합하며, TRL 6 수준 실증 실적을 갖추고 있어 수주 경쟁력 우수함."
                className="w-full text-xs bg-background border rounded-md p-2.5 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Conditions for GO_WITH_CONDITIONS */}
            {(selectedType === "GO_WITH_CONDITIONS" || selectedType === "GO") && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  이행 조건 등록 (선택)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newConditionInput}
                    onChange={(e) => setNewConditionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCondition())}
                    placeholder="예: D-10 이전 ROS2 기술초안 완료, 인증 최신본 갱신 확인"
                    className="flex-1 text-xs bg-background border rounded-md px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCondition} className="shrink-0 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    조건 추가
                  </Button>
                </div>
                {conditions.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {conditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/40 text-xs text-foreground">
                        <span>• {cond}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(idx)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                취소
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs">
                {isSubmitting ? "기록 중..." : "의사결정 공식 승인 및 기록"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
