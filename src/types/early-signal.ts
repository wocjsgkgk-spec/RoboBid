import { z } from "zod";

// 공고 전 단계 신호 출처 유형
export const SignalSourceTypeSchema = z.enum([
  "BUSINESS_PLAN",        // 사업시행계획
  "BUDGET_ANNOUNCEMENT",  // 예산 발표 / 국회 심의안
  "DEMAND_SURVEY",        // 정부/전담기관 기술수요조사
  "PRE_NOTICE",           // 사업사전안내
  "UPCOMING_NOTICE",      // 공모예고
  "BRIEFING_SESSION",     // 사업설명회 개최 안내
  "RFP_PRE_NOTICE",       // 제안요청서(RFP) 사전의견수렴
]);
export type SignalSourceType = z.infer<typeof SignalSourceTypeSchema>;

// 신호 상태 수명주기
export const SignalStatusSchema = z.enum([
  "SIGNAL",                    // 초기 미약 신호 감지
  "EXPECTED",                  // 공고 시기/예산 예측 단계
  "PRE_ANNOUNCEMENT",          // 공식 사전예고 단계
  "CONVERTED_TO_OPPORTUNITY",  // 정식 공고 전환 완료
  "EXPIRED",                   // 미공고 종료/취소
]);
export type SignalStatus = z.infer<typeof SignalStatusSchema>;

// 예측 신뢰도 수준
export const ForecastConfidenceSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type ForecastConfidence = z.infer<typeof ForecastConfidenceSchema>;

// 과거 반복 공고 기반 예측 모델 (참고용 명시 불변식 강제)
export const AnnouncementForecastSchema = z.object({
  expectedPeriod: z.string(), // e.g. "2027년 2~3월"
  expectedBudget: z.number().default(0), // 예상 지원규모 (KRW)
  confidence: ForecastConfidenceSchema.default("MEDIUM"),
  basisYears: z.number().default(3), // 분석 기준 과거 년수
  historicalDates: z.array(z.string()).default([]), // 과거 공고일 이력
  rationale: z.string(), // "최근 3년 유사시기 반복 및 2026 부처 시행계획 반영"
  isForecast: z.literal(true).default(true), // 반드시 예측 플래그 true
  isOfficial: z.literal(false).default(false), // 절대 확정 공고가 아님을 강제
});
export type AnnouncementForecast = z.infer<typeof AnnouncementForecastSchema>;

// Early Signal 엔티티
export const EarlySignalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  agency: z.string().min(1),
  sourceType: SignalSourceTypeSchema,
  status: SignalStatusSchema.default("SIGNAL"),
  announcementForecast: AnnouncementForecastSchema,
  targetDomain: z.string().default("ROBOT"),
  matchingConceptIds: z.array(z.string()).default([]),
  keyRequirementsSnippet: z.string().default(""),
  sourceUrl: z.string().default(""),
  detectedAt: z.string(),
  convertedOpportunityId: z.string().nullable().default(null),
  notes: z.string().optional(),
});
export type EarlySignal = z.infer<typeof EarlySignalSchema>;

export interface CreateEarlySignalInput {
  title: string;
  agency: string;
  sourceType: SignalSourceType;
  expectedPeriod: string;
  expectedBudget?: number;
  confidence?: ForecastConfidence;
  basisYears?: number;
  historicalDates?: string[];
  rationale?: string;
  targetDomain?: string;
  matchingConceptIds?: string[];
  keyRequirementsSnippet?: string;
  sourceUrl?: string;
  notes?: string;
}

export interface ConvertSignalToOpportunityInput {
  signalId: string;
  officialAnnouncementNumber: string;
  officialTitle?: string;
  submissionDeadline: string;
  allocatedBudget?: number;
}
