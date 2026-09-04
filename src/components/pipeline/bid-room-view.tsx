"use client";

import React, { useState } from "react";
import { BidRoom, PipelineStage } from "@/types/pipeline";
import { Task } from "@/types/task";
import {
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Award,
  ListTodo,
  Calendar,
  Send,
  Building2,
  Coins,
  ArrowRight,
  Plus,
  X,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BidRoomViewProps {
  bidRoom: BidRoom;
  tasks?: Task[];
  onClose?: () => void;
  onOpenProposal?: (proposalId: string) => void;
  onOpenSubmission?: (opportunityId: string) => void;
  onCreateTask?: (opportunityId: string) => void;
}

export function BidRoomView({
  bidRoom,
  tasks = [],
  onClose,
  onOpenProposal,
  onOpenSubmission,
  onCreateTask,
}: BidRoomViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "sections" | "evidence" | "activity">("overview");

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in-50 duration-200">
      {/* 1. Bid Room Brand Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-indigo-900/60 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 bg-indigo-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Bid Room 수주 전용 프로젝트 공간
            </span>
            <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">
              GO 확정
            </Badge>
            <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {bidRoom.announcingAgency}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {bidRoom.opportunityTitle}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {bidRoom.proposalId && onOpenProposal && (
            <Button
              size="sm"
              onClick={() => onOpenProposal(bidRoom.proposalId!)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              제안서 에디터 열기
            </Button>
          )}
          {onOpenSubmission && (
            <Button
              size="sm"
              onClick={() => onOpenSubmission(bidRoom.opportunityId)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              제출 점검
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 p-0 ml-1"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. 4 Key Progress Gauges */}
      <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">제안서 작성 진척도</div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-base text-indigo-400 font-mono">{bidRoom.proposalProgressPercent}%</span>
            <span className="text-[10px] text-slate-400 font-mono">초안 조립</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${bidRoom.proposalProgressPercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">컴플라이언스 충족률</div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-base text-emerald-400 font-mono">{bidRoom.complianceRatePercent}%</span>
            <span className="text-[10px] text-slate-400 font-mono">RFP 요건</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${bidRoom.complianceRatePercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">과업(Tasks) 완료율</div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-base text-blue-400 font-mono">
              {bidRoom.taskDoneCount} / {bidRoom.taskTotalCount}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {bidRoom.taskTotalCount > 0 ? `${Math.round((bidRoom.taskDoneCount / bidRoom.taskTotalCount) * 100)}%` : "0%"}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1 mt-1 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${bidRoom.taskTotalCount > 0 ? (bidRoom.taskDoneCount / bidRoom.taskTotalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">마감 D-Day</div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-base text-rose-400 font-mono">D-{bidRoom.daysRemaining}</span>
            <span className="text-[10px] text-slate-400 font-mono">{new Date(bidRoom.deadline).toLocaleDateString("ko-KR")}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: "70%" }} />
          </div>
        </div>
      </div>

      {/* 3. Bid Room Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center gap-1 shrink-0">
        {[
          { id: "overview", label: "타임라인 & 마일스톤", icon: Calendar },
          { id: "tasks", label: "전담 과업 (Tasks)", icon: ListTodo, count: tasks.length || bidRoom.taskTotalCount },
          { id: "sections", label: "제안서 섹션", icon: FileSpreadsheet },
          { id: "evidence", label: "증빙자료", icon: Award },
          { id: "activity", label: "팀 피드 & 감사", icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                isActive
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Team Members Bar */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">수주 전담 TFT 책임자 및 팀원</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      책임 PM: <span className="text-indigo-600 dark:text-indigo-400">{bidRoom.leadAssignee}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {bidRoom.teamMembers.map((member, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                      {member}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="text-[11px] h-7 px-2">
                    <Plus className="w-3 h-3 mr-1" />
                    팀원 배정
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Milestones */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  수주 실행 마일스톤 (Timeline)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6 text-xs">
                  {bidRoom.timelineMilestones.map((milestone, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                        milestone.completed ? "border-emerald-500 bg-emerald-500" : "border-slate-400"
                      }`}>
                        {milestone.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{milestone.title}</div>
                      <div className="text-slate-400 text-[11px] font-mono mt-0.5">{milestone.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">본 프로젝트 전담 과업 목록</h3>
              {onCreateTask && (
                <Button size="sm" onClick={() => onCreateTask(bidRoom.opportunityId)} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  과업 생성
                </Button>
              )}
            </div>
            <div className="space-y-2 text-xs">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{task.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        담당: {task.assignee} | 기한: {task.dueDate} | 우선순위: {task.priority}
                      </div>
                    </div>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  등록된 전담 과업이 없습니다. [과업 생성] 버튼을 눌러 작업을 배정하세요.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
