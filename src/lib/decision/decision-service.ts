import { BidDecision, DecisionType } from "@/types/decision";
import { OpportunityStatus } from "@/types";

export interface RecordDecisionInput {
  opportunityId: string;
  organizationId: string;
  userId?: string;
  userName?: string;
  decision: DecisionType;
  reason: string;
  conditions?: string[];
  scoreAtDecision: number;
  evidenceSnapshot?: Record<string, any>;
}

export class DecisionService {
  /**
   * Records a formal GO / HOLD / NO-GO bid decision.
   * Updates the opportunity status and returns the created decision record.
   */
  public static recordDecision(input: RecordDecisionInput): {
    decision: BidDecision;
    newOpportunityStatus: OpportunityStatus;
  } {
    let newOpportunityStatus: OpportunityStatus = "REVIEW";

    switch (input.decision) {
      case "GO":
      case "GO_WITH_CONDITIONS":
        newOpportunityStatus = "GO";
        break;
      case "HOLD":
        newOpportunityStatus = "HOLD";
        break;
      case "NO_GO":
        newOpportunityStatus = "NO_GO";
        break;
    }

    const decisionRecord: BidDecision = {
      id: `dec-${Date.now()}`,
      opportunityId: input.opportunityId,
      organizationId: input.organizationId,
      userId: input.userId || "usr-system",
      userName: input.userName || "사업개발 담당자",
      decision: input.decision,
      reason: input.reason,
      conditions: input.conditions || [],
      scoreAtDecision: input.scoreAtDecision,
      evidenceSnapshot: input.evidenceSnapshot,
      createdAt: new Date().toISOString(),
    };

    return {
      decision: decisionRecord,
      newOpportunityStatus,
    };
  }
}
