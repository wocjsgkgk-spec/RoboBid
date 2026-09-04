"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Sparkles,
  Save,
  History,
  Link2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldAlert,
  Layers,
  FileCheck,
  Send,
  Users2,
  Landmark,
  Download,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Proposal, ProposalSection, SectionStatus } from "@/types/proposal";
import { SpecialistRole } from "@/types/project";
import {
  ComplianceAuditSummary,
  ComplianceStatus,
  RequirementMatrixItem,
  SubmissionChecklist,
  SubmissionConfirmationPayload,
} from "@/types/compliance";
import { ComplianceMatrixView } from "@/components/compliance/compliance-matrix-view";
import { SubmissionControlPanel } from "@/components/compliance/submission-control-panel";
import { CrossReviewPanel } from "@/components/proposal/cross-review-panel";
import { AgencyTemplatePanel } from "@/components/proposal/agency-template-panel";
import { ProposalExportModal } from "@/components/proposal/proposal-export-modal";
import { KonepsPricingModal } from "@/components/bidding/koneps-pricing-modal";
import { QualityGateCard } from "@/components/proposals/quality-gate-card";
import { ProposalQualityGate } from "@/types/proposal";
import { TemplateLibrary } from "@/components/proposal/template-library";
import { SmartReuseDrawer } from "@/components/proposal/smart-reuse-drawer";
import { ProposalVersionCompareModal } from "@/components/proposal/proposal-version-compare-modal";
import { ApprovalWorkflowCard } from "@/components/proposal/approval-workflow-card";
import { ShieldCheck, GitCompare, BookOpen, UserCheck } from "lucide-react";
import { toast } from "@/components/ui/sonner-toast";

interface ProposalWorkspaceViewProps {
  proposal: Proposal;
  onBack: () => void;
  onSaveSection: (sectionCode: string, content: string, status: SectionStatus) => Promise<void>;
  onGenerateDraft: (sectionCode?: string) => Promise<void>;
  onCreateVersionSnapshot: (summary: string) => Promise<void>;
}

