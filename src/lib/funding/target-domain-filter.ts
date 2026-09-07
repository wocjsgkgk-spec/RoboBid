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
  "컨설팅",
  "자문",
  "멘토링",
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
  "마케팅지원",
  "디자인지원",
  "홍보대행",
  "행사대행",
  "전시회참가",
  "수출상담회",
  "인쇄물",
  "판촉",
  "단순교육",
  "인력양성",
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
  const fullText = `${title} ${agency} ${summary} ${domain}`;

  // 1. Check exclusions (Strict Zero-Tolerance for Consulting & Services)
  for (const kw of NON_GOAL_EXCLUDED_KEYWORDS) {
    if (fullText.includes(kw)) {
      return false;
    }
  }

  // 2. If it's already explicitly tagged as ROBOT, AUTOMATION_HARDWARE, or AI_ICT
  if (domain === "robot" || domain === "automation_hardware") {
    return true;
  }

  // 3. Check for core robot/hardware/funding keywords in title
  const hasCoreMatch = ROBOT_CORE_KEYWORDS.some((kw) => title.includes(kw) || summary.includes(kw));
  return hasCoreMatch;
}

/**
 * Filter an array of opportunities strictly to target robot funding.
 */
export function filterTargetOpportunities<T extends OpportunityFilterable>(list: T[]): T[] {
  return list.filter(isTargetRobotFundingOpportunity);
}
