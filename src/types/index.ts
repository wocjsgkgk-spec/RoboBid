import { z } from "zod";

// ============================================================================
// Enums & Literals
// ============================================================================

export const UserRoleSchema = z.enum([
  "ADMIN",
  "BID_MANAGER",
  "TECH_REVIEWER",
  "BUSINESS_REVIEWER",
  "VIEWER",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const ProviderStatusSchema = z.enum([
  "CONNECTED",
  "DEGRADED",
  "KEY_MISSING",
  "RATE_LIMITED",
  "FAILED",
  "MANUAL_ONLY",
]);
export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;

export const DataSourceSchema = z.enum([
  "DEMO",
  "USER",
  "USER_INPUT",
  "IMPORTED",
  "API",
  "SYSTEM",
]);
export type DataSource = z.infer<typeof DataSourceSchema>;

export const OpportunityStatusSchema = z.enum([
  // v3 Early Signal & Lifecycle 수명주기
  "SIGNAL",
  "EXPECTED",
  "PRE_ANNOUNCEMENT",
  "ANNOUNCED",
  "OPEN",
  "CLOSING",
  // 14대 업무 수명주기
  "INBOX",
  "NEW",
  "REVIEWING",
  "CONDITION_CHECK",
  "GO",
  "HOLD",
  "NO_GO",
  "PROPOSAL_PREP",
  "PROPOSAL_IN_PROGRESS",
  "SUBMISSION_READY",
  "SUBMITTED",
  "AWARDED",
  "REJECTED",
  "CLOSED",
  // 호환용 레거시 별칭
  "DISCOVERED",
  "TRIAGED",
  "REVIEW",
  "PROPOSAL",
  "WITHDRAWN",
]);
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;

export const BidTypeSchema = z.enum([
  "R_AND_D",
  "DEMONSTRATION",
  "SUBSIDY_SUPPORT",
  "PROCUREMENT",
  "SERVICE",
  "LOCAL_GOV",
  "NATIONAL_PROJECT",
  "PPP",
  "OTHER",
]);
export type BidType = z.infer<typeof BidTypeSchema>;

// ============================================================================
// Core Domain Models
// ============================================================================

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  businessNumber: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const DEFAULT_ORGANIZATION_ID = "b0000000-0000-0000-0000-000000000001";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().optional().nullable(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceUrl: z.string().url(),
  status: ProviderStatusSchema,
  lastSyncedAt: z.string().optional().nullable(),
  lastErrorMessage: z.string().optional().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Provider = z.infer<typeof ProviderSchema>;

export const ProviderRunSchema = z.object({
  id: z.string().uuid(),
  providerId: z.string(),
  status: ProviderStatusSchema,
  startedAt: z.string(),
  completedAt: z.string().optional().nullable(),
  recordsFetched: z.number().int().nonnegative(),
  recordsUpserted: z.number().int().nonnegative(),
  recordsFailed: z.number().int().nonnegative(),
  errorDetail: z.string().optional().nullable(),
  createdAt: z.string(),
});
export type ProviderRun = z.infer<typeof ProviderRunSchema>;

export const AttachmentSchema = z.object({
  id: z.string().uuid(),
  opportunityId: z.string().uuid(),
  originalFileName: z.string(),
  fileExtension: z.string(),
  mimeType: z.string(),
  fileSizeBytes: z.number().nullable().optional(),
  storagePath: z.string().nullable().optional(),
  downloadUrl: z.string().nullable().optional(),
  contentHash: z.string().nullable().optional(),
  isParsed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  providerId: z.string(),
  sourceId: z.string(),
  title: z.string(),
  announcingAgency: z.string(),
  demandingAgency: z.string().optional().nullable(),
  bidType: BidTypeSchema,
  primaryDomain: z.string().default("ROBOT"),
  allocatedBudget: z.number().optional().nullable(),
  estimatedPrice: z.number().optional().nullable(),
  postedAt: z.string(),
  submissionDeadline: z.string(),
  canonicalUrl: z.string().optional().nullable(),
  status: OpportunityStatusSchema,
  fundingType: z.string().optional(),
  projectConceptId: z.string().uuid().nullable().optional(),
  isEarlySignal: z.boolean().optional(),
  signalStage: z.string().optional(),
  allowableCosts: z.record(z.any()).nullable().optional(),
  applicantStages: z.array(z.string()).optional(),
  originSource: z.string().optional(),
  dataSource: DataSourceSchema.default("DEMO").optional(),
  decisionHistory: z.array(z.any()).optional(),
  contentHash: z.string(),
  currentVersion: z.number().int().positive().default(1),
  attachments: z.array(AttachmentSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  details: z.record(z.any()).optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  createdAt: z.string(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export * from "./document";
export * from "./capability";
export * from "./eligibility";
export * from "./scoring";
export * from "./decision";
export * from "./proposal";
export * from "./compliance";
export * from "./outcome";
export * from "./project";
export * from "./pipeline";
export * from "./task";
export * from "./evidence";
export * from "./funding";
export * from "./concept";
export * from "./evaluation";
export * from "./derivation";
export * from "./award";
export {
  OutsourcingTaskCategorySchema,
  type OutsourcingTaskCategory,
  OutsourcingPackageStatusSchema,
  type OutsourcingPackageStatus,
  CapabilityGapItemSchema as OutsourcingCapabilityGapSchema,
  type CapabilityGapItem as OutsourcingCapabilityGap,
  CandidateVendorSchema,
  type CandidateVendor,
  ReceivedQuoteSchema,
  type ReceivedQuote,
  QuoteEvaluationSchema,
  type QuoteEvaluation,
  OutsourcingPackageSchema,
  type OutsourcingPackage,
  type CreateOutsourcingPackageInput,
  type ApproveOutsourcingPackageInput,
  type EvaluateQuoteInput,
} from "./outsourcing";
export * from "./early-signal";
export * from "./portfolio-advisor";

