import { PipelineItem, PipelineStage, BidRoom } from "@/types/pipeline";
import { SAMPLE_OPPORTUNITIES } from "../today/sample-scenarios";

export class PipelineStore {
  private static instance: PipelineStore;
  private items: Map<string, PipelineItem> = new Map();

  private constructor() {
    // Initial state is completely clean (0 items).
  }

  public static getInstance(): PipelineStore {
    if (!PipelineStore.instance) {
      PipelineStore.instance = new PipelineStore();
    }
    return PipelineStore.instance;
  }

  public clearAll(): void {
    this.items.clear();
  }

  public seedDefault(): void {
    this.items.clear();
    const defaults: PipelineItem[] = [
      {
        id: "pipe-01",
        opportunityId: SAMPLE_OPPORTUNITIES[0]?.id || "opp-koneps-agv-001",
        stage: "BUSINESS_EVALUATION",
        priority: "URGENT",
        assignee: "미지정",
        notes: "스마트 물류창고 500kg AMR 실증 - 적격성 사전 점검 단계",
        eligibilityPassCount: 6,
        eligibilityTotalCount: 6,
        techFitScore: 94,
        businessFitScore: 89,
        enteredStageAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pipe-02",
        opportunityId: SAMPLE_OPPORTUNITIES[1]?.id || "opp-tipa-rnd-002",
        stage: "TECH_EVALUATION",
        priority: "HIGH",
        assignee: "미지정",
        notes: "TIPA 협동로봇 제어기 국산화 R&D - 사내 특허 연계 검토 단계",
        eligibilityPassCount: 5,
        eligibilityTotalCount: 5,
        techFitScore: 92,
        businessFitScore: 82,
        enteredStageAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pipe-03",
        opportunityId: SAMPLE_OPPORTUNITIES[2]?.id || "opp-keit-patrol-003",
        stage: "INITIAL_INTEREST",
        priority: "MEDIUM",
        assignee: "미지정",
        notes: "KEIT 순찰로봇 시제품 제작 기술혁신 과제 - 사전 적합성 검토 단계",
        eligibilityPassCount: 4,
        eligibilityTotalCount: 5,
        techFitScore: 86,
        businessFitScore: 78,
        enteredStageAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const item of defaults) {
      this.items.set(item.id, item);
    }
  }

  public getAll(): PipelineItem[] {
    return Array.from(this.items.values());
  }

  public getByOpportunityId(opportunityId: string): PipelineItem | undefined {
    return Array.from(this.items.values()).find((i) => i.opportunityId === opportunityId);
  }

  public moveStage(itemId: string, nextStage: PipelineStage): PipelineItem {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Pipeline item not found: ${itemId}`);
    item.stage = nextStage;
    item.enteredStageAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    this.items.set(itemId, item);
    return item;
  }

  public bulkMoveStage(itemIds: string[], nextStage: PipelineStage): number {
    let count = 0;
    for (const id of itemIds) {
      const item = this.items.get(id);
      if (item) {
        item.stage = nextStage;
        item.updatedAt = new Date().toISOString();
        this.items.set(id, item);
        count++;
      }
    }
    return count;
  }

  public assignUser(itemId: string, assignee: string): PipelineItem {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Pipeline item not found: ${itemId}`);
    item.assignee = assignee;
    item.updatedAt = new Date().toISOString();
    this.items.set(itemId, item);
    return item;
  }

  private bidRooms: Map<string, BidRoom> = new Map();

  public getOrCreateBidRoom(opportunityId: string, opp?: any): BidRoom {
    if (this.bidRooms.has(opportunityId)) {
      return this.bidRooms.get(opportunityId)!;
    }
    const item = this.getByOpportunityId(opportunityId);
    const deadlineDate = opp?.deadline ? new Date(opp.deadline) : new Date(Date.now() + 5 * 86400000);
    const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    const bidRoom: BidRoom = {
      id: `bidroom-${opportunityId}`,
      opportunityId,
      opportunityTitle: opp?.title || item?.notes || "공공 수주 프로젝트",
      announcingAgency: opp?.announcingAgency || "발주기관",
      budget: opp?.budget || null,
      deadline: opp?.deadline || deadlineDate.toISOString(),
      daysRemaining,
      stage: item?.stage || "BUSINESS_EVALUATION",
      status: "ACTIVE",
      leadAssignee: item?.assignee || "미지정",
      teamMembers: item?.assignee && item.assignee !== "미지정" ? [item.assignee] : [],
      proposalId: "",
      proposalTitle: `${opp?.title || "공공사업"} 제안서 준비 중`,
      proposalProgressPercent: 0,
      complianceRatePercent: 0,
      taskTotalCount: 0,
      taskDoneCount: 0,
      evidenceTotalCount: 0,
      evidenceAttachedCount: 0,
      criticalBlockerCount: 0,
      timelineMilestones: [],
      activities: [],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.bidRooms.set(opportunityId, bidRoom);
    return bidRoom;
  }

  public createOrUpdate(item: PipelineItem): PipelineItem {
    item.updatedAt = new Date().toISOString();
    this.items.set(item.id, item);
    return item;
  }
}

export const pipelineStore = PipelineStore.getInstance();
