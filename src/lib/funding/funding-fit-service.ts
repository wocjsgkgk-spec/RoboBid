/**
 * RoboBid AI v3.0 — Funding Fit Engine
 * 10개 개발 예산 비목과 지원사업 허용/불가 비목 간의 충당률(Coverage) 및 자부담·미지원 비용(Gap) 정밀 계산
 */

import {
  ProjectBudgetCategory,
  PROJECT_BUDGET_CATEGORY_LABELS,
  AllowableCostRule,
  OpportunityFundingTerms,
  FundingFitCategoryCoverage,
  FundingFitResult,
  Opportunity,
  ProjectConcept,
  MasterSpecification,
} from "@/types";

export interface ProjectBudgetInput {
  totalBudget?: number;
  categories: Partial<Record<ProjectBudgetCategory, number>>;
}

export class FundingFitService {
  /**
   * 기본 비목별 허용 규정 (정부 R&D, 창업지원금, 실증사업 표준 모델)
   */
  public static getDefaultFundingTerms(opp?: Partial<Opportunity>): OpportunityFundingTerms {
    const budget = opp?.allocatedBudget || 300_000_000;
    const fundingType = opp?.fundingType || "GOV_RND";

    // 기본 자부담 비율: 일반 중소기업 20% (현금 10% + 현물 10%)
    let selfFundingMinRatio = 0.20;
    let maxGrant = budget;

    const costRules: Partial<Record<ProjectBudgetCategory, AllowableCostRule>> = {
      LABOR: { category: "LABOR", status: "ALLOWED", capPercentage: 0.5, note: "총 사업비의 50% 이내 인정" },
      MATERIALS: { category: "MATERIALS", status: "ALLOWED", note: "시제품 제작용 직접 재료비 전액 인정" },
      PARTS: { category: "PARTS", status: "ALLOWED", note: "로봇 핵심 부품 구입비 실비 인정" },
      EQUIPMENT: { category: "EQUIPMENT", status: "CAPPED", capPercentage: 0.3, note: "범용 장비 불가, 전용 연구장비에 한해 30% 이내" },
      OUTSOURCING: { category: "OUTSOURCING", status: "CAPPED", capPercentage: 0.4, note: "시제품 가공/임가공 전문 용역 40% 이내" },
      VALIDATION: { category: "VALIDATION", status: "ALLOWED", note: "필드 테스트 및 PoC 실증 비용 인정" },
      SW_SERVER: { category: "SW_SERVER", status: "ALLOWED", note: "클라우드 인프라 및 전용 SW 라이선스 사용료 인정" },
      MARKETING: { category: "MARKETING", status: "DISALLOWED", note: "R&D 비목 규정상 홍보/판로개척성 마케팅비 불인정" },
      CERTIFICATION: { category: "CERTIFICATION", status: "ALLOWED", note: "KOLAS/KC 등 공인 성능인증 수수료 인정" },
      OTHER: { category: "OTHER", status: "CAPPED", capPercentage: 0.1, note: "간접비/운영경비 10% 상한 적용" },
    };

    // 지원 유형별 규정 차별화
    if (fundingType === "STARTUP_GRANT" || fundingType === "COMMERCIALIZATION") {
      selfFundingMinRatio = 0.10; // 초기창업/사업화 10%
      costRules.MARKETING = { category: "MARKETING", status: "ALLOWED", capPercentage: 0.3, note: "사업화 판로개척비 30% 한도 인정" };
      costRules.EQUIPMENT = { category: "EQUIPMENT", status: "DISALLOWED", note: "자산성 고가 설비 구입 불가 (임차료만 가능)" };
    } else if (fundingType === "VALIDATION_GRANT") {
      selfFundingMinRatio = 0.15;
      costRules.VALIDATION = { category: "VALIDATION", status: "ALLOWED", note: "실증지 구축 및 PoC 운영비 우선 지원" };
      costRules.EQUIPMENT = { category: "EQUIPMENT", status: "ALLOWED", note: "실증 테스트베드 계측장비 인정" };
    } else if (fundingType === "PROCUREMENT" || fundingType === "SERVICE_CONTRACT") {
      // 조달/용역은 자부담 없음 (정부 100% 발주)
      selfFundingMinRatio = 0.0;
      Object.keys(costRules).forEach((cat) => {
        costRules[cat as ProjectBudgetCategory] = {
          category: cat as ProjectBudgetCategory,
          status: "ALLOWED",
          note: "조달 계약 예정가격 총액 도급 계약",
        };
      });
    }

    return {
      maxGrantAmount: maxGrant,
      selfFundingMinRatio,
      cashRatio: selfFundingMinRatio * 0.5,
      costRules,
      specialConditions: [
        `민간부담금(자부담) 의무 비율: ${Math.round(selfFundingMinRatio * 100)}% (현금/현물 분담)`,
        "전용 연구장비 구입 시 심의위원회 승인 필수 (3천만원 이상 장비)",
        "기존 참여인력 인건비는 현물 계상 원칙 (신규 채용 인력에 한해 현금 지원)",
      ],
    };
  }

