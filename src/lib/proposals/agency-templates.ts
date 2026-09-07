import { ProposalTOCItem } from "@/types/proposal";

export type PublicAgencyType =
  | "GOV_RND"
  | "LOCAL_RND"
  | "STARTUP_GRANT"
  | "PROTOTYPE_GRANT"
  | "VALIDATION_GRANT"
  | "COMMERCIALIZATION"
  | "CONTEST"
  | "COMPETITION"
  | "EXPORT"
  | "PROCUREMENT"
  | "SERVICE_CONTRACT"
  | "CUSTOM"
  // Legacy backward-compatibility aliases
  | "KONEPS"
  | "NIPA_NIA"
  | "TIPA_MSS"
  | "IRIS_RND";

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

// 1. 정부 R&D (과기부, 산업부, 중기부 공통 IRIS 표준 연구개발계획서)
const GOV_RND_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "GOV_RND",
  name: "정부 R&D 표준 연구개발계획서 (IRIS 공통)",
  shortName: "정부 R&D 계획서",
  description: "국가연구개발혁신법 기준 범부처 표준 연구개발계획서 서식",
  primaryBidTypes: ["R_AND_D", "NATIONAL_PROJECT"],
  evaluationFocus: "연구역량(20%) + 연구개발계획 우수성(50%) + 성과활용(30%)",
  mandatoryDocuments: [
    "범부처 국가연구개발사업 연구개발계획서",
    "연구시설·장비 도입 심의 요청서 (3천만원 이상 장비 해당 시)",
    "기업 재무건전성 확인서 및 신용평가표",
    "개인정보 및 과세정보 제공·활용 동의서",
    "연구개발기관 대표자의 참여의사확인서",
  ],
  sections: [
    {
      sectionCode: "R1_RESEARCH_NECESSITY",
      title: "1. 연구개발의 필요성",
      description: "연구개발 대상의 기술적·경제적·사회적 중요성 및 국내외 연구 현황",
      requiredEvidenceTypes: ["EXPERIENCE", "TECHNOLOGY"],
      defaultPromptGoal: "국가 전략기술 및 범부처 정책 방향과 연계된 연구 타당성을 기술합니다.",
    },
    {
      sectionCode: "R2_GOALS_AND_METHODS",
      title: "2. 연구개발 목표 및 수행 방법",
      description: "최종 목표 및 단계별 목표, 세부 연구내용 및 독창적 연구방법론",
      requiredEvidenceTypes: ["TECHNOLOGY", "PATENT"],
      defaultPromptGoal: "기술 실현 가능성을 담보하는 사내 특허 기술 기반의 방법론을 제시합니다.",
    },
    {
      sectionCode: "R3_EVALUATION_CRITERIA",
      title: "3. 연구개발과제의 평가 착안점 및 정량적 척도 (KPI)",
      description: "단계별/최종 평가 시 정량적·정성적 검증 지표 및 KOLAS 공인성적서 발행 계획",
      requiredEvidenceTypes: ["CERTIFICATION"],
      defaultPromptGoal: "국가연구개발혁신법 기준에 부합하는 명확한 성과지표와 평가 척도를 수립합니다.",
    },
    {
      sectionCode: "R4_MANAGEMENT_PLAN",
      title: "4. 연구개발 안전 및 보안 관리 계획",
      description: "연구실 안전관리 대책, 연구데이터(DMP) 관리 계획, 지식재산권 보호 방안",
      requiredEvidenceTypes: [],
      defaultPromptGoal: "국가핵심기술 유출 방지 및 연구실 안전 준수 계획을 명시합니다.",
    },
    {
      sectionCode: "R5_IMPACT_AND_DIFFUSION",
      title: "5. 연구개발성과의 활용방안 및 기대효과",
      description: "기술적 파급효과, 경제·사회적 기여도, 후속 연구 및 사업화 로드맵",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "국내 산업 생태계 활성화 및 기술 자립도 제고 효과를 정량/정성적으로 서술합니다.",
    },
  ],
};

