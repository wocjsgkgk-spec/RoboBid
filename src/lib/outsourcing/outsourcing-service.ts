import {
  OutsourcingPackage,
  CreateOutsourcingPackageInput,
  ApproveOutsourcingPackageInput,
  CapabilityGapItem,
  CandidateVendor,
  ReceivedQuote,
  QuoteEvaluation,
  EvaluateQuoteInput,
} from "@/types/outsourcing";
import { ProjectConceptStore } from "@/lib/concepts/concept-store";
import { vaultStore } from "@/lib/vault/vault-store";
import { DerivationStore } from "@/lib/derivation/derivation-store";

declare global {
  // eslint-disable-next-line no-var
  var __outsourcingStore: OutsourcingStore | undefined;
}

export class OutsourcingStore {
  private static instance: OutsourcingStore;
  private packages: Map<string, OutsourcingPackage> = new Map();

  private constructor() {
    this.restoreFromStorage();
    if (this.packages.size === 0) {
      this.seedInitialPackages();
    }
  }

  public static getInstance(): OutsourcingStore {
    if (typeof window !== "undefined") {
      if (!OutsourcingStore.instance) {
        OutsourcingStore.instance = new OutsourcingStore();
      }
      return OutsourcingStore.instance;
    }

    if (!global.__outsourcingStore) {
      global.__outsourcingStore = new OutsourcingStore();
    }
    return global.__outsourcingStore;
  }

