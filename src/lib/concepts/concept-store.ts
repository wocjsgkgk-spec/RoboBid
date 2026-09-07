/**
 * RoboBid AI v3.0 — In-Memory & LocalStorage Project Concept & Master Spec Store
 * 로봇 개발 프로젝트 아이디어, Master Spec 및 버전 이력 싱글톤 저장소
 */

import {
  ProjectConcept,
  CreateProjectConceptInput,
  MasterSpecification,
  MasterSpecVersionRecord,
  DEFAULT_ORGANIZATION_ID,
} from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var __projectConceptStore: ProjectConceptStore | undefined;
}

export class ProjectConceptStore {
  private static instance: ProjectConceptStore;
  private concepts: Map<string, ProjectConcept> = new Map();
  private specs: Map<string, MasterSpecification> = new Map();
  private versions: Map<string, MasterSpecVersionRecord[]> = new Map();
  private deletedIds: Set<string> = new Set();

  private constructor() {
    this.restoreFromStorage();
  }

  public seedInitialConcepts(): void {
    const now = new Date().toISOString();

    // 1. AMR 물류 로봇
    const amrId = "c001-amr-logistics-robot";
    const amrConcept: ProjectConcept = {
      id: amrId,
      organizationId: DEFAULT_ORGANIZATION_ID,
      name: "물류창고용 고중량 500kg 자율주행 협동 AMR 로봇",
      summary: "제조 및 풀필먼트 센터의 중량물 팔레트 이송을 완전 자동화하는 안전 듀얼 SLAM 기반 AMR 시스템",
      problemStatement: "풀필먼트 창고 내 인력 운반 시 근골격계 안전사고 다발 및 심야 시간대 운송 인력 구인난 극심",
      targetUser: "중대형 스마트 물류센터, 자동차/전자 1·2차 협력 제조공장",
      productConcept: "저상형 폼팩터 500kg 가반하중, 듀얼 3D LiDAR 기반 비정형 장애물 회피 AMR",
      technicalConcept: "ROS2 기반 실시간 궤계 제어, Multi-Sensor Fusion SLAM, Dynamic Costmap 회피 주행",
      targetTrl: 6,
      requiredTechnology: ["ROS2", "3D-LiDAR SLAM", "CAN-FD", "FMS 관제"],
      estimatedBudget: 800_000_000,
      requiredFunding: 600_000_000,
      marketAnalysis: "국내 물류 로봇 시장 연 28% 성장세. 2028년 시장규모 1.2조원 전망",
      salesModel: "초기 H/W 공급 + Fleet Manager 관제 소프트웨어 연간 라이선스 (RaaS)",
      owner: "로봇연구소 김수석",
      status: "SPECIFICATION",
      currentVersion: 1,
      linkedVaultAssetIds: [],
      createdAt: now,
      updatedAt: now,
    };

    const amrSpec: MasterSpecification = {
      id: crypto.randomUUID(),
      projectConceptId: amrId,
      version: "v1.0",
      architectureSummary: "ROS2 Humble 기반 분산 노드 아키텍처 및 안전 PLC 통합 제어",
      technicalArchitecture: "[AMR v1.0 Architecture]\n- OS: Ubuntu 22.04 LTS (Realtime Kernel) + ROS2\n- Hardware: BLDC 서보 모터(750W x 2), 48V 60Ah LiFePO4 Battery, Safety PLC\n- Sensors: 2x SICK 2D Safety LiDAR, 1x Ouster 32ch 3D LiDAR, RealSense RGB-D, 9-DOF IMU\n- Network: Wi-Fi 6 Dual Band + 5G Private Module",
      hwSwSpecifications: {
        payloadKg: 500,
        maxSpeedMs: 1.8,
        runTimeHours: 8,
        safetyRating: "ISO 3691-4 PL-d",
      },
      sensorsAndComms: ["SICK Safety LiDAR 2채널", "Ouster 32ch 3D LiDAR", "Intel RealSense D435i", "Wi-Fi 6 / 5G"],
      aiModelSpec: "YOLOv8 기반 파렛트 적재물 및 작업자 정밀 세그멘테이션 (<18ms)",
      targetEnvironment: "에폭시/우레탄 바닥 평탄도 ±5mm, 0~45℃, 실내 100~800 Lux",
      kpis: [
        { metricName: "위치 정지 정밀도", targetValue: "±10mm 이하", evaluationMethod: "KOLAS 공인시험성적서" },
        { metricName: "최대 주행 속도", targetValue: "1.8 m/s", evaluationMethod: "시험장 실측" },
        { metricName: "연속 작업 시간", targetValue: "8시간 이상", evaluationMethod: "공인기관 연속 부하시험" },
      ],
      wbsSummary: [
        "WBS 1: 시스템 요구사항 및 기구 섀시 설계 (M1~M3)",
        "WBS 2: 듀얼 드라이브 전장 제어기 및 세이프티 회로 제작 (M4~M6)",
        "WBS 3: ROS2 기반 SLAM/Nav2 패키지 포팅 및 실내 맵핑 (M7~M9)",
        "WBS 4: 물류창고 필드 실증 및 KOLAS 공인인증 취득 (M10~M12)",
      ],
      bomEstimate: [
        { partName: "750W BLDC 서보모터 드라이버 세트", unitCost: 1_800_000, quantity: 2, vendor: "국내 정밀모터" },
        { partName: "Ouster OS1-32 3D LiDAR", unitCost: 4_500_000, quantity: 1, vendor: "Ouster" },
        { partName: "Nvidia Jetson AGX Orin 64GB", unitCost: 2_800_000, quantity: 1, vendor: "Nvidia" },
        { partName: "48V 60Ah LiFePO4 배터리팩+BMS", unitCost: 2_200_000, quantity: 1, vendor: "배터리솔루션" },
        { partName: "정밀 절삭 알루미늄 메인 프레임", unitCost: 3_500_000, quantity: 1, vendor: "기구공작소" },
      ],
      budgetBreakdown: {
        directCost: 280_000_000,
        laborCost: 320_000_000,
        outsourcingCost: 120_000_000,
        indirectCost: 80_000_000,
      },
      rolesAndResponsibilities: [
        { role: "시스템 총괄 PM", responsibility: "사업 및 WBS 마일스톤 관리", headCount: 1 },
        { role: "자율주행 SW 연구원", responsibility: "SLAM, 경로계획 알고리즘 개발", headCount: 2 },
        { role: "로봇 기구/전장 엔지니어", responsibility: "프레임 설계 및 모터 드라이버 인터페이스", headCount: 2 },
      ],
      validationPlan: "KIRIA(한국로봇산업진흥원) 표준 성능시험 및 C사 스마트 물류센터 2개월 현장 실증",
      outsourcingPlan: "알루미늄 섀시 가공 및 전장 하네스 배선 외주 제작 (비밀유지계약 NDA 체결)",
      businessModel: "로봇 단품 납품 4,500만원 + FMS 관제 월 구독 35만원/대",
      salesStrategy: "정부 스마트공장 보급사업 수혜기업 대상 매칭 영업",
      securityClassification: "INTERNAL",
      createdAt: now,
      updatedAt: now,
    };

    const amrVersion: MasterSpecVersionRecord = {
      id: crypto.randomUUID(),
      projectConceptId: amrId,
      version: "v1.0",
      changeSummary: "초기 Master Specification 베이스라인 등록",
      spec: amrSpec,
      approvedBy: "김수석 PM",
      approvedAt: now,
      createdAt: now,
    };

    // 2. 비전 가이드 협동로봇
    const cobotId = "c002-vision-guided-cobot";
    const cobotConcept: ProjectConcept = {
      id: cobotId,
      organizationId: DEFAULT_ORGANIZATION_ID,
      name: "AI 3D 비전 기반 전자부품 정밀 조립 협동로봇 셀",
      summary: "0.05mm 미세 공차 정밀 비전과 촉각 센싱을 융합하여 다품종 소량 전자부품 체결 공정을 무인화하는 로봇 셀",
      problemStatement: "스마트폰/가전 부품 커넥터 결합 공정의 수작업 의존도가 높아 불량률 3.2% 발생 및 인건비 상승",
      targetUser: "전자/IT 기기 완성품 및 서브모듈 제조사",
      productConcept: "6자유도 협동로봇 암 + 손목 부착형 3D 카메라 + 6축 힘토크(F/T) 센서 패키지",
      technicalConcept: "Point Cloud 기반 6D Pose Estimation 및 컴플라이언스 힘제어 나사 체결",
      targetTrl: 5,
      requiredTechnology: ["6D Pose Estimation", "Force/Torque Control", "CoBot Safety"],
      estimatedBudget: 450_000_000,
      requiredFunding: 350_000_000,
      marketAnalysis: "정밀 조립용 협동로봇 시장 연 34% 폭발적 성장세",
      salesModel: "턴키 조립 셀 납품 + 공정 최적화 기술지원 컨설팅",
      owner: "공정자동화팀 이책임",
      status: "CONCEPT",
      currentVersion: 1,
      linkedVaultAssetIds: [],
      createdAt: now,
      updatedAt: now,
    };

    const cobotSpec: MasterSpecification = {
      id: crypto.randomUUID(),
      projectConceptId: cobotId,
      version: "v1.0",
      architectureSummary: "실시간 힘제어 루프 (1kHz)와 3D 비전 추론 (30fps) 분리 멀티스레드 구조",
      technicalArchitecture: "[CoBot Cell v1.0 Architecture]\n- Arm: 6-Axis Cobot Arm (Payload 5kg, Repeatability ±0.02mm)\n- End-Effector: 2-Finger Servo Gripper + 6-Axis F/T Sensor\n- Vision: Photoneo PhoXi 3D Scanner M\n- AI: PointNet++ 기반 미세 부품 파지점 예측",
      hwSwSpecifications: {
        payloadKg: 5,
        repeatabilityMm: 0.02,
        cycleTimeSec: 4.5,
      },
      sensorsAndComms: ["Photoneo 3D Scanner", "ATI 6-Axis F/T Sensor", "GigE Vision", "EtherCAT 1kHz"],
      aiModelSpec: "부품 표면 스캔 3D 포인트클라우드 정합 및 0.05mm 보정 알고리즘",
      targetEnvironment: "클린룸 Class 10,000 수준의 전자제품 조립 라인",
      kpis: [
        { metricName: "나사 체결 정밀도", targetValue: "±0.05mm", evaluationMethod: "레이저 변위계 공인시험" },
        { metricName: "조립 불량률", targetValue: "0.2% 이하", evaluationMethod: "1,000회 연속 조립 테스트" },
      ],
      wbsSummary: [
        "WBS 1: 3D 비전 계측 및 핸드-아이 캘리브레이션 모듈 구현 (M1~M3)",
        "WBS 2: 6축 힘제어 어셈블리 궤적 제어기 개발 (M4~M6)",
        "WBS 3: 실제 부품 조립 라인 연동 및 신뢰성 평가 (M7~M9)",
      ],
      bomEstimate: [
        { partName: "6자유도 협동로봇 매니퓰레이터", unitCost: 22_000_000, quantity: 1, vendor: "두산로보틱스/레인보우" },
        { partName: "정밀 3D 스캐너 PhoXi M", unitCost: 15_000_000, quantity: 1, vendor: "Photoneo" },
        { partName: "6축 힘/토크 센서", unitCost: 6_000_000, quantity: 1, vendor: "ATI Industrial" },
      ],
      budgetBreakdown: {
        directCost: 180_000_000,
        laborCost: 190_000_000,
        outsourcingCost: 50_000_000,
        indirectCost: 30_000_000,
      },
      rolesAndResponsibilities: [
        { role: "비전 AI 엔지니어", responsibility: "3D 포인트클라우드 정합 및 AI 학습", headCount: 1 },
        { role: "로봇 모션 제어 엔지니어", responsibility: "힘제어 알고리즘 및 EtherCAT 통신", headCount: 1 },
      ],
      validationPlan: "전자부품 제조사 테스트베드 라인 내 2주 연속 가동 실증",
      outsourcingPlan: "로봇 마운트 지그 및 커스텀 그리퍼 핑거 CNC 정밀 가공",
      businessModel: "셀 턴키 납품 6,500만원 + 연간 유지보수 계약 (10%)",
      salesStrategy: "부품 협력업체 대상 공정 무인화 바우처 연계 제안",
      securityClassification: "INTERNAL",
      createdAt: now,
      updatedAt: now,
    };

    const cobotVersion: MasterSpecVersionRecord = {
      id: crypto.randomUUID(),
      projectConceptId: cobotId,
      version: "v1.0",
      changeSummary: "초기 비전 협동로봇 사양 등록",
      spec: cobotSpec,
      approvedBy: "이책임",
      approvedAt: now,
      createdAt: now,
    };

    this.concepts.set(amrId, amrConcept);
    this.specs.set(amrId, amrSpec);
    this.versions.set(amrId, [amrVersion]);

    this.concepts.set(cobotId, cobotConcept);
    this.specs.set(cobotId, cobotSpec);
    this.versions.set(cobotId, [cobotVersion]);

    this.persistToStorage();
  }

