/**
 * RoboBid AI v3.0 — Funding Portfolio Store
 * 프로젝트별 자금 지원 포트폴리오(CANDIDATE, PLANNED, APPLIED, UNDER_REVIEW, AWARDED, REJECTED, CANCELLED) 관리
 * 및 Target Cost 대비 Awarded vs Candidate 분리 집계
 */

import {
  FundingPortfolioItem,
  FundingPortfolioSummary,
  FundingPortfolioStatus,
  ProjectConcept,
} from "@/types";
import { conceptStore } from "@/lib/concepts/concept-store";

declare global {
  // eslint-disable-next-line no-var
  var __fundingPortfolioStore: FundingPortfolioStore | undefined;
}

export class FundingPortfolioStore {
  private static instance: FundingPortfolioStore;
  private items: Map<string, FundingPortfolioItem> = new Map();

  private constructor() {
    this.restoreFromStorage();
    if (this.items.size === 0) {
      this.seedInitialData();
    }
  }

  public static getInstance(): FundingPortfolioStore {
    if (typeof global !== "undefined") {
      if (!global.__fundingPortfolioStore) {
        global.__fundingPortfolioStore = new FundingPortfolioStore();
      }
      return global.__fundingPortfolioStore;
    }
    if (!FundingPortfolioStore.instance) {
      FundingPortfolioStore.instance = new FundingPortfolioStore();
    }
    return FundingPortfolioStore.instance;
  }

