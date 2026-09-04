import {
  BidTemplate,
  SmartReuseItem,
  AgencyIntelligenceRecord,
  CapabilityGapItem,
  ExecutivePortfolioSummary,
  ConsortiumPartner,
  ProposalApprovalState,
  NotificationPreferenceConfig,
  ProposalVersionComparison,
} from "@/types/p1";

export class P1Store {
  private static instance: P1Store;

  // Stores
  private templates: Map<string, BidTemplate> = new Map();
  private reuseItems: SmartReuseItem[] = [];
  private agencyIntel: Map<string, AgencyIntelligenceRecord> = new Map();
  private partners: Map<string, ConsortiumPartner> = new Map();
  private approvals: Map<string, ProposalApprovalState> = new Map();
  private notificationPref: NotificationPreferenceConfig;

  private constructor() {
    this.notificationPref = {
      inAppNotificationEnabled: true,
      telegramNotificationEnabled: true,
      minOpportunityFitScore: 80,
      deadlineUrgentAlertDays: [7, 3, 1],
      certExpirationNoticeDays: 60,
      approvalRequiredImmediateAlert: true,
    };
    this.seedDefaults();
  }

  public static getInstance(): P1Store {
    if (!P1Store.instance) {
      P1Store.instance = new P1Store();
    }
    return P1Store.instance;
  }

