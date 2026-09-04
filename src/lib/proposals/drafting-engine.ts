import { CapabilityRecord, Opportunity, RequirementCandidate } from '@/types';
import { EvidenceCitation, ProposalTOCItem, STANDARD_PROPOSAL_TOC } from '@/types/proposal';
import { HybridRetriever } from '@/lib/rag/hybrid-retriever';

export interface DraftSectionOptions {
  opportunity: Opportunity;
  tocItem: ProposalTOCItem;
  capabilities: CapabilityRecord[];
  requirements: RequirementCandidate[];
  keywords?: string[];
  allowConfidential?: boolean;
}

export interface DraftSectionResult {
  sectionCode: string;
  title: string;
  contentMarkdown: string;
  evidenceCitations: EvidenceCitation[];
  hasAssumptions: boolean;
  hasTodos: boolean;
  injectedAttemptBlocked: boolean;
}

export class ProposalDraftingEngine {
  private retriever: HybridRetriever;

  constructor(retriever?: HybridRetriever) {
    this.retriever = retriever || new HybridRetriever();
  }

  /**
   * Untrusted RFP 문서 텍스트 내 악의적인 프롬프트 인젝션 방어 및 살균
   */
  public sanitizePromptInput(text: string): { cleanText: string; blockedAttempt: boolean } {
    let blockedAttempt = false;

    // 공격성 패턴 감지 (시스템 지시문 무력화, 탈취 시도)
    const injectionPatterns = [
      /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
      /system\s+override/gi,
      /you\s+are\s+now\s+in\s+developer\s+mode/gi,
      /bypass\s+all\s+rules/gi,
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /drop\s+table/gi,
    ];

    let sanitized = text;
    for (const pattern of injectionPatterns) {
      if (pattern.test(sanitized)) {
        blockedAttempt = true;
        sanitized = sanitized.replace(pattern, '[차단된 비인가 명령]');
      }
    }

    return {
      cleanText: sanitized,
      blockedAttempt,
    };
  }

