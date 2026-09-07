"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Briefcase,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { taskStore } from "@/lib/tasks/task-store";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { toast } from "sonner";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("HIGH");
  const [newCategory, setNewCategory] = useState<any>("PROPOSAL_DRAFT");
  const [newOpportunityId, setNewOpportunityId] = useState("");

  const opportunities = opportunityStore.getAll();

  const loadData = () => {
    setTasks(taskStore.getAll());
  };

  useEffect(() => {
    loadData();
    const opps = opportunityStore.getAll();
    if (opps.length > 0) {
      setNewOpportunityId(opps[0].id);
    }
  }, []);

  const handleToggleStatus = (id: string, current: TaskStatus) => {
    const next: TaskStatus = current === "DONE" ? "TODO" : "DONE";
    taskStore.updateStatus(id, next);
    loadData();
  };

  const handleSelectStatus = (id: string, status: TaskStatus) => {
    taskStore.updateStatus(id, status);
    loadData();
  };

  const handleDelete = (id: string) => {
    taskStore.delete(id);
    toast.success("업무가 삭제되었습니다.");
    loadData();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const opp = opportunities.find((o) => o.id === newOpportunityId);

    taskStore.create({
      title: newTitle,
      description: newDescription,
      opportunityId: newOpportunityId,
      opportunityTitle: opp?.title,
      assignee: newAssignee,
      dueDate: newDueDate,
      priority: newPriority,
      status: "TODO",
      category: newCategory,
    });

    toast.success("새 업무가 성공적으로 등록되었습니다.");
    setNewTitle("");
    setNewDescription("");
    setNewAssignee("");
    setNewDueDate("");
    setCreateModalOpen(false);
    loadData();
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    return true;
  });

  const todoCount = tasks.filter((t) => t.status === "TODO").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const reviewCount = tasks.filter((t) => t.status === "REVIEW").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-primary" />
              업무·협업 관리 (BidOps Tasks)
            </h1>
            <Badge variant="outline" className="text-xs">
              실시간 팀 협업
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            공모 검토, RFP 분석, 제안서 작성 및 제출 증빙 서류 준비에 관련된 전사 실무 할 일을 추적합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateModalOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>새 업무 등록</span>
          </Button>
        </div>
      </div>

      {/* 2. Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === "ALL" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-muted-foreground font-medium">전체 업무</span>
          <div className="text-xl font-bold font-mono mt-1 text-foreground">{tasks.length}건</div>
        </div>

        <div
          onClick={() => setStatusFilter("TODO")}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === "TODO" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-muted-foreground font-medium">착수 대기 (TODO)</span>
          <div className="text-xl font-bold font-mono mt-1 text-foreground">{todoCount}건</div>
        </div>

        <div
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === "IN_PROGRESS" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-muted-foreground font-medium">진행 중 (IN_PROGRESS)</span>
          <div className="text-xl font-bold font-mono mt-1 text-primary">{inProgressCount}건</div>
        </div>

        <div
          onClick={() => setStatusFilter("DONE")}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === "DONE" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-muted-foreground font-medium">완료 (DONE)</span>
          <div className="text-xl font-bold font-mono mt-1 text-emerald-600">{doneCount}건</div>
        </div>
      </div>

      {/* 3. Task List Table */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60 text-xs">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">해당 조건의 업무가 없습니다.</div>
            ) : (
              filteredTasks.map((t) => {
                const isDone = t.status === "DONE";
                return (
                  <div
                    key={t.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleStatus(t.id, t.status)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`font-semibold text-sm ${
                            isDone ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {t.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          {t.opportunityTitle && (
                            <span className="text-primary font-medium">
                              연계: {t.opportunityTitle}
                            </span>
                          )}
                          <span>· 담당: {t.assignee}</span>
                          <span className="font-mono text-destructive">
                            마감: {t.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <select
                        value={t.status}
                        onChange={(e) => handleSelectStatus(t.id, e.target.value as TaskStatus)}
                        className="text-[11px] px-2 py-1 bg-background border rounded font-medium focus:outline-none"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">진행중</option>
                        <option value="REVIEW">검토중</option>
                        <option value="DONE">완료</option>
                      </select>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          t.priority === "URGENT"
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : t.priority === "HIGH"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t.priority}
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(t.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-xl shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                새 업무 할 일 등록
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">업무 제목</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: WMS 인터페이스 연동 기술규격서 작성"
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">상세 내용 (선택)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="업무 지침 또는 산출물 요건을 적어주세요."
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">연계 공모 선택</label>
                <select
                  value={newOpportunityId}
                  onChange={(e) => setNewOpportunityId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none truncate"
                >
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">담당자</label>
                  <input
                    type="text"
                    placeholder="예: 성명 및 부서 (직접 입력)"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">마감일</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">우선순위</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 bg-background border rounded-md text-foreground focus:outline-none"
                >
                  <option value="URGENT">긴급 (URGENT)</option>
                  <option value="HIGH">높음 (HIGH)</option>
                  <option value="MEDIUM">보통 (MEDIUM)</option>
                  <option value="LOW">낮음 (LOW)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit" size="sm">
                  등록 완료
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
