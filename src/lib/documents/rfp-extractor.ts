import { RequirementCandidate, RequirementCategory, RfpSection } from "@/types/document";

export class RfpExtractor {
  /**
   * Extracts structured requirement candidates from parsed text & sections.
   * Ensures 100% traceability back to document section and exact citation quote.
   */
  public static extractRequirements(sections: RfpSection[], fullText: string): RequirementCandidate[] {
    const candidates: RequirementCandidate[] = [];
    let reqCounter = 1;

    // Pattern definitions for RFP requirement detection
    const categoryRules: Array<{
      category: RequirementCategory;
      prefix: string;
      headerPatterns: RegExp[];
      sentenceKeywords: string[];
    }> = [
      {
        category: "ELIGIBILITY",
        prefix: "ELG",
        headerPatterns: [/지원\s*자격/i, /신청\s*자격/i, /참여\s*제한/i, /신청\s*대상/i],
        sentenceKeywords: ["기업", "업력", "자격", "제한", "중소기업", "스타트업", "본사", "등록"],
      },
      {
        category: "TECHNICAL",
        prefix: "TEC",
        headerPatterns: [/기술\s*요구/i, /과업\s*지시/i, /개발\s*내용/i, /규격\s*사양/i, /시스템\s*구성/i],
        sentenceKeywords: ["로봇", "amr", "agv", "하드웨어", "소프트웨어", "센서", "통신", "기능", "성능", "ros2"],
      },
      {
        category: "FINANCIAL",
        prefix: "FIN",
        headerPatterns: [/사업비/i, /예산/i, /지원\s*규모/i, /자기\s*부담/i, /현금\s*현물/i],
        sentenceKeywords: ["사업비", "국비", "자부담", "부가세", "인건비", "장비비"],
      },
      {
        category: "SUBMISSION",
        prefix: "SUB",
        headerPatterns: [/제출\s*서류/i, /신청\s*서식/i, /구비\s*서류/i, /제출\s*방법/i],
        sentenceKeywords: ["사업계획서", "인감증명서", "재무제표", "특허증", "신청서", "제출하여야"],
      },
      {
        category: "SCHEDULE",
        prefix: "SCH",
        headerPatterns: [/추진\s*일정/i, /사업\s*기간/i, /과업\s*기간/i, /수행\s*일정/i],
        sentenceKeywords: ["착수일", "마감일", "개월", "최종보고", "중간점검"],
      },
      {
        category: "EVALUATION",
        prefix: "EVL",
        headerPatterns: [/평가\s*항목/i, /배점\s*기준/i, /심사\s*기준/i, /가점\s*우대/i],
        sentenceKeywords: ["배점", "가점", "서면평가", "발표평가", "적격성"],
      },
    ];

    // 1. Analyze by Section Headers
    for (const section of sections) {
      for (const rule of categoryRules) {
        const isHeaderMatch = rule.headerPatterns.some((pattern) => pattern.test(section.title));
        if (isHeaderMatch) {
          const sentences = section.content
            .split(/(?<=[.?!])\s+|\n+/)
            .map((s) => s.trim())
            .filter((s) => s.length >= 10);

          for (const sentence of sentences) {
            const hasKeyword = rule.sentenceKeywords.some((kw) =>
              sentence.toLowerCase().includes(kw)
            );
            if (hasKeyword) {
              const isMandatory =
                /하여야\s*한다|이어야\s*한다|어야\s*한다|해야\s*한다|필수|반드시|하여야\s*함|제출하여야|원칙|제한된다|제한함/i.test(sentence);

              const code = `REQ-${rule.prefix}-${String(reqCounter++).padStart(3, "0")}`;
              candidates.push({
                reqCode: code,
                title: sentence.slice(0, 80) + (sentence.length > 80 ? "..." : ""),
                description: sentence,
                category: rule.category,
                isMandatory,
                citationSection: section.title,
                citationPage: section.pageNumber || 1,
                citationQuote: sentence,
              });

              if (candidates.length >= 50) break; // Limit candidate size per doc
            }
          }
        }
      }
    }

    // 2. If no section matched, analyze full text paragraphs
    if (candidates.length === 0 && fullText.length > 50) {
      const paragraphs = fullText.split("\n").filter((p) => p.trim().length > 20);
      for (const para of paragraphs) {
        for (const rule of categoryRules) {
          if (rule.headerPatterns.some((p) => p.test(para))) {
            const isMandatory = /하여야|필수|반드시|자격/i.test(para);
            const code = `REQ-${rule.prefix}-${String(reqCounter++).padStart(3, "0")}`;
            candidates.push({
              reqCode: code,
              title: para.slice(0, 80) + (para.length > 80 ? "..." : ""),
              description: para,
              category: rule.category,
              isMandatory,
              citationSection: "공고 본문",
              citationPage: 1,
              citationQuote: para,
            });
            break;
          }
        }
        if (candidates.length >= 20) break;
      }
    }

    return candidates;
  }
}
