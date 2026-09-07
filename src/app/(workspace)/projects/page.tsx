"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Plus,
  Sparkles,
  Layers,
  CheckCircle,
  Clock,
  Trash2,
  ArrowRight,
  History,
  RotateCcw,
  Shield,
  FileCode,
  Link as LinkIcon,
  Check,
  ChevronRight,
  Sliders,
  DollarSign,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import {
  ProjectConcept,
  MasterSpecification,
  MasterSpecVersionRecord,
  ProgressiveBuilderStep,
  BuilderStepSuggestion,
  FieldDiff,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DocumentDerivationWorkspace } from "@/components/concepts/document-derivation-workspace";

export default function ProjectsPage() {
  const [concepts, setConcepts] = useState<ProjectConcept[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derivation Modal State
  const [isDerivationModalOpen, setIsDerivationModalOpen] = useState(false);
  const [derivationConcept, setDerivationConcept] = useState<ProjectConcept | null>(null);

  // Quick Single-line Idea State
  const [quickIdeaName, setQuickIdeaName] = useState("");
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  // Detailed Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [targetTrl, setTargetTrl] = useState(4);
  const [estimatedBudget, setEstimatedBudget] = useState(500000000);
  const [requiredTechnology, setRequiredTechnology] = useState("ROS2, SLAM, 자율주행, 모터제어");

  // Progressive Builder Modal State
  const [selectedConcept, setSelectedConcept] = useState<ProjectConcept | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProgressiveBuilderStep>("PROBLEM");
  const [suggestion, setSuggestion] = useState<BuilderStepSuggestion | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [selectedDiffFields, setSelectedDiffFields] = useState<Record<string, boolean>>({});

  // Master Spec & Version Modal State
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [activeSpec, setActiveSpec] = useState<MasterSpecification | null>(null);
  const [specVersions, setSpecVersions] = useState<MasterSpecVersionRecord[]>([]);
  const [specActiveTab, setSpecActiveTab] = useState<"spec" | "versions" | "vault" | "derivation">("spec");
  const [vaultAssets, setVaultAssets] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let deletedIds: string[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("robobid_deleted_concept_ids");
          if (raw) deletedIds = JSON.parse(raw);
        } catch {}
      }

      const res = await fetch("/api/concepts");
      if (res.ok) {
        const data = await res.json();
        if (data.concepts && Array.isArray(data.concepts)) {
          const filtered = data.concepts.filter((c: ProjectConcept) => !deletedIds.includes(c.id));
          setConcepts(filtered);
        }
      }
    } catch (e) {
      console.error("Failed to fetch concepts:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVaultAssets = async () => {
    try {
      const res = await fetch("/api/vault");
      if (res.ok) {
        const data = await res.json();
        if (data.capabilities && Array.isArray(data.capabilities)) {
          setVaultAssets(data.capabilities);
        }
      }
    } catch (e) {
      console.error("Failed to fetch vault assets:", e);
    }
  };

  useEffect(() => {
    loadData();
    loadVaultAssets();
  }, []);

  // 1. Quick Single-line Idea Submit
  const handleQuickIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdeaName.trim()) {
      toast.error("등록할 로봇 아이디어를 한 줄로 입력해주세요.");
      return;
    }

    setIsQuickSubmitting(true);
    try {
      const res = await fetch("/api/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickIdeaName.trim(),
          isQuickIdea: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`'${quickIdeaName}' 아이디어가 즉시 등록되었습니다.`);
        setQuickIdeaName("");
        await loadData();
      } else {
        toast.error(`아이디어 등록 실패: ${data.error}`);
      }
    } catch (err: any) {
      toast.error(`오류 발생: ${err.message}`);
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  // 2. Full Create Submit
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("로봇 프로젝트 명칭을 입력해주세요.");
      return;
    }

    const techArray = requiredTechnology
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          summary: summary.trim(),
          targetTrl,
          estimatedBudget,
          requiredTechnology: techArray,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`'${name}' 프로젝트가 등록되었습니다.`);
        setIsCreateModalOpen(false);
        setName("");
        setSummary("");
        await loadData();
      } else {
        toast.error(`등록 실패: ${data.error}`);
      }
    } catch (err: any) {
      toast.error(`오류 발생: ${err.message}`);
    }
  };

  // 3. Open Progressive Builder
  const openProgressiveBuilder = async (concept: ProjectConcept, step: ProgressiveBuilderStep = "PROBLEM") => {
    setSelectedConcept(concept);
    setCurrentStep(step);
    setIsBuilderOpen(true);
    await fetchStepSuggestion(concept.id, step);
  };

  const fetchStepSuggestion = async (conceptId: string, step: ProgressiveBuilderStep) => {
    setIsGeneratingSuggestion(true);
    try {
      const res = await fetch(`/api/concepts/${conceptId}/builder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step }),
      });
      const data = await res.json();
      if (data.success && data.suggestion) {
        setSuggestion(data.suggestion);
        // Default select all diff fields
        const initialSelections: Record<string, boolean> = {};
        data.suggestion.diffs.forEach((d: FieldDiff) => {
          initialSelections[d.field] = true;
        });
        setSelectedDiffFields(initialSelections);
      }
    } catch (err: any) {
      toast.error(`AI 제안 생성 실패: ${err.message}`);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  // 4. Human Approval: Apply Diff
  const handleApproveAndApply = async () => {
    if (!selectedConcept || !suggestion) return;

    const approvedDiffs: Record<string, any> = {};
    suggestion.diffs.forEach((d) => {
      if (selectedDiffFields[d.field]) {
        approvedDiffs[d.field] = d.suggested;
      }
    });

    if (Object.keys(approvedDiffs).length === 0) {
      toast.error("반영할 변경 항목을 하나 이상 선택해주세요.");
      return;
    }

    try {
      const res = await fetch(`/api/concepts/${selectedConcept.id}/spec`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvedDiffs,
          changeSummary: `[${suggestion.stepTitle}] 사용자 검토 및 승인 반영`,
          approvedBy: "사업개발 PM (승인자)",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`[${suggestion.stepTitle}] 제안 사항이 승인 및 Master Spec에 반영되었습니다.`);
        await loadData();

        // Advance to next step if available
        const stepsOrder: ProgressiveBuilderStep[] = [
          "PROBLEM",
          "PRODUCT",
          "TECHNICAL",
          "TRL_KPI",
          "WBS_BUDGET",
          "BOM",
          "FUNDING_NEED",
          "VALIDATION",
          "OUTSOURCING",
          "MARKET",
          "MASTER_SPEC",
        ];
        const nextIdx = stepsOrder.indexOf(currentStep) + 1;
        if (nextIdx < stepsOrder.length) {
          const nextStep = stepsOrder[nextIdx];
          setCurrentStep(nextStep);
          await fetchStepSuggestion(selectedConcept.id, nextStep);
        } else {
          toast.success("전체 Master Specification 구체화가 완료되었습니다!");
          setIsBuilderOpen(false);
        }
      } else {
        toast.error(`반영 실패: ${data.error}`);
      }
    } catch (err: any) {
      toast.error(`오류 발생: ${err.message}`);
    }
  };

  // 5. Open Master Spec & Version Modal
  const openSpecModal = async (concept: ProjectConcept) => {
    setSelectedConcept(concept);
    setIsSpecModalOpen(true);
    setSpecActiveTab("spec");
    try {
      const res = await fetch(`/api/concepts/${concept.id}/spec`);
      if (res.ok) {
        const data = await res.json();
        setActiveSpec(data.spec || null);
        setSpecVersions(data.versions || []);
      }
    } catch (e) {
      console.error("Failed to load spec:", e);
    }
  };

  // 6. Restore Version
  const handleRestoreVersion = async (versionRecord: MasterSpecVersionRecord) => {
    if (!selectedConcept) return;
    if (!confirm(`정말 [${versionRecord.version}] (${versionRecord.changeSummary}) 버전으로 복원하시겠습니까?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/concepts/${selectedConcept.id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: versionRecord.id,
          approvedBy: "사업개발 PM (롤백 승인)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`버전 [${versionRecord.version}] 내용으로 복원되었습니다.`);
        setActiveSpec(data.spec);
        setSpecVersions(data.versions);
        await loadData();
      } else {
        toast.error(`복원 실패: ${data.error}`);
      }
    } catch (err: any) {
      toast.error(`오류 발생: ${err.message}`);
    }
  };

  // 7. Toggle Vault Asset Link
  const handleToggleVaultLink = async (assetId: string) => {
    if (!selectedConcept) return;
    const currentLinks = selectedConcept.linkedVaultAssetIds || [];
    const newLinks = currentLinks.includes(assetId)
      ? currentLinks.filter((id) => id !== assetId)
      : [...currentLinks, assetId];

    try {
      const res = await fetch(`/api/concepts/${selectedConcept.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedVaultAssetIds: newLinks }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedConcept(data.concept);
        toast.success("사내 역량(Vault) 연계 상태가 업데이트되었습니다.");
        await loadData();
      }
    } catch (err: any) {
      toast.error(`연계 변경 실패: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, conceptName: string) => {
    if (!confirm(`'${conceptName}' 프로젝트를 영구 삭제하시겠습니까?`)) return;
    try {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("robobid_deleted_concept_ids");
          const arr: string[] = raw ? JSON.parse(raw) : [];
          if (!arr.includes(id)) arr.push(id);
          localStorage.setItem("robobid_deleted_concept_ids", JSON.stringify(arr));
        } catch {}
      }
      setConcepts((prev) => prev.filter((c) => c.id !== id));
      const res = await fetch(`/api/concepts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(`'${conceptName}' 프로젝트가 영구 삭제되었습니다.`);
      }
    } catch (err: any) {
      toast.error(`삭제 실패: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("등록된 모든 로봇 개발 아이템 및 Master Spec을 완전히 삭제하시겠습니까?")) return;
    try {
      setIsLoading(true);
      if (typeof window !== "undefined") {
        const allIds = concepts.map((c) => c.id);
        const existingRaw = localStorage.getItem("robobid_deleted_concept_ids");
        const existingArr: string[] = existingRaw ? JSON.parse(existingRaw) : [];
        const merged = Array.from(new Set([...existingArr, ...allIds]));
        localStorage.setItem("robobid_deleted_concept_ids", JSON.stringify(merged));
        localStorage.removeItem("robobid_project_concepts");
        localStorage.removeItem("robobid_master_specs");
        localStorage.removeItem("robobid_spec_versions");
      }
      setConcepts([]);
      await fetch("/api/concepts", { method: "DELETE" });
      toast.success("모든 개발 아이템이 성공적으로 삭제되었습니다.");
    } catch (err: any) {
      toast.error(`삭제 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IDEA":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700">아이디어 (IDEA)</Badge>;
      case "CONCEPT":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">콘셉트 (CONCEPT)</Badge>;
      case "SPECIFICATION":
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">사양 구체화 (SPEC)</Badge>;
      case "FUNDING_READY":
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">자금지원 준비 완료</Badge>;
      case "DEVELOPMENT_READY":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">개발착수 준비</Badge>;
      case "ACTIVE":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">개발 실행 중</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Cpu className="h-6 w-6 text-blue-600" />
              로봇 개발아이템 관리 (Project Concept Vault)
            </h1>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              v3.0 Master Spec
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            한 줄 아이디어에서 출발하여 Master Specification까지 점진적으로 구체화하고, 자금 조달 및 사후 외주 개발로 연계합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {concepts.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              <Trash2 className="h-4 w-4" />
              전체 삭제
            </Button>
          )}
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            상세 프로젝트 등록
          </Button>
        </div>
      </div>

      {/* 2. Quick Single-line Idea Input Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
        <form onSubmit={handleQuickIdeaSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm shrink-0">
            <Lightbulb className="h-5 w-5 text-amber-500 animate-pulse" />
            <span>3초 로봇 아이디어 등록:</span>
          </div>
          <input
            type="text"
            value={quickIdeaName}
            onChange={(e) => setQuickIdeaName(e.target.value)}
            placeholder="예: 물류창고 파렛트 이송용 500kg 자율주행 협동 AMR 로봇"
            className="flex-1 w-full bg-white border border-blue-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            disabled={isQuickSubmitting}
          />
          <Button
            type="submit"
            disabled={isQuickSubmitting || !quickIdeaName.trim()}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shrink-0 text-sm"
          >
            {isQuickSubmitting ? "등록 중..." : "즉시 등록"}
          </Button>
        </form>
      </div>

      {/* 3. Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground font-medium">전체 개발 아이템</div>
          <div className="text-2xl font-bold mt-1 text-foreground">{concepts.length}건</div>
          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Master Spec 파이프라인
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground font-medium">구체화 단계 (Spec)</div>
          <div className="text-2xl font-bold mt-1 text-indigo-600">
            {concepts.filter((c) => c.status === "SPECIFICATION" || c.status === "CONCEPT").length}건
          </div>
          <div className="text-xs text-muted-foreground mt-1">AI Progressive Builder 가동</div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground font-medium">자금 지원 준비 완료</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">
            {concepts.filter((c) => c.status === "FUNDING_READY" || c.status === "DEVELOPMENT_READY").length}건
          </div>
          <div className="text-xs text-muted-foreground mt-1">기회 매칭 및 과제 신청 가능</div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground font-medium">총 소요 자금 규모</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">
            {(
              concepts.reduce((acc, cur) => acc + (cur.requiredFunding || 0), 0) / 100000000
            ).toFixed(1)}
            억원
          </div>
          <div className="text-xs text-muted-foreground mt-1">정부지원금 및 정책자금 타깃</div>
        </div>
      </div>

      {/* 4. Concept Cards List */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">프로젝트 로딩 중...</div>
      ) : concepts.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <Cpu className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-base font-medium">등록된 로봇 프로젝트가 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">
            상단 3초 빠른 등록 바를 통해 로봇 아이디어를 등록해보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(concept.status)}
                    <Badge variant="outline" className="text-xs font-mono">
                      v{concept.currentVersion}.0
                    </Badge>
                    {(concept.linkedVaultAssetIds || []).length > 0 && (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        사내 역량 {concept.linkedVaultAssetIds?.length}건 연계
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(concept.id, concept.name)}
                    className="text-muted-foreground hover:text-red-600 transition-colors p-1"
                    title="프로젝트 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-foreground tracking-tight">{concept.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {concept.summary || "상세 설명이 등록되지 않았습니다. AI 단계적 구체화를 통해 보강하세요."}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-muted/40 p-3 rounded-lg">
                  <div>
                    <span className="text-muted-foreground">목표 TRL:</span>{" "}
                    <span className="font-semibold text-foreground">TRL {concept.targetTrl}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">추정 개발예산:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {(concept.estimatedBudget / 100000000).toFixed(1)}억원
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">소요 지원금:</span>{" "}
                    <span className="font-semibold text-blue-600">
                      {(concept.requiredFunding / 100000000).toFixed(1)}억원
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">담당 조직:</span>{" "}
                    <span className="font-semibold text-foreground">{concept.owner}</span>
                  </div>
                </div>

                {concept.requiredTechnology && concept.requiredTechnology.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {concept.requiredTechnology.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t">
                <Button
                  onClick={() => openProgressiveBuilder(concept)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                  size="sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI 단계적 구체화
                </Button>
                <Button
                  onClick={() => openSpecModal(concept)}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  Master Spec & 이력
                </Button>
                <Button
                  onClick={() => {
                    setDerivationConcept(concept);
                    setIsDerivationModalOpen(true);
                  }}
                  variant="secondary"
                  size="sm"
                  className="text-xs gap-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                >
                  <Layers className="h-3.5 w-3.5" />
                  문서 파생 & 외주 RFP
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Progressive AI Builder Modal */}
      {isBuilderOpen && selectedConcept && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between bg-muted/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">
                    Progressive AI Builder
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Human-in-the-Loop Diff
                  </Badge>
                </div>
                <h2 className="text-lg font-bold text-foreground mt-0.5">
                  [{selectedConcept.name}] 단계적 구체화
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsBuilderOpen(false)}>
                닫기
              </Button>
            </div>

            {/* Stepper Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto p-3 bg-muted/40 border-b text-xs">
              {[
                { key: "PROBLEM", label: "1.문제" },
                { key: "PRODUCT", label: "2.제품" },
                { key: "TECHNICAL", label: "3.기술" },
                { key: "TRL_KPI", label: "4.TRL/KPI" },
                { key: "WBS_BUDGET", label: "5.WBS/예산" },
                { key: "BOM", label: "6.BOM" },
                { key: "FUNDING_NEED", label: "7.자금" },
                { key: "VALIDATION", label: "8.실증" },
                { key: "OUTSOURCING", label: "9.외주" },
                { key: "MARKET", label: "10.시장" },
                { key: "MASTER_SPEC", label: "11.Master Spec" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setCurrentStep(s.key as ProgressiveBuilderStep);
                    fetchStepSuggestion(selectedConcept.id, s.key as ProgressiveBuilderStep);
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    currentStep === s.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Modal Body: AI Suggestion & Side-by-Side Diff */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isGeneratingSuggestion ? (
                <div className="py-16 text-center space-y-3">
                  <Sparkles className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-sm font-medium">로봇 도메인 지식 기반 AI 제안 및 변경사항(Diff) 산출 중...</p>
                </div>
              ) : suggestion ? (
                <div className="space-y-6">
                  {/* Step Summary Banner */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      {suggestion.stepTitle}
                    </h4>
                    <p className="text-xs text-blue-800 mt-1">{suggestion.summary}</p>
                  </div>

                  {/* Core Rule Callout */}
                  <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                      <strong>핵심 거버넌스 원칙:</strong> AI는 원본을 자동 덮어쓰지 않습니다. 아래 제안 항목을 검토하신 후 [승인 및 반영] 버튼을 클릭해야 적용됩니다.
                    </span>
                  </div>

                  {/* Side-by-Side Diffs */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      변경사항 검토 (Diff Review)
                    </h5>

                    {suggestion.diffs.map((diff) => (
                      <div
                        key={diff.field}
                        className="border rounded-xl p-4 bg-card shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-foreground">
                            <input
                              type="checkbox"
                              checked={!!selectedDiffFields[diff.field]}
                              onChange={(e) =>
                                setSelectedDiffFields({
                                  ...selectedDiffFields,
                                  [diff.field]: e.target.checked,
                                })
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span>{diff.label}</span>
                          </label>
                          <Badge variant="outline" className="text-[11px]">
                            {selectedDiffFields[diff.field] ? "승인 예정" : "제외됨"}
                          </Badge>
                        </div>

                        {/* Diff Box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Current */}
                          <div className="bg-red-50/50 border border-red-200/60 rounded-lg p-3">
                            <div className="text-[11px] font-semibold text-red-700 mb-1 flex items-center gap-1">
                              <span>- 현재 사양 (Current)</span>
                            </div>
                            <div className="text-muted-foreground font-mono whitespace-pre-wrap break-words">
                              {diff.current}
                            </div>
                          </div>

                          {/* Suggested */}
                          <div className="bg-green-50/60 border border-green-200 rounded-lg p-3">
                            <div className="text-[11px] font-semibold text-green-700 mb-1 flex items-center gap-1">
                              <span>+ AI 제안 사양 (Suggested)</span>
                            </div>
                            <div className="text-foreground font-mono whitespace-pre-wrap break-words font-medium">
                              {diff.suggested}
                            </div>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                          <span className="font-semibold text-foreground">제안 근거:</span> {diff.reasoning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                선택된 항목: {Object.values(selectedDiffFields).filter(Boolean).length}개
              </span>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsBuilderOpen(false)}>
                  취소
                </Button>
                <Button
                  onClick={handleApproveAndApply}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  승인 및 Master Spec 반영 (신규 버전 기록)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Master Spec & Version Management Modal */}
      {isSpecModalOpen && selectedConcept && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between bg-muted/20">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">
                    [{selectedConcept.name}] Master Specification
                  </h2>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    {activeSpec?.version || "v1.0"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  로봇 기술 아키텍처, 성능 KPI, WBS 및 버전 롤백 복원 관리
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsSpecModalOpen(false)}>
                닫기
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b px-5 bg-muted/30 text-xs">
              <button
                onClick={() => setSpecActiveTab("spec")}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
                  specActiveTab === "spec"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                명세서 상세 (Master Spec)
              </button>
              <button
                onClick={() => setSpecActiveTab("versions")}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  specActiveTab === "versions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                버전 이력 및 복원 ({specVersions.length})
              </button>
              <button
                onClick={() => setSpecActiveTab("vault")}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  specActiveTab === "vault"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                사내 역량(Vault) 연계 ({selectedConcept.linkedVaultAssetIds?.length || 0})
              </button>
              <button
                onClick={() => setSpecActiveTab("derivation")}
                className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  specActiveTab === "derivation"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                문서 파생 & 외주 RFP
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {specActiveTab === "spec" && activeSpec && (
                <div className="space-y-6">
                  {/* Architecture */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-blue-600" />
                      기술 총괄 아키텍처
                    </h4>
                    <div className="bg-muted/40 border rounded-xl p-4 font-mono text-xs whitespace-pre-wrap">
                      {activeSpec.technicalArchitecture || activeSpec.architectureSummary || "(미작성)"}
                    </div>
                  </div>

                  {/* Sensors & AI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        센서 및 통신 인터페이스
                      </h4>
                      <ul className="text-xs space-y-1">
                        {activeSpec.sensorsAndComms && activeSpec.sensorsAndComms.length > 0 ? (
                          activeSpec.sensorsAndComms.map((s, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-foreground">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              {s}
                            </li>
                          ))
                        ) : (
                          <li className="text-muted-foreground">(설정된 센서 없음)</li>
                        )}
                      </ul>
                    </div>

                    <div className="border rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        AI 및 제어 알고리즘
                      </h4>
                      <p className="text-xs text-foreground font-mono">
                        {activeSpec.aiModelSpec || "(미설정)"}
                      </p>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      정량적 성능지표 (KPI)
                    </h4>
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="p-3 font-semibold">지표명</th>
                            <th className="p-3 font-semibold">목표치</th>
                            <th className="p-3 font-semibold">평가 방법</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {activeSpec.kpis && activeSpec.kpis.length > 0 ? (
                            activeSpec.kpis.map((k, idx) => (
                              <tr key={idx}>
                                <td className="p-3 font-medium">{k.metricName}</td>
                                <td className="p-3 text-blue-600 font-semibold">{k.targetValue}</td>
                                <td className="p-3 text-muted-foreground">{k.evaluationMethod}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                등록된 정량 KPI가 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* BOM */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      핵심 부품 명세서 (BOM)
                    </h4>
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="p-3 font-semibold">부품명</th>
                            <th className="p-3 font-semibold">수량</th>
                            <th className="p-3 font-semibold">예상 단가</th>
                            <th className="p-3 font-semibold">공급업체</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {activeSpec.bomEstimate && activeSpec.bomEstimate.length > 0 ? (
                            activeSpec.bomEstimate.map((b, idx) => (
                              <tr key={idx}>
                                <td className="p-3 font-medium">{b.partName}</td>
                                <td className="p-3">{b.quantity}</td>
                                <td className="p-3">{b.unitCost.toLocaleString()}원</td>
                                <td className="p-3 text-muted-foreground">{b.vendor || "-"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                등록된 BOM 내역이 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Budget & Outsourcing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="border rounded-xl p-4 space-y-2">
                      <h4 className="font-semibold text-muted-foreground uppercase">비목별 소요 예산</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>인건비:</span>
                          <span className="font-medium">
                            {(activeSpec.budgetBreakdown.laborCost / 10000000).toFixed(0)}천만원
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>연구시설/직접비:</span>
                          <span className="font-medium">
                            {(activeSpec.budgetBreakdown.directCost / 10000000).toFixed(0)}천만원
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>위탁연구/외주비:</span>
                          <span className="font-medium">
                            {(activeSpec.budgetBreakdown.outsourcingCost / 10000000).toFixed(0)}천만원
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4 space-y-2">
                      <h4 className="font-semibold text-muted-foreground uppercase">외주 및 검증 계획</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {activeSpec.outsourcingPlan || "(외주 계획 미작성)"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Version History & Rollback Tab */}
              {specActiveTab === "versions" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>이력 총 {specVersions.length}건</span>
                    <span>과거 버전으로 안전하게 롤백 복원할 수 있습니다.</span>
                  </div>

                  <div className="space-y-3">
                    {specVersions.map((ver, idx) => (
                      <div
                        key={ver.id}
                        className="border rounded-xl p-4 bg-card flex items-center justify-between shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono font-bold bg-blue-100 text-blue-800">
                              {ver.version}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(ver.createdAt).toLocaleString()}
                            </span>
                            <span className="text-xs text-foreground font-medium">
                              승인자: {ver.approvedBy}
                            </span>
                          </div>
                          <p className="text-xs text-foreground mt-1 font-medium">{ver.changeSummary}</p>
                        </div>

                        {idx > 0 && (
                          <Button
                            onClick={() => handleRestoreVersion(ver)}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            이 버전으로 복원
                          </Button>
                        )}
                        {idx === 0 && (
                          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                            현재 활성 버전
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Vault Asset Linkage Tab */}
              {specActiveTab === "vault" && (
                <div className="space-y-4">
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                    <p className="font-semibold flex items-center gap-1.5">
                      <LinkIcon className="h-4 w-4 text-amber-600" />
                      사내 자산 · 역량(Vault)과의 연계 매핑
                    </p>
                    <p className="mt-1">
                      사내 보유 특허, 인증서, 연구원 역량을 본 로봇 아이템에 연결하면 정부 R&D 신청서 작성 및 매칭 적합도(Fit Score) 산출 시 가산점이 자동 반영됩니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {vaultAssets.length === 0 ? (
                      <div className="text-center py-8 text-xs text-muted-foreground border rounded-xl">
                        등록된 사내 자산이 없습니다. [/vault] 메뉴에서 자산을 먼저 등록해주세요.
                      </div>
                    ) : (
                      vaultAssets.map((asset) => {
                        const isLinked = (selectedConcept.linkedVaultAssetIds || []).includes(asset.id);
                        return (
                          <div
                            key={asset.id}
                            onClick={() => handleToggleVaultLink(asset.id)}
                            className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors ${
                              isLinked
                                ? "bg-blue-50/60 border-blue-300"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isLinked}
                                onChange={() => {}}
                                className="rounded border-gray-300 text-blue-600 h-4 w-4"
                              />
                              <div>
                                <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                                  <span>{asset.title || asset.name}</span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {asset.type}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {asset.description || asset.category}
                                </p>
                              </div>
                            </div>
                            <Badge variant={isLinked ? "default" : "outline"} className="text-xs">
                              {isLinked ? "연계됨" : "미연계"}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Document Derivation & Secure RFP Tab */}
              {specActiveTab === "derivation" && selectedConcept && (
                <div className="pt-1">
                  <DocumentDerivationWorkspace concept={selectedConcept} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/20 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsSpecModalOpen(false)}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Detailed Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">신규 로봇 프로젝트 상세 등록</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">로봇 프로젝트 명칭 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 실외 배송용 4족 보행 로봇"
                  className="w-full border rounded-lg p-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">한 줄 요약</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="예: 험지 계단 등판이 가능한 비전 SLAM 기반 자율 배달 솔루션"
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">목표 TRL (1~9)</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={targetTrl}
                    onChange={(e) => setTargetTrl(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">예상 개발 예산 (원)</label>
                  <input
                    type="number"
                    step={10000000}
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">핵심 필요 기술 (쉼표 구분)</label>
                <input
                  type="text"
                  value={requiredTechnology}
                  onChange={(e) => setRequiredTechnology(e.target.value)}
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  취소
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  프로젝트 등록
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Standalone Document Derivation & Secure RFP Modal */}
      {isDerivationModalOpen && derivationConcept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden rounded-2xl">
            <DocumentDerivationWorkspace
              concept={derivationConcept}
              onClose={() => {
                setIsDerivationModalOpen(false);
                setDerivationConcept(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
