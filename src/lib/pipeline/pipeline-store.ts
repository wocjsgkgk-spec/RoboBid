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
        assignee: "김수석 (사업개발팀)",
        notes: "조달청 물류로봇 실증 - 70:30 컨소시엄 협정 완료, A값 투찰가 최종 검토 단계",
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
        assignee: "이책임 (로봇연구소)",
        notes: "TIPA 스마트공장 자율제어 R&D - 사내 TRL 7단계 물류로봇 특허와 연계하여 3개 세부과제 검토 중",
        eligibilityPassCount: 5,
        eligibilityTotalCount: 5,
        techFitScore: 92,
        businessFitScore: 82,
        enteredStageAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pipe-03",
        opportunityId: SAMPLE_OPPORTUNITIES[2]?.id || "opp-nipa-ai-003",
        stage: "INITIAL_INTEREST",
        priority: "MEDIUM",
        assignee: "박선임 (전략기획팀)",
        notes: "NIPA AI 바우처 - 수요기업 매칭 확인 및 인공지능 안전 솔루션 패키징 검토",
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
      leadAssignee: item?.assignee || "김수석 (사업개발팀)",
      teamMembers: ["김수석 (사업개발팀)", "이책임 (로봇연구소)", "박선임 (전략기획팀)"],
      proposalId: "prop-sample-01",
      proposalTitle: `${opp?.title || "공공사업"} 제안서 v1.0`,
      proposalProgressPercent: 68,
      complianceRatePercent: 85,
      taskTotalCount: 8,
      taskDoneCount: 5,
      evidenceTotalCount: 12,
      evidenceAttachedCount: 9,
      criticalBlockerCount: 0,
      timelineMilestones: [
        { date: "D-14", title: "RFP 분석 및 컨소시엄 구성", completed: true },
        { date: "D-10", title: "제안 목차 확정 및 역할 배분", completed: true },
        { date: "D-7", title: "1차 제안서 초안 조립 및 컴플라이언스 검토", completed: true },
        { date: "D-3", title: "증빙서류 패키징 및 가격 투찰선 확정", completed: false },
        { date: "D-Day", title: "나라장터 전산 최종 제출 및 접수증 수령", completed: false },
      ],
      activities: [
        {
          id: "act-1",
          user: "김수석 (사업개발팀)",
          action: "제안서 3장 'AI 관제 아키텍처' 섹션 초안 등록",
          timestamp: "방금 전",
        },
        {
          id: "act-2",
          user: "이책임 (로봇연구소)",
          action: "TRL 7단계 자율주행 성능시험 성적서 첨부 완료",
          timestamp: "2시간 전",
        },
        {
          id: "act-3",
          user: "박선임 (전략기획팀)",
          action: "기업신용평가등급확인서(A-) 유효기간 검증 완료",
          timestamp: "어제",
        },
      ],
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
