import { describe, it, expect } from "vitest";
import { ProposalExporter } from "@/lib/proposals/proposal-exporter";
import { Proposal, ProposalSection } from "@/types/proposal";

describe("ProposalExporter (제안서 표준 내보내기 엔진)", () => {
  const mockProposal: Proposal = {
    id: "prop-101",
    organizationId: "org-1",
    opportunityId: "opp-1",
    title: "항만 물류 무인 자율주행 AGV 로봇 구축 제안서",
    status: "DRAFTING",
    currentVersion: 1,
    targetSubmissionDate: "2026-10-15T00:00:00Z",
    totalBudget: 850000000,
    createdBy: "user-1",
    metadata: {
      announcingAgency: "부산항만공사 / 조달청",
      bidType: "R_AND_D",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSections: ProposalSection[] = [
    {
      id: "sec-1",
      proposalId: "prop-101",
      sectionCode: "1.1_NEEDS_BACKGROUND",
      title: "1.1 과제 추진 배경 및 필요성",
      orderIndex: 0,
      contentMarkdown: "본 과제는 항만 물류 처리 자동화를 위해 추진됩니다.",
      evidenceCitations: [
        {
          id: "CAP-001",
          sourceType: "CAPABILITY",
          sourceId: "cap-asset-1",
          sourceTitle: "자율주행 AGV 제어 특허",
          quoteSnippet: "특허 등록 제 10-2024-XXXXX 호 자율주행 제어 특허 보유",
          relevanceReason: "요구조건 일치",
        },
      ],
      status: "AI_GENERATED",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sec-2",
      proposalId: "prop-101",
      sectionCode: "2.1_TECH_ARCHITECTURE",
      title: "2.1 시스템 아키텍처",
      orderIndex: 1,
      contentMarkdown: "ROS2 기반 임베디드 엣지 제어기 및 5G 관제망을 연동합니다.",
      evidenceCitations: [],
      status: "AI_GENERATED",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("Markdown 내보내기 시 표지, 목차, 본문 및 증빙 부록을 포함해야 한다", () => {
    const md = ProposalExporter.toMarkdown(mockProposal, mockSections, {
      includeCoverPage: true,
      includeTableOfContents: true,
      includeCitations: true,
    });

    expect(md).toContain("# 항만 물류 무인 자율주행 AGV 로봇 구축 제안서");
    expect(md).toContain("부산항만공사 / 조달청");
    expect(md).toContain("## [목 차]");
    expect(md).toContain("1.1_NEEDS_BACKGROUND");
    expect(md).toContain("CAP-001");
    expect(md).toContain("자율주행 AGV 제어 특허");
    expect(md).toContain("부록: 사내 역량 및 제안 증빙 원천 목록");
  });

  it("정부 표준 DOCX-HTML 생성 시 A4 규격 및 스타일 태그를 준수해야 한다", () => {
    const html = ProposalExporter.toDocxHtml(mockProposal, mockSections, {
      includeCoverPage: true,
      includeCitations: true,
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("size: 210mm 297mm;"); // A4 규격
    expect(html).toContain("doc-title");
    expect(html).toContain("sec-title");
    expect(html).toContain("RoboBid AI");
  });

  it("Markdown 표 및 [가정:] 콜아웃이 정규 HTML table 및 뱃지 스타일로 변환되어야 한다", () => {
    const rawMd = `
### 3.1 세부 일정
| 단계 | 개발내용 | 기간 |
| :--- | :--- | :--- |
| 1단계 | 하드웨어 설계 | M1~M3 |
| 2단계 | 펌웨어 개발 | M4~M6 |

[가정: 사업 기간은 12개월 기준입니다.]
[TODO: 주관기관 협의 필요]
    `;

    const converted = ProposalExporter.parseMarkdownToGovHtml(rawMd);

    expect(converted).toContain("<table>");
    expect(converted).toContain("<thead>");
    expect(converted).toContain("<th>단계</th>");
    expect(converted).toContain("<td>하드웨어 설계</td>");
    expect(converted).toContain("<tbody>");
    expect(converted).toContain("badge-assumption");
    expect(converted).toContain("[가정: 사업 기간은 12개월 기준입니다.]");
    expect(converted).toContain("[TODO: 주관기관 협의 필요]");
  });
});
