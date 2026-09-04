import { describe, it, expect } from "vitest";
import {
  OpportunitySchema,
  ProviderSchema,
  OrganizationSchema,
  ProviderStatusSchema,
} from "@/types";

describe("Domain Schema Validation", () => {
  it("should validate a valid Opportunity payload", () => {
    const validOpportunity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      organizationId: "123e4567-e89b-12d3-a456-426614174001",
      providerId: "koneps",
      sourceId: "20260901001",
      title: "2026년 다목적 배송로봇 실증 보조사업 공고",
      announcingAgency: "한국로봇산업진흥원",
      demandingAgency: "대구광역시",
      bidType: "DEMONSTRATION",
      primaryDomain: "ROBOT",
      allocatedBudget: 500000000,
      estimatedPrice: 450000000,
      postedAt: "2026-09-01T09:00:00Z",
      submissionDeadline: "2026-09-20T18:00:00Z",
      canonicalUrl: "https://www.g2b.go.kr",
      status: "DISCOVERED",
      contentHash: "a1b2c3d4e5f67890",
      currentVersion: 1,
      createdAt: "2026-09-01T09:30:00Z",
      updatedAt: "2026-09-01T09:30:00Z",
    };

    const result = OpportunitySchema.safeParse(validOpportunity);
    expect(result.success).toBe(true);
  });

  it("should reject Opportunity with invalid status", () => {
    const invalidOpportunity = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      organizationId: "123e4567-e89b-12d3-a456-426614174001",
      providerId: "koneps",
      sourceId: "20260901001",
      title: "테스트 공고",
      announcingAgency: "조달청",
      bidType: "PROCUREMENT",
      postedAt: "2026-09-01T09:00:00Z",
      submissionDeadline: "2026-09-20T18:00:00Z",
      status: "INVALID_STATUS_STRING",
      contentHash: "hash123",
      createdAt: "2026-09-01T09:30:00Z",
      updatedAt: "2026-09-01T09:30:00Z",
    };

    const result = OpportunitySchema.safeParse(invalidOpportunity);
    expect(result.success).toBe(false);
  });

  it("should validate Provider with valid statuses", () => {
    const provider = {
      id: "koneps",
      name: "조달청 나라장터",
      sourceUrl: "https://apis.data.go.kr",
      status: "KEY_MISSING",
      isActive: true,
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    };

    const result = ProviderSchema.safeParse(provider);
    expect(result.success).toBe(true);
  });
});
