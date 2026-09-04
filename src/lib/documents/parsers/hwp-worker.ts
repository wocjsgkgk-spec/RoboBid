import { RfpSection, RfpTable, ParseStatus } from "@/types/document";

export interface HwpWorkerResponse {
  parseStatus: ParseStatus;
  text: string;
  sections: RfpSection[];
  tables: RfpTable[];
  errorMessage?: string;
  metadata: Record<string, any>;
}

export class HwpWorkerClient {
  /**
   * Dispatches HWP 5.0 binary parsing to an external worker.
   * If worker is unavailable or HWP 5.0 is legacy proprietary binary,
   * cleanly transitions to REVIEW_REQUIRED / UNSUPPORTED with clear user instructions.
   */
  public static async parse(buffer: Buffer): Promise<HwpWorkerResponse> {
    const workerEndpoint = process.env.DOCUMENT_WORKER_URL;

    if (workerEndpoint) {
      try {
        const res = await fetch(`${workerEndpoint}/parse/hwp`, {
          method: "POST",
          headers: { "Content-Type": "application/x-hwp" },
          body: new Uint8Array(buffer),
        });

        if (res.ok) {
          const json = await res.json();
          return {
            parseStatus: "PARSED",
            text: json.text || "",
            sections: json.sections || [],
            tables: json.tables || [],
            metadata: { format: "HWP_5.0_WORKER" },
          };
        }
      } catch {
        // Fallthrough to worker unavailable
      }
    }

    // PRD Section 16 & Phase 3 Guideline:
    // Web Runtime does not crash or execute native C bindings directly.
    // Instead, return explicit REVIEW_REQUIRED status with fallback message.
    return {
      parseStatus: "REVIEW_REQUIRED",
      text: "레거시 HWP(한글 5.0 바이너리) 형식 문서입니다. Document Worker 연동 대기 중이거나 HWPX/PDF 변환 권장 대상입니다.",
      sections: [],
      tables: [],
      errorMessage:
        "레거시 HWP 5.0 바이너리 문서입니다. 정확한 분석을 위해 공고 페이지에서 HWPX 또는 PDF 문서를 다운로드하여 업로드하거나, Document Worker를 기동하세요.",
      metadata: {
        format: "HWP_LEGACY",
        requiresWorkerOrConversion: true,
      },
    };
  }
}
