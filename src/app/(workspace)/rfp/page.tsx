"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  History,
  ShieldAlert,
  Search,
  Check,
  FileCheck2,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { Opportunity } from "@/types";
import { ComplianceStatus, RequirementMatrixItem } from "@/types/compliance";
import { ComplianceMatrixTable } from "@/components/compliance/compliance-matrix-table";
import { toast } from "sonner";

interface RequirementItem {
  code: string;
  category: string;
  originalText: string;
  isMandatory: boolean;
  rfpPage: string;
  status: ComplianceStatus;
  assignee: string;
  proposalSection: string;
  evidence: string;
}

const INITIAL_REQUIREMENTS: RequirementItem[] = [
  {
    code: "REQ-001",
    category: "기능요구",
    originalText: "자율이동로봇(AGV)은 LiDAR 및 SLAM 기반으로 실내 물류창고에서 500kg 이상 화물을 이송할 수 있어야 함.",
    isMandatory: true,
    rfpPage: "제안요청서 p.12 3.1항",
    status: "SATISFIED",
    assignee: "이책임 (로봇연구소)",
    proposalSection: "2.1 시스템 아키텍처",
    evidence: "사내 특허 제10-2458902호 (SLAM 군집제어)",
  },
  {
    code: "REQ-002",
    category: "성능요구",
    originalText: "장애물 감지 시 0.5초 이내 급정동 및 회피 경로 재계획이 수행되어야 하며, 안전 센서 2중화 필수.",
    isMandatory: true,
    rfpPage: "제안요청서 p.14 3.2항",
    status: "SATISFIED",
    assignee: "박선임 (안전제어팀)",
    proposalSection: "2.2 핵심 개발 내용",
    evidence: "KTL 안전인증 성적서 (SIL2 등급)",
  },
  {
    code: "REQ-003",
    category: "인터페이스",
    originalText: "기존 물류창고 WMS(창고관리시스템) 및 상위 관제서버와 REST API 및 ROS2 브릿지로 실시간 연동되어야 함.",
    isMandatory: true,
    rfpPage: "제안요청서 p.18 4.1항",
    status: "PARTIAL",
    assignee: "정선임 (소프트웨어팀)",
    proposalSection: "2.3 인터페이스 설계",
    evidence: "WMS 연동 API 표준 규격서 초안 준비 중",
  },
  {
    code: "REQ-004",
    category: "품질/보증",
    originalText: "납품 후 24개월간 무상 하자보수 및 4시간 이내 긴급 현장 출동 기술지원 체계를 구성해야 함.",
    isMandatory: false,
    rfpPage: "제안요청서 p.25 5.2항",
    status: "REVIEW_REQUIRED",
    assignee: "김수석 (사업개발팀)",
    proposalSection: "4.2 품질 보증 및 유지보수 계획",
    evidence: "수도권/영남권 2개 권역 AS 협력사 협약서",
  },
  {
    code: "REQ-005",
    category: "제출서류",
    originalText: "공공조달 적격심사를 위한 신용평가등급확인서(BBB+ 이상) 및 중소기업확인서 필수 제출.",
    isMandatory: true,
    rfpPage: "공고문 p.3 입찰참가자격",
    status: "SATISFIED",
    assignee: "경영지원팀",
    proposalSection: "1.2 제안사 일반현황",
    evidence: "나이스디앤비 BBB+ 등급확인서",
  },
];