  private persistToStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const serialized = JSON.stringify(Array.from(this.items.values()));
        window.localStorage.setItem("robobid_v3_funding_portfolio", serialized);
      } catch (e) {
        console.warn("Failed to persist funding portfolio to localStorage:", e);
      }
    }
  }

  private restoreFromStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = window.localStorage.getItem("robobid_v3_funding_portfolio");
        if (raw) {
          const list: FundingPortfolioItem[] = JSON.parse(raw);
          this.items.clear();
          list.forEach((item) => this.items.set(item.id, item));
        }
      } catch (e) {
        console.warn("Failed to restore funding portfolio from localStorage:", e);
      }
    }
  }

  private seedInitialData(): void {
    const now = new Date().toISOString();
    const amrProjectId = "c001-amr-logistics-robot";

    // 1. AWARDED: 기확보 자금 (중기부 디딤돌 첫걸음 R&D)
    const item1: FundingPortfolioItem = {
      id: "port-001-didimdol-rnd",
      projectConceptId: amrProjectId,
      opportunityId: "opp-seed-001",
      opportunityTitle: "2025년 창업성장기술개발사업(디딤돌 첫걸음 R&D)",
      announcingAgency: "중소벤처기업부",
      fundingType: "GOV_RND",
      status: "AWARDED",
      targetGrantAmount: 120_000_000,
      awardedGrantAmount: 120_000_000,
      selfFundingAmount: 24_000_000,
      period: {
        startDate: "2025-06-01",
        endDate: "2026-05-31",
      },
      allocatedCategories: {
        LABOR: 60_000_000,
        PARTS: 40_000_000,
        OUTSOURCING: 20_000_000,
      },
      assetsIncluded: ["Jetson AGX Orin 64GB"],
      partsIncluded: ["BLDC 서보모터 드라이버"],
      personnelIncluded: ["김수석", "박책임"],
      notes: "1단계 AMR 구동부 및 기초 자율주행 제어기 개발 완료",
      createdAt: now,
      updatedAt: now,
    };

    // 2. UNDER_REVIEW: 심사 평가 중 (스케일업 TIPS R&D 5억원)
    const item2: FundingPortfolioItem = {
      id: "port-002-scaleup-tips",
      projectConceptId: amrProjectId,
      opportunityId: "opp-seed-002",
      opportunityTitle: "2026년 스케일업 TIPS R&D 연계지원사업 (로봇 특화분야)",
      announcingAgency: "중소벤처기업부 / 한국엔젤투자협회",
      fundingType: "GOV_RND",
      status: "UNDER_REVIEW",
      targetGrantAmount: 500_000_000,
      awardedGrantAmount: 0,
      selfFundingAmount: 100_000_000,
      period: {
        startDate: "2026-07-01",
        endDate: "2028-06-30",
      },
      allocatedCategories: {
        LABOR: 200_000_000,
        PARTS: 100_000_000,
        EQUIPMENT: 80_000_000,
        VALIDATION: 50_000_000,
        SW_SERVER: 30_000_000,
        OUTSOURCING: 40_000_000,
      },
      assetsIncluded: ["Ouster 32ch 3D LiDAR 시험용 지그"],
      partsIncluded: ["LiFePO4 배터리팩+BMS"],
      personnelIncluded: ["김수석", "이선임", "최연구원"],
      notes: "대면평가 완료, 최종 선정 통보 대기 중",
      createdAt: now,
      updatedAt: now,
    };

    // 3. PLANNED: 공고 확인 및 지원 계획 수립 (로봇산업진흥원 유망 실증)
    const item3: FundingPortfolioItem = {
      id: "port-003-kiria-validation",
      projectConceptId: amrProjectId,
      opportunityId: "opp-seed-003",
      opportunityTitle: "2026년 로봇활용 제조혁신 실증 및 보급사업",
      announcingAgency: "한국로봇산업진흥원 (KIRIA)",
      fundingType: "VALIDATION_GRANT",
      status: "PLANNED",
      targetGrantAmount: 150_000_000,
      awardedGrantAmount: 0,
      selfFundingAmount: 30_000_000,
      period: {
        startDate: "2026-08-01",
        endDate: "2027-04-30",
      },
      allocatedCategories: {
        VALIDATION: 80_000_000,
        EQUIPMENT: 40_000_000,
        OUTSOURCING: 30_000_000,
      },
      assetsIncluded: ["풀필먼트 현장 FMS 관제 서버"],
      partsIncluded: ["Safety PLC 인터페이스 모듈"],
      personnelIncluded: ["박책임", "정엔지니어"],
      notes: "실증 수요기업(풀필먼트 물류센터) 컨소시엄 협약 진행 중",
      createdAt: now,
      updatedAt: now,
    };

    // 4. CANDIDATE: 후보 검토 (지자체 기술사업화 지원)
    const item4: FundingPortfolioItem = {
      id: "port-004-local-commercial",
      projectConceptId: amrProjectId,
      opportunityId: "opp-seed-004",
      opportunityTitle: "2026년 경기 유망 로봇기업 사업화 및 마케팅 촉진 지원",
      announcingAgency: "경기도경제과학진흥원",
      fundingType: "COMMERCIALIZATION",
      status: "CANDIDATE",
      targetGrantAmount: 30_000_000,
      awardedGrantAmount: 0,
      selfFundingAmount: 5_000_000,
      period: {
        startDate: "2026-09-01",
        endDate: "2027-02-28",
      },
      allocatedCategories: {
        MARKETING: 15_000_000,
        CERTIFICATION: 15_000_000,
      },
      notes: "전시회 부스 참가 및 KOLAS 인증비 충당 후보",
      createdAt: now,
      updatedAt: now,
    };

    this.items.set(item1.id, item1);
    this.items.set(item2.id, item2);
    this.items.set(item3.id, item3);
    this.items.set(item4.id, item4);
  }

  public getAll(): FundingPortfolioItem[] {
    return Array.from(this.items.values());
  }

  public getByProject(projectId: string): FundingPortfolioItem[] {
    return Array.from(this.items.values()).filter(
      (item) => item.projectConceptId === projectId
    );
  }

  public getById(id: string): FundingPortfolioItem | null {
    return this.items.get(id) || null;
  }

  public add(item: Omit<FundingPortfolioItem, "id" | "createdAt" | "updatedAt">): FundingPortfolioItem {
    const now = new Date().toISOString();
    const id = `port-${crypto.randomUUID()}`;
    const newItem: FundingPortfolioItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(id, newItem);
    this.persistToStorage();
    return newItem;
  }

  public update(id: string, updates: Partial<FundingPortfolioItem>): FundingPortfolioItem | null {
    const existing = this.items.get(id);
    if (!existing) return null;

    const updated: FundingPortfolioItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, updated);
    this.persistToStorage();
    return updated;
  }

  public remove(id: string): boolean {
    const deleted = this.items.delete(id);
    if (deleted) {
      this.persistToStorage();
    }
    return deleted;
  }

  /**
   * 프로젝트별 포트폴리오 집계 통계
   * - Target Cost: 목표 총 개발비
   * - Awarded: 실제 선정 확정 금액
   * - Under Review: 심사 진행 중 금액
   * - Planned: 계획 금액
   * - Candidate: 검토 후보 금액
   * - Gap: Target Cost - Awarded (미확보 잔여액)
   * - Coverage: Awarded / Target Cost * 100 (%)
   */
  public getSummary(projectId?: string): FundingPortfolioSummary {
    let items = this.getAll();
    let targetCost = 800_000_000; // default AMR budget

    if (projectId) {
      items = this.getByProject(projectId);
      const concept = conceptStore.getById(projectId);
      if (concept && concept.estimatedBudget > 0) {
        targetCost = concept.estimatedBudget;
      }
    }

    let awarded = 0;
    let underReview = 0;
    let planned = 0;
    let candidate = 0;

    for (const item of items) {
      if (item.status === "AWARDED") {
        awarded += item.awardedGrantAmount || item.targetGrantAmount;
      } else if (item.status === "UNDER_REVIEW") {
        underReview += item.targetGrantAmount;
      } else if (item.status === "PLANNED" || item.status === "APPLIED") {
        planned += item.targetGrantAmount;
      } else if (item.status === "CANDIDATE") {
        candidate += item.targetGrantAmount;
      }
    }

    const gap = Math.max(0, targetCost - awarded);
    const coverage = targetCost > 0 ? Math.min(100, Math.round((awarded / targetCost) * 100)) : 0;
    const pipelineTotal = awarded + underReview + planned;

    return {
      targetCost,
      awarded,
      underReview,
      planned,
      candidate,
      gap,
      coverage,
      pipelineTotal,
      items,
    };
  }
}

export const fundingPortfolioStore = FundingPortfolioStore.getInstance();
