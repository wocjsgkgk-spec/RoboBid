"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DevelopmentProject,
  CategoryBudgetAllocation,
  DevelopmentWorkItem,
  DevelopmentMilestone,
  DevelopmentReporting,
  DevelopmentDeliverable,
} from "@/types/award";
import { ProjectBudgetCategory } from "@/types/funding";
import {
  Trophy,
  CheckCircle2,
  Calendar,
  Layers,
  Briefcase,
  TrendingUp,
  Cpu,
  Plus,
  ArrowRight,
  FileCheck,
  ShieldCheck,
  Building,
  DollarSign,
  PieChart,
  ClipboardList,
  Sparkles,
  Trash2,
} from "lucide-react";

export function V3AwardWorkspace() {
  const [projects, setProjects] = useState<DevelopmentProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<DevelopmentProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "budget" | "wbs" | "outsourcing" | "milestones" | "deliverables"
  >("budget");

  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState<ProjectBudgetCategory>("LABOR");
  const [expenseAmount, setExpenseAmount] = useState<number>(10000000);
  const [recordingExpense, setRecordingExpense] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/awards");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProjects(json.data);
        if (json.data.length > 0 && !selectedProject) {
          setSelectedProject(json.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load awarded projects", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || expenseAmount <= 0) return;

    try {
      setRecordingExpense(true);
      const res = await fetch(`/api/awards/${selectedProject.id}/expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: expenseCategory,
          amount: expenseAmount,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedProject(json.data);
        setProjects((prev) =>
          prev.map((p) => (p.id === json.data.id ? json.data : p))
        );
        alert(`집행 등록 완료: ${expenseCategory} 비목에 ${expenseAmount.toLocaleString()}원이 집행되었습니다.`);
      } else {
        alert(json.error || "집행 등록 실패");
      }
    } catch (err) {
      alert("오류: " + (err as Error).message);
    } finally {
      setRecordingExpense(false);
    }
  };

  const handleDeleteProject = async (projId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("정말 이 선정 개발 과제를 삭제하시겠습니까? 관련 비목 및 WBS 내역이 함께 삭제됩니다.")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/awards/${projId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        const remaining = projects.filter((p) => p.id !== projId);
        setProjects(remaining);
        if (selectedProject?.id === projId) {
          setSelectedProject(remaining.length > 0 ? remaining[0] : null);
        }
        if (typeof window !== "undefined") {
          const cached = window.localStorage.getItem("robobid_v3_awarded_projects");
          if (cached) {
            const list = JSON.parse(cached).filter((p: any) => p.id !== projId);
            window.localStorage.setItem("robobid_v3_awarded_projects", JSON.stringify(list));
          }
        }
        alert("선정 개발 과제가 삭제되었습니다.");
      } else {
        alert(json.error || "과제 삭제 실패");
      }
    } catch (err) {
      alert("삭제 오류: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllProjects = async () => {
    if (!confirm("등록되거나 임의 생성된 모든 선정 과제를 완전히 삭제하시겠습니까?")) return;
    try {
      setLoading(true);
      for (const p of projects) {
        await fetch(`/api/awards/${p.id}`, { method: "DELETE" });
      }
      setProjects([]);
      setSelectedProject(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("robobid_v3_awarded_projects");
      }
      alert("모든 선정 개발 과제 데이터가 초기화되었습니다.");
    } catch (err) {
      alert("초기화 오류: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = selectedProject?.fundingAllocation.totalBudget || 0;
  const totalExecuted =
    selectedProject?.fundingAllocation.categoryAllocations.reduce(
      (acc, c) => acc + c.executedAmount,
      0
    ) || 0;
  const executionRate = totalAllocated > 0 ? ((totalExecuted / totalAllocated) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-300" />
              <h2 className="text-xl font-bold">선정 과제 개발 전환 관리 (Award Workspace)</h2>
              <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Phase 8 v3.0
              </span>
            </div>
            <p className="text-emerald-100 text-xs mt-1">
              선정된 지원사업을 실제 개발 프로젝트로 전환하고, 정부지원금 비목 배정 및 WBS·외주 Scope·산출물을 추적합니다.
            </p>
          </div>

          {/* Project Switcher & Actions */}
          {projects.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl">
                <span className="text-xs text-emerald-100 shrink-0 font-medium">선정 과제:</span>
                <select
                  value={selectedProject?.id || ""}
                  onChange={(e) => {
                    const found = projects.find((p) => p.id === e.target.value);
                    if (found) setSelectedProject(found);
                  }}
                  className="bg-white text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium border-0 focus:ring-2 focus:ring-amber-400 max-w-[220px] truncate"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <button
                  onClick={() => handleDeleteProject(selectedProject.id)}
                  disabled={loading}
                  title="현재 선택된 과제 삭제"
                  className="px-2.5 py-1.5 bg-rose-600/80 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  과제 삭제
                </button>
              )}

              <button
                onClick={handleClearAllProjects}
                disabled={loading}
                title="전체 선정 과제 데이터 초기화"
                className="px-2.5 py-1.5 bg-black/30 hover:bg-rose-900/60 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                전체 삭제
              </button>
            </div>
          )}
        </div>

        {/* Executive Metric Cards */}
        {selectedProject && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
              <div className="text-[11px] text-emerald-200">확정 정부지원금 (Grant)</div>
              <div className="text-xl font-extrabold text-amber-300 mt-0.5">
                {(selectedProject.fundingAllocation.governmentGrant / 100000000).toFixed(2)} 억원
              </div>
              <div className="text-[10px] text-emerald-100 mt-1">
                정부출연 비율 {((selectedProject.fundingAllocation.governmentGrant / selectedProject.fundingAllocation.totalBudget) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
              <div className="text-[11px] text-emerald-200">총 사업비 (Total Budget)</div>
              <div className="text-xl font-extrabold text-white mt-0.5">
                {(selectedProject.fundingAllocation.totalBudget / 100000000).toFixed(2)} 억원
              </div>
              <div className="text-[10px] text-emerald-100 mt-1">
                협약번호: {selectedProject.agreement.agreementNumber}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
              <div className="text-[11px] text-emerald-200">민간부담금 (자부담)</div>
              <div className="text-xl font-extrabold text-white mt-0.5">
                {(selectedProject.fundingAllocation.privateContribution / 100000000).toFixed(2)} 억원
              </div>
              <div className="text-[10px] text-emerald-100 mt-1">
                현금 {(selectedProject.fundingAllocation.privateCash / 10000000).toFixed(0)}천만 / 현물 {(selectedProject.fundingAllocation.privateInKind / 10000000).toFixed(0)}천만
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
              <div className="text-[11px] text-emerald-200">예산 집행률 및 잔액</div>
              <div className="text-xl font-extrabold text-emerald-200 mt-0.5">
                {executionRate}% <span className="text-xs font-normal text-white">집행</span>
              </div>
              <div className="text-[10px] text-emerald-100 mt-1">
                잔액: {((totalAllocated - totalExecuted) / 100000000).toFixed(2)} 억원
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedProject ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 bg-slate-50 flex items-center px-4 overflow-x-auto text-xs">
            {[
              { id: "budget", label: "지원금 비목별 배정", icon: DollarSign },
              { id: "wbs", label: "WBS 실무 분장 (4분할)", icon: Layers },
              { id: "outsourcing", label: "외주 과업 Scope", icon: Briefcase },
              { id: "milestones", label: "마일스톤 & 정기보고", icon: Calendar },
              { id: "deliverables", label: "확정 산출물 추적", icon: FileCheck },
              { id: "overview", label: "협약 및 규정 안내", icon: Building },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-3.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
                  activeTab === id
                    ? "border-emerald-600 text-emerald-700 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* TAB 1: BUDGET ALLOCATION */}
            {activeTab === "budget" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">10대 비용 항목 비목별 예산 배정표</h3>
                    <p className="text-xs text-slate-500">
                      정부 전담기관 협약 기준에 맞춰 비목별 배정액과 집행 실적을 관리합니다.
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    간접비 상한: <strong className="text-slate-700">{selectedProject.fundingAllocation.maxOverheadRatePercent}%</strong> 이내
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-2.5 px-4">비목 구분</th>
                        <th className="py-2.5 px-4">배정 예산</th>
                        <th className="py-2.5 px-4">집행 금액</th>
                        <th className="py-2.5 px-4">잔액</th>
                        <th className="py-2.5 px-4">소진율</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedProject.fundingAllocation.categoryAllocations.map((alloc) => {
                        const rate = alloc.allocatedAmount > 0
                          ? ((alloc.executedAmount / alloc.allocatedAmount) * 100).toFixed(0)
                          : "0";
                        return (
                          <tr key={alloc.category} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-4 font-semibold text-slate-800">
                              {alloc.category}
                            </td>
                            <td className="py-2.5 px-4 text-slate-700 font-mono">
                              {alloc.allocatedAmount.toLocaleString()} 원
                            </td>
                            <td className="py-2.5 px-4 text-emerald-600 font-mono">
                              {alloc.executedAmount.toLocaleString()} 원
                            </td>
                            <td className="py-2.5 px-4 text-slate-700 font-mono font-medium">
                              {alloc.remainingAmount.toLocaleString()} 원
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-emerald-600 h-full rounded-full"
                                    style={{ width: `${Math.min(100, Number(rate))}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-mono text-slate-500">{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Expense recording form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">실시간 사업비 집행 등록</h4>
                  <form onSubmit={handleRecordExpense} className="flex flex-wrap items-center gap-3 text-xs">
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as ProjectBudgetCategory)}
                      className="bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    >
                      {selectedProject.fundingAllocation.categoryAllocations.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category} (잔액: {(c.remainingAmount / 10000).toLocaleString()}만원)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(Number(e.target.value))}
                      step={1000000}
                      className="bg-white border border-slate-300 rounded-lg p-2 w-44 font-mono"
                      placeholder="집행 금액 (원)"
                    />
                    <button
                      type="submit"
                      disabled={recordingExpense}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                      {recordingExpense ? "처리 중..." : "집행 처리"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: WBS 4-PARTITION WORK ITEMS */}
            {activeTab === "wbs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">WBS 실무 업무 분장 (자체/외주/구매/실증)</h3>
                    <p className="text-xs text-slate-500">
                      Master Spec의 WBS를 바탕으로 4대 실무 영역으로 명확히 구분하여 배정합니다.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.workItems.map((item: DevelopmentWorkItem) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-2 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {item.wbsCode}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            item.workCategory === "INTERNAL_WORK"
                              ? "bg-blue-100 text-blue-800"
                              : item.workCategory === "EXTERNAL_WORK"
                              ? "bg-amber-100 text-amber-800"
                              : item.workCategory === "PROCUREMENT"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.workCategory === "INTERNAL_WORK"
                            ? "자체수행"
                            : item.workCategory === "EXTERNAL_WORK"
                            ? "외주용역"
                            : item.workCategory === "PROCUREMENT"
                            ? "부품구매"
                            : "인증실증"}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t">
                        <span>담당: {item.assignedRole}</span>
                        <span className="font-mono font-semibold text-slate-700">
                          예산: {item.budgetAmount.toLocaleString()}원
                        </span>
                      </div>
                      {item.deliverable && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                          산출물: {item.deliverable}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: OUTSOURCING SCOPE */}
            {activeTab === "outsourcing" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">외주 과업 Scope 및 발주 관리</h3>
                  <p className="text-xs text-slate-500">
                    과제 선정 후 외부 전문업체에 발주할 기술 용역 범위를 정의하고 RFP를 연계합니다.
                  </p>
                </div>

                {selectedProject.outsourcingScopes.map((scope) => (
                  <div
                    key={scope.id}
                    className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                        {scope.taskTitle}
                      </h4>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                        {scope.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{scope.specSummary}</p>
                    <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs space-y-1">
                      <div className="text-slate-500">
                        <strong>검수 기준(Acceptance):</strong> {scope.acceptanceCriteria}
                      </div>
                      <div className="text-slate-700 font-mono">
                        <strong>예정 예산:</strong> {scope.budgetAmount.toLocaleString()} 원 한도 내
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: MILESTONES & REPORTING */}
            {activeTab === "milestones" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">연차별 마일스톤 및 정기 보고 일정</h3>
                  <p className="text-xs text-slate-500">
                    정부 전담기관 중간 점검, 연차 평가, 최종 감리 보고 일정을 관리합니다.
                  </p>
                </div>

                {/* Milestones list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    개발 단계별 마일스톤
                  </h4>
                  {selectedProject.milestones.map((m: DevelopmentMilestone) => (
                    <div
                      key={m.id}
                      className="border border-slate-200 rounded-lg p-3 flex items-center justify-between bg-white text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="text-indigo-600 font-mono">Phase {m.phaseNumber}</span>
                          <span>{m.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          산출물: {m.deliverables.join(", ")}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-500 font-mono">{m.targetDate}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reporting schedule */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    의무 정기 보고서 제출 일정
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.reportingSchedule.map((r: DevelopmentReporting) => (
                      <div
                        key={r.id}
                        className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{r.reportType}</span>
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {r.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{r.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">기한: {r.dueDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DELIVERABLES */}
            {activeTab === "deliverables" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">확정 산출물 (Deliverables) 검증 추적</h3>
                  <p className="text-xs text-slate-500">
                    KOLAS 시험성적서, 특허 출원서, 시작품 완성도 등 최종 평가용 결과물을 추적합니다.
                  </p>
                </div>

                <div className="space-y-2">
                  {selectedProject.deliverables.map((d: DevelopmentDeliverable) => (
                    <div
                      key={d.id}
                      className="border border-slate-200 rounded-lg p-3.5 flex items-center justify-between bg-white text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={d.isCompleted}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-emerald-600 w-4 h-4"
                        />
                        <div>
                          <div className="font-semibold text-slate-800">{d.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            평가방법: {d.evaluationMethod}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-slate-500 font-mono">목표일: {d.targetDate}</span>
                        <div className="text-emerald-600 font-medium mt-0.5">
                          {d.isCompleted ? "검증 완료" : "진행 대기"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: OVERVIEW & AGREEMENT */}
            {activeTab === "overview" && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800">공식 협약 정보</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>협약 번호: <strong className="text-slate-800">{selectedProject.agreement.agreementNumber}</strong></div>
                    <div>전담 기관: <strong className="text-slate-800">{selectedProject.agreement.managingAgency}</strong></div>
                    <div>수행 기간: <strong className="text-slate-800">{selectedProject.agreement.startDate} ~ {selectedProject.agreement.endDate}</strong></div>
                    <div>중간 평가일: <strong className="text-slate-800">{selectedProject.agreement.midEvaluationDate}</strong></div>
                    <div>최종 평가일: <strong className="text-slate-800">{selectedProject.agreement.finalEvaluationDate}</strong></div>
                    <div>정산 기한: 협약 종료 후 <strong className="text-slate-800">{selectedProject.fundingAllocation.settlementDeadlineDays}일</strong> 이내</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-16 text-center rounded-2xl border border-slate-200 text-slate-500 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">등록되거나 선정된 로봇 개발 프로젝트가 없습니다.</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            승인되지 않은 임의 데이터는 생성되지 않습니다. 지원사업이 최종 선정된 후, [신청서/제안서] 허브에서 &lsquo;선정 과제로 전환&rsquo;을 진행하여 공식 협약 예산 및 WBS를 구성하세요.
          </p>
        </div>
      )}
    </div>
  );
}
