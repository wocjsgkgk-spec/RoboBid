import { describe, it, expect, beforeEach } from "vitest";
import { AwardTransitionService } from "@/lib/award/award-transition-service";
import { AwardStore } from "@/lib/award/award-store";
import { ProjectConceptStore } from "@/lib/concepts/concept-store";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { AwardTransitionInput, DevelopmentProject } from "@/types/award";

describe("Phase 8 — Award Workspace & Development Transition", () => {
  const oppId = "opp-amr-tipa-2026";
  const conceptId = "c001-amr-logistics-robot";

  beforeEach(() => {
    AwardStore.getInstance().clear();
  });

  describe("1. Award → DevelopmentProject Transition", () => {
    it("should successfully transition an awarded opportunity into a DevelopmentProject", () => {
      const input: AwardTransitionInput = {
        opportunityId: oppId,
        projectConceptId: conceptId,
        name: "항만 물류 고중량 500kg 자율주행 협동 AMR 로봇 실증 개발",
        awardAmount: 600_000_000,
        totalBudget: 800_000_000,
        managingAgency: "중소기업기술정보진흥원 (TIPA)",
        startDate: "2026-11-01",
        endDate: "2028-10-31",
      };

      const project = AwardTransitionService.transitionToDevelopmentProject(input);

      expect(project.id).toBeTruthy();
      expect(project.name).toContain("항만 물류 고중량 500kg");
      expect(project.opportunityId).toBe(oppId);
      expect(project.projectConceptId).toBe(conceptId);
      expect(project.status).toBe("DEVELOPMENT_ACTIVE");

      // Agreement verification
      expect(project.agreement.managingAgency).toBe("중소기업기술정보진흥원 (TIPA)");
      expect(project.agreement.agreementNumber).toContain("AGR-");
      expect(project.agreement.startDate).toBe("2026-11-01");
      expect(project.agreement.endDate).toBe("2028-10-31");
      expect(project.agreement.signed).toBe(true);
    });
  });

  describe("2. Funding Budget Allocation & Real-time Tracking", () => {
    it("should accurately calculate government grant, private cash, and private in-kind", () => {
      const input: AwardTransitionInput = {
        opportunityId: oppId,
        projectConceptId: conceptId,
        awardAmount: 600_000_000,
        totalBudget: 800_000_000,
      };

      const project = AwardTransitionService.transitionToDevelopmentProject(input);

      expect(project.fundingAllocation.totalBudget).toBe(800_000_000);
      expect(project.fundingAllocation.governmentGrant).toBe(600_000_000);
      expect(project.fundingAllocation.privateContribution).toBe(200_000_000);
      // Private cash is 20%, in-kind is 80%
      expect(project.fundingAllocation.privateCash).toBe(40_000_000);
      expect(project.fundingAllocation.privateInKind).toBe(160_000_000);
    });

    it("should track 10 cost categories and update remaining balance on expense recording", () => {
      const input: AwardTransitionInput = {
        opportunityId: oppId,
        projectConceptId: conceptId,
        totalBudget: 800_000_000,
      };

      const project = AwardTransitionService.transitionToDevelopmentProject(input);
      const laborAlloc = project.fundingAllocation.categoryAllocations.find(
        (c) => c.category === "LABOR"
      );
      expect(laborAlloc).toBeDefined();
      const initialLaborAllocated = laborAlloc!.allocatedAmount;
      expect(laborAlloc!.executedAmount).toBe(0);
      expect(laborAlloc!.remainingAmount).toBe(initialLaborAllocated);

      // Record an expense of 50,000,000 in LABOR
      const updated = AwardTransitionService.recordExpense(project, "LABOR", 50_000_000);
      const updatedLabor = updated.fundingAllocation.categoryAllocations.find(
        (c) => c.category === "LABOR"
      );

      expect(updatedLabor!.executedAmount).toBe(50_000_000);
      expect(updatedLabor!.remainingAmount).toBe(initialLaborAllocated - 50_000_000);
    });
  });

  describe("3. Proposal, WBS & Master Spec Reuse", () => {
    it("should inherit Master Specification WBS, KPIs, and Outsourcing Plan", () => {
      const input: AwardTransitionInput = {
        opportunityId: oppId,
        projectConceptId: conceptId,
      };

      const project = AwardTransitionService.transitionToDevelopmentProject(input);

      // Milestones inherited from Master Spec WBS
      expect(project.milestones.length).toBeGreaterThan(0);
      expect(project.milestones[0].name).toContain("WBS 1");

      // Outsourcing scope inherited
      expect(project.outsourcingScopes.length).toBeGreaterThan(0);
      expect(project.outsourcingScopes[0].taskTitle).toBeTruthy();
      expect(project.outsourcingScopes[0].acceptanceCriteria).toBeTruthy();

      // Deliverables inherited from Master Spec KPIs
      expect(project.deliverables.length).toBeGreaterThan(0);
      expect(project.deliverables.some((d) => d.name.includes("정밀도") || d.evaluationMethod.includes("KOLAS"))).toBe(true);
    });

    it("should partition work into 4 practical categories: Internal, External, Procurement, Validation", () => {
      const input: AwardTransitionInput = {
        opportunityId: oppId,
        projectConceptId: conceptId,
      };

      const project = AwardTransitionService.transitionToDevelopmentProject(input);
      const categories = project.workItems.map((w) => w.workCategory);

      expect(categories).toContain("INTERNAL_WORK");
      expect(categories).toContain("EXTERNAL_WORK");
      expect(categories).toContain("PROCUREMENT");
      expect(categories).toContain("VALIDATION");
    });
  });

  describe("4. Separation of Submission Stage vs Development Stage", () => {
    it("should ensure development project status is distinctly partitioned from pre-award submission statuses", () => {
      const input: AwardTransitionInput = {
        opportunityId: oppId,
        projectConceptId: conceptId,
      };

      const project = AwardTransitionService.transitionToDevelopmentProject(input);

      // Distinct post-award status
      expect(["DEVELOPMENT_ACTIVE", "AWARDED", "AGREEMENT_SIGNED"]).toContain(project.status);
      expect(project.status).not.toBe("DRAFTING");
      expect(project.status).not.toBe("SUBMITTED");

      // Reporting schedule exists for post-award audits
      expect(project.reportingSchedule.length).toBe(4);
      expect(project.reportingSchedule.map((r) => r.reportType)).toEqual([
        "KICKOFF",
        "MIDTERM",
        "FINAL",
        "SETTLEMENT",
      ]);
    });
  });

  describe("5. Award Store Persistence", () => {
    it("should save and retrieve development projects from AwardStore", () => {
      const store = AwardStore.getInstance();
      const project = AwardTransitionService.transitionToDevelopmentProject({
        opportunityId: "opp-custom-test",
        name: "커스텀 로봇 프로젝트",
      });

      store.save(project);
      const retrieved = store.getById(project.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("커스텀 로봇 프로젝트");

      const byOpp = store.getByOpportunityId("opp-custom-test");
      expect(byOpp?.id).toBe(project.id);
    });
  });
});
