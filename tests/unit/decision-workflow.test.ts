import { describe, it, expect } from "vitest";
import { DecisionService } from "@/lib/decision/decision-service";

describe("Bid Decision Workflow & Status Transition", () => {
  it("should record a GO decision and transition status to GO", () => {
    const { decision, newOpportunityStatus } = DecisionService.recordDecision({
      opportunityId: "opp-100",
      organizationId: "org-1",
      userId: "user-pm-1",
      userName: "김사업 PM",
      decision: "GO",
      reason: "핵심 기술 일치 및 예산 규모 적정",
      scoreAtDecision: 88,
    });

    expect(decision.decision).toBe("GO");
    expect(decision.userName).toBe("김사업 PM");
    expect(decision.scoreAtDecision).toBe(88);
    expect(newOpportunityStatus).toBe("GO");
  });

  it("should record GO_WITH_CONDITIONS with specific actionable conditions", () => {
    const { decision, newOpportunityStatus } = DecisionService.recordDecision({
      opportunityId: "opp-200",
      organizationId: "org-1",
      decision: "GO_WITH_CONDITIONS",
      reason: "기술 적합성 높으나 일정 촉박하여 보완 조건 부여",
      conditions: [
        "D-10 이전 기술 초안 완료",
        "인증 최신본 갱신 확인",
      ],
      scoreAtDecision: 74,
    });

    expect(decision.decision).toBe("GO_WITH_CONDITIONS");
    expect(decision.conditions.length).toBe(2);
    expect(decision.conditions[0]).toBe("D-10 이전 기술 초안 완료");
    expect(newOpportunityStatus).toBe("GO");
  });

  it("should record NO_GO decision and transition status to NO_GO", () => {
    const { decision, newOpportunityStatus } = DecisionService.recordDecision({
      opportunityId: "opp-300",
      organizationId: "org-1",
      decision: "NO_GO",
      reason: "필수 인증 부재 및 자부담 비율 과다",
      scoreAtDecision: 42,
    });

    expect(decision.decision).toBe("NO_GO");
    expect(newOpportunityStatus).toBe("NO_GO");
  });
});