// 2. 지자체 R&D
const LOCAL_RND_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "LOCAL_RND",
  name: "지자체/테크노파크 지역특화 R&D 제안서",
  shortName: "지자체 R&D",
  description: "지역 주력산업 육성 및 지역 기업 성장 지원 R&D 양식",
  primaryBidTypes: ["LOCAL_GOV", "R_AND_D"],
  evaluationFocus: "지역산업 연계성(40%) + 기술 우수성(30%) + 지역 일자리/경제 기여도(30%)",
  mandatoryDocuments: [
    "지역특화 R&D 사업계획서",
    "사업장(본사/공장/연구소) 관내 소재 증빙",
    "지자체 일자리 창출 및 지역인재 채용 확약서",
  ],
  sections: [
    {
      sectionCode: "L1_LOCAL_CONTEXT",
      title: "1. 지역 산업 연계성 및 과제 필요성",
      description: "지역 주력 로봇산업 현황 및 지역 경제 파급효과",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "관내 제조 및 물류 공장의 인력난 해소와 지역 경쟁력 강화를 부각합니다.",
    },
    {
      sectionCode: "L2_LOCAL_TECH_PLAN",
      title: "2. 기술개발 내용 및 추진일정",
      description: "지역 특화 맞춤형 로봇 솔루션 개발 및 실증 계획",
      requiredEvidenceTypes: ["TECHNOLOGY"],
      defaultPromptGoal: "지자체 테스트베드와 연계된 기술개발 및 제품 고도화 방안을 기술합니다.",
    },
    {
      sectionCode: "L3_LOCAL_EMPLOYMENT",
      title: "3. 지역 일자리 창출 및 고용 유지 계획",
      description: "지역 청년인재 신규 채용 및 지역 협력사 네트워크",
      requiredEvidenceTypes: ["HUMAN_RESOURCE"],
      defaultPromptGoal: "신규 로봇 SW/HW 연구원 관내 채용 계획 및 산학 연계 방안을 제시합니다.",
    },
  ],
};

// 3. 창업지원사업 (초기창업, 예비창업, 청창사 등)
const STARTUP_GRANT_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "STARTUP_GRANT",
  name: "중기부 창업성장/초기창업패키지 사업계획서",
  shortName: "창업지원 사업계획서",
  description: "창업 3~7년 이내 유망 스타트업 기술개발 및 BM 고도화",
  primaryBidTypes: ["SUBSIDY_SUPPORT", "R_AND_D"],
  evaluationFocus: "문제 인식(25%) + 실현 가능성(30%) + 성장 전략(25%) + 팀 역량(20%)",
  mandatoryDocuments: [
    "창업사업화 지원사업 계획서",
    "창업기업 확인서 및 사업자등록증명원",
    "주요 핵심 인력 이력서 및 원천징수영수증",
    "지식재산권(특허출원/등록증) 사본",
  ],
  sections: [
    {
      sectionCode: "S1_PROBLEM_DEFINITION",
      title: "1. 문제 인식 (Problem)",
      description: "창업 아이템의 개발 동기, 기존 시장의 문제점 및 고객 Pain Point",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "물류 및 제조 현장의 기존 솔루션 한계와 시장 진입 기회를 설득력 있게 제시합니다.",
    },
    {
      sectionCode: "S2_SOLUTION_DEVELOPMENT",
      title: "2. 실현 가능성 (Solution)",
      description: "개발 아이템의 차별적 기능, 기술 구현 방안, 제작 일정 및 시제품 사양",
      requiredEvidenceTypes: ["TECHNOLOGY", "PATENT"],
      defaultPromptGoal: "Master Spec 사양을 인용하여 TRL 단계별 개발 가능성과 기술 장벽을 입증합니다.",
    },
    {
      sectionCode: "S3_GROWTH_STRATEGY",
      title: "3. 성장 전략 (Scale-up)",
      description: "수익 모델(BM), 판로 개척 및 마케팅 전략, 투자 유치 계획",
      requiredEvidenceTypes: ["FINANCIAL"],
      defaultPromptGoal: "초기 H/W 납품 및 SaaS/RaaS 구독 모델 연계 매출 실현 로드맵을 제시합니다.",
    },
    {
      sectionCode: "S4_TEAM_COMPETENCY",
      title: "4. 팀 구성 (Team)",
      description: "대표자 및 핵심 팀원의 전문성, 업무 분장, 파트너십",
      requiredEvidenceTypes: ["HUMAN_RESOURCE"],
      defaultPromptGoal: "로봇 제어, SLAM, 전장 분야 10년 이상 핵심 인력의 수행 역량을 강조합니다.",
    },
  ],
};

