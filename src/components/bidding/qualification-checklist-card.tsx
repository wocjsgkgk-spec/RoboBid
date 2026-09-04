"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  Building2,
  FileCheck2,
  AlertCircle,
  Users2,
  Sparkles,
} from "lucide-react";
import {
  QualificationEvaluator,
  CreditRatingGrade,
} from "@/lib/bidding/qualification-evaluator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QualificationChecklistCardProps {
  targetEstimatedPrice?: number;
  initialTrackRecord?: number;
  title?: string;
}

export function QualificationChecklistCard({
  targetEstimatedPrice = 500000000,
  initialTrackRecord = 450000000,
  title = "적격심사 종합 모의 자가진단 (100점 만점)",
}: QualificationChecklistCardProps) {
  const [estimatedPrice, setEstimatedPrice] = useState<number>(targetEstimatedPrice);
  const [trackRecord, setTrackRecord] = useState<number>(initialTrackRecord);
  const [creditRating, setCreditRating] = useState<CreditRatingGrade>("A-");
  const [selectedBonuses, setSelectedBonuses] = useState<string[]>([
    "SME_CERT",
    "NEW_TECH_NET",
  ]);
  const [threshold, setThreshold] = useState<number>(85.0);

  // Consortium (공동수급체) Simulation State
  const [isConsortium, setIsConsortium] = useState(false);
  const [consortiumShareRatio, setConsortiumShareRatio] = useState<number>(70); // 주관사 70%
  const [partnerTrackRecord, setPartnerTrackRecord] = useState<number>(400000000); // 공동수급사 실적
  const [autoMatchedCount, setAutoMatchedCount] = useState<number>(0);

  // Auto-sync company certifications from Capability Vault
  useEffect(() => {
    const syncFromVault = async () => {
      try {
        const res = await fetch("/api/vault");
        if (res.ok) {
          const data = await res.json();
          const items: any[] = data.capabilities || [];
          const matchedBonuses: string[] = [];

          let sumProjects = 0;
          for (const it of items) {
            const titleText = (it.title || "").toLowerCase();
            const desc = (it.description || "").toLowerCase();
            if (it.type === "PROJECT_HISTORY" && it.metadata?.contractAmount) {
              sumProjects += Number(it.metadata.contractAmount) || 0;
            }
            if (titleText.includes("소기업") || desc.includes("소기업")) matchedBonuses.push("SME_CERT");
            if (titleText.includes("여성") || desc.includes("여성")) matchedBonuses.push("FEMALE_BIZ");
            if (titleText.includes("장애인") || desc.includes("장애인")) matchedBonuses.push("DISABLED_BIZ");
            if (titleText.includes("신기술") || titleText.includes("net") || desc.includes("net")) matchedBonuses.push("NEW_TECH_NET");
            if (titleText.includes("벤처") || titleText.includes("이노비즈") || desc.includes("이노비즈")) matchedBonuses.push("INNOBIZ");
          }

          if (matchedBonuses.length > 0) {
            setSelectedBonuses((prev) => Array.from(new Set([...prev, ...matchedBonuses])));
            setAutoMatchedCount(matchedBonuses.length);
          }
          if (sumProjects > 0) {
            setTrackRecord(sumProjects);
          }
        }
      } catch (err) {
        console.warn("[QualificationChecklistCard] Vault sync warning:", err);
      }
    };
    syncFromVault();
  }, []);

  const evaluation = useMemo(() => {
    // 공동도급 적용 시: 주관사 실적 * 지분율 + 공동수급사 실적 * 지분율
    const effectiveCompany = isConsortium
      ? (trackRecord * consortiumShareRatio) / 100 +
        (partnerTrackRecord * (100 - consortiumShareRatio)) / 100
      : trackRecord;

    return QualificationEvaluator.evaluate({
      targetEstimatedPrice: estimatedPrice,
      companyTrackRecordTotal: effectiveCompany,
      creditRating,
      passScoreThreshold: threshold,
      selectedBonuses,
    });
  }, [
    estimatedPrice,
    trackRecord,
    partnerTrackRecord,
    isConsortium,
    consortiumShareRatio,
    creditRating,
    threshold,
    selectedBonuses,
  ]);

  const toggleBonus = (id: string) => {
    setSelectedBonuses((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const ratingGrades: CreditRatingGrade[] = [
    "AAA",
    "AA",
    "A+",
    "A",
    "A-",
    "BBB+",
    "BBB",
    "BBB-",
    "BB+",
    "BB",
    "B+",
    "CCC+",
  ];

  return (
    <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                {title}
                <Badge
                  variant={evaluation.isPassed ? "default" : "destructive"}
                  className="text-xs px-2 py-0.5"
                >
                  {evaluation.isPassed ? "통과 판정 (PASS)" : "보완 필요 (FAIL)"}
                </Badge>
                {autoMatchedCount > 0 && (
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30 gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    사내 Vault {autoMatchedCount}종 연동됨
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                조달청 물품·용역 적격심사 세부기준에 맞춘 배점 자동 산정
              </CardDescription>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black tracking-tight text-foreground">
              {evaluation.totalScore}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ 100점</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              통과 기준: {evaluation.passThreshold}점 이상
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 점수 요약 바 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
            <span className="text-[11px] text-muted-foreground block font-medium">
              1. 경영상태 (30점 만점)
            </span>
            <span className="text-lg font-bold text-foreground">
              {evaluation.managementScore}점
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              신용등급: {creditRating}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
            <span className="text-[11px] text-muted-foreground block font-medium">
              2. 이행실적 (70점 만점)
            </span>
            <span className="text-lg font-bold text-foreground">
              {evaluation.trackRecordScore}점
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              인정비율: {evaluation.trackRecordRatio}%
            </span>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
            <span className="text-[11px] text-muted-foreground block font-medium">
              3. 신인도 가감점 (±5점)
            </span>
            <span
              className={`text-lg font-bold ${
                evaluation.reliabilityBonusScore >= 0
                  ? "text-primary"
                  : "text-destructive"
              }`}
            >
              {evaluation.reliabilityBonusScore > 0 ? "+" : ""}
              {evaluation.reliabilityBonusScore}점
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {evaluation.activeBonuses.length}개 항목 적용
            </span>
          </div>
        </div>

        {/* 설정 컨트롤 패널 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-border py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              공고 추정가격 (원)
            </label>
            <input
              type="number"
              step="10000000"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              당사 3~5년 실적 누계 (원)
            </label>
            <input
              type="number"
              step="10000000"
              value={trackRecord}
              onChange={(e) => setTrackRecord(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              신용평가등급 (기업평가)
            </label>
            <select
              value={creditRating}
              onChange={(e) => setCreditRating(e.target.value as CreditRatingGrade)}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              {ratingGrades.map((g) => (
                <option key={g} value={g}>
                  {g} (경영상태 {QualificationEvaluator.getManagementScore(g)}점)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 공동도급 (컨소시엄) 지분율 시뮬레이터 */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
              <input
                type="checkbox"
                checked={isConsortium}
                onChange={(e) => setIsConsortium(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <Users2 className="h-4 w-4 text-primary" />
              <span>공동이행방식(컨소시엄) 공동도급 지분율 시뮬레이션</span>
            </label>
            {isConsortium && (
              <Badge variant="outline" className="text-xs bg-background">
                당사 {consortiumShareRatio}% : 파트너 {100 - consortiumShareRatio}%
              </Badge>
            )}
          </div>

          {isConsortium && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">당사 지분율</span>
                  <span className="font-bold text-primary">{consortiumShareRatio}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={consortiumShareRatio}
                  onChange={(e) => setConsortiumShareRatio(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium block">
                  공동수급사 실적 보유액 (원)
                </label>
                <input
                  type="number"
                  step="10000000"
                  value={partnerTrackRecord}
                  onChange={(e) => setPartnerTrackRecord(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* 신인도 가점 체크리스트 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-primary" />
              신인도 가점 및 감점 체크리스트 (최대 ±5.0점 한도)
            </span>
            <span className="text-[11px] text-muted-foreground">
              해당 인증서를 클릭하여 반영
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QualificationEvaluator.DEFAULT_BONUS_ITEMS.map((item) => {
              const isChecked = selectedBonuses.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleBonus(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${
                    isChecked
                      ? item.category === "BONUS"
                        ? "border-primary/40 bg-primary/5 text-primary font-medium"
                        : "border-destructive/40 bg-destructive/5 text-destructive font-medium"
                      : "border-border/60 bg-muted/10 hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isChecked ? (
                      item.category === "BONUS" ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/40" />
                    )}
                    <span className="text-xs text-foreground">{item.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      item.points > 0 ? "text-primary border-primary/30" : "text-destructive border-destructive/30"
                    }`}
                  >
                    {item.points > 0 ? `+${item.points}` : item.points}점
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* 권고사항 박스 */}
        {evaluation.recommendations.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>적격심사 통과율 제고를 위한 AI 보완 가이드</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {evaluation.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
