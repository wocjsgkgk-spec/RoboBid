/**
 * RoboBid AI — In-Memory Opportunity Store (Zero-Key Demo & Live Pipeline Store)
 * 공공조달 공모 파이프라인 싱글톤 저장소
 */

import { Opportunity, BidType, OpportunityStatus, DataSource, DEFAULT_ORGANIZATION_ID } from "@/types";
import { SAMPLE_OPPORTUNITIES } from "../today/sample-scenarios";
import { DecisionService } from "../decision/decision-service";
import { BidDecision, DecisionType } from "@/types/decision";

export interface CreateManualOpportunityInput {
  title: string;
  announcingAgency: string;
  demandingAgency?: string;
  bidType: BidType;
  primaryDomain?: string;
  allocatedBudget?: number;
  estimatedPrice?: number;
  submissionDeadline: string;
  canonicalUrl?: string;
  status?: OpportunityStatus;
  dataSource?: DataSource;
}

export class OpportunityStore {
  private static instance: OpportunityStore;
  private opportunities: Map<string, Opportunity> = new Map();
  private decisions: Map<string, BidDecision> = new Map();

  private constructor() {
    this.seedDefault();
  }

  public static getInstance(): OpportunityStore {
    if (!OpportunityStore.instance) {
      OpportunityStore.instance = new OpportunityStore();
    }
    return OpportunityStore.instance;
  }

  /**
   * 실전 조달청/중기부/NIPA 공모 3종 기본 적재
   */
  public seedDefault(): void {
    this.opportunities.clear();
    for (const opp of SAMPLE_OPPORTUNITIES) {
      this.opportunities.set(opp.id, {
        ...opp,
        dataSource: "DEMO",
      });
    }
  }

  public getAll(): Opportunity[] {
    return Array.from(this.opportunities.values());
  }

  public getById(id: string): Opportunity | undefined {
    return this.opportunities.get(id);
  }

  public save(opp: Opportunity): Opportunity {
    const updated: Opportunity = {
      ...opp,
      updatedAt: new Date().toISOString(),
    };
    this.opportunities.set(updated.id, updated);
    return updated;
  }

  public delete(id: string): boolean {
    return this.opportunities.delete(id);
  }