// 4. 시제품 제작지원
const PROTOTYPE_GRANT_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "PROTOTYPE_GRANT",
  name: "시제품 제작 및 금형/목업 지원사업 계획서",
  shortName: "시제품 제작지원",
  description: "하드웨어 시제품, 회로 PCB, 금형 가공비 특화 계획서",
  primaryBidTypes: ["SUBSIDY_SUPPORT"],
  evaluationFocus: "제작 필요성(30%) + 제작 사양 구체성(40%) + 시제품 활용성(30%)",
  mandatoryDocuments: [
    "시제품 제작계획서 및 도면/BOM 내역서",
    "제작 외주처 견적서 및 비교견적서 (2곳 이상)",
    "소요자재 명세서",
  ],
  sections: [
    {
      sectionCode: "P1_PROTOTYPE_OVERVIEW",
      title: "1. 시제품 제작 개요 및 목적",
      description: "제작 대상 로봇 폼팩터 및 설계 검증 목표",
      requiredEvidenceTypes: ["TECHNOLOGY"],
      defaultPromptGoal: "기구 섀시 및 구동부의 구조 강성 및 방열 설계 검증 목적을 기술합니다.",
    },
    {
      sectionCode: "P2_BOM_AND_FABRICATION",
      title: "2. 부품 사양(BOM) 및 가공 공정",
      description: "핵심 모터/감속기/프레임 BOM 및 정밀 가공 외주 공정",
      requiredEvidenceTypes: ["PATENT"],
      defaultPromptGoal: "BOM 견적 및 가공 일정표를 상세히 제시하여 예산 집행 타당성을 증명합니다.",
    },
    {
      sectionCode: "P3_TESTING_AND_IMPROVEMENT",
      title: "3. 시험평가 및 성능 검증 방안",
      description: "시제품 조립 후 성능 시험 및 양산 개선안 도출",
      requiredEvidenceTypes: ["CERTIFICATION"],
      defaultPromptGoal: "공인기관 KOLAS 인증 시험 전 자체 계측 테스트베드 검증 절차를 기술합니다.",
    },
  ],
};

// 5. 로봇 실증사업 (KIRIA, NIPA, 지능형 로봇 보급)
const VALIDATION_GRANT_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "VALIDATION_GRANT",
  name: "로봇 실증 및 보급·확산 지원사업 계획서",
  shortName: "로봇 실증계획서",
  description: "수요기업 테스트베드 현장 실증 및 신뢰성 검증",
  primaryBidTypes: ["DEMONSTRATION", "SUBSIDY_SUPPORT"],
  evaluationFocus: "실증 환경 적합성(30%) + 기술 안전성(40%) + 확산 파급력(30%)",
  mandatoryDocuments: [
    "로봇 실증사업 추진계획서",
    "도입 수요기업(물류센터/공장) 참여 확약서 및 MOU",
    "로봇 안전인증(ISO 3691-4 등) 또는 안전성 검토 의견서",
    "실증지 현장 도면 및 통신 환경 실측서",
  ],
  sections: [
    {
      sectionCode: "V1_TESTBED_SITE",
      title: "1. 실증 현장 환경 및 도입 필요성",
      description: "수요기업 물류창고/제조공장 현황 및 위험 작업 공정 분석",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "실제 풀필먼트 창고 내 안전사고 위험 공정에 로봇 도입 시급성을 강조합니다.",
    },
    {
      sectionCode: "V2_ROBOT_SYSTEM_SPEC",
      title: "2. 실증 로봇 시스템 구성 및 안전 대책",
      description: "AMR 하드웨어 사양, 라이다 센서, 안전 PLC 및 비상정지 체계",
      requiredEvidenceTypes: ["TECHNOLOGY", "CERTIFICATION"],
      defaultPromptGoal: "작업자와 협동 가능한 ISO 안전 규격 충족 안전 시스템 아키텍처를 제시합니다.",
    },
    {
      sectionCode: "V3_SCENARIO_AND_KPI",
      title: "3. 실증 시나리오 및 정량적 성능 검증 (KPI)",
      description: "주행 속도, 정지 정밀도, 일일 물동량 처리량 등 정량 지표",
      requiredEvidenceTypes: ["CERTIFICATION"],
      defaultPromptGoal: "현장 필드 테스트베드 실측 지표 및 공인시험성적서 발행 계획을 명문화합니다.",
    },
    {
      sectionCode: "V4_DIFFUSION_PLAN",
      title: "4. 실증 후 전국 확산 및 상용화 전략",
      description: "동종 업계 보급 계획 및 표준화/패키징 방안",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "실증 성공 후 10개 풀필먼트 센터로의 확산 도입 계약 방안을 서술합니다.",
    },
  ],
};

