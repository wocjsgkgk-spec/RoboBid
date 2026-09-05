import { EvidenceItem } from "@/types/evidence";
import { SAMPLE_OPPORTUNITIES } from "../today/sample-scenarios";

export class EvidenceStore {
  private static instance: EvidenceStore;
  private items: Map<string, EvidenceItem> = new Map();

  private constructor() {
    // Initial state is completely clean (0 items).
  }

  public static getInstance(): EvidenceStore {
    if (!EvidenceStore.instance) {
      EvidenceStore.instance = new EvidenceStore();
    }
    return EvidenceStore.instance;
  }

  public clearAll(): void {
    this.items.clear();
  }

  public seedDefault(): void {
    this.items.clear();
    const defaults: EvidenceItem[] = [
      {
        id: "evi-01",
        name: "사업자등록증명원 (국세청 홈택스)",
        category: "CORPORATE",
        fileExtension: "pdf",
        fileSizeBytes: 245000,
        issueDate: "2026-01-05",
        expiryDate: "2026-12-31",
        isExpired: false,
        securityLevel: "PUBLIC",
        assignee: "경영지원팀",
        tags: ["필수서류", "사업자등록", "홈택스"],
        description: "공공입찰 기본 제출용 법인 사업자등록증명 최신본",
        linkedOpportunityIds: [SAMPLE_OPPORTUNITIES[0]?.id || "", SAMPLE_OPPORTUNITIES[1]?.id || ""],
        linkedProposalIds: ["prop-demo-001"],
        reusableScore: 100,
        createdAt: "2026-01-05T09:00:00Z",
        updatedAt: "2026-01-05T09:00:00Z",
      },
      {
        id: "evi-02",
        name: "중소기업확인서 (소상공인시장진흥공단)",
        category: "CORPORATE",
        fileExtension: "pdf",
        fileSizeBytes: 310000,
        issueDate: "2025-04-01",
        expiryDate: "2026-03-31", // D-27 만료 임박
        isExpired: false,
        securityLevel: "PUBLIC",
        assignee: "경영지원팀",
        tags: ["중소기업", "적격심사", "가점"],
        description: "조달청 중소기업자간 경쟁입찰 참가자격 확인 증빙 (갱신 필요)",
        linkedOpportunityIds: [SAMPLE_OPPORTUNITIES[0]?.id || ""],
        linkedProposalIds: ["prop-demo-001"],
        reusableScore: 95,
        createdAt: "2025-04-01T10:00:00Z",
        updatedAt: "2026-02-01T10:00:00Z",
      },
      {
        id: "evi-03",
        name: "특허등록원부 - 자율이동로봇 SLAM 군집제어 시스템 (제10-2458902호)",
        category: "PATENT",
        fileExtension: "pdf",
        fileSizeBytes: 1250000,
        issueDate: "2024-08-15",
        expiryDate: "2044-08-15",
        isExpired: false,
        securityLevel: "INTERNAL",
        assignee: "로봇연구소",
        tags: ["특허", "AGV", "SLAM", "기술성평가"],
        description: "R&D 및 물류로봇 입찰 시 정량/정성 기술평가 만점 증빙 자료",
        linkedOpportunityIds: [SAMPLE_OPPORTUNITIES[0]?.id || "", SAMPLE_OPPORTUNITIES[1]?.id || ""],
        linkedProposalIds: ["prop-demo-001"],
        reusableScore: 98,
        createdAt: "2024-08-15T14:00:00Z",
        updatedAt: "2024-08-15T14:00:00Z",
      },
      {
        id: "evi-04",
        name: "이노비즈(기술혁신형 중소기업) 확인서 (AA등급)",
        category: "CERTIFICATE",
        fileExtension: "pdf",
        fileSizeBytes: 420000,
        issueDate: "2024-05-20",
        expiryDate: "2027-05-19",
        isExpired: false,
        securityLevel: "PUBLIC",
        assignee: "사업개발팀",
        tags: ["이노비즈", "가점", "기술혁신"],
        description: "중기부 및 조달청 신인도 가점 1.5점 부여 증빙",
        linkedOpportunityIds: [SAMPLE_OPPORTUNITIES[0]?.id || "", SAMPLE_OPPORTUNITIES[1]?.id || ""],
        linkedProposalIds: ["prop-demo-001"],
        reusableScore: 92,
        createdAt: "2024-05-20T11:00:00Z",
        updatedAt: "2024-05-20T11:00:00Z",
      },
      {
        id: "evi-05",
        name: "물류창고 AGV 10대 구축 납품완료 실적증명서 (CJ대한통운)",
        category: "PERFORMANCE",
        fileExtension: "pdf",
        fileSizeBytes: 890000,
        issueDate: "2025-11-30",
        expiryDate: undefined,
        isExpired: false,
        securityLevel: "CONFIDENTIAL",
        assignee: "영업본부",
        tags: ["납품실적", "실적증명", "적격심사"],
        description: "최근 3년 이내 유사 실적 증빙 (계약금액 8.5억원)",
        linkedOpportunityIds: [SAMPLE_OPPORTUNITIES[0]?.id || ""],
        linkedProposalIds: ["prop-demo-001"],
        reusableScore: 99,
        createdAt: "2025-11-30T17:00:00Z",
        updatedAt: "2025-11-30T17:00:00Z",
      },
      {
        id: "evi-06",
        name: "2025년도 표준 재무제표증명 (국세청 확인원)",
        category: "FINANCIAL",
        fileExtension: "pdf",
        fileSizeBytes: 560000,
        issueDate: "2026-01-20",
        expiryDate: "2027-01-19",
        isExpired: false,
        securityLevel: "CONFIDENTIAL",
        assignee: "재무기획팀",
        tags: ["재무제표", "경영상태", "적격심사"],
        description: "부채비율 84%, 유동비율 165% 건전 경영상태 증빙",
        linkedOpportunityIds: [SAMPLE_OPPORTUNITIES[0]?.id || "", SAMPLE_OPPORTUNITIES[1]?.id || ""],
        linkedProposalIds: [],
        reusableScore: 90,
        createdAt: "2026-01-20T09:30:00Z",
        updatedAt: "2026-01-20T09:30:00Z",
      },
    ];

    for (const item of defaults) {
      this.items.set(item.id, item);
    }
  }

  public getAll(): EvidenceItem[] {
    return Array.from(this.items.values());
  }

  public getById(id: string): EvidenceItem | undefined {
    return this.items.get(id);
  }

  public getRecommendedForOpportunity(opportunityId: string): EvidenceItem[] {
    // 공모와 연계되었거나 재사용 점수가 90점 이상인 필수 증빙 추천
    return this.getAll().filter(
      (e) => e.linkedOpportunityIds.includes(opportunityId) || e.reusableScore >= 95
    );
  }

  public create(item: Omit<EvidenceItem, "id" | "createdAt" | "updatedAt">): EvidenceItem {
    const newItem: EvidenceItem = {
      ...item,
      id: `evi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.set(newItem.id, newItem);
    return newItem;
  }

  public delete(id: string): boolean {
    return this.items.delete(id);
  }
}

export const evidenceStore = EvidenceStore.getInstance();
