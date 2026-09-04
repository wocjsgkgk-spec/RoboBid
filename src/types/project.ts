export interface ReadinessMetrics {
  labeledOutcomeCount: number;
  awardedCount: number;
  rejectedCount: number;
  classBalanceRatio: number; // 0.0 ~ 1.0
  missingDataRate: number; // 0 ~ 100%
  providerCoverageRate: number; // 0 ~ 100%
  featureAvailabilityRate: number; // 0 ~ 100%
  feedbackCount: number;
  aiAcceptanceRate: number; // 0 ~ 100%
  postAwardDemandCount: number;

  // Gate 평가
  winProbabilityModelDecision: 'GO' | 'NO_GO';
  decisionReason: string;
  dataAccumulationPlan: string[];
}

export type SpecialistRole = 'STRATEGY' | 'FINANCIAL' | 'TECHNICAL' | 'COMPLIANCE';

export interface CrossReviewFinding {
  role: SpecialistRole;
  agentName: string;
  score: number; // 0 ~ 100
  status: 'PASS' | 'WARN' | 'CRITICAL';
  title: string;
  comments: string[];
  recommendations: string[];
}

export interface CrossReviewResult {
  proposalId: string;
  overallScore: number;
  findings: CrossReviewFinding[];
  reviewedAt: string;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

export interface ProjectMilestone {
  id: string;
  projectId: string;
  milestoneName: string;
  phaseNumber: number;
  targetDate?: string | null;
  deliverables: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ProjectWorkforce {
  id: string;
  projectId: string;
  roleTitle: string;
  participationRate: number; // %
  isHiringNeeded: boolean;
  jobPostDraft?: string | null;
}

export interface ProjectSubcontract {
  id: string;
  projectId: string;
  taskTitle: string;
  estimatedCost: number;
  rfpDraft?: string | null;
  vendorComparisonNotes?: string | null;
}

export interface ProjectRecord {
  id: string;
  organizationId: string;
  opportunityId: string;
  proposalId?: string | null;
  name: string;
  status: ProjectStatus;
  totalBudget: number;
  governmentGrant: number;
  privateContribution: number;
  startDate?: string | null;
  endDate?: string | null;
  managingAgency?: string | null;
  milestones: ProjectMilestone[];
  workforce: ProjectWorkforce[];
  subcontracts: ProjectSubcontract[];
  createdAt: string;
  updatedAt: string;
}

export interface ConvertProjectInput {
  organizationId: string;
  opportunityId: string;
  proposalId?: string | null;
  name: string;
  totalBudget: number;
  governmentGrant?: number;
  privateContribution?: number;
  startDate?: string;
  endDate?: string;
  managingAgency?: string;
}
