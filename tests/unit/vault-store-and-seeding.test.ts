import { describe, it, expect, beforeEach } from "vitest";
import { vaultStore } from "../../src/lib/vault/vault-store";
import { Capability } from "../../src/types/capability";

describe("VaultStore and Capability Seeding", () => {
  beforeEach(() => {
    vaultStore.seedDefault();
  });

  it("should initialize with standard capability seed assets (13 items)", () => {
    const list = vaultStore.getAll();
    expect(list.length).toBe(13);

    // Verify key assets exist
    const patents = vaultStore.getByType("PATENT");
    expect(patents.length).toBe(3);

    const certs = vaultStore.getByType("CERTIFICATION");
    expect(certs.length).toBe(3);

    const projects = vaultStore.getByType("PROJECT_HISTORY");
    expect(projects.length).toBe(3);
  });

  it("should support adding, updating and deleting capability assets", () => {
    const testCap: Capability = {
      id: "cap-custom-01",
      organizationId: "123e4567-e89b-12d3-a456-426614174000",
      type: "TECHNOLOGY",
      title: "맞춤형 AI 경량화 엔진",
      verificationStatus: "VERIFIED",
      confidentiality: "INTERNAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vaultStore.save(testCap);
    expect(vaultStore.getById("cap-custom-01")).toBeDefined();
    expect(vaultStore.count()).toBe(14);

    const deleted = vaultStore.delete("cap-custom-01");
    expect(deleted).toBe(true);
    expect(vaultStore.getById("cap-custom-01")).toBeUndefined();
    expect(vaultStore.count()).toBe(13);
  });

  it("should enrich assets with expiration alerts", () => {
    // Add an expiring soon capability
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 15); // Expiring in 15 days

    const expiringCap: Capability = {
      id: "cap-expiring-test",
      organizationId: "123e4567-e89b-12d3-a456-426614174000",
      type: "CERTIFICATION",
      title: "임박한 인증서",
      validUntil: expiryDate.toISOString().split("T")[0],
      verificationStatus: "VERIFIED",
      confidentiality: "CONFIDENTIAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vaultStore.save(expiringCap);
    const enriched = vaultStore.getAllEnriched();
    const item = enriched.find((c) => c.id === "cap-expiring-test");

    expect(item).toBeDefined();
    expect(item?.isExpiringSoon).toBe(true);
    expect(item?.isExpired).toBe(false);
    expect(item?.daysRemaining).toBeGreaterThan(0);
    expect(item?.daysRemaining).toBeLessThanOrEqual(16);
  });
});
