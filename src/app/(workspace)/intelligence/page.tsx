"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Database, ShieldCheck, Plus, AlertTriangle, CheckCircle2, Clock, FileText, Lock, BarChart3, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CapabilityWithAlert } from "@/lib/vault/vault-manager";
import { CapabilityType } from "@/types/capability";
import { KonepsRateIntelligence } from "@/components/bidding/koneps-rate-intelligence";
import { AgencyIntelligenceView } from "@/components/intelligence/agency-intelligence-view";

const CAPABILITY_TABS: Array<{ type: string; label: string }> = [
  { type: "ALL", label: "전체 자산" },
  { type: "COMPANY_PROFILE", label: "회사 기본정보" },
  { type: "TECHNOLOGY", label: "보유기술 (TRL)" },
  { type: "PRODUCT", label: "제품/하드웨어" },
  { type: "PATENT", label: "특허/지식재산" },
  { type: "CERTIFICATION", label: "인증서" },
  { type: "PROJECT_HISTORY", label: "수행실적" },
  { type: "EMPLOYEE_SKILL", label: "인력역량" },
  { type: "FINANCIAL_PROFILE", label: "재무 프로필" },
];

export default function IntelligencePage() {
  const [capabilities, setCapabilities] = useState<CapabilityWithAlert[]>([]);
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [readiness, setReadiness] = useState<any>(null);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"AGENCY" | "VAULT" | "PRICING">("AGENCY");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const tab = p.get("tab") || p.get("view");
      if (tab === "pricing" || tab === "rate") setViewMode("PRICING");
      else if (tab === "vault") setViewMode("VAULT");
      else if (tab === "agency") setViewMode("AGENCY");
    }
  }, []);

  // Form State
  const [newType, setNewType] = useState<CapabilityType>("COMPANY_PROFILE");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newValidUntil, setNewValidUntil] = useState("");

  const fetchCapabilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = selectedTab === "ALL" ? "/api/vault" : `/api/vault?type=${selectedTab}`;
      const res = await fetch(url);
      const data = await res.json();
      setCapabilities(data.capabilities || []);

      // Fetch readiness & projects
      const [readinessRes, projectsRes] = await Promise.all([
        fetch("/api/readiness"),
        fetch("/api/projects"),
      ]);
      if (readinessRes.ok) {
        const rData = await readinessRes.json();
        setReadiness(rData.readiness);
      }
      if (projectsRes.ok) {
        const pData = await projectsRes.json();
        setProjectsCount((pData.projects || []).length);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          title: newTitle,
          description: newDescription,
          validUntil: newValidUntil || undefined,
          verificationStatus: "VERIFIED",
          confidentiality: "CONFIDENTIAL",
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewTitle("");
        setNewDescription("");
        setNewValidUntil("");
        fetchCapabilities();
      }
    } catch {
      // Error handling
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            자료·인텔리전스 (BidOps Intelligence Hub)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            사내 역량 금고(Capability Vault) 및 나라장터 15개 복수예비가격 사정율 정규분포 통계를 통합 제공합니다.
          </p>
        </div>
        {viewMode === "VAULT" && (
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>새 역량 자산 등록</span>
          </Button>
        )}
      </div>

      {/* Primary Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setViewMode("AGENCY")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            viewMode === "AGENCY"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>발주기관 인텔리전스 (Agency Intelligence)</span>
          <Badge
            variant={viewMode === "AGENCY" ? "outline" : "secondary"}
            className={`ml-1 text-[10px] px-1.5 py-0 ${
              viewMode === "AGENCY" ? "border-primary-foreground/30 text-primary-foreground" : ""
            }`}
          >
            NEW
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("VAULT")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            viewMode === "VAULT"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Database className="h-4 w-4" />
          <span>사내 역량 저장소 (Capability Vault)</span>
          <Badge
            variant={viewMode === "VAULT" ? "outline" : "secondary"}
            className={`ml-1 text-[10px] px-1.5 py-0 ${
              viewMode === "VAULT" ? "border-primary-foreground/30 text-primary-foreground" : ""
            }`}
          >
            {capabilities.length}건
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("PRICING")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            viewMode === "PRICING"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>나라장터 사정율 & 낙찰분포 인텔리전스</span>
          <Badge
            variant="outline"
            className={`ml-1 text-[10px] px-1.5 py-0 ${
              viewMode === "PRICING"
                ? "border-primary-foreground/30 text-primary-foreground"
                : "border-primary/30 text-primary"
            }`}
          >
            KONEPS 통계
          </Badge>
        </button>
      </div>

      {/* Sub-view Rendering */}
      {viewMode === "AGENCY" ? (
        <AgencyIntelligenceView />
      ) : viewMode === "PRICING" ? (
        <KonepsRateIntelligence />
      ) : (
        <>
          {/* Expiration Alert Banner */}
          {capabilities.some((c) => c.isExpired || c.isExpiringSoon) && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  유효기간이 만료되었거나 30일 이내 만료 예정인 인증/자료가 존재합니다. 갱신 서류를 준비해 주세요.
                </span>
              </div>
            </div>
          )}

          {/* Phase 11 Readiness Gate & Post-Award Status */}
          {readiness && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-xl bg-card shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm">머신러닝 예측 모델 도입 준비도 (Readiness Gate)</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                readiness.winProbabilityModelDecision === 'GO'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}>
                {readiness.winProbabilityModelDecision === 'GO' ? '모델 학습 가능 (GO)' : '데이터 축적 지속 (NO-GO)'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {readiness.decisionReason}
            </p>
            <div className="grid grid-cols-4 gap-2 pt-2 border-t text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">검증 레이블 표본</span>
                <span className="font-bold">{readiness.labeledOutcomeCount}건</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">클래스 밸런스</span>
                <span className="font-bold">{readiness.classBalanceRatio}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">결측률</span>
                <span className="font-bold">{readiness.missingDataRate}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Provider 커버리지</span>
                <span className="font-bold">{readiness.providerCoverageRate}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-xl bg-card shadow-sm space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              선정 후 사업화 (Post-Award)
            </h3>
            <div className="text-2xl font-bold">{projectsCount}개</div>
            <p className="text-xs text-muted-foreground">
              최종 선정 공모의 실행 프로젝트 전환 및 4단계 WBS 마일스톤이 관리되고 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b pb-2">
        {CAPABILITY_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setSelectedTab(tab.type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedTab === tab.type
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Capabilities Content */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          사내 역량 저장소 조회 중...
        </div>
      ) : capabilities.length === 0 ? (
        <div className="rounded-lg border bg-card shadow-sm p-6">
          <EmptyState
            icon={Database}
            title="등록된 사내 역량 자산이 없습니다"
            description="[새 역량 자산 등록] 버튼을 눌러 회사의 설립정보, 보유기술(TRL), 인증서, 실적자료를 등록해 주세요."
            actionLabel="역량 등록하기"
            onAction={() => setShowAddModal(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap) => (
            <Card key={cap.id} className="hover:border-primary/40 transition-colors shadow-sm">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {cap.type}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {cap.isExpired ? (
                      <Badge variant="destructive" className="text-[10px]">만료됨</Badge>
                    ) : cap.isExpiringSoon ? (
                      <Badge variant="warning" className="text-[10px]">만료 D-{cap.daysRemaining}</Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">유효</Badge>
                    )}
                    <span title="사내 기밀 등급" className="text-muted-foreground">
                      <Lock className="h-3 w-3" />
                    </span>
                  </div>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 leading-snug">
                  {cap.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                {cap.description && (
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {cap.description}
                  </p>
                )}
                {cap.validUntil && (
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1">
                    <Clock className="h-3 w-3" />
                    <span>유효기간: {cap.validUntil}까지</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for adding capability */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-50">
          <div className="bg-card w-full max-w-md rounded-lg border p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-foreground">새 역량 자산 등록</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">자산 유형</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as CapabilityType)}
                  className="w-full text-xs bg-background border rounded-md p-2"
                >
                  <option value="COMPANY_PROFILE">회사 기본정보</option>
                  <option value="TECHNOLOGY">보유기술 (TRL)</option>
                  <option value="PRODUCT">제품/하드웨어</option>
                  <option value="PATENT">특허</option>
                  <option value="CERTIFICATION">인증서</option>
                  <option value="PROJECT_HISTORY">수행실적</option>
                  <option value="FINANCIAL_PROFILE">재무 프로필</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">자산명 / 인증명 / 기술명</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 이동로봇 자율주행 알고리즘 (TRL 6)"
                  className="w-full text-xs bg-background border rounded-md p-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">상세 설명</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="스펙, 실적 규모, 등록 번호 등 상세 설명"
                  rows={3}
                  className="w-full text-xs bg-background border rounded-md p-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">유효 만료일자 (선택)</label>
                <input
                  type="date"
                  value={newValidUntil}
                  onChange={(e) => setNewValidUntil(e.target.value)}
                  className="w-full text-xs bg-background border rounded-md p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  취소
                </Button>
                <Button type="submit" size="sm">
                  등록 완료
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Statement */}
      <div className="p-4 rounded-lg bg-muted/40 border flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">사내 기밀 RLS 통제:</strong> 등록된 모든 역량 자료는 조직(`organization_id`) 단위로 완벽히 분리되며, 권한이 없는 외부 사용자나 무료 외부 AI 모델로 전송되지 않습니다.
        </div>
      </div>
        </>
      )}
    </div>
  );
}