  /**
   * ProjectConcept과 MasterSpecification으로부터 10대 비목 예산 추출
   */
  public static extractProjectBudget(
    concept: ProjectConcept,
    spec?: MasterSpecification | null
  ): Record<ProjectBudgetCategory, number> {
    const total = concept.estimatedBudget || 800_000_000;

    // 만약 spec에 budgetBreakdown이 있다면 이를 기반으로 매핑
    if (spec?.budgetBreakdown) {
      const b = spec.budgetBreakdown;
      const labor = b.laborCost || Math.round(total * 0.4);
      const direct = b.directCost || Math.round(total * 0.35);
      const outsourcing = b.outsourcingCost || Math.round(total * 0.15);
      const indirect = b.indirectCost || Math.round(total * 0.1);

      return {
        LABOR: labor,
        MATERIALS: Math.round(direct * 0.3),
        PARTS: Math.round(direct * 0.4),
        EQUIPMENT: Math.round(direct * 0.3),
        OUTSOURCING: outsourcing,
        VALIDATION: Math.round(total * 0.05),
        SW_SERVER: Math.round(total * 0.03),
        MARKETING: Math.round(total * 0.02),
        CERTIFICATION: Math.round(total * 0.02),
        OTHER: indirect,
      };
    }

    // 기본 표준 로봇 하드웨어+소프트웨어 프로젝트 배분 (합계 = total)
    return {
      LABOR: Math.round(total * 0.40),       // 40%: 로봇 제어, SLAM, SW 엔지니어 인건비
      MATERIALS: Math.round(total * 0.08),   // 8%: 프레임, 케이블, 기구 원자재
      PARTS: Math.round(total * 0.18),       // 18%: 모터, 감속기, LiDAR, 배터리 BOM
      EQUIPMENT: Math.round(total * 0.08),   // 8%: 개발 및 계측 시험 장비
      OUTSOURCING: Math.round(total * 0.12), // 12%: PCB 제작, 정밀 절삭 임가공
      VALIDATION: Math.round(total * 0.04),  // 4%: 물류센터 현장 PoC 실증비
      SW_SERVER: Math.round(total * 0.03),   // 3%: ROS 시뮬레이션 클라우드, GPU 서버
      MARKETING: Math.round(total * 0.02),   // 2%: 전시회 부스 및 카탈로그
      CERTIFICATION: Math.round(total * 0.02),// 2%: CE/KC/KOLAS 로봇 안전인증
      OTHER: Math.round(total * 0.03),       // 3%: 기타 연구운영비
    };
  }

