import {
  DevelopmentProject,
  AwardTransitionInput,
  AwardAgreement,
  AwardFundingAllocation,
  CategoryBudgetAllocation,
  DevelopmentMilestone,
  DevelopmentWorkItem,
  DevelopmentOutsourcingScope,
  DevelopmentReporting,
  DevelopmentDeliverable,
} from "@/types/award";
import { ProjectBudgetCategory } from "@/types/funding";
import { ProjectConceptStore } from "@/lib/concepts/concept-store";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";

/**
 * RoboBid AI v3.0 — Award Transition Engine
 * 선정(Award)을 실제 개발 프로젝트(DevelopmentProject)로 1-Click 전환
 * - Proposal / Master Spec WBS & Budget 재사용
 * - 지원금 예산 배정 (정부출연금 + 민간부담금)
 * - 자체수행 / 외주용역 / 구매 / 실증 4분할 업무 분장
 */

export class AwardTransitionService {
  /**
   * 선정 통보를 기반으로 개발 프로젝트로 전환 생성
   */
  public static transitionToDevelopmentProject(
    input: AwardTransitionInput
  ): DevelopmentProject {
    const now = new Date();
    const nowIso = now.toISOString();
    const projectId = crypto.randomUUID();

    // 1. 공고 및 프로젝트 컨셉 연계 정보 조회
    const opp = opportunityStore.getById(input.opportunityId);
    const conceptStore = ProjectConceptStore.getInstance();
    let concept = input.projectConceptId
      ? conceptStore.getById(input.projectConceptId)
      : conceptStore.getAll()[0];
    if (!concept && input.projectConceptId === "c001-amr-logistics-robot") {
      conceptStore.seedInitialConcepts();
      concept = conceptStore.getById(input.projectConceptId);
    }
    const spec = concept ? conceptStore.getMasterSpec(concept.id) : undefined;

    const projectName =
      input.name ||
      (opp ? `[선정개발] ${opp.title}` : concept ? `[선정개발] ${concept.name}` : "신규 국책 연구개발 프로젝트");

    // 2. 예산 및 지원금 계산 (Award Amount & Funding Allocation)
    const oppBudget = opp?.allocatedBudget || opp?.estimatedPrice;
    const totalBudget =
      input.totalBudget ||
      (spec?.budgetBreakdown
        ? spec.budgetBreakdown.directCost +
          spec.budgetBreakdown.laborCost +
          spec.budgetBreakdown.outsourcingCost +
          spec.budgetBreakdown.indirectCost
        : oppBudget || 500_000_000);

    const governmentGrant =
      input.awardAmount ||
      (oppBudget ? Math.round(oppBudget * 0.75) : Math.round(totalBudget * 0.75));

    const privateContribution = Math.max(0, totalBudget - governmentGrant);
    const privateCash = Math.round(privateContribution * 0.2); // 민간부담금 중 현금 20%
    const privateInKind = privateContribution - privateCash;    // 민간부담금 중 현물 80%

    // 10대 비용 항목 비목별 배정표 작성
    const categoryAllocations: CategoryBudgetAllocation[] = [
      {
        category: "LABOR",
        allocatedAmount: Math.round(totalBudget * 0.38),
        executedAmount: 0,
        remainingAmount: Math.round(totalBudget * 0.38),
      },
      {
        category: "MATERIALS",
        allocatedAmount: Math.round(totalBudget * 0.15),
        executedAmount: 0,
        remainingAmount: Math.round(totalBudget * 0.15),
      },
      {
        category: "PARTS",
        allocatedAmount: Math.round(totalBudget * 0.15),
        executedAmount: 0,
        remainingAmount: Math.round(totalBudget * 0.15),
      },
      {
        category: "EQUIPMENT",
        allocatedAmount: Math.round(totalBudget * 0.07),
        executedAmount: 0,
        remainingAmount: Math.round(totalBudget * 0.07),
      },
      {
        category: "OUTSOURCING",
        allocatedAmount: spec?.budgetBreakdown?.outsourcingCost || Math.round(totalBudget * 0.15),
        executedAmount: 0,
        remainingAmount: spec?.budgetBreakdown?.outsourcingCost || Math.round(totalBudget * 0.15),
      },
      {
        category: "VALIDATION",
        allocatedAmount: Math.round(totalBudget * 0.05),
        executedAmount: 0,
        remainingAmount: Math.round(totalBudget * 0.05),
      },
      {
        category: "SW_SERVER",
        allocatedAmount: Math.round(totalBudget * 0.03),
        executedAmount: 0,
        remainingAmount: Math.round(totalBudget * 0.03),
      },
      {
        category: "CERTIFICATION",
        allocatedAmount: Math.round(totalBudget * 0.02),
        executedAmount: 0,
        remainingAmount: Math.round(totalBudget * 0.02),
      },
    ];

    const fundingAllocation: AwardFundingAllocation = {
      totalBudget,
      governmentGrant,
      privateContribution,
      privateCash,
      privateInKind,
      categoryAllocations,
      maxOverheadRatePercent: 15,
      settlementDeadlineDays: 60,
    };

    // 3. 협약 정보 (Agreement)
    const startDate = input.startDate || "2026-11-01";
    const endDate = input.endDate || "2028-10-31";
    const agreement: AwardAgreement = {
      agreementNumber: `AGR-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      managingAgency: input.managingAgency || opp?.announcingAgency || "중소기업기술정보진흥원 (TIPA)",
      assignedSpecialist: "전담관리 간사",
      agreementDate: nowIso.split("T")[0],
      startDate,
      endDate,
      midEvaluationDate: "2027-10-15",
      finalEvaluationDate: "2028-10-15",
      signed: true,
    };

    // 4. WBS 및 마일스톤 승계 / 재사용
    const milestones: DevelopmentMilestone[] = [];
    if (spec?.wbsSummary && spec.wbsSummary.length > 0) {
      spec.wbsSummary.forEach((wbsText, idx) => {
        milestones.push({
          id: crypto.randomUUID(),
          phaseNumber: idx + 1,
          name: wbsText,
          targetDate: idx === 0 ? "2027-04-30" : idx === 1 ? "2027-10-31" : idx === 2 ? "2028-04-30" : "2028-10-31",
          deliverables: [`${idx + 1}단계 산출물`, "진척 보고서"],
          status: idx === 0 ? "IN_PROGRESS" : "PENDING",
        });
      });
    } else {
      milestones.push(
        {
          id: crypto.randomUUID(),
          phaseNumber: 1,
          name: "1차년도: 시스템 아키텍처 상세 설계 및 핵심 부품 수급",
          targetDate: "2027-04-30",
          deliverables: ["시스템 요구사항 정의서(SRS)", "기구/전장 상세 설계도"],
          status: "IN_PROGRESS",
        },
        {
          id: crypto.randomUUID(),
          phaseNumber: 2,
          name: "2차년도: 핵심 제어 알고리즘 및 1차 시작품 제작",
          targetDate: "2027-10-31",
          deliverables: ["1차 하드웨어 시작품", "임베디드 제어 펌웨어 v1.0"],
          status: "PENDING",
        },
        {
          id: crypto.randomUUID(),
          phaseNumber: 3,
          name: "3차년도: 공인시험성적서 취득 및 현장 테스트베드 실증",
          targetDate: "2028-04-30",
          deliverables: ["KOLAS 공인시험성적서", "수요처 실증 평가서"],
          status: "PENDING",
        },
        {
          id: crypto.randomUUID(),
          phaseNumber: 4,
          name: "4차년도: 최종 감리, 특허 등록 및 양산 사업화 이관",
          targetDate: "2028-10-31",
          deliverables: ["최종 연구개발보고서", "지식재산권(특허) 출원서"],
          status: "PENDING",
        }
      );
    }

    // 5. 실무 업무 분장 (Internal, External, Procurement, Validation)
    const workItems: DevelopmentWorkItem[] = [
      {
        id: crypto.randomUUID(),
        wbsCode: "WBS 1.1",
        title: "ROS2 마이크로서비스 기반 실시간 경로계획 및 자율주행 제어 알고리즘 개발",
        workCategory: "INTERNAL_WORK",
        budgetAmount: Math.round(totalBudget * 0.25),
        assignedRole: "자율주행 SW 연구원",
        status: "IN_PROGRESS",
        deliverable: "ROS2 Navigation 제어 패키지 소스코드",
      },
      {
        id: crypto.randomUUID(),
        wbsCode: "WBS 1.2",
        title: "알루미늄 정밀 5축 CNC 섀시 가공 및 전장 하네스 배선 조립 외주",
        workCategory: "EXTERNAL_WORK",
        budgetAmount: spec?.budgetBreakdown?.outsourcingCost || Math.round(totalBudget * 0.15),
        assignedRole: "외주가공 협력사",
        status: "TODO",
        deliverable: "가공 섀시 완제품 및 3차원 측정 성적서",
      },
      {
        id: crypto.randomUUID(),
        wbsCode: "WBS 1.3",
        title: "3D 안전 LiDAR, BLDC 서보모터 드라이버 및 고성능 AI 엣지 컴퓨터 구매",
        workCategory: "PROCUREMENT",
        budgetAmount: Math.round(totalBudget * 0.2),
        assignedRole: "구매자재팀",
        status: "IN_PROGRESS",
        deliverable: "부품 입고 검수서 및 거래명세서",
      },
      {
        id: crypto.randomUUID(),
        wbsCode: "WBS 1.4",
        title: "KOLAS 공인시험인증 취득 및 수요처 물류창고 2개월 현장 연속 부하 실증",
        workCategory: "VALIDATION",
        budgetAmount: Math.round(totalBudget * 0.08),
        assignedRole: "품질인증팀",
        status: "TODO",
        deliverable: "KOLAS 공인시험성적서",
      },
    ];

    // 6. 외주 과업 범위 (Outsourcing Scope) 정의
    const outsourcingScopes: DevelopmentOutsourcingScope[] = [
      {
        id: crypto.randomUUID(),
        taskTitle: spec?.outsourcingPlan || "알루미늄 기구 섀시 정밀 가공 및 표면처리 외주 용역",
        budgetAmount: spec?.budgetBreakdown?.outsourcingCost || Math.round(totalBudget * 0.15),
        specSummary: "치수 공차 ±0.02mm 이내, AL6061-T6 아노다이징, 발주 후 4주 이내 납품",
        acceptanceCriteria: "3차원 정밀 측정 성적서 일치율 99% 이상 및 조립 간섭 0건",
        status: "PLANNED",
      },
    ];

    // 7. 정기 보고 일정 (Reporting Schedule)
    const reportingSchedule: DevelopmentReporting[] = [
      {
        id: crypto.randomUUID(),
        reportType: "KICKOFF",
        title: "연구개발 착수보고서 제출 및 사업비 전용계좌 등록",
        dueDate: "2026-11-30",
        status: "PENDING",
      },
      {
        id: crypto.randomUUID(),
        reportType: "MIDTERM",
        title: "중간 진도점검 보고서 및 1차년도 사업비 집행내역 제출",
        dueDate: "2027-10-15",
        status: "PENDING",
      },
      {
        id: crypto.randomUUID(),
        reportType: "FINAL",
        title: "최종 연구개발결과보고서 및 성과 증빙자료 제출",
        dueDate: "2028-10-15",
        status: "PENDING",
      },
      {
        id: crypto.randomUUID(),
        reportType: "SETTLEMENT",
        title: "위탁정산 회계감사보고서 및 최종 사업비 정산 제출",
        dueDate: "2028-12-15",
        status: "PENDING",
      },
    ];

    // 8. 확정 산출물 (Deliverables)
    const deliverables: DevelopmentDeliverable[] = [];
    if (spec?.kpis && spec.kpis.length > 0) {
      spec.kpis.forEach((kpi) => {
        deliverables.push({
          id: crypto.randomUUID(),
          name: `${kpi.metricName} (목표: ${kpi.targetValue})`,
          targetDate: "2028-09-30",
          evaluationMethod: kpi.evaluationMethod,
          isCompleted: false,
        });
      });
    } else {
      deliverables.push(
        {
          id: crypto.randomUUID(),
          name: "로봇 주행 위치 정지 정밀도 ±10mm 이하 성적서",
          targetDate: "2028-04-30",
          evaluationMethod: "KOLAS 공인시험성적서",
          isCompleted: false,
        },
        {
          id: crypto.randomUUID(),
          name: "핵심 특허 출원 2건",
          targetDate: "2027-12-31",
          evaluationMethod: "특허청 출원번호통지서",
          isCompleted: false,
        }
      );
    }

    return {
      id: projectId,
      organizationId: input.organizationId || opp?.organizationId || concept?.organizationId || crypto.randomUUID(),
      opportunityId: input.opportunityId,
      proposalId: input.proposalId || null,
      projectConceptId: concept?.id || input.projectConceptId || null,
      name: projectName,
      status: "DEVELOPMENT_ACTIVE",
      agreement,
      fundingAllocation,
      milestones,
      workItems,
      outsourcingScopes,
      reportingSchedule,
      deliverables,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }

  /**
   * 지원금 예산 집행 업데이트
   */
  public static recordExpense(
    project: DevelopmentProject,
    category: ProjectBudgetCategory,
    expenseAmount: number
  ): DevelopmentProject {
    const updatedAllocations = project.fundingAllocation.categoryAllocations.map((alloc) => {
      if (alloc.category === category) {
        const newExecuted = alloc.executedAmount + expenseAmount;
        return {
          ...alloc,
          executedAmount: newExecuted,
          remainingAmount: alloc.allocatedAmount - newExecuted,
        };
      }
      return alloc;
    });

    return {
      ...project,
      fundingAllocation: {
        ...project.fundingAllocation,
        categoryAllocations: updatedAllocations,
      },
      updatedAt: new Date().toISOString(),
    };
  }
}