  private seedDefaults() {
    // 1. Templates (14종 표준 서식)
    const defaultTemplates: BidTemplate[] = [
      {
        id: "tpl-rnd-01",
        name: "국가연구개발사업(R&D) 표준 사업계획서",
        category: "R_AND_D",
        description: "과기정통부, 중기부, 산업부 국가R&D 표준 5대 대목차 및 연구개발성과 지표 서식",
        targetAgency: "TIPA / IITP / KEIT",
        sections: [
          { code: "1.1", title: "연구개발 과제의 필요성", description: "국내외 시장 현황 및 문제점, 기술적 해결 필요성", recommendedWords: 1500, requiredEvidenceTypes: ["EXPERIENCE"], samplePrompt: "공모 배경과 기술적 파급효과 중심 작성" },
          { code: "1.2", title: "연구개발 최종 목표 및 개발 내용", description: "정량적 목표 규격 및 연차별 개발 범위", recommendedWords: 2000, requiredEvidenceTypes: ["TECHNOLOGY"], samplePrompt: "최종 산출물 및 TRL 7단계 달성 방안" },
          { code: "2.1", title: "시스템 아키텍처 및 세부 설계", description: "HW/SW 블록도, 핵심 알고리즘 및 회로도", recommendedWords: 2500, requiredEvidenceTypes: ["PATENT"], samplePrompt: "특허 기반 차별화 아키텍처 기술" },
          { code: "3.1", title: "연구개발 추진 일정 및 WBS", description: "마일스톤, 연차별 산출물 및 역할 분담", recommendedWords: 1000, requiredEvidenceTypes: [], samplePrompt: "Gantt 차트 연계 마일스톤 작성" },
          { code: "4.1", title: "연구개발비 소요명세서", description: "인건비, 연구장비비, 재료비 내역", recommendedWords: 1200, requiredEvidenceTypes: ["FINANCIAL", "EQUIPMENT"], samplePrompt: "정부 지원 규정에 맞춘 사업비 배분" },
        ],
        isStandard: true,
        tags: ["R&D", "TIPA", "정부지원", "표준"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "tpl-demo-02",
        name: "스마트물류·로봇 실증사업 제안서",
        category: "DEMONSTRATION",
        description: "실증 인프라 구축, 안전성 실증 및 현장 적용성 평가 중심의 실증사업 특화 양식",
        targetAgency: "조달청 / 지자체",
        sections: [
          { code: "1.1", title: "실증 대상지 현황 및 도입 목적", description: "물류창고 인프라 및 물동량 분석", recommendedWords: 1200, requiredEvidenceTypes: ["EXPERIENCE"], samplePrompt: "실증 부지 적합성 및 도입 타당성" },
          { code: "2.1", title: "실증 로봇 플랫폼 및 관제 연동", description: "AGV 하드웨어 사양 및 WMS 연동 프로토콜", recommendedWords: 2200, requiredEvidenceTypes: ["CERTIFICATION", "TECHNOLOGY"], samplePrompt: "SIL2 안전인증 및 ROS2 관제 연동 방안" },
          { code: "3.1", title: "현장 안전관리 및 비상대응 계획", description: "작업자 협동 안전구역 및 충돌방지 체계", recommendedWords: 1500, requiredEvidenceTypes: ["CERTIFICATION"], samplePrompt: "비상정지 및 안전인증 성적서 인용" },
        ],
        isStandard: true,
        tags: ["실증", "로봇", "AGV", "조달청"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "tpl-proc-03",
        name: "공공조달 규격 제안서 및 기술평가서",
        category: "PROCUREMENT",
        description: "나라장터 물품구매 적격심사 및 협상에 의한 계약 기술능력평가 대응 서식",
        targetAgency: "조달청(KONEPS)",
        sections: [
          { code: "1.1", title: "제안 제품 규격서 및 성능 대비표", description: "RFP 공고 규격과 제안 장비 1:1 대조표", recommendedWords: 1800, requiredEvidenceTypes: ["CERTIFICATION"], samplePrompt: "공인기관 시험성적서 기반 일치 여부 명시" },
          { code: "2.1", title: "품질 보증 및 하자보수 기술지원 체계", description: "24개월 무상 AS, 전국 긴급출동 네트워크", recommendedWords: 1200, requiredEvidenceTypes: ["EXPERIENCE"], samplePrompt: "AS 협력사 체계 및 SLA 4시간 출동" },
        ],
        isStandard: true,
        tags: ["조달청", "규격제안서", "물품구매", "SLA"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "tpl-decide-04",
        name: "경영진 의사결정용 GO/NO-GO 검토 보고서",
        category: "EVALUATION_SHEET",
        description: "입찰 공고 접수 후 사내 수주 추진 여부를 결정하기 위한 1페이지 요약 심의 보고서",
        targetAgency: "사내 경영회의",
        sections: [
          { code: "1.1", title: "공모 개요 및 전략적 적합도", description: "예산규모, 사업기간, 자사 로드맵 일치성", recommendedWords: 600, requiredEvidenceTypes: [], samplePrompt: "전략적 가치 및 기대 매출 요약" },
          { code: "1.2", title: "지원자격 및 실격 리스크 분석", description: "필수 자격 충족 여부 및 컨소시엄 필요성", recommendedWords: 800, requiredEvidenceTypes: ["CERTIFICATION"], samplePrompt: "실격 리스크 점검 및 파트너 참여 필요성" },
          { code: "1.3", title: "투찰가 및 원가 수익성 추정", description: "A값 반영 예상 투찰선 및 공헌이익률", recommendedWords: 600, requiredEvidenceTypes: ["FINANCIAL"], samplePrompt: "수익성 분석 및 최종 제언 (GO/HOLD/NO-GO)" },
        ],
        isStandard: true,
        tags: ["GO/NO-GO", "경영보고", "심의", "원가"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const tpl of defaultTemplates) {
      this.templates.set(tpl.id, tpl);
    }

    // 2. Smart Reuse Items
    this.reuseItems = [
      {
        id: "reuse-01",
        sourceProposalId: "prop-prev-won-2025",
        sourceProposalTitle: "2025 스마트물류혁신 자율이동로봇 구축사업 (선정 완료)",
        sectionCode: "2.1_TECH_ARCHITECTURE",
        sectionTitle: "2.1 시스템 아키텍처 및 자율주행 알고리즘",
        contentSnippet: "본 제안사는 3D LiDAR SLAM 및 EKF 센서 퓨전을 통해 실내 비마커 환경에서 ±10mm 위치추정 정밀도를 보장하는 자율이동로봇 관제 아키텍처를 구현합니다. 상위 물류 WMS와는 표준 ROS2 Bridge 및 RESTful API를 통해 초당 50회 이상의 텔레메트리를 지연 없이 교환합니다.",
        awardStatus: "WON",
        similarityScore: 94,
        reuseReason: "RFP의 '실내 비마커 SLAM 자율주행' 및 'WMS 연동' 필수 조건과 기술 스택이 94% 일치하며, 2025년 실제 평가위원 92.5점 최고득점으로 선정된 검증된 문안입니다.",
        matchedKeywords: ["LiDAR SLAM", "ROS2 Bridge", "WMS 연동", "위치추정 정밀도"],
        citationEvidenceIds: ["ev-pat-01", "ev-cert-01"],
      },
      {
        id: "reuse-02",
        sourceProposalId: "prop-prev-won-2024",
        sourceProposalTitle: "지자체 첨단물류센터 무인운반차(AGV) 실증 (선정 완료)",
        sectionCode: "3.2_QUANTITATIVE_KPI",
        sectionTitle: "3.2 정량적 목표 및 공인인증기관 시험성적서",
        contentSnippet: "공인시험기관(KTL)의 성능인증 기준에 의거하여, 주행 중 돌발 장애물 감지 시 0.45초 이내 급정동(기준: 0.5초 이하), 500kg 화물 적재 시 경사도 5도 등판능력 시험을 공인성적서(KTL-2024-ROBO-091)로 입증 완료하였습니다.",
        awardStatus: "WON",
        similarityScore: 89,
        reuseReason: "본 공모의 핵심 규격(500kg 가반하중, 급정동 0.5초)과 사내 기보유 KTL 성적서 측정 수치가 정확히 일치하여 평가위원 기술 신뢰도 확보에 최적입니다.",
        matchedKeywords: ["KTL 시험성적서", "급정동 시간", "가반하중", "등판능력"],
        citationEvidenceIds: ["ev-cert-01"],
      },
      {
        id: "reuse-03",
        sourceProposalId: "prop-prev-won-2025b",
        sourceProposalTitle: "국가연구개발 중소기업 기술혁신개발사업 (우수 과제)",
        sectionCode: "4.2_QUALITY_ASSURANCE",
        sectionTitle: "4.2 품질 보증 및 24개월 무상 유지보수 SLA 체계",
        contentSnippet: "수도권 및 영남권의 전문 로봇 CS 파트너사와 체결된 긴급 출동 기술지원 협약(SLA)에 따라, 장애 접수 후 2시간 내 원격 진단 착수 및 4시간 내 전문 엔지니어 현장 도착 프로세스를 가동합니다.",
        awardStatus: "HIGH_SCORE",
        similarityScore: 86,
        reuseReason: "RFP 품질보증 요구사항(24개월 무상, 4시간 출동)을 그대로 충족하며, 기존 협약서 첨부자산과 직결됩니다.",
        matchedKeywords: ["유지보수 SLA", "4시간 출동", "품질보증"],
        citationEvidenceIds: ["ev-exp-01"],
      },
    ];

    // 3. Agency Intelligence Records
    const agencies: AgencyIntelligenceRecord[] = [
      {
        id: "agency-tipa",
        agencyName: "중소기업기술정보진흥원 (TIPA)",
        agencyType: "RESEARCH_INST",
        annualBudgetRange: "연간 1.8조원",
        totalBidsCount: 8,
        wonBidsCount: 5,
        lostBidsCount: 3,
        winRatePercent: 62.5,
        evaluationFocusPatterns: [
          { axis: "사업화 계획", importance: "CRITICAL", description: "기술개발 후 3년 내 매출 실현 가능성 및 수요처 확약서(LOI/MOU) 필수 검토", tip: "수요기업의 실제 구매의향서 및 납품 레퍼런스 숫자를 1장에 전면 배치할 것" },
          { axis: "정량 KPI 공인인증", importance: "CRITICAL", description: "자체 평가 불인정, 공인시험기관(KTL, KTC 등) 입회시험 성적서 의무 요구", tip: "KPI 지표마다 측정 공인기관명과 시험규격을 명시할 것" },
          { axis: "연구인력 전담도", importance: "HIGH", description: "핵심 개발인력의 참여율(50% 이상) 및 유사 R&D 수행 이력 강조", tip: "석/박사급 총괄책임자의 관련 특허 등록 실적을 인력현황에 명기할 것" },
        ],
        recentAnnouncements: [
          { title: "중소기업 기술혁신개발사업(스마트물류)", budget: 600000000, year: 2025, outcome: "WON" },
          { title: "창업성장기술개발(디딤돌)", budget: 150000000, year: 2024, outcome: "WON" },
          { title: "산학연 Collabo R&D", budget: 300000000, year: 2024, outcome: "LOST" },
        ],
        internalStrategyNotes: "TIPA 과제는 기술 완성도보다 '실제 팔릴 것인가(수요처 확약)'에 평가 배점이 30% 이상 집중됨. 제안서 1.2장에 수요기업 구매의향서 표를 반드시 포함해야 승률이 올라감.",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "agency-koneps",
        agencyName: "조달청 (KONEPS)",
        agencyType: "CENTRAL_GOV",
        annualBudgetRange: "연간 70조원 공공구매",
        totalBidsCount: 12,
        wonBidsCount: 7,
        lostBidsCount: 5,
        winRatePercent: 58.3,
        evaluationFocusPatterns: [
          { axis: "A값 반영 투찰선", importance: "CRITICAL", description: "국민연금/건강보험 등 A값 비투찰 항목을 정확히 분리 계산해야 실격 면함", tip: "투찰가 시뮬레이터로 사정률 99.5%~100.5% 구간 A값 연계 최적 투찰선 확정" },
          { axis: "적격심사 신용평가", importance: "CRITICAL", description: "기업신용등급 BBB- 미만 시 경영상태 배점 감점으로 낙찰 불가", tip: "나이스디앤비 BBB+ 등급확인서 유효기간 갱신 여부 사전 체크" },
          { axis: "규격 적합성 100%", importance: "HIGH", description: "RFP 구매규격서의 1개 항목이라도 부적합 판정 시 기술입찰 실격", tip: "RTM 매트릭스에서 모든 필수 규격을 증빙과 1:1 대조할 것" },
        ],
        recentAnnouncements: [
          { title: "스마트 제조물류 자율이동로봇 실증장비", budget: 850000000, year: 2026, outcome: "ONGOING" },
          { title: "국가물류단지 무인 이송 시스템", budget: 1200000000, year: 2025, outcome: "WON" },
          { title: "공공기관 자동화 물류 1차분", budget: 450000000, year: 2024, outcome: "LOST" },
        ],
        internalStrategyNotes: "조달청은 규격서 한 줄이라도 누락되면 가차없이 실격시킴. 제안서 본문 작성보다 서류 규격 매칭과 적격심사 점수(경영상태 30점 만점) 사전 계산이 핵심.",
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const ag of agencies) {
      this.agencyIntel.set(ag.id, ag);
    }

    // 4. Consortium Partners
    const partnersList: ConsortiumPartner[] = [
      {
        id: "partner-01",
        companyName: "(주)한양정밀기계",
        businessNumber: "123-81-98765",
        region: "경기 화성",
        specialtyDomain: "특수 로봇 프레임 및 중하중 서스펜션 기구설계",
        coreCapabilities: ["500kg~1톤 AGV 차체 가공", "충격흡수 댐퍼", "FEA 유한요소해석"],
        certifications: ["ISO9001", "뿌리기업인증"],
        pastCollaborationCount: 4,
        ratingScore: 4.8,
        contactPerson: "최진수 이사",
        contactEmail: "jschoi@hanyang-mech.co.kr",
        contactPhone: "010-4492-1102",
        status: "ACTIVE",
        notes: "하드웨어 프레임 납기 정확성 및 도면 변경 대응력 매우 우수함.",
      },
      {
        id: "partner-02",
        companyName: "(주)넥스트세이프티인증",
        businessNumber: "214-87-54321",
        region: "서울 금천",
        specialtyDomain: "로봇 전자파적합성(KC) 및 기능안전(SIL/CE) 시험인증 대행",
        coreCapabilities: ["KTL/KTC 시험소 연계", "CE MD/EMC/LVD 기술문서(TCF) 작성", "위험성 평가"],
        certifications: ["공인시험기관 협력사", "기술사사무소"],
        pastCollaborationCount: 6,
        ratingScore: 4.9,
        contactPerson: "강동원 기술사",
        contactEmail: "dwkang@next-safe.com",
        contactPhone: "010-8821-3940",
        status: "ACTIVE",
        notes: "급정동 안전인증 및 방폭인증 시험 통과기간을 2주 단축시켜주는 핵심 파트너.",
      },
      {
        id: "partner-03",
        companyName: "대구경북로봇협동조합",
        businessNumber: "502-82-11223",
        region: "대구 달서",
        specialtyDomain: "영남권 지자체 공모사업 공동수급체(지역기업 참여 가점 3점)",
        coreCapabilities: ["대구/경북 지자체 로봇실증 레퍼런스", "현장 실증 인프라 지원"],
        certifications: ["비영리사단법인", "지역특화기관"],
        pastCollaborationCount: 2,
        ratingScore: 4.5,
        contactPerson: "박성호 사무국장",
        contactEmail: "shpark@dgrobot.or.kr",
        contactPhone: "053-580-9900",
        status: "ACTIVE",
        notes: "영남권 지자체 공모 지원 시 '지역기업 30% 이상 공동이행' 요건을 충족해주는 필수 컨소시엄 파트너.",
      },
    ];

    for (const p of partnersList) {
      this.partners.set(p.id, p);
    }
  }

  // --- Templates Methods ---
  public getTemplates(): BidTemplate[] {
    return Array.from(this.templates.values());
  }

  public getTemplateById(id: string): BidTemplate | undefined {
    return this.templates.get(id);
  }

  public saveCustomTemplate(template: BidTemplate): BidTemplate {
    template.updatedAt = new Date().toISOString();
    this.templates.set(template.id, template);
    return template;
  }

  // --- Smart Reuse Methods ---
  public getSmartReuseRecommendations(query?: string): SmartReuseItem[] {
    if (!query) return this.reuseItems;
    const q = query.toLowerCase();
    return this.reuseItems.filter(
      (item) =>
        item.sectionTitle.toLowerCase().includes(q) ||
        item.matchedKeywords.some((k) => k.toLowerCase().includes(q)) ||
        item.reuseReason.toLowerCase().includes(q)
    );
  }

  // --- Agency Intelligence Methods ---
  public getAgencyIntelligenceList(): AgencyIntelligenceRecord[] {
    return Array.from(this.agencyIntel.values());
  }

  public getAgencyIntelligence(id: string): AgencyIntelligenceRecord | undefined {
    return this.agencyIntel.get(id);
  }

  // --- Capability Gap Analysis ---
  public getCapabilityGapSummary(): {
    totalEvaluatedOpportunities: number;
    gaps: CapabilityGapItem[];
  } {
    return {
      totalEvaluatedOpportunities: 20,
      gaps: [
        {
          id: "gap-01",
          requiredItem: "로봇 전자파적합성(KC) 및 기능안전(SIL2) 공인인증",
          category: "CERTIFICATION",
          frequencyCount: 7,
          impactLevel: "FATAL_DISQUALIFICATION",
          description: "최근 검토된 조달·실증 공모 20건 중 7건에서 KTL 공인인증서를 필수 참가자격으로 요구함.",
          recommendedAction: "PARTNER_CONSOR",
          recommendedPartnerNames: ["(주)넥스트세이프티인증"],
        },
        {
          id: "gap-02",
          requiredItem: "지자체 지역기업 의무공동도급 요건 (30% 지분)",
          category: "REGION",
          frequencyCount: 5,
          impactLevel: "FATAL_DISQUALIFICATION",
          description: "지방자치단체 발주 공모에서 본사 소재지 외 지역기업과의 공동수급체 구성을 의무화함.",
          recommendedAction: "PARTNER_CONSOR",
          recommendedPartnerNames: ["대구경북로봇협동조합"],
        },
        {
          id: "gap-03",
          requiredItem: "ROS2 기반 로봇 소프트웨어 전문 엔지니어 (경력 5년 이상)",
          category: "HUMAN_RESOURCE",
          frequencyCount: 4,
          impactLevel: "HIGH_DEDUCTION",
          description: "대형 R&D 과제 심사 시 핵심 연구원의 ROS2 기여도 및 실적 배점 미달로 감점 발생 위험.",
          recommendedAction: "HIRE",
        },
      ],
    };
  }

  // --- Executive Portfolio Methods ---
  public getExecutivePortfolio(): ExecutivePortfolioSummary {
    return {
      totalPipelineBudget: 4250000000, // 42.5억원
      activeBidsCount: 8,
      d14UrgentCount: 4,
      highRiskCount: 2,
      proposalReadyCount: 3,
      pipelineBreakdown: {
        DISCOVERY: 3,
        INITIAL_INTEREST: 1,
        ELIGIBILITY_REVIEW: 2,
        TECH_EVALUATION: 2,
        BUSINESS_EVALUATION: 2,
        GO_CONFIRMED: 4,
        SUBMITTED: 1,
      },
      managerWorkloads: [
        { managerName: "김수석 (사업개발팀)", activeCount: 4, urgentCount: 2, totalBudget: 2100000000 },
        { managerName: "이책임 (로봇연구소)", activeCount: 3, urgentCount: 1, totalBudget: 1450000000 },
        { managerName: "박선임 (전략기획팀)", activeCount: 2, urgentCount: 1, totalBudget: 700000000 },
      ],
    };
  }

  // --- Consortium Partner Methods ---
  public getPartners(): ConsortiumPartner[] {
    return Array.from(this.partners.values());
  }

  public savePartner(partner: ConsortiumPartner): ConsortiumPartner {
    this.partners.set(partner.id, partner);
    return partner;
  }

  // --- Approval Workflow Methods ---
  public getProposalApproval(proposalId: string): ProposalApprovalState {
    if (this.approvals.has(proposalId)) {
      return this.approvals.get(proposalId)!;
    }
    const defaultApproval: ProposalApprovalState = {
      proposalId,
      currentStepIndex: 1, // 0: 작성자 완료, 1: 기술검토 대기
      isFullyApproved: false,
      canProceedToFinalSubmission: false,
      steps: [
        {
          stepIndex: 0,
          roleTitle: "1단계: 제안서 작성자 제출",
          reviewerName: "김수석 (사업개발팀)",
          status: "APPROVED",
          comment: "RFP RTM 요구조건 및 10대 축 1차 검토 완료하여 기술검토를 상신합니다.",
          approvedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          stepIndex: 1,
          roleTitle: "2단계: 기술 적합성 검토 (CTO / 연구소장)",
          reviewerName: "박연구소장 (CTO)",
          status: "IN_REVIEW",
          comment: "SLAM 군집제어 및 TRL 7단계 성능 성적서 대조 검토 중",
        },
        {
          stepIndex: 2,
          roleTitle: "3단계: 사업성 및 투찰가 심의 (사업개발이사)",
          reviewerName: "이이사 (사업본부)",
          status: "PENDING",
        },
        {
          stepIndex: 3,
          roleTitle: "4단계: 최종 대표이사 승인 (CEO Sign-off)",
          reviewerName: "정대표 (대표이사)",
          status: "PENDING",
        },
      ],
    };
    this.approvals.set(proposalId, defaultApproval);
    return defaultApproval;
  }

  public approveStep(proposalId: string, stepIndex: number, comment: string): ProposalApprovalState {
    const approval = this.getProposalApproval(proposalId);
    if (stepIndex >= approval.steps.length) return approval;

    approval.steps[stepIndex].status = "APPROVED";
    approval.steps[stepIndex].comment = comment;
    approval.steps[stepIndex].approvedAt = new Date().toISOString();

    if (stepIndex < approval.steps.length - 1) {
      approval.currentStepIndex = stepIndex + 1;
      approval.steps[stepIndex + 1].status = "IN_REVIEW";
    } else {
      approval.isFullyApproved = true;
      approval.canProceedToFinalSubmission = true;
    }

    this.approvals.set(proposalId, approval);
    return approval;
  }

  // --- Notification Preferences ---
  public getNotificationPreference(): NotificationPreferenceConfig {
    return this.notificationPref;
  }

  public updateNotificationPreference(updates: Partial<NotificationPreferenceConfig>): NotificationPreferenceConfig {
    this.notificationPref = { ...this.notificationPref, ...updates };
    return this.notificationPref;
  }
}

export const p1Store = P1Store.getInstance();
