import { MiniZip } from "../unzipper";
import { RfpSection, RfpTable } from "@/types/document";

export class HwpxParser {
  /**
   * Parses HWPX (Hancom Office XML Standard) binary buffer.
   */
  public static parse(buffer: Buffer): {
    text: string;
    sections: RfpSection[];
    tables: RfpTable[];
    metadata: Record<string, any>;
  } {
    const entries = MiniZip.extractEntries(buffer);
    const sections: RfpSection[] = [];
    const tables: RfpTable[] = [];
    const textPieces: string[] = [];

    // HWPX documents store section XMLs in Contents/section0.xml, section1.xml, etc.
    let sectionIndex = 0;

    for (const [path, entry] of entries.entries()) {
      if (path.startsWith("Contents/section") && path.endsWith(".xml")) {
        const xmlContent = entry.data.toString("utf8");

        // 1. Extract Tables: <hp:tbl> ... </hp:tbl>
        const tableMatches = xmlContent.match(/<hp:tbl[\s\S]*?<\/hp:tbl>/gi) || [];
        tableMatches.forEach((tableXml, tIdx) => {
          const rows: string[][] = [];
          const rowMatches = tableXml.match(/<hp:tr[\s\S]*?<\/hp:tr>/gi) || [];

          for (const rowXml of rowMatches) {
            const cells: string[] = [];
            const cellMatches = rowXml.match(/<hp:tc[\s\S]*?<\/hp:tc>/gi) || [];
            for (const cellXml of cellMatches) {
              const cellText = this.stripXmlTags(cellXml).trim();
              cells.push(cellText);
            }
            if (cells.length > 0) {
              rows.push(cells);
            }
          }

          if (rows.length > 0) {
            tables.push({
              id: `hwpx-tbl-${sectionIndex}-${tIdx}`,
              headers: rows[0] || [],
              rows: rows.slice(1),
            });
          }
        });

        // 2. Extract Text Paragraphs: <hp:t>text</hp:t> or general <hp:p>
        const sectionText = this.extractTextFromXml(xmlContent);
        textPieces.push(sectionText);

        sections.push({
          id: `sec-${sectionIndex}`,
          title: `섹션 ${sectionIndex + 1}`,
          content: sectionText,
          level: 1,
        });

        sectionIndex++;
      }
    }

    const fullText = textPieces.join("\n\n");

    return {
      text: fullText,
      sections,
      tables,
      metadata: {
        format: "HWPX",
        sectionCount: sections.length,
        tableCount: tables.length,
      },
    };
  }

  private static extractTextFromXml(xml: string): string {
    // Look specifically for Hancom HWPX text tag: <hp:t>...</hp:t>
    const tTags = xml.match(/<hp:t[^>]*>([\s\S]*?)<\/hp:t>/gi);
    if (tTags && tTags.length > 0) {
      return tTags
        .map((tag) => this.stripXmlTags(tag).trim())
        .filter(Boolean)
        .join(" ");
    }
    // Fallback to stripping all XML tags
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
