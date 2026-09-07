"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  OutsourcingPackage,
  CapabilityGapItem,
  CandidateVendor,
  ReceivedQuote,
  QuoteEvaluation,
} from "@/types/outsourcing";
import {
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  AlertTriangle,
  UserCheck,
  Check,
  Plus,
  Shield,
  Clock,
  Award,
  Trash2,
} from "lucide-react";

export function V3OutsourcingWorkspace() {
  const [packages, setPackages] = useState<OutsourcingPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<OutsourcingPackage | null>(null);
  const [gaps, setGaps] = useState<CapabilityGapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gaps" | "scope" | "rfp" | "quotes">("scope");

  // Approval state
  const [approverName, setApproverName] = useState("");
  const [approverAgreement, setApproverAgreement] = useState(false);
  const [approving, setApproving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pkgRes, gapRes] = await Promise.all([
        fetch("/api/outsourcing"),
        fetch("/api/outsourcing/gap-analysis"),
      ]);

      const pkgJson = await pkgRes.json();
      const gapJson = await gapRes.json();

      if (pkgJson.success && Array.isArray(pkgJson.data)) {
        setPackages(pkgJson.data);
        if (pkgJson.data.length > 0 && !selectedPkg) {
          setSelectedPkg(pkgJson.data[0]);
        }
      }

      if (gapJson.success && Array.isArray(gapJson.data)) {
        setGaps(gapJson.data);
      }
    } catch (err) {
      console.error("Failed to load outsourcing data", err);
    } finally {
      setLoading(false);
    }
  }, [selectedPkg]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract scopes from concept
  const handleExtractScopes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/outsourcing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EXTRACT",
          projectConceptId: "c001-amr-logistics-robot",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        alert(json.message || "외주 과업이 성공적으로 추출되었습니다.");
        loadData();
      }
    } catch (err) {
      alert("오류: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Approve package
  const handleApprove = async () => {
    if (!selectedPkg || !approverName.trim()) return;
    try {
      setApproving(true);
      const res = await fetch(`/api/outsourcing/${selectedPkg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approve: true,
          approvedBy: approverName.trim(),
          approvalNotes: "외주 과업내역서(SOW) 및 검수 기준 승인 완료",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedPkg(json.data);
        setPackages((prev) =>
          prev.map((p) => (p.id === json.data.id ? json.data : p))
        );
        setApproverName("");
        setApproverAgreement(false);
        alert("외주 발주 패키지 승인이 완료되었습니다.");
      }
    } catch (err) {
      alert("승인 처리 오류: " + (err as Error).message);
    } finally {
      setApproving(false);
    }
  };

  // Delete single package
  const handleDeletePackage = async (pkgId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("정말 이 외주 발주 패키지를 삭제하시겠습니까?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/outsourcing/${pkgId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPackages((prev) => prev.filter((p) => p.id !== pkgId));
        if (selectedPkg?.id === pkgId) setSelectedPkg(null);
        if (typeof window !== "undefined") {
          const cached = window.localStorage.getItem("robobid_v3_outsourcing_packages");
          if (cached) {
            const list = JSON.parse(cached).filter((p: any) => p.id !== pkgId);
            window.localStorage.setItem("robobid_v3_outsourcing_packages", JSON.stringify(list));
          }
        }
        alert("외주 패키지가 삭제되었습니다.");
      } else {
        alert(json.error || "삭제 실패");
      }
    } catch (err) {
      alert("삭제 오류: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Clear all packages
  const handleClearAll = async () => {
    if (!confirm("승인되지 않은 모든 외주 발주 패키지를 완전히 삭제하시겠습니까?")) return;
    try {
      setLoading(true);
      for (const p of packages) {
        await fetch(`/api/outsourcing/${p.id}`, { method: "DELETE" });
      }
      setPackages([]);
      setSelectedPkg(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("robobid_v3_outsourcing_packages");
      }
      alert("모든 외주 발주 데이터가 초기화되었습니다.");
    } catch (err) {
      alert("초기화 오류: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-amber-200" />
              <h2 className="text-xl font-bold">외주 개발 & 전문역량 소싱 워크스페이스</h2>
              <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Phase 9 v3.0
              </span>
            </div>
            <p className="text-amber-100 text-xs mt-1">
              사내 역량 갭 분석을 바탕으로 외주 과업 범위(Scope)·SOW·검수 기준을 생성하고, 협력사 견적을 비교·평가합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {packages.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="px-3 py-2 bg-black/30 hover:bg-rose-900/60 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                전체 삭제
              </button>
            )}
            <button
              onClick={handleExtractScopes}
              disabled={loading}
              className="px-3.5 py-2 bg-white text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-amber-50 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Master Spec에서 외주 Scope 추출
            </button>
          </div>
        </div>

        {/* Notice alert */}
        <div className="bg-black/15 border border-white/20 p-3 rounded-xl mt-4 text-xs text-amber-50 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            <strong>불변식 준수 안내:</strong> RoboBid AI는 외주업체 자동선정 및 자동 계약 체결을 배제하며, 모든 외주 계약은 인간 책임자의 검토 및 오프라인 날인으로 집행됩니다.
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Outsource Packages list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              외주 과업 목록 ({packages.length})
            </h3>
          </div>

          <div className="space-y-2">
            {packages.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-500">
                <Briefcase className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                등록된 외주 과업이 없습니다.
                <p className="text-[11px] text-slate-400 mt-1">
                  상단 &lsquo;Scope 추출&rsquo;을 실행하여 직접 검토 후 승인하세요.
                </p>
              </div>
            ) : (
              packages.map((pkg) => {
                const isSelected = selectedPkg?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-amber-50/60 border-amber-500 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-semibold">
                        {pkg.taskCategory}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-slate-500">
                          {pkg.isApproved ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> 승인됨
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold">검토대기</span>
                          )}
                        </span>
                        <button
                          onClick={(e) => handleDeletePackage(pkg.id, e)}
                          title="이 외주 과업 삭제"
                          className="text-slate-400 hover:text-rose-600 p-0.5 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-2">
                      {pkg.taskTitle}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                      <span>견적: {pkg.receivedQuotes.length}건</span>
                      <span className="font-mono font-bold text-slate-700">
                        {(pkg.budgetCap / 10000).toLocaleString()}만원 한도
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Package details & SOW / Gaps / Quotes */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab navigation */}
            <div className="border-b border-slate-200 bg-slate-50 flex items-center px-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("scope")}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "scope"
                    ? "border-amber-600 text-amber-700 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                외주 과업 Scope & SOW
              </button>
              <button
                onClick={() => setActiveTab("gaps")}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "gaps"
                    ? "border-amber-600 text-amber-700 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                사내 역량 갭 분석 ({gaps.length})
              </button>
              <button
                onClick={() => setActiveTab("quotes")}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "quotes"
                    ? "border-amber-600 text-amber-700 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                후보 협력사 견적 & 다면평가 ({selectedPkg?.receivedQuotes.length || 0})
              </button>
            </div>

            <div className="p-6">
              {!selectedPkg && (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  좌측에서 검토할 외주 과업을 선택하거나 상단에서 신규 과업을 추출하세요.
                </div>
              )}

              {/* TAB 1: SCOPE & SOW */}
              {activeTab === "scope" && selectedPkg && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          {selectedPkg.taskCategory}
                        </span>
                        <h3 className="text-base font-bold text-slate-800">{selectedPkg.taskTitle}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{selectedPkg.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePackage(selectedPkg.id)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      과업 삭제
                    </button>
                  </div>

                  {/* SOW text */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      과업내역서 (Statement of Work - SOW)
                    </h4>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-800">
                      {selectedPkg.sowContent}
                    </div>
                  </div>

                  {/* Acceptance Criteria & Deliverables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                      <h4 className="text-xs font-bold text-slate-700">검수 기준 (Acceptance Criteria)</h4>
                      <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-lg border border-amber-200 font-medium">
                        {selectedPkg.acceptanceCriteria}
                      </p>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                      <h4 className="text-xs font-bold text-slate-700">제출 요구 산출물 (Deliverables)</h4>
                      <ul className="text-xs space-y-1">
                        {selectedPkg.deliverables.map((d, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Approval Bar */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                    {selectedPkg.isApproved ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                        <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5" />
                        <span>
                          외주 발주 승인 완료 (승인자: {selectedPkg.approvedBy} - {new Date(selectedPkg.approvedAt || "").toLocaleDateString()})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 text-xs">
                          <label className="font-semibold text-slate-700">승인자:</label>
                          <input
                            type="text"
                            placeholder="성명 및 직책 (직접 입력)"
                            value={approverName}
                            onChange={(e) => setApproverName(e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 text-xs w-44"
                          />
                          <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={approverAgreement}
                              onChange={(e) => setApproverAgreement(e.target.checked)}
                              className="rounded border-slate-300"
                            />
                            <span>과업 범위 및 검수 기준의 타당성을 확인하였으며 외주 발주를 승인합니다.</span>
                          </label>
                        </div>
                        <button
                          onClick={handleApprove}
                          disabled={!approverAgreement || !approverName.trim() || approving}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50"
                        >
                          {approving ? "승인 중..." : "외주 발주 승인"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GAPS ANALYSIS */}
              {activeTab === "gaps" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">사내 역량 대비 과제 요구사항 갭(Gap) 분석</h3>
                    <p className="text-xs text-slate-500">
                      Company Vault에 등록된 사내 특허·인증·인력 자산과 프로젝트 Master Spec을 비교하여 외주 위탁 필요성을 도출합니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {gaps.map((gap) => (
                      <div
                        key={gap.id}
                        className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs bg-white"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <span>{gap.requiredDiscipline}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                gap.isInternalAvailable
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {gap.isInternalAvailable ? "사내 자체수행" : "외부 위탁외주 권장"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{gap.reasoning}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-slate-700">
                            예상 예산: {(gap.estimatedBudget / 10000).toLocaleString()}만원
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: QUOTES & EVALUATION */}
              {activeTab === "quotes" && selectedPkg && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">후보 협력사 견적서 비교 및 다면 평가표</h3>
                    <p className="text-xs text-slate-500">
                      기술력(40), 가격(30), 납기(20), 관리(10) 4대 축으로 견적을 정량 평가합니다.
                    </p>
                  </div>

                  {/* Quotes Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-2.5 px-4">후보 협력사</th>
                          <th className="py-2.5 px-4">견적 금액</th>
                          <th className="py-2.5 px-4">소요 납기</th>
                          <th className="py-2.5 px-4">규격 부합</th>
                          <th className="py-2.5 px-4">종합 점수</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPkg.receivedQuotes.map((quote) => {
                          const evalRecord = selectedPkg.quoteEvaluations.find((e) => e.quoteId === quote.id);
                          return (
                            <tr key={quote.id} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-4 font-bold text-slate-800">
                                {quote.vendorName}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">
                                {quote.quoteAmount.toLocaleString()} 원
                              </td>
                              <td className="py-2.5 px-4 text-slate-600 font-mono">
                                {quote.leadTimeWeeks}주 이내
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                                  100% 부합
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                {evalRecord ? (
                                  <span className="font-mono font-extrabold text-indigo-600 text-xs">
                                    {evalRecord.totalScore}점 / 100점
                                  </span>
                                ) : (
                                  <span className="text-slate-400">미평가</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