  /**
   * 공모 직접 수동 등록
   */
  public createManual(input: CreateManualOpportunityInput): Opportunity {
    const id = `opp-manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newOpp: Opportunity = {
      id,
      organizationId: DEFAULT_ORGANIZATION_ID,
      providerId: "provider-manual",
      sourceId: `MANUAL-${Date.now()}`,
      title: input.title,
      announcingAgency: input.announcingAgency,
      demandingAgency: input.demandingAgency || null,
      bidType: input.bidType,
      primaryDomain: input.primaryDomain || "ROBOT",
      allocatedBudget: input.allocatedBudget || null,
      estimatedPrice: input.estimatedPrice || null,
      postedAt: new Date().toISOString(),
      submissionDeadline: input.submissionDeadline,
      canonicalUrl: input.canonicalUrl || null,
      status: input.status || "INBOX",
      dataSource: input.dataSource || "USER_INPUT",
      contentHash: `hash-${id}`,
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.opportunities.set(id, newOpp);
    return newOpp;
  }

  /**
   * 공모 복제
   */
  public duplicate(id: string): Opportunity {
    const source = this.opportunities.get(id);
    if (!source) throw new Error(`Opportunity not found: ${id}`);
    const newId = `opp-copy-${Date.now()}`;
    const copy: Opportunity = {
      ...source,
      id: newId,
      sourceId: `COPY-${Date.now()}`,
      title: `[복사본] ${source.title}`,
      status: "INBOX",
      dataSource: "USER_INPUT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.opportunities.set(newId, copy);
    return copy;
  }

  /**
   * CSV 일괄 가져오기
   */
  public importBatchCsv(
    rows: Array<{
      title: string;
      agency: string;
      budget?: number;
      deadline: string;
      bidType?: BidType;
    }>
  ): Opportunity[] {
    const imported: Opportunity[] = [];
    for (const r of rows) {
      const opp = this.createManual({
        title: r.title,
        announcingAgency: r.agency,
        allocatedBudget: r.budget,
        submissionDeadline: r.deadline,
        bidType: r.bidType || "R_AND_D",
        dataSource: "IMPORTED",
      });
      imported.push(opp);
    }
    return imported;
  }

  /**
   * 공공데이터포털(KONEPS 등) Open API 수집 공고 적재
   */
  public upsertFromApi(
    payloads: Array<{
      sourceId: string;
      title: string;
      announcingAgency: string;
      demandingAgency?: string | null;
      bidType: BidType;
      primaryDomain?: string;
      allocatedBudget?: number | null;
      estimatedPrice?: number | null;
      postedAt?: string;
      submissionDeadline: string;
      canonicalUrl?: string | null;
    }>
  ): Opportunity[] {
    const upserted: Opportunity[] = [];
    for (const p of payloads) {
      const existing = Array.from(this.opportunities.values()).find(
        (o) => o.sourceId === p.sourceId
      );
      if (existing) {
        const updated: Opportunity = {
          ...existing,
          title: p.title,
          announcingAgency: p.announcingAgency,
          demandingAgency: p.demandingAgency !== undefined ? p.demandingAgency : existing.demandingAgency,
          allocatedBudget: p.allocatedBudget !== undefined ? p.allocatedBudget : existing.allocatedBudget,
          estimatedPrice: p.estimatedPrice !== undefined ? p.estimatedPrice : existing.estimatedPrice,
          submissionDeadline: p.submissionDeadline,
          canonicalUrl: p.canonicalUrl || existing.canonicalUrl,
          currentVersion: (existing.currentVersion || 1) + 1,
          updatedAt: new Date().toISOString(),
        };
        this.opportunities.set(existing.id, updated);
        upserted.push(updated);
      } else {
        const id = `opp-api-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newOpp: Opportunity = {
          id,
          organizationId: DEFAULT_ORGANIZATION_ID,
          providerId: "koneps",
          sourceId: p.sourceId,
          title: p.title,
          announcingAgency: p.announcingAgency,
          demandingAgency: p.demandingAgency || null,
          bidType: p.bidType,
          primaryDomain: p.primaryDomain || "ROBOT",
          allocatedBudget: p.allocatedBudget || null,
          estimatedPrice: p.estimatedPrice || null,
          postedAt: p.postedAt || new Date().toISOString(),
          submissionDeadline: p.submissionDeadline,
          canonicalUrl: p.canonicalUrl || null,
          status: "INBOX",
          dataSource: "API",
          contentHash: `hash-${id}`,
          currentVersion: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.opportunities.set(id, newOpp);
        upserted.push(newOpp);
      }
    }
    return upserted;
  }

  /**
   * 상태 직접 갱신
   */
  public updateStatus(id: string, status: OpportunityStatus): Opportunity {
    const opp = this.opportunities.get(id);
    if (!opp) throw new Error(`Opportunity not found: ${id}`);
    opp.status = status;
    opp.updatedAt = new Date().toISOString();
    this.opportunities.set(id, opp);
    return opp;
  }

  /**
   * GO / NO-GO 의사결정 기록 및 상태 갱신
   */
  public recordDecision(input: {
    opportunityId: string;
    organizationId: string;
    userId?: string;
    userName?: string;
    decision: DecisionType;
    reason: string;
    conditions?: string[];
    scoreAtDecision: number;
  }): { decision: BidDecision; opportunity?: Opportunity } {
    const { decision, newOpportunityStatus } = DecisionService.recordDecision(input);
    this.decisions.set(decision.id, decision);

    const opp = this.opportunities.get(input.opportunityId);
    if (opp) {
      opp.status = newOpportunityStatus;
      opp.updatedAt = new Date().toISOString();
      this.opportunities.set(opp.id, opp);
    }

    return { decision, opportunity: opp };
  }

  public getAllDecisions(): BidDecision[] {
    return Array.from(this.decisions.values());
  }

  public getDecisionsForOpportunity(opportunityId: string): BidDecision[] {
    return this.getAllDecisions().filter((d) => d.opportunityId === opportunityId);
  }

  public count(): number {
    return this.opportunities.size;
  }
}

export const opportunityStore = OpportunityStore.getInstance();
