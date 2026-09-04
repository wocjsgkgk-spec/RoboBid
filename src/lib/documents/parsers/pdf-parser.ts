import { RfpSection, RfpTable } from "@/types/document";

export class PdfParser {
  /**
   * Safe text extraction from PDF stream without external native binaries.
   */
  public static parse(buffer: Buffer): {
    text: string;
    sections: RfpSection[];
    tables: RfpTable[];
    metadata: Record<string, any>;
  } {
    const rawContent = buffer.toString("binary");

    // Estimate page count by counting /Type /Page occurrences
    const pageMatches = rawContent.match(/\/Type\s*\/Page\b/g);
    const pageCount = pageMatches ? pageMatches.length : 1;

    // Extract text blocks inside BT (Begin Text) ... ET (End Text)
    const textBlocks: string[] = [];
    const btRegex = /BT[\s\S]*?ET/g;
    let match: RegExpExecArray | null;

    while ((match = btRegex.exec(rawContent)) !== null) {
      const block = match[0];
      // Extract string literals: (text) Tj or [(t)(e)(x)(t)] TJ
      const tjRegex = /\((.*?)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        textBlocks.push(this.decodePdfString(tjMatch[1]));
      }

      const bigTjRegex = /\[(.*?)\]\s*TJ/g;
      let bigMatch: RegExpExecArray | null;
      while ((bigMatch = bigTjRegex.exec(block)) !== null) {
        const inner = bigMatch[1];
        const innerMatches = inner.match(/\((.*?)\)/g) || [];
        for (const item of innerMatches) {
          textBlocks.push(this.decodePdfString(item.slice(1, -1)));
        }
      }
    }

    const fullText = textBlocks.length > 0 ? textBlocks.join(" ") : "PDF 텍스트 스트림 추출 대기";

    return {
      text: fullText,
      sections: [
        {
          id: "pdf-sec-0",
          title: "전체 공고 문서",
          content: fullText,
          pageNumber: 1,
          level: 1,
        },
      ],
      tables: [],
      metadata: {
        format: "PDF",
        pageCount,
        characterCount: fullText.length,
      },
    };
  }

  private static decodePdfString(str: string): string {
    return str
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");
  }
}
