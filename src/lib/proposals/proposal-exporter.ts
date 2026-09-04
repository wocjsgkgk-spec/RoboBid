/**
 * RoboBid AI — 제안서 종합 내보내기 엔진 (ProposalExporter)
 * 조달청(KONEPS), 중기부(TIPA), NIPA 공공 표준 제안서 서식 변환 및 다운로드 생성
 */

import { Proposal, ProposalSection } from "@/types/proposal";

export interface ExportOptions {
  includeCitations?: boolean;
  includeCoverPage?: boolean;
  includeTableOfContents?: boolean;
  agencyType?: "KONEPS" | "TIPA" | "NIPA" | "GENERAL";
  authorName?: string;
  companyName?: string;
}

export class ProposalExporter {
  /**
   * 단일 Markdown 문서로 결합 (목차 및 증빙 주석 포함)
   */
  public static toMarkdown(
    proposal: Proposal,
    sections: ProposalSection[],
    options: ExportOptions = {}
  ): string {
    const {
      includeCoverPage = true,
      includeTableOfContents = true,
      includeCitations = true,
      companyName = "로보비드 주식회사 (RoboBid AI)",
    } = options;

    let md = "";

    // 1. 표지
    if (includeCoverPage) {
      md += `# ${proposal.title}\n\n`;
      md += `> **수신 기관**: ${proposal.metadata?.announcingAgency || "조달청 / 정부 주관기관"}\n`;
      md += `> **제안 기업**: ${companyName}\n`;
      md += `> **제출 일자**: ${
        proposal.targetSubmissionDate
          ? new Date(proposal.targetSubmissionDate).toLocaleDateString("ko-KR")
          : new Date().toLocaleDateString("ko-KR")
      }\n`;
      md += `> **문서 버전**: v${proposal.currentVersion}.0 (RoboBid AI Verified)\n\n`;
      md += `---\n\n`;
    }

    // 2. 목차
    if (includeTableOfContents) {
      md += `## [목 차]\n\n`;
      sections
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .forEach((sec) => {
          md += `- **${sec.sectionCode}** ${sec.title}\n`;
        });
      md += `\n---\n\n`;
    }

    // 3. 본문 섹션들
    const allCitations: { id: string; title: string; quote: string }[] = [];

    sections
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .forEach((sec) => {
        md += `## ${sec.title}\n\n`;
        md += `${sec.contentMarkdown || "(작성된 내용이 없습니다.)"}\n\n`;

        if (includeCitations && sec.evidenceCitations && sec.evidenceCitations.length > 0) {
          md += `\n**[해당 섹션 증빙 인용 (Evidence Citations)]**\n`;
          sec.evidenceCitations.forEach((cite) => {
            md += `- **[${cite.id}]** ${cite.sourceTitle}: "${cite.quoteSnippet}"\n`;
            if (!allCitations.some((c) => c.id === cite.id)) {
              allCitations.push({
                id: cite.id,
                title: cite.sourceTitle,
                quote: cite.quoteSnippet,
              });
            }
          });
          md += `\n`;
        }

        md += `---\n\n`;
      });

    // 4. 권말 부록: 사내 역량 및 증빙 매핑표 (Zero Fake Data Guarantee)
    if (includeCitations && allCitations.length > 0) {
      md += `## [부록: 사내 역량 및 제안 증빙 원천 목록]\n\n`;
      md += `| 증빙 번호 | 증빙 자산명 | 인용 요약 |\n`;
      md += `| :---: | :--- | :--- |\n`;
      allCitations.forEach((c) => {
        md += `| ${c.id} | ${c.title} | ${c.quote.slice(0, 80)}... |\n`;
      });
      md += `\n*본 제안서는 RoboBid AI의 Capability Vault 검증을 거쳐 가짜 실적 날조 없이 작성되었습니다.*\n`;
    }

    return md;
  }

