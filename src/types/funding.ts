import { z } from "zod";

// ============================================================================
// RoboBid AI v3.0 — Funding Intelligence & Opportunity Types
// ============================================================================

export const FundingTypeSchema = z.enum([
  "GOV_RND",           // 정부 R&D
  "LOCAL_RND",         // 지자체 R&D
  "STARTUP_GRANT",     // 창업지원금
  "PROTOTYPE_GRANT",   // 시제품 제작지원
  "VALIDATION_GRANT",  // 실증사업
  "COMMERCIALIZATION", // 사업화 지원
  "COMPETITION",       // 경진대회
  "CONTEST",           // 공모전
  "PRIZE",             // 상금사업
  "EXHIBITION",        // 전시지원
  "EXPORT",            // 수출지원
  "SALES_SUPPORT",     // 판로개척지원
  "PROCUREMENT",       // 공공조달 구매
  "SERVICE_CONTRACT",  // 공공용역
  "OTHER",             // 기타
]);
export type FundingType = z.infer<typeof FundingTypeSchema>;

export const ApplicantStageSchema = z.enum([
  "PRE_STARTUP",               // 예비창업자
  "STARTUP_UNDER_3Y",          // 초기창업 (3년 미만)
  "STARTUP_UNDER_7Y",          // 도약창업 (7년 미만)
  "SME",                       // 중소기업
  "VENTURE",                   // 벤처기업인증
  "INNOBIZ",                   // 기술혁신형(이노비즈)
  "CORPORATE_RESEARCH_CENTER", // 기업부설연구소 보유
  "LOCAL_COMPANY",             // 지역소재기업
  "RESEARCH_ORG",              // 연구기관/대학
  "CONSORTIUM",                // 산학연 컨소시엄
  "OTHER",                     // 기타
]);
export type ApplicantStage = z.infer<typeof ApplicantStageSchema>;

export const EarlySignalStageSchema = z.enum([
  "SIGNAL",            // 정책/시행계획 신호
  "EXPECTED",          // 과거 주기 기반 예상
  "PRE_ANNOUNCEMENT",  // 사전예고/수요조사
  "ANNOUNCED",         // 공고 게시
  "OPEN",              // 접수 개시
  "CLOSING",           // 마감 임박 (D-7 이내)
  "CLOSED",            // 접수 마감
]);
export type EarlySignalStage = z.infer<typeof EarlySignalStageSchema>;

export const ApplicationDecisionSchema = z.enum([
  "APPLY",                  // 지원 결정
  "APPLY_WITH_CONDITIONS",  // 조건부 지원 (컨소시엄 구성 등)
  "HOLD",                   // 보류 (추가 검토 필요)
  "PASS",                   // 미지원 (Pass)
]);
export type ApplicationDecision = z.infer<typeof ApplicationDecisionSchema>;

export const FundingPortfolioStatusSchema = z.enum([
  "CANDIDATE",    // 검토 후보
  "PLANNED",      // 지원 계획 수립
  "APPLIED",      // 지원서 제출 완료
  "UNDER_REVIEW", // 심사 진행 중
  "AWARDED",      // 최종 선정 (수주/자금확보)
  "REJECTED",     // 탈락 (불선정)
  "CANCELLED",    // 지원 취소
]);
export type FundingPortfolioStatus = z.infer<typeof FundingPortfolioStatusSchema>;

export const FundingConflictRiskSchema = z.enum([
  "SAFE",               // 안전 (중복 우려 없음)
  "POTENTIAL_CONFLICT", // 중복 가능성 주의 (동일비목 등)
  "REVIEW_REQUIRED",    // 전담기관 사전 문의 필요
  "PROHIBITED",         // 규정상 명백한 중복수혜 불가
]);
export type FundingConflictRisk = z.infer<typeof FundingConflictRiskSchema>;

// ============================================================================
// Phase 5: Project Budget Categories (10 Essential Disciplines)
// ============================================================================

export const ProjectBudgetCategorySchema = z.enum([
  "LABOR",         // 인건비
  "MATERIALS",     // 재료비
  "PARTS",         // 부품비
  "EQUIPMENT",     // 장비비
  "OUTSOURCING",   // 외주비
  "VALIDATION",    // 실증비
  "SW_SERVER",     // SW/Server
  "MARKETING",     // 마케팅
  "CERTIFICATION", // 인증
  "OTHER",         // 기타
]);
export type ProjectBudgetCategory = z.infer<typeof ProjectBudgetCategorySchema>;

