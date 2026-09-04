import { DocumentSecurityValidator } from "./security";
import { HwpxParser } from "./parsers/hwpx-parser";
import { DocxParser } from "./parsers/docx-parser";
import { PdfParser } from "./parsers/pdf-parser";
import { ZipParser } from "./parsers/zip-parser";
import { HwpWorkerClient } from "./parsers/hwp-worker";
import { RfpExtractor } from "./rfp-extractor";
import { ParsedDocumentResult, RfpSection, RfpTable } from "@/types/document";

export class DocumentIngestionPipeline {
  /**
   * Complete end-to-end ingestion and parsing pipeline for public RFP attachments.
   */
  public static async process(
    buffer: Buffer,
    fileName: string
  ): Promise<ParsedDocumentResult> {
    const startTime = Date.now();

    // 1. Security & MIME Validation
    const validation = DocumentSecurityValidator.validateBuffer(buffer, fileName);

    if (!validation.isValid) {
      return {
        fileName,
        fileSizeBytes: buffer.length,
        contentHash: validation.contentHash,
        detectedMimeType: validation.detectedMimeType,
        parseStatus: "FAILED",
        rawText: "",
        sections: [],
        tables: [],
        requirementCandidates: [],
        metadata: {},
        errorMessage: validation.error || "파일 검증에 실패했습니다.",
      };
    }

    let rawText = "";
    let sections: RfpSection[] = [];
    let tables: RfpTable[] = [];
    let parseStatus: ParsedDocumentResult["parseStatus"] = "PARSED";
    let errorMessage: string | undefined;
    let metadata: Record<string, any> = {};

    try {
      const ext = validation.detectedExtension.toLowerCase();

      switch (ext) {
        case "hwpx": {
          const res = HwpxParser.parse(buffer);
          rawText = res.text;
          sections = res.sections;
          tables = res.tables;
          metadata = res.metadata;
          break;
        }

        case "docx": {
          const res = DocxParser.parse(buffer);
          rawText = res.text;
          sections = res.sections;
          tables = res.tables;
          metadata = res.metadata;
          break;
        }

        case "pdf": {
          const res = PdfParser.parse(buffer);
          rawText = res.text;
          sections = res.sections;
          tables = res.tables;
          metadata = res.metadata;
          break;
        }

        case "zip": {
          const res = ZipParser.parse(buffer);
          rawText = `ZIP 압축 파일 (총 ${res.totalFiles}개 파일 포함)\n` +
            res.files.map((f) => `- ${f.fileName} (${(f.sizeBytes / 1024).toFixed(1)} KB)`).join("\n");
          sections = [
            {
              id: "zip-sec-0",
              title: "압축 파일 구성 목록",
              content: rawText,
              level: 1,
            },
          ];
          metadata = { format: "ZIP", totalFiles: res.totalFiles };
          break;
        }

        case "hwp": {
          const res = await HwpWorkerClient.parse(buffer);
          rawText = res.text;
          sections = res.sections;
          tables = res.tables;
          parseStatus = res.parseStatus;
          errorMessage = res.errorMessage;
          metadata = res.metadata;
          break;
        }

        case "txt":
        case "md": {
          rawText = buffer.toString("utf8");
          sections = [
            {
              id: "txt-sec-0",
              title: "원문 본문",
              content: rawText,
              level: 1,
            },
          ];
          metadata = { format: ext.toUpperCase() };
          break;
        }

        default: {
          parseStatus = "UNSUPPORTED";
          errorMessage = `지원되지 않는 문서 포맷입니다 (.${ext})`;
        }
      }
    } catch (err: any) {
      parseStatus = "FAILED";
      errorMessage = `파싱 중 예외 발생: ${err.message}`;
    }

    // 2. Sanitize Text (Untrusted Content)
    const sanitizedText = DocumentSecurityValidator.sanitizeExtractedText(rawText);

    // 3. Extract RFP Requirements with Traceability
    const requirementCandidates =
      parseStatus === "PARSED"
        ? RfpExtractor.extractRequirements(sections, sanitizedText)
        : [];

    return {
      fileName,
      fileSizeBytes: buffer.length,
      contentHash: validation.contentHash,
      detectedMimeType: validation.detectedMimeType,
      parseStatus,
      rawText: sanitizedText,
      sections,
      tables,
      requirementCandidates,
      metadata: {
        ...metadata,
        durationMs: Date.now() - startTime,
      },
      errorMessage,
    };
  }
}
