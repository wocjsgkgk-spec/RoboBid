import {
  ProjectConcept,
  MasterSpecification,
} from "@/types/concept";
import {
  DerivationCategory,
  DocumentDerivationType,
  SecurityClassificationTier,
  SensitiveCategory,
  DerivedDocument,
  DerivedSection,
  CreateDerivationInput,
  ApproveDerivationInput,
} from "@/types/derivation";
import {
  SecurityRedactionEngine,
  TIER_REDACTION_POLICY,
} from "./security-redaction-engine";

/**
 * RoboBid AI v3.0 — Master Specification Document Derivation Service
 * 단일 Master Specification에서 정부사업, 사내개발, 외주발주(RFP), 사업화 문서 19종 파생
 */

interface SectionBlueprint {
  sectionCode: string;
  title: string;
  sourceSectionCode: string;
  sourceSectionTitle: string;
  sourceField: keyof MasterSpecification | keyof ProjectConcept;
  generator: (concept: ProjectConcept, spec: MasterSpecification) => string;
  defaultSensitiveCategories?: SensitiveCategory[];
}

export class DocumentDerivationService {
  /**
   * 문서 유형별 기본 보안 등급 반환
   */
  public static getDefaultSecurityTier(
    category: DerivationCategory,
    docType: DocumentDerivationType
  ): SecurityClassificationTier {
    switch (category) {
      case "INTERNAL":
        return "L3_SECRET_CORE"; // 사내용: 무삭제
      case "GOVERNMENT":
        return "L2_CONFIDENTIAL"; // 정부과제용: 영업비밀 보존
      case "OUTSOURCING":
        return "L1_PARTNER"; // 외주발주용: 원가/마진/내부전략 마스킹
      case "BUSINESS":
        return "L0_PUBLIC"; // 대외사업화용: 최고수준 마스킹
      default:
        return "L1_PARTNER";
    }
  }

  /**
   * 문서 유형별 한글 제목 반환
   */
  public static getDocumentTitle(
    conceptName: string,
    docType: DocumentDerivationType
  ): string {
    const titles: Record<DocumentDerivationType, string> = {
      // Government
      GOV_BUSINESS_PLAN: `[정부지원사업] ${conceptName} 사업계획서`,
      GOV_RND_PLAN: `[연구개발과제] ${conceptName} 연구개발계획서`,
      GOV_VALIDATION_PLAN: `[실증지원사업] ${conceptName} 현장 실증계획서`,
      GOV_STARTUP_PLAN: `[창업지원패키지] ${conceptName} 창업사업계획서`,
      GOV_TECH_DEV_PLAN: `[기술개발사업] ${conceptName} 기술개발계획서`,
      // Internal
      INTERNAL_DEV_PLAN: `[사내 기술문서] ${conceptName} 상세 개발계획서`,
      INTERNAL_WBS: `[일정관리] ${conceptName} WBS 공정관리표`,
      INTERNAL_BUDGET: `[원가예산] ${conceptName} 상세 실행예산서`,
      INTERNAL_BOM: `[자재사양] ${conceptName} BOM 및 부품조달 명세서`,
      INTERNAL_RISK: `[위험관리] ${conceptName} 기술 및 일정 리스크 매트릭스`,
      // Outsourcing
      OUTSOURCING_RFP: `[외주 발주] ${conceptName} 용역 제안요청서 (RFP)`,
      OUTSOURCING_TASK_SPEC: `[과업지시] ${conceptName} 외주 과업지시서`,
      OUTSOURCING_SPEC: `[기술사양] ${conceptName} 외주 제작사양서`,
      OUTSOURCING_ACCEPTANCE: `[품질검수] ${conceptName} 외주 검수기준서`,
      OUTSOURCING_DELIVERABLES: `[인도관리] ${conceptName} 외주 산출물 명세서`,
      // Business
      BUSINESS_PRODUCT_INTRO: `[제품소개] ${conceptName} 솔루션 소개서`,
      BUSINESS_MARKETABILITY: `[시장분석] ${conceptName} 시장성 및 경쟁우위 분석서`,
      BUSINESS_ROI: `[투자회수] ${conceptName} 고객 도입 ROI 분석서`,
      BUSINESS_SALES_STRATEGY: `[사업전략] ${conceptName} 사업화 및 판로전략서`,
    };

    return titles[docType] || `${conceptName} - ${docType}`;
  }