export default function RFPAnalysisPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [requirements, setRequirements] = useState<RequirementItem[]>(INITIAL_REQUIREMENTS);
  const [activeTab, setActiveTab] = useState<"MATRIX" | "DIFF" | "SUMMARY">("MATRIX");

  useEffect(() => {
    const opps = opportunityStore.getAll();
    setOpportunities(opps);
    if (opps.length > 0) {
      setSelectedOppId(opps[0].id);
    }
  }, []);

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId);

  const handleStatusChange = (code: string, nextStatus: ComplianceStatus) => {
    setRequirements((prev) =>
      prev.map((r) => (r.code === code ? { ...r, status: nextStatus } : r))
    );
  };

  const handleTransferToProposals = () => {
    if (!selectedOpp) {
      toast.error("전송할 공모를 선택해주세요.");
      return;
    }
    const handoffData = {
      opportunityId: selectedOpp.id,
      title: selectedOpp.title,
      announcingAgency: selectedOpp.announcingAgency,
      bidType: selectedOpp.bidType,
      allocatedBudget: selectedOpp.allocatedBudget,
      submissionDeadline: selectedOpp.submissionDeadline,
      requirements: requirements.map((r) => ({
        code: r.code,
        category: r.category,
        originalText: r.originalText,
        proposalSection: r.proposalSection,
        status: r.status,
      })),
      timestamp: Date.now(),
    };
    localStorage.setItem("robobid_rfp_handoff", JSON.stringify(handoffData));
    toast.success(`'${selectedOpp.title}' 요구사항 ${requirements.length}건이 제안서 워크스페이스로 전송되었습니다.`);
    setTimeout(() => {
      window.location.href = "/proposals";
    }, 400);
  };

  const satisfiedCount = requirements.filter((r) => r.status === "SATISFIED").length;
  const complianceRate = Math.round((satisfiedCount / requirements.length) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Header & Opportunity Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              RFP 요구사항 분석 & 공고 변경비교
            </h1>
            <Badge variant="outline" className="text-xs">
              RTM 매트릭스
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            제안요청서의 정량/정성 요구조건을 추적하고, 수정공고 변경 사항(Diff)을 한눈에 대조합니다.
          </p>
        </div>

        {/* Opportunity Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="h-9 px-3 text-xs bg-card border rounded-md text-foreground max-w-[260px] truncate focus:outline-none"
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={handleTransferToProposals}
            disabled={!selectedOpp}
            className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            <span>제안서 작성으로 전송</span>
          </Button>
        </div>
      </div>

      {/* 2. Mode Tabs */}
      <div className="flex items-center gap-2 border-b pb-2">
        <Button
          variant={activeTab === "MATRIX" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("MATRIX")}
          className="text-xs gap-1.5"
        >
          <Layers className="h-4 w-4" />
          <span>요구사항 매트릭스 (RTM)</span>
          <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-background/20">
            {requirements.length}
          </span>
        </Button>
        <Button
          variant={activeTab === "DIFF" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("DIFF")}
          className="text-xs gap-1.5"
        >
          <History className="h-4 w-4" />
          <span>수정공고 변경비교 (Revision Diff)</span>
          <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-destructive/20 text-destructive font-bold">
            NEW 4
          </span>
        </Button>
        <Button
          variant={activeTab === "SUMMARY" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("SUMMARY")}
          className="text-xs gap-1.5"
        >
          <FileCheck2 className="h-4 w-4" />
          <span>핵심 공모 요약서</span>
        </Button>
      </div>

      {/* TAB 1: Requirement Matrix */}
      {activeTab === "MATRIX" && (
        <ComplianceMatrixTable
          items={requirements.map((r) => ({
            id: `req-${r.code}`,
            proposalId: selectedOppId || "prop-default",
            requirementCode: r.code,
            category: r.category,
            originalText: r.originalText,
            isMandatory: r.isMandatory,
            sourceLocation: r.rfpPage,
            mappedSectionCode: r.proposalSection,
            complianceStatus: r.status,
            evidenceNotes: r.evidence,
            reviewedBy: r.assignee,
            reviewedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))}
          proposalTitle={selectedOpp?.title || "RFP 요구사항 분석"}
          onStatusChange={(id, newStatus) => {
            const code = id.replace("req-", "");
            handleStatusChange(code, newStatus);
          }}
        />
      )}

      {/* TAB 2: Revision Diff Viewer */}
      {activeTab === "DIFF" && (
        <Card>
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  수정공고 변경 내역 비교 (v1.0 최초공고 vs v1.1 정정공고)
                </CardTitle>
                <CardDescription className="text-xs">
                  발주처의 수정공고 재업로드 시 변경된 예산, 사업기간, 제출서류, TRL 조항을 자동으로 비교합니다.
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-xs font-mono">
                중요 변경 4건 감지
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Diff Items */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-amber-800 dark:text-amber-400">
                    1. 접수 마감일자 연장 (일정 변경)
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground font-mono">
                    <span className="line-through text-destructive">이전: 2026-09-08 17:00</span>
                    <ArrowRight className="h-3 w-3 text-amber-500" />
                    <span className="font-bold text-emerald-600">변경: 2026-09-15 18:00 (7일 연장)</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] self-start sm:self-auto border-amber-500/40 text-amber-700">
                  일정 리스크 완화
                </Badge>
              </div>

              <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-blue-800 dark:text-blue-400">
                    2. 배정 예산 증액 (사업비 변경)
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground font-mono">
                    <span className="line-through text-destructive">이전: 850,000,000원</span>
                    <ArrowRight className="h-3 w-3 text-blue-500" />
                    <span className="font-bold text-primary">변경: 900,000,000원 (+5천만원)</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] self-start sm:self-auto border-blue-500/40 text-blue-700">
                  수익성 상향
                </Badge>
              </div>

              <div className="p-3 rounded-lg border bg-destructive/5 border-destructive/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-destructive">
                    3. 필수 제출 서류 추가 (실격 위험 주의)
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground font-mono">
                    <span className="line-through">이전: 제출 불요</span>
                    <ArrowRight className="h-3 w-3 text-destructive" />
                    <span className="font-bold text-destructive">
                      변경: &quot;정보보안 및 영업비밀보호 서약서(양식 4호)&quot; 필수 추가
                    </span>
                  </div>
                </div>
                <Badge variant="destructive" className="text-[10px] self-start sm:self-auto">
                  실격 필수 서류
                </Badge>
              </div>

              <div className="p-3 rounded-lg border bg-purple-500/5 border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-purple-800 dark:text-purple-400">
                    4. 평가기준 배점 조정 (기술성 평가 강화)
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground font-mono">
                    <span className="line-through">기술 80점 / 가격 20점</span>
                    <ArrowRight className="h-3 w-3 text-purple-500" />
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      기술 90점 / 가격 10점 (당사 기술 우위 유리)
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] self-start sm:self-auto border-purple-500/40 text-purple-700">
                  전략 유리
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Summary */}
      {activeTab === "SUMMARY" && selectedOpp && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">사업 기본 개요</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">사업명</span>
                <span className="font-bold text-foreground">{selectedOpp.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">발주기관</span>
                <span className="font-semibold text-foreground">{selectedOpp.announcingAgency}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">사업유형</span>
                <span className="font-mono text-primary">{selectedOpp.bidType}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">배정 예산</span>
                <span className="font-mono font-bold text-foreground">
                  {(selectedOpp.allocatedBudget || 0).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">접수 마감</span>
                <span className="font-mono text-destructive font-semibold">
                  {selectedOpp.submissionDeadline.split("T")[0]}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">핵심 자격 및 기술 요건</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">요구 TRL 레벨</span>
                <span className="font-bold text-foreground">TRL 7 이상 (시스템 시제품 실증)</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">기업 규모</span>
                <span className="font-semibold text-foreground">중소·중견기업 (대기업 단독 불가)</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">공동수급체(컨소시엄)</span>
                <span className="font-semibold text-emerald-600">공동이행 허용 (최대 3개사, 대표사 70% 이상)</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">신인도 가점 혜택</span>
                <span className="text-primary font-medium">이노비즈(+1.5), 특허보유(+1.0), 일자리창출(+1.0)</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">자기부담금 비율</span>
                <span className="text-foreground">총 사업비의 25% 이상 (현금 10% + 현물 15%)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