  private seedInitialPackages(): void {
    const now = new Date().toISOString();
    const pkgId = "pkg-001-amr-chassis-cnc";

    const defaultVendors: CandidateVendor[] = [
      {
        id: crypto.randomUUID(),
        companyName: "정밀정공 주식회사",
        businessRegistrationNumber: "123-81-99881",
        specialization: "5축 복합 정밀 머시닝 및 항공/로봇 섀시 가공",
        representativeName: "박정밀",
        contactPerson: "최부장",
        contactPhone: "031-492-1234",
        contactEmail: "sales@precisioncnc.kr",
        location: "경기도 시흥시 스마트허브",
        trustScore: 94,
        ndaSigned: true,
        pastPerformanceCount: 12,
      },
      {
        id: crypto.randomUUID(),
        companyName: "한국기구솔루션",
        businessRegistrationNumber: "214-86-77221",
        specialization: "알루미늄 6061 정밀 판금/제작 및 표면 아노다이징",
        representativeName: "이기구",
        contactPerson: "김과장",
        contactPhone: "032-811-5678",
        contactEmail: "tech@koreamech.com",
        location: "인천 남동공단",
        trustScore: 88,
        ndaSigned: true,
        pastPerformanceCount: 7,
      },
    ];

    const defaultQuotes: ReceivedQuote[] = [
      {
        id: "quote-001",
        vendorId: defaultVendors[0].id,
        vendorName: defaultVendors[0].companyName,
        quoteAmount: 48_000_000,
        leadTimeWeeks: 4,
        submittedAt: now,
        notes: "AL6061-T6 아노다이징 포함, 3차원 측정 성적서 발급",
        complianceToSpec: true,
      },
      {
        id: "quote-002",
        vendorId: defaultVendors[1].id,
        vendorName: defaultVendors[1].companyName,
        quoteAmount: 43_000_000,
        leadTimeWeeks: 5,
        submittedAt: now,
        notes: "단가 우수하나 표면 조도 공차 협의 필요",
        complianceToSpec: true,
      },
    ];

    const defaultEvaluation: QuoteEvaluation = {
      id: crypto.randomUUID(),
      quoteId: defaultQuotes[0].id,
      vendorName: defaultQuotes[0].vendorName,
      techScore: 38,
      priceScore: 26,
      scheduleScore: 19,
      managementScore: 9,
      totalScore: 92,
      evaluationNotes: "가공 품질 및 4주 납기 준수 능력 우수. 정밀 조립 공차 완벽 부합.",
      evaluator: "로봇연구소 김수석",
      evaluatedAt: now,
    };

    const initialPackage: OutsourcingPackage = {
      id: pkgId,
      projectConceptId: "c001-amr-logistics-robot",
      developmentProjectId: null,
      taskCategory: "MECHANICAL_FABRICATION",
      taskTitle: "500kg급 AMR 알루미늄 메인 섀시 정밀 5축 가공 및 표면처리",
      description: "고중량 팔레트 이송 시 비틀림 강성을 만족하는 고정밀 프레임 외주 제작",
      sowContent: "1. AL6061-T6 재질 5축 CNC 정밀 가공\n2. 주요 체결부 치수 공차 ±0.02mm 이내 준수\n3. 하드 아노다이징 (블랙) 표면 피막 25um 이상\n4. 3차원 접촉식 좌표 측정기(CMM) 전수 검사 성적서 제출",
      acceptanceCriteria: "CMM 검사 성적서 공차 100% 만족 및 메인 구동 모터/감속기 조립 시 간섭 0건",
      deliverables: ["섀시 상/하판 가공 완제품 2세트", "공인 CMM 정밀 검사성적서", "원소재 밀시트(Mill Sheet)"],
      budgetCap: 50_000_000,
      isApproved: true,
      approvedBy: "김수석 PM",
      approvedAt: now,
      approvalNotes: "사내 원가 및 핵심 알고리즘 마스킹 완료 후 외주 견적 공시 승인",
      candidateVendors: defaultVendors,
      receivedQuotes: defaultQuotes,
      quoteEvaluations: [defaultEvaluation],
      status: "EVALUATION",
      createdAt: now,
      updatedAt: now,
    };

    this.packages.set(pkgId, initialPackage);
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const serialized = JSON.stringify(Array.from(this.packages.values()));
        window.localStorage.setItem("robobid_v3_outsourcing_packages", serialized);
      } catch (err) {
        console.error("Failed to save outsourcing packages", err);
      }
    }
  }

  private restoreFromStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = window.localStorage.getItem("robobid_v3_outsourcing_packages");
        if (raw) {
          const list: OutsourcingPackage[] = JSON.parse(raw);
          list.forEach((p) => this.packages.set(p.id, p));
        }
      } catch (err) {
        console.error("Failed to restore outsourcing packages", err);
      }
    }
  }

  public getAll(): OutsourcingPackage[] {
    return Array.from(this.packages.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): OutsourcingPackage | undefined {
    return this.packages.get(id);
  }

  public getByConceptId(conceptId: string): OutsourcingPackage[] {
    return Array.from(this.packages.values()).filter((p) => p.projectConceptId === conceptId);
  }

  public create(input: CreateOutsourcingPackageInput): OutsourcingPackage {
    const now = new Date().toISOString();
    const newPkg: OutsourcingPackage = {
      id: crypto.randomUUID(),
      projectConceptId: input.projectConceptId,
      developmentProjectId: input.developmentProjectId || null,
      taskCategory: input.taskCategory,
      taskTitle: input.taskTitle,
      description: input.description || "",
      sowContent: input.sowContent || "",
      acceptanceCriteria: input.acceptanceCriteria || "",
      deliverables: input.deliverables || [],
      budgetCap: input.budgetCap || 0,
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      approvalNotes: null,
      candidateVendors: [],
      receivedQuotes: [],
      quoteEvaluations: [],
      status: "SCOPE_DEFINED",
      createdAt: now,
      updatedAt: now,
    };
    return this.save(newPkg);
  }

  public update(id: string, updates: Partial<OutsourcingPackage>): OutsourcingPackage | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;
    const updated: OutsourcingPackage = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.save(updated);
  }

  public save(pkg: OutsourcingPackage): OutsourcingPackage {
    this.packages.set(pkg.id, pkg);
    this.saveToStorage();
    return pkg;
  }

  public delete(id: string): boolean {
    const deleted = this.packages.delete(id);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  public clear(): void {
    this.packages.clear();
    this.saveToStorage();
  }
}

