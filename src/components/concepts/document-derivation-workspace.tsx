"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DerivationCategory,
  DocumentDerivationType,
  SecurityClassificationTier,
  DerivedDocument,
  DerivedSection,
} from "@/types/derivation";
import { ProjectConcept } from "@/types/concept";
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Eye,
  Lock,
  AlertTriangle,
  Layers,
  Sparkles,
  UserCheck,
  Building,
  Briefcase,
  Code,
  TrendingUp,
} from "lucide-react";

interface Props {
  concept: ProjectConcept;
  onClose?: () => void;
}

const CATEGORY_ICONS: Record<DerivationCategory, React.ReactNode> = {
  GOVERNMENT: <Building className="w-4 h-4 text-blue-500" />,
  INTERNAL: <Code className="w-4 h-4 text-purple-500" />,
  OUTSOURCING: <Briefcase className="w-4 h-4 text-amber-500" />,
  BUSINESS: <TrendingUp className="w-4 h-4 text-emerald-500" />,
};

const DOC_TYPE_LABELS: Record<DocumentDerivationType, { label: string; category: DerivationCategory }> = {
  GOV_BUSINESS_PLAN: { label: "사업계획서 (정부지원)", category: "GOVERNMENT" },
  GOV_RND_PLAN: { label: "연구개발계획서 (R&D)", category: "GOVERNMENT" },
  GOV_VALIDATION_PLAN: { label: "현장 실증계획서", category: "GOVERNMENT" },
  GOV_STARTUP_PLAN: { label: "창업사업계획서", category: "GOVERNMENT" },
  GOV_TECH_DEV_PLAN: { label: "기술개발계획서", category: "GOVERNMENT" },

  INTERNAL_DEV_PLAN: { label: "상세 개발계획서", category: "INTERNAL" },
  INTERNAL_WBS: { label: "WBS 공정관리표", category: "INTERNAL" },
  INTERNAL_BUDGET: { label: "상세 실행예산서", category: "INTERNAL" },
  INTERNAL_BOM: { label: "BOM 및 부품조달 명세서", category: "INTERNAL" },
  INTERNAL_RISK: { label: "리스크 매트릭스", category: "INTERNAL" },

  OUTSOURCING_RFP: { label: "용역 제안요청서 (RFP)", category: "OUTSOURCING" },
  OUTSOURCING_TASK_SPEC: { label: "외주 과업지시서", category: "OUTSOURCING" },
  OUTSOURCING_SPEC: { label: "외주 제작사양서", category: "OUTSOURCING" },
  OUTSOURCING_ACCEPTANCE: { label: "검수기준서 (Acceptance)", category: "OUTSOURCING" },
  OUTSOURCING_DELIVERABLES: { label: "산출물 명세서", category: "OUTSOURCING" },

  BUSINESS_PRODUCT_INTRO: { label: "솔루션 제품소개서", category: "BUSINESS" },
  BUSINESS_MARKETABILITY: { label: "시장성 및 경쟁우위 분석", category: "BUSINESS" },
  BUSINESS_ROI: { label: "고객 도입 ROI 분석서", category: "BUSINESS" },
  BUSINESS_SALES_STRATEGY: { label: "사업화 및 판로전략서", category: "BUSINESS" },
};

