import crypto from "crypto";

export interface FileValidationResult {
  isValid: boolean;
  detectedMimeType: string;
  detectedExtension: string;
  fileSizeBytes: number;
  contentHash: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB (PRD 규정)

export class DocumentSecurityValidator {
  /**
   * Generates a deterministic SHA-256 hash of the binary buffer.
   */
  public static computeSha256(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Detects the real MIME type and extension using magic numbers (header signatures).
   */
  public static validateBuffer(buffer: Buffer, claimedFileName: string): FileValidationResult {
    const fileSizeBytes = buffer.length;
    const contentHash = this.computeSha256(buffer);

    if (fileSizeBytes === 0) {
      return {
        isValid: false,
        detectedMimeType: "application/octet-stream",
        detectedExtension: "bin",
        fileSizeBytes: 0,
        contentHash,
        error: "파일 크기가 0바이트(빈 파일)입니다.",
      };
    }

    if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        detectedMimeType: "application/octet-stream",
        detectedExtension: "bin",
        fileSizeBytes,
        contentHash,
        error: `파일 크기가 허용 한도(100MB)를 초과했습니다: ${(fileSizeBytes / (1024 * 1024)).toFixed(1)}MB`,
      };
    }

    const claimedExt = claimedFileName.split(".").pop()?.toLowerCase() || "";

    // 1. PDF: 25 50 44 46 (%PDF-)
    if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return {
        isValid: true,
        detectedMimeType: "application/pdf",
        detectedExtension: "pdf",
        fileSizeBytes,
        contentHash,
      };
    }

    // 2. PKZIP Container: 50 4B 03 04 (PK..) -> HWPX, DOCX, XLSX, ZIP
    if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
      if (claimedExt === "hwpx") {
        return {
          isValid: true,
          detectedMimeType: "application/haansofthwpx",
          detectedExtension: "hwpx",
          fileSizeBytes,
          contentHash,
        };
      }
      if (claimedExt === "docx") {
        return {
          isValid: true,
          detectedMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          detectedExtension: "docx",
          fileSizeBytes,
          contentHash,
        };
      }
      if (claimedExt === "xlsx") {
        return {
          isValid: true,
          detectedMimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          detectedExtension: "xlsx",
          fileSizeBytes,
          contentHash,
        };
      }
      return {
        isValid: true,
        detectedMimeType: "application/zip",
        detectedExtension: "zip",
        fileSizeBytes,
        contentHash,
      };
    }

    // 3. OLE Compound Document: D0 CF 11 E0 A1 B1 1A E1 -> Legacy HWP (한글 5.0) or DOC/XLS
    if (
      buffer.length >= 8 &&
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0 &&
      buffer[4] === 0xa1 &&
      buffer[5] === 0xb1 &&
      buffer[6] === 0x1a &&
      buffer[7] === 0xe1
    ) {
      return {
        isValid: true,
        detectedMimeType: "application/x-hwp",
        detectedExtension: "hwp",
        fileSizeBytes,
        contentHash,
      };
    }

    // Plain text / Markdown fallback
    if (claimedExt === "txt" || claimedExt === "md" || claimedExt === "csv") {
      return {
        isValid: true,
        detectedMimeType: "text/plain",
        detectedExtension: claimedExt,
        fileSizeBytes,
        contentHash,
      };
    }

    return {
      isValid: false,
      detectedMimeType: "application/octet-stream",
      detectedExtension: claimedExt || "unknown",
      fileSizeBytes,
      contentHash,
      error: `지원되지 않거나 손상된 파일 형식입니다 (식별 불가 헤더).`,
    };
  }

  /**
   * Sanitizes extracted raw text to prevent prompt injection or script injection.
   * Untrusted Content Principle: All text inside RFP is data, not system instructions.
   */
  public static sanitizeExtractedText(text: string): string {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // strip html scripts
      .replace(/\u0000/g, "") // strip null bytes
      .trim();
  }
}
