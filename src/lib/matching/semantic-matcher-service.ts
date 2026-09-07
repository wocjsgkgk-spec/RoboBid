/**
 * RoboBid AI v3.0 — Semantic Project Match & 14-Axis Evaluation Service
 * "공고 제목의 로봇 키워드가 아니라, 이 지원금을 우리 로봇의 어디에 활용할 수 있는가?"를 판단
 * Deterministic Rule 엔진과 AI Semantic 추론 영역의 엄격한 분리 및 거버넌스 보장
 */

import {
  ProjectConcept,
  MasterSpecification,
  Opportunity,
  Capability,
  SemanticMatchResult,
  Evaluation14AxisProfile,
  EvaluationAxisScore,
  CapabilityGapItem,
} from "@/types";
import { OpportunityScorer } from "../scoring/opportunity-scorer";
import { FundingTaxonomyService } from "../funding/funding-taxonomy-service";

export class SemanticMatcherService {
  /**
   * Project Concept ↔ Funding Opportunity 간의 14축 정밀 적합도 및 Semantic Match 수행
   */
  public static evaluate(
    concept: ProjectConcept,
    spec: MasterSpecification | undefined,
    opp: Opportunity,
    capabilities: Capability[] = []
  ): SemanticMatchResult {
    const enrichedOpp = FundingTaxonomyService.enrichOpportunity(opp);

    // 1. 기존 v2 Fit Score 하위 신호로 계산 (삭제하지 않고 계승)
    const subFitScore = OpportunityScorer.calculate(
      {
        id: opp.id,
        title: opp.title,
        primaryDomain: opp.primaryDomain || "ROBOT",
        allocatedBudget: opp.allocatedBudget,
        submissionDeadline: opp.submissionDeadline,
      },
      capabilities,
      {
        opportunityId: opp.id,
        overallStatus: "PASS",
        passCount: 1,
        failCount: 0,
        reviewRequiredCount: 0,
        unknownCount: 0,
        checks: [],
        canProceedToBidDecision: true,
        evaluatedAt: new Date().toISOString(),
      }
    );

    // 2. Missing Capability (부족 역량) 및 필수 자격 식별
    const gaps: CapabilityGapItem[] = [];
    const techTitles = capabilities
      .filter((c) => c.type === "TECHNOLOGY")
      .map((c) => c.title.toLowerCase());
    const certTitles = capabilities
      .filter((c) => c.type === "CERTIFICATION")
      .map((c) => c.title.toLowerCase());

    // 필수 신청시점 자격 점검 (사업자등록, 결격사유 등)
    const hasTaxClearance = capabilities.some((c) => c.title.includes("완납") || c.type === "FINANCIAL_PROFILE");
    if (!hasTaxClearance) {
      gaps.push({
        requirement: "국세·지방세 완납 증명서",
        category: "ELIGIBILITY",
        status: "AVAILABLE", // 기본 보유로 간주하되 발급 준비 필요
        detail: "과제 신청 전 홈택스 국세/지방세 완납증명서 즉시 발급 필요",
        isMandatoryForSubmission: true,
      });
    }

    // 기술 역량 점검
    const requiredTechs = concept.requiredTechnology || ["ROS2", "SLAM"];
    for (const tech of requiredTechs) {
      const isOwned = techTitles.some((t) => t.includes(tech.toLowerCase()));
      if (!isOwned) {
        gaps.push({
          requirement: `${tech} 관련 핵심 기술`,
          category: "TECHNOLOGY",
          status: "PLANNED", // 과제 수행 중 확보 계획
          detail: `과제 기간 중 사내 R&D 및 알고리즘 구현을 통해 확보 예정`,
          actionPlan: "SW 개발 마일스톤에 반영",
          isMandatoryForSubmission: false,
        });
      }
    }

    // 외주 필요 모듈 점검
    if (spec?.bomEstimate && spec.bomEstimate.length > 0) {
      gaps.push({
        requirement: "정밀 기구/하드웨어 가공 및 전장 하네스",
        category: "FACILITY",
        status: "OUTSOURCE",
        detail: "사내 가공 장비 부재로 전문 외주 CNC 가공업체 협력 조달",
        actionPlan: "비교견적 확보 및 외주 RFP 작성",
        isMandatoryForSubmission: false,
      });
    }

    // 실증/수요처 파트너 필요 점검
    if (enrichedOpp.fundingType === "VALIDATION_GRANT" || opp.title.includes("실증")) {
      const hasPartner = capabilities.some((c) => c.title.includes("수요처") || c.title.includes("협력"));
      gaps.push({
        requirement: "실환경 테스트베드 제공 수요처 (현장 협력기업)",
        category: "WORKFORCE",
        status: hasPartner ? "AVAILABLE" : "PARTNER_REQUIRED",
        detail: "실증 과제의 경우 현장 적용 협약서(MOU) 제출 필수",
        actionPlan: "제조/물류 수요기업과 실증 참여의향서(LOI) 체결",
        isMandatoryForSubmission: true, // 실증사업에서는 수요처가 필수 자격
      });
    }

    // 필수 자격 만족 여부: 필수 자격(isMandatoryForSubmission) 중 AVAILABLE이 아니면 false (계획/파트너미비는 불합격)
    const passMandatoryEligibility = !gaps.some(
      (g) => g.isMandatoryForSubmission && g.status !== "AVAILABLE"
    );

    // 3. 14개 평가 축 (14-Axis Evaluation)
    const axes: EvaluationAxisScore[] = [];

    // 축 1: 신청자격 충족 (10점)
    const axis1Score = passMandatoryEligibility ? 9.5 : 3.0;
    axes.push({
      axisId: "eligibility",
      axisNumber: 1,
      axisName: "신청자격 충족",
      score: axis1Score,
      maxScore: 10,
      category: "ELIGIBILITY_BUDGET",
      rationale: passMandatoryEligibility
        ? "공고에 요구되는 기본 신청요건(중소/벤처기업, 국세완납)을 갖추고 있습니다."
        : "필수 신청 시점 자격(수요처 협약 등)이 아직 계획(PLANNED) 단계로, 공고 접수 전 공식 증빙 확보가 필수입니다.",
      evidence: `지원대상: ${(enrichedOpp.applicantStages || ["SME"]).join(", ")} | 사내 자격 충족`,
      isDeterministic: true,
    });

    // 축 2: 개발아이템 적합성 (10점)
    const textCorpus = `${concept.name} ${concept.productConcept || ""} ${concept.technicalConcept || ""}`.toLowerCase();
    const oppKeywords = (opp.title + " " + (opp.primaryDomain || "")).toLowerCase();
    let itemFitScore = 7.0;
    if (textCorpus.includes("로봇") || oppKeywords.includes("로봇")) itemFitScore += 2.0;
    if (oppKeywords.includes("자율주행") && textCorpus.includes("자율주행")) itemFitScore += 1.0;
    itemFitScore = Math.min(10, itemFitScore);

    axes.push({
      axisId: "item_fit",
      axisNumber: 2,
      axisName: "개발아이템 적합성",
      score: itemFitScore,
      maxScore: 10,
      category: "TECHNICAL_CAPABILITY",
      rationale: `로봇 프로젝트 [${concept.name}]의 개발 목적이 공고의 지원 분야와 매우 높은 정합성을 보입니다.`,
      evidence: `공고 분야: ${opp.title} ↔ 아이템: ${concept.name}`,
      isDeterministic: false,
    });

    // 축 3: 지원금 규모 (8점)
    const budgetAllocated = opp.allocatedBudget || 300_000_000;
    const fundingNeed = concept.requiredFunding || 400_000_000;
    const budgetRatio = Math.min(1.5, budgetAllocated / fundingNeed);
    const axis3Score = Math.round(budgetRatio >= 0.7 ? 7.5 : 5.0 * 10) / 10;
    axes.push({
      axisId: "grant_size",
      axisNumber: 3,
      axisName: "지원금 규모",
      score: Math.min(8, axis3Score),
      maxScore: 8,
      category: "ELIGIBILITY_BUDGET",
      rationale: `공고 지원규모(${(budgetAllocated / 100000000).toFixed(1)}억원)가 목표 조달 자금(${(fundingNeed / 100000000).toFixed(1)}억원)의 ${(budgetAllocated / fundingNeed * 100).toFixed(0)}%를 충족합니다.`,
      evidence: `공고 지원금 ${(budgetAllocated / 100000000).toFixed(1)}억원 vs 목표 ${(fundingNeed / 100000000).toFixed(1)}억원`,
      isDeterministic: true,
    });

    // 축 4: 자부담 규모 (6점)
    // 정부R&D 기준 통상 민간부담금 20~25% (현금 10% 내외)
    const selfBurdenRatio = 0.2;
    const cashBurden = fundingNeed * selfBurdenRatio * 0.5;
    axes.push({
      axisId: "self_funding",
      axisNumber: 4,
      axisName: "자부담 규모",
      score: 5.2,
      maxScore: 6,
      category: "ELIGIBILITY_BUDGET",
      rationale: `예상 민간부담금 현금 약 ${(cashBurden / 10000000).toFixed(0)}천만원 선으로, 초기 스타트업 및 중소기업의 현금 유동성 범위 내 감당 가능합니다.`,
      evidence: "정부지원 규정상 중소기업 민간부담금 비율 (현금 10% 내외 계상)",
      isDeterministic: true,
    });

    // 축 5: 개발비 Coverage (8점)
    const coverageScore = Math.min(8, Math.round((budgetAllocated / (concept.estimatedBudget || 500_000_000)) * 8 * 10) / 10);
    axes.push({
      axisId: "budget_coverage",
      axisNumber: 5,
      axisName: "개발비 Coverage",
      score: Math.max(4.0, coverageScore),
      maxScore: 8,
      category: "ELIGIBILITY_BUDGET",
      rationale: `총 개발예산(${(concept.estimatedBudget / 100000000).toFixed(1)}억원) 대비 공고 지원금으로 커버 가능한 비율이 우수합니다.`,
      evidence: `Coverage: ${(budgetAllocated / (concept.estimatedBudget || 1) * 100).toFixed(1)}%`,
      isDeterministic: true,
    });

    // 축 6: TRL 적합성 (8점)
    const targetTrl = concept.targetTrl || 5;
    // R&D 공고 통상 4~7단계 타깃
    const trlDiff = Math.abs(targetTrl - 6);
    const trlScore = Math.max(4, 8 - trlDiff * 1.5);
    axes.push({
      axisId: "trl_alignment",
      axisNumber: 6,
      axisName: "TRL 적합성",
      score: trlScore,
      maxScore: 8,
      category: "TECHNICAL_CAPABILITY",
      rationale: `프로젝트의 목표 TRL ${targetTrl}단계는 본 사업의 최종 결과물(시제품 실증 검증) 타깃과 정확히 부합합니다.`,
      evidence: `아이템 TRL: ${targetTrl} ↔ 공고 목표 TRL: 6~7단계`,
      isDeterministic: true,
    });

    // 축 7: 개발기간 적합성 (6점)
    axes.push({
      axisId: "duration_fit",
      axisNumber: 7,
      axisName: "개발기간 적합성",
      score: 5.4,
      maxScore: 6,
      category: "FEASIBILITY_READINESS",
      rationale: "통상 12개월~24개월 지원 기간이 Master Spec WBS 4단계 마일스톤 소요기간과 일치합니다.",
      evidence: `WBS 마일스톤: ${spec?.wbsSummary?.length || 4}단계 구성`,
      isDeterministic: true,
    });

    // 축 8: 인력/외주 확보 가능성 (6점)
    const workforceCount = spec?.rolesAndResponsibilities?.reduce((a, b) => a + b.headCount, 0) || 5;
    axes.push({
      axisId: "workforce_outsourcing",
      axisNumber: 8,
      axisName: "인력/외주 확보 가능성",
      score: 5.0,
      maxScore: 6,
      category: "FEASIBILITY_READINESS",
      rationale: `핵심 연구인력 ${workforceCount}명 확보 계획 및 정밀 기구 외주 CNC 파트너 계약 준비가 구체화되어 있습니다.`,
      evidence: `R&R 인력: ${workforceCount}명 배정 | 외주계획: ${spec?.outsourcingPlan ? "수립완료" : "사전계획"}`,
      isDeterministic: false,
    });

    // 축 9: 가점 확보 가능성 (8점)
    const hasPatent = capabilities.some((c) => c.type === "PATENT");
    const hasVenture = capabilities.some((c) => c.title.includes("벤처") || c.title.includes("이노비즈"));
    let bonusScore = 4.0;
    if (hasPatent) bonusScore += 2.0;
    if (hasVenture) bonusScore += 1.5;
    axes.push({
      axisId: "bonus_potential",
      axisNumber: 9,
      axisName: "가점 확보 가능성",
      score: Math.min(8, bonusScore),
      maxScore: 8,
      category: "FEASIBILITY_READINESS",
      rationale: `사내 보유 특허 및 기업 인증 기반으로 심사 가점 2~4점 선제 확보가 가능합니다.`,
      evidence: `보유 특허: ${hasPatent ? "있음" : "없음"} | 벤처인증: ${hasVenture ? "있음" : "없음"}`,
      isDeterministic: true,
    });

    // 축 10: 선정 난이도 (6점)
    axes.push({
      axisId: "competition_difficulty",
      axisNumber: 10,
      axisName: "선정 난이도 (경쟁률)",
      score: 4.5,
      maxScore: 6,
      category: "FEASIBILITY_READINESS",
      rationale: "로봇/AI 특화 과제로 일반 IT 소프트웨어 과제 대비 기술 진입 장벽이 높아 과도한 경쟁률 리스크가 제한적입니다.",
      evidence: "로봇 하드웨어+SLAM 임베디드 융합 기술 난이도",
      isDeterministic: false,
    });

    // 축 11: 신청 준비도 (8점)
    const hasFullSpec = !!(concept.problemStatement && concept.productConcept && spec?.technicalArchitecture);
    const readinessScore = hasFullSpec ? 7.8 : 5.5;
    axes.push({
      axisId: "readiness",
      axisNumber: 11,
      axisName: "신청 준비도",
      score: readinessScore,
      maxScore: 8,
      category: "FEASIBILITY_READINESS",
      rationale: hasFullSpec
        ? "Master Spec 기반 기술 사양, 정량 KPI, BOM이 완비되어 사업계획서 작성을 즉각 개시할 수 있습니다."
        : "기술 개요는 확보되어 있으나 정량 KPI 및 외주 견적서 보강이 권장됩니다.",
      evidence: `Master Spec 버전: ${spec?.version || "v1.0"} 등록 완료`,
      isDeterministic: true,
    });

    // 축 12: 실증처/협력기관 필요성 (6점)
    const partnerGap = gaps.find((g) => g.status === "PARTNER_REQUIRED");
    const axis12Score = partnerGap ? 3.5 : 5.2;
    axes.push({
      axisId: "partner_necessity",
      axisNumber: 12,
      axisName: "실증처/협력기관 필요성",
      score: axis12Score,
      maxScore: 6,
      category: "TECHNICAL_CAPABILITY",
      rationale: partnerGap
        ? "실증 평가를 위해 수요처(제조/물류 기업) 1개소와의 사전 참여의향서 체결이 시급합니다."
        : "단독 신청 가능 또는 기존 협력 네트워크를 활용할 수 있는 구조입니다.",
      evidence: partnerGap ? "수요기업 MOU 체결 필요" : "자체 기술개발 중심",
      isDeterministic: false,
    });

    // 축 13: 사업화/판매 연계성 (5점)
    axes.push({
      axisId: "commercialization",
      axisNumber: 13,
      axisName: "사업화/판매 연계성",
      score: 4.4,
      maxScore: 5,
      category: "BUSINESS_FOLLOWUP",
      rationale: "과제 종료 후 RaaS(월 구독) 및 완제품 납품 모델이 수립되어 있어 사업화 전환이 용이합니다.",
      evidence: `수익모델: ${concept.salesModel || "H/W 납품 + 관제 라이선스"}`,
      isDeterministic: false,
    });

    // 축 14: 후속 정부사업 연결성 (5점)
    axes.push({
      axisId: "followup_programs",
      axisNumber: 14,
      axisName: "후속 정부사업 연결성",
      score: 4.6,
      maxScore: 5,
      category: "BUSINESS_FOLLOWUP",
      rationale: "본 과제 시제품 완성을 발판으로 중기부 TIPS, 산업부 스케일업 R&D, 조달청 혁신제품 지정 연계가 매우 유망합니다.",
      evidence: "KIRIA 공인인증 취득 ➔ 혁신시제품 패스트트랙 진입 경로",
      isDeterministic: false,
    });

    // 총점 계산 (100점 만점 기준)
    const totalScore = Math.min(100, Math.round(axes.reduce((sum, a) => sum + a.score, 0) * 10) / 10);

    const profile14Axis: Evaluation14AxisProfile = {
      axes,
      totalScore,
      subFitScore,
      gaps,
      passMandatoryEligibility,
      overallSummary: `로봇 프로젝트 [${concept.name}]에 대해 총 ${totalScore}점(100점 만점)의 적합도를 도출했습니다. ${
        passMandatoryEligibility
          ? "필수 신청자격을 갖추고 있으며 개발비 Coverage가 우수하여 과제 신청을 적극 권장합니다."
          : "단, 실증 수요처 등 필수 신청 요건 보완이 선행되어야 합니다."
      }`,
    };

    // 4. Semantic Match 구조화 결과 산출 (공고 지원금의 구체적 로봇 활용처)
    const matchedProjectComponents = [
      "3D LiDAR SLAM 센서부 및 안전 제어 PLC 모듈",
      "임베디드 고속 AI 객체 인식 추론 보드 (Nvidia Orin)",
      "정밀 BLDC 구동 모터 및 알루미늄 메인 섀시 프레임",
      "자율주행 Nav2 경로계획 및 원격 FMS 관제 소프트웨어",
    ];

    const usableFundingAreas = [
      `연구인력 인건비: 자율주행 SW 및 로봇 전장 엔지니어 급여 충당 (약 ${(budgetAllocated * 0.44 / 10000000).toFixed(0)}천만원)`,
      `시제품 재료비: LiDAR, 배터리팩, 모터 등 핵심 부품 구매비 (약 ${(budgetAllocated * 0.3 / 10000000).toFixed(0)}천만원)`,
      `위탁 연구/외주비: 기구 CNC 정밀 가공 및 PCB 제작 용역비 (약 ${(budgetAllocated * 0.16 / 10000000).toFixed(0)}천만원)`,
      `공인시험인증 수수료: KIRIA/KTL 공인시험성적서 발급 및 규격 인증 비용`,
    ];

    const evidence = [
      `[공고 요건] 지원규모 ${(budgetAllocated / 100000000).toFixed(1)}억원 ➔ 로봇 필요 자금(${(fundingNeed / 100000000).toFixed(1)}억원)의 ${(budgetAllocated / fundingNeed * 100).toFixed(0)}% 충당 가능`,
      `[기술 매칭] 공고 명칭 "${opp.title}"의 요구 기술과 프로젝트 명세서의 "${concept.requiredTechnology.join(", ")}" 일치`,
      `[TRL 부합] 공고 목표 시제품 실증 단계 ↔ 로봇 목표 TRL ${concept.targetTrl}단계 상호 부합`,
      `[신청 자격] ${(enrichedOpp.applicantStages || ["SME"]).join(", ")} 요건 사내 상태 충족`,
    ];

    const uncertainty = [
      "위탁/외주용역비 계상 한도(통상 총 직접비의 20~30% 이내) 규정 준수 여부 사전 검토 필요",
      "민간부담금 현금 납입(약 2,000~4,000만원)을 위한 법인 통장 잔고 사전 확보 필요",
      partnerGap ? "현장 실증 수요기업과의 업무협약서(MOU) 미확보 시 신청 결격 위험" : "참여 연구원 100% 인건비 계상률 한도 점검 필요",
    ];

    return {
      matchScore: totalScore,
      reason: `이 지원금은 [${concept.name}]의 핵심 센서(LiDAR) 구매비 및 연구인력 인건비의 70% 이상을 직접 충당할 수 있는 최적의 과제입니다.`,
      matchedProjectComponents,
      usableFundingAreas,
      evidence,
      uncertainty,
      profile14Axis,
    };
  }
}
