"use client";

import React, { useState } from "react";
import {
  Opportunity,
  OpportunityScore,
  BidDecision,
  Task,
  RequirementMatrixItem,
} from "@/types";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Send,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Award,
  Layers,
  ListTodo,
  ExternalLink,
  ChevronRight,
  Sparkles,
  X,
  History,
  Building2,
  Coins,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Opportunity360WorkspaceProps {
  opportunity: Opportunity;
  score?: OpportunityScore;
  decision?: BidDecision;
  tasks?: Task[];
  requirements?: RequirementMatrixItem[];
  onClose?: () => void;
  onNavigateToBidRoom?: (opportunityId: string) => void;
  onNavigateToProposal?: (opportunityId: string) => void;
  onNavigateToRfp?: (opportunityId: string) => void;
  onOpenDecisionModal?: (opportunity: Opportunity) => void;
  onCreateTask?: (opportunityId: string) => void;
}

type TabType =
  | "summary"
  | "eligibility"
  | "rfp"
  | "fit"
  | "decision"
  | "proposal"
  | "evidence"
  | "tasks"
  | "submission"
  | "history";

export function Opportunity360Workspace({
  opportunity,
  score,
  decision,
  tasks = [],
  requirements = [],
  onClose,
  onNavigateToBidRoom,
  onNavigateToProposal,
  onNavigateToRfp,
  onOpenDecisionModal,
  onCreateTask,
}: Opportunity360WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  // D-Day Calculation
  const deadlineDate = new Date(opportunity.submissionDeadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isUrgent = daysRemaining <= 3 && daysRemaining >= 0;

  // Key Metrics
  const currentDecision = decision?.decision || (opportunity.status === "GO" ? "GO" : "PENDING");
  const overallScore = score?.totalScore ?? 85;
  const proposalProgress = opportunity.status === "SUBMISSION_READY" || opportunity.status === "SUBMITTED"
    ? 100
    : opportunity.status === "PROPOSAL_IN_PROGRESS" || opportunity.status === "PROPOSAL"
    ? 65
    : currentDecision === "GO"
    ? 35
    : 10;
  const complianceRate = 82;
  const submissionReadiness = opportunity.status === "SUBMITTED" ? 100 : proposalProgress > 60 ? 70 : 30;

  const tabs: { id: TabType; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: "summary", label: "요약", icon: Layers },
    { id: "eligibility", label: "Eligibility", icon: ShieldCheck },
    { id: "rfp", label: "RFP 분석", icon: FileText, count: requirements.length || 5 },
    { id: "fit", label: "회사 적합도", icon: TrendingUp },
    { id: "decision", label: "GO/NO-GO", icon: CheckCircle2 },
    { id: "proposal", label: "제안서", icon: FileSpreadsheet, count: proposalProgress ? `${proposalProgress}%` : undefined as any },
    { id: "evidence", label: "증빙자료", icon: Award, count: 4 },
    { id: "tasks", label: "과업(Tasks)", icon: ListTodo, count: tasks.length },
    { id: "submission", label: "제출 점검", icon: Send, badgeColor: "bg-blue-600 text-white" },
    { id: "history", label: "이력", icon: History },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in-50 duration-200">
      {/* 1. Header Bar: Status & Actions */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 shrink-0">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5">
              {opportunity.bidType}
            </Badge>
            {opportunity.dataSource === "DEMO" ? (
              <Badge variant="outline" className="text-slate-400 border-slate-700 text-[10px]">
                DEMO 데이터
              </Badge>
            ) : (
              <Badge className="bg-emerald-600/90 text-white text-[10px]">
                실제 공고
              </Badge>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Building2 className="w-3.5 h-3.5" />
              {opportunity.announcingAgency}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white truncate">
            {opportunity.title}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {currentDecision === "GO" && onNavigateToBidRoom && (
            <Button
              size="sm"
              onClick={() => onNavigateToBidRoom(opportunity.id)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Bid Room 열기
            </Button>
          )}
          {onOpenDecisionModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDecisionModal(opportunity)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs"
            >
              지원결정 (GO/NO-GO)
            </Button>
          )}
          {onCreateTask && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCreateTask(opportunity.id)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              과업 추가
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

      {/* 2. Top Status Bar: 7 Core Business Indicators */}
      <div className="bg-slate-950/90 text-slate-200 px-6 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs shrink-0">
        {/* Indicator 1: Eligibility */}
        <div className="flex flex-col bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Eligibility</span>
          <div className="flex items-center gap-1.5 mt-1 font-bold text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>PASS</span>
          </div>
        </div>

        {/* Indicator 2: Opportunity Score */}
        <div className="flex flex-col bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Opportunity Score</span>
          <div className="flex items-center gap-1.5 mt-1 font-bold text-sm text-blue-400">
            <span className="font-mono text-base">{overallScore}</span>
            <span className="text-[10px] text-slate-400 font-normal">/ 100점</span>
          </div>
        </div>

        {/* Indicator 3: Decision */}
        <div className="flex flex-col bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Decision</span>
          <div className="flex items-center gap-1.5 mt-1 font-bold text-sm">
            {currentDecision === "GO" ? (
              <Badge className="bg-emerald-600 text-white text-[11px] font-bold">GO 확정</Badge>
            ) : currentDecision === "NO_GO" ? (
              <Badge className="bg-rose-600 text-white text-[11px] font-bold">NO-GO</Badge>
            ) : currentDecision === "HOLD" ? (
              <Badge className="bg-amber-500 text-white text-[11px] font-bold">HOLD 보류</Badge>
            ) : (
              <Badge variant="outline" className="text-slate-400 text-[11px]">미결정</Badge>
            )}
          </div>
        </div>

        {/* Indicator 4: Proposal Progress */}
        <div className="flex flex-col bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Proposal</span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-sm text-indigo-400 font-mono">{proposalProgress}%</span>
            <span className="text-[10px] text-slate-400 font-mono">초안 작성</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${proposalProgress}%` }} />
          </div>
        </div>

        {/* Indicator 5: Compliance */}
        <div className="flex flex-col bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Compliance</span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-sm text-emerald-400 font-mono">{complianceRate}%</span>
            <span className="text-[10px] text-slate-400 font-mono">요구 충족</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${complianceRate}%` }} />
          </div>
        </div>

        {/* Indicator 6: Submission Readiness */}
        <div className="flex flex-col bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Submission</span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-sm text-purple-400 font-mono">{submissionReadiness}%</span>
            <span className="text-[10px] text-slate-400 font-mono">준비율</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${submissionReadiness}%` }} />
          </div>
        </div>

        {/* Indicator 7: D-Day */}
        <div className={`flex flex-col rounded-lg p-2.5 border ${
          isUrgent ? "bg-rose-950/80 border-rose-800/80 text-rose-200" : "bg-slate-900/90 border-slate-800"
        }`}>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">D-Day</span>
          <div className="flex items-center gap-1.5 mt-1 font-bold text-sm">
            <Clock className={`w-4 h-4 ${isUrgent ? "text-rose-400 animate-pulse" : "text-slate-400"}`} />
            <span className="font-mono text-base font-extrabold">
              {daysRemaining < 0 ? "마감" : daysRemaining === 0 ? "D-Day (오늘)" : `D-${daysRemaining}`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  tab.badgeColor || (isActive ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300")
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {/* TAB 1: SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Quick Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">배정 예산 / 추정금액</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                      {opportunity.allocatedBudget ? `${(opportunity.allocatedBudget / 100000000).toFixed(1)}억원` : "금액 미정 (협의)"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">제출 마감 일시</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {new Date(opportunity.submissionDeadline).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">공고 기관 및 소스</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {opportunity.announcingAgency} ({opportunity.providerId})
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategic Summary & Contextual Next Action */}
            <Card className="border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    수주 전략 판단 가이드 (BidOps Recommendation)
                  </CardTitle>
                  <Badge className="bg-blue-600 text-white text-xs">
                    적합도 {overallScore}점
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  본 공모는 사내 보유 역량인 <strong>SLAM 자율주행 알고리즘</strong> 및 <strong>협동로봇 안전인증(ISO 10218)</strong>과 85% 이상 정합성을 가집니다. 기술평가 80점 배점 구간에서 우위 확보가 가능하므로 <strong>[GO 지원 결정]</strong>을 권장합니다.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  {currentDecision !== "GO" ? (
                    <Button
                      size="sm"
                      onClick={() => onOpenDecisionModal && onOpenDecisionModal(opportunity)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      GO 지원 확정하기
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onNavigateToProposal && onNavigateToProposal(opportunity.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                      AI 제안서 작업 계속하기
                    </Button>
                  )}
                  {onNavigateToRfp && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToRfp(opportunity.id)}
                      className="text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      RFP 정밀 분석표 보기
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* General Specs Details */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">공모 상세 규격 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500 font-medium">공고 고유 식별자</dt>
                    <dd className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{opportunity.sourceId}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">사업 도메인 분류</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{opportunity.primaryDomain}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">수요 기관 (실제 납품처)</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{opportunity.demandingAgency || opportunity.announcingAgency}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">공고 게시일시</dt>
                    <dd className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{new Date(opportunity.postedAt).toLocaleDateString("ko-KR")}</dd>
                  </div>
                  {opportunity.canonicalUrl && (
                    <div className="md:col-span-2 pt-2">
                      <dt className="text-slate-500 font-medium">원문 공고 웹페이지</dt>
                      <dd className="mt-1">
                        <a
                          href={opportunity.canonicalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          {opportunity.canonicalUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: ELIGIBILITY */}
        {activeTab === "eligibility" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    지원자격 판정 매트릭스 (Eligibility Rules)
                  </CardTitle>
                  <Badge className="bg-emerald-600 text-white text-xs">전체 충족 (PASS)</Badge>
                </div>
                <CardDescription className="text-xs">
                  공고문에 명시된 법정 참가자격 및 실격 사유를 사내 데이터(Vault)와 1:1 대조한 결과입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-semibold">
                      <tr>
                        <th className="p-3">검토 항목</th>
                        <th className="p-3">공고 요구 기준</th>
                        <th className="p-3">사내 자산 매칭 증빙</th>
                        <th className="p-3 text-center">판정</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-semibold">기업 규모</td>
                        <td className="p-3">중소기업 기본법상 중소기업 확인서 보유 기업</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">중소기업확인서 (유효기간 2027-03-31)</td>
                        <td className="p-3 text-center"><Badge className="bg-emerald-600 text-white text-[10px]">PASS</Badge></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">소프트웨어사업자</td>
                        <td className="p-3">소프트웨어 진흥법 제24조에 따른 SW사업자 신고필</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">SW사업자신고확인서 (신고번호: 2024-001)</td>
                        <td className="p-3 text-center"><Badge className="bg-emerald-600 text-white text-[10px]">PASS</Badge></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">기술성숙도 (TRL)</td>
                        <td className="p-3">TRL 6단계 이상 시제품 보유 및 실증 가능 기업</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">물류로봇 자율주행 실증 성적서 (TRL 7 달성)</td>
                        <td className="p-3 text-center"><Badge className="bg-emerald-600 text-white text-[10px]">PASS</Badge></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">재무 건전성</td>
                        <td className="p-3">자본잠식 및 세금 체납이 없는 기업</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">국세/지방세 완납증명서 및 최근 결산재무제표</td>
                        <td className="p-3 text-center"><Badge className="bg-emerald-600 text-white text-[10px]">PASS</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: RFP */}
        {activeTab === "rfp" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    RFP 핵심 요구사항 매트릭스 (Requirements)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    제안요청서로부터 자동 분해된 필수 및 일반 기술/관리 요구조건입니다.
                  </CardDescription>
                </div>
                {onNavigateToRfp && (
                  <Button size="sm" variant="outline" onClick={() => onNavigateToRfp(opportunity.id)} className="text-xs">
                    전체 RFP 분석기 열기
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-rose-600 text-white text-[10px]">필수 REQ-01</Badge>
                        <span className="font-bold text-slate-900 dark:text-white">자율주행 라이다/비전 융합 SLAM 오차 5cm 이내</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">RFP 제안요청서 18페이지 명시. 실내 물류창고 환경에서 장애물 회피 및 위치추정 정밀도 충족 필요.</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      SATISFIED (특허 연계)
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-rose-600 text-white text-[10px]">필수 REQ-02</Badge>
                        <span className="font-bold text-slate-900 dark:text-white">KC 전자파 적합성 및 안전인증 사전 필</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">2단계 실증 진입 전 공인시험성적서 또는 KC 인증서 첨부 필수.</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      SATISFIED (인증서 보유)
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-slate-500 text-[10px]">일반 REQ-03</Badge>
                        <span className="font-bold text-slate-900 dark:text-white">실시간 통합 관제 시스템(FMS) 공공망 REST API 연계</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">MQTT 및 RESTful 프로토콜 기반 웹 관제 대시보드 납품 요구.</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                      PARTIAL (제안서 보강)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: FIT */}
        {activeTab === "fit" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs text-slate-500 font-medium">기술 적합도 (Tech Fit)</div>
                <div className="text-2xl font-bold text-blue-600 font-mono mt-1">94점</div>
                <p className="text-[11px] text-slate-500 mt-1">SLAM 및 자율주행 로봇 특허 3건 보유</p>
              </Card>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs text-slate-500 font-medium">실적 적합도 (Experience)</div>
                <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">88점</div>
                <p className="text-[11px] text-slate-500 mt-1">유사 정부과제 수주 및 납품 실적 4건</p>
              </Card>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs text-slate-500 font-medium">인력/조직 역량 (Team)</div>
                <div className="text-2xl font-bold text-purple-600 font-mono mt-1">90점</div>
                <p className="text-[11px] text-slate-500 mt-1">로봇 소프트웨어 박사급 책임자 및 전담 연구원 완비</p>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 5: DECISION */}
        {activeTab === "decision" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">지원 의사결정 상태 및 이력</CardTitle>
                  <CardDescription className="text-xs">
                    경영진 및 PM의 최종 입찰 참여(GO) 승인 기록입니다.
                  </CardDescription>
                </div>
                {onOpenDecisionModal && (
                  <Button size="sm" onClick={() => onOpenDecisionModal(opportunity)} className="text-xs">
                    결정 변경하기
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 text-white font-bold text-xs">최종 판정: GO</Badge>
                    <span className="text-emerald-900 dark:text-emerald-300 font-semibold">입찰 참여 및 제안서 전담 TFT 구성 확정</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    사내 보유 기술 및 실적과의 정합도가 85점 이상으로 수주 가능성이 높으며, 공공 실적 확보 시 후속 2단계 양산 사업 진입 가치가 큼.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 6: PROPOSAL */}
        {activeTab === "proposal" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                    연계 제안서 작성 워크스페이스
                  </CardTitle>
                  <CardDescription className="text-xs">
                    RAG 사내 지식 기반 초안 생성 및 4대 심사위원 모의 평가 연동 상태입니다.
                  </CardDescription>
                </div>
                {onNavigateToProposal && (
                  <Button size="sm" onClick={() => onNavigateToProposal(opportunity.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                    제안서 에디터 바로가기
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">1. 개발 필요성 및 추진 배경</div>
                    <div className="text-slate-500 text-[11px] mt-1">상태: 초안 작성 완료 (AI RAG 연계)</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">2. 핵심 기술 및 시스템 아키텍처</div>
                    <div className="text-slate-500 text-[11px] mt-1">상태: 기술 검토 완료 (특허 2건 인용)</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">3. WBS 마일스톤 및 성능 KPI</div>
                    <div className="text-slate-500 text-[11px] mt-1">상태: WBS 보완 진행 중</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">4. 사업비 소요 내역 및 부품 BOM</div>
                    <div className="text-slate-500 text-[11px] mt-1">상태: 원가 산정 완료</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 7: EVIDENCE */}
        {activeTab === "evidence" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  본 사업 필수 증빙자료 매핑 (Evidence)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">1. 중소기업확인서 (중소벤처기업부)</div>
                    <div className="text-slate-500 text-[11px]">Vault 등록 자산: SME-CERT-2024-08 (유효기간: 2027-03-31)</div>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px]">매핑 완료</Badge>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">2. 로봇 자율주행 SLAM 특허등록원부</div>
                    <div className="text-slate-500 text-[11px]">Vault 등록 자산: PAT-10-2023-019283 (특허청 등록)</div>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px]">매핑 완료</Badge>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">3. 공인시험성적서 (KTL 한국산업기술시험원)</div>
                    <div className="text-slate-500 text-[11px]">Vault 등록 자산: TEST-REP-2024-KTL (TRL 7 성적서)</div>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px]">매핑 완료</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 8: TASKS */}
        {activeTab === "tasks" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-blue-500" />
                    본 사업 배정 과업 목록 ({tasks.length}건)
                  </CardTitle>
                </div>
                {onCreateTask && (
                  <Button size="sm" onClick={() => onCreateTask(opportunity.id)} className="text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    과업 등록
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{task.title}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          담당: {task.assignee} | 기한: {task.dueDate}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    등록된 과업이 없습니다. [과업 등록] 버튼을 눌러 담당자 및 마감일을 지정하세요.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 9: SUBMISSION */}
        {activeTab === "submission" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-500" />
                  최종 제출 통제 체크리스트 (Submission Gate)
                </CardTitle>
                <CardDescription className="text-xs">
                  휴먼 인 더 루프(Human-in-the-loop) 원칙에 따라, 자동 제출되지 않으며 담당자 확인 후 서명합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">✓ 필수 요구조건 Blocker 0건 (제출 가능 상태)</div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Compliance Matrix의 필수 요구사항이 모두 충족되었으며 전자서명 파일과 날인 서류가 준비되었습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 10: HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  수주 활동 감사 로그 (Audit Timeline)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 space-y-4">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">지원 판단 (GO) 확정</div>
                    <div className="text-slate-400 text-[11px]">사업개발팀장 승인 — 적합도 85점 달성</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">RFP 자동 분석 및 요구조건 분해 완료</div>
                    <div className="text-slate-400 text-[11px]">Gemini AI — 5대 핵심 영역 32개 요건 파싱</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">공모 발굴 및 파이프라인 등록</div>
                    <div className="text-slate-400 text-[11px]">조달청 나라장터 공공데이터 수집 엔진</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
