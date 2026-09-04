import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

describe("Utility Functions", () => {
  it("cn should merge class names correctly", () => {
    expect(cn("px-2 py-1", "bg-primary")).toBe("px-2 py-1 bg-primary");
    expect(cn("px-2", { "px-4": true })).toBe("px-4");
  });

  it("formatCurrency should format KRW currency", () => {
    expect(formatCurrency(null)).toBe("-");
    expect(formatCurrency(undefined)).toBe("-");
    expect(formatCurrency(1000000)).toContain("1,000,000");
  });

  it("formatDate should handle empty or valid date strings", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("")).toBe("-");
    const formatted = formatDate("2026-09-04T10:00:00Z");
    expect(formatted).not.toBe("-");
  });
});