export class OutsourcingService {
  /**
   * 사내 역량(Vault) 대비 프로젝트 요구사항 갭(Gap) 분석
   */
  public static analyzeCapabilityGaps(projectConceptId: string): CapabilityGapItem[] {
    const conceptStore = ProjectConceptStore.getInstance();
    const concept = conceptStore.getById(projectConceptId) || conceptStore.getAll()[0];
    const vaultAssets = vaultStore.getAll();

    const gaps: CapabilityGapItem[] = [];

    // 1. SW / SLAM 알고리즘 역량 검사
    const hasSwAsset = vaultAssets.some(
      (a) =>
        a.title.includes("자율주행") ||
        a.title.includes("SLAM") ||
        a.title.includes("특허") ||
        a.type === "PATENT"
    );
    gaps.push({
      id: crypto.randomUUID(),
      requiredDiscipline: "자율주행 SLAM 및 네비게이션 제어 SW",
      reasoning: hasSwAsset
        ? "사내 보유 특허 및 전담 SW 연구원 보유로 자체 수행 가능"
        : "사내 전문 인력 부재로 외부 용역 위탁 필요",
      isInternalAvailable: hasSwAsset,
      matchedVaultAssetId: hasSwAsset ? vaultAssets[0]?.id : null,
      recommendedAction: hasSwAsset ? "INTERNAL_ASSIGN" : "EXTERNAL_OUTSOURCE",
      estimatedBudget: 80_000_000,
    });

    // 2. 기구 5축 CNC 가공 역량 검사 (보통 로봇 팹리스 스타트업은 가공 설비 없음)
    const hasCncAsset = vaultAssets.some((a) => a.title.includes("공작기계") || a.title.includes("가공공장"));
    gaps.push({
      id: crypto.randomUUID(),
      requiredDiscipline: "알루미늄 섀시 정밀 5축 머시닝 가공",
      reasoning: hasCncAsset
        ? "사내 자체 가공 라인 보유"
        : "사내 공작 기계 부재 (팹리스 구조)로 전문 정밀가공업체 외주 발주 필수",
      isInternalAvailable: hasCncAsset,
      matchedVaultAssetId: null,
      recommendedAction: "EXTERNAL_OUTSOURCE",
      estimatedBudget: 50_000_000,
    });

    // 3. 전장 회로 및 PCB SMT 조립
    gaps.push({
      id: crypto.randomUUID(),
      requiredDiscipline: "전장 제어 보드 PCB 아트웍 및 하네스 배선",
      reasoning: "회로 설계는 자체 수행하나 양산용 PCB SMT 실장 및 와이어링 하네스는 외주 제작 권장",
      isInternalAvailable: false,
      matchedVaultAssetId: null,
      recommendedAction: "EXTERNAL_OUTSOURCE",
      estimatedBudget: 25_000_000,
    });

    // 4. KOLAS 공인 시험 인증
    gaps.push({
      id: crypto.randomUUID(),
      requiredDiscipline: "공인기관(KOLAS) 전자파 적합성(EMC) 및 성능 시험성적서",
      reasoning: "국가공인 시험기관(KTL, KIRIA, KTR 등) 인증 위탁 필수",
      isInternalAvailable: false,
      matchedVaultAssetId: null,
      recommendedAction: "EXTERNAL_OUTSOURCE",
      estimatedBudget: 15_000_000,
    });

    return gaps;
  }

