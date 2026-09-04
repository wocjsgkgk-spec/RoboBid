"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  FileText,
  Printer,
  FileCode,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Proposal, ProposalSection } from "@/types/proposal";
import { ProposalExporter, ExportOptions } from "@/lib/proposals/proposal-exporter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProposalExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
  sections: ProposalSection[];
}

export function ProposalExportModal({
  isOpen,
  onClose,
  proposal,
  sections,
}: ProposalExportModalProps) {
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "markdown" | "html">("preview");
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const exportOptions: ExportOptions = useMemo(
    () => ({
      includeCoverPage,
      includeTableOfContents,
      includeCitations,
      companyName: "로보비드 주식회사 (RoboBid AI)",
    }),
    [includeCoverPage, includeTableOfContents, includeCitations]
  );

  const markdownContent = useMemo(() => {
    return ProposalExporter.toMarkdown(proposal, sections, exportOptions);
  }, [proposal, sections, exportOptions]);

  const docxHtmlContent = useMemo(() => {
    return ProposalExporter.toDocxHtml(proposal, sections, exportOptions);
  }, [proposal, sections, exportOptions]);

  if (!isOpen) return null;

  const handleDownloadDocx = () => {
    const filename = `${proposal.title.replace(/[^\w가-힣\s]/g, "_")}_표준제안서.doc`;
    ProposalExporter.downloadFile(docxHtmlContent, filename, "application/msword");
    setDownloaded("docx");
    setTimeout(() => setDownloaded(null), 2500);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${proposal.title.replace(/[^\w가-힣\s]/g, "_")}_제안서.md`;
    ProposalExporter.downloadFile(markdownContent, filename, "text/markdown");
    setDownloaded("md");
    setTimeout(() => setDownloaded(null), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(docxHtmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  제안서 종합 내보내기 (Export Hub)
                </h2>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                  정부 표준 양식 호환
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{proposal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Export Option Toggles & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/20 px-6 py-3">
          <div className="flex items-center gap-4 text-xs font-medium text-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCoverPage}
                onChange={(e) => setIncludeCoverPage(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              표지 페이지 포함
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTableOfContents}
                onChange={(e) => setIncludeTableOfContents(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              목차(TOC) 자동 생성
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCitations}
                onChange={(e) => setIncludeCitations(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              증빙 인용(Evidence) 부록 첨부
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              A4 인쇄 / PDF 저장
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMarkdown}
              className="h-8 text-xs gap-1.5"
            >
              <FileCode className="h-3.5 w-3.5" />
              {downloaded === "md" ? "다운로드됨!" : "Markdown(.md)"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadDocx}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" />
              {downloaded === "docx" ? "다운로드 완료!" : "정부표준 Word/한글 다운로드"}
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-4 px-6 pt-3 border-b border-border bg-card text-xs">
          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-2 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            A4 문서 미리보기
          </button>
          <button
            onClick={() => setActiveTab("markdown")}
            className={`pb-2 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "markdown"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            Markdown 원본
          </button>
          <button
            onClick={() => setActiveTab("html")}
            className={`pb-2 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "html"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            정부표준 HTML-DOCX 소스
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {activeTab === "preview" && (
            <div className="mx-auto max-w-3xl rounded-xl border border-border bg-background p-8 shadow-sm text-foreground">
              <iframe
                title="Document Preview"
                srcDoc={docxHtmlContent}
                className="w-full min-h-[500px] border-0 rounded-lg"
              />
            </div>
          )}

          {activeTab === "markdown" && (
            <div className="rounded-xl border border-border bg-background p-4 font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
              {markdownContent}
            </div>
          )}

          {activeTab === "html" && (
            <div className="rounded-xl border border-border bg-background p-4 font-mono text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
              {docxHtmlContent}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              Zero Hallucination 검증: 모든 기술 주장 및 실적은 사내 Capability Vault 자산 인용부록과 매핑됩니다.
            </span>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
