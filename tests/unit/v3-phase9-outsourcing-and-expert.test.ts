import { describe, it, expect, beforeEach } from "vitest";
import { OutsourcingService, OutsourcingStore } from "@/lib/outsourcing/outsourcing-service";
import { ProjectConceptStore } from "@/lib/concepts/concept-store";
import { vaultStore } from "@/lib/vault/vault-store";
import { CreateOutsourcingPackageInput, CandidateVendor, ReceivedQuote } from "@/types/outsourcing";

describe("Phase 9 — Outsourcing & Expert Service v1", () => {
  const conceptId = "c001-amr-logistics-robot";

  beforeEach(() => {
    OutsourcingStore.getInstance().clear();
  });

  describe("1. Capability Gap Analysis (Vault vs Project Scope)", () => {
    it("should analyze internal capabilities from Vault and flag external outsourcing needs", () => {
      const gaps = OutsourcingService.analyzeCapabilityGaps(conceptId);

      expect(gaps.length).toBeGreaterThanOrEqual(3);

      // SW / SLAM algorithm
      const swGap = gaps.find((g) => g.requiredDiscipline.includes("SLAM") || g.requiredDiscipline.includes("SW"));
      expect(swGap).toBeDefined();

      // CNC 5-axis Machining
      const cncGap = gaps.find((g) => g.requiredDiscipline.includes("가공") || g.requiredDiscipline.includes("CNC"));
      expect(cncGap).toBeDefined();
      expect(cncGap?.recommendedAction).toBe("EXTERNAL_OUTSOURCE");
      expect(cncGap?.isInternalAvailable).toBe(false);

      // KOLAS Certification
      const certGap = gaps.find((g) => g.requiredDiscipline.includes("인증") || g.requiredDiscipline.includes("KOLAS"));
      expect(certGap).toBeDefined();
      expect(certGap?.recommendedAction).toBe("EXTERNAL_OUTSOURCE");
    });
  });

  describe("2. Outsource Scope Extraction & SOW Generation", () => {
    it("should extract well-defined outsourcing packages from Master Spec", () => {
      const packages = OutsourcingService.extractOutsourceScopes(conceptId);

      expect(packages.length).toBeGreaterThanOrEqual(2);

      const fabPkg = packages.find((p) => p.taskCategory === "MECHANICAL_FABRICATION");
      expect(fabPkg).toBeDefined();
      expect(fabPkg?.sowContent).toContain("과업내역서");
      expect(fabPkg?.acceptanceCriteria).toBeTruthy();
      expect(fabPkg?.deliverables.length).toBeGreaterThan(0);
      expect(fabPkg?.isApproved).toBe(false);
      expect(fabPkg?.status).toBe("SCOPE_DEFINED");

      const testPkg = packages.find((p) => p.taskCategory === "TESTING_CERTIFICATION");
      expect(testPkg).toBeDefined();
      expect(testPkg?.acceptanceCriteria).toContain("KOLAS");
    });
  });

  describe("3. Human Approval Gate (Zero-Unauthorized-Export / Zero Auto-Contracting)", () => {
    it("should fail approval if approvedBy is missing or empty", () => {
      const packages = OutsourcingService.extractOutsourceScopes(conceptId);
      const pkg = packages[0];

      expect(() => {
        OutsourcingService.approvePackage(pkg, {
          approvedBy: "",
          approvalNotes: "Empty reviewer",
        });
      }).toThrow("승인자(검토자) 성명은 필수 입력 사항입니다.");
    });

    it("should successfully approve package when reviewer signs off", () => {
      const packages = OutsourcingService.extractOutsourceScopes(conceptId);
      const pkg = packages[0];

      const approved = OutsourcingService.approvePackage(pkg, {
        approvedBy: "김수석 (수석 연구원)",
        approvalNotes: "기밀 파라미터 블라인드 처리 완료 및 도면 공차 검토 승인",
      });

      expect(approved.isApproved).toBe(true);
      expect(approved.approvedBy).toBe("김수석 (수석 연구원)");
      expect(approved.approvedAt).toBeTruthy();
      expect(approved.status).toBe("APPROVED");
      expect(approved.approvalNotes).toContain("기밀 파라미터 블라인드");
    });
  });

  describe("4. Outsourcing Store CRUD Operations", () => {
    it("should create, read, update, and delete outsourcing packages", () => {
      const store = OutsourcingStore.getInstance();

      const input: CreateOutsourcingPackageInput = {
        projectConceptId: conceptId,
        taskCategory: "ELECTRONIC_CIRCUIT_PCB",
        taskTitle: "로봇 메인 제어보드 4층 SMT 실장 및 케이블 하네스 결선",
        description: "STM32 메인보드 200대분 실장 및 전장 하네스 압착 외주",
        sowContent: "SMT 실장 거버 데이터 및 BOM 기반 부품 마운트",
        acceptanceCriteria: "AOI 검사 전수 합격 및 전원 투입 숏트 테스트 완료",
        deliverables: ["SMT 실장 보드 200ea", "검사성적서"],
        budgetCap: 25_000_000,
      };

      const created = store.create(input);
      expect(created.id).toBeTruthy();
      expect(created.taskTitle).toContain("로봇 메인 제어보드");
      expect(created.isApproved).toBe(false);

      // Read
      const fetched = store.getById(created.id);
      expect(fetched).toBeDefined();
      expect(fetched?.budgetCap).toBe(25_000_000);

      // Update
      const updated = store.update(created.id, {
        budgetCap: 28_000_000,
        status: "SOURCING",
      });
      expect(updated?.budgetCap).toBe(28_000_000);
      expect(updated?.status).toBe("SOURCING");

      // Delete
      const deleted = store.delete(created.id);
      expect(deleted).toBe(true);
      expect(store.getById(created.id)).toBeUndefined();
    });
  });

  describe("5. Candidate Vendor & Quote Evaluation (Multi-Axis, No Auto-Contracting)", () => {
    it("should allow registering candidate vendors and recording multi-axis quote evaluations", () => {
      const store = OutsourcingStore.getInstance();
      const pkg = store.create({
        projectConceptId: conceptId,
        taskCategory: "MECHANICAL_FABRICATION",
        taskTitle: "외주 정밀 가공 패키지",
        description: "기구 가공",
        sowContent: "SOW 내용",
        acceptanceCriteria: "치수 공차 합격",
        deliverables: ["완제품"],
        budgetCap: 50_000_000,
      });

      const vendor: CandidateVendor = {
        id: "v-001",
        companyName: "정밀테크",
        businessRegistrationNumber: "111-22-33333",
        specialization: "5축 CNC 밀링",
        representativeName: "박대표",
        contactPerson: "최팀장",
        contactPhone: "010-1234-5678",
        contactEmail: "tech@precision.co.kr",
        location: "인천 남동공단",
        trustScore: 92,
        ndaSigned: true,
        pastPerformanceCount: 5,
      };

      const quote: ReceivedQuote = {
        id: "q-001",
        vendorId: vendor.id,
        vendorName: vendor.companyName,
        quoteAmount: 46_000_000,
        leadTimeWeeks: 4,
        submittedAt: new Date().toISOString(),
        notes: "아노다이징 및 3차원 측정 포함",
        complianceToSpec: true,
      };

      // Add vendor and quote to package
      const pkgWithQuote = store.update(pkg.id, {
        candidateVendors: [vendor],
        receivedQuotes: [quote],
      });
      expect(pkgWithQuote?.receivedQuotes.length).toBe(1);

      // Evaluate Quote
      const evaluatedPkg = OutsourcingService.evaluateQuote(pkgWithQuote!, {
        quoteId: quote.id,
        techScore: 35, // out of 40
        priceScore: 28, // out of 30
        scheduleScore: 18, // out of 20
        managementScore: 9, // out of 10
        evaluator: "홍길동 (기술이사)",
        evaluationNotes: "가공 정밀도 및 납기 신뢰성 우수, 단가 적정",
      });

      expect(evaluatedPkg.quoteEvaluations.length).toBe(1);
      const evalResult = evaluatedPkg.quoteEvaluations[0];
      expect(evalResult.totalScore).toBe(90); // 35 + 28 + 18 + 9
      expect(evalResult.vendorName).toBe("정밀테크");
      expect(evalResult.evaluator).toBe("홍길동 (기술이사)");
      // Verify no automated contract signing occurred
      expect(evaluatedPkg.status).not.toBe("CONTRACTED");
    });
  });
});
