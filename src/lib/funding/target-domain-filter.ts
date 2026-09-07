/**
 * RoboBid AI v3.0 — Target Domain & Goal Alignment Filter
 *
 * 기업 목표: 로봇(AMR, AGV, 협동, 물류, 제조, 서비스, 농업, 특수) 하드웨어,
 * 임베디드 제어기, 센서퓨전/자율주행 기술 기반 정부 R&D, 시제품 제작 지원금, 실증·보급 사업화 자금 확보.
 *
 * 배제 대상 (Not Our Goal):
 * - 컨설팅 (경영, 마케팅, 기술, 수출, ESG 컨설팅 등)
 * - 용역 (청소, 경비, 단순 시설관리, 인력파견, 단순 유지보수, 전산용역 등)
 * - 단순 마케팅, 디자인 개발, 전시회 참가, 브로슈어 인쇄 등
 * - 단순 교육, 세미나, 인력양성, 자격증 취득 등
 */

export const NON_GOAL_EXCLUDED_KEYWORDS = [
  // 1. 성과분석, 동향조사, 실태조사, 타당성/정책 연구 (Paper/Report Study 용역 Zero-Tolerance)
  "성과분석",
  "성과평가",
  "성과보고",
  "동향분석",
  "동향조사",
  "동향",
  "기술동향",
  "시장동향",
  "산업동향",
  "실태조사",
  "타당성조사",
  "타당성검토",
  "타당성분석",
  "타당성",
  "수요조사",
  "만족도조사",
  "만족도",
  "설문조사",
  "시장조사",
  "효과분석",
  "영향평가",
  "정책연구",
  "기획연구",
  "학술연구",
  "기초연구",
  "조사연구",
  "위탁연구",
  "전략수립",
  "마스터플랜",
  "로드맵수립",
  "로드맵",
  "기본계획수립",
  "기본계획",
  "발전방안",
  "백서",
  "보고서작성",
  "통계조사",
  "포럼운영",
  "심포지엄",
  "세미나",
  "워크숍",

  // 2. 컨설팅 및 자문 (경영, 마케팅, 기술, 수출, ESG, 법률 등)
  "컨설팅",
  "자문",
  "멘토링",
  "전문가매칭",
  "코칭",

  // 3. 단순 용역 및 외주 인력/시설 관리
  "용역",
  "인력파견",
  "파견",
  "경비",
  "청소",
  "미화",
  "시설관리",
  "단순유지",
  "유지관리용역",
  "위탁운영",

  // 4. 비기술 단순 마케팅/디자인/홍보/인쇄
  "마케팅지원",
  "마케팅",
  "디자인지원",
  "홍보대행",
  "행사대행",
  "전시회참가",
  "수출상담회",
  "인쇄물",
  "브로슈어",
  "판촉",
  "영상제작",
  "홍보영상",

  // 5. 인재양성, 교육 운영, 일자리 및 경진대회 (비R&D 교육사업 Zero-Tolerance)
  "인재양성",
  "인재육성",
  "현장교육",
  "교육운영",
  "교육과정",
  "단순교육",
  "인력양성",
  "재직자교육",
  "직무교육",
  "직업훈련",
  "취업연계",
  "채용연계",
  "청년인턴",
  "일자리",
  "일학습병행",
  "아카데미",
  "부트캠프",
  "해커톤",
  "경진대회",
  "공모전",
  "체험교육",
  "강사양성",
  "자격증",
  "적격심사",
];

export const ROBOT_CORE_KEYWORDS = [
  "로봇",
  "robot",
  "amr",
  "agv",
  "자율주행",
  "협동로봇",
  "이동로봇",
  "물류로봇",
  "서비스로봇",
  "제조로봇",
  "산업용로봇",
  "특수로봇",
  "방재로봇",
  "농업로봇",
  "액추에이터",
  "모터제어",
  "slam",
  "lidar",
  "비전인식",
  "스마트팩토리",
  "자율제조",
  "스마트제조",
  "r&d",
  "기술혁신",
  "시제품",
  "실증",
  "상용화",
  "사업화",
];

export interface OpportunityFilterable {
  title?: string;
  announcingAgency?: string;
  demandingAgency?: string | null;
  primaryDomain?: string;
  bidType?: string;
  fundingType?: string;
  summary?: string;
  category?: string;
  tags?: string[];
}

/**
 * Checks if an opportunity matches the company's core mission:
 * Returns TRUE only if:
 * 1) It does NOT contain excluded non-goal keywords (컨설팅, 용역 등)
 * 2) It is relevant to Robot, Advanced Manufacturing, Automation, or Deep-Tech R&D.
 */
export function isTargetRobotFundingOpportunity(opp: OpportunityFilterable): boolean {
  const title = (opp.title || "").toLowerCase();
  const agency = (opp.announcingAgency || "").toLowerCase();
  const summary = (opp.summary || "").toLowerCase();
  const domain = (opp.primaryDomain || "").toLowerCase();

  // 원본 텍스트 및 공백 제거 텍스트 동시 생성 (띄어쓰기 여부 무관 검출 e.g., "성과 분석" vs "성과분석")
  const rawText = `${title} ${agency} ${summary} ${domain}`;
  const strippedText = rawText.replace(/\s+/g, "");

  // 1. 배제 키워드 엄격 검사 (성과분석, 동향, 실태조사, 타당성, 컨설팅, 용역 등 즉시 차단)
  for (const kw of NON_GOAL_EXCLUDED_KEYWORDS) {
    const cleanKw = kw.toLowerCase().replace(/\s+/g, "");
    if (strippedText.includes(cleanKw) || rawText.includes(kw.toLowerCase())) {
      return false;
    }
  }

  // 2. 명시적으로 로봇/자동화 하드웨어로 분류된 경우 (단, 위 배제어에 걸리지 않은 경우만)
  if (domain === "robot" || domain === "automation_hardware") {
    return true;
  }

  // 3. 로봇 핵심 하드웨어 및 R&D 개발 지원사업 키워드 매칭
  const hasCoreMatch = ROBOT_CORE_KEYWORDS.some((kw) => {
    const cleanKw = kw.toLowerCase().replace(/\s+/g, "");
    return strippedText.includes(cleanKw) || rawText.includes(kw.toLowerCase());
  });

  return hasCoreMatch;
}

/**
 * Filter an array of opportunities strictly to target robot funding.
 */
export function filterTargetOpportunities<T extends OpportunityFilterable>(list: T[]): T[] {
  return list.filter(isTargetRobotFundingOpportunity);
}
