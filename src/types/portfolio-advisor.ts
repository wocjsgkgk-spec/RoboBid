import { z } from "zod";

export const PortfolioAdvisorRecommendationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    "GAP_FILLER_OPPORTUNITY",
    "EARLY_SIGNAL_PREP",
    "AGENCY_DIVERSIFICATION",
    "CASH_MATCH_ALERT",
    "TIMELINE_BALANCE",
  ]),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  title: z.string(),
  description: z.string(),
  actionableLink: z.string(),
  impactAmount: z.number().default(0),
});
export type PortfolioAdvisorRecommendation = z.infer<typeof PortfolioAdvisorRecommendationSchema>;

export const PortfolioGapAnalysisSchema = z.object({
  targetAnnualGrant: z.number(),         // 연간 목표 정부지원금 (e.g. 1,500,000,000)
  awardedTotalGrant: z.number(),         // 현재 선정/확정 정부지원금
  inFlightTotalGrant: z.number(),        // 제안 진행 중/심의 중 지원금
  gapAmount: z.number(),                 // 목표 대비 부족분 (Gap)
  achievementRatePercent: z.number(),    // 달성률 (%)
  inFlightPotentialPercent: z.number(),  // 심의 중 포함 잠재 달성률 (%)
  dominantAgency: z.string().nullable(), // 편중된 주관부처/전담기관
  agencyConcentrationPercent: z.number(),// 주관부처 집중도 (%)
  recommendations: z.array(PortfolioAdvisorRecommendationSchema),
  generatedAt: z.string(),
});
export type PortfolioGapAnalysis = z.infer<typeof PortfolioGapAnalysisSchema>;
