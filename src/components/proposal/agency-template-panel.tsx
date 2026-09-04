"use client";

import React, { useEffect, useState } from "react";
import {
  Landmark,
  FileText,
  Award,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Scale,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PublicAgencyType, AGENCY_TEMPLATES } from "@/lib/proposals/agency-templates";
import { AgencyEvaluationResult } from "@/lib/scoring/agency-evaluation-criteria";

interface AgencyTemplatePanelProps {
  proposalTitle: string;
  onApplyTemplate?: (agencyType: PublicAgencyType) => void;
}

export function AgencyTemplatePanel({
  proposalTitle,
  onApplyTemplate,
}: AgencyTemplatePanelProps) {
  const [selectedAgency, setSelectedAgency] = useState<PublicAgencyType>("KONEPS");
  const [evaluation, setEvaluation] = useState<AgencyEvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgencyData = async (agency: PublicAgencyType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/agency-templates?agency=${agency}`);
      if (res.ok) {
        const data = await res.json();
        setEvaluation(data.evaluation);
      }
    } catch (err) {
      console.error("Failed to load agency template evaluation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencyData(selectedAgency);
  }, [selectedAgency]);

  const template = AGENCY_TEMPLATES[selectedAgency];

  return (
    <div className="space-y-6">
      {/* Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            공공기관 표준 서식 및 배점·가점 평가표
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            조달청, NIPA/NIA, 중기부 TIPA, 범부처 IRIS 기관별 표준 서식 목차와 법정 가점 획득 현황을 분석합니다.
          </p>
        </div>

        {/* Agency Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(AGENCY_TEMPLATES) as PublicAgencyType[]).map((key) => {
            const item = AGENCY_TEMPLATES[key];
            const isSelected = selectedAgency === key;
            return (
              <Button
                key={key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAgency(key)}
                className="text-xs h-8"
              >
                {item.shortName}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Agency Summary KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="선택 기관 및 서식 규격"
          value={template.shortName}
          subtitle={template.description}
          icon={Landmark}
          badgeText={template.agencyType}
          className="border-primary/40"
        />

        <MetricCard
          title="평가 배점 구조"
          value={`기술 ${evaluation?.technicalWeight || 80}%`}
          subtitle={template.evaluationFocus}
          icon={Scale}
          badgeText={`가격 ${evaluation?.priceWeight || 20}%`}
          progress={evaluation?.technicalWeight || 80}
        />

        <MetricCard
          title="사내 자산 기반 법정 가점 확보"
          value={`+${evaluation?.effectiveBonusPoints.toFixed(1) ?? "0.0"}점`}
          subtitle={evaluation?.evaluationSummary || "가점 항목 분석 중..."}
          icon={Award}
          badgeText={`MAX ${evaluation?.maxAllowableBonus.toFixed(1)}점`}
          badgeVariant="success"
          progress={evaluation ? Math.round((evaluation.effectiveBonusPoints / evaluation.maxAllowableBonus) * 100) : 0}
          className="border-l-4 border-l-emerald-500"
        />
      </div>

      {/* Two Column Layout: Left (Legal Bonus Points), Right (TOC & Mandatory Docs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Bonus Points Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-primary" />
              법정 가점 및 우대 항목 분석표
            </h3>
            <span className="text-xs text-muted-foreground">
              사내 역량 금고(Capability Vault) 실데이터 연동
            </span>
          </div>

          <div className="space-y-2.5">
            {evaluation?.bonusItems.map((item) => (
              <Card
                key={item.id}
                className={`transition-colors ${
                  item.isEligible ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10" : "opacity-75"
                }`}
              >
                <CardContent className="p-3.5 flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {item.category}
                      </Badge>
                      <span className="text-xs font-bold text-foreground">
                        {item.name}
                      </span>
                      {item.isEligible ? (
                        <Badge variant="success" className="text-[10px] gap-1 py-0 h-4">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          충족 (+{item.awardedPoints.toFixed(1)}점)
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] py-0 h-4">
                          미보유 (0점)
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {item.description}
                    </p>
                    {item.matchedEvidence && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium pt-0.5">
                        <FileCheck className="h-3 w-3" />
                        인정 증빙: {item.matchedEvidence}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono">
                      배점 {item.maxPoints.toFixed(1)}점
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Mandatory Documents & Standard TOC */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              {template.shortName} 표준 목차 및 제출 필수서류
            </h3>
          </div>

          {/* Mandatory Documents Box */}
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                발주처 필수 제출 서류 목록 (사전 체크리스트)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                {template.mandatoryDocuments.map((doc, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {doc}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Standard TOC List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              표준 기술제안서 5대 대목차 구성
            </h4>
            {template.sections.map((sec, idx) => (
              <Card key={sec.sectionCode} className="hover:border-primary/40 transition-colors">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {sec.title}
                      </span>
                      <div className="flex gap-1">
                        {sec.requiredEvidenceTypes.map((t) => (
                          <Badge key={t} variant="outline" className="text-[9px] px-1 py-0 font-mono">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {sec.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
