/**
 * RoboBid AI v3.0 — Funding Conflict Checker Engine
 * 중복수혜 및 중복계상(기간, 비목, 장비/자산, 부품, 인력 참여율, 부처 간 유사과제 제한) 정밀 감지
 */

import {
  FundingConflictRisk,
  FundingPortfolioItem,
  FundingConflictReport,
  ConflictFinding,
  ProjectBudgetCategory,
  PROJECT_BUDGET_CATEGORY_LABELS,
} from "@/types";

export interface CandidateFundingInput {
  opportunityTitle: string;
  announcingAgency: string;
  fundingType: string;
  period: {
    startDate: string;
    endDate: string;
  };
  allocatedCategories: Partial<Record<ProjectBudgetCategory, number>>;
  assetsIncluded?: string[];
  partsIncluded?: string[];
  personnelIncluded?: Array<{ name: string; participationRate: number }>;
}

export class FundingConflictService {
  public static readonly DISCLAIMER =
    "본 검토 결과는 AI 및 규정 기반 분석에 따른 사전 권고안이며, 법적 확정 판단이 아닙니다. " +
    "중복수혜 승인 여부와 비목 인정 범위는 각 전담기관(전문기관) 및 총괄 주관부처의 최신 공고 관리지침과 " +
    "담당 간사의 최종 심의에 따라 결정되므로, 사업계획서 제출 전 전담기관에 사전 확인을 반드시 거치시기 바랍니다.";