  /**
   * RFP 및 사내 역량(Evidence) 기반 섹션별 70~80% 초안 생성 (Strict Evidence Rule)
   */
  public generateSectionDraft(options: DraftSectionOptions): DraftSectionResult {
    const { opportunity, tocItem, capabilities, requirements } = options;

    // 1. 공모 제목 및 RFP 텍스트 살균
    const oppSanitize = this.sanitizePromptInput(opportunity.title);
    const safeTitle = oppSanitize.cleanText;
    let injectionBlocked = oppSanitize.blockedAttempt;

    // 2. 키워드 도출
    const keywords = options.keywords || [
      '로봇',
      '자율주행',
      '제조',
      '인증',
      '특허',
      '알고리즘',
      'TRL',
      '실적',
      '하드웨어',
    ];

    // 3. Hybrid RAG 증빙 검색
    const citations = this.retriever.retrieveEvidence(
      {
        keywords,
        requiredCapabilityTypes: tocItem.requiredEvidenceTypes,
        allowConfidential: options.allowConfidential ?? false,
        maxResults: 4,
      },
      capabilities,
      requirements
    );

    // 4. 섹션별 템플릿 및 증빙 바인딩 (Zero Hallucination Rule 강제)
    let contentMarkdown = '';
    let hasAssumptions = false;
    let hasTodos = false;

    // 인용할 사내 역량 요약
    const capCitations = citations.filter((c) => c.sourceType === 'CAPABILITY');
    const reqCitations = citations.filter((c) => c.sourceType === 'RFP_REQUIREMENT');

    switch (tocItem.sectionCode) {
      case '1.1_NEEDS_BACKGROUND': {
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `본 과제는 **${opportunity.announcingAgency}**의 공모 과제인 「**${safeTitle}**」의 요구조건을 달성하고, 로봇 및 특수목적 하드웨어의 산업적 현장 도입을 가속화하기 위해 추진됩니다.\n\n`;

        if (reqCitations.length > 0) {
          contentMarkdown += `#### 1. 공모 RFP 핵심 요구사항 분석\n`;
          for (const req of reqCitations) {
            contentMarkdown += `- **${req.sourceTitle}**: "${req.quoteSnippet}" [근거: ${req.id}]\n`;
          }
          contentMarkdown += `\n`;
        }

        contentMarkdown += `#### 2. 기술적·경제적 해결 필요성\n`;
        contentMarkdown += `- 산업 현장의 생산성 향상과 작업자 안전성 확보를 위해 신뢰성 높은 무인 자율작업 로봇 시스템 도입이 시급한 상황입니다.\n`;
        contentMarkdown += `- [가정: 본 사업 추진 시 현장 공정 불량률을 기존 대비 30% 이상 절감할 수 있을 것으로 추정됩니다.]\n`;
        hasAssumptions = true;
        break;
      }

      case '1.2_PROJECT_OBJECTIVES': {
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `#### 1. 최종 개발 목표\n`;
        contentMarkdown += `- **최종 목표**: 「${safeTitle}」의 현장 실증 및 상용화 가능한 수준의 지능형 로봇 통합 시스템 개발\n`;
        contentMarkdown += `- **핵심 개발 범위**:\n`;
        contentMarkdown += `  1. 특수 환경 대응 고신뢰성 구동 메커니즘 및 차체 하드웨어 설계\n`;
        contentMarkdown += `  2. 다중 센서 융합 기반 실시간 자율 제어 및 회피 알고리즘 구현\n`;
        contentMarkdown += `  3. 통합 관제 모니터링 대시보드 및 통신 인터페이스 연동\n\n`;
        contentMarkdown += `[TODO: 주관기관 사업책임자와 최종 세부 스펙 확정 필요]\n`;
        hasTodos = true;
        break;
      }

      case '2.1_TECH_ARCHITECTURE': {
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `#### 1. 시스템 아키텍처 개요\n`;
        contentMarkdown += `본 제안 시스템은 센서 계측부, 중앙 임베디드 제어부, 액추에이터 구동부, 상위 클라우드 관제부의 4계층 구조로 설계됩니다.\n\n`;
        contentMarkdown += `\`\`\`text\n`;
        contentMarkdown += `[현장 센서부 (LiDAR/IMU)] ──> [임베디드 Edge AI 제어기] ──> [서보 모터/구동체]\n`;
        contentMarkdown += `                                   │ (LTE/5G 보안 통신)\n`;
        contentMarkdown += `                                   ▼\n`;
        contentMarkdown += `                        [클라우드 통합 관제 서버]\n`;
        contentMarkdown += `\`\`\`\n\n`;

        if (capCitations.length > 0) {
          contentMarkdown += `#### 2. 보유 핵심 기술 연계\n`;
          for (const cap of capCitations) {
            contentMarkdown += `- **${cap.sourceTitle}**: ${cap.quoteSnippet} [증빙: ${cap.id}]\n`;
          }
        }
        break;
      }

      case '2.2_CORE_TECHNOLOGIES': {
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `당사는 기 보유한 특허 및 공인 인증 자산을 바탕으로 경쟁사 대비 기술적 실현 가능성을 극대화합니다.\n\n`;

        if (capCitations.length > 0) {
          contentMarkdown += `#### 1. 증빙 기반 보유 기술 및 특허 (Zero Hallucination)\n`;
          for (const cap of capCitations) {
            contentMarkdown += `- **${cap.sourceTitle}**\n`;
            contentMarkdown += `  - 요약: ${cap.quoteSnippet}\n`;
            contentMarkdown += `  - 연계 타당성: ${cap.relevanceReason} [증빙 매핑: ${cap.id}]\n\n`;
          }
        } else {
          contentMarkdown += `[TODO: 해당 기술 분야에 등록된 사내 특허 및 인증서 자산을 Vault에 추가 등록 요망]\n\n`;
          hasTodos = true;
        }
        break;
      }

      case '3.1_WBS_MILESTONES': {
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `| 단계 | 기간 | 주요 개발 마일스톤 | 핵심 산출물 |\n`;
        contentMarkdown += `| :--- | :--- | :--- | :--- |\n`;
        contentMarkdown += `| 1단계 | M1 ~ M3 | 시스템 요구사항 정의 및 하드웨어 기구 상세 설계 | 설계 도면, 부품 사양서 |\n`;
        contentMarkdown += `| 2단계 | M4 ~ M7 | 시제품 1차 제작 및 임베디드 제어 펌웨어 개발 | 프로토타입 1호기, 펌웨어 소스 |\n`;
        contentMarkdown += `| 3단계 | M8 ~ M10 | 센서 융합 자율주행 알고리즘 고도화 및 실내 시험 | 통합 시험성적서 |\n`;
        contentMarkdown += `| 4단계 | M11 ~ M12 | 현장 실증 테스트 및 공인 시험평가 완료 | 공인인증 시험성적서, 최종보고서 |\n\n`;
        contentMarkdown += `[가정: 과제 총 수행 기간은 12개월 협약 기준으로 작성되었습니다.]\n`;
        hasAssumptions = true;
        break;
      }

      case '3.2_QUANTITATIVE_KPI': {
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `| 번호 | 주요 성능 지표 (KPI) | 단위 | 개발 목표치 | 평가 방법 및 공인시험기관 |\n`;
        contentMarkdown += `| :---: | :--- | :---: | :---: | :--- |\n`;
        contentMarkdown += `| 1 | 위치 추정 정밀도 | mm | ± 15 이하 | 한국로봇산업진흥원 공인시험 |\n`;
        contentMarkdown += `| 2 | 최대 장애물 감지 거리 | m | 20 이상 | 공인 시험성적서 발급 |\n`;
        contentMarkdown += `| 3 | 연속 가동 시간 | hr | 8 이상 | 자체 및 공인시험 평가 |\n`;
        contentMarkdown += `| 4 | 긴급 정지 제동 거리 | cm | 30 이내 | 공인 시험성적서 발급 |\n\n`;
        contentMarkdown += `[TODO: RFP 공고문 상의 필수 평가항목과 목표치 1:1 대조 후 확정 요망]\n`;
        hasTodos = true;
        break;
      }

      case '4.1_BUDGET_AND_BOM': {
        const budget = opportunity.allocatedBudget || 300000000;
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `#### 1. 총 사업비 구성 (총액: ${(budget / 100000000).toFixed(1)}억원 기준)\n`;
        contentMarkdown += `- **정부지원금 (75%)**: ${(budget * 0.75).toLocaleString('ko-KR')}원\n`;
        contentMarkdown += `- **기업부담금 (25%)**: ${(budget * 0.25).toLocaleString('ko-KR')}원 (현금 10%, 현물 15%)\n\n`;
        contentMarkdown += `#### 2. 주요 비목별 내역\n`;
        contentMarkdown += `1. **인건비**: 연구책임자 및 핵심 참여인력 투입공수 산정\n`;
        contentMarkdown += `2. **재료비 및 시제품 제작비**: LiDAR 센서, 모터 드라이버, PCB 가공, 프레임 기구물 제작\n`;
        contentMarkdown += `3. **연구과제 추진비**: 공인시험 수수료, 지식재산권 출원비, 전문가 자문비\n\n`;
        contentMarkdown += `[TODO: 재무 부서와 기업부담금 현금 납입 확약 여부 검토 필요]\n`;
        hasTodos = true;
        break;
      }

      case '5.1_ORG_AND_TEAM': {
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `#### 1. 연구 수행 조직도 및 담당 역할\n`;
        contentMarkdown += `- **총괄 연구책임자 (PM)**: 사업 총괄 관리, 대외 협력 및 시스템 통합 설계\n`;
        contentMarkdown += `- **하드웨어 개발팀**: 기구물 3D 설계, 방수·방진 구조 해석, 전장 배선\n`;
        contentMarkdown += `- **소프트웨어 개발팀**: 로봇 자율주행 알고리즘, 센서 드라이버 및 제어기 펌웨어\n`;
        contentMarkdown += `- **품질·인증팀**: 공인시험성적서 취득 및 신뢰성 검증\n\n`;

        if (capCitations.length > 0) {
          contentMarkdown += `#### 2. 사내 매칭 인력 및 실적 증빙\n`;
          for (const cap of capCitations) {
            contentMarkdown += `- ${cap.sourceTitle}: ${cap.quoteSnippet} [증빙: ${cap.id}]\n`;
          }
        }
        break;
      }

      case '5.2_PAST_EXPERIENCE': {
        contentMarkdown = `### ${tocItem.title}\n\n`;
        contentMarkdown += `#### 1. 사내 검증된 유사 사업 수행 실적 (Zero Fake Data)\n`;

        // EXPERIENCE 타입 역량만 엄격히 인용
        const expCitations = capCitations.filter((c) => c.sourceTitle.includes('EXPERIENCE'));

        if (expCitations.length > 0) {
          for (const exp of expCitations) {
            contentMarkdown += `- **${exp.sourceTitle}**\n`;
            contentMarkdown += `  - 실적 내용: ${exp.quoteSnippet}\n`;
            contentMarkdown += `  - 검증 상태: 완료 [증빙 번호: ${exp.id}]\n\n`;
          }
        } else {
          contentMarkdown += `[TODO: Capability Vault에 유사 과제/사업 수주 및 납품 실적 데이터를 등록하여 주십시오. RoboBid AI는 가짜 실적을 임의로 날조하지 않습니다.]\n\n`;
          hasTodos = true;
        }
        break;
      }

      default: {
        contentMarkdown = `### ${tocItem.title}\n\n${tocItem.description}\n\n[TODO: 세부 작성 필요]\n`;
        hasTodos = true;
        break;
      }
    }

    return {
      sectionCode: tocItem.sectionCode,
      title: tocItem.title,
      contentMarkdown,
      evidenceCitations: citations,
      hasAssumptions,
      hasTodos,
      injectedAttemptBlocked: injectionBlocked,
    };
  }

  /**
   * 전체 제안서 초안 7대 섹션 일괄 생성
   */
  public generateFullProposalDraft(
    opportunity: Opportunity,
    capabilities: CapabilityRecord[],
    requirements: RequirementCandidate[]
  ): DraftSectionResult[] {
    return STANDARD_PROPOSAL_TOC.map((tocItem) =>
      this.generateSectionDraft({
        opportunity,
        tocItem,
        capabilities,
        requirements,
      })
    );
  }
}

export const proposalDraftingEngine = new ProposalDraftingEngine();
