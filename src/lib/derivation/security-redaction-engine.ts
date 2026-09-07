import {
  SecurityClassificationTier,
  SensitiveCategory,
} from "@/types/derivation";

/**
 * RoboBid AI v3.0 — Security Redaction Engine
 * Master Specification 파생 시 기밀 정보(전략, 원가, 예산, 파이프라인, 비공개 로직, 보호 아키텍처) 자동 분류 및 마스킹
 */

// 민감 정보 감지 키워드 및 패턴
const SENSITIVE_PATTERNS: Record<SensitiveCategory, RegExp[]> = {
  INTERNAL_STRATEGY: [
    /(사내\s*영업\s*전략|극비\s*전략|비공개\s*로드맵|경쟁사\s*대응\s*전략|독점\s*유통망|수익률\s*극대화)/gi,
    /(특허\s*미출원|출원\s*전\s*아이디어|영업비밀|사내\s*비밀)/gi,
  ],
  FULL_BUDGET: [
    /(총\s*사업비\s*:\s*[0-9,]+(\s*원|만원|억원)?)/gi,
    /(전체\s*예산\s*:\s*[0-9,]+(\s*원|만원|억원)?)/gi,
    /(마진율\s*:\s*[0-9.]+%?)/gi,
    /(영업이익률\s*:\s*[0-9.]+%?)/gi,
  ],
  INTERNAL_COST: [
    /(내부\s*원가|순원가|취득원가|마진|인건비\s*단가|시간당\s*단가)/gi,
    /(단가\s*:\s*[0-9,]+(\s*원|만원))/gi,
    /(원가율\s*:\s*[0-9.]+%?)/gi,
    /(\bunitCost\s*:\s*[0-9,]+)/gi,
  ],
  CONFIDENTIAL_PIPELINE: [
    /(https?:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2[0-9]|3[01])\.)[^\s"']+)/gi,
    /((?:postgres|mysql|mongodb|redis):\/\/[^\s"']+)/gi,
    /(내부\s*DB\s*접속|사내\s*NAS\s*경로|클라우드\s*시크릿|API\s*Key\s*:\s*[a-zA-Z0-9_-]{16,})/gi,
    /(s3:\/\/[^\s"']+)/gi,
  ],
  NON_PUBLIC_LOGIC: [
    /(독점\s*알고리즘\s*수식|비공개\s*가중치|파라미터\s*체크포인트|가중치\s*테이블)/gi,
    /(핵심\s*소스코드\s*구현체|Proprietary\s*Loss\s*Function)/gi,
  ],
  PROTECTED_ARCHITECTURE: [
    /(보호된\s*전장\s*회로도|PCB\s*거버\s*데이터|모터\s*드라이버\s*내부\s*FET\s*회로)/gi,
    /(FPGA\s*암호화\s*비트스트림|하드웨어\s*보안모듈\s*HSM\s*루트키)/gi,
  ],
};

// 보안 등급별 기본 마스킹 대상 카테고리
export const TIER_REDACTION_POLICY: Record<SecurityClassificationTier, SensitiveCategory[]> = {
  L3_SECRET_CORE: [], // 사내 극비 원천본: 마스킹 없음
  L2_CONFIDENTIAL: [
    "NON_PUBLIC_LOGIC",
    "CONFIDENTIAL_PIPELINE",
  ], // 정부 R&D 제출용: 비공개 알고리즘 및 내부 인프라 주소 마스킹
  L1_PARTNER: [
    "INTERNAL_STRATEGY",
    "FULL_BUDGET",
    "INTERNAL_COST",
    "CONFIDENTIAL_PIPELINE",
    "NON_PUBLIC_LOGIC",
    "PROTECTED_ARCHITECTURE",
  ], // 외주/파트너용 (RFP, 과업지시서 등): 사내 전략, 전체 예산, 원가, 핵심 로직 전부 마스킹
  L0_PUBLIC: [
    "INTERNAL_STRATEGY",
    "FULL_BUDGET",
    "INTERNAL_COST",
    "CONFIDENTIAL_PIPELINE",
    "NON_PUBLIC_LOGIC",
    "PROTECTED_ARCHITECTURE",
  ], // 대외 공개용: 전 항목 마스킹
};

export class SecurityRedactionEngine {
  /**
   * 텍스트 내에서 민감 정보 카테고리 감지
   */
  public static detectSensitiveCategories(text: string): SensitiveCategory[] {
    if (!text) return [];
    const detected: Set<SensitiveCategory> = new Set();

    for (const [category, patterns] of Object.entries(SENSITIVE_PATTERNS)) {
      for (const pattern of patterns) {
        pattern.lastIndex = 0;
        if (pattern.test(text)) {
          detected.add(category as SensitiveCategory);
          break;
        }
      }
    }

    return Array.from(detected);
  }

  /**
   * 보안 등급 및 민감 카테고리에 따라 텍스트 Redaction 적용
   */
  public static redactText(
    text: string,
    targetTier: SecurityClassificationTier,
    additionalCategories: SensitiveCategory[] = []
  ): {
    redactedText: string;
    isRedacted: boolean;
    appliedCategories: SensitiveCategory[];
    reason: string;
  } {
    if (!text || targetTier === "L3_SECRET_CORE") {
      return {
        redactedText: text,
        isRedacted: false,
        appliedCategories: [],
        reason: "L3_SECRET_CORE 사내 원천본 (Redaction 미적용)",
      };
    }

    const policyCategories = new Set([
      ...TIER_REDACTION_POLICY[targetTier],
      ...additionalCategories,
    ]);

    let modified = text;
    const appliedSet: Set<SensitiveCategory> = new Set();

    for (const category of policyCategories) {
      const patterns = SENSITIVE_PATTERNS[category] || [];
      for (const pattern of patterns) {
        pattern.lastIndex = 0;
        if (pattern.test(modified)) {
          appliedSet.add(category);
          pattern.lastIndex = 0;
          modified = modified.replace(pattern, () => {
            return `[REDACTED: ${category} 기밀 정보 마스킹]`;
          });
        }
      }
    }

    const appliedCategories = Array.from(appliedSet);
    const isRedacted = appliedCategories.length > 0;

    let reason = "보안 마스킹 미적용";
    if (isRedacted) {
      reason = `${targetTier} 보안 등급 정책에 따라 ${appliedCategories.join(", ")} 항목이 안전하게 마스킹되었습니다.`;
    }

    return {
      redactedText: modified,
      isRedacted,
      appliedCategories,
      reason,
    };
  }

  /**
   * 외주 RFP용 BOM(부품자재 명세서) 마스킹 처리
   * - unitCost (개별 원가) 완전 제거
   * - 민감 거래처 마스킹
   * - 규격 및 수량은 파트너 발주를 위해 보존
   */
  public static maskBomForOutsourcing(
    bom: Array<{ partName: string; unitCost: number; quantity: number; vendor?: string }>,
    targetTier: SecurityClassificationTier
  ): {
    maskedBom: Array<{ partName: string; quantity: number; specNote: string }>;
    rawMarkdown: string;
    redactedMarkdown: string;
  } {
    const rawLines = [
      "| 부품명 | 단가 (원) | 수량 | 공급사 |",
      "| :--- | :--- | :--- | :--- |",
    ];
    for (const item of bom) {
      rawLines.push(
        `| ${item.partName} | ${item.unitCost.toLocaleString()} | ${item.quantity} | ${item.vendor || "미정"} |`
      );
    }
    const rawMarkdown = rawLines.join("\n");

    if (targetTier === "L3_SECRET_CORE" || targetTier === "L2_CONFIDENTIAL") {
      return {
        maskedBom: bom.map((b) => ({
          partName: b.partName,
          quantity: b.quantity,
          specNote: `단가: ${b.unitCost.toLocaleString()}원 / 거래처: ${b.vendor || "미정"}`,
        })),
        rawMarkdown,
        redactedMarkdown: rawMarkdown,
      };
    }

    // L1_PARTNER 또는 L0_PUBLIC인 경우
    const redactedLines = [
      "| 부품명 및 기술규격 | 소요 수량 | 비고 (외주 견적 요청 사양) |",
      "| :--- | :--- | :--- |",
    ];
    const maskedBom = bom.map((item) => {
      redactedLines.push(
        `| ${item.partName} | ${item.quantity} | [내부원가 비공개] 규격적합품 견적제출 요망 |`
      );
      return {
        partName: item.partName,
        quantity: item.quantity,
        specNote: "[내부원가 비공개] 사양 규격 부합 견적제출 요망",
      };
    });

    return {
      maskedBom,
      rawMarkdown,
      redactedMarkdown: redactedLines.join("\n"),
    };
  }

  /**
   * 외주 RFP용 예산 마스킹 처리
   * - 사내 직접 인건비 및 마진율 감추고, 외주 용역 배정 예산(Outsourcing Scope)만 전달
   */
  public static maskBudgetForOutsourcing(
    budgetBreakdown: {
      directCost: number;
      laborCost: number;
      outsourcingCost: number;
      indirectCost: number;
    },
    targetTier: SecurityClassificationTier
  ): {
    rawMarkdown: string;
    redactedMarkdown: string;
  } {
    const total =
      budgetBreakdown.directCost +
      budgetBreakdown.laborCost +
      budgetBreakdown.outsourcingCost +
      budgetBreakdown.indirectCost;

    const rawMarkdown = `### 전체 프로젝트 예산 명세 (사내 원천본)
- 직접개발비: ${budgetBreakdown.directCost.toLocaleString()} 원
- 사내인건비: ${budgetBreakdown.laborCost.toLocaleString()} 원
- 외주개발비: ${budgetBreakdown.outsourcingCost.toLocaleString()} 원
- 간접사업비: ${budgetBreakdown.indirectCost.toLocaleString()} 원
- **합계 사업비: ${total.toLocaleString()} 원**`;

    if (targetTier === "L3_SECRET_CORE" || targetTier === "L2_CONFIDENTIAL") {
      return { rawMarkdown, redactedMarkdown: rawMarkdown };
    }

    const redactedMarkdown = `### 외주 용역 과업 예산 범위 (파트너 공시용)
- **외주 예정 배정 금액: 최대 ${budgetBreakdown.outsourcingCost.toLocaleString()} 원 한도 내 (VAT 별도)**
- ※ 사내 직접비, 사내 인건비 및 내부 원가 구조는 대외비(CONFIDENTIAL)로 비공개 처리되었습니다.
- ※ 제안사는 과업지시서의 기능 범위에 부합하는 세부 산출 내역서를 제출하여 주시기 바랍니다.`;

    return { rawMarkdown, redactedMarkdown };
  }
}
