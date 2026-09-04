import { describe, it, expect } from "vitest";
import { DocumentIngestionPipeline } from "@/lib/documents/pipeline";

describe("Document Pipeline Fallback and Error States", () => {
  it("should safely transition legacy HWP 5.0 to REVIEW_REQUIRED without crashing", async () => {
    // Legacy HWP OLE compound document magic header
    const legacyHwpHeader = Buffer.from([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00,
    ]);

    const result = await DocumentIngestionPipeline.process(legacyHwpHeader, "notice.hwp");
    expect(result.parseStatus).toBe("REVIEW_REQUIRED");
    expect(result.detectedMimeType).toBe("application/x-hwp");
    expect(result.errorMessage).toContain("레거시 HWP");
  });

  it("should handle corrupted or unknown binary as FAILED", async () => {
    const corruptBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03]); // invalid magic
    const result = await DocumentIngestionPipeline.process(corruptBuffer, "corrupt.bin");
    expect(result.parseStatus).toBe("FAILED");
    expect(result.errorMessage).toBeDefined();
  });
});
