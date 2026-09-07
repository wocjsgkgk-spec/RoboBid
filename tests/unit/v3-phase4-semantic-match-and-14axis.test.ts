import { describe, it, expect } from "vitest";
import { SemanticMatcherService } from "@/lib/matching/semantic-matcher-service";
import { ProjectConcept, MasterSpecification, Opportunity, Capability } from "@/types";

describe("RoboBid AI v3.0 — Phase 4 Semantic Project Match & 14-Axis Evaluation", () => {
  const sampleConcept: ProjectConcept = {
    id: "concept-amr-001",
    organizationId: "00000000-0000-0000-0000-000000000001",
    name: "물류창고용 고중량 500kg 자율주행 협동 AMR 로봇",
    summary: "듀얼 SLAM 기반 안전 물류 이송 로봇",
    problemStatement: "풀필먼트 창고 내 고중량 이송 작업자 안전사고 예방",
    targetUser: "스마트 풀필먼트 물류센터",
    productConcept: "저상형 500kg 자율주행 AMR",
    technicalConcept: "ROS2 기반 실시간 궤적 제어 및 3D LiDAR SLAM",
    targetTrl: 6,
    requiredTechnology: ["ROS2", "3D-LiDAR SLAM", "CAN-FD"],
    estimatedBudget: 600_000_000,
    requiredFunding: 450_000_000,
    marketAnalysis: "국내 물류 로봇 시장 연 28% 성장",
    salesModel: "H/W 납품 및 RaaS 관제 소프트웨어 구독",
    owner: "로봇연구소",
    status: "SPECIFICATION",
    currentVersion: 1,
    linkedVaultAssetIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleSpec: MasterSpecification = {
    id: "spec-amr-001",
    projectConceptId: "concept-amr-001",
    version: "v1.0",
    architectureSummary: "ROS2 기반 안전 분산 노드 아키텍처",
    technicalArchitecture: "ROS2 Humble + 3D LiDAR + BLDC Motor Actuators",
    hwSwSpecifications: { payloadKg: 500 },
    sensorsAndComms: ["Ouster 32ch 3D LiDAR", "SICK Safety 2D", "Wi-Fi 6"],
    aiModelSpec: "YOLOv8 기반 파렛트 세그멘테이션",
    targetEnvironment: "실내 에폭시 공장 바닥",
    kpis: [
      { metricName: "정지정밀도", targetValue: "±10mm", evaluationMethod: "KOLAS 공인시험성적서" },
    ],
    wbsSummary: ["WBS 1: 기구설계", "WBS 2: 전장제어", "WBS 3: SLAM 통합", "WBS 4: 필드 실증"],
    bomEstimate: [
      { partName: "3D LiDAR 센서", unitCost: 4500000, quantity: 1, vendor: "Ouster" },
      { partName: "BLDC 서보모터 드라이버", unitCost: 1800000, quantity: 2 },
    ],
    budgetBreakdown: { directCost: 200000000, laborCost: 250000000, outsourcingCost: 100000000, indirectCost: 50000000 },
    rolesAndResponsibilities: [{ role: "자율주행 SW", responsibility: "SLAM 구현", headCount: 3 }],
    validationPlan: "KIRIA 공인시험 및 C사 물류창고 2개월 현장 실증",
    outsourcingPlan: "알루미늄 섀시 가공 외주",
    businessModel: "H/W 납품 + FMS 월 구독",
    salesStrategy: "스마트공장 보급사업 연계",
    securityClassification: "INTERNAL",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleOpportunity: Opportunity = {
    id: "opp-robot-rnd-001",
    organizationId: "00000000-0000-0000-0000-000000000001",
    providerId: "bizinfo",
    sourceId: "BIZINFO-2026-RND",
    title: "2026년도 지능형 물류로봇 상용화 R&D 기술개발 지원사업 공고",
    announcingAgency: "한국산업기술기획평가원",
    bidType: "R_AND_D",
    primaryDomain: "ROBOT",
    allocatedBudget: 400_000_000,
    postedAt: "2026-09-01T00:00:00Z",
    submissionDeadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: "INBOX",
    fundingType: "GOV_RND",
    contentHash: "hash-rnd-1",
    currentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleCapabilities: Capability[] = [
    {
      id: "cap-tech-01",
      organizationId: "00000000-0000-0000-0000-000000000001",
      title: "ROS2 3D-LiDAR SLAM 자율주행 원천기술",
      type: "TECHNOLOGY",
      description: "고정밀 실내외 SLAM 맵핑",
      verificationStatus: "VERIFIED",
      confidentiality: "INTERNAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cap-patent-01",
      organizationId: "00000000-0000-0000-0000-000000000001",
      title: "자율주행 이동로봇의 동적 장애물 회피 시스템 특허",
      type: "PATENT",
      description: "등록 특허",
      verificationStatus: "VERIFIED",
      confidentiality: "INTERNAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cap-cert-01",
      organizationId: "00000000-0000-0000-0000-000000000001",
      title: "벤처기업 확인서 (혁신성장유형)",
      type: "CERTIFICATION",
      description: "벤처기업 인증",
      verificationStatus: "VERIFIED",
      confidentiality: "INTERNAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 1. 14축 다각도 평가 프로파일 및 설명 가능성 검증
  it("SemanticMatcherService가 14개 전 축의 정밀 프로파일과 근거를 산출한다", () => {
    const result = SemanticMatcherService.evaluate(
      sampleConcept,
      sampleSpec,
      sampleOpportunity,
      sampleCapabilities
    );

    expect(result.matchScore).toBeGreaterThan(60);
    expect(result.matchScore).toBeLessThanOrEqual(100);
    expect(result.reason.length).toBeGreaterThan(10);

    const profile = result.profile14Axis;
    expect(profile.axes.length).toBe(14);

    // 14개 축 전수 점검
    const expectedAxes = [
      "신청자격 충족",
      "개발아이템 적합성",
      "지원금 규모",
      "자부담 규모",
      "개발비 Coverage",
      "TRL 적합성",
      "개발기간 적합성",
      "인력/외주 확보 가능성",
      "가점 확보 가능성",
      "선정 난이도 (경쟁률)",
      "신청 준비도",
      "실증처/협력기관 필요성",
      "사업화/판매 연계성",
      "후속 정부사업 연결성",
    ];

    profile.axes.forEach((axis, idx) => {
      expect(axis.axisNumber).toBe(idx + 1);
      expect(axis.axisName).toBe(expectedAxes[idx]);
      expect(axis.score).toBeGreaterThanOrEqual(0);
      expect(axis.score).toBeLessThanOrEqual(axis.maxScore);
      expect(axis.rationale.length).toBeGreaterThan(5);
      expect(axis.evidence.length).toBeGreaterThan(3);
    });
  });

  // 2. Deterministic 룰 영역과 AI Semantic 추론 영역의 엄격한 분리 검증
  it("정량 산출 축과 정성 추론 축이 명확히 구분되어 일관성을 보장한다", () => {
    const result = SemanticMatcherService.evaluate(
      sampleConcept,
      sampleSpec,
      sampleOpportunity,
      sampleCapabilities
    );

    const deterministicAxes = [1, 3, 4, 5, 6, 7, 9, 11];
    const semanticAxes = [2, 8, 10, 12, 13, 14];

    result.profile14Axis.axes.forEach((axis) => {
      if (deterministicAxes.includes(axis.axisNumber)) {
        expect(axis.isDeterministic).toBe(true);
      } else if (semanticAxes.includes(axis.axisNumber)) {
        expect(axis.isDeterministic).toBe(false);
      }
    });
  });

  // 3. 근거 없는 추천 방지 및 로봇 구체적 활용처(컴포넌트/비목) 매핑 검증
  it("지원금을 우리 로봇의 어디에 활용할 수 있는지 구체적 컴포넌트와 비목을 반환한다", () => {
    const result = SemanticMatcherService.evaluate(
      sampleConcept,
      sampleSpec,
      sampleOpportunity,
      sampleCapabilities
    );

    // 로봇 컴포넌트 매핑 검증
    expect(result.matchedProjectComponents.length).toBeGreaterThanOrEqual(3);
    expect(result.matchedProjectComponents.some((c) => c.includes("LiDAR") || c.includes("센서"))).toBe(true);

    // 허용 비목 매핑 검증
    expect(result.usableFundingAreas.length).toBeGreaterThanOrEqual(3);
    expect(result.usableFundingAreas.some((a) => a.includes("인건비"))).toBe(true);
    expect(result.usableFundingAreas.some((a) => a.includes("재료비") || a.includes("부품"))).toBe(true);

    // 근거 및 불확실성 경고 존재 검증
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.uncertainty.length).toBeGreaterThan(0);
  });

  // 4. 필수 신청시점 자격 거버넌스: 계획(PLANNED)만으로 PASS 불가 검증
  it("실증 과제에서 필수 수요처 파트너가 없으면(PARTNER_REQUIRED) 필수자격 미달로 판정한다", () => {
    const validationOpp: Opportunity = {
      ...sampleOpportunity,
      fundingType: "VALIDATION_GRANT",
      title: "2026 로봇 실증 및 테스트베드 보급 지원사업",
    };

    // 수요처 파트너가 없는 capabilities 전달
    const resultWithoutPartner = SemanticMatcherService.evaluate(
      sampleConcept,
      sampleSpec,
      validationOpp,
      sampleCapabilities
    );

    // 필수 요건 중 PARTNER_REQUIRED 가 존재하므로 passMandatoryEligibility는 false여야 함
    expect(resultWithoutPartner.profile14Axis.passMandatoryEligibility).toBe(false);
    expect(resultWithoutPartner.profile14Axis.axes[0].score).toBeLessThan(5); // 축 1 감점

    // 수요기업 협력 MOU 추가
    const capabilitiesWithPartner: Capability[] = [
      ...sampleCapabilities,
      {
        id: "cap-partner-01",
        organizationId: "00000000-0000-0000-0000-000000000001",
        title: "C물류 대기업 실증 수요처 협력 MOU 체결",
        type: "PARTNER",
        description: "현장 테스트베드 제공",
        verificationStatus: "VERIFIED",
        confidentiality: "INTERNAL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const resultWithPartner = SemanticMatcherService.evaluate(
      sampleConcept,
      sampleSpec,
      validationOpp,
      capabilitiesWithPartner
    );

    expect(resultWithPartner.profile14Axis.passMandatoryEligibility).toBe(true);
  });

  // 5. 기존 v2 Fit Score 하위 신호 보존 및 충돌 없음 검증
  it("기존 v2 Fit Score를 삭제하지 않고 14축 상위평가의 하위 신호(subFitScore)로 온전히 보존한다", () => {
    const result = SemanticMatcherService.evaluate(
      sampleConcept,
      sampleSpec,
      sampleOpportunity,
      sampleCapabilities
    );

    const sub = result.profile14Axis.subFitScore;
    expect(sub).toBeDefined();
    expect(sub.totalScore).toBeGreaterThan(0);
    expect(sub.breakdown.length).toBe(6); // v2 OpportunityScorer 6대 세부 분석 항목
    expect(sub.strengths.length).toBeGreaterThan(0);
  });
});
