import { z } from "zod";

export const PipelineStageSchema = z.enum([
  "DISCOVERY",           // 1단계: 발견 (Inbox)
  "INITIAL_INTEREST",    // 2단계: 1차 관심
  "ELIGIBILITY_REVIEW",  // 3단계: 지원자격 검토
  "TECH_EVALUATION",     // 4단계: 기술 적합성 검토
  "BUSINESS_EVALUATION", // 5단계: 사업성 검토
  "DECIDED",             // 6단계: 의사결정 완료 (GO / HOLD / NO-GO)
]);
export type PipelineStage = z.infer<typeof PipelineStageSchema>;

export interface PipelineItem {
  id: string;
  opportunityId: string;
  stage: PipelineStage;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  assignee: string;
  notes?: string;
  eligibilityPassCount: number;
  eligibilityTotalCount: number;
  techFitScore: number;
  businessFitScore: number;
  enteredStageAt: string;
  updatedAt: string;
}

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, { label: string; desc: string; color: string }> = {
  DISCOVERY: { label: "발견 (신규)", desc: "접수 및 기초 스크리닝", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  INITIAL_INTEREST: { label: "1차 관심", desc: "사업개발팀 1차 선별", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  ELIGIBILITY_REVIEW: { label: "지원자격 검토", desc: "필수 자격 및 실격사유 대조", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  TECH_EVALUATION: { label: "기술 적합성", desc: "TRL 및 특허 역량 검토", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  BUSINESS_EVALUATION: { label: "사업성 검토", desc: "예산, 수익성 및 컨소시엄 구성", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  DECIDED: { label: "지원판단 완료", desc: "GO / HOLD / NO-GO 결정", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
};

export interface BidRoom {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  announcingAgency: string;
  budget?: number | null;
  deadline: string;
  daysRemaining: number;
  stage: PipelineStage;
  status: 'ACTIVE' | 'ARCHIVED' | 'SUBMITTED';
  leadAssignee: string;
  teamMembers: string[];
  proposalId?: string;
  proposalTitle?: string;
  proposalProgressPercent: number;
  complianceRatePercent: number;
  taskTotalCount: number;
  taskDoneCount: number;
  evidenceTotalCount: number;
  evidenceAttachedCount: number;
  criticalBlockerCount: number;
  timelineMilestones: Array<{
    date: string;
    title: string;
    completed: boolean;
  }>;
  activities: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

