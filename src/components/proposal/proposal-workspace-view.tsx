"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Proposal, ProposalSection, SectionStatus } from "@/types/proposal";

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

  const currentSection = sections.find((s) => s.sectionCode === selectedSectionCode);

  const handleSelectSection = (code: string) => {
    setSelectedSectionCode(code);
    const sec = sections.find((s) => s.sectionCode === code);
    setEditorContent(sec?.contentMarkdown || "");
  };

  const handleSave = async () => {
    if (!currentSection) return;
    setSaving(true);
    try {
      await onSaveSection(currentSection.sectionCode, editorContent, "EDITED");
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
    } finally {
      setVersioning(false);
    }
  };

  // 가정 및 TODO 태그 검출
  const hasAssumptions = editorContent.includes("[가정:");
  const hasTodos = editorContent.includes("[TODO:");

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
              <Badge variant="secondary" className="text-xs">
                {proposal.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              공모 발주처: {proposal.metadata?.announcingAgency || "미지정"} | 목표 제출일:{" "}
              {proposal.targetSubmissionDate || "미정"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* 2. Three Columns Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 3 Cols: Table of Contents (TOC) */}
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

        {/* Center 6 Cols: Markdown Editor & Document Assembly */}
        <div className="lg:col-span-6 space-y-3">
          {/* Tag Alerts Banner */}
          {(hasAssumptions || hasTodos) && (
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
              <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>검토 필요 항목 안내 (Strict Evidence Gate)</span>
              </div>
              <div className="text-muted-foreground text-[11px] space-y-0.5 pl-5">
                {hasAssumptions && (
                  <div>• <code>[가정: ...]</code>: 확정되지 않은 추정치가 포함되어 있습니다. 담당 부서 확인 후 수정 요망</div>
                )}
                {hasTodos && (
                  <div>• <code>[TODO: ...]</code>: 사내 미등록 자산 또는 사업책임자 확인이 필요한 항목입니다.</div>
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

        {/* Right 3 Cols: Evidence Citations & RFP Traceability */}
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
                      "{cite.quoteSnippet}"
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
                    'AI 초안 생성'을 실행하면 Capability Vault와 RFP 요건이 자동 바인딩됩니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
    </div>
  );
}