  /**
   * 후보 지원사업과 기존 포트폴리오 항목 간의 중복 충돌 검사
   */
  public static checkConflicts(
    candidate: CandidateFundingInput,
    existingPortfolio: FundingPortfolioItem[]
  ): FundingConflictReport {
    const findings: ConflictFinding[] = [];

    // 제외할 항목: REJECTED, CANCELLED 상태는 충돌 대상에서 제외
    const activeItems = existingPortfolio.filter(
      (item) => item.status !== "REJECTED" && item.status !== "CANCELLED"
    );

    // 1. 동일 프로젝트/동일 지원사업 중복 (SAME_PROJECT)
    for (const item of activeItems) {
      if (item.opportunityTitle.trim().toLowerCase() === candidate.opportunityTitle.trim().toLowerCase()) {
        findings.push({
          checkType: "SAME_PROJECT",
          riskLevel: "PROHIBITED",
          title: "동일 지원사업 중복 신청 감지",
          description: `이미 포트폴리오에 등록되어 진행 중인 지원사업('${item.opportunityTitle}')과 동일한 사업에 중복 신청을 시도하고 있습니다.`,
          conflictingOpportunityTitles: [item.opportunityTitle],
          recommendation: "기존 지원 건의 평가 결과를 기다리거나, 기존 건의 상태를 갱신하십시오.",
        });
      }
    }

    // 2. 수행 기간 중복 (SAME_PERIOD)
    const candStart = new Date(candidate.period.startDate).getTime();
    const candEnd = new Date(candidate.period.endDate).getTime();

    const overlappingItems = activeItems.filter((item) => {
      const itemStart = new Date(item.period.startDate).getTime();
      const itemEnd = new Date(item.period.endDate).getTime();
      return candStart <= itemEnd && candEnd >= itemStart;
    });

    if (overlappingItems.length > 0) {
      const awardedOverlap = overlappingItems.filter((i) => i.status === "AWARDED");
      if (awardedOverlap.length > 0) {
        findings.push({
          checkType: "SAME_PERIOD",
          riskLevel: "POTENTIAL_CONFLICT",
          title: "수행 기간 중복 (선정 완료 과제와 동시 수행)",
          description: `선정되어 수행 중인 사업 [${awardedOverlap.map((i) => i.opportunityTitle).join(", ")}]과 수행 기간이 겹칩니다. 동일 개발 인력이나 장비의 중복 투입 여부 관리가 필요합니다.`,
          conflictingOpportunityTitles: awardedOverlap.map((i) => i.opportunityTitle),
          recommendation: "참여 연구원의 총 참여율 100% 이내 분배 및 연구장비 도입 일정의 독립성을 사업계획서에 명시하세요.",
        });
      }
    }

    // 3. 비목 중복 계상 (SAME_COST_CATEGORY)
    for (const catKey of Object.keys(candidate.allocatedCategories)) {
      const category = catKey as ProjectBudgetCategory;
      const candAmount = candidate.allocatedCategories[category] || 0;
      if (candAmount <= 0) continue;

      const conflictingCostItems = overlappingItems.filter(
        (item) => (item.allocatedCategories[category] || 0) > 0
      );

      if (conflictingCostItems.length > 0) {
        // 이미 선정되었거나 심사 중인 항목과 동일 비목 집중 투입 시
        const awardedWithSameCost = conflictingCostItems.filter((i) => i.status === "AWARDED");
        if (awardedWithSameCost.length > 0) {
          findings.push({
            checkType: "SAME_COST_CATEGORY",
            riskLevel: "POTENTIAL_CONFLICT",
            title: `동일 비목(${PROJECT_BUDGET_CATEGORY_LABELS[category]}) 중복 계상 주의`,
            description: `선정 사업 [${awardedWithSameCost.map((i) => i.opportunityTitle).join(", ")}]에서 이미 ${PROJECT_BUDGET_CATEGORY_LABELS[category]}을 지원받고 있습니다. 동일 항목에 대한 이중 집행은 정산 불인정 및 환수 대상이 될 수 있습니다.`,
            conflictingOpportunityTitles: awardedWithSameCost.map((i) => i.opportunityTitle),
            recommendation: `${PROJECT_BUDGET_CATEGORY_LABELS[category]}의 사용 용도(차세대 버전 기능, 별도 개발 파트 등)를 완전히 분리하여 소명 자료를 사전 구비하십시오.`,
          });
        }
      }
    }

    // 4. 동일 자산/장비 중복 구입 (SAME_ASSET)
    if (candidate.assetsIncluded && candidate.assetsIncluded.length > 0) {
      for (const asset of candidate.assetsIncluded) {
        const conflictAssetItems = overlappingItems.filter(
          (item) => item.assetsIncluded && item.assetsIncluded.some((a) => a.toLowerCase() === asset.toLowerCase())
        );

        if (conflictAssetItems.length > 0) {
          findings.push({
            checkType: "SAME_ASSET",
            riskLevel: "PROHIBITED",
            title: `동일 연구장비/자산 중복 구입 금지 (${asset})`,
            description: `[${conflictAssetItems.map((i) => i.opportunityTitle).join(", ")}]에 이미 계상된 자산('${asset}')이 이번 신규 지원사업 예산에도 중복 계상되었습니다. 국가연구개발혁신법상 동일 장비의 국비 이중 구입은 엄격히 금지됩니다.`,
            conflictingOpportunityTitles: conflictAssetItems.map((i) => i.opportunityTitle),
            recommendation: `기존 과제에서 취득한 '${asset}'을 공동 활용 장비로 등록하거나, 본 과제에서는 임차료 또는 소모성 부품비로 변경하십시오.`,
          });
        }
      }
    }

    // 5. 동일 부품/BOM 시제품 제작비 중복 (SAME_PART)
    if (candidate.partsIncluded && candidate.partsIncluded.length > 0) {
      for (const part of candidate.partsIncluded) {
        const conflictPartItems = overlappingItems.filter(
          (item) => item.partsIncluded && item.partsIncluded.some((p) => p.toLowerCase() === part.toLowerCase())
        );

        if (conflictPartItems.length > 0) {
          findings.push({
            checkType: "SAME_PART",
            riskLevel: "REVIEW_REQUIRED",
            title: `동일 부품/시제품 제작비 중복 검토 필요 (${part})`,
            description: `기존 과제 [${conflictPartItems.map((i) => i.opportunityTitle).join(", ")}]와 동일한 부품('${part}')이 계상되어 있습니다.`,
            conflictingOpportunityTitles: conflictPartItems.map((i) => i.opportunityTitle),
            recommendation: "신규 제작 차세대 시제품의 수량 증가분 또는 사양 고도화 차이점을 명확히 기재하세요.",
          });
        }
      }
    }

    // 6. 동일 참여 연구원 인건비 참여율 초과 (SAME_LABOR)
    if (candidate.personnelIncluded && candidate.personnelIncluded.length > 0) {
      for (const person of candidate.personnelIncluded) {
        if (person.participationRate > 100) {
          findings.push({
            checkType: "SAME_LABOR",
            riskLevel: "PROHIBITED",
            title: `연구원 참여율 100% 초과 (${person.name})`,
            description: `연구원 ${person.name}의 단일 과제 참여율이 ${person.participationRate}%로 법정 상한(100%)을 초과했습니다.`,
            conflictingOpportunityTitles: [],
            recommendation: "참여율을 100% 이하(통상 20%~80% 권장)로 하향 조정하십시오.",
          });
        } else {
          // 기존 진행 중인 과제들의 인력 참여율 합산 검사
          const awardedWithPersonnel = activeItems.filter(
            (item) => item.status === "AWARDED" && item.personnelIncluded?.includes(person.name)
          );
          if (awardedWithPersonnel.length >= 2) {
            findings.push({
              checkType: "SAME_LABOR",
              riskLevel: "REVIEW_REQUIRED",
              title: `다수 국책과제 동시 참여 인력 참여율 확인 필요 (${person.name})`,
              description: `연구원 ${person.name}은(는) 이미 2건 이상의 선정 과제[${awardedWithPersonnel.map((i) => i.opportunityTitle).join(", ")}]에 참여 중입니다. 합산 참여율이 100%를 초과하지 않는지 확인이 필요합니다.`,
              conflictingOpportunityTitles: awardedWithPersonnel.map((i) => i.opportunityTitle),
              recommendation: "기관 전체 연구과제 참여율 총괄 관리대장을 점검하고 참여율을 분산 배정하십시오.",
            });
          }
        }
      }
    }

    // 7. 부처 간 중복수혜 규정 제한 (RESTRICTION_RULE)
    // 예: TIPS R&D 중복, 중기부 1회 졸업제, 3책5공
    const agency = candidate.announcingAgency || "";
    const isMss = agency.includes("중소벤처기업") || agency.includes("TIPS") || agency.includes("중기부");
    if (isMss) {
      const existingMssAwarded = activeItems.filter(
        (i) => i.status === "AWARDED" && (i.announcingAgency.includes("중소벤처") || i.announcingAgency.includes("중기부"))
      );
      if (existingMssAwarded.length >= 1) {
        findings.push({
          checkType: "RESTRICTION_RULE",
          riskLevel: "REVIEW_REQUIRED",
          title: "중소벤처기업부 R&D 중복수혜 및 동시수행 제한 검토",
          description: `중소벤처기업부 지원 R&D 과제 [${existingMssAwarded.map((i) => i.opportunityTitle).join(", ")}]를 이미 수행 중입니다. 중기부 R&D는 원칙적으로 기업당 동시 수행 1개(또는 졸업제 규정)로 제한되는 경우가 많습니다.`,
          conflictingOpportunityTitles: existingMssAwarded.map((i) => i.opportunityTitle),
          recommendation: "해당 공고의 '신청 및 지원 제외 대상' 조항에서 동시수행 과제수 제한 및 졸업제 적용 여부를 전담기관에 유선 확인하십시오.",
        });
      }
    }

    // 3책 5공 검토 (동시 수행 연구책임자 3개, 참여연구원 5개)
    const currentAwardedCount = activeItems.filter((i) => i.status === "AWARDED").length;
    if (currentAwardedCount >= 3) {
      findings.push({
        checkType: "RESTRICTION_RULE",
        riskLevel: "POTENTIAL_CONFLICT",
        title: "국가연구개발사업 동시수행 과제수(3책 5공) 유의",
        description: `현재 기업 내 선정되어 진행 중인 국책사업이 ${currentAwardedCount}건입니다. 총괄책임자는 최대 3개, 참여연구원은 최대 5개 과제까지만 동시 수행 가능합니다.`,
        conflictingOpportunityTitles: activeItems.filter((i) => i.status === "AWARDED").map((i) => i.opportunityTitle),
        recommendation: "연구책임자를 분리 지정하거나, 잔여 기간이 6개월 미만인 과제의 제외 적용 여부를 확인하세요.",
      });
    }

    // 통계 및 Overall Risk 산출
    let prohibitedCount = 0;
    let warningCount = 0;
    let safeCount = 0;

    for (const f of findings) {
      if (f.riskLevel === "PROHIBITED") prohibitedCount++;
      else if (f.riskLevel === "POTENTIAL_CONFLICT" || f.riskLevel === "REVIEW_REQUIRED") warningCount++;
      else safeCount++;
    }

    let overallRisk: FundingConflictRisk = "SAFE";
    if (prohibitedCount > 0) {
      overallRisk = "PROHIBITED";
    } else if (findings.some((f) => f.riskLevel === "REVIEW_REQUIRED")) {
      overallRisk = "REVIEW_REQUIRED";
    } else if (warningCount > 0) {
      overallRisk = "POTENTIAL_CONFLICT";
    }

    return {
      overallRisk,
      findings,
      safeCount,
      warningCount,
      prohibitedCount,
      disclaimer: this.DISCLAIMER,
    };
  }
}
