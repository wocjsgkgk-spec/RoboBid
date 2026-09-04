import { CapabilityRecord, Opportunity, RequirementCandidate } from '@/types';
import {
  Proposal,
  ProposalSection,
  ProposalStatus,
  ProposalVersionSnapshot,
  SectionStatus,
  STANDARD_PROPOSAL_TOC,
} from '@/types/proposal';
import { ProposalDraftingEngine } from './drafting-engine';

export class ProposalService {
  private draftingEngine: ProposalDraftingEngine;

  // 메모리 기반 스토리지 (단위 테스트 및 DB 폴백)
  private memoryProposals: Map<string, Proposal> = new Map();
  private memorySections: Map<string, ProposalSection[]> = new Map();
  private memoryVersions: Map<string, ProposalVersionSnapshot[]> = new Map();

  constructor(draftingEngine?: ProposalDraftingEngine) {
    this.draftingEngine = draftingEngine || new ProposalDraftingEngine();
  }

  /**
   * GO 공모 기반으로 제안서 워크스페이스 및 표준 목차 초기화
   */
  public createProposalFromOpportunity(
    opportunity: Opportunity,
    options: { userId?: string; targetSubmissionDate?: string; totalBudget?: number } = {}
  ): Proposal {
    const proposalId = crypto.randomUUID();
    const now = new Date().toISOString();

    const proposal: Proposal = {
      id: proposalId,
      organizationId: opportunity.organizationId,
      opportunityId: opportunity.id,
      title: `[제안서] ${opportunity.title}`,
      status: 'DRAFTING',
      currentVersion: 1,
      targetSubmissionDate: options.targetSubmissionDate || opportunity.submissionDeadline,
      totalBudget: options.totalBudget || opportunity.allocatedBudget,
      createdBy: options.userId || null,
      metadata: {
        announcingAgency: opportunity.announcingAgency,
        bidType: opportunity.bidType,
      },
      createdAt: now,
      updatedAt: now,
    };

    // 표준 목차(TOC) 기반 빈 섹션 자동 생성
    const sections: ProposalSection[] = STANDARD_PROPOSAL_TOC.map((tocItem, index) => ({
      id: crypto.randomUUID(),
      proposalId,
      sectionCode: tocItem.sectionCode,
      title: tocItem.title,
      orderIndex: index,
      contentMarkdown: '',
      evidenceCitations: [],
      status: 'EMPTY',
      version: 1,
      createdAt: now,
      updatedAt: now,
    }));

    this.memoryProposals.set(proposalId, proposal);
    this.memorySections.set(proposalId, sections);

    return {
      ...proposal,
      sections,
    };
  }

  /**
   * RAG 기반 제안서 섹션 초안 일괄 또는 단일 생성
   */
  public generateDraft(
    proposalId: string,
    opportunity: Opportunity,
    capabilities: CapabilityRecord[],
    requirements: RequirementCandidate[],
    targetSectionCode?: string
  ): ProposalSection[] {
    const sections = this.memorySections.get(proposalId);
    if (!sections) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    const now = new Date().toISOString();

    for (const section of sections) {
      if (targetSectionCode && section.sectionCode !== targetSectionCode) {
        continue;
      }

      const tocItem = STANDARD_PROPOSAL_TOC.find((t) => t.sectionCode === section.sectionCode);
      if (!tocItem) continue;

      const draftResult = this.draftingEngine.generateSectionDraft({
        opportunity,
        tocItem,
        capabilities,
        requirements,
      });

      section.contentMarkdown = draftResult.contentMarkdown;
      section.evidenceCitations = draftResult.evidenceCitations;
      section.status = 'AI_GENERATED';
      section.version += 1;
      section.updatedAt = now;
    }

    // 제안서 메타데이터 갱신
    const proposal = this.memoryProposals.get(proposalId);
    if (proposal) {
      proposal.updatedAt = now;
    }

    return sections;
  }

  /**
   * 인간 작성자의 섹션 본문 수정 및 검토 확정
   */
  public updateSection(
    proposalId: string,
    sectionCode: string,
    contentMarkdown: string,
    status: SectionStatus = 'EDITED'
  ): ProposalSection {
    const sections = this.memorySections.get(proposalId);
    if (!sections) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    const section = sections.find((s) => s.sectionCode === sectionCode);
    if (!section) {
      throw new Error(`Section not found: ${sectionCode}`);
    }

    section.contentMarkdown = contentMarkdown;
    section.status = status;
    section.version += 1;
    section.updatedAt = new Date().toISOString();

    return section;
  }

  /**
   * 제안서 버전 스냅샷 생성
   */
  public createVersionSnapshot(
    proposalId: string,
    changeSummary: string,
    userId?: string
  ): ProposalVersionSnapshot {
    const proposal = this.memoryProposals.get(proposalId);
    const sections = this.memorySections.get(proposalId);

    if (!proposal || !sections) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    const versionNumber = proposal.currentVersion;
    const now = new Date().toISOString();

    const snapshot: ProposalVersionSnapshot = {
      id: crypto.randomUUID(),
      proposalId,
      versionNumber,
      snapshotData: {
        title: proposal.title,
        sections: sections.map((s) => ({
          sectionCode: s.sectionCode,
          title: s.title,
          orderIndex: s.orderIndex,
          contentMarkdown: s.contentMarkdown,
          evidenceCitations: s.evidenceCitations,
          status: s.status,
        })),
      },
      createdBy: userId || null,
      changeSummary,
      createdAt: now,
    };

    const versionList = this.memoryVersions.get(proposalId) || [];
    versionList.unshift(snapshot);
    this.memoryVersions.set(proposalId, versionList);

    // 버전 증가
    proposal.currentVersion += 1;
    proposal.updatedAt = now;

    return snapshot;
  }

  /**
   * 제안서 및 하위 섹션 상세 조회
   */
  public getProposal(proposalId: string): Proposal | null {
    const proposal = this.memoryProposals.get(proposalId);
    if (!proposal) return null;

    const sections = this.memorySections.get(proposalId) || [];
    return {
      ...proposal,
      sections,
    };
  }

  /**
   * 제안서 목록 조회
   */
  public listProposals(organizationId: string): Proposal[] {
    const list: Proposal[] = [];
    for (const p of this.memoryProposals.values()) {
      if (p.organizationId === organizationId) {
        list.push({
          ...p,
          sections: this.memorySections.get(p.id) || [],
        });
      }
    }
    return list;
  }

  /**
   * 버전 이력 조회
   */
  public getVersions(proposalId: string): ProposalVersionSnapshot[] {
    return this.memoryVersions.get(proposalId) || [];
  }

  /**
   * 제안서 상태 업데이트
   */
  public updateProposalStatus(proposalId: string, status: ProposalStatus): void {
    const proposal = this.memoryProposals.get(proposalId);
    if (proposal) {
      proposal.status = status;
      proposal.updatedAt = new Date().toISOString();
    }
  }

  /**
   * 메모리 초기화 (테스트용)
   */
  public clearMemory(): void {
    this.memoryProposals.clear();
    this.memorySections.clear();
    this.memoryVersions.clear();
  }
}

export const proposalService = new ProposalService();
