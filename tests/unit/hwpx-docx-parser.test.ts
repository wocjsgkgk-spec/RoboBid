import { describe, it, expect } from "vitest";
import zlib from "zlib";
import { HwpxParser } from "@/lib/documents/parsers/hwpx-parser";
import { DocxParser } from "@/lib/documents/parsers/docx-parser";

/**
 * Helper to build a minimal valid PKZIP binary in memory.
 */
function createMinimalZip(files: Record<string, string>): Buffer {
  const fileBuffers: Buffer[] = [];
  const cdEntries: Buffer[] = [];
  let offset = 0;

  for (const [filename, content] of Object.entries(files)) {
    const fnBuf = Buffer.from(filename, "utf8");
    const dataBuf = Buffer.from(content, "utf8");
    const compressed = zlib.deflateRawSync(dataBuf);

    // Local Header (30 bytes + fnLen + extraLen)
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); // Sig PK\x03\x04
    lh.writeUInt16LE(20, 4); // version needed
    lh.writeUInt16LE(0, 6); // flags
    lh.writeUInt16LE(8, 8); // compression method (Deflate)
    lh.writeUInt16LE(0, 10); // mod time
    lh.writeUInt16LE(0, 12); // mod date
    lh.writeUInt32LE(0, 14); // crc32
    lh.writeUInt32LE(compressed.length, 18); // comp size
    lh.writeUInt32LE(dataBuf.length, 22); // uncomp size
    lh.writeUInt16LE(fnBuf.length, 26); // fn len
    lh.writeUInt16LE(0, 28); // extra len

    const localEntry = Buffer.concat([lh, fnBuf, compressed]);
    fileBuffers.push(localEntry);
    offset += localEntry.length;
  }

  return Buffer.concat(fileBuffers);
}

describe("HWPX and DOCX Parsers with Table Extraction", () => {
  it("should parse HWPX section text and table structures", () => {
    const hwpxXml = `
      <hp:tbl>
        <hp:tr>
          <hp:tc><hp:t>항목</hp:t></hp:tc>
          <hp:tc><hp:t>규격</hp:t></hp:tc>
        </hp:tr>
        <hp:tr>
          <hp:tc><hp:t>이동속도</hp:t></hp:tc>
          <hp:tc><hp:t>1.2m/s 이상</hp:t></hp:tc>
        </hp:tr>
      </hp:tbl>
      <hp:p><hp:t>1. 사업개요: 본 과업은 자율주행 AMR 로봇의 실증을 목적으로 한다.</hp:t></hp:p>
    `;

    const hwpxZip = createMinimalZip({
      "Contents/section0.xml": hwpxXml,
    });

    const parsed = HwpxParser.parse(hwpxZip);
    expect(parsed.sections.length).toBe(1);
    expect(parsed.tables.length).toBe(1);
    expect(parsed.tables[0].headers).toEqual(["항목", "규격"]);
    expect(parsed.tables[0].rows[0]).toEqual(["이동속도", "1.2m/s 이상"]);
    expect(parsed.text).toContain("자율주행 AMR 로봇");
  });

  it("should parse DOCX paragraphs and table structures", () => {
    const docxXml = `
      <w:p><w:t>1. 지원자격</w:t></w:p>
      <w:p><w:t>신청기업은 본사 또는 연구소가 국내에 소재한 중소기업이어야 한다.</w:t></w:p>
      <w:tbl>
        <w:tr>
          <w:tc><w:t>평가항목</w:t></w:tc>
          <w:tc><w:t>배점</w:t></w:tc>
        </w:tr>
        <w:tr>
          <w:tc><w:t>기술성</w:t></w:tc>
          <w:tc><w:t>50점</w:t></w:tc>
        </w:tr>
      </w:tbl>
    `;

    const docxZip = createMinimalZip({
      "word/document.xml": docxXml,
    });

    const parsed = DocxParser.parse(docxZip);
    expect(parsed.tables.length).toBe(1);
    expect(parsed.tables[0].headers).toEqual(["평가항목", "배점"]);
    expect(parsed.tables[0].rows[0]).toEqual(["기술성", "50점"]);
    expect(parsed.text).toContain("중소기업이어야 한다");
  });
});
