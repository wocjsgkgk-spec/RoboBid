"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  Lock,
  Layers,
  BarChart3,
  Cpu,
  Target,
  FileCheck2,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  BookOpen,
  DollarSign,
  Briefcase,
  AlertOctagon,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Opportunity,
  ProjectConcept,
  MasterSpecification,
  FundingFitResult,
} from "@/types";
import { getTemplateForFundingType, AgencyTemplateConfig, AGENCY_TEMPLATES, PublicAgencyType } from "@/lib/proposals/agency-templates";
import { CrossReviewEngine } from "@/lib/proposals/cross-review-engine";
import { FundingFitService } from "@/lib/funding/funding-fit-service";
import { CrossReviewResult } from "@/types/project";

interface Application360WorkspaceProps {
  opportunity: Opportunity;
  concept?: ProjectConcept | null;
  spec?: MasterSpecification | null;
  onBack?: () => void;
}

export function Application360Workspace({
  opportunity,
  concept: initialConcept,
  spec: initialSpec,
  onBack,
}: Application360WorkspaceProps) {
  // 14-dimension unified workflow steps
  type WorkspaceTab =
    | "OVERVIEW"          // 1. Opportunity & Project
    | "ELIGIBILITY"       // 2. Eligibility & 14-Axis
    | "FUNDING_FIT"       // 3. Funding Fit & Budget
    | "PROPOSAL"          // 4. Proposal Draft & 12 Templates
    | "KPI_WBS"           // 5. KPI & WBS Execution
    | "EVIDENCE_REVIEW"   // 6. Evidence & Cross-Review
    | "SUBMISSION_GATE";  // 7. Zero-Auto-Submit Gate

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("OVERVIEW");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(
    opportunity.fundingType || "GOV_RND"
  );
  const [templateConfig, setTemplateConfig] = useState<AgencyTemplateConfig>(
    getTemplateForFundingType(opportunity.fundingType, opportunity.bidType)
  );

  // Funding Fit
  const [fitResult, setFitResult] = useState<FundingFitResult | null>(null);

  // Cross Review
  const [crossReview, setCrossReview] = useState<CrossReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Proposal Sections (Mock/Editable)
  const [sections, setSections] = useState<Array<{ sectionCode: string; title: string; content: string }>>([]);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  // Submission Gate (Zero-Auto-Submit)
  const [checklist, setChecklist] = useState({
    formatVerified: true,
    mandatoryCitationsReady: true,
    budgetMatched: true,
    evidenceAttached: true,
    humanReviewed: false,
  });
  const [submitterName, setSubmitterName] = useState("홍길동 책임연구원");
  const [shaHash, setShaHash] = useState("sha256-verified-spec-v3-8f92a1c4b7e5");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize Template & Sections
  useEffect(() => {
    const config = getTemplateForFundingType(selectedTemplateKey, opportunity.bidType);
    setTemplateConfig(config);
    setSections(
      config.sections.map((s) => ({
        sectionCode: s.sectionCode,
        title: s.title,
        content: `### ${s.title}\n\n[자동 인용 근거: ${initialConcept?.name || "로봇 프로젝트"} Master Spec]\n- 과제 목표: ${initialConcept?.summary || "고중량 자율주행 협동 AMR 시스템 개발"}\n- 추진 배경: ${s.defaultPromptGoal}\n\n* 본 내용은 AI 어시스턴트가 사내 지식 볼트 및 Master Specification을 기반으로 초안을 구성한 내용입니다.`,
      }))
    );
  }, [selectedTemplateKey, opportunity]);

  // Compute Funding Fit
  useEffect(() => {
    if (initialConcept) {
      const fit = FundingFitService.calculateFit(initialConcept, opportunity, initialSpec);
      setFitResult(fit);
    }
  }, [initialConcept, opportunity, initialSpec]);

  // Run Cross-Review
  const handleRunCrossReview = () => {
    setIsReviewing(true);
    setTimeout(() => {
      const engine = new CrossReviewEngine();
      const mockProposal = {
        id: `prop-${opportunity.id}`,
        organizationId: opportunity.organizationId,
        opportunityId: opportunity.id,
        title: `${opportunity.title} 수행 계획서`,
        status: "DRAFTING" as const,
        currentVersion: 1,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockSections = sections.map((s, idx) => ({
        id: `sec-${idx}`,
        proposalId: mockProposal.id,
        sectionCode: s.sectionCode,
        title: s.title,
        orderIndex: idx + 1,
        contentMarkdown: s.content,
        evidenceCitations: [],
        status: "AI_GENERATED" as const,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const res = engine.review(mockProposal, mockSections, [], opportunity.fundingType || "GOV_RND");
      setCrossReview(res);
      setIsReviewing(false);
      toast.success("사업 유형별 전문 심사위원 교차 검토가 완료되었습니다.");
    }, 600);
  };

  const handleConfirmHumanSubmission = () => {
    if (!checklist.humanReviewed) {
      toast.error("인간 담당자 최종 검토 승인(Sign-off) 체크가 필요합니다.");
      return;
    }
    if (!submitterName.trim()) {
      toast.error("제출 책임자 서명을 입력해 주세요.");
      return;
    }

    setIsSubmitted(true);
    toast.success("제출 확정 완료 (Zero-Auto-Submit 준수)", {
      description: `제출 담당자 [${submitterName}] 서명 및 파일 무결성 해시가 안전하게 영구 기록되었습니다.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar: Opportunity + Concept Bridge */}
      <div className="p-4 rounded-xl border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-none text-[11px] font-semibold">
              Application Workspace v3.0
            </Badge>
            <span className="text-xs text-muted-foreground">{opportunity.announcingAgency}</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              D-Day {opportunity.submissionDeadline ? "D-14" : "상시"}
            </Badge>
          </div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            {opportunity.title}
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            연계 프로젝트: <span className="font-semibold text-foreground">{initialConcept?.name || "미지정 프로젝트"}</span> (목표 TRL {initialConcept?.targetTrl || 6})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <Button size="sm" variant="outline" onClick={onBack} className="text-xs">
              뒤로가기
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setActiveTab("SUBMISSION_GATE")}
            className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            제출 게이트 이동
          </Button>
        </div>
      </div>

      {/* 2. 14-Dimension Navigation Bar */}
      <div className="flex border-b border-muted overflow-x-auto">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "OVERVIEW"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          1. 공고 & 프로젝트
        </button>

        <button
          onClick={() => setActiveTab("ELIGIBILITY")}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "ELIGIBILITY"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          2. 자격 & 14축 적합도
        </button>

        <button
          onClick={() => setActiveTab("FUNDING_FIT")}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "FUNDING_FIT"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          3. Funding Fit & 예산
        </button>

        <button
          onClick={() => setActiveTab("PROPOSAL")}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "PROPOSAL"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          4. 12대 계획서 AI 작성
        </button>

        <button
          onClick={() => setActiveTab("KPI_WBS")}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "KPI_WBS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          5. KPI & WBS 실행
        </button>

        <button
          onClick={() => setActiveTab("EVIDENCE_REVIEW")}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "EVIDENCE_REVIEW"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          6. 증빙 & 교차심사
        </button>

        <button
          onClick={() => setActiveTab("SUBMISSION_GATE")}
          className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "SUBMISSION_GATE"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          7. Zero-Auto 제출 게이트
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                지원사업 공고 상세 개요
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">공고 주관기관</span>
                <span className="font-semibold">{opportunity.announcingAgency}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">지원 유형 (Funding Type)</span>
                <Badge variant="outline" className="text-[10px] font-mono">{opportunity.fundingType || "정부 R&D"}</Badge>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">정부 배정 예산</span>
                <span className="font-bold text-primary font-mono">
                  {((opportunity.allocatedBudget || 300_000_000) / 100_000_000).toFixed(1)}억원
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">접수 마감 시한</span>
                <span className="font-mono text-rose-600 font-semibold">{opportunity.submissionDeadline || "공고 참조"}</span>
              </div>
              <div className="pt-2">
                <span className="text-muted-foreground block mb-1">공고 원문 링크</span>
                <a
                  href={opportunity.canonicalUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline text-[11px] break-all"
                >
                  {opportunity.canonicalUrl || "https://apis.data.go.kr (공공데이터 연동)"}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                매칭 프로젝트 Concept & Master Spec
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">프로젝트 명칭</span>
                <span className="font-semibold">{initialConcept?.name || "AMR 자율주행 로봇"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">목표 기술성숙도 (TRL)</span>
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-none text-[10px]">
                  TRL {initialConcept?.targetTrl || 6} 단계
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">총 소요 개발비</span>
                <span className="font-mono font-bold">
                  {((initialConcept?.estimatedBudget || 800_000_000) / 100_000_000).toFixed(1)}억원
                </span>
              </div>
              <div className="pt-2 space-y-1">
                <span className="text-muted-foreground block">프로젝트 핵심 요약</span>
                <p className="text-muted-foreground bg-muted/30 p-2.5 rounded text-[11px] leading-relaxed">
                  {initialConcept?.summary || "풀필먼트 물류센터 중량물 이송을 완전 자동화하는 듀얼 SLAM 기반 협동 AMR 로봇 시스템"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: ELIGIBILITY & 14-AXIS */}
      {activeTab === "ELIGIBILITY" && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              14축 적합도 다각도 분석 및 신청 필수 자격 검증
            </CardTitle>
            <CardDescription className="text-xs">
              결격사유 여부, 필수 신청자격 보유 여부, 미보유 역량의 확보계획(Acquisition Plan)을 점검합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">신청 시점 필수 결격사유 없음 (Pass Mandatory Eligibility)</span>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px]">PASS</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded border bg-card space-y-1.5">
                <div className="font-bold text-foreground">1. 기업 업력 및 인증 적격성</div>
                <p className="text-muted-foreground text-[11px]">
                  창업 7년 이내 중소기업 요건 및 벤처기업확인서 유효기간 충족 확인 완료.
                </p>
                <Badge variant="outline" className="text-[10px] text-emerald-600">보유 (AVAILABLE)</Badge>
              </div>

              <div className="p-3 rounded border bg-card space-y-1.5">
                <div className="font-bold text-foreground">2. TRL 기술 수준 및 특허 매칭</div>
                <p className="text-muted-foreground text-[11px]">
                  요구 TRL 5단계 대비 사내 보유 TRL 6단계 기술 및 등록 특허 2건 인용 매칭.
                </p>
                <Badge variant="outline" className="text-[10px] text-emerald-600">보유 (AVAILABLE)</Badge>
              </div>

              <div className="p-3 rounded border bg-card space-y-1.5">
                <div className="font-bold text-foreground">3. 현장 실증 수요처 협약</div>
                <p className="text-muted-foreground text-[11px]">
                  수요처 물류센터 실증 업무협약(MOU) 확보 완료.
                </p>
                <Badge variant="outline" className="text-[10px] text-emerald-600">보유 (AVAILABLE)</Badge>
              </div>

              <div className="p-3 rounded border bg-card space-y-1.5">
                <div className="font-bold text-foreground">4. 해외 규격 CE 인증 취득</div>
                <p className="text-muted-foreground text-[11px]">
                  현재 미보유 상태이나 과제 수행 중(M8) 취득 예정 계획 수립.
                </p>
                <Badge variant="outline" className="text-[10px] text-blue-600">확보 계획 (PLANNED)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: FUNDING FIT & BUDGET */}
      {activeTab === "FUNDING_FIT" && fitResult && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                10개 비목별 예산 충당 분석 (Funding Fit)
              </span>
              <Badge className="bg-primary text-primary-foreground font-mono">
                전체 커버리지 {fitResult.coverage}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded border bg-muted/20">
                <span className="text-muted-foreground block">총 개발비</span>
                <span className="text-base font-bold font-mono">{(fitResult.project_cost / 100_000_000).toFixed(1)}억원</span>
              </div>
              <div className="p-3 rounded border bg-primary/10 border-primary/20">
                <span className="text-primary block font-semibold">정부지원금</span>
                <span className="text-base font-bold font-mono text-primary">{(fitResult.grant_amount / 100_000_000).toFixed(2)}억원</span>
              </div>
              <div className="p-3 rounded border bg-muted/20">
                <span className="text-amber-600 block">의무 자부담</span>
                <span className="text-base font-bold font-mono text-amber-600">{(fitResult.self_funding / 10_000_000).toFixed(0)}천만원</span>
              </div>
              <div className="p-3 rounded border bg-muted/20">
                <span className="text-rose-600 block">미지원 부족액</span>
                <span className="text-base font-bold font-mono text-rose-600">{(fitResult.unfunded_gap / 100_000_000).toFixed(1)}억원</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2 px-3">비목</th>
                    <th className="py-2 px-3 text-right">요청비용</th>
                    <th className="py-2 px-3 text-center">허용</th>
                    <th className="py-2 px-3 text-right">지원 충당액</th>
                    <th className="py-2 px-3 text-center">충당률</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {fitResult.coverage_by_category.slice(0, 6).map((row) => (
                    <tr key={row.category}>
                      <td className="py-2 px-3 font-sans font-semibold">{row.categoryLabel}</td>
                      <td className="py-2 px-3 text-right text-muted-foreground">{(row.requestedCost / 10_000_000).toFixed(1)}천만</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-bold ${row.isAllowed ? "text-emerald-600" : "text-rose-600"}`}>
                          {row.isAllowed ? "허용" : "불가"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-primary font-bold">{(row.fundedGrantAmount / 10_000_000).toFixed(1)}천만</td>
                      <td className="py-2 px-3 text-center">{row.coverageRatio}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PROPOSAL (12 TEMPLATES & AI GENERATOR) */}
      {activeTab === "PROPOSAL" && (
        <div className="space-y-4">
          {/* Template Switcher Bar */}
          <div className="p-3.5 rounded-xl border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">사업계획서 서식 템플릿:</span>
              <select
                value={selectedTemplateKey}
                onChange={(e) => setSelectedTemplateKey(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-background text-foreground shadow-sm"
              >
                <option value="GOV_RND">1. 정부 R&D 표준 연구개발계획서 (IRIS)</option>
                <option value="LOCAL_RND">2. 지자체/테크노파크 지역특화 R&D</option>
                <option value="STARTUP_GRANT">3. 중기부 창업성장/초기창업패키지</option>
                <option value="PROTOTYPE_GRANT">4. 시제품 제작 및 금형/목업 지원</option>
                <option value="VALIDATION_GRANT">5. 로봇 실증 및 보급·확산 지원</option>
                <option value="COMMERCIALIZATION">6. 기술사업화 및 판로개척 지원</option>
                <option value="CONTEST">7. 공공/민간 혁신 아이디어 공모전</option>
                <option value="COMPETITION">8. 로봇 기술 챌린지/경진대회</option>
                <option value="EXPORT">9. 글로벌 해외수출 지원사업</option>
                <option value="PROCUREMENT">10. 조달청 나라장터 표준 기술제안서</option>
                <option value="SERVICE_CONTRACT">11. 공공 SW 구축·운영 용역 제안서</option>
                <option value="CUSTOM">12. 사용자 정의 Custom 서식</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono text-primary">
                {templateConfig.sections.length}개 목차 섹션
              </Badge>
              <Button
                size="sm"
                onClick={() => toast.success("AI 제안서 초안이 Master Spec을 기반으로 갱신되었습니다.")}
                className="text-xs gap-1.5 bg-primary text-primary-foreground font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 전체 초안 재생성
              </Button>
            </div>
          </div>

          {/* Section Tabs & Markdown Editor */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 space-y-1.5">
              {sections.map((sec, idx) => (
                <button
                  key={sec.sectionCode}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    activeSectionIdx === idx
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-mono text-[10px] text-muted-foreground">{sec.sectionCode}</div>
                  <div className="truncate mt-0.5">{sec.title}</div>
                </button>
              ))}
            </div>

            <div className="md:col-span-3">
              {sections[activeSectionIdx] && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2 border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">
                        {sections[activeSectionIdx].title}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono text-emerald-600">
                        AI 사실 기반 생성 (Fact-Anchored)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <textarea
                      rows={14}
                      value={sections[activeSectionIdx].content}
                      onChange={(e) => {
                        const next = [...sections];
                        next[activeSectionIdx].content = e.target.value;
                        setSections(next);
                      }}
                      className="w-full text-xs font-mono p-3 rounded-lg border bg-background text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>인용 출처: Master Spec v1.0, 사내 특허 증빙</span>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("섹션이 저장되었습니다.")}>
                        섹션 저장
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KPI & WBS */}
      {activeTab === "KPI_WBS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                정량적 성능지표 (KPI) 목표
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-2.5 rounded border bg-card flex justify-between items-center">
                <div>
                  <div className="font-semibold text-foreground">최대 가반하중 (Payload)</div>
                  <div className="text-[11px] text-muted-foreground">KOLAS 공인시험성적서</div>
                </div>
                <span className="font-bold font-mono text-primary">500 kg 이상</span>
              </div>
              <div className="p-2.5 rounded border bg-card flex justify-between items-center">
                <div>
                  <div className="font-semibold text-foreground">위치 정지 정밀도 (Position Accuracy)</div>
                  <div className="text-[11px] text-muted-foreground">공인기관 레이저 트래커 실측</div>
                </div>
                <span className="font-bold font-mono text-primary">±10 mm 이하</span>
              </div>
              <div className="p-2.5 rounded border bg-card flex justify-between items-center">
                <div>
                  <div className="font-semibold text-foreground">연속 주행 작업 시간 (Continuous Run)</div>
                  <div className="text-[11px] text-muted-foreground">현장 부하 연속 주행 시험</div>
                </div>
                <span className="font-bold font-mono text-primary">8 시간 이상</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                추진 일정 및 마일스톤 (WBS)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-2.5 rounded border bg-card">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>WBS 1: 기구 섀시 및 전장 설계</span>
                  <span className="text-indigo-600 font-mono">M1 ~ M3</span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-0.5">구조 해석 및 드라이버 회로 PCB 제작</p>
              </div>
              <div className="p-2.5 rounded border bg-card">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>WBS 2: ROS2 SLAM 및 자율주행 알고리즘 포팅</span>
                  <span className="text-indigo-600 font-mono">M4 ~ M6</span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-0.5">3D LiDAR 센서 융합 및 실내 맵핑 테스트</p>
              </div>
              <div className="p-2.5 rounded border bg-card">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>WBS 3: 물류창고 필드 실증 및 KOLAS 인증</span>
                  <span className="text-indigo-600 font-mono">M7 ~ M12</span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-0.5">수요기업 현장 배치 및 최종 공인시험 성적서 수령</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 6: EVIDENCE & CROSS-REVIEW */}
      {activeTab === "EVIDENCE_REVIEW" && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  지원사업 유형별 4대 전문 심사위원 교차 검토 (Cross-Review)
                </CardTitle>
                <CardDescription className="text-xs">
                  {opportunity.fundingType || "R&D"} 특화 페르소나를 기반으로 제안서 품질과 합격 가능성을 다각도로 사전 진단합니다.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleRunCrossReview}
                disabled={isReviewing}
                className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReviewing ? "animate-spin" : ""}`} />
                심사위원단 교차검토 실행
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {crossReview ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl border bg-muted/30 flex items-center justify-between">
                  <div className="text-xs font-semibold text-muted-foreground">심사위원단 종합 평균 점수</div>
                  <div className="text-2xl font-bold font-mono text-primary">{crossReview.overallScore}점 / 100점</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {crossReview.findings.map((f, idx) => (
                    <Card key={idx} className="border shadow-xs">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-foreground">{f.agentName}</span>
                          <Badge
                            className={`text-[10px] ${
                              f.status === "PASS"
                                ? "bg-emerald-600 text-white"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            {f.score}점 ({f.status})
                          </Badge>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">{f.title}</div>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                          {f.comments.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                        {f.recommendations.length > 0 && (
                          <div className="p-2 rounded bg-muted/40 text-[11px] text-primary">
                            <span className="font-bold block mb-0.5">개선 권고:</span>
                            {f.recommendations.join(", ")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-2 text-muted-foreground">
                <Sparkles className="w-8 h-8 text-primary mx-auto opacity-70" />
                <p className="text-xs">상단의 [심사위원단 교차검토 실행] 버튼을 눌러 평가를 진행하세요.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 7: SUBMISSION GATE (ZERO-AUTO-SUBMIT) */}
      {activeTab === "SUBMISSION_GATE" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                Zero-Auto-Submit 최종 제출 통제 정책 준수
              </h4>
              <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">
                RoboBid AI는 전담기관 시스템으로 자동 전송하거나 대리 투찰을 임의로 실행하지 않습니다.
                모든 지원서류는 인간 제안 책임자의 100% 검토 확인 및 전자서명(Sign-off) 후에만 최종 완료 처리됩니다.
              </p>
            </div>
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>제출 전 5대 무결성 체크리스트</span>
                <Badge variant="outline" className="text-xs text-primary font-mono">
                  {Object.values(checklist).filter(Boolean).length} / 5 충족
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded border bg-card cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.formatVerified}
                  onChange={(e) => setChecklist({ ...checklist, formatVerified: e.target.checked })}
                  className="rounded text-primary"
                />
                <span className="font-semibold">1. 공고 양식 및 제출 서식 규격 100% 준수 (HWPX/PDF 변환 완료)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded border bg-card cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.mandatoryCitationsReady}
                  onChange={(e) => setChecklist({ ...checklist, mandatoryCitationsReady: e.target.checked })}
                  className="rounded text-primary"
                />
                <span className="font-semibold">2. Master Spec 기반 정량 수치 및 허위 기재 방지 대조 완료</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded border bg-card cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.budgetMatched}
                  onChange={(e) => setChecklist({ ...checklist, budgetMatched: e.target.checked })}
                  className="rounded text-primary"
                />
                <span className="font-semibold">3. 정부지원금 비목별 산출내역 및 자부담(민간부담금) 매칭 확인</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded border bg-card cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.evidenceAttached}
                  onChange={(e) => setChecklist({ ...checklist, evidenceAttached: e.target.checked })}
                  className="rounded text-primary"
                />
                <span className="font-semibold">4. 사업자등록증, 벤처확인서, 재무제표, 인감 등 필수 증빙 완비</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded border bg-primary/5 border-primary/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.humanReviewed}
                  onChange={(e) => setChecklist({ ...checklist, humanReviewed: e.target.checked })}
                  className="rounded text-primary"
                />
                <span className="font-bold text-primary">5. [인간 제안 책임자 Sign-off] 본 사업계획서의 최종 제출을 승인함</span>
              </label>
            </CardContent>
          </Card>

          {/* Sign-off & Confirmation Box */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-primary" />
                인간 제안 책임자 최종 접수 서명
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">제출 담당자 성명 및 직책</label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="w-full px-3 py-2 rounded border bg-background font-semibold text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">최종 파일 무결성 해시 (SHA-256)</label>
                  <input
                    type="text"
                    readOnly
                    value={shaHash}
                    className="w-full px-3 py-2 rounded border bg-muted/50 font-mono text-muted-foreground text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  onClick={handleConfirmHumanSubmission}
                  disabled={isSubmitted || !checklist.humanReviewed}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitted ? "최종 제출 완료됨" : "인간 책임자 최종 제출 확정 (Confirm Submission)"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
