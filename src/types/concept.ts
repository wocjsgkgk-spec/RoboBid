import { z } from "zod";

// ============================================================================
// RoboBid AI v3.0 — Project Concept & Master Specification Types
// ============================================================================

export const ConceptStatusSchema = z.enum([
  "IDEA",              // 한 줄 아이디어
  "CONCEPT",           // 문제/타겟정의 완료
  "SPECIFICATION",     // 기술사양 구체화 중
  "FUNDING_READY",     // 자금 지원 준비 완료
  "DEVELOPMENT_READY", // 선정 후 개발 착수 준비
  "ACTIVE",            // 개발 실행 중
  "ARCHIVED",          // 보관/완료
]);
export type ConceptStatus = z.infer<typeof ConceptStatusSchema>;

export const ProjectConceptSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1, "프로젝트 명칭을 입력해주세요."),
  summary: z.string().default(""),
  problemStatement: z.string().optional().nullable(),
  targetUser: z.string().optional().nullable(),
  productConcept: z.string().optional().nullable(),
  technicalConcept: z.string().optional().nullable(),
  targetTrl: z.number().int().min(1).max(9).default(4),
  requiredTechnology: z.array(z.string()).default([]),
  estimatedBudget: z.number().nonnegative().default(0),
  requiredFunding: z.number().nonnegative().default(0),
  marketAnalysis: z.string().optional().nullable(),
  salesModel: z.string().optional().nullable(),
  owner: z.string().default("사업개발팀"),
  status: ConceptStatusSchema.default("IDEA"),
  currentVersion: z.number().int().positive().default(1),
  linkedVaultAssetIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ProjectConcept = z.infer<typeof ProjectConceptSchema>;

export interface CreateProjectConceptInput {
  name: string;
  summary?: string;
  problemStatement?: string;
  productConcept?: string;
  technicalConcept?: string;
  targetTrl?: number;
  requiredTechnology?: string[];
  estimatedBudget?: number;
  requiredFunding?: number;
  linkedVaultAssetIds?: string[];
}

export const MasterSpecificationSchema = z.object({
  id: z.string().uuid(),
  projectConceptId: z.string().uuid(),
  version: z.string().default("v1.0"),
  architectureSummary: z.string().default(""),
  technicalArchitecture: z.string().default(""),
  hwSwSpecifications: z.record(z.any()).default({}),
  sensorsAndComms: z.array(z.string()).default([]),
  aiModelSpec: z.string().default(""),
  targetEnvironment: z.string().default("실내외 자율주행 및 작업환경"),
  kpis: z.array(z.object({
    metricName: z.string(),
    targetValue: z.string(),
    evaluationMethod: z.string(),
  })).default([]),
  wbsSummary: z.array(z.string()).default([]),
  bomEstimate: z.array(z.object({
    partName: z.string(),
    unitCost: z.number(),
    quantity: z.number(),
    vendor: z.string().optional(),
  })).default([]),
  budgetBreakdown: z.object({
    directCost: z.number().default(0),
    laborCost: z.number().default(0),
    outsourcingCost: z.number().default(0),
    indirectCost: z.number().default(0),
  }).default({
    directCost: 0,
    laborCost: 0,
    outsourcingCost: 0,
    indirectCost: 0,
  }),
  rolesAndResponsibilities: z.array(z.object({
    role: z.string(),
    responsibility: z.string(),
    headCount: z.number().default(1),
  })).default([]),
  validationPlan: z.string().default(""),
  outsourcingPlan: z.string().default(""),
  businessModel: z.string().default(""),
  salesStrategy: z.string().default(""),
  securityClassification: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL"]).default("INTERNAL"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MasterSpecification = z.infer<typeof MasterSpecificationSchema>;

// Versioning and History
export interface MasterSpecVersionRecord {
  id: string;
  projectConceptId: string;
  version: string;
  changeSummary: string;
  spec: MasterSpecification;
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
}

// Progressive AI Builder Stages & Diffs
export type ProgressiveBuilderStep =
  | "PROBLEM"
  | "PRODUCT"
  | "TECHNICAL"
  | "TRL_KPI"
  | "WBS_BUDGET"
  | "BOM"
  | "FUNDING_NEED"
  | "VALIDATION"
  | "OUTSOURCING"
  | "MARKET"
  | "MASTER_SPEC";

export interface FieldDiff {
  field: string;
  label: string;
  current: string;
  suggested: string;
  reasoning: string;
}

export interface BuilderStepSuggestion {
  step: ProgressiveBuilderStep;
  stepTitle: string;
  diffs: FieldDiff[];
  summary: string;
}