// 6. 사업화 지원
const COMMERCIALIZATION_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "COMMERCIALIZATION",
  name: "기술사업화 및 판로개척 지원사업 계획서",
  shortName: "사업화 지원계획서",
  description: "양산 공정, 마케팅, 전시회, 인증 취득 중심 사업화 지원",
  primaryBidTypes: ["SUBSIDY_SUPPORT"],
  evaluationFocus: "사업화 역량(40%) + 시장성 및 매출실현(40%) + 예산 적정성(20%)",
  mandatoryDocuments: [
    "기술사업화 사업계획서",
    "수요처 구매의향서(LOI) 또는 공급 협약서",
    "공인인증 견적서 및 판로개척 세부계획서",
  ],
  sections: [
    {
      sectionCode: "C1_PRODUCT_READINESS",
      title: "1. 상용화 제품 완성도 및 시장 경쟁력",
      description: "현재 제품 완성도(TRL 7 이상) 및 타사 대비 비교 우위",
      requiredEvidenceTypes: ["TECHNOLOGY", "CERTIFICATION"],
      defaultPromptGoal: "이미 검증된 필드 실증 레퍼런스를 바탕으로 즉시 상용화 가능함을 입증합니다.",
    },
    {
      sectionCode: "C2_MARKETING_AND_SALES",
      title: "2. 마케팅 전략 및 국내외 판로 개척 방안",
      description: "전시회 참가, 홍보 채널, B2B 총판 계약 및 영업 파이프라인",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "국내외 로봇산업 대전 참가 및 20개 타겟 고객사 직접 영업 전략을 기술합니다.",
    },
    {
      sectionCode: "C3_FINANCIAL_ROADMAP",
      title: "3. 매출 전망 및 투자 회수 로드맵",
      description: "향후 3개년 제품 판매량 및 매출/영업이익 추정",
      requiredEvidenceTypes: ["FINANCIAL"],
      defaultPromptGoal: "RaaS 구독 및 장비 판매를 통한 구체적인 매출 수치와 근거를 제시합니다.",
    },
  ],
};

// 7. 공모전
const CONTEST_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "CONTEST",
  name: "공공/민간 혁신 기술 아이디어 공모전 제안서",
  shortName: "공모전 제안서",
  description: "창의적 문제 해결 및 신기술 접목 아이디어 공모 서식",
  primaryBidTypes: ["OTHER"],
  evaluationFocus: "창의성(40%) + 실현가능성(30%) + 파급효과(30%)",
  mandatoryDocuments: ["공모전 참가신청서 및 제안서 요약본"],
  sections: [
    {
      sectionCode: "CT1_CREATIVE_IDEA",
      title: "1. 아이디어 제안 배경 및 독창성",
      description: "기존에 시도되지 않은 혁신적인 로봇 솔루션 개념",
      requiredEvidenceTypes: ["TECHNOLOGY"],
      defaultPromptGoal: "참신한 AI-로봇 융합 컨셉과 시장의 파괴적 혁신성을 강조합니다.",
    },
    {
      sectionCode: "CT2_FEASIBILITY",
      title: "2. 기술적 구현 가능성 및 데모 계획",
      description: "보유 기술 자산 연계 구현 방안 및 프로토타입 시연 계획",
      requiredEvidenceTypes: ["PATENT"],
      defaultPromptGoal: "이론에 그치지 않고 사내 보유 특허로 실제 구현 가능함을 증명합니다.",
    },
  ],
};

// 8. 경진대회
const COMPETITION_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "COMPETITION",
  name: "로봇 기술 챌린지 및 경진대회 참가 제안서",
  shortName: "기술 챌린지 제안서",
  description: "미션 완수형 로봇 기술 경진대회 및 피칭 챌린지 서식",
  primaryBidTypes: ["OTHER"],
  evaluationFocus: "미션 해결 전략(50%) + 시스템 완성도(30%) + 데모 신뢰성(20%)",
  mandatoryDocuments: ["경진대회 참가신청서", "로봇 시스템 사양서"],
  sections: [
    {
      sectionCode: "CP1_MISSION_STRATEGY",
      title: "1. 챌린지 미션 분석 및 공략 전략",
      description: "주행/조작/인지 복합 미션의 단계별 알고리즘 전략",
      requiredEvidenceTypes: ["TECHNOLOGY"],
      defaultPromptGoal: "정밀 센서 융합 및 실시간 장애물 회피 알고리즘의 우수성을 기술합니다.",
    },
    {
      sectionCode: "CP2_SYSTEM_INTEGRATION",
      title: "2. 로봇 플랫폼 사양 및 하드웨어 구성",
      description: "구동부, 센서, 컴퓨팅 하드웨어 통합 구성도",
      requiredEvidenceTypes: ["TECHNOLOGY"],
      defaultPromptGoal: "고신뢰성 ROS2 기반 제어기와 안정적인 전장 시스템 구성을 설명합니다.",
    },
  ],
};