  /**
   * 문서 유형별 섹션 블루프린트 반환
   */
  private static getSectionBlueprints(
    docType: DocumentDerivationType
  ): SectionBlueprint[] {
    switch (docType) {
      // ==========================================
      // 1. OUTSOURCING — RFP (제안요청서)
      // ==========================================
      case "OUTSOURCING_RFP":
        return [
          {
            sectionCode: "RFP_01_OVERVIEW",
            title: "1. 사업 개요 및 발주 배경",
            sourceSectionCode: "PRODUCT_CONCEPT",
            sourceSectionTitle: "제품 컨셉 및 과업 배경",
            sourceField: "productConcept",
            generator: (c, s) =>
              `## 1. 사업 개요 및 발주 배경\n\n- **과업명**: ${c.name}\n- **발주 목적**: 본 프로젝트는 ${c.summary}를 구현하기 위해 외주 전문 협력업체를 선정하여 신속하고 신뢰성 높은 시스템 구축을 추진합니다.\n- **과업 기간**: 과제 착수일로부터 WBS 기준 단계별 수행\n- **추진 방향**: ${s.architectureSummary || "신뢰성 높은 분산 임베디드 아키텍처 구축"}`,
          },
          {
            sectionCode: "RFP_02_REQUIREMENTS",
            title: "2. 외주 개발 요구사항 및 기술 규격",
            sourceSectionCode: "TECH_ARCHITECTURE",
            sourceSectionTitle: "기술 아키텍처 및 H/W, S/W 사양",
            sourceField: "technicalArchitecture",
            defaultSensitiveCategories: ["PROTECTED_ARCHITECTURE", "NON_PUBLIC_LOGIC"],
            generator: (c, s) =>
              `## 2. 외주 개발 요구사항 및 기술 규격\n\n### 시스템 기술 구조\n${s.technicalArchitecture}\n\n### 센서 및 통신 인터페이스\n${s.sensorsAndComms.map((sc) => `- ${sc}`).join("\n")}\n\n### 대상 운용 환경\n${s.targetEnvironment}`,
          },
          {
            sectionCode: "RFP_03_KPI_ACCEPTANCE",
            title: "3. 주요 성능 목표치 (KPI) 및 검수 요건",
            sourceSectionCode: "KPIS",
            sourceSectionTitle: "정량적 목표 및 성능 검증 기준",
            sourceField: "kpis",
            generator: (c, s) =>
              `## 3. 주요 성능 목표치 (KPI) 및 검수 요건\n\n| 지표명 | 목표 규격 | 평가 방법 |\n| :--- | :--- | :--- |\n${s.kpis.map((k) => `| ${k.metricName} | ${k.targetValue} | ${k.evaluationMethod} |`).join("\n")}`,
          },
          {
            sectionCode: "RFP_04_WBS_SCHEDULE",
            title: "4. 과업 일정 및 마일스톤 관리",
            sourceSectionCode: "WBS_SUMMARY",
            sourceSectionTitle: "개발 WBS 및 단계별 일정",
            sourceField: "wbsSummary",
            generator: (c, s) =>
              `## 4. 과업 일정 및 마일스톤 관리\n\n${s.wbsSummary.map((w) => `- ${w}`).join("\n")}`,
          },
          {
            sectionCode: "RFP_05_BUDGET_SCOPE",
            title: "5. 과업 예산 범위 및 제안 안내",
            sourceSectionCode: "BUDGET_BREAKDOWN",
            sourceSectionTitle: "사업비 편성 및 외주 배정 예산",
            sourceField: "budgetBreakdown",
            defaultSensitiveCategories: ["FULL_BUDGET", "INTERNAL_COST"],
            generator: (c, s) =>
              SecurityRedactionEngine.maskBudgetForOutsourcing(s.budgetBreakdown, "L1_PARTNER").rawMarkdown,
          },
        ];

      // ==========================================
      // 2. OUTSOURCING — 과업지시서
      // ==========================================
      case "OUTSOURCING_TASK_SPEC":
        return [
          {
            sectionCode: "TASK_01_OBJECTIVE",
            title: "1. 과업의 목적 및 범위",
            sourceSectionCode: "OUTSOURCING_PLAN",
            sourceSectionTitle: "외주 추진 계획 및 과업 범위",
            sourceField: "outsourcingPlan",
            generator: (c, s) =>
              `## 1. 과업의 목적 및 범위\n\n- **과업 대상**: ${c.name}\n- **과업 범위**: ${s.outsourcingPlan || "기구 섀시 정밀 가공 및 전장 하네스 배선"}\n- **보안 분류**: ${s.securityClassification} (비밀유지계약서 NDA 날인 필수)`,
          },
          {
            sectionCode: "TASK_02_TECH_SPEC",
            title: "2. 세부 과업 사양 및 이행 조건",
            sourceSectionCode: "HW_SW_SPEC",
            sourceSectionTitle: "H/W 및 S/W 기술 사양",
            sourceField: "hwSwSpecifications",
            generator: (c, s) =>
              `## 2. 세부 과업 사양 및 이행 조건\n\n${JSON.stringify(s.hwSwSpecifications, null, 2)}\n\n- 운용 환경: ${s.targetEnvironment}`,
          },
          {
            sectionCode: "TASK_03_VERIFICATION",
            title: "3. 검수 및 검사 기준",
            sourceSectionCode: "VALIDATION_PLAN",
            sourceSectionTitle: "실증 및 검증 계획",
            sourceField: "validationPlan",
            generator: (c, s) =>
              `## 3. 검수 및 검사 기준\n\n- **검증 계획**: ${s.validationPlan}\n- **하자 보증**: 납품 검수 완료일로부터 12개월간 무상 하자보수`,
          },
        ];

      // ==========================================
      // 3. OUTSOURCING — 외주 사양서
      // ==========================================
      case "OUTSOURCING_SPEC":
        return [
          {
            sectionCode: "SPEC_01_SYSTEM",
            title: "1. 제작 사양 및 인터페이스 규격",
            sourceSectionCode: "SENSORS_COMMS",
            sourceSectionTitle: "센서 및 통신 규격",
            sourceField: "sensorsAndComms",
            generator: (c, s) =>
              `## 1. 제작 사양 및 인터페이스 규격\n\n- **연동 센서 및 버스 인터페이스**:\n${s.sensorsAndComms.map((i) => `  * ${i}`).join("\n")}`,
          },
          {
            sectionCode: "SPEC_02_PARTS_BOM",
            title: "2. 부품 사양 및 규격서 (BOM)",
            sourceSectionCode: "BOM_ESTIMATE",
            sourceSectionTitle: "부품 BOM 명세",
            sourceField: "bomEstimate",
            defaultSensitiveCategories: ["INTERNAL_COST"],
            generator: (c, s) =>
              SecurityRedactionEngine.maskBomForOutsourcing(s.bomEstimate, "L1_PARTNER").rawMarkdown,
          },
        ];

      // ==========================================
      // 4. OUTSOURCING — 검수기준서
      // ==========================================
      case "OUTSOURCING_ACCEPTANCE":
        return [
          {
            sectionCode: "ACC_01_KPIS",
            title: "1. 정량 성능 검수 항목 및 시험방법",
            sourceSectionCode: "KPIS",
            sourceSectionTitle: "목표 성능 지표",
            sourceField: "kpis",
            generator: (c, s) =>
              `## 1. 정량 성능 검수 항목 및 시험방법\n\n${s.kpis.map((k, idx) => `### 1.${idx + 1} ${k.metricName}\n- 목표치: ${k.targetValue}\n- 시험방법: ${k.evaluationMethod}`).join("\n\n")}`,
          },
        ];

      // ==========================================
      // 5. OUTSOURCING — 산출물 명세서
      // ==========================================
      case "OUTSOURCING_DELIVERABLES":
        return [
          {
            sectionCode: "DEL_01_LIST",
            title: "1. 최종 제출 산출물 목록",
            sourceSectionCode: "WBS_SUMMARY",
            sourceSectionTitle: "WBS 단계별 산출물",
            sourceField: "wbsSummary",
            generator: (c, s) =>
              `## 1. 최종 제출 산출물 목록\n\n1. 하드웨어 시작품 (가공품/어셈블리 일체)\n2. 소스코드 및 바이너리 일체 (Git 저장소 및 릴리즈 태그)\n3. 회로도, PCB 거버 파일, 기구 3D CAD 원본\n4. 공인시험성적서 또는 자체 시험 성적서\n5. 사용자 운용 매뉴얼 및 관리자 가이드`,
          },
        ];

      // ==========================================
      // 6. GOVERNMENT — 연구개발계획서 (R&D)
      // ==========================================
      case "GOV_RND_PLAN":
        return [
          {
            sectionCode: "RND_01_BACKGROUND",
            title: "1. 연구개발의 개요 및 필요성",
            sourceSectionCode: "PROBLEM_STATEMENT",
            sourceSectionTitle: "문제 정의 및 추진 배경",
            sourceField: "problemStatement",
            generator: (c, s) =>
              `## 1. 연구개발의 개요 및 필요성\n\n### 1.1 기술개발의 배경\n${c.problemStatement || c.summary}\n\n### 1.2 목표 TRL 수준\n현재 TRL: 3단계 -> 목표 TRL: ${c.targetTrl}단계 달성`,
          },
          {
            sectionCode: "RND_02_OBJECTIVES",
            title: "2. 연구개발의 최종 목표 및 핵심 성능 지표",
            sourceSectionCode: "KPIS",
            sourceSectionTitle: "핵심 성능 지표 (KPI)",
            sourceField: "kpis",
            generator: (c, s) =>
              `## 2. 연구개발의 최종 목표 및 핵심 성능 지표\n\n| 지표명 | 목표치 | 평가방법 | 가중치 |\n| :--- | :--- | :--- | :--- |\n${s.kpis.map((k) => `| ${k.metricName} | ${k.targetValue} | ${k.evaluationMethod} | 25% |`).join("\n")}`,
          },
          {
            sectionCode: "RND_03_CONTENT",
            title: "3. 연구개발 세부 내용 및 시스템 구성",
            sourceSectionCode: "TECH_ARCHITECTURE",
            sourceSectionTitle: "시스템 기술 아키텍처",
            sourceField: "technicalArchitecture",
            defaultSensitiveCategories: ["NON_PUBLIC_LOGIC"],
            generator: (c, s) =>
              `## 3. 연구개발 세부 내용 및 시스템 구성\n\n${s.technicalArchitecture}\n\n### AI 모델 사양\n${s.aiModelSpec || "정밀 인식 및 제어 AI 모델 구축"}`,
          },
          {
            sectionCode: "RND_04_SCHEDULE_TEAM",
            title: "4. 연구개발 추진 체계 및 일정 (WBS)",
            sourceSectionCode: "WBS_SUMMARY",
            sourceSectionTitle: "WBS 및 참여인력 편성",
            sourceField: "wbsSummary",
            generator: (c, s) =>
              `## 4. 연구개발 추진 체계 및 일정\n\n### 4.1 마일스톤\n${s.wbsSummary.map((w) => `- ${w}`).join("\n")}\n\n### 4.2 연구진 R&R\n${s.rolesAndResponsibilities.map((r) => `- **${r.role}** (${r.headCount}명): ${r.responsibility}`).join("\n")}`,
          },
          {
            sectionCode: "RND_05_BUDGET",
            title: "5. 연구개발비 소요 명세",
            sourceSectionCode: "BUDGET_BREAKDOWN",
            sourceSectionTitle: "비목별 연구개발비",
            sourceField: "budgetBreakdown",
            generator: (c, s) =>
              `## 5. 연구개발비 소요 명세\n\n- 직접비: ${s.budgetBreakdown.directCost.toLocaleString()} 원\n- 인건비: ${s.budgetBreakdown.laborCost.toLocaleString()} 원\n- 위탁연구/외주비: ${s.budgetBreakdown.outsourcingCost.toLocaleString()} 원\n- 간접비: ${s.budgetBreakdown.indirectCost.toLocaleString()} 원\n- **총 연구개발비: ${(s.budgetBreakdown.directCost + s.budgetBreakdown.laborCost + s.budgetBreakdown.outsourcingCost + s.budgetBreakdown.indirectCost).toLocaleString()} 원**`,
          },
        ];

      // ==========================================
      // 7. GOVERNMENT — 사업계획서
      // ==========================================
      case "GOV_BUSINESS_PLAN":
        return [
          {
            sectionCode: "BIZ_01_OVERVIEW",
            title: "1. 사업 개요 및 제품 컨셉",
            sourceSectionCode: "PRODUCT_CONCEPT",
            sourceSectionTitle: "제품 컨셉",
            sourceField: "productConcept",
            generator: (c) => `## 1. 사업 개요\n\n- 프로젝트명: ${c.name}\n- 요약: ${c.summary}\n- 타겟 고객: ${c.targetUser || "일반 산업체"}`,
          },
          {
            sectionCode: "BIZ_02_TECH",
            title: "2. 보유 기술 및 기술적 차별성",
            sourceSectionCode: "TECH_CONCEPT",
            sourceSectionTitle: "기술 컨셉",
            sourceField: "technicalConcept",
            generator: (c, s) => `## 2. 보유 기술 및 차별성\n\n${c.technicalConcept}\n\n- 아키텍처 개요: ${s.architectureSummary}`,
          },
          {
            sectionCode: "BIZ_03_MARKET",
            title: "3. 시장성 및 사업화 전략",
            sourceSectionCode: "MARKET_ANALYSIS",
            sourceSectionTitle: "시장 분석 및 매출 계획",
            sourceField: "marketAnalysis",
            generator: (c, s) => `## 3. 시장성 및 사업화 전략\n\n- 시장 동향: ${c.marketAnalysis || "성장 잠재력 우수"}\n- 비즈니스 모델: ${s.businessModel || c.salesModel}\n- 판로 전략: ${s.salesStrategy}`,
          },
        ];

      // ==========================================
      // 8. GOVERNMENT — 실증계획서
      // ==========================================
      case "GOV_VALIDATION_PLAN":
        return [
          {
            sectionCode: "VAL_01_TARGET",
            title: "1. 실증 대상 및 실증 목적",
            sourceSectionCode: "PRODUCT_CONCEPT",
            sourceSectionTitle: "제품 컨셉",
            sourceField: "productConcept",
            generator: (c, s) => `## 1. 실증 목적\n\n${c.productConcept}\n- 운용 환경: ${s.targetEnvironment}`,
          },
          {
            sectionCode: "VAL_02_PLAN",
            title: "2. 현장 실증 시나리오 및 성능 검증",
            sourceSectionCode: "VALIDATION_PLAN",
            sourceSectionTitle: "실증 계획",
            sourceField: "validationPlan",
            generator: (c, s) => `## 2. 현장 실증 시나리오\n\n${s.validationPlan}\n\n### 검증 KPI\n${s.kpis.map((k) => `- ${k.metricName}: ${k.targetValue} (${k.evaluationMethod})`).join("\n")}`,
          },
        ];

      // ==========================================
      // 9. GOVERNMENT — 창업사업계획서
      // ==========================================
      case "GOV_STARTUP_PLAN":
        return [
          {
            sectionCode: "STARTUP_01_PROBLEM",
            title: "1. 문제 인식 (Problem)",
            sourceSectionCode: "PROBLEM_STATEMENT",
            sourceSectionTitle: "문제 정의",
            sourceField: "problemStatement",
            generator: (c) => `## 1. 문제 인식\n\n${c.problemStatement || c.summary}`,
          },
          {
            sectionCode: "STARTUP_02_SOLUTION",
            title: "2. 해결 방안 (Solution)",
            sourceSectionCode: "PRODUCT_CONCEPT",
            sourceSectionTitle: "제품 컨셉",
            sourceField: "productConcept",
            generator: (c, s) => `## 2. 해결 방안\n\n${c.productConcept}\n\n- 핵심 기술: ${c.requiredTechnology.join(", ")}\n- 아키텍처: ${s.architectureSummary}`,
          },
          {
            sectionCode: "STARTUP_03_SCALEUP",
            title: "3. 성장 전략 (Scale-up)",
            sourceSectionCode: "SALES_STRATEGY",
            sourceSectionTitle: "사업화 전략",
            sourceField: "salesStrategy",
            generator: (c, s) => `## 3. 성장 전략\n\n${s.salesStrategy}\n- BM: ${s.businessModel}`,
          },
        ];

      // ==========================================
      // 10. GOVERNMENT — 기술개발계획서
      // ==========================================
      case "GOV_TECH_DEV_PLAN":
        return [
          {
            sectionCode: "TECH_01_SPEC",
            title: "1. 기술 사양 및 요구사항",
            sourceSectionCode: "HW_SW_SPEC",
            sourceSectionTitle: "H/W, S/W 사양",
            sourceField: "hwSwSpecifications",
            generator: (c, s) => `## 1. 기술 사양\n\n${JSON.stringify(s.hwSwSpecifications, null, 2)}`,
          },
          {
            sectionCode: "TECH_02_AI",
            title: "2. AI 모델 및 지능 알고리즘 구조",
            sourceSectionCode: "AI_MODEL_SPEC",
            sourceSectionTitle: "AI 모델 사양",
            sourceField: "aiModelSpec",
            defaultSensitiveCategories: ["NON_PUBLIC_LOGIC"],
            generator: (c, s) => `## 2. AI 모델 구조\n\n${s.aiModelSpec || "실시간 추론 알고리즘 최적화"}`,
          },
        ];

      // ==========================================
      // 11. INTERNAL — 개발계획
      // ==========================================
      case "INTERNAL_DEV_PLAN":
        return [
          {
            sectionCode: "INT_01_ARCH",
            title: "1. 내부 상세 아키텍처 및 모듈 연동",
            sourceSectionCode: "TECH_ARCHITECTURE",
            sourceSectionTitle: "기술 아키텍처",
            sourceField: "technicalArchitecture",
            generator: (c, s) => `## 1. 아키텍처\n\n${s.technicalArchitecture}`,
          },
          {
            sectionCode: "INT_02_WBS",
            title: "2. 개발 마일스톤 및 공정",
            sourceSectionCode: "WBS_SUMMARY",
            sourceSectionTitle: "WBS",
            sourceField: "wbsSummary",
            generator: (c, s) => `## 2. WBS\n\n${s.wbsSummary.map((w) => `- ${w}`).join("\n")}`,
          },
        ];

      // ==========================================
      // 12. INTERNAL — WBS
      // ==========================================
      case "INTERNAL_WBS":
        return [
          {
            sectionCode: "INT_WBS_01",
            title: "1. 전체 WBS 및 마일스톤",
            sourceSectionCode: "WBS_SUMMARY",
            sourceSectionTitle: "WBS",
            sourceField: "wbsSummary",
            generator: (c, s) => `## 1. WBS 상세\n\n${s.wbsSummary.map((w, idx) => `### Step ${idx + 1}\n- 내용: ${w}`).join("\n\n")}`,
          },
        ];

      // ==========================================
      // 13. INTERNAL — Budget
      // ==========================================
      case "INTERNAL_BUDGET":
        return [
          {
            sectionCode: "INT_BUDGET_01",
            title: "1. 사내 상세 실행 예산 편성",
            sourceSectionCode: "BUDGET_BREAKDOWN",
            sourceSectionTitle: "비목별 예산",
            sourceField: "budgetBreakdown",
            defaultSensitiveCategories: ["FULL_BUDGET", "INTERNAL_COST"],
            generator: (c, s) =>
              SecurityRedactionEngine.maskBudgetForOutsourcing(s.budgetBreakdown, "L3_SECRET_CORE").rawMarkdown,
          },
        ];

      // ==========================================
      // 14. INTERNAL — BOM
      // ==========================================
      case "INTERNAL_BOM":
        return [
          {
            sectionCode: "INT_BOM_01",
            title: "1. 부품 BOM 및 원가 명세 (사내 원천본)",
            sourceSectionCode: "BOM_ESTIMATE",
            sourceSectionTitle: "BOM 명세",
            sourceField: "bomEstimate",
            defaultSensitiveCategories: ["INTERNAL_COST"],
            generator: (c, s) =>
              SecurityRedactionEngine.maskBomForOutsourcing(s.bomEstimate, "L3_SECRET_CORE").rawMarkdown,
          },
        ];

      // ==========================================
      // 15. INTERNAL — Risk
      // ==========================================
      case "INTERNAL_RISK":
        return [
          {
            sectionCode: "INT_RISK_01",
            title: "1. 위험 분석 및 대응 계획",
            sourceSectionCode: "TARGET_ENVIRONMENT",
            sourceSectionTitle: "운용 환경 및 제약조건",
            sourceField: "targetEnvironment",
            generator: (c, s) =>
              `## 1. 위험 분석 및 대응 계획\n\n- 환경 리스크: ${s.targetEnvironment}\n- 기술 리스크: TRL ${c.targetTrl} 도달을 위한 인터페이스 오류 관리\n- 공급망 리스크: 주요 센서 및 모터 납기 모니터링`,
          },
        ];

      // ==========================================
      // 16. BUSINESS — 제품소개
      // ==========================================
      case "BUSINESS_PRODUCT_INTRO":
        return [
          {
            sectionCode: "BIZ_INTRO_01",
            title: "1. 제품 컨셉 및 핵심 경쟁력",
            sourceSectionCode: "PRODUCT_CONCEPT",
            sourceSectionTitle: "제품 컨셉",
            sourceField: "productConcept",
            generator: (c) =>
              `## 1. 혁신적인 ${c.name}\n\n${c.productConcept || c.summary}\n\n- 주요 특징: 차세대 지능형 자율 솔루션`,
          },
          {
            sectionCode: "BIZ_INTRO_02",
            title: "2. 도입 효과 및 차별화",
            sourceSectionCode: "PROBLEM_STATEMENT",
            sourceSectionTitle: "문제 정의",
            sourceField: "problemStatement",
            generator: (c) =>
              `## 2. 도입 효과\n\n기존 산업 현장의 고질적 문제(${c.problemStatement})를 해결하고 생산성을 30% 이상 혁신합니다.`,
          },
        ];

      // ==========================================
      // 17. BUSINESS — 시장성 분석
      // ==========================================
      case "BUSINESS_MARKETABILITY":
        return [
          {
            sectionCode: "BIZ_MKT_01",
            title: "1. 목표 시장 규모 및 성장성",
            sourceSectionCode: "MARKET_ANALYSIS",
            sourceSectionTitle: "시장 분석",
            sourceField: "marketAnalysis",
            generator: (c) =>
              `## 1. 시장 규모\n\n${c.marketAnalysis || "연평균 25% 이상 고속 성장 시장"}`,
          },
        ];

      // ==========================================
      // 18. BUSINESS — ROI 분석
      // ==========================================
      case "BUSINESS_ROI":
        return [
          {
            sectionCode: "BIZ_ROI_01",
            title: "1. 고객 투자 회수 기간 (ROI)",
            sourceSectionCode: "SALES_MODEL",
            sourceSectionTitle: "수익 모델",
            sourceField: "salesModel",
            generator: (c, s) =>
              `## 1. 고객 투자 회수 분석\n\n- 비즈니스 모델: ${s.businessModel || c.salesModel}\n- 예상 회수 기간: 도입 후 평균 14개월 내 투자비 회수 달성`,
          },
        ];

      // ==========================================
      // 19. BUSINESS — 판매전략
      // ==========================================
      case "BUSINESS_SALES_STRATEGY":
        return [
          {
            sectionCode: "BIZ_STRAT_01",
            title: "1. Go-to-Market 판매 전략",
            sourceSectionCode: "SALES_STRATEGY",
            sourceSectionTitle: "판로 전략",
            sourceField: "salesStrategy",
            defaultSensitiveCategories: ["INTERNAL_STRATEGY"],
            generator: (c, s) =>
              `## 1. 판매 및 판로 개척 전략\n\n${s.salesStrategy}\n\n- 가격 정책: ${s.businessModel || c.salesModel}`,
          },
        ];

      default:
        return [
          {
            sectionCode: "DEFAULT_01",
            title: "1. 개요",
            sourceSectionCode: "SUMMARY",
            sourceSectionTitle: "요약",
            sourceField: "summary",
            generator: (c) => c.summary,
          },
        ];
    }
  }

