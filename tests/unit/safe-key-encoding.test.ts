import { describe, it, expect } from "vitest";
import { KonepsAdapter } from "../../src/lib/providers/koneps-adapter";

describe("Safe Key Encoding", () => {
  const adapter = new KonepsAdapter();

  it("should safely encode plain decoded key containing special characters", () => {
    const rawKey = "sample+Key/with=special==";
    const encoded = adapter.safeEncodeServiceKey(rawKey);

    expect(encoded).toBe("sample%2BKey%2Fwith%3Dspecial%3D%3D");
  });

  it("should not double-encode already URL-encoded service keys", () => {
    const preEncodedKey = "sample%2BKey%2Fwith%3Dspecial%3D%3D";
    const result = adapter.safeEncodeServiceKey(preEncodedKey);

    // Should NOT become sample%252BKey...
    expect(result).toBe("sample%2BKey%2Fwith%3Dspecial%3D%3D");
  });

  it("should handle empty or null keys gracefully", () => {
    expect(adapter.safeEncodeServiceKey("")).toBe("");
  });
});
