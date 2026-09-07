import { z } from "zod";

export const DecisionTypeSchema = z.enum([
  "GO",
  "GO_WITH_CONDITIONS",
  "HOLD",
  "NO_GO",
  "APPLY",
  "APPLY_WITH_CONDITIONS",
  "PASS",
]);
export type DecisionType = z.infer<typeof DecisionTypeSchema>;

export interface BidDecision {
  id: string;
  opportunityId: string;
  organizationId: string;
  userId?: string;
  userName?: string;
  decision: DecisionType;
  reason: string;
  conditions: string[]; // e.g. ["D-10 이전 기술초안 완료", "인증 최신본 제출"]
  scoreAtDecision: number;
  evidenceSnapshot?: Record<string, any>;
  createdAt: string;
}

export type DecisionRecord = BidDecision;
