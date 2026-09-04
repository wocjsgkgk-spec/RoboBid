import { MiniZip } from "../unzipper";
import { RfpSection, RfpTable } from "@/types/document";

export class DocxParser {
  /**
   * Parses Microsoft Word (.docx) binary buffer.
   */
  public static parse(buffer: Buffer): {
    text: string;
    sections: RfpSection[];
    tables: RfpTable[];
    metadata: Record<string, any>;
  } {
    const entries = MiniZip.extractEntries(buffer);
    const docEntry = entries.get("word/document.xml");

    if (!docEntry) {
      throw new Error("올바른 DOCX 형식이 아닙니다 (word/document.xml 누락).");
    }

    const xmlContent = docEntry.data.toString("utf8");
    const tables: RfpTable[] = [];

    // Extract tables: <w:tbl> ... </w:tbl>
    const tableMatches = xmlContent.match(/<w:tbl[\s\S]*?<\/w:tbl>/gi) || [];
    tableMatches.forEach((tableXml, tIdx) => {
      const rows: string[][] = [];
      const rowMatches = tableXml.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];

      for (const rowXml of rowMatches) {
        const cells: string[] = [];
        const cellMatches = rowXml.match(/<w:tc[\s\S]*?<\/w:tc>/gi) || [];
        for (const cellXml of cellMatches) {
          cells.push(this.stripXmlTags(cellXml).trim());
        }
        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      if (rows.length > 0) {
        tables.push({
          id: `docx-tbl-${tIdx}`,
          headers: rows[0] || [],
          rows: rows.slice(1),
        });
      }
    });

    // Extract text paragraphs: <w:p> ... </w:p>
    const pMatches = xmlContent.match(/<w:p[\s\S]*?<\/w:p>/gi) || [];
    const paragraphs: string[] = [];
    const sections: RfpSection[] = [];

    let currentSectionTitle = "기본 섹션";
    let currentSectionContent: string[] = [];
    let secIdx = 0;

    for (const pXml of pMatches) {
      const pText = this.extractTextFromXml(pXml).trim();
      if (!pText) continue;

      paragraphs.push(pText);

      // Detect header-like paragraphs (e.g. 1. 사업개요, 제1장, I. 추진배경 등)
      if (/^([0-9]+[\.\)]|[I|V|X]+[\.\)]|제[0-9]+[장|절])\s+/.test(pText)) {
        if (currentSectionContent.length > 0) {
          sections.push({
            id: `sec-${secIdx++}`,
            title: currentSectionTitle,
            content: currentSectionContent.join("\n"),
            level: 1,
          });
          currentSectionContent = [];
        }
        currentSectionTitle = pText;
      } else {
        currentSectionContent.push(pText);
      }
    }

    if (currentSectionContent.length > 0) {
      sections.push({
        id: `sec-${secIdx}`,
        title: currentSectionTitle,
        content: currentSectionContent.join("\n"),
        level: 1,
      });
    }

    const fullText = paragraphs.join("\n");

    return {
      text: fullText,
      sections: sections.length > 0 ? sections : [{ id: "sec-0", title: "본문", content: fullText, level: 1 }],
      tables,
      metadata: {
        format: "DOCX",
        paragraphCount: paragraphs.length,
        tableCount: tables.length,
      },
    };
  }

  private static extractTextFromXml(xml: string): string {
    const tTags = xml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi);
    if (tTags && tTags.length > 0) {
      return tTags
        .map((tag) => this.stripXmlTags(tag))
        .join("");
    }
    return this.stripXmlTags(xml);
  }

  private static stripXmlTags(xml: string): string {
    return xml
      .replace(/<[^>]+>/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  }
}