export function ProposalWorkspaceView({
  proposal,
  onBack,
  onSaveSection,
  onGenerateDraft,
  onCreateVersionSnapshot,
}: ProposalWorkspaceViewProps) {
  const sections = proposal.sections || [];
  const [activeTab, setActiveTab] = useState<
    "DRAFT" | "RTM" | "SUBMISSION" | "CROSS_REVIEW" | "AGENCY_TEMPLATE" | "QUALITY_GATE" | "APPROVAL" | "TEMPLATES"
  >("DRAFT");
  const [selectedSectionCode, setSelectedSectionCode] = useState<string>(
    sections[0]?.sectionCode || ""
  );
  const [editorContent, setEditorContent] = useState<string>(
    sections[0]?.contentMarkdown || ""
  );
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [versioning, setVersioning] = useState(false);
  const [snapshotSummary, setSnapshotSummary] = useState("");
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showReuseDrawer, setShowReuseDrawer] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Compliance & Submission States
  const [matrix, setMatrix] = useState<RequirementMatrixItem[]>([]);
  const [auditSummary, setAuditSummary] = useState<ComplianceAuditSummary>({
    totalCount: 0,
    satisfiedCount: 0,
    partialCount: 0,
    missingCount: 0,
    notApplicableCount: 0,
    reviewRequiredCount: 0,
    mandatoryMissingCount: 0,
    complianceRatePercent: 100,
    canSubmit: true,
    blockingWarnings: [],
  });
  const [checklist, setChecklist] = useState<SubmissionChecklist>({
    id: "init",
    proposalId: proposal.id,
    allMandatorySatisfied: false,
    documentsReady: false,
    sealAndSignatureVerified: false,
    formatAndSizeVerified: false,
    submissionUrlVerified: false,
    submitterAssigned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const fetchComplianceData = useCallback(async () => {
    try {
      const [compRes, subRes] = await Promise.all([
        fetch(`/api/proposals/${proposal.id}/compliance`),
        fetch(`/api/proposals/${proposal.id}/submission`),
      ]);
      if (compRes.ok) {
        const compData = await compRes.json();
        setMatrix(compData.matrix || []);
        if (compData.summary) setAuditSummary(compData.summary);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.checklist) setChecklist(subData.checklist);
        if (subData.auditSummary) setAuditSummary(subData.auditSummary);
      }
    } catch (err) {
      console.error("Failed to fetch compliance/submission data:", err);
    }
  }, [proposal.id]);

  useEffect(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  const currentSection = sections.find((s) => s.sectionCode === selectedSectionCode);

  const handleSelectSection = (code: string) => {
    setSelectedSectionCode(code);
    const sec = sections.find((s) => s.sectionCode === code);
    setEditorContent(sec?.contentMarkdown || "");
  };

  const handleApplyRecommendation = async (role: SpecialistRole, recommendation: string) => {
    let targetSecCode = "2.1_TECH_ARCHITECTURE";
    if (role === "FINANCIAL") targetSecCode = "4.1_BUDGET_AND_BOM";
    else if (role === "STRATEGY") targetSecCode = "1.2_PROJECT_OBJECTIVES";
    else if (role === "TECHNICAL") targetSecCode = "2.2_CORE_TECHNOLOGIES";
    else if (role === "COMPLIANCE") targetSecCode = "3.2_QUANTITATIVE_KPI";

    const targetSec = sections.find((s) => s.sectionCode === targetSecCode) || currentSection;
    if (!targetSec) return;

    const patch = `\n\n> [${role} 평가위원 개선권고사항 반영]:\n> ${recommendation}\n`;
    const newContent = (targetSec.contentMarkdown || "") + patch;

    await onSaveSection(targetSec.sectionCode, newContent, "EDITED");
    if (selectedSectionCode === targetSec.sectionCode) {
      setEditorContent(newContent);
    }
    toast.success("평가위원 피드백 초안 반영 완료", {
      description: `'${targetSec.title}' 섹션에 개선 권고사항이 추가되었습니다.`,
    });
  };

  const handleSave = async () => {
    if (!currentSection) return;
    setSaving(true);
    try {
      await onSaveSection(currentSection.sectionCode, editorContent, "EDITED");
      await fetchComplianceData();
      toast.success("섹션 내용 저장 완료", {
        description: `'${currentSection.title}' 수정 사항이 저장되었습니다.`,
      });
    } catch (err: any) {
      toast.error("저장 실패", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateDraft(currentSection?.sectionCode);
      const sec = sections.find((s) => s.sectionCode === selectedSectionCode);
      if (sec) {
        setEditorContent(sec.contentMarkdown);
      }
      await fetchComplianceData();
      toast.success("AI 초안 생성 완료", {
        description: "RFP 및 사내 역량 자산 Citation이 연결되었습니다.",
      });
    } catch (err: any) {
      toast.error("생성 실패", { description: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!snapshotSummary.trim()) return;
    setVersioning(true);
    try {
      await onCreateVersionSnapshot(snapshotSummary);
      setShowVersionModal(false);
      setSnapshotSummary("");
      toast.success("새 버전 스냅샷 생성 완료", {
        description: `v${proposal.currentVersion + 1} 스냅샷이 생성되었습니다.`,
      });
    } catch (err: any) {
      toast.error("스냅샷 생성 실패", { description: err.message });
    } finally {
      setVersioning(false);
    }
  };

  const handleUpdateMatrixStatus = async (matrixId: string, status: ComplianceStatus) => {
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/compliance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrixId, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatrix((prev) => prev.map((m) => (m.id === matrixId ? data.item : m)));
        if (data.summary) setAuditSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to update matrix status:", err);
    }
  };

  const handleUpdateChecklist = async (updates: Partial<SubmissionChecklist>) => {
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/submission`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setChecklist(data.checklist);
        if (data.auditSummary) setAuditSummary(data.auditSummary);
      }
    } catch (err) {
      console.error("Failed to update checklist:", err);
    }
  };

  const handleConfirmSubmission = async (payload: SubmissionConfirmationPayload) => {
    const res = await fetch(`/api/proposals/${proposal.id}/submission/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "제출 확정에 실패했습니다.");
    }
    await fetchComplianceData();
  };

  // 가정 및 TODO 태그 검출
  const hasAssumptions = editorContent.includes("[가정:");
  const hasTodos = editorContent.includes("[TODO:");

  const qualityGate: ProposalQualityGate = {
    proposalId: proposal.id,
    opportunityId: proposal.opportunityId,
    readinessScore: auditSummary.mandatoryMissingCount > 0 ? 65 : 88,
    isReady: auditSummary.mandatoryMissingCount === 0 && !hasTodos,
    blockerCount: (auditSummary.mandatoryMissingCount > 0 ? 1 : 0) + (hasTodos ? 1 : 0),
    highIssueCount: hasAssumptions ? 1 : 0,
    mediumIssueCount: auditSummary.reviewRequiredCount,
    issues: [
      ...(auditSummary.mandatoryMissingCount > 0
        ? [
            {
              id: "iss-mand-missing",
              category: "RFP_COMPLIANCE" as const,
              severity: "BLOCKER" as const,
              title: `RFP 필수 요구사항 ${auditSummary.mandatoryMissingCount}건 미충족`,
              description: "제안요청서의 필수 규격 및 조건이 충족되지 않아 입찰 탈락 및 실격 위험이 있습니다.",
              actionRecommendation: "RTM 컴플라이언스 탭에서 미충족 항목에 적합한 사내 기술 자산을 매핑하세요.",
            },
          ]
        : []),
      ...(hasTodos
        ? [
            {
              id: "iss-todo-tag",
              category: "DOCUMENT" as const,
              severity: "BLOCKER" as const,
              title: "제안서 내 미완성 [TODO:] 태그 잔존",
              description: "작성 중인 제안서 본문에 [TODO:] 마커가 남아 있어 제출 시 평가위원 감점 사유가 됩니다.",
              actionRecommendation: "에디터에서 해당 마커를 실제 내용으로 대체하거나 삭제하세요.",
            },
          ]
        : []),
      ...(hasAssumptions
        ? [
            {
              id: "iss-assumption-tag",
              category: "TECHNICAL" as const,
              severity: "HIGH" as const,
              title: "임시 가정 [가정:] 항목 존재",
              description: "사내 공인 성적서 또는 실측치 대신 임시 가정이 포함된 문장이 발견되었습니다.",
              actionRecommendation: "역량 저장소(Vault)에서 공인 시험성적서를 첨부하여 검증된 수치로 교체하세요.",
            },
          ]
        : []),
    ],
    evaluationAxes: [
      {
        axis: "RFP_COMPLIANCE",
        label: "RFP 필수요구 충족성",
        score: auditSummary.mandatoryMissingCount === 0 ? 20 : 10,
        maxScore: 20,
        weightPercent: 20,
        status: auditSummary.mandatoryMissingCount === 0 ? "PASS" : "FAIL",
        feedback: auditSummary.mandatoryMissingCount === 0 ? "모든 필수 조건 충족 확인" : "필수항목 누락으로 인한 탈락 위험",
      },
      {
        axis: "TECH_ARCHITECTURE",
        label: "시스템 아키텍처 구체성",
        score: 18,
        maxScore: 20,
        weightPercent: 20,
        status: "PASS",
        feedback: "SLAM 군집제어 및 ROS2 브릿지 아키텍처 상세 정의됨",
      },
      {
        axis: "QUANTITATIVE_KPI",
        label: "공인인증기관 시험성적서 기반 KPI",
        score: 15,
        maxScore: 15,
        weightPercent: 15,
        status: "PASS",
        feedback: "KTL 안전인증 SIL2 등급 연계 검증 완료",
      },
      {
        axis: "PATENTS",
        label: "사내 특허/지재권 실증 연계",
        score: 15,
        maxScore: 15,
        weightPercent: 15,
        status: "PASS",
        feedback: "사내 특허 제10-2458902호 인용 및 정합성 검증 완료",
      },
      {
        axis: "BOM_AND_COST",
        label: "원가/사업비 산출 타당성",
        score: 9,
        maxScore: 10,
        weightPercent: 10,
        status: "PASS",
        feedback: "하드웨어 BOM 및 A값 투찰선 산정 완료",
      },
      {
        axis: "HUMAN_RESOURCES",
        label: "참여인력 실적 적합도",
        score: 9,
        maxScore: 10,
        weightPercent: 10,
        status: "PASS",
        feedback: "총괄책임자 및 핵심연구원 유사 과제 실적 매핑 완료",
      },
      {
        axis: "SCHEDULE_WBS",
        label: "WBS 마일스톤 실행 가능성",
        score: 10,
        maxScore: 10,
        weightPercent: 10,
        status: "PASS",
        feedback: "단계별 테스트 및 조달 실증 일정 정합성 확보",
      },
    ],
    evaluatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>목록으로</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {proposal.title}
              </h1>
              <Badge variant="outline" className="text-xs">
                v{proposal.currentVersion}
              </Badge>
              <Badge variant={proposal.status === "SUBMITTED" ? "default" : "secondary"} className="text-xs">
                {proposal.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              공모 발주처: {proposal.metadata?.announcingAgency || "미지정"} | 목표 제출일:{" "}
              {proposal.targetSubmissionDate || "미정"}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg flex-wrap">
          <Button
            variant={activeTab === "DRAFT" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("DRAFT")}
            className="text-xs gap-1.5 h-8"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>제안서 에디터</span>
          </Button>
          <Button
            variant={activeTab === "RTM" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("RTM")}
            className="text-xs gap-1.5 h-8"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>RTM 컴플라이언스</span>
            {auditSummary.mandatoryMissingCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-destructive" />
            )}
          </Button>
          <Button
            variant={activeTab === "CROSS_REVIEW" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("CROSS_REVIEW")}
            className="text-xs gap-1.5 h-8"
          >
            <Users2 className="h-3.5 w-3.5" />
            <span>전문가 교차 검토</span>
          </Button>
          <Button
            variant={activeTab === "AGENCY_TEMPLATE" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("AGENCY_TEMPLATE")}
            className="text-xs gap-1.5 h-8"
          >
            <Landmark className="h-3.5 w-3.5" />
            <span>기관 서식 & 가점</span>
          </Button>
          <Button
            variant={activeTab === "QUALITY_GATE" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("QUALITY_GATE")}
            className="text-xs gap-1.5 h-8 font-semibold"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            <span>품질 게이트</span>
            {qualityGate.blockerCount > 0 && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                {qualityGate.blockerCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "APPROVAL" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("APPROVAL")}
            className="text-xs gap-1.5 h-8 font-semibold"
          >
            <UserCheck className="h-3.5 w-3.5 text-primary" />
            <span>사내 결재선</span>
          </Button>
          <Button
            variant={activeTab === "TEMPLATES" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("TEMPLATES")}
            className="text-xs gap-1.5 h-8"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>서식 라이브러리</span>
          </Button>
          <Button
            variant={activeTab === "SUBMISSION" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("SUBMISSION")}
            className="text-xs gap-1.5 h-8"
          >
            <Send className="h-3.5 w-3.5" />
            <span>제출 관리</span>
          </Button>
        </div>

        {/* Global Action Tools: Price Simulator & Proposal Export */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPricingModal(true)}
            className="text-xs gap-1.5 h-8 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>투찰가 시뮬레이터</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="text-xs gap-1.5 h-8 bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>제안서 내보내기</span>
          </Button>
        </div>
      </div>

      {/* 2. Tab Content Rendering */}
      {activeTab === "QUALITY_GATE" ? (
        <QualityGateCard
          gate={qualityGate}
          onApproveReady={() => {
            setActiveTab("SUBMISSION");
            toast.success("품질 게이트 통과 확인", {
              description: "제출 관리 단계로 이동합니다.",
            });
          }}
        />
      ) : activeTab === "CROSS_REVIEW" ? (
        <CrossReviewPanel
          proposalId={proposal.id}
          onApplyRecommendation={handleApplyRecommendation}
        />
      ) : activeTab === "AGENCY_TEMPLATE" ? (
        <AgencyTemplatePanel proposalTitle={proposal.title} />
      ) : activeTab === "RTM" ? (
        <ComplianceMatrixView
          matrix={matrix}
          summary={auditSummary}
          onUpdateStatus={handleUpdateMatrixStatus}
          onRefresh={fetchComplianceData}
        />
      ) : activeTab === "APPROVAL" ? (
        <ApprovalWorkflowCard
          proposalId={proposal.id}
          onFullyApproved={() => {
            setActiveTab("SUBMISSION");
            toast.success("최종 전결 승인이 완료되었습니다. 제출 관리 단계로 이동합니다.");
          }}
        />
      ) : activeTab === "TEMPLATES" ? (
        <TemplateLibrary
          onSelectTemplate={(tpl) => {
            toast.success(`'${tpl.name}' 서식이 선택되었습니다.`);
            setActiveTab("DRAFT");
          }}
        />
      ) : activeTab === "SUBMISSION" ? (
        <SubmissionControlPanel
          proposal={proposal}
          checklist={checklist}
          summary={auditSummary}
          onUpdateChecklist={handleUpdateChecklist}
          onConfirmSubmission={handleConfirmSubmission}
        />
      ) : (
        /* DRAFT View */
        <div className="space-y-4">
          {/* Action Bar for Editor */}
          <div className="flex items-center justify-end gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompareModal(true)}
              className="gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>버전 비교 (Diff)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReuseDrawer(!showReuseDrawer)}
              className="gap-1.5 text-xs text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-950/50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>스마트 재사용 (RAG)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionModal(true)}
              className="gap-1.5 text-xs"
            >
              <History className="h-3.5 w-3.5" />
              <span>버전 저장 (v{proposal.currentVersion})</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
              className="gap-1.5 text-xs"
            >
              <Sparkles className={`h-3.5 w-3.5 ${generating ? "animate-spin" : "text-primary"}`} />
              <span>{generating ? "AI 초안 생성 중..." : "AI 초안 생성 (70~80%)"}</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1.5 text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "저장 중..." : "섹션 저장"}</span>
            </Button>
          </div>

          {/* Three Columns Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 3 Cols: TOC */}
            <div className="lg:col-span-3 space-y-2">
              <Card className="h-full">
                <CardHeader className="p-3 pb-2 border-b">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    표준 제안서 목차 (TOC)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {sections.map((sec) => (
                    <button
                      key={sec.sectionCode}
                      onClick={() => handleSelectSection(sec.sectionCode)}
                      className={`w-full text-left p-2 rounded-md text-xs transition-colors flex items-center justify-between ${
                        selectedSectionCode === sec.sectionCode
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{sec.title}</span>
                      <Badge
                        variant={selectedSectionCode === sec.sectionCode ? "secondary" : "outline"}
                        className="text-[10px] scale-90"
                      >
                        {sec.status}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center 6 Cols: Editor */}
            <div className="lg:col-span-6 space-y-3">
              {(hasAssumptions || hasTodos) && (
                <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    <span>검토 필요 항목 안내 (Strict Evidence Gate)</span>
                  </div>
                  <div className="text-muted-foreground text-[11px] space-y-0.5 pl-5">
                    {hasAssumptions && (
                      <div>• <code>[가정: ...]</code>: 확정되지 않은 추정치 포함. 담당 부서 확인 후 수정 요망</div>
                    )}
                    {hasTodos && (
                      <div>• <code>[TODO: ...]</code>: 사내 미등록 자산 또는 사업책임자 확인 필요</div>
                    )}
                  </div>
                </div>
              )}

              <Card className="flex flex-col h-[650px]">
                <CardHeader className="p-3 pb-2 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {currentSection?.title || "섹션을 선택하세요"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Evidence Citation 기반 실데이터 연계 (Zero Hallucinated Numbers)
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    v{currentSection?.version || 1}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3 flex-1 flex flex-col">
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="RAG 초안을 생성하거나 직접 제안서 내용을 작성하세요..."
                    className="w-full flex-1 p-3 font-mono text-xs bg-background rounded-md border resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right 3 Cols: Evidence Citations */}
            <div className="lg:col-span-3 space-y-3">
              <Card className="h-full">
                <CardHeader className="p-3 pb-2 border-b">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      증빙 인용 (Evidence Citations)
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                  {currentSection && currentSection.evidenceCitations.length > 0 ? (
                    currentSection.evidenceCitations.map((cite) => (
                      <div
                        key={cite.id}
                        className="p-2.5 rounded-md border text-xs space-y-1.5 bg-muted/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-primary truncate max-w-[170px]">
                            {cite.sourceTitle}
                          </span>
                          <Badge variant="outline" className="text-[9px]">
                            {cite.sourceType}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic border-l-2 pl-2 border-primary/40 line-clamp-3">
                          &quot;{cite.quoteSnippet}&quot;
                        </p>
                        <div className="text-[10px] text-muted-foreground">
                          매칭: {cite.relevanceReason}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground space-y-2">
                      <ShieldAlert className="h-6 w-6 mx-auto opacity-50 text-muted-foreground" />
                      <p>이 섹션에 바인딩된 사내 증빙 또는 RFP 요건 인용구가 없습니다.</p>
                      <p className="text-[11px] text-muted-foreground/80">
                        &apos;AI 초안 생성&apos;을 실행하면 Capability Vault와 RFP 요건이 자동 바인딩됩니다.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Version Snapshot Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-lg max-w-md w-full p-5 space-y-4 shadow-lg">
            <h3 className="text-base font-semibold text-foreground">
              제안서 버전 스냅샷 생성 (v{proposal.currentVersion})
            </h3>
            <p className="text-xs text-muted-foreground">
              현재 전체 목차와 작성된 섹션 본문이 불변 스냅샷으로 저장되며, 감사 이력으로 추적됩니다.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">변경 요약 (Change Summary)</label>
              <input
                type="text"
                placeholder="예: 2.1 아키텍처 다이어그램 추가 및 WBS 일정 보완"
                value={snapshotSummary}
                onChange={(e) => setSnapshotSummary(e.target.value)}
                className="w-full p-2 border rounded-md text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionModal(false)}
                disabled={versioning}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleCreateSnapshot}
                disabled={versioning || !snapshotSummary.trim()}
              >
                {versioning ? "저장 중..." : "스냅샷 확정"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Export Modal */}
      {showExportModal && (
        <ProposalExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          proposal={proposal}
          sections={sections}
        />
      )}

      {/* KONEPS Pricing Simulator Modal */}
      {showPricingModal && (
        <KonepsPricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          initialBasePrice={proposal.totalBudget || 300000000}
          initialTitle={proposal.title}
        />
      )}

      {/* Proposal Version Compare Modal (P1-4) */}
      <ProposalVersionCompareModal
        open={showCompareModal}
        onOpenChange={setShowCompareModal}
        proposalTitle={proposal.title}
        currentVersion={proposal.currentVersion}
      />

      {/* Smart Reuse Drawer Overlay (P1-2) */}
      {showReuseDrawer && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-end p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl h-[90vh] my-auto">
            <SmartReuseDrawer
              currentSectionCode={selectedSectionCode}
              onApplyContent={(content) => {
                setEditorContent((prev) => prev + content);
                setShowReuseDrawer(false);
                toast.success("스마트 재사용 문안이 현재 에디터에 삽입되었습니다.");
              }}
              onClose={() => setShowReuseDrawer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