export function DocumentDerivationWorkspace({ concept, onClose }: Props) {
  const [documents, setDocuments] = useState<DerivedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DerivedDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DerivationCategory>("OUTSOURCING");
  const [selectedDocType, setSelectedDocType] = useState<DocumentDerivationType>("OUTSOURCING_RFP");
  const [targetTier, setTargetTier] = useState<SecurityClassificationTier>("L1_PARTNER");

  // Approval state
  const [approverName, setApproverName] = useState("사업책임자");
  const [approvalAgreement, setApprovalAgreement] = useState(false);
  const [approving, setApproving] = useState(false);

  // Redaction preview toggle
  const [previewMode, setPreviewMode] = useState<"redacted" | "original">("redacted");
  const [copied, setCopied] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/concepts/${concept.id}/derive`);
      const json = await res.json();
      if (json.success && json.data) {
        setDocuments(json.data);
        if (json.data.length > 0 && !selectedDoc) {
          setSelectedDoc(json.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load derived documents", err);
    } finally {
      setLoading(false);
    }
  }, [concept.id, selectedDoc]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Derive new document
  const handleDeriveNew = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/concepts/${concept.id}/derive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          documentType: selectedDocType,
          targetClassification: targetTier,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDocuments((prev) => [json.data, ...prev]);
        setSelectedDoc(json.data);
      } else {
        alert(json.error || "파생 문서 생성에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Approve document
  const handleApprove = async () => {
    if (!selectedDoc || !approverName.trim()) return;
    try {
      setApproving(true);
      const res = await fetch(`/api/concepts/${concept.id}/derive/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approve: true,
          approvedBy: approverName.trim(),
          approvalNotes: "보안 Redaction 마스킹 검토 확인 및 배포 승인",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedDoc(json.data);
        setDocuments((prev) =>
          prev.map((d) => (d.id === json.data.id ? json.data : d))
        );
        alert("문서가 성공적으로 승인되었습니다. 이제 안전하게 내보낼 수 있습니다.");
      }
    } catch (err) {
      alert("승인 처리 중 오류 발생: " + (err as Error).message);
    } finally {
      setApproving(false);
    }
  };

  // Export document
  const handleExport = async (format: "markdown" | "html" | "json") => {
    if (!selectedDoc) return;
    if (!selectedDoc.isApproved) {
      alert("보안 알림: 승인되지 않은 문서는 외부로 내보낼 수 없습니다. 먼저 검토 및 승인을 완료해주세요.");
      return;
    }

    try {
      const res = await fetch(`/api/concepts/${concept.id}/derive/${selectedDoc.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          useRedactedVersion: previewMode === "redacted",
        }),
      });
      const json = await res.json();
      if (json.success && json.content) {
        const blob = new Blob([json.content], {
          type: format === "html" ? "text/html" : format === "json" ? "application/json" : "text/markdown",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = json.filename || `derived_${selectedDoc.id}.${format === "html" ? "html" : format === "json" ? "json" : "md"}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert(json.error || "내보내기 실패");
      }
    } catch (err) {
      alert("내보내기 처리 중 오류: " + (err as Error).message);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!selectedDoc) return;
    const content = selectedDoc.sections
      .map((s) => (previewMode === "redacted" ? s.redactedContent : s.rawContent))
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableDocTypes = Object.entries(DOC_TYPE_LABELS).filter(
    ([, val]) => val.category === selectedCategory
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[85vh]">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">
              Master Specification 문서 파생 & 보안 외주 RFP 생성기
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              Phase 7 v3.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            단일 Master Specification에서 목적별(정부지원, 사내개발, 외주RFP, 사업화) 문서를 파생하고 기밀정보를 자동 Redaction합니다.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
          >
            닫기
          </button>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Generator & Document List */}
        <div className="w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col overflow-y-auto p-4 gap-4">
          {/* New Derivation Launcher */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              신규 문서 파생
            </h3>

            {/* Category selection */}
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                용도 목적 (Category)
              </label>
              <div className="grid grid-cols-2 gap-1">
                {(["OUTSOURCING", "GOVERNMENT", "INTERNAL", "BUSINESS"] as DerivationCategory[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        const firstType = Object.entries(DOC_TYPE_LABELS).find(
                          ([, v]) => v.category === cat
                        )?.[0] as DocumentDerivationType;
                        if (firstType) setSelectedDocType(firstType);
                        if (cat === "INTERNAL") setTargetTier("L3_SECRET_CORE");
                        else if (cat === "GOVERNMENT") setTargetTier("L2_CONFIDENTIAL");
                        else if (cat === "OUTSOURCING") setTargetTier("L1_PARTNER");
                        else setTargetTier("L0_PUBLIC");
                      }}
                      className={`px-2 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 border transition ${
                        selectedCategory === cat
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {CATEGORY_ICONS[cat]}
                      {cat === "OUTSOURCING"
                        ? "외주발주"
                        : cat === "GOVERNMENT"
                        ? "정부지원"
                        : cat === "INTERNAL"
                        ? "사내개발"
                        : "사업화"}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Document Type selection */}
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                파생 문서 서식
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as DocumentDerivationType)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500"
              >
                {availableDocTypes.map(([typeKey, { label }]) => (
                  <option key={typeKey} value={typeKey}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Security Tier */}
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                보안 Redaction 등급
              </label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value as SecurityClassificationTier)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="L1_PARTNER">L1_PARTNER (외주 협력사용 / 원가 마스킹)</option>
                <option value="L0_PUBLIC">L0_PUBLIC (대외 공개용 / 최대 마스킹)</option>
                <option value="L2_CONFIDENTIAL">L2_CONFIDENTIAL (정부제출 / 영업비밀 보호)</option>
                <option value="L3_SECRET_CORE">L3_SECRET_CORE (사내 원천본 / 무삭제)</option>
              </select>
            </div>

            <button
              onClick={handleDeriveNew}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? "파생 문서 생성 중..." : "파생 문서 생성 실행"}
            </button>
          </div>

          {/* List of Derived Documents */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              생성된 파생 문서 목록 ({documents.length})
            </h4>
            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 p-2 text-center">파생된 문서가 없습니다.</p>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-2.5 rounded-lg border transition ${
                      isSelected
                        ? "bg-white border-indigo-500 shadow-sm"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                        {doc.title}
                      </span>
                      {doc.isApproved ? (
                        <span className="flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                          <Check className="w-2.5 h-2.5 mr-0.5" /> 승인됨
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                          검토대기
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        {doc.targetClassification}
                      </span>
                      {doc.redactionSummary.redactedSections > 0 && (
                        <span className="text-rose-600 flex items-center gap-0.5">
                          <ShieldAlert className="w-3 h-3" />
                          {doc.redactionSummary.redactedSections}개 마스킹
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content: Traceability Inspector & Redaction Preview */}
        {selectedDoc ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Action Bar */}
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700">
                  {selectedDoc.category}
                </span>
                <span className="text-sm font-bold text-slate-800 truncate">
                  {selectedDoc.title}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (v{selectedDoc.masterSpecVersion})
                </span>
              </div>

              {/* Preview Toggle & Export Buttons */}
              <div className="flex items-center gap-2">
                {/* Mode toggle */}
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setPreviewMode("redacted")}
                    className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                      previewMode === "redacted"
                        ? "bg-white text-slate-800 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    보안 마스킹 뷰
                  </button>
                  <button
                    onClick={() => setPreviewMode("original")}
                    className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                      previewMode === "original"
                        ? "bg-white text-slate-800 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    사내 원천본 뷰
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "복사완료" : "복사"}
                </button>

                {/* Export menu */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExport("markdown")}
                    disabled={!selectedDoc.isApproved}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition ${
                      selectedDoc.isApproved
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Markdown 내보내기
                  </button>
                  <button
                    onClick={() => handleExport("html")}
                    disabled={!selectedDoc.isApproved}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border transition ${
                      selectedDoc.isApproved
                        ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "border-slate-200 text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    HTML
                  </button>
                </div>
              </div>
            </div>

            {/* Redaction Notice Banner */}
            {selectedDoc.redactionSummary.redactedSections > 0 && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>보안 필터 작동 중:</strong> 전체 {selectedDoc.sections.length}개 섹션 중{" "}
                    <strong>{selectedDoc.redactionSummary.redactedSections}개 섹션</strong>의 기밀 항목(
                    {selectedDoc.redactionSummary.redactedCategories.join(", ")})이 안전하게 마스킹되었습니다.
                  </span>
                </div>
                <span className="text-[11px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-mono">
                  Tier: {selectedDoc.targetClassification}
                </span>
              </div>
            )}

            {/* Sections List with Traceability */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedDoc.sections.map((sec: DerivedSection) => {
                const contentToShow =
                  previewMode === "redacted" ? sec.redactedContent : sec.rawContent;

                return (
                  <div
                    key={sec.id}
                    className="border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition"
                  >
                    {/* Section Traceability Header */}
                    <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {sec.title}
                        </span>
                        {sec.isRedacted && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> 마스킹 적용됨
                          </span>
                        )}
                      </div>

                      {/* Traceability Pill */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400">Master Spec 추적:</span>
                        <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          {sec.sourceSectionTitle} (<code>{sec.sourceField}</code>)
                        </span>
                      </div>
                    </div>

                    {/* Content View */}
                    <div className="p-4 bg-white font-sans text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {contentToShow}
                    </div>

                    {/* Redaction explanation footer */}
                    {sec.isRedacted && (
                      <div className="px-4 py-1.5 bg-rose-50/50 border-t border-rose-100 text-[11px] text-rose-700 flex items-center justify-between">
                        <span>사유: {sec.redactionReason}</span>
                        <span className="font-mono text-[10px]">
                          [{sec.sensitiveCategories.join(", ")}]
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Approval Sign-off Bar (Gate Enforcement) */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {selectedDoc.isApproved ? (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>배포 승인 완료됨 (Export 활성화)</span>
                      <span className="text-slate-400 font-normal text-[11px]">
                        승인자: {selectedDoc.approvedBy} ({new Date(selectedDoc.approvedAt || "").toLocaleString()})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Zero-Unauthorized-Export 게이트를 통과하여 안전한 외부 반출 및 협력사 공유가 가능합니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-700">승인 검토자:</label>
                      <input
                        type="text"
                        value={approverName}
                        onChange={(e) => setApproverName(e.target.value)}
                        className="text-xs bg-white border border-slate-300 rounded px-2 py-1 w-32 focus:ring-1 focus:ring-indigo-500"
                        placeholder="이름 또는 직책"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={approvalAgreement}
                        onChange={(e) => setApprovalAgreement(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>본인은 마스킹 상태와 기밀 유출 위험이 없음을 확인하였으며, 배포를 승인합니다.</span>
                    </label>
                  </div>
                  <button
                    onClick={handleApprove}
                    disabled={!approvalAgreement || !approverName.trim() || approving}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {approving ? "승인 처리 중..." : "검토 및 승인 (Approve)"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-300 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">선택된 파생 문서가 없습니다</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              좌측 목록에서 문서를 선택하거나, [신규 문서 파생] 메뉴에서 목적에 맞는 서식을 생성하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