// 9. 수출 지원
const EXPORT_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "EXPORT",
  name: "글로벌 시장 진출 및 해외 수출 지원사업 계획서",
  shortName: "해외수출 지원계획서",
  description: "해외 인증(CE/FCC), 현지화, 글로벌 바이어 매칭",
  primaryBidTypes: ["SUBSIDY_SUPPORT"],
  evaluationFocus: "수출 경쟁력(40%) + 현지화 적합성(30%) + 글로벌 네트워크(30%)",
  mandatoryDocuments: [
    "해외진출 사업계획서",
    "해외 바이어 협력 의향서 또는 현지 PoC 계약서",
    "수출 실적증명서 (해당 시)",
  ],
  sections: [
    {
      sectionCode: "E1_GLOBAL_TARGET",
      title: "1. 타겟 해외 시장 분석 및 진출 타당성",
      description: "북미/유럽/동남아 물류 로봇 시장 수요 및 규제 환경",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "선진 시장의 자동화 수요와 국내 로봇 기술의 가격/성능 경쟁력을 분석합니다.",
    },
    {
      sectionCode: "E2_OVERSEAS_CERT",
      title: "2. 해외 규격(CE, FCC) 인증 및 현지화 계획",
      description: "글로벌 안전 규격 취득 및 현지 전압/통신 맞춤 설계",
      requiredEvidenceTypes: ["CERTIFICATION"],
      defaultPromptGoal: "유럽 CE Machinery 및 안전 인증 획득 로드맵을 구체화합니다.",
    },
    {
      sectionCode: "E3_BUYER_NETWORK",
      title: "3. 현지 파트너 발굴 및 유지보수 CS 체계",
      description: "해외 SI 파트너사 협력 및 글로벌 유지보수 네트워크",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "현지 로봇 디스트리뷰터와의 협약 및 현지 긴급 장애 대응 체계를 제시합니다.",
    },
  ],
};

// 10. 공공조달 (조달청 나라장터 표준 5대 기술제안서)
const PROCUREMENT_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "PROCUREMENT",
  name: "조달청 나라장터 표준 기술제안서 (협상에 의한 계약)",
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
};

// 11. 공공용역 제안서
const SERVICE_CONTRACT_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "SERVICE_CONTRACT",
  name: "공공 정보화 및 SW 구축·운영 용역 제안서",
  shortName: "공공용역 제안서",
  description: "공공기관 소프트웨어 개발, 인프라 구축, 운영유지관리 용역",
  primaryBidTypes: ["SERVICE", "PROCUREMENT"],
  evaluationFocus: "기술평가(90%) + 가격평가(10%)",
  mandatoryDocuments: [
    "용역수행 제안서",
    "투입인력 이력서 및 소프트웨어기술자 경력증명서",
    "소프트웨어사업수행 실적확인서",
  ],
  sections: [
    {
      sectionCode: "SC1_UNDERSTANDING",
      title: "1. 과업 이해도 및 추진 전략",
      description: "발주처 과업지시서 분석, 주요 난제 및 해결 방법론",
      requiredEvidenceTypes: ["EXPERIENCE"],
      defaultPromptGoal: "과업 목표를 철저히 분석하고 발주기관의 특수 요구사항을 반영한 추진 전략을 기술합니다.",
    },
    {
      sectionCode: "SC2_SYSTEM_ARCHITECTURE",
      title: "2. 시스템 설계 및 기능 구현 방안",
      description: "아키텍처 구성도, 데이터베이스 설계, 보안 체계",
      requiredEvidenceTypes: ["TECHNOLOGY"],
      defaultPromptGoal: "전자정부 프레임워크 준수 및 안정적인 데이터 연동 아키텍처를 제시합니다.",
    },
    {
      sectionCode: "SC3_PERSONNEL_PLAN",
      title: "3. 사업관리 및 투입인력 계획",
      description: "WBS 마일스톤, PM 및 특급/고급 기술자 투입율 계획",
      requiredEvidenceTypes: ["HUMAN_RESOURCE"],
      defaultPromptGoal: "소프트웨어기술자 경력증명서 연계 전담 투입 인력의 전문성을 부각합니다.",
    },
  ],
};

