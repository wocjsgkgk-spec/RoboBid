import { z } from "zod";

// ============================================================================
// RoboBid AI v3.0 — Phase 9 Outsourcing & Expert Service v1 Types
// ============================================================================

export const OutsourcingTaskCategorySchema = z.enum([
  "MECHANICAL_FABRICATION", // 기구/가공/외장 프레임 정밀 CNC
  "ELECTRONIC_CIRCUIT_PCB",  // 전장/PCB 설계 및 SMT 하네스
  "EMBEDDED_FIRMWARE",       // 펌웨어/드라이버 외주 용역
  "CLOUD_SERVER_APP",        // 관제 서버/모바일 앱 외주
  "TESTING_CERTIFICATION",   // 공인 시험성적서 및 인증 대행
  "DESIGN_MODELING",         // 산업 디자인 및 3D 모델링
  "PATENT_REGULATORY",       // 특허 동향 분석 및 인증 규격 분석
  "OTHER_SUBCONTRACT",       // 기타 외주 제작
]);
export type OutsourcingTaskCategory = z.infer<typeof OutsourcingTaskCategorySchema>;

export const OutsourcingPackageStatusSchema = z.enum([
  "GAP_IDENTIFIED",    // 사내 역량 갭 식별 완료
  "SCOPE_DEFINED",     // 외주 과업 범위 및 SOW 정의 완료
  "RFP_GENERATED",     // 외주 RFP 및 검수기준서 생성
  "APPROVED",          // 사내 책임자 배포 승인 완료 (Approval Gate 통과)
  "SOURCING",          // 협력사 모집 및 견적 요청 중
  "EVALUATION",        // 견적서 비교 및 평가 진행 중
  "CONTRACT_READY",    // 계약 체결 준비 (인간 최종 날인 대기)
]);
export type OutsourcingPackageStatus = z.infer<typeof OutsourcingPackageStatusSchema>;

// 사내 역량 갭 분석 결과
export const CapabilityGapItemSchema = z.object({
  id: z.string().uuid(),
  requiredDiscipline: z.string(),
  reasoning: z.string(),
  isInternalAvailable: z.boolean(),
  matchedVaultAssetId: z.string().optional().nullable(),
  recommendedAction: z.enum(["INTERNAL_ASSIGN", "EXTERNAL_OUTSOURCE", "PURCHASE"]),
  estimatedBudget: z.number().default(0),
});
export type CapabilityGapItem = z.infer<typeof CapabilityGapItemSchema>;

// 후보 외주업체 풀
export const CandidateVendorSchema = z.object({
  id: z.string().uuid(),
  companyName: z.string(),
  businessRegistrationNumber: z.string().default("123-45-67890"),
  specialization: z.string(),
  representativeName: z.string().default("대표이사"),
  contactPerson: z.string().default("영업담당"),
  contactPhone: z.string().default("02-1234-5678"),
  contactEmail: z.string().default("partner@vendor.com"),
  location: z.string().default("서울/경기"),
  trustScore: z.number().min(0).max(100).default(85),
  ndaSigned: z.boolean().default(false),
  pastPerformanceCount: z.number().default(3),
});
export type CandidateVendor = z.infer<typeof CandidateVendorSchema>;

// 수신 견적서
export const ReceivedQuoteSchema = z.object({
  id: z.string().uuid(),
  vendorId: z.string().uuid(),
  vendorName: z.string(),
  quoteAmount: z.number().nonnegative(),
  leadTimeWeeks: z.number().int().positive(),
  submittedAt: z.string(),
  breakdown: z.record(z.any()).optional().nullable(),
  notes: z.string().optional().nullable(),
  complianceToSpec: z.boolean().default(true),
});
export type ReceivedQuote = z.infer<typeof ReceivedQuoteSchema>;

// 견적 평가표
export const QuoteEvaluationSchema = z.object({
  id: z.string().uuid(),
  quoteId: z.string().uuid(),
  vendorName: z.string(),
  techScore: z.number().min(0).max(40).default(35),      // 기술 및 품질 40점
  priceScore: z.number().min(0).max(30).default(25),     // 견적 가격 30점
  scheduleScore: z.number().min(0).max(20).default(18),  // 납기 실행력 20점
  managementScore: z.number().min(0).max(10).default(8), // 신뢰도 및 사후관리 10점
  totalScore: z.number().min(0).max(100).default(86),
  evaluationNotes: z.string().default(""),
  evaluator: z.string().default(""),
  evaluatedAt: z.string(),
});
export type QuoteEvaluation = z.infer<typeof QuoteEvaluationSchema>;

// 외주 발주 패키지 (Outsourcing Package)
export const OutsourcingPackageSchema = z.object({
  id: z.string().uuid(),
  projectConceptId: z.string().uuid(),
  developmentProjectId: z.string().uuid().optional().nullable(),
  taskCategory: OutsourcingTaskCategorySchema,
  taskTitle: z.string(),
  description: z.string().default(""),
  sowContent: z.string().default(""),
  rfpDocId: z.string().optional().nullable(),
  acceptanceCriteria: z.string().default(""),
  deliverables: z.array(z.string()).default([]),
  budgetCap: z.number().nonnegative().default(0),
  // 인간 승인 게이트 (외주 발주 및 견적 배포 전 필수)
  isApproved: z.boolean().default(false),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.string().optional().nullable(),
  approvalNotes: z.string().optional().nullable(),
  // 후속 구조 (No auto-contracting)
  candidateVendors: z.array(CandidateVendorSchema).default([]),
  receivedQuotes: z.array(ReceivedQuoteSchema).default([]),
  quoteEvaluations: z.array(QuoteEvaluationSchema).default([]),
  status: OutsourcingPackageStatusSchema.default("SCOPE_DEFINED"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type OutsourcingPackage = z.infer<typeof OutsourcingPackageSchema>;

// Input interfaces
export interface CreateOutsourcingPackageInput {
  projectConceptId: string;
  developmentProjectId?: string;
  taskCategory: OutsourcingTaskCategory;
  taskTitle: string;
  description?: string;
  sowContent?: string;
  acceptanceCriteria?: string;
  deliverables?: string[];
  budgetCap?: number;
  rfpDocId?: string;
}

export interface ApproveOutsourcingPackageInput {
  approvedBy: string;
  approvalNotes?: string;
}

export interface EvaluateQuoteInput {
  quoteId: string;
  techScore: number;
  priceScore: number;
  scheduleScore: number;
  managementScore: number;
  evaluationNotes?: string;
  evaluator: string;
}
