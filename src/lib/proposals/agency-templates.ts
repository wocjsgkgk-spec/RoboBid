import { ProposalTOCItem } from "@/types/proposal";

export type PublicAgencyType = "KONEPS" | "NIPA_NIA" | "TIPA_MSS" | "IRIS_RND";

export interface AgencyTemplateConfig {
  agencyType: PublicAgencyType;
  name: string;
  shortName: string;
  description: string;
  primaryBidTypes: string[];
  sections: ProposalTOCItem[];
  evaluationFocus: string;
  mandatoryDocuments: string[];
}

export const AGENCY_TEMPLATES: Record<PublicAgencyType, AgencyTemplateConfig> = {
  KONEPS: {
    agencyType: "KONEPS",
    name: "조달청 나라장터 (협상에 의한 계약)",
    shortName: "조달청 기술제안서",
    description: "공공 조달 및 용역/물품 입찰 표준 5대 기술제안서 서식",
    primaryBidTypes: ["PROCUREMENT"],
    evaluationFocus: "기술능력평가(80~90%) + 입찰가격평가(10~20%)",
    mandatoryDocuments: [
      "기술제안서 원본 및 요약본 (HWP/HWPX 또는 PDF)",
      "신용평가등급 확인서 (공공기관 제출용)",
      "최근 3년 이내 유사물품/용역 납품 실적증명원",
      "소기업·소상공인 확인서 또는 벤처·이노비즈 확인서",
      "보안서약서 및 청렴계약이행서약서",
    ],
    sections: [
      {
        sectionCode: "K1_OVERVIEW",
        title: "1. 제안 개요",
        description: "제안의 배경 및 목적, 추진방향, 제안의 특장점 및 기대효과",
        requiredEvidenceTypes: ["EXPERIENCE", "TECHNOLOGY"],
        defaultPromptGoal: "발주기관의 사업 목적에 부합하는 제안 배경과 타사 대비 차별적 특장점을 요약 기술합니다.",
      },
      {
        sectionCode: "K2_COMPANY_PROFILE",
        title: "2. 제안사 일반현황 및 역량",
        description: "일반현황 및 연혁, 자본금 및 최근 3개년 재무구조, 주요 유사 사업 실적",
        requiredEvidenceTypes: ["FINANCIAL", "EXPERIENCE", "CERTIFICATION"],
        defaultPromptGoal: "사내 결산 재무현황 및 조달청 실적증명원 증빙을 인용하여 수행 안정성을 입증합니다.",
      },
      {
        sectionCode: "K3_TECH_IMPLEMENTATION",
        title: "3. 사업수행부문 (기술 및 아키텍처)",
        description: "목표 시스템 규격, 하드웨어/소프트웨어 구성도, 핵심기술 구현 방안 및 특허",
        requiredEvidenceTypes: ["TECHNOLOGY", "PATENT"],
        defaultPromptGoal: "특허 및 TRL 인증 기술을 바탕으로 요구 규격을 100% 충족하는 아키텍처를 제시합니다.",
      },
      {
        sectionCode: "K4_PROJECT_MANAGEMENT",
        title: "4. 사업관리부문 (일정, 품질, 보안)",
        description: "추진 일정 계획(WBS), 품질보증 체계, 시험평가 방안, 정보보안 및 위험관리",
        requiredEvidenceTypes: ["CERTIFICATION"],
        defaultPromptGoal: "공정별 상세 마일스톤 및 공인시험인증 연계 품질관리 절차를 기술합니다.",
      },
      {
        sectionCode: "K5_SUPPORT_MAINTENANCE",
        title: "5. 지원부문 (유지보수 및 기술이전)",
        description: "하자보수 및 긴급 장애 대응 체계, 사용자 교육훈련 계획, 기술이전 방안",
        requiredEvidenceTypes: ["HUMAN_RESOURCE"],
        defaultPromptGoal: "납품 후 1~2년 무상 하자보수 SLA 및 전문 엔지니어 기술지원 계획을 명문화합니다.",
      },
    ],
  },
  NIPA_NIA: {
    agencyType: "NIPA_NIA",
    name: "NIPA / NIA (AI·ICT 바우처 및 실증 사업)",
    shortName: "ICT·AI 실증계획서",
    description: "인공지능 융합, ICT 바우처, 실증 지원사업 표준 사업계획서",
    primaryBidTypes: ["SUBSIDY_SUPPORT", "R_AND_D"],
    evaluationFocus: "사업 타당성(30%) + 기술성 및 실증 우수성(40%) + 사업화 가능성(30%)",
    mandatoryDocuments: [
      "AI·ICT 사업계획서 및 실증 계획서",
      "도입기관(수요기업) 확약서 또는 업무협약서(MOU)",
      "인공지능 모델 시험성적서 또는 알고리즘 검증 자료",
      "참여연구원 인건비 계상 증빙(원천징수이행상황신고서)",
      "사업비 비목별 산출내역서",
    ],
    sections: [
      {
        sectionCode: "N1_PROJECT_NEED",
        title: "1. 사업 개요 및 추진 필요성",
        description: "과제 개요, 국내외 AI/ICT 시장 현황, 수요기관의 문제점 및 해결 방안",
        requiredEvidenceTypes: ["EXPERIENCE", "TECHNOLOGY"],
        defaultPromptGoal: "수요처의 실제 Pain Point를 AI 기술로 해결하는 시급성과 파급효과를 강조합니다.",
      },
      {
        sectionCode: "N2_TECH_AND_VERIFICATION",
        title: "2. 기술 개발 및 현장 실증 내용",
        description: "핵심 알고리즘 구조, 엣지/클라우드 시스템 아키텍처, 실증 환경 구축 계획",
        requiredEvidenceTypes: ["TECHNOLOGY", "PATENT"],
        defaultPromptGoal: "보유 특허 및 TRL 7단계 알고리즘의 현장 실증 시나리오와 실증 목표치를 구체화합니다.",
      },
      {
        sectionCode: "N3_PERFORMANCE_KPI",
        title: "3. 최종 목표 및 정량적 성능지표 (KPI)",
        description: "인식 정확도, 추론 속도 등 공인시험기관(KTL/KTR) 평가 기준 및 목표치",
        requiredEvidenceTypes: ["CERTIFICATION"],
        defaultPromptGoal: "KTL 등 공인인증기관 시험성적서 발급이 확약된 정량적 KPI 지표를 설정합니다.",
      },
      {
        sectionCode: "N4_BUDGET_AND_TIMELINE",
        title: "4. 사업비 편성 및 추진 일정",
        description: "클라우드/서버 인프라 구축비, 알고리즘 최적화 인건비, 분기별 WBS 마일스톤",
        requiredEvidenceTypes: ["FINANCIAL"],
        defaultPromptGoal: "정부 지원금과 민간부담금(현금/현물) 규정에 부합하도록 사업비를 투명하게 산출합니다.",
      },
      {
        sectionCode: "N5_COMMERCIALIZATION",
        title: "5. 사업화 전략 및 고용 창출 효과",
        description: "수요기업 도입 후 확산 방안, 국내외 시장 진출 전략, 신규 청년인력 채용 계획",
        requiredEvidenceTypes: ["EXPERIENCE"],
        defaultPromptGoal: "실제 도입 수요 기반의 연차별 매출 목표 및 신규 인력 채용 계획을 구체적으로 제시합니다.",
      },
    ],
  },
  TIPA_MSS: {
    agencyType: "TIPA_MSS",
    name: "중기부 / TIPA (중소기업 R&D 과제)",
    shortName: "중기부 연구개발계획서",
    description: "디딤돌, TIPS, 혁신성장 등 중소기업 상용화 기술개발 표준 서식",
    primaryBidTypes: ["R_AND_D"],
    evaluationFocus: "기술성(40%) + 개발능력(30%) + 사업성 및 고용성과(30%)",
    mandatoryDocuments: [
      "연구개발계획서 (Part 1, Part 2)",
      "연구시설·장비 보유 현황서",
      "중소기업 확인서 (소상공인/소기업/중기업 구분)",
      "연구개발기관 대표자의 참여의사 확인서 및 청렴서약서",
      "최근 2개년 회계감사보고서 또는 재무제표",
    ],
    sections: [
      {
        sectionCode: "T1_RESEARCH_BACKGROUND",
        title: "1. 연구개발과제의 개요 및 필요성",
        description: "기술개발의 개념, 제안 기술의 독창성 및 기존 한계 극복 방안",
        requiredEvidenceTypes: ["TECHNOLOGY", "PATENT"],
        defaultPromptGoal: "사내 특허 기반의 독창적 아이디어와 상용화 필요성을 학술적·산업적으로 입증합니다.",
      },
      {
        sectionCode: "T2_OBJECTIVES_AND_CONTENT",
        title: "2. 연구개발의 목표 및 내용",
        description: "최종 개발 목표, 연차별 세부 개발 내용, 세계 최고 수준(선진사) 대비 정량 목표",
        requiredEvidenceTypes: ["TECHNOLOGY", "CERTIFICATION"],
        defaultPromptGoal: "선진 경쟁사 대비 기술적 우위 항목과 정량적 성능 지표(세계최고수준 비교)를 명시합니다.",
      },
      {
        sectionCode: "T3_TEAM_AND_INFRA",
        title: "3. 연구개발 수행 역량 (인력 및 장비)",
        description: "연구책임자 실적, 기업부설연구소 전담연구원 편성, 보유 연구장비 활용 계획",
        requiredEvidenceTypes: ["CERTIFICATION", "EXPERIENCE"],
        defaultPromptGoal: "기업부설연구소 인정서 및 석박사급 연구진 이력을 바탕으로 연구 역량을 증명합니다.",
      },
      {
        sectionCode: "T4_BUDGET_ESTIMATION",
        title: "4. 연구개발비 산정 및 소요 내역",
        description: "연구활동비, 시제품제작비, 연구재료비, 청년연구원 인건비 산정",
        requiredEvidenceTypes: ["FINANCIAL"],
        defaultPromptGoal: "중기부 R&D 사업비 관리 규정에 따른 비목별 상세 사용 내역을 작성합니다.",
      },
      {
        sectionCode: "T5_BUSINESS_PLAN",
        title: "5. 연구개발 성과 활용 및 사업화 계획",
        description: "특허 등록 및 표준화 전략, 양산화 생산 계획, 3개년 국내외 매출 및 고용 창출",
        requiredEvidenceTypes: ["EXPERIENCE"],
        defaultPromptGoal: "과제 종료 후 양산 투자 및 3개년 예상 매출 추정치를 근거와 함께 제시합니다.",
      },
    ],
  },
  IRIS_RND: {
    agencyType: "IRIS_RND",
    name: "범부처통합연구지원시스템 (IRIS 국가 R&D 공통)",
    shortName: "범부처 표준 연구개발계획서",
    description: "과기정통부, 산업부, 복지부 등 범부처 국가연구개발혁신법 표준 양식",
    primaryBidTypes: ["R_AND_D"],
    evaluationFocus: "연구역량(20%) + 연구개발계획 우수성(50%) + 성과활용(30%)",
    mandatoryDocuments: [
      "범부처 국가연구개발사업 연구개발계획서",
      "연구시설·장비 도입 심의 요청서 (3천만원 이상 장비 해당 시)",
      "기업 재무건전성 확인서 및 신용평가표",
      "개인정보 및 과세정보 제공·활용 동의서",
    ],
    sections: [
      {
        sectionCode: "I1_RESEARCH_NECESSITY",
        title: "1. 연구개발의 필요성",
        description: "연구개발 대상의 기술적·경제적·사회적 중요성 및 국내외 연구 현황",
        requiredEvidenceTypes: ["EXPERIENCE", "TECHNOLOGY"],
        defaultPromptGoal: "국가 전략기술 및 범부처 정책 방향과 연계된 연구 타당성을 기술합니다.",
      },
      {
        sectionCode: "I2_GOALS_AND_METHODS",
        title: "2. 연구개발 목표 및 수행 방법",
        description: "최종 목표 및 단계별 목표, 세부 연구내용 및 독창적 연구방법론",
        requiredEvidenceTypes: ["TECHNOLOGY", "PATENT"],
        defaultPromptGoal: "기술 실현 가능성을 담보하는 사내 특허 기술 기반의 방법론을 제시합니다.",
      },
      {
        sectionCode: "I3_EVALUATION_CRITERIA",
        title: "3. 연구개발과제의 평가 착안점 및 척도",
        description: "단계별/최종 평가 시 정량적·정성적 검증 지표 및 공인성적서 발행 계획",
        requiredEvidenceTypes: ["CERTIFICATION"],
        defaultPromptGoal: "국가연구개발혁신법 기준에 부합하는 명확한 성과지표와 평가 척도를 수립합니다.",
      },
      {
        sectionCode: "I4_MANAGEMENT_PLAN",
        title: "4. 연구개발 안전 및 보안 관리 계획",
        description: "연구실 안전관리 대책, 연구데이터(DMP) 관리 계획, 지식재산권 보호 방안",
        requiredEvidenceTypes: [],
        defaultPromptGoal: "국가핵심기술 유출 방지 및 연구실 안전 준수 계획을 명시합니다.",
      },
      {
        sectionCode: "I5_IMPACT_AND_DIFFUSION",
        title: "5. 연구개발성과의 활용방안 및 기대효과",
        description: "기술적 파급효과, 경제·사회적 기여도, 후속 연구 및 기술이전 계획",
        requiredEvidenceTypes: ["EXPERIENCE"],
        defaultPromptGoal: "국내 산업 생태계 활성화 및 기술 자립도 제고 효과를 정량/정성적으로 서술합니다.",
      },
    ],
  },
};