  /**
   * Master Spec 및 Gap에서 외주 발주 패키지(Outsourcing Package) 자동 추출
   */
  public static extractOutsourceScopes(projectConceptId: string): OutsourcingPackage[] {
    const conceptStore = ProjectConceptStore.getInstance();
    const concept = conceptStore.getById(projectConceptId) || conceptStore.getAll()[0];
    const spec = concept ? conceptStore.getMasterSpec(concept.id) : undefined;
    const now = new Date().toISOString();

    const packages: OutsourcingPackage[] = [];

    // 1. 기구 정밀 가공 패키지
    packages.push({
      id: crypto.randomUUID(),
      projectConceptId,
      developmentProjectId: null,
      taskCategory: "MECHANICAL_FABRICATION",
      taskTitle: spec?.outsourcingPlan || "로봇 메인 프레임 정밀 CNC 가공 및 아노다이징",
      description: "비틀림 강성 및 경량화를 위한 알루미늄 가공 외주 발주",
      sowContent: `## 과업내역서 (SOW)\n1. 가공 대상: ${concept?.name || "로봇 시스템"} 기구 섀시\n2. 소재 규격: AL6061-T6\n3. 치수 공차: ±0.02mm 이내`,
      acceptanceCriteria: "3차원 정밀 측정 성적서 제출 및 조립 간섭 0건",
      deliverables: ["가공 완제품", "CMM 성적서", "밀시트"],
      budgetCap: spec?.budgetBreakdown?.outsourcingCost || 50_000_000,
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      approvalNotes: null,
      candidateVendors: [],
      receivedQuotes: [],
      quoteEvaluations: [],
      status: "SCOPE_DEFINED",
      createdAt: now,
      updatedAt: now,
    });

    // 2. 공인 시험인증 패키지
    packages.push({
      id: crypto.randomUUID(),
      projectConceptId,
      developmentProjectId: null,
      taskCategory: "TESTING_CERTIFICATION",
      taskTitle: "KOLAS 공인 성능 평가 및 전자파 적합성(EMC) 시험 대행",
      description: "정부 지원사업 최종 결과보고 제출용 국가공인시험성적서 획득",
      sowContent: `## 과업내역서 (SOW)\n1. 대상 규격: 위치 정지 정밀도 및 전자파 내성\n2. 주관: 공인시험기관`,
      acceptanceCriteria: "KOLAS 공인시험성적서 적합 판정",
      deliverables: ["KOLAS 공인시험성적서 원본"],
      budgetCap: 15_000_000,
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      approvalNotes: null,
      candidateVendors: [],
      receivedQuotes: [],
      quoteEvaluations: [],
      status: "SCOPE_DEFINED",
      createdAt: now,
      updatedAt: now,
    });

    return packages;
  }

  /**
   * 사용자 승인 게이트 (외주 발주 및 파트너 공개 전 필수 승인)
   */
  public static approvePackage(
    pkg: OutsourcingPackage,
    input: ApproveOutsourcingPackageInput
  ): OutsourcingPackage {
    if (!input.approvedBy || input.approvedBy.trim().length === 0) {
      throw new Error("승인자(검토자) 성명은 필수 입력 사항입니다.");
    }

    const now = new Date().toISOString();
    return {
      ...pkg,
      isApproved: true,
      approvedBy: input.approvedBy.trim(),
      approvedAt: now,
      approvalNotes: input.approvalNotes || "기밀 마스킹 및 외주 과업 범위 검토 후 승인 완료",
      status: "APPROVED",
      updatedAt: now,
    };
  }

  /**
   * 견적 평가 등록 (No Auto-Contracting: 인간 평가표 기록)
   */
  public static evaluateQuote(
    pkg: OutsourcingPackage,
    input: EvaluateQuoteInput
  ): OutsourcingPackage {
    const quote = pkg.receivedQuotes.find((q) => q.id === input.quoteId);
    if (!quote) {
      throw new Error("평가 대상 견적서를 찾을 수 없습니다.");
    }

    const totalScore = input.techScore + input.priceScore + input.scheduleScore + input.managementScore;
    const newEvaluation: QuoteEvaluation = {
      id: crypto.randomUUID(),
      quoteId: input.quoteId,
      vendorName: quote.vendorName,
      techScore: input.techScore,
      priceScore: input.priceScore,
      scheduleScore: input.scheduleScore,
      managementScore: input.managementScore,
      totalScore,
      evaluationNotes: input.evaluationNotes || "다면 역량 평가 완료",
      evaluator: input.evaluator,
      evaluatedAt: new Date().toISOString(),
    };

    return {
      ...pkg,
      quoteEvaluations: [...pkg.quoteEvaluations, newEvaluation],
      status: "EVALUATION",
      updatedAt: new Date().toISOString(),
    };
  }
}
