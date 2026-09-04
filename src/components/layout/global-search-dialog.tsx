"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Briefcase,
  FileSpreadsheet,
  CheckSquare,
  FileCheck2,
  X,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Command,
} from "lucide-react";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { taskStore } from "@/lib/tasks/task-store";
import { evidenceStore } from "@/lib/evidence/evidence-store";
import { vaultStore } from "@/lib/vault/vault-store";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_COMMANDS = [
  { id: "cmd-new-opp", title: "새 공모 수동 등록", category: "공모", path: "/opportunities", icon: Briefcase },
  { id: "cmd-create-task", title: "새 업무(Task) 생성", category: "업무", path: "/tasks", icon: CheckSquare },
  { id: "cmd-new-proposal", title: "AI 제안서 초안 작성", category: "제안", path: "/proposals", icon: FileSpreadsheet },
  { id: "cmd-rfp-parse", title: "RFP 공고문 문서 분석", category: "RFP", path: "/rfp", icon: FileText },
  { id: "cmd-bid-room", title: "수주 파이프라인 & Bid Room", category: "파이프라인", path: "/pipeline", icon: Sparkles },
  { id: "cmd-vault", title: "사내 역량 자산(Vault) 관리", category: "자산", path: "/vault", icon: Award },
];

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const q = query.toLowerCase().trim();
  const opportunities = opportunityStore.getAll().filter(
    (o) => !q || o.title.toLowerCase().includes(q) || o.announcingAgency.toLowerCase().includes(q)
  ).slice(0, 4);

  const tasks = taskStore.getAll().filter(
    (t) => !q || t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)
  ).slice(0, 3);

  const evidences = evidenceStore.getAll().filter(
    (e) => !q || e.name.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q))
  ).slice(0, 3);

  const vaultItems = vaultStore.getAll().filter(
    (v) => !q || v.title.toLowerCase().includes(q) || v.type.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchingCommands = QUICK_COMMANDS.filter(
    (c) => !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
  );

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="공모명, 기관, RFP 요구조건, 업무, 특허자산 통합 검색... (Ctrl+K 또는 ESC)"
            className="w-full py-3.5 bg-transparent text-sm focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Action Commands */}
          {matchingCommands.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> 빠른 실행 커맨드 (Quick Commands)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {matchingCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleNavigate(cmd.path)}
                      className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {cmd.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{cmd.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Opportunities */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2">
              <Briefcase className="h-3.5 w-3.5 text-blue-500" /> 공모 및 수주 기회
            </div>
            {opportunities.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-xs">검색 결과가 없습니다.</div>
            ) : (
              opportunities.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => handleNavigate("/opportunities")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {opp.title}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {opp.announcingAgency} · {opp.bidType} · 마감 {opp.submissionDeadline.split("T")[0]}
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))
            )}
          </div>

          {/* Tasks */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2">
              <CheckSquare className="h-3.5 w-3.5 text-emerald-500" /> 업무 및 할 일 (Tasks)
            </div>
            {tasks.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-xs">검색 결과가 없습니다.</div>
            ) : (
              tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleNavigate("/tasks")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {task.title}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      담당: {task.assignee} · 마감 {task.dueDate} · 상태: {task.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">{task.priority}</span>
                </button>
              ))
            )}
          </div>

          {/* Evidence & Vault */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2">
              <Award className="h-3.5 w-3.5 text-amber-500" /> 사내 역량 및 증빙자료 (Vault & Evidence)
            </div>
            {vaultItems.length === 0 && evidences.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-xs">검색 결과가 없습니다.</div>
            ) : (
              [...vaultItems, ...evidences].slice(0, 4).map((item: any, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigate(item.type ? "/vault" : "/evidence")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {item.title || item.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      분류: {item.type || item.category} · 사내 등록 자산
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>단축키: [ESC] 닫기 · [Ctrl+K] 토글 · [Enter] 실행</span>
          <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">RoboBid Command Center v3.0</span>
        </div>
      </div>
    </div>
  );
}