  private restoreFromStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const deletedRaw = localStorage.getItem("robobid_deleted_concept_ids");
        if (deletedRaw) {
          const arr = JSON.parse(deletedRaw);
          if (Array.isArray(arr)) {
            arr.forEach((id: string) => this.deletedIds.add(id));
          }
        }
        const cachedConcepts = localStorage.getItem("robobid_project_concepts");
        if (cachedConcepts) {
          const list: ProjectConcept[] = JSON.parse(cachedConcepts);
          if (Array.isArray(list)) {
            for (const item of list) {
              if (!this.deletedIds.has(item.id)) {
                this.concepts.set(item.id, item);
              }
            }
          }
        }
        const cachedSpecs = localStorage.getItem("robobid_master_specs");
        if (cachedSpecs) {
          const list: MasterSpecification[] = JSON.parse(cachedSpecs);
          if (Array.isArray(list)) {
            for (const s of list) {
              if (!this.deletedIds.has(s.projectConceptId)) {
                this.specs.set(s.projectConceptId, s);
              }
            }
          }
        }
        const cachedVersions = localStorage.getItem("robobid_spec_versions");
        if (cachedVersions) {
          const mapData: Record<string, MasterSpecVersionRecord[]> = JSON.parse(cachedVersions);
          for (const [k, v] of Object.entries(mapData)) {
            if (!this.deletedIds.has(k)) {
              this.versions.set(k, v);
            }
          }
        }
      } catch (e) {
        console.error("Failed to restore project concepts from localStorage:", e);
      }
    }
  }

  private persistToStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(
          "robobid_project_concepts",
          JSON.stringify(Array.from(this.concepts.values()))
        );
        localStorage.setItem(
          "robobid_master_specs",
          JSON.stringify(Array.from(this.specs.values()))
        );
        const versionsObj: Record<string, MasterSpecVersionRecord[]> = {};
        for (const [k, v] of this.versions.entries()) {
          versionsObj[k] = v;
        }
        localStorage.setItem("robobid_spec_versions", JSON.stringify(versionsObj));
        localStorage.setItem(
          "robobid_deleted_concept_ids",
          JSON.stringify(Array.from(this.deletedIds))
        );
      } catch (e) {
        console.error("Failed to persist project concepts to localStorage:", e);
      }
    }
  }

  public static getInstance(): ProjectConceptStore {
    if (typeof globalThis !== "undefined") {
      if (!globalThis.__projectConceptStore) {
        globalThis.__projectConceptStore = new ProjectConceptStore();
      }
      return globalThis.__projectConceptStore;
    }
    if (!ProjectConceptStore.instance) {
      ProjectConceptStore.instance = new ProjectConceptStore();
    }
    return ProjectConceptStore.instance;
  }

  public clearAll(): void {
    for (const id of this.concepts.keys()) {
      this.deletedIds.add(id);
    }
    this.concepts.clear();
    this.specs.clear();
    this.versions.clear();
    this.persistToStorage();
  }

  public getAll(): ProjectConcept[] {
    return Array.from(this.concepts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): ProjectConcept | undefined {
    return this.concepts.get(id);
  }

  /**
   * 1줄 아이디어 즉시 빠른 등록 (Quick Idea Registration)
   */
  public createQuickIdea(name: string, summary?: string): ProjectConcept {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newConcept: ProjectConcept = {
      id,
      organizationId: DEFAULT_ORGANIZATION_ID,
      name: name.trim(),
      summary: summary?.trim() || `${name.trim()} 아이디어 초기 등록`,
      problemStatement: null,
      targetUser: null,
      productConcept: null,
      technicalConcept: null,
      targetTrl: 3,
      requiredTechnology: ["AI", "센서 퓨전", "임베디드 제어"],
      estimatedBudget: 300_000_000,
      requiredFunding: 225_000_000,
      marketAnalysis: null,
      salesModel: null,
      owner: "사업개발 PM",
      status: "IDEA",
      currentVersion: 1,
      linkedVaultAssetIds: [],
      createdAt: now,
      updatedAt: now,
    };

    const initialSpec: MasterSpecification = {
      id: crypto.randomUUID(),
      projectConceptId: id,
      version: "v1.0",
      architectureSummary: `${name.trim()} 초기 아키텍처 구상안`,
      technicalArchitecture: "",
      hwSwSpecifications: {},
      sensorsAndComms: [],
      aiModelSpec: "",
      targetEnvironment: "실내외 작업환경",
      kpis: [],
      wbsSummary: [],
      bomEstimate: [],
      budgetBreakdown: { directCost: 0, laborCost: 0, outsourcingCost: 0, indirectCost: 0 },
      rolesAndResponsibilities: [],
      validationPlan: "",
      outsourcingPlan: "",
      businessModel: "",
      salesStrategy: "",
      securityClassification: "INTERNAL",
      createdAt: now,
      updatedAt: now,
    };

    const initialVersion: MasterSpecVersionRecord = {
      id: crypto.randomUUID(),
      projectConceptId: id,
      version: "v1.0",
      changeSummary: "한 줄 아이디어 최초 등록",
      spec: initialSpec,
      approvedBy: "사업개발 PM",
      approvedAt: now,
      createdAt: now,
    };

    this.concepts.set(id, newConcept);
    this.specs.set(id, initialSpec);
    this.versions.set(id, [initialVersion]);
    this.persistToStorage();

    return newConcept;
  }

  public create(input: CreateProjectConceptInput): ProjectConcept {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newConcept: ProjectConcept = {
      id,
      organizationId: DEFAULT_ORGANIZATION_ID,
      name: input.name.trim(),
      summary: input.summary || "",
      problemStatement: input.problemStatement || null,
      productConcept: input.productConcept || null,
      technicalConcept: input.technicalConcept || null,
      targetTrl: input.targetTrl ?? 4,
      requiredTechnology: input.requiredTechnology || ["ROS2", "SLAM", "모터제어"],
      estimatedBudget: input.estimatedBudget || 500_000_000,
      requiredFunding: input.requiredFunding || Math.round((input.estimatedBudget || 500_000_000) * 0.75),
      marketAnalysis: null,
      salesModel: null,
      owner: "사업개발 PM",
      status: "IDEA",
      currentVersion: 1,
      linkedVaultAssetIds: input.linkedVaultAssetIds || [],
      createdAt: now,
      updatedAt: now,
    };

    const initialSpec: MasterSpecification = {
      id: crypto.randomUUID(),
      projectConceptId: id,
      version: "v1.0",
      architectureSummary: `${input.name} 기본 스펙`,
      technicalArchitecture: "",
      hwSwSpecifications: {},
      sensorsAndComms: [],
      aiModelSpec: "",
      targetEnvironment: "실내외 작업환경",
      kpis: [],
      wbsSummary: [],
      bomEstimate: [],
      budgetBreakdown: { directCost: 0, laborCost: 0, outsourcingCost: 0, indirectCost: 0 },
      rolesAndResponsibilities: [],
      validationPlan: "",
      outsourcingPlan: "",
      businessModel: "",
      salesStrategy: "",
      securityClassification: "INTERNAL",
      createdAt: now,
      updatedAt: now,
    };

    const initialVersion: MasterSpecVersionRecord = {
      id: crypto.randomUUID(),
      projectConceptId: id,
      version: "v1.0",
      changeSummary: "프로젝트 등록",
      spec: initialSpec,
      approvedBy: "사업개발 PM",
      approvedAt: now,
      createdAt: now,
    };

    this.concepts.set(id, newConcept);
    this.specs.set(id, initialSpec);
    this.versions.set(id, [initialVersion]);
    this.persistToStorage();
    return newConcept;
  }

  public update(id: string, updates: Partial<ProjectConcept>): ProjectConcept {
    const existing = this.concepts.get(id);
    if (!existing) {
      throw new Error(`ProjectConcept not found: ${id}`);
    }

    const updated: ProjectConcept = {
      ...existing,
      ...updates,
      currentVersion: (existing.currentVersion || 1) + 1,
      updatedAt: new Date().toISOString(),
    };

    this.concepts.set(id, updated);
    this.persistToStorage();
    return updated;
  }

  public delete(id: string): boolean {
    this.deletedIds.add(id);
    const deleted = this.concepts.delete(id);
    this.specs.delete(id);
    this.versions.delete(id);
    this.persistToStorage();
    return deleted;
  }

  // Master Spec Accessors
  public getMasterSpec(conceptId: string): MasterSpecification | undefined {
    return this.specs.get(conceptId);
  }

  public getSpecVersions(conceptId: string): MasterSpecVersionRecord[] {
    const records = this.versions.get(conceptId) || [];
    return [...records].reverse();
  }

  /**
   * 사용자 승인(Human Approval) 후 Master Specification 저장 및 신규 버전 기록
   */
  public saveMasterSpec(
    conceptId: string,
    updates: Partial<MasterSpecification>,
    changeSummary: string,
    approvedBy = "사업개발 PM"
  ): { spec: MasterSpecification; version: MasterSpecVersionRecord } {
    const concept = this.concepts.get(conceptId);
    if (!concept) {
      throw new Error(`ProjectConcept not found: ${conceptId}`);
    }

    const existingSpec = this.specs.get(conceptId);
    const existingVersions = this.versions.get(conceptId) || [];
    const nextVerNumber = (existingVersions.length + 1).toFixed(1);
    const newVersionTag = `v${nextVerNumber}`;
    const now = new Date().toISOString();

    const updatedSpec: MasterSpecification = {
      id: existingSpec ? existingSpec.id : crypto.randomUUID(),
      projectConceptId: conceptId,
      version: newVersionTag,
      architectureSummary: updates.architectureSummary ?? existingSpec?.architectureSummary ?? "",
      technicalArchitecture: updates.technicalArchitecture ?? existingSpec?.technicalArchitecture ?? "",
      hwSwSpecifications: updates.hwSwSpecifications ?? existingSpec?.hwSwSpecifications ?? {},
      sensorsAndComms: updates.sensorsAndComms ?? existingSpec?.sensorsAndComms ?? [],
      aiModelSpec: updates.aiModelSpec ?? existingSpec?.aiModelSpec ?? "",
      targetEnvironment: updates.targetEnvironment ?? existingSpec?.targetEnvironment ?? "실내외 작업환경",
      kpis: updates.kpis ?? existingSpec?.kpis ?? [],
      wbsSummary: updates.wbsSummary ?? existingSpec?.wbsSummary ?? [],
      bomEstimate: updates.bomEstimate ?? existingSpec?.bomEstimate ?? [],
      budgetBreakdown: updates.budgetBreakdown ?? existingSpec?.budgetBreakdown ?? { directCost: 0, laborCost: 0, outsourcingCost: 0, indirectCost: 0 },
      rolesAndResponsibilities: updates.rolesAndResponsibilities ?? existingSpec?.rolesAndResponsibilities ?? [],
      validationPlan: updates.validationPlan ?? existingSpec?.validationPlan ?? "",
      outsourcingPlan: updates.outsourcingPlan ?? existingSpec?.outsourcingPlan ?? "",
      businessModel: updates.businessModel ?? existingSpec?.businessModel ?? "",
      salesStrategy: updates.salesStrategy ?? existingSpec?.salesStrategy ?? "",
      securityClassification: updates.securityClassification ?? existingSpec?.securityClassification ?? "INTERNAL",
      createdAt: existingSpec?.createdAt || now,
      updatedAt: now,
    };

    const versionRecord: MasterSpecVersionRecord = {
      id: crypto.randomUUID(),
      projectConceptId: conceptId,
      version: newVersionTag,
      changeSummary,
      spec: updatedSpec,
      approvedBy,
      approvedAt: now,
      createdAt: now,
    };

    this.specs.set(conceptId, updatedSpec);
    this.versions.set(conceptId, [...existingVersions, versionRecord]);

    // Concept 버전 및 시간 갱신
    this.update(conceptId, { currentVersion: existingVersions.length + 1 });
    this.persistToStorage();

    return { spec: updatedSpec, version: versionRecord };
  }

  /**
   * 특정 과거 버전으로 Master Spec 복원 (Version Restore)
   */
  public restoreSpecVersion(
    conceptId: string,
    versionId: string,
    approvedBy = "사업개발 PM"
  ): MasterSpecification {
    const versions = this.versions.get(conceptId) || [];
    const target = versions.find((v) => v.id === versionId || v.version === versionId);
    if (!target) {
      throw new Error(`Version record not found: ${versionId}`);
    }

    const { spec } = this.saveMasterSpec(
      conceptId,
      { ...target.spec },
      `버전 [${target.version}] 내용으로 롤백 복원`,
      approvedBy
    );

    return spec;
  }

  /**
   * AI Suggestion Diff 승인 및 반영
   */
  public applyApprovedDiff(
    conceptId: string,
    approvedFields: Record<string, any>,
    changeSummary: string,
    approvedBy = "사용자 승인"
  ): { concept: ProjectConcept; spec: MasterSpecification; version: MasterSpecVersionRecord } {
    const concept = this.concepts.get(conceptId);
    if (!concept) {
      throw new Error(`ProjectConcept not found: ${conceptId}`);
    }

    // 1. Concept 필드 분리
    const conceptUpdates: Partial<ProjectConcept> = {};
    const specUpdates: Partial<MasterSpecification> = {};

    const conceptKeys = [
      "name",
      "summary",
      "problemStatement",
      "targetUser",
      "productConcept",
      "technicalConcept",
      "targetTrl",
      "requiredTechnology",
      "estimatedBudget",
      "requiredFunding",
      "marketAnalysis",
      "salesModel",
      "status",
    ];

    for (const [key, value] of Object.entries(approvedFields)) {
      if (conceptKeys.includes(key)) {
        (conceptUpdates as any)[key] = value;
      } else {
        (specUpdates as any)[key] = value;
      }
    }

    // 상태 자동 진전: IDEA -> CONCEPT -> SPECIFICATION -> FUNDING_READY
    if (conceptUpdates.productConcept && concept.status === "IDEA") {
      conceptUpdates.status = "CONCEPT";
    }
    if (conceptUpdates.technicalConcept && (concept.status === "IDEA" || concept.status === "CONCEPT")) {
      conceptUpdates.status = "SPECIFICATION";
    }
    if (conceptUpdates.targetTrl && Number(conceptUpdates.targetTrl) >= 6) {
      conceptUpdates.status = "FUNDING_READY";
    }

    const updatedConcept = this.update(conceptId, conceptUpdates);
    const { spec, version } = this.saveMasterSpec(conceptId, specUpdates, changeSummary, approvedBy);

    return { concept: updatedConcept, spec, version };
  }

  /**
   * Company Vault 사내 자산/역량 연계 (Linked Capabilities)
   */
  public linkVaultAssets(conceptId: string, assetIds: string[]): ProjectConcept {
    const concept = this.concepts.get(conceptId);
    if (!concept) {
      throw new Error(`ProjectConcept not found: ${conceptId}`);
    }

    const updated = this.update(conceptId, {
      linkedVaultAssetIds: Array.from(new Set([...(concept.linkedVaultAssetIds || []), ...assetIds])),
    });
    return updated;
  }

  public count(): number {
    return this.concepts.size;
  }
}

export const projectConceptStore = ProjectConceptStore.getInstance();
export const conceptStore = projectConceptStore;
