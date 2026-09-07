import { z } from "zod";

// ============================================================================
// RoboBid AI v3.0 — Document Derivation & Secure RFP Generation Types
// ============================================================================

export const DerivationCategorySchema = z.enum([
  "GOVERNMENT",  // 정부/공공 지원사업용
  "INTERNAL",    // 사내 개발/운영용
  "OUTSOURCING", // 외주 발주/용역 관리용
  "BUSINESS",    // 사업화/투자/영업용
]);
export type DerivationCategory = z.infer<typeof DerivationCategorySchema>;

export const DocumentDerivationTypeSchema = z.enum([
  // Government (5종)
  "GOV_BUSINESS_PLAN",    // 사업계획서
  "GOV_RND_PLAN",         // 연구개발계획서
  "GOV_VALIDATION_PLAN",  // 실증계획서
  "GOV_STARTUP_PLAN",     // 창업사업계획서
  "GOV_TECH_DEV_PLAN",    // 기술개발계획서

  // Internal (5종)
  "INTERNAL_DEV_PLAN",    // 개발계획
  "INTERNAL_WBS",         // WBS
  "INTERNAL_BUDGET",      // Budget (상세 예산)
  "INTERNAL_BOM",         // BOM (부품/자재 명세서)
  "INTERNAL_RISK",        // Risk (위험 관리 계획서)

  // Outsourcing (5종)
  "OUTSOURCING_RFP",           // RFP (제안요청서)
  "OUTSOURCING_TASK_SPEC",      // 과업지시서
  "OUTSOURCING_SPEC",          // 외주 사양서
  "OUTSOURCING_ACCEPTANCE",     // Acceptance Criteria (검수 기준서)
  "OUTSOURCING_DELIVERABLES",   // Deliverables (산출물 명세서)

  // Business (4종)
  "BUSINESS_PRODUCT_INTRO",    // 제품소개
  "BUSINESS_MARKETABILITY",    // 시장성 분석
  "BUSINESS_ROI",              // ROI 분석
  "BUSINESS_SALES_STRATEGY",   // 판매전략
]);
export type DocumentDerivationType = z.infer<typeof DocumentDerivationTypeSchema>;

// 보안 등급 (보안 Redaction 분류 체계)
export const SecurityClassificationTierSchema = z.enum([
  "L0_PUBLIC",       // 일반 공개 (보안 마스킹 최대)
  "L1_PARTNER",      // 외주/파트너 공개 (NDA 필수, 사내 원가/마진 마스킹)
  "L2_CONFIDENTIAL", // 사내/정부 전담기관 제출용 (영업비밀 보호)
  "L3_SECRET_CORE",  // 사내 극비 핵심 기술 및 원가 원천 정보 (Master Spec 전용)
]);
export type SecurityClassificationTier = z.infer<typeof SecurityClassificationTierSchema>;

// 민감 기밀 정보 분류
export const SensitiveCategorySchema = z.enum([
  "INTERNAL_STRATEGY",      // 사내 전략, 미공개 로드맵
  "FULL_BUDGET",           // 전체 사업비 규모 및 마진율
  "INTERNAL_COST",         // 내부 인건비 단가, 부품별 순원가
  "CONFIDENTIAL_PIPELINE", // 비공개 데이터 파이프라인, 클라우드 인프라 내부 경로
  "NON_PUBLIC_LOGIC",      // 비공개 핵심 알고리즘 로직 및 proprietary AI 모델
  "PROTECTED_ARCHITECTURE", // 보호된 전장/하드웨어 코어 아키텍처 상세 도면
]);
export type SensitiveCategory = z.infer<typeof SensitiveCategorySchema>;

// 파생 문서의 개별 섹션 (Master Specification 추적성 포함)
export const DerivedSectionSchema = z.object({
  id: z.string().uuid(),
  sectionCode: z.string(),
  title: z.string(),
  orderIndex: z.number().int().default(0),
  // Traceability 메타데이터
  sourceSectionCode: z.string(),
  sourceSectionTitle: z.string(),
  sourceField: z.string(), // MasterSpec의 원천 필드 (e.g. 'technicalArchitecture')
  // 내용 및 보안 Redaction
  rawContent: z.string(),
  redactedContent: z.string(),
  isRedacted: z.boolean().default(false),
  redactionTier: SecurityClassificationTierSchema,
  sensitiveCategories: z.array(SensitiveCategorySchema).default([]),
  redactionReason: z.string().default(""),
});
export type DerivedSection = z.infer<typeof DerivedSectionSchema>;

// 파생 문서 전체 구조
export const DerivedDocumentSchema = z.object({
  id: z.string().uuid(),
  projectConceptId: z.string().uuid(),
  masterSpecVersion: z.string().default("v1.0"),
  category: DerivationCategorySchema,
  documentType: DocumentDerivationTypeSchema,
  title: z.string(),
  description: z.string().default(""),
  targetAudience: z.string().default(""),
  targetClassification: SecurityClassificationTierSchema,
  sections: z.array(DerivedSectionSchema).default([]),
  // 사용자 검토 및 승인 게이트 (Zero-Unauthorized-Export)
  isApproved: z.boolean().default(false),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.string().optional().nullable(),
  approvalNotes: z.string().optional().nullable(),
  // Redaction 요약
  redactionSummary: z.object({
    totalSections: z.number().int().default(0),
    redactedSections: z.number().int().default(0),
    redactedCategories: z.array(SensitiveCategorySchema).default([]),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DerivedDocument = z.infer<typeof DerivedDocumentSchema>;

// 파생 요청 인풋
export interface CreateDerivationInput {
  projectConceptId: string;
  category: DerivationCategory;
  documentType: DocumentDerivationType;
  title?: string;
  targetClassification?: SecurityClassificationTier;
  customExclusions?: SensitiveCategory[];
}

// 승인 요청 인풋
export interface ApproveDerivationInput {
  approvedBy: string;
  approvalNotes?: string;
}