  /**
   * Funding Fit 계산 실행
   */
  public static calculateFit(
    budgetInput: Record<ProjectBudgetCategory, number> | ProjectConcept,
    termsInput: OpportunityFundingTerms | Opportunity,
    spec?: MasterSpecification | null
  ): FundingFitResult {
    let projectBudget: Record<ProjectBudgetCategory, number>;

    // 1. Budget 정규화
    if ("estimatedBudget" in budgetInput) {
      projectBudget = this.extractProjectBudget(budgetInput, spec);
    } else {
      projectBudget = { ...budgetInput };
    }

    // 2. Funding Terms 정규화
    let terms: OpportunityFundingTerms;
    if ("maxGrantAmount" in termsInput && "costRules" in termsInput) {
      terms = termsInput as OpportunityFundingTerms;
    } else {
      terms = this.getDefaultFundingTerms(termsInput as Opportunity);
    }

    const categories = Object.keys(PROJECT_BUDGET_CATEGORY_LABELS) as ProjectBudgetCategory[];
    const categoryCoverages: FundingFitCategoryCoverage[] = [];

    let totalProjectCost = 0;
    let totalEligibleCost = 0;

    // 3. 비목별 허용 여부 및 상한액 계산
    for (const cat of categories) {
      const requestedCost = projectBudget[cat] || 0;
      totalProjectCost += requestedCost;

      const rule = terms.costRules[cat] || {
        category: cat,
        status: "ALLOWED" as const,
        note: "기본 지원 인정",
      };

      let eligibleCost = 0;
      let note = rule.note || "";

      if (rule.status === "DISALLOWED") {
        eligibleCost = 0;
        note = note || "해당 지원사업 지침상 지원 불가 비목";
      } else if (rule.status === "CAPPED") {
        let maxCap = requestedCost;
        if (rule.capAmount && rule.capAmount < maxCap) {
          maxCap = rule.capAmount;
        }
        if (rule.capPercentage) {
          const percentageCap = Math.round(terms.maxGrantAmount * rule.capPercentage);
          if (percentageCap < maxCap) {
            maxCap = percentageCap;
          }
        }
        eligibleCost = Math.min(requestedCost, maxCap);
        if (eligibleCost < requestedCost) {
          note = `${note} (요청액 ${requestedCost.toLocaleString()}원 중 인정 상한 ${eligibleCost.toLocaleString()}원 적용)`;
        }
      } else {
        // ALLOWED
        eligibleCost = requestedCost;
      }

      totalEligibleCost += eligibleCost;

      categoryCoverages.push({
        category: cat,
        categoryLabel: PROJECT_BUDGET_CATEGORY_LABELS[cat],
        requestedCost,
        isAllowed: rule.status !== "DISALLOWED",
        eligibleCost,
        fundedGrantAmount: 0, // 2차 배분에서 확정
        coverageRatio: 0,
        note,
      });
    }

    // 4. 정부지원금 및 자부담금 정산
    // 정부지원금 산출공식: 지원인정액 중 민간부담비율을 제외한 금액 vs 공고 최대지원한도 중 작은 값
    const grantRatio = Math.max(0, 1 - terms.selfFundingMinRatio);
    const potentialGrantFromEligible = Math.round(totalEligibleCost * grantRatio);
    const actualGrantAmount = Math.min(potentialGrantFromEligible, terms.maxGrantAmount);

    // 자부담금 산출: 인정비용에 비례하는 민간부담금
    const selfFundingAmount = Math.round(actualGrantAmount * (terms.selfFundingMinRatio / Math.max(0.01, grantRatio)));

    // 전체 커버리지
    const overallCoverage = totalProjectCost > 0
      ? Math.min(100, Math.round((actualGrantAmount / totalProjectCost) * 100))
      : 0;

    // 미지원 비용(Gap) = 총 개발비 - 정부지원금
    const unfundedGap = Math.max(0, totalProjectCost - actualGrantAmount);

    // 5. 비목별 실제 충당액(fundedGrantAmount) 배분
    // 인정비용 비율에 따라 실제 지원금을 안분
    const grantScaleRatio = totalEligibleCost > 0 ? actualGrantAmount / totalEligibleCost : 0;

    for (const item of categoryCoverages) {
      if (item.isAllowed && item.eligibleCost > 0) {
        item.fundedGrantAmount = Math.round(item.eligibleCost * grantScaleRatio);
        item.coverageRatio = item.requestedCost > 0
          ? Math.min(100, Math.round((item.fundedGrantAmount / item.requestedCost) * 100))
          : 0;
      } else {
        item.fundedGrantAmount = 0;
        item.coverageRatio = 0;
      }
    }

    // 조건 목록 조합
    const conditions: string[] = [
      ...(terms.specialConditions || []),
      `인정 대상 사업비: ${totalEligibleCost.toLocaleString()}원 (총 프로젝트 비용의 ${Math.round((totalEligibleCost / Math.max(1, totalProjectCost)) * 100)}%)`,
      `정부지원금 상한: ${terms.maxGrantAmount.toLocaleString()}원 대비 최종 ${actualGrantAmount.toLocaleString()}원 충당`,
      `기업 자부담 예상액: 약 ${selfFundingAmount.toLocaleString()}원`,
    ];

    return {
      project_cost: totalProjectCost,
      grant_amount: actualGrantAmount,
      self_funding: selfFundingAmount,
      eligible_cost: totalEligibleCost,
      coverage: overallCoverage,
      coverage_by_category: categoryCoverages,
      unfunded_gap: unfundedGap,
      conditions,
    };
  }
}
