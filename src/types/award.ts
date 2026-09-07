import { z } from "zod";
import { ProjectBudgetCategorySchema, ProjectBudgetCategory } from "./funding";

// ============================================================================
// RoboBid AI v3.0 — Phase 8 Award Workspace & Development Transition Types
// ============================================================================

export const DevelopmentProjectStatusSchema = z.enum([
  "AWARDED",                // 최종 선정 (협약 준비)
  "AGREEMENT_SIGNED",      // 협약 체결 완료 (정부지원금 1차 교부 대기/완료)
  "DEVELOPMENT_ACTIVE",    // 개발 수행 중 (1차년도/당해연도 과제 가동)
  "MIDTERM_REVIEW",        // 중간/연차 점검 단계
  "FINAL_EVALUATION",      // 최종 감리 및 평가 단계
  "COMPLETED",             // 과제 성공 판정 및 종료
  "CLOSED",                // 정산 완료 및 영구 보관
]);
export type DevelopmentProjectStatus = z.infer<typeof DevelopmentProjectStatusSchema>;

export const DevelopmentWorkCategorySchema = z.enum([
  "INTERNAL_WORK",      // 사내 연구진 자체 개발
  "EXTERNAL_WORK",      // 외주 용역 및 위탁 개발
  "PROCUREMENT",        // 부품/장비/서버 구매
  "VALIDATION",         // 공인 시험인증 및 현장 실증
]);
export type DevelopmentWorkCategory = z.infer<typeof DevelopmentWorkCategorySchema>;

export const AwardAgreementSchema = z.object({
  agreementNumber: z.string().default("AGR-2026-XXXX"),
  managingAgency: z.string().default("중소기업기술정보진흥원 (TIPA)"),
  assignedSpecialist: z.string().default("전담간사 미정"),
  agreementDate: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  midEvaluationDate: z.string().optional().nullable(),
  finalEvaluationDate: z.string().optional().nullable(),
  signed: z.boolean().default(false),
});
export type AwardAgreement = z.infer<typeof AwardAgreementSchema>;

export const CategoryBudgetAllocationSchema = z.object({
  category: ProjectBudgetCategorySchema,
  allocatedAmount: z.number().nonnegative().default(0),
  executedAmount: z.number().nonnegative().default(0),
  remainingAmount: z.number().default(0),
});
export type CategoryBudgetAllocation = z.infer<typeof CategoryBudgetAllocationSchema>;

export const AwardFundingAllocationSchema = z.object({
  totalBudget: z.number().nonnegative().default(0),
  governmentGrant: z.number().nonnegative().default(0),
  privateContribution: z.number().nonnegative().default(0),
  privateCash: z.number().nonnegative().default(0),
  privateInKind: z.number().nonnegative().default(0),
  categoryAllocations: z.array(CategoryBudgetAllocationSchema).default([]),
  maxOverheadRatePercent: z.number().default(15),
  settlementDeadlineDays: z.number().default(60),
});
export type AwardFundingAllocation = z.infer<typeof AwardFundingAllocationSchema>;

export const DevelopmentMilestoneSchema = z.object({
  id: z.string().uuid(),
  phaseNumber: z.number().int().default(1),
  name: z.string(),
  targetDate: z.string().default(""),
  deliverables: z.array(z.string()).default([]),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
});
export type DevelopmentMilestone = z.infer<typeof DevelopmentMilestoneSchema>;

export const DevelopmentWorkItemSchema = z.object({
  id: z.string().uuid(),
  wbsCode: z.string().default("WBS 1.1"),
  title: z.string(),
  workCategory: DevelopmentWorkCategorySchema,
  budgetAmount: z.number().nonnegative().default(0),
  assignedRole: z.string().default("연구원"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  deliverable: z.string().optional().nullable(),
});
export type DevelopmentWorkItem = z.infer<typeof DevelopmentWorkItemSchema>;

export const DevelopmentOutsourcingScopeSchema = z.object({
  id: z.string().uuid(),
  taskTitle: z.string(),
  budgetAmount: z.number().nonnegative().default(0),
  rfpDocId: z.string().optional().nullable(),
  specSummary: z.string().default(""),
  acceptanceCriteria: z.string().default(""),
  status: z.enum(["PLANNED", "RFP_GENERATED", "VENDOR_SOURCING", "CONTRACTED", "COMPLETED"]).default("PLANNED"),
});
export type DevelopmentOutsourcingScope = z.infer<typeof DevelopmentOutsourcingScopeSchema>;

export const DevelopmentReportingSchema = z.object({
  id: z.string().uuid(),
  reportType: z.enum(["KICKOFF", "MIDTERM", "ANNUAL", "FINAL", "SETTLEMENT"]),
  title: z.string(),
  dueDate: z.string(),
  status: z.enum(["PENDING", "SUBMITTED", "APPROVED"]).default("PENDING"),
});
export type DevelopmentReporting = z.infer<typeof DevelopmentReportingSchema>;

export const DevelopmentDeliverableSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  milestoneId: z.string().optional().nullable(),
  targetDate: z.string().default(""),
  evaluationMethod: z.string().default(""),
  isCompleted: z.boolean().default(false),
  verificationEvidence: z.string().optional().nullable(),
});
export type DevelopmentDeliverable = z.infer<typeof DevelopmentDeliverableSchema>;

export const DevelopmentProjectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  opportunityId: z.string().uuid(),
  proposalId: z.string().uuid().optional().nullable(),
  projectConceptId: z.string().uuid().optional().nullable(),
  name: z.string(),
  status: DevelopmentProjectStatusSchema.default("AWARDED"),
  agreement: AwardAgreementSchema,
  fundingAllocation: AwardFundingAllocationSchema,
  milestones: z.array(DevelopmentMilestoneSchema).default([]),
  workItems: z.array(DevelopmentWorkItemSchema).default([]),
  outsourcingScopes: z.array(DevelopmentOutsourcingScopeSchema).default([]),
  reportingSchedule: z.array(DevelopmentReportingSchema).default([]),
  deliverables: z.array(DevelopmentDeliverableSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DevelopmentProject = z.infer<typeof DevelopmentProjectSchema>;

// Transition input
export interface AwardTransitionInput {
  organizationId?: string;
  opportunityId: string;
  proposalId?: string;
  projectConceptId?: string;
  name?: string;
  awardAmount?: number;
  totalBudget?: number;
  managingAgency?: string;
  startDate?: string;
  endDate?: string;
}
