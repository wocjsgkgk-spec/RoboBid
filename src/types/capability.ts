import { z } from "zod";

export const CapabilityTypeSchema = z.enum([
  "COMPANY_PROFILE",
  "TECHNOLOGY",
  "PRODUCT",
  "PATENT",
  "CERTIFICATION",
  "PROJECT_HISTORY",
  "EMPLOYEE_SKILL",
  "EQUIPMENT",
  "FINANCIAL_PROFILE",
  "PARTNER",
]);
export type CapabilityType = z.infer<typeof CapabilityTypeSchema>;

export const VerificationStatusSchema = z.enum([
  "VERIFIED",
  "UNVERIFIED",
  "EXPIRED",
  "PENDING_REVIEW",
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const ConfidentialityLevelSchema = z.enum([
  "INTERNAL",
  "CONFIDENTIAL",
  "RESTRICTED",
]);
export type ConfidentialityLevel = z.infer<typeof ConfidentialityLevelSchema>;

export interface CompanyProfileMetadata {
  establishedDate: string; // YYYY-MM-DD
  headquartersRegion: string; // e.g. "대구광역시", "서울특별시", "경기도"
  companyScale: "STARTUP" | "SME" | "MIDDLE_STANDING" | "LARGE"; // 스타트업, 중소기업, 중견, 대기업
  corporateRegistrationNumber?: string;
  ceoName?: string;
}

export interface TechnologyMetadata {
  trlLevel: number; // 1 to 9
  domain: string; // e.g. "ROBOT_ROS2", "EMBEDDED", "VISION"
  coreKeywords: string[];
}

export interface CertificationMetadata {
  issuingAuthority: string;
  certificateNumber: string;
  isRenewable: boolean;
}

export interface FinancialProfileMetadata {
  fiscalYear: number;
  revenueKrw: number;
  operatingProfitKrw: number;
  capitalImpairment: boolean; // 자본잠식 여부
  debtRatioPercent?: number; // 부채비율
}

export const CapabilitySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  type: CapabilityTypeSchema,
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  verificationStatus: VerificationStatusSchema.default("UNVERIFIED"),
  confidentiality: ConfidentialityLevelSchema.default("CONFIDENTIAL"),
  evidenceStoragePath: z.string().optional().nullable(),
  evidenceFileName: z.string().optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Capability = z.infer<typeof CapabilitySchema>;
export type CapabilityRecord = Capability;