  /**
   * 마크다운 텍스트를 정부 표준 HTML (표, 코드블록, 콜아웃 완비)로 정밀 변환
   */
  public static parseMarkdownToGovHtml(markdown: string): string {
    // 1. 코드 블록 변환
    let html = markdown.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
      const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre style="background:#f8fafc;border:1pt solid #cbd5e1;padding:8pt;font-family:Consolas,monospace;font-size:9.5pt;margin:10pt 0;"><code>${escaped}</code></pre>`;
    });

    // 2. 마크다운 테이블 (| ... |) 구조화 변환
    const lines = html.split("\n");
    const outputLines: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    const flushTable = () => {
      if (tableRows.length === 0) return;
      let tableHtml = "<table>\n";
      let headerPassed = false;

      for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i].trim();
        if (row.match(/^\|?\s*:?-+:?\s*\|/)) {
          headerPassed = true;
          continue;
        }

        const cells = row
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);

        if (cells.length === 0) continue;

        if (!headerPassed && i === 0) {
          tableHtml += "  <thead>\n    <tr>\n";
          cells.forEach((cell) => {
            tableHtml += `      <th>${cell}</th>\n`;
          });
          tableHtml += "    </tr>\n  </thead>\n  <tbody>\n";
        } else {
          tableHtml += "    <tr>\n";
          cells.forEach((cell) => {
            tableHtml += `      <td>${cell}</td>\n`;
          });
          tableHtml += "    </tr>\n";
        }
      }
      tableHtml += "  </tbody>\n</table>\n";
      outputLines.push(tableHtml);
      tableRows = [];
      inTable = false;
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        inTable = true;
        tableRows.push(trimmed);
      } else {
        if (inTable) {
          flushTable();
        }
        outputLines.push(line);
      }
    }
    if (inTable) {
      flushTable();
    }

    html = outputLines.join("\n");

    // 3. 제목, 인용, 불릿, 배지 변환
    return html
      .replace(/^# (.*$)/gim, '<h1 class="doc-title">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="sec-title">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="sub-title">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="sub2-title">$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/^> (.*$)/gim, '<p class="quote">$1</p>')
      .replace(/^- (.*$)/gim, '<li class="list-item">$1</li>')
      .replace(
        /\[가정:\s*(.*?)\]/gim,
        '<span class="badge-assumption" style="background:#fef3c7;color:#92400e;padding:2pt 6pt;border-radius:4pt;font-size:9.5pt;font-weight:bold;">[가정: $1]</span>'
      )
      .replace(
        /\[TODO:\s*(.*?)\]/gim,
        '<span class="badge-todo" style="background:#fee2e2;color:#991b1b;padding:2pt 6pt;border-radius:4pt;font-size:9.5pt;font-weight:bold;">[TODO: $1]</span>'
      )
      .replace(/\n\n/gim, "<p class='para'></p>");
  }

  /**
   * MS Word 및 한컴오피스 한글에서 서식 그대로 열리는 정부 표준 HTML-DOCX 생성
   */
  public static toDocxHtml(
    proposal: Proposal,
    sections: ProposalSection[],
    options: ExportOptions = {}
  ): string {
    const markdown = this.toMarkdown(proposal, sections, options);
    const bodyHtml = this.parseMarkdownToGovHtml(markdown);

    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${proposal.title}</title>
  <style>
    @page {
      size: 210mm 297mm; /* A4 */
      margin: 20mm 20mm 20mm 20mm;
      mso-page-orientation: portrait;
    }
    body {
      font-family: 'Malgun Gothic', '맑은 고딕', 'Batang', sans-serif;
      font-size: 11pt;
      line-height: 1.65;
      color: #1a1a1a;
    }
    h1.doc-title {
      font-size: 22pt;
      font-weight: bold;
      text-align: center;
      margin-top: 30pt;
      margin-bottom: 25pt;
      color: #0f172a;
      border-bottom: 2pt solid #0284c7;
      padding-bottom: 12pt;
    }
    h2.sec-title {
      font-size: 15pt;
      font-weight: bold;
      margin-top: 24pt;
      margin-bottom: 10pt;
      color: #1e293b;
      page-break-before: auto;
      border-left: 4pt solid #0284c7;
      padding-left: 8pt;
    }
    h3.sub-title {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 16pt;
      margin-bottom: 6pt;
      color: #334155;
    }
    p.para {
      margin-bottom: 8pt;
      text-align: justify;
    }
    p.quote {
      font-size: 10.5pt;
      background: #f8fafc;
      border-left: 3pt solid #94a3b8;
      padding: 6pt 10pt;
      margin: 4pt 0;
      color: #475569;
    }
    li.list-item {
      margin-left: 20pt;
      margin-bottom: 4pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
      font-size: 10pt;
    }
    th, td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 8pt;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .footer-note {
      font-size: 9pt;
      color: #64748b;
      text-align: center;
      margin-top: 30pt;
      border-top: 1pt solid #e2e8f0;
      padding-top: 8pt;
    }
  </style>
</head>
<body>
  ${bodyHtml}
  <div class="footer-note">
    본 문서는 조달청/중기부 공공제안서 표준 규격에 따라 RoboBid AI에서 검증 및 생성되었습니다.
  </div>
</body>
</html>`;
  }

  /**
   * 브라우저에서 다운로드 트리거
   */
  public static downloadFile(content: string, fileName: string, mimeType: string) {
    if (typeof window === "undefined") return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