// 12. Custom 사용자 정의 템플릿
const CUSTOM_TEMPLATE: AgencyTemplateConfig = {
  agencyType: "CUSTOM",
  name: "사용자 정의 Custom 맞춤형 사업계획서",
  shortName: "Custom 제안서",
  description: "사용자가 목차와 항목을 자유롭게 정의하여 작성하는 범용 서식",
  primaryBidTypes: ["OTHER"],
  evaluationFocus: "사용자 맞춤형 평가 항목 준용",
  mandatoryDocuments: ["신청서 및 제안서 원본"],
  sections: [
    {
      sectionCode: "CST1_OVERVIEW",
      title: "1. 사업 개요 및 목표",
      description: "사업 목적, 핵심 제안 내용, 추진 일정",
      requiredEvidenceTypes: [],
      defaultPromptGoal: "제안 과제의 개요와 목표를 요약 기술합니다.",
    },
    {
      sectionCode: "CST2_DETAIL",
      title: "2. 세부 사업 내용",
      description: "기술, 일정, 예산 등 세부 실행 방안",
      requiredEvidenceTypes: [],
      defaultPromptGoal: "세부 계획과 투입 자원을 명문화합니다.",
    },
  ],
};

// Legacy TIPA_MSS (중기부 R&D 5대 서식)
const TIPA_MSS_TEMPLATE: AgencyTemplateConfig = {
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
};

export const AGENCY_TEMPLATES: Record<PublicAgencyType, AgencyTemplateConfig> = {
  GOV_RND: GOV_RND_TEMPLATE,
  LOCAL_RND: LOCAL_RND_TEMPLATE,
  STARTUP_GRANT: STARTUP_GRANT_TEMPLATE,
  PROTOTYPE_GRANT: PROTOTYPE_GRANT_TEMPLATE,
  VALIDATION_GRANT: VALIDATION_GRANT_TEMPLATE,
  COMMERCIALIZATION: COMMERCIALIZATION_TEMPLATE,
  CONTEST: CONTEST_TEMPLATE,
  COMPETITION: COMPETITION_TEMPLATE,
  EXPORT: EXPORT_TEMPLATE,
  PROCUREMENT: PROCUREMENT_TEMPLATE,
  SERVICE_CONTRACT: SERVICE_CONTRACT_TEMPLATE,
  CUSTOM: CUSTOM_TEMPLATE,
  // Legacy aliases
  KONEPS: PROCUREMENT_TEMPLATE,
  NIPA_NIA: VALIDATION_GRANT_TEMPLATE,
  TIPA_MSS: TIPA_MSS_TEMPLATE,
  IRIS_RND: GOV_RND_TEMPLATE,
};

/**
 * Funding Type 또는 Bid Type에 따라 최적의 템플릿 추천
 */
export function getTemplateForFundingType(fundingType?: string, bidType?: string): AgencyTemplateConfig {
  if (!fundingType && !bidType) return GOV_RND_TEMPLATE;

  const key = (fundingType || bidType || "").toUpperCase();

  if (key === "GOV_RND" || key === "IRIS_RND" || key === "R_AND_D" || key === "NATIONAL_PROJECT") {
    return GOV_RND_TEMPLATE;
  }
  if (key === "LOCAL_RND" || key === "LOCAL_GOV") {
    return LOCAL_RND_TEMPLATE;
  }
  if (key === "STARTUP_GRANT" || key === "TIPA_MSS") {
    return STARTUP_GRANT_TEMPLATE;
  }
  if (key === "PROTOTYPE_GRANT") {
    return PROTOTYPE_GRANT_TEMPLATE;
  }
  if (key === "VALIDATION_GRANT" || key === "NIPA_NIA" || key === "DEMONSTRATION") {
    return VALIDATION_GRANT_TEMPLATE;
  }
  if (key === "COMMERCIALIZATION") {
    return COMMERCIALIZATION_TEMPLATE;
  }
  if (key === "CONTEST") {
    return CONTEST_TEMPLATE;
  }
  if (key === "COMPETITION") {
    return COMPETITION_TEMPLATE;
  }
  if (key === "EXPORT") {
    return EXPORT_TEMPLATE;
  }
  if (key === "PROCUREMENT" || key === "KONEPS") {
    return PROCUREMENT_TEMPLATE;
  }
  if (key === "SERVICE_CONTRACT" || key === "SERVICE") {
    return SERVICE_CONTRACT_TEMPLATE;
  }

  return AGENCY_TEMPLATES[key as PublicAgencyType] || GOV_RND_TEMPLATE;
}
