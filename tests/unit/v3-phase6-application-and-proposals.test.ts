import { describe, it, expect, beforeEach } from "vitest";
import {
  AGENCY_TEMPLATES,
  getTemplateForFundingType,
  PublicAgencyType,
} from "@/lib/proposals/agency-templates";
import { CrossReviewEngine } from "@/lib/proposals/cross-review-engine";
import { DecisionService } from "@/lib/decision/decision-service";
import { proposalService } from "@/lib/proposals/proposal-service";
import { SubmissionService } from "@/lib/compliance/submission-service";
import { Proposal, ProposalSection, Opportunity } from "@/types";

describe("RoboBid AI v3.0 — Phase 6: Application Workspace, Proposal & Submission Migration", () => {
  let crossReviewEngine: CrossReviewEngine;
  let submissionService: SubmissionService;

  const sampleOpportunity: Opportunity = {
    id: "opp-app-001",
    organizationId: "00000000-0000-0000-0000-000000000001",
    providerId: "IRIS",
    sourceId: "src-app-001",
    title: "2026년 지능형 로봇 고도화 R&D 지원사업",
    announcingAgency: "한국산업기술기획평가원 (KEIT)",
    bidType: "R_AND_D",
    fundingType: "GOV_RND",
    primaryDomain: "ROBOT",
    allocatedBudget: 500_000_000,
    postedAt: "2026-09-01T00:00:00Z",
    submissionDeadline: "2026-10-15T18:00:00Z",
    status: "REVIEWING",
    contentHash: "hash-app-1",
    currentVersion: 1,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  };

  const sampleProposal: Proposal = {
    id: "prop-app-001",
    organizationId: sampleOpportunity.organizationId,
    opportunityId: sampleOpportunity.id,
    title: "지능형 로봇 고도화 R&D 제안서",
    status: "DRAFTING",
    currentVersion: 1,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleSections: ProposalSection[] = [
    {
      id: "sec-1",
      proposalId: sampleProposal.id,
      sectionCode: "R1_RESEARCH_NECESSITY",
      title: "1. 연구개발의 필요성",
      orderIndex: 1,
      contentMarkdown: "본 과제는 물류 및 제조 현장의 인력난을 해소하고 국가 로봇 기술 자립도를 높이기 위한...".repeat(5),
      evidenceCitations: [],
      status: "AI_GENERATED",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sec-2",
      proposalId: sampleProposal.id,
      sectionCode: "R2_GOALS_AND_METHODS",
      title: "2. 연구개발 목표 및 수행 방법",
      orderIndex: 2,
      contentMarkdown: "ROS2 기반 듀얼 SLAM 및 3D 라이다 센서 융합 알고리즘을 구축하여...".repeat(5),
      evidenceCitations: [],
      status: "AI_GENERATED",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sec-3",
      proposalId: sampleProposal.id,
      sectionCode: "R3_EVALUATION_CRITERIA",
      title: "3. 정량적 성능지표 (KPI)",
      orderIndex: 3,
      contentMarkdown: "최대 가반하중 500kg, 위치 정지 정밀도 10mm 이내, KOLAS 공인시험성적서 발행...".repeat(5),
      evidenceCitations: [],
      status: "AI_GENERATED",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    crossReviewEngine = new CrossReviewEngine();
    proposalService.clearMemory();
    submissionService = new SubmissionService(undefined, proposalService);
    submissionService.clearMemory();
  });

  // ==========================================================================
  // 1. Decision Flow: Funding (APPLY) vs Procurement (GO)
  // ==========================================================================
  describe("1. Decision Flow (APPLY / GO / PASS / NO_GO)", () => {
    it("Funding형 지원사업의 APPLY 및 APPLY_WITH_CONDITIONS 결정 시 상태가 GO로 전이된다", () => {
      const applyResult = DecisionService.recordDecision({
        opportunityId: sampleOpportunity.id,
        organizationId: sampleOpportunity.organizationId,
        decision: "APPLY",
        reason: "지원금 비목 충당률 및 기술 적합도 우수",
        scoreAtDecision: 95,
      });

      expect(applyResult.decision.decision).toBe("APPLY");
      expect(applyResult.newOpportunityStatus).toBe("GO");

      const condResult = DecisionService.recordDecision({
        opportunityId: sampleOpportunity.id,
        organizationId: sampleOpportunity.organizationId,
        decision: "APPLY_WITH_CONDITIONS",
        reason: "컨소시엄 참여기업 확약서 확보 전제",
        conditions: ["수요기업 참여확약서 확보"],
        scoreAtDecision: 88,
      });

      expect(condResult.decision.decision).toBe("APPLY_WITH_CONDITIONS");
      expect(condResult.decision.conditions).toContain("수요기업 참여확약서 확보");
      expect(condResult.newOpportunityStatus).toBe("GO");
    });

    it("Funding형 지원사업의 PASS 결정 시 상태가 NO_GO로 전이된다", () => {
      const passResult = DecisionService.recordDecision({
        opportunityId: sampleOpportunity.id,
        organizationId: sampleOpportunity.organizationId,
        decision: "PASS",
        reason: "당사 로봇 로드맵과 상이하여 미지원",
        scoreAtDecision: 40,
      });

      expect(passResult.decision.decision).toBe("PASS");
      expect(passResult.newOpportunityStatus).toBe("NO_GO");
    });

    it("기존 조달형 입찰의 GO, GO_WITH_CONDITIONS, NO_GO, HOLD도 기존과 동일하게 온전히 보존된다", () => {
      const goResult = DecisionService.recordDecision({
        opportunityId: "opp-koneps-1",
        organizationId: sampleOpportunity.organizationId,
        decision: "GO",
        reason: "조달청 물품 입찰 투찰 결정",
        scoreAtDecision: 90,
      });
      expect(goResult.decision.decision).toBe("GO");
      expect(goResult.newOpportunityStatus).toBe("GO");

      const noGoResult = DecisionService.recordDecision({
        opportunityId: "opp-koneps-2",
        organizationId: sampleOpportunity.organizationId,
        decision: "NO_GO",
        reason: "예정가격 대비 단가 부족",
        scoreAtDecision: 50,
      });
      expect(noGoResult.decision.decision).toBe("NO_GO");
      expect(noGoResult.newOpportunityStatus).toBe("NO_GO");
    });
  });

  // ==========================================================================
  // 2. 12대 Proposal Templates 지원
  // ==========================================================================
  describe("2. 12 Proposal Templates & Funding Type Mapping", () => {
    it("12대 모든 공모·지원사업 서식 템플릿이 정의되어 있다", () => {
      const required12Templates: PublicAgencyType[] = [
        "GOV_RND",
        "LOCAL_RND",
        "STARTUP_GRANT",
        "PROTOTYPE_GRANT",
        "VALIDATION_GRANT",
        "COMMERCIALIZATION",
        "CONTEST",
        "COMPETITION",
        "EXPORT",
        "PROCUREMENT",
        "SERVICE_CONTRACT",
        "CUSTOM",
      ];

      for (const tType of required12Templates) {
        const t = AGENCY_TEMPLATES[tType];
        expect(t).toBeDefined();
        expect(t.sections.length).toBeGreaterThan(0);
        expect(t.name.length).toBeGreaterThan(0);
        expect(t.evaluationFocus.length).toBeGreaterThan(0);
      }
    });

    it("getTemplateForFundingType 함수가 지원유형에 맞는 템플릿을 올바르게 반환한다", () => {
      expect(getTemplateForFundingType("GOV_RND").agencyType).toBe("GOV_RND");
      expect(getTemplateForFundingType("STARTUP_GRANT").agencyType).toBe("STARTUP_GRANT");
      expect(getTemplateForFundingType("VALIDATION_GRANT").agencyType).toBe("VALIDATION_GRANT");
      expect(getTemplateForFundingType("COMMERCIALIZATION").agencyType).toBe("COMMERCIALIZATION");
      expect(getTemplateForFundingType("EXPORT").agencyType).toBe("EXPORT");
      expect(getTemplateForFundingType("PROCUREMENT").agencyType).toBe("PROCUREMENT");
      expect(getTemplateForFundingType("SERVICE_CONTRACT").agencyType).toBe("SERVICE_CONTRACT");
    });

    it("기존 레거시 템플릿 키(KONEPS, NIPA_NIA, TIPA_MSS, IRIS_RND)도 100% 하위 호환된다", () => {
      expect(AGENCY_TEMPLATES["KONEPS"]).toBeDefined();
      expect(AGENCY_TEMPLATES["NIPA_NIA"]).toBeDefined();
      expect(AGENCY_TEMPLATES["TIPA_MSS"]).toBeDefined();
      expect(AGENCY_TEMPLATES["IRIS_RND"]).toBeDefined();
    });
  });

  // ==========================================================================
  // 3. Cross-Review Migration: 5대 사업유형별 심사위원 Persona
  // ==========================================================================
  describe("3. Cross-Review Migration (지원유형별 심사위원 페르소나)", () => {
    it("R&D 지원사업일 때 기술전문가, 사업화전문가, 연구관리전문가, 재무/예산 심사위원 페르소나를 적용한다", () => {
      const result = crossReviewEngine.review(sampleProposal, sampleSections, [], "GOV_RND");

      expect(result.findings.length).toBe(4);
      const agentNames = result.findings.map((f) => f.agentName);
      expect(agentNames.some((n) => n.includes("기술전문가"))).toBe(true);
      expect(agentNames.some((n) => n.includes("사업화전문가"))).toBe(true);
      expect(agentNames.some((n) => n.includes("연구관리전문가"))).toBe(true);
      expect(agentNames.some((n) => n.includes("재무/예산"))).toBe(true);
    });

    it("창업지원사업(STARTUP_GRANT)일 때 BM/비즈니스모델, 시장성, 팀역량, 자금소요 심사위원 페르소나를 적용한다", () => {
      const result = crossReviewEngine.review(sampleProposal, sampleSections, [], "STARTUP_GRANT");

      const agentNames = result.findings.map((f) => f.agentName);
      expect(agentNames.some((n) => n.includes("BM/비즈니스모델"))).toBe(true);
      expect(agentNames.some((n) => n.includes("시장성"))).toBe(true);
      expect(agentNames.some((n) => n.includes("팀 역량"))).toBe(true);
    });

    it("로봇 실증사업(VALIDATION_GRANT)일 때 기술 완성도, 현장성·안전성, 정량적 KPI, 확산 파급력 페르소나를 적용한다", () => {
      const result = crossReviewEngine.review(sampleProposal, sampleSections, [], "VALIDATION_GRANT");

      const agentNames = result.findings.map((f) => f.agentName);
      expect(agentNames.some((n) => n.includes("기술 완성도"))).toBe(true);
      expect(agentNames.some((n) => n.includes("현장성·안전성"))).toBe(true);
      expect(agentNames.some((n) => n.includes("정량적 KPI"))).toBe(true);
    });

    it("공공조달(PROCUREMENT)일 때 행정·자격, 규격·기술, 가격·원가, 사업수행능력 페르소나를 적용한다", () => {
      const result = crossReviewEngine.review(sampleProposal, sampleSections, [], "PROCUREMENT");

      const agentNames = result.findings.map((f) => f.agentName);
      expect(agentNames.some((n) => n.includes("행정·자격"))).toBe(true);
      expect(agentNames.some((n) => n.includes("규격·기술"))).toBe(true);
      expect(agentNames.some((n) => n.includes("가격·원가"))).toBe(true);
    });
  });

  // ==========================================================================
  // 4. Zero-Auto-Submit 및 제출 거버넌스 유지
  // ==========================================================================
  describe("4. Zero-Auto-Submit Policy & Submission Gate Preservation", () => {
    it("자동 제출 API가 일체 없으며, 체크리스트 미비 시 제출 확정이 거부된다", () => {
      // 자동 제출 메서드 부재 확인
      expect((submissionService as any).autoSubmit).toBeUndefined();
      expect((submissionService as any).directSubmit).toBeUndefined();

      const createdProposal = proposalService.createProposalFromOpportunity(sampleOpportunity);

      // 체크리스트 미승인 상태에서 제출 시도 시 거부
      const result = submissionService.confirmSubmission({
        proposalId: createdProposal.id,
        submitterName: "홍길동 책임",
        finalFileName: "final.pdf",
        finalFileHash: "sha256-abc",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("제출 전 검증 실패");
    });

    it("인간 책임자의 체크리스트 완비 및 Sign-off 시에만 정상 제출 확정된다", () => {
      const createdProposal = proposalService.createProposalFromOpportunity(sampleOpportunity);

      submissionService.updateChecklist(createdProposal.id, {
        allMandatorySatisfied: true,
        documentsReady: true,
        sealAndSignatureVerified: true,
        formatAndSizeVerified: true,
        submissionUrlVerified: true,
        submitterAssigned: true,
        submitterName: "김기술 연구소장",
      });

      const confirmResult = submissionService.confirmSubmission({
        proposalId: createdProposal.id,
        submitterName: "김기술 연구소장",
        submissionUrl: "https://iris.go.kr",
        finalFileName: "지능형로봇_최종계획서.pdf",
        finalFileHash: "sha256-verified-8f92a1c4b7e5",
        submissionNotes: "IRIS 연구개발계획서 접수 완료",
      });

      expect(confirmResult.success).toBe(true);
      expect(confirmResult.submittedAt).toBeDefined();

      const refreshed = proposalService.getProposal(createdProposal.id);
      expect(refreshed?.status).toBe("SUBMITTED");
    });
  });
});