  /**
   * 단일 Master Specification에서 목적별 파생 문서 생성
   */
  public static derive(
    concept: ProjectConcept,
    spec: MasterSpecification,
    input: CreateDerivationInput
  ): DerivedDocument {
    const targetClassification =
      input.targetClassification ||
      this.getDefaultSecurityTier(input.category, input.documentType);

    const blueprints = this.getSectionBlueprints(input.documentType);
    const now = new Date().toISOString();

    const sections: DerivedSection[] = [];
    const allRedactedCategories: Set<SensitiveCategory> = new Set();
    let redactedCount = 0;

    blueprints.forEach((bp, index) => {
      const rawContent = bp.generator(concept, spec);

      // 자동 감지 민감 카테고리 + 블루프린트 기본 카테고리 + 사용자 커스텀 제외
      const detected = SecurityRedactionEngine.detectSensitiveCategories(rawContent);
      const combinedSensitive = Array.from(
        new Set([
          ...detected,
          ...(bp.defaultSensitiveCategories || []),
          ...(input.customExclusions || []),
        ])
      );

      // 보안 Redaction 수행
      const redactionResult = SecurityRedactionEngine.redactText(
        rawContent,
        targetClassification,
        combinedSensitive
      );

      if (redactionResult.isRedacted) {
        redactedCount++;
        redactionResult.appliedCategories.forEach((cat) =>
          allRedactedCategories.add(cat)
        );
      }

      sections.push({
        id: crypto.randomUUID(),
        sectionCode: bp.sectionCode,
        title: bp.title,
        orderIndex: index,
        sourceSectionCode: bp.sourceSectionCode,
        sourceSectionTitle: bp.sourceSectionTitle,
        sourceField: String(bp.sourceField),
        rawContent,
        redactedContent: redactionResult.redactedText,
        isRedacted: redactionResult.isRedacted,
        redactionTier: targetClassification,
        sensitiveCategories: combinedSensitive,
        redactionReason: redactionResult.reason,
      });
    });

    const docTitle =
      input.title || this.getDocumentTitle(concept.name, input.documentType);

    return {
      id: crypto.randomUUID(),
      projectConceptId: concept.id,
      masterSpecVersion: spec.version || "v1.0",
      category: input.category,
      documentType: input.documentType,
      title: docTitle,
      description: `${input.category} 용도 - ${concept.name}에서 파생된 보안 준수 문서`,
      targetAudience:
        input.category === "OUTSOURCING"
          ? "외주 개발사 및 용역 협력업체"
          : input.category === "GOVERNMENT"
          ? "정부 부처 및 전문 전담기관 평가위원회"
          : input.category === "INTERNAL"
          ? "사내 엔지니어링 및 경영진"
          : "투자자 및 잠재 고객사",
      targetClassification,
      sections,
      isApproved: false, // 사용자 승인 게이트 초기값 (반드시 사용자가 검토 후 승인해야 함)
      approvedBy: null,
      approvedAt: null,
      approvalNotes: null,
      redactionSummary: {
        totalSections: sections.length,
        redactedSections: redactedCount,
        redactedCategories: Array.from(allRedactedCategories),
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * 사용자 검토 및 승인 처리 (Gate 통과)
   */
  public static approve(
    document: DerivedDocument,
    input: ApproveDerivationInput
  ): DerivedDocument {
    if (!input.approvedBy || input.approvedBy.trim().length === 0) {
      throw new Error("승인자(검토자) 성명은 필수 입력 사항입니다.");
    }

    const now = new Date().toISOString();
    return {
      ...document,
      isApproved: true,
      approvedBy: input.approvedBy.trim(),
      approvedAt: now,
      approvalNotes: input.approvalNotes || "보안 마스킹 검토 후 승인 완료",
      updatedAt: now,
    };
  }

  /**
   * 파생 문서 내보내기 (Zero-Unauthorized-Export 게이트 적용)
   */
  public static exportToFormat(
    document: DerivedDocument,
    format: "markdown" | "html" | "json",
    useRedactedVersion: boolean = true
  ): string {
    // Gate Check: 미승인 문서는 보안 유출 방지를 위해 Export 차단
    if (!document.isApproved) {
      throw new Error(
        "보안 규정 위반: 사용자 검토 및 승인(Approval)을 거치지 않은 파생 문서는 외부로 내보낼 수 없습니다."
      );
    }

    if (format === "json") {
      return JSON.stringify(document, null, 2);
    }

    // Markdown 생성
    const lines: string[] = [];
    lines.push(`# ${document.title}`);
    lines.push(`\n**보안 등급**: ${document.targetClassification} | **대상**: ${document.targetAudience}`);
    lines.push(`**원천 마스터 스펙 버전**: ${document.masterSpecVersion} | **승인자**: ${document.approvedBy} (${document.approvedAt})`);
    if (document.redactionSummary.redactedSections > 0 && useRedactedVersion) {
      lines.push(
        `\n> [!NOTE]\n> 본 문서는 보안 Redaction 엔진에 의해 ${document.redactionSummary.redactedSections}개 섹션의 민감 정보(${document.redactionSummary.redactedCategories.join(", ")})가 마스킹 처리된 안전한 배포용 문서입니다.`
      );
    }
    lines.push("\n---\n");

    for (const section of document.sections) {
      lines.push(`\n<!-- [추적성 정보] 원천 섹션: ${section.sourceSectionTitle} (필드: ${section.sourceField}) -->`);
      const content = useRedactedVersion ? section.redactedContent : section.rawContent;
      lines.push(content);
      lines.push("\n");
    }

    const markdownOutput = lines.join("\n");

    if (format === "markdown") {
      return markdownOutput;
    }

    // Simple HTML 변환
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${document.title}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; }
h1, h2, h3 { color: #0f172a; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; }
th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
th { background-color: #f1f5f9; }
.badge { display: inline-block; padding: 4px 8px; border-radius: 4px; background: #e2e8f0; font-size: 12px; }
.redacted { color: #dc2626; font-weight: bold; }
</style>
</head>
<body>
${markdownOutput
  .replace(/^# (.*$)/gim, "<h1>$1</h1>")
  .replace(/^## (.*$)/gim, "<h2>$1</h2>")
  .replace(/^### (.*$)/gim, "<h3>$1</h3>")
  .replace(/\n/g, "<br/>")}
</body>
</html>`;
  }
}
