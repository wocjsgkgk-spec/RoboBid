import { z } from "zod";

// ==========================================
// 1. Template Library (P1-1)
// ==========================================
export type TemplateCategory =
  | "R_AND_D"
  | "DEMONSTRATION"
  | "GOV_SUBSIDY"
  | "LOCAL_GOV"
  | "SERVICE"
  | "PROCUREMENT"
  | "TECH_PROPOSAL"
  | "EVALUATION_SHEET";

export interface BidTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  targetAgency: string; // e.g. "TIPA", "조달청(KONEPS)", "NIPA", "IITP", "지자체"
  sections: Array<{
    code: string;
    title: string;
    description: string;
    recommendedWords: number;
    requiredEvidenceTypes: string[];
    samplePrompt: string;
  }>;
  isStandard: boolean; // true if system provided, false if user custom
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Smart Reuse (P1-2)
// ==========================================
export interface SmartReuseItem {
  id: string;
  sourceProposalId: string;
  sourceProposalTitle: string;
  sectionCode: string;
  sectionTitle: string;
  contentSnippet: string;
  awardStatus: "WON" | "HIGH_SCORE" | "ARCHIVED";
  similarityScore: number; // 0 ~ 100
  reuseReason: string; // "왜 유사한지" 설명 (예: "LiDAR SLAM 기반 군집자율주행 아키텍처 및 ROS2 브릿지 규격 92% 일치")
  matchedKeywords: string[];
  citationEvidenceIds: string[];
}

// ==========================================
// 3. Proposal Version Diff (P1-4)
// ==========================================
export interface ProposalDiffItem {
  id: string;
  sectionCode: string;
  sectionTitle: string;
  diffType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
  authorType: "AI" | "HUMAN";
  authorName: string;
  oldContent?: string;
  newContent?: string;
  changeReason?: string;
  timestamp: string;
}

export interface ProposalVersionComparison {
  proposalId: string;
  baseVersion: number;
  targetVersion: number;
  diffItems: ProposalDiffItem[];
  stats: {
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
    aiModifiedCount: number;
  };
}

// ==========================================
// 4. Agency Intelligence (P1-5)
// ==========================================
export interface AgencyIntelligenceRecord {
  id: string;
  agencyName: string;
  agencyType: "CENTRAL_GOV" | "LOCAL_GOV" | "PUBLIC_CORP" | "RESEARCH_INST";
  annualBudgetRange: string;
  totalBidsCount: number;
  wonBidsCount: number;
  lostBidsCount: number;
  winRatePercent: number;
  evaluationFocusPatterns: Array<{
    axis: string;
    importance: "CRITICAL" | "HIGH" | "MEDIUM";
    description: string;
    tip: string;
  }>;
  recentAnnouncements: Array<{
    title: string;
    budget: number;
    year: number;
    outcome?: "WON" | "LOST" | "ONGOING";
  }>;
  internalStrategyNotes: string;
  updatedAt: string;
}

// ==========================================
// 5. Capability Gap Analysis (P1-6)
// ==========================================
export interface CapabilityGapItem {
  id: string;
  requiredItem: string;
  category: "CERTIFICATION" | "TECHNOLOGY" | "EQUIPMENT" | "HUMAN_RESOURCE" | "REGION";
  frequencyCount: number; // 최근 공모 중 부족했던 빈도 (건수)
  impactLevel: "FATAL_DISQUALIFICATION" | "HIGH_DEDUCTION" | "MINOR";
  description: string;
  recommendedAction: "ACQUIRE_DIRECT" | "PARTNER_CONSOR" | "HIRE";
  recommendedPartnerNames?: string[];
}

// ==========================================
// 6. Executive Portfolio (P1-7)
// ==========================================
export interface ExecutivePortfolioSummary {
  totalPipelineBudget: number; // 총 사업 규모 (원)
  activeBidsCount: number;
  d14UrgentCount: number;
  highRiskCount: number;
  proposalReadyCount: number;
  pipelineBreakdown: {
    DISCOVERY: number;
    INITIAL_INTEREST: number;
    ELIGIBILITY_REVIEW: number;
    TECH_EVALUATION: number;
    BUSINESS_EVALUATION: number;
    GO_CONFIRMED: number;
    SUBMITTED: number;
  };
  managerWorkloads: Array<{
    managerName: string;
    activeCount: number;
    urgentCount: number;
    totalBudget: number;
  }>;
}

// ==========================================
// 7. Partner / Consortium Pool (P1-8)
// ==========================================
export interface ConsortiumPartner {
  id: string;
  companyName: string;
  businessNumber: string;
  region: string; // e.g. "경기 수원", "대구경북", "대전", "서울"
  specialtyDomain: string; // e.g. "특수구동부 기구설계", "KC/CE 인증 대행", "스마트팜 센싱"
  coreCapabilities: string[];
  certifications: string[];
  pastCollaborationCount: number;
  ratingScore: number; // 1.0 ~ 5.0
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: "ACTIVE" | "VERIFYING" | "INACTIVE";
  notes?: string;
}

// ==========================================
// 8. Review / Approval Workflow (P1-9)
// ==========================================
export type ApprovalStepStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";

export interface ApprovalStep {
  stepIndex: number;
  roleTitle: string; // "작성자 제출", "기술 검토 (CTO/연구소장)", "사업 검토 (사업개발이사)", "최종 승인 (대표이사)"
  reviewerName: string;
  status: ApprovalStepStatus;
  comment?: string;
  approvedAt?: string;
}

export interface ProposalApprovalState {
  proposalId: string;
  currentStepIndex: number;
  isFullyApproved: boolean;
  steps: ApprovalStep[];
  canProceedToFinalSubmission: boolean;
}

// ==========================================
// 9. Notification Preference (P1-10)
// ==========================================
export interface NotificationPreferenceConfig {
  inAppNotificationEnabled: boolean;
  telegramNotificationEnabled: boolean;
  minOpportunityFitScore: number; // e.g. 80점 이상만 알림
  deadlineUrgentAlertDays: number[]; // e.g. [7, 3, 1]
  certExpirationNoticeDays: number; // e.g. 60일 전
  approvalRequiredImmediateAlert: boolean;
}
