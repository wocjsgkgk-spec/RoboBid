import { z } from 'zod';

export type ProposalStatus =
  | 'DRAFTING'
  | 'REVIEWING'
  | 'APPROVED'
  | 'SUBMITTED'
  | 'REJECTED';

export type SectionStatus =
  | 'EMPTY'
  | 'AI_GENERATED'
  | 'EDITED'
  | 'REVIEW_NEEDED'
  | 'CONFIRMED';

export interface EvidenceCitation {
  id: string;
  sourceType: 'CAPABILITY' | 'RFP_REQUIREMENT' | 'PAST_PROPOSAL';
  sourceId: string;
  sourceTitle: string;
  quoteSnippet: string;
  relevanceReason: string;
  confidenceScore?: number;
}

export interface ProposalSection {
  id: string;
  proposalId: string;
  sectionCode: string;
  title: string;
  orderIndex: number;
  contentMarkdown: string;
  evidenceCitations: EvidenceCitation[];
  status: SectionStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  organizationId: string;
  opportunityId: string;
  title: string;
  status: ProposalStatus;
  currentVersion: number;
  targetSubmissionDate?: string | null;
  totalBudget?: number | null;
  createdBy?: string | null;
  metadata: Record<string, any>;
  sections?: ProposalSection[];
  createdAt: string;
  updatedAt: string;
}

export interface ProposalVersionSnapshot {
  id: string;
  proposalId: string;
  versionNumber: number;
  snapshotData: {
    title: string;
    sections: Array<{
      sectionCode: string;
      title: string;
      orderIndex: number;
      contentMarkdown: string;
      evidenceCitations: EvidenceCitation[];
      status: SectionStatus;
    }>;
  };
  createdBy?: string | null;
  changeSummary?: string | null;
  createdAt: string;
}

export interface ProposalTOCItem {
  sectionCode: string;
  title: string;
  description: string;
  requiredEvidenceTypes: string[];
  defaultPromptGoal: string;
}

/**
 * 대한민국 정부 R&D 및 공공 조달 표준 제안서 7대 대목차 템플릿
 */
export const STANDARD_PROPOSAL_TOC: ProposalTOCItem[] = [
  {
    sectionCode: '1.1_NEEDS_BACKGROUND',
    title: '1.1 개발 필요성 및 배경',
    description: '공모 배경, 국내외 시장 문제점 및 본 과제의 기술적·경제적 해결 필요성',
    requiredEvidenceTypes: ['EXPERIENCE', 'TECHNOLOGY'],
    defaultPromptGoal: 'RFP의 제안 배경 및 목적에 부합하는 문제의식과 해결 필요성을 명문화합니다.',
  },
  {
    sectionCode: '1.2_PROJECT_OBJECTIVES',
    title: '1.2 최종 목표 및 핵심 개발 내용',
    description: '과제의 최종 목표, 개발 범위 및 정량적 목표치',
    requiredEvidenceTypes: ['TECHNOLOGY'],
    defaultPromptGoal: 'RFP 필수 요구조건과 연계하여 최종 산출물 및 핵심 개발 범위를 정의합니다.',
  },
  {
    sectionCode: '2.1_TECH_ARCHITECTURE',
    title: '2.1 시스템 아키텍처 및 기술 구현 방안',
    description: '하드웨어/소프트웨어 아키텍처, 핵심 알고리즘 및 시스템 블록도',
    requiredEvidenceTypes: ['TECHNOLOGY', 'PATENT'],
    defaultPromptGoal: '사내 보유 기술 및 특허를 기반으로 실현 가능한 시스템 구조를 설계합니다.',
  },
  {
    sectionCode: '2.2_CORE_TECHNOLOGIES',
    title: '2.2 차별화 핵심 기술 및 사내 보유 역량',
    description: '경쟁 기술 대비 우위성, 사내 TRL 수준 및 특허 연계성',
    requiredEvidenceTypes: ['PATENT', 'CERTIFICATION', 'EQUIPMENT'],
    defaultPromptGoal: '실제 등록된 사내 특허 및 인증 자산을 증빙으로 제시하여 기술 실현성을 입증합니다.',
  },
  {
    sectionCode: '3.1_WBS_MILESTONES',
    title: '3.1 추진 일정 및 마일스톤 (WBS)',
    description: '단계별 개발 일정, 주요 마일스톤 및 산출물 정의',
    requiredEvidenceTypes: [],
    defaultPromptGoal: '사업 기간에 맞춘 단계별 WBS 및 산출물 일정을 수립합니다.',
  },
  {
    sectionCode: '3.2_QUANTITATIVE_KPI',
    title: '3.2 정량적 목표 및 성능 평가 지표 (KPI)',
    description: '공인인증기관 시험성적서 기반 정량적 성능 지표 및 측정 방법',
    requiredEvidenceTypes: ['CERTIFICATION'],
    defaultPromptGoal: 'RFP의 성능 요구조건에 부합하는 공인시험성적서 기반 KPI 목표치를 설정합니다.',
  },
  {
    sectionCode: '4.1_BUDGET_AND_BOM',
    title: '4.1 사업비 소요 내역 및 부품 원가 (BOM)',
    description: '인건비, 연구장비·재료비, 시제품 제작비 및 하드웨어 BOM 구성',
    requiredEvidenceTypes: ['EQUIPMENT', 'FINANCIAL'],
    defaultPromptGoal: '정부 지원 한도 및 사내 장비 보유 현황을 감안하여 현실적 사업비 소요 내역을 작성합니다.',
  },
  {
    sectionCode: '5.1_ORG_AND_TEAM',
    title: '5.1 사업 수행 체계 및 참여 인력',
    description: '총괄 책임자 및 핵심 연구인력의 직무, 전공 및 유사 과제 수행 실적',
    requiredEvidenceTypes: ['HUMAN_RESOURCE', 'EXPERIENCE'],
    defaultPromptGoal: '사내 등록된 실제 인력 프로필 및 유사 사업 실적만 연계하여 수행 체계를 구성합니다.',
  },
  {
    sectionCode: '5.2_PAST_EXPERIENCE',
    title: '5.2 유사 사업 수행 실적 및 상용화 역량',
    description: '최근 3~5개년 정부 과제 및 민간 프로젝트 납품/수행 실적',
    requiredEvidenceTypes: ['EXPERIENCE'],
    defaultPromptGoal: '절대 가짜 실적을 날조하지 않고, 사내 저장소에 등록된 실제 프로젝트 수행 실적만 인용합니다.',
  },
];

export interface QualityGateIssue {
  id: string;
  category: 'RFP_COMPLIANCE' | 'TECHNICAL' | 'BUSINESS' | 'EVIDENCE' | 'SCHEDULE' | 'BUDGET' | 'KPI' | 'DOCUMENT';
  severity: 'BLOCKER' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  actionRecommendation: string;
  actionUrl?: string;
  sectionCode?: string;
}

export interface ProposalQualityGate {
  proposalId: string;
  opportunityId?: string;
  readinessScore: number; // 0 ~ 100
  isReady: boolean; // true only if blockerCount === 0 and readinessScore >= 80
  blockerCount: number;
  highIssueCount: number;
  mediumIssueCount: number;
  issues: QualityGateIssue[];
  evaluationAxes: Array<{
    axis: string;
    label: string;
    score: number;
    maxScore: number;
    weightPercent: number;
    status: 'PASS' | 'WARN' | 'FAIL';
    feedback: string;
  }>;
  evaluatedAt: string;
}

