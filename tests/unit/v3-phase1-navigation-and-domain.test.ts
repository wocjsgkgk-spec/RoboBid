import { describe, it, expect, beforeEach } from "vitest";
import { ProjectConceptStore } from "@/lib/concepts/concept-store";
import { FundingTypeSchema, ApplicantStageSchema, OpportunitySchema } from "@/types";

describe("RoboBid AI v3.0 — Phase 1 Domain & Navigation Foundation", () => {
  let store: ProjectConceptStore;

  beforeEach(() => {
    store = ProjectConceptStore.getInstance();
    store.clearAll();
  });

  it("ProjectConceptStore: 로봇 아이디어를 등록하고 조회할 수 있다", () => {
    const concept = store.create({
      name: "과수원 자율주행 방제로봇",
      summary: "과수원 험지 극복 및 자율분무 로봇 플랫폼",
      targetTrl: 5,
      estimatedBudget: 600_000_000,
      requiredTechnology: ["ROS2", "LiDAR", "스마트노즐"],
    });

    expect(concept.id).toBeDefined();
    expect(concept.name).toBe("과수원 자율주행 방제로봇");
    expect(concept.status).toBe("IDEA");
    expect(concept.targetTrl).toBe(5);
    expect(concept.requiredFunding).toBe(450_000_000); // 75%
    expect(store.count()).toBe(1);

    const retrieved = store.getById(concept.id);
    expect(retrieved?.name).toBe("과수원 자율주행 방제로봇");
  });

  it("ProjectConceptStore: 아이디어 업데이트 시 버전이 증가한다", () => {
    const concept = store.create({
      name: "물류창고 피킹 로봇",
      estimatedBudget: 300_000_000,
    });
    expect(concept.currentVersion).toBe(1);

    const updated = store.update(concept.id, {
      status: "CONCEPT",
      summary: "3D 비전 기반 비정형 물품 피킹 매니퓰레이터",
    });

    expect(updated.status).toBe("CONCEPT");
    expect(updated.currentVersion).toBe(2);
    expect(updated.summary).toContain("3D 비전");
  });

  it("FundingTypeSchema: 15대 지원사업 분류를 검증할 수 있다", () => {
    expect(FundingTypeSchema.safeParse("GOV_RND").success).toBe(true);
    expect(FundingTypeSchema.safeParse("STARTUP_GRANT").success).toBe(true);
    expect(FundingTypeSchema.safeParse("COMPETITION").success).toBe(true);
    expect(FundingTypeSchema.safeParse("PROCUREMENT").success).toBe(true);
    expect(FundingTypeSchema.safeParse("INVALID_TYPE").success).toBe(false);
  });

  it("ApplicantStageSchema: 11대 창업/기업 단계를 검증할 수 있다", () => {
    expect(ApplicantStageSchema.safeParse("PRE_STARTUP").success).toBe(true);
    expect(ApplicantStageSchema.safeParse("STARTUP_UNDER_3Y").success).toBe(true);
    expect(ApplicantStageSchema.safeParse("INNOBIZ").success).toBe(true);
    expect(ApplicantStageSchema.safeParse("UNKNOWN_STAGE").success).toBe(false);
  });

  it("OpportunitySchema: v3.0 신규 필드(fundingType, projectConceptId)가 하위호환성을 유지한다", () => {
    const legacyPayload = {
      id: "b0000000-0000-0000-0000-000000000001",
      organizationId: "b0000000-0000-0000-0000-000000000001",
      providerId: "koneps",
      sourceId: "KONEPS-12345",
      title: "2026 지능형 로봇 개발 용역",
      announcingAgency: "조달청",
      bidType: "R_AND_D",
      primaryDomain: "ROBOT",
      postedAt: new Date().toISOString(),
      submissionDeadline: new Date().toISOString(),
      status: "INBOX",
      contentHash: "hash-123",
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const parsed = OpportunitySchema.safeParse(legacyPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.fundingType ?? "GOV_RND").toBe("GOV_RND");
      expect(parsed.data.projectConceptId ?? null).toBeNull();
    }
  });
});
