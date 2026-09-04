import { describe, it, expect } from "vitest";
import { DocumentSecurityValidator } from "@/lib/documents/security";

describe("Document Security & Magic Byte Validation", () => {
  it("should recognize PDF magic bytes (%PDF-)", () => {
    const pdfBuffer = Buffer.from("%PDF-1.7 Sample Content");
    const result = DocumentSecurityValidator.validateBuffer(pdfBuffer, "notice.pdf");
    expect(result.isValid).toBe(true);
    expect(result.detectedMimeType).toBe("application/pdf");
    expect(result.detectedExtension).toBe("pdf");
    expect(result.contentHash.length).toBe(64); // SHA-256 length
  });

  it("should recognize ZIP container magic bytes (PK..) for HWPX and DOCX", () => {
    // PK\x03\x04
    const pkBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
    const hwpxRes = DocumentSecurityValidator.validateBuffer(pkBuffer, "rfp.hwpx");
    expect(hwpxRes.isValid).toBe(true);
    expect(hwpxRes.detectedExtension).toBe("hwpx");

    const docxRes = DocumentSecurityValidator.validateBuffer(pkBuffer, "guideline.docx");
    expect(docxRes.isValid).toBe(true);
    expect(docxRes.detectedExtension).toBe("docx");
  });

  it("should recognize Legacy HWP 5.0 OLE Compound Document signature", () => {
    // D0 CF 11 E0 A1 B1 1A E1
    const hwpBuffer = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00]);
    const res = DocumentSecurityValidator.validateBuffer(hwpBuffer, "legacy.hwp");
    expect(res.isValid).toBe(true);
    expect(res.detectedExtension).toBe("hwp");
    expect(res.detectedMimeType).toBe("application/x-hwp");
  });

  it("should reject empty buffer (0 bytes)", () => {
    const empty = Buffer.alloc(0);
    const res = DocumentSecurityValidator.validateBuffer(empty, "empty.pdf");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("0바이트");
  });

  it("should sanitize untrusted text removing executable script tags", () => {
    const dirty = "공고 본문 <script>alert('injection')</script> 및 RFP 요건\u0000";
    const clean = DocumentSecurityValidator.sanitizeExtractedText(dirty);
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("\u0000");
    expect(clean).toContain("공고 본문");
    expect(clean).toContain("RFP 요건");
  });
});