export const PROJECT_BUDGET_CATEGORY_LABELS: Record<ProjectBudgetCategory, string> = {
  LABOR: "인건비",
  MATERIALS: "재료비",
  PARTS: "부품비",
  EQUIPMENT: "장비비",
  OUTSOURCING: "외주비",
  VALIDATION: "실증비",
  SW_SERVER: "SW/Server",
  MARKETING: "마케팅",
  CERTIFICATION: "인증",
  OTHER: "기타",
};

export type AllowableCostRuleStatus = "ALLOWED" | "DISALLOWED" | "CAPPED";

export interface AllowableCostRule {
  category: ProjectBudgetCategory;
  status: AllowableCostRuleStatus;
  capPercentage?: number; // 0.0 ~ 1.0 (예: 최대 30%)
  capAmount?: number;     // 절대 상한액 (원)
  note?: string;
}

export interface OpportunityFundingTerms {
  maxGrantAmount: number;
  selfFundingMinRatio: number; // 0.0 ~ 1.0 (예: 0.2 = 자부담 20%)
  cashRatio?: number;          // 자부담 중 현금 비율 (0.0 ~ 1.0)
  costRules: Partial<Record<ProjectBudgetCategory, AllowableCostRule>>;
  specialConditions?: string[];
}

// ============================================================================
// Phase 5: Funding Fit Output Structure
// ============================================================================

export interface FundingFitCategoryCoverage {
  category: ProjectBudgetCategory;
  categoryLabel: string;
  requestedCost: number;       // 프로젝트 요청 비용
  isAllowed: boolean;          // 허용 비목 여부
  eligibleCost: number;        // 인정 대상 비용
  fundedGrantAmount: number;   // 실제 충당되는 지원금
  coverageRatio: number;       // 해당 비목 커버리지 (%)
  note: string;                // 비고 (상한 규정 적용 등)
}

export interface FundingFitResult {
  project_cost: number;                    // 총 개발비
  grant_amount: number;                    // 지원 가능액 (정부지원금)
  self_funding: number;                    // 자부담액 (민간부담금)
  eligible_cost: number;                   // 지원 인정 가능 비용 합계
  coverage: number;                        // 전체 커버리지 (%)
  coverage_by_category: FundingFitCategoryCoverage[]; // 비목별 상세 커버리지
  unfunded_gap: number;                    // 미지원 비용 (프로젝트 비용 - 지원금)
  conditions: string[];                    // 지원 및 협약 조건
}

// ============================================================================
// Phase 5: Multi-funding Portfolio Structure
// ============================================================================

export interface FundingPortfolioItem {
  id: string;
  projectConceptId: string;
  opportunityId: string;
  opportunityTitle: string;
  announcingAgency: string;
  fundingType: FundingType;
  status: FundingPortfolioStatus;
  targetGrantAmount: number;
  awardedGrantAmount: number;
  selfFundingAmount: number;
  period: {
    startDate: string;
    endDate: string;
  };
  allocatedCategories: Partial<Record<ProjectBudgetCategory, number>>;
  assetsIncluded?: string[];
  partsIncluded?: string[];
  personnelIncluded?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundingPortfolioSummary {
  targetCost: number;       // Target Cost (프로젝트 총 목표 개발비)
  awarded: number;          // Awarded (확보 완료 금액)
  underReview: number;      // Under Review (심사 중 금액)
  planned: number;          // Planned (계획 수립 금액)
  candidate: number;        // Candidate (후보 금액)
  gap: number;              // Gap (부족 금액: targetCost - awarded)
  coverage: number;         // Coverage (확보율: awarded / targetCost * 100)
  pipelineTotal: number;    // 파이프라인 합계 (awarded + underReview + planned)
  items: FundingPortfolioItem[];
}

// ============================================================================
// Phase 5: Conflict Checker Types
// ============================================================================

export type ConflictCheckType =
  | "SAME_PROJECT"
  | "SAME_PERIOD"
  | "SAME_COST_CATEGORY"
  | "SAME_ASSET"
  | "SAME_PART"
  | "SAME_LABOR"
  | "RESTRICTION_RULE";

export interface ConflictFinding {
  checkType: ConflictCheckType;
  riskLevel: FundingConflictRisk;
  title: string;
  description: string;
  conflictingOpportunityTitles: string[];
  recommendation: string;
}

export interface FundingConflictReport {
  overallRisk: FundingConflictRisk;
  findings: ConflictFinding[];
  safeCount: number;
  warningCount: number;
  prohibitedCount: number;
  disclaimer: string;
}

