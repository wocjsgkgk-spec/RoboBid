"use client";

import React from "react";
import { EligibilityGateResult, EligibilityStatus } from "@/types/eligibility";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ShieldAlert, Quote } from "lucide-react";

interface EligibilityGateViewProps {
  result: EligibilityGateResult;
}

export function EligibilityGateView({ result }: EligibilityGateViewProps) {
  const getOverallBadge = (status: EligibilityStatus) => {
    switch (status) {
      case "PASS":
        return (
          <Badge variant="success" className="text-sm px-3 py-1 gap-1.5 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>지원 적격 (PASS)</span>
          </Badge>
        );
      case "FAIL":
        return (
          <Badge variant="destructive" className="text-sm px-3 py-1 gap-1.5 font-bold">
            <XCircle className="h-4 w-4" />
            <span>지원 불가 (FAIL)</span>
          </Badge>
        );
      case "REVIEW_REQUIRED":
        return (
          <Badge variant="warning" className="text-sm px-3 py-1 gap-1.5 font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>검토 필요 (REVIEW REQUIRED)</span>
          </Badge>
        );
      case "UNKNOWN":
        return (
          <Badge variant="outline" className="text-sm px-3 py-1 gap-1.5 font-bold border-slate-500 text-slate-700 dark:text-slate-300">
            <HelpCircle className="h-4 w-4" />
            <span>판정 불가 (UNKNOWN)</span>
          </Badge>
        );
    }
  };

  const getRuleStatusBadge = (status: EligibilityStatus) => {
    switch (status) {
      case "PASS":
        return <Badge variant="success" className="text-[10px]">PASS</Badge>;
      case "FAIL":
        return <Badge variant="destructive" className="text-[10px]">FAIL</Badge>;
      case "REVIEW_REQUIRED":
        return <Badge variant="warning" className="text-[10px]">REVIEW</Badge>;
      case "UNKNOWN":
        return <Badge variant="outline" className="text-[10px]">UNKNOWN</Badge>;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-base font-bold">
                지원자격 심사 결과 (Eligibility Gate)
              </CardTitle>
              {getOverallBadge(result.overallStatus)}
            </div>
            <CardDescription className="text-xs mt-1">
              RFP 공고 요건과 사내 역량 저장소(Capability Vault)의 정량 대조 결과입니다.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="text-emerald-600 font-semibold">PASS {result.passCount}</span>
            <span>•</span>
            <span className="text-destructive font-semibold">FAIL {result.failCount}</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">REVIEW {result.reviewRequiredCount}</span>
            <span>•</span>
            <span className="text-slate-500 font-semibold">UNKNOWN {result.unknownCount}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* UNKNOWN Auto-PASS prohibition alert */}
        {result.unknownCount > 0 && (
          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>자격 판정 원칙:</strong> 사내 역량 데이터가 미등록되어 확인되지 않은 요건(UNKNOWN)은 절대 자동으로 PASS 처리되지 않습니다. 사내 역량 저장소에 관련 정보를 등록하면 즉시 재평가됩니다.
            </div>
          </div>
        )}

        {/* Detailed Checks Table */}
        <div className="divide-y rounded-md border bg-background">
          {result.checks.map((check) => (
            <div key={check.ruleCode} className="p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getRuleStatusBadge(check.status)}
                  <span className="font-semibold text-foreground">{check.ruleName}</span>
                  {check.isMandatory && (
                    <span className="text-[10px] text-destructive font-mono font-semibold">
                      [필수]
                    </span>
                  )}
                </div>
                {check.rfpCitationSection && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    출처: {check.rfpCitationSection}
                  </span>
                )}
              </div>

              {/* Requirement & Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-muted-foreground">
                <div className="p-2 rounded bg-muted/40 space-y-1">
                  <span className="text-[10px] font-semibold text-foreground uppercase block">
                    공고 RFP 요구조건
                  </span>
                  <div>{check.rfpRequirement}</div>
                  {check.rfpCitationQuote && (
                    <div className="italic text-[11px] text-primary flex items-start gap-1 mt-1">
                      <Quote className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>"{check.rfpCitationQuote}"</span>
                    </div>
                  )}
                </div>

                <div className="p-2 rounded bg-muted/40 space-y-1">
                  <span className="text-[10px] font-semibold text-foreground uppercase block">
                    회사 역량 매칭 및 판정 사유
                  </span>
                  {check.matchedCapabilityTitle && (
                    <div className="font-medium text-foreground">
                      매칭: {check.matchedCapabilityTitle}
                    </div>
                  )}
                  <div className="leading-relaxed">{check.reason}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
