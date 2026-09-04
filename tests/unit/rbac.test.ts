import { describe, it, expect } from "vitest";
import { hasPermission, canMakeDecision, canManageSettings } from "@/lib/auth/rbac";

describe("RBAC System", () => {
  it("ADMIN should have all permissions", () => {
    expect(hasPermission("ADMIN", "opportunities:read")).toBe(true);
    expect(hasPermission("ADMIN", "opportunities:write")).toBe(true);
    expect(hasPermission("ADMIN", "opportunities:delete")).toBe(true);
    expect(hasPermission("ADMIN", "decisions:make")).toBe(true);
    expect(hasPermission("ADMIN", "settings:manage")).toBe(true);
    expect(canMakeDecision("ADMIN")).toBe(true);
    expect(canManageSettings("ADMIN")).toBe(true);
  });

  it("BID_MANAGER should manage bids and make decisions, but not manage system settings", () => {
    expect(hasPermission("BID_MANAGER", "opportunities:read")).toBe(true);
    expect(hasPermission("BID_MANAGER", "opportunities:write")).toBe(true);
    expect(hasPermission("BID_MANAGER", "decisions:make")).toBe(true);
    expect(hasPermission("BID_MANAGER", "settings:manage")).toBe(false);
    expect(canMakeDecision("BID_MANAGER")).toBe(true);
    expect(canManageSettings("BID_MANAGER")).toBe(false);
  });

  it("TECH_REVIEWER should only review technical specifications", () => {
    expect(hasPermission("TECH_REVIEWER", "opportunities:read")).toBe(true);
    expect(hasPermission("TECH_REVIEWER", "review:technical")).toBe(true);
    expect(hasPermission("TECH_REVIEWER", "review:business")).toBe(false);
    expect(hasPermission("TECH_REVIEWER", "decisions:make")).toBe(false);
    expect(canMakeDecision("TECH_REVIEWER")).toBe(false);
  });

  it("BUSINESS_REVIEWER should only review business/financial specifications", () => {
    expect(hasPermission("BUSINESS_REVIEWER", "opportunities:read")).toBe(true);
    expect(hasPermission("BUSINESS_REVIEWER", "review:business")).toBe(true);
    expect(hasPermission("BUSINESS_REVIEWER", "review:technical")).toBe(false);
    expect(hasPermission("BUSINESS_REVIEWER", "decisions:make")).toBe(false);
  });

  it("VIEWER should only read opportunities and vault", () => {
    expect(hasPermission("VIEWER", "opportunities:read")).toBe(true);
    expect(hasPermission("VIEWER", "opportunities:write")).toBe(false);
    expect(hasPermission("VIEWER", "decisions:make")).toBe(false);
    expect(canMakeDecision("VIEWER")).toBe(false);
  });

  it("undefined role should have no permissions", () => {
    expect(hasPermission(undefined, "opportunities:read")).toBe(false);
    expect(canMakeDecision(undefined)).toBe(false);
  });
});
