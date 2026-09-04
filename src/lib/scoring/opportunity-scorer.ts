import { Capability } from "@/types/capability";
import { EligibilityGateResult } from "@/types/eligibility";
import {
  DEFAULT_SCORE_WEIGHTS,
  OpportunityScoreResult,
  ScoreBreakdownItem,
  ScoreWeights,
} from "@/types/scoring";

export interface OpportunityScoringInput {
  id: string;
  title: string;
  primaryDomain: string; // "ROBOT", "AUTOMATION_HARDWARE", "AI_ICT", "GENERAL"
  allocatedBudget?: number | null;
  submissionDeadline?: string;
  rawText?: string;
}

export class OpportunityScorer {
  /**
   * Deterministic Opportunity Score Calculator.
   * STRICT PRINCIPLE:
   * 1. No AI Hallucinated Numbers (pure deterministic formula).
   * 2. This is NOT a "Win Probability" (it is an opportunity readiness & fit index).
   */
  public static calculate(
    opportunity: OpportunityScoringInput,
    capabilities: Capability[],
    eligibility: EligibilityGateResult,
    weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS,
    currentDate: Date = new Date()
  ): OpportunityScoreResult {
    const breakdown: ScoreBreakdownItem[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // 1. Technical Fit (Max: weights.technicalWeight = 25)
    let techRatio = 0.5; // baseline
    const techCaps = capabilities.filter((c) => c.type === "TECHNOLOGY");
    const oppText = `${opportunity.title} ${opportunity.rawText || ""}`.toLowerCase();

    const techMatches = techCaps.filter((t) => {
      const kw = t.title.toLowerCase();
      return oppText.includes(kw) || kw.split(" ").some((w) => w.length > 2 && oppText.includes(w));
    });

    if (techMatches.length >= 2) {
      techRatio = 1.0;
      strengths.push(`사내 보유 기술(${techMatches.map((t) => t.title).join(", ")})과 공고 요구기술 일치`);
    } else if (techMatches.length === 1) {
      techRatio = 0.8;
      strengths.push(`핵심 기술(${techMatches[0].title}) 보유 확인`);
    } else if (techCaps.length > 0) {
      techRatio = 0.6;
    } else {
      techRatio = 0.3;
      weaknesses.push("공모 요구기술과 직접 매칭되는 사내 보유기술 등록 부족");
    }

    const technicalScore = Math.round(techRatio * weights.technicalWeight * 10) / 10;
    breakdown.push({
      category: "TECHNICAL_FIT",
      label: "기술 적합도 (Technical Fit)",
      score: technicalScore,
      maxScore: weights.technicalWeight,
      weight: weights.technicalWeight,
      reason: `보유기술 매칭 ${techMatches.length}건 확인 (가중치 ${weights.technicalWeight}점 만점 중 ${technicalScore}점)`,
    });

    // 2. Strategic Fit (Max: weights.strategicWeight = 20)
    let stratRatio = 0.5;
    if (opportunity.primaryDomain === "ROBOT") {
      stratRatio = 1.0;
      strengths.push("회사 1순위 핵심 도메인(로봇) 공모 사업");
    } else if (opportunity.primaryDomain === "AUTOMATION_HARDWARE") {
      stratRatio = 0.85;
      strengths.push("2순위 연계 도메인(자동화/하드웨어) 공모 사업");
    } else if (opportunity.primaryDomain === "AI_ICT") {
      stratRatio = 0.7;
    } else {
      stratRatio = 0.4;
      weaknesses.push("로봇/자동화 외 일반 공모로 전략적 우선순위 낮음");
    }

    const strategicScore = Math.round(stratRatio * weights.strategicWeight * 10) / 10;
    breakdown.push({
      category: "STRATEGIC_FIT",
      label: "전략적 적합도 (Strategic Fit)",
      score: strategicScore,
      maxScore: weights.strategicWeight,
      weight: weights.strategicWeight,
      reason: `도메인 분류: ${opportunity.primaryDomain} (가중치 ${weights.strategicWeight}점 만점 중 ${strategicScore}점)`,
    });

    // 3. Capability Fit (Max: weights.capabilityWeight = 20)
    const patents = capabilities.filter((c) => c.type === "PATENT");
    const certs = capabilities.filter((c) => c.type === "CERTIFICATION" && c.verificationStatus !== "EXPIRED");
    const projects = capabilities.filter((c) => c.type === "PROJECT_HISTORY");

    let capScore = 0;
    // Patents (up to 5 pts)
    capScore += Math.min(patents.length * 2.5, 5);
    // Certs (up to 5 pts)
    capScore += Math.min(certs.length * 2.5, 5);
    // Projects (up to 10 pts)
    capScore += Math.min(projects.length * 5, 10);

    const capabilityScore = Math.min(capScore, weights.capabilityWeight);
    if (projects.length > 0) {
      strengths.push(`유사 공공/민간 프로젝트 수행실적 ${projects.length}건 보유`);
    } else {
      weaknesses.push("등록된 유사 프로젝트 수행실적 없음 (가점 증빙 보완 필요)");
    }
    if (certs.length > 0) {
      strengths.push(`유효 인증서(${certs.map((c) => c.title).join(", ")}) 보유`);
    }

    breakdown.push({
      category: "CAPABILITY_FIT",
      label: "역량 보유도 (Capability Fit)",
      score: capabilityScore,
      maxScore: weights.capabilityWeight,
      weight: weights.capabilityWeight,
      reason: `특허 ${patents.length}건, 인증 ${certs.length}건, 실적 ${projects.length}건 기반 산출`,
    });

    // 4. Evidence Readiness (Max: weights.evidenceWeight = 15)
    const capsWithEvidence = capabilities.filter((c) => c.evidenceStoragePath || c.evidenceFileName);
    const evidenceRatio = capabilities.length > 0 ? capsWithEvidence.length / capabilities.length : 0.4;
    const evidenceScore = Math.round(evidenceRatio * weights.evidenceWeight * 10) / 10;

    if (evidenceRatio >= 0.7) {
      strengths.push("사내 역량 증빙 파일(특허증, 실적증명원 등) 준비 양호");
    } else {
      weaknesses.push("일부 사내 역량 자산의 증빙 파일 첨부 누락");
    }

    breakdown.push({
      category: "EVIDENCE_READINESS",
      label: "증빙 준비도 (Evidence Readiness)",
      score: evidenceScore,
      maxScore: weights.evidenceWeight,
      weight: weights.evidenceWeight,
      reason: `증빙 서류 등록률 ${Math.round(evidenceRatio * 100)}% (${capsWithEvidence.length}/${capabilities.length})`,
    });

    // 5. Financial Fit (Max: weights.financialWeight = 10)
    const budget = opportunity.allocatedBudget || 0;
    let finRatio = 0.5;
    if (budget >= 300000000) {
      finRatio = 1.0;
      strengths.push("3억원 이상의 대형 사업비 배정");
    } else if (budget >= 100000000) {
      finRatio = 0.8;
    } else if (budget > 0) {
      finRatio = 0.6;
    } else {
      finRatio = 0.5; // budget unknown
    }

    const financialScore = Math.round(finRatio * weights.financialWeight * 10) / 10;
    breakdown.push({
      category: "FINANCIAL_FIT",
      label: "예산/재무 적합도 (Financial Fit)",
      score: financialScore,
      maxScore: weights.financialWeight,
      weight: weights.financialWeight,
      reason: budget > 0 ? `배정예산: ${(budget / 100000000).toFixed(1)}억원` : "예산 미공시 (기본점 적용)",
    });

    // 6. Schedule Readiness (Max: weights.scheduleWeight = 10)
    let schedRatio = 0.5;
    let daysLeft = 14;

    if (opportunity.submissionDeadline) {
      const deadline = new Date(opportunity.submissionDeadline);
      const diffMs = deadline.getTime() - currentDate.getTime();
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysLeft >= 14) {
        schedRatio = 1.0;
        strengths.push(`제출 마감까지 D-${daysLeft}일 (제안서 작성 기간 충분)`);
      } else if (daysLeft >= 7) {
        schedRatio = 0.7;
      } else if (daysLeft >= 3) {
        schedRatio = 0.4;
        weaknesses.push(`제출 마감까지 D-${daysLeft}일 (촉박한 일정)`);
      } else {
        schedRatio = 0.1;
        weaknesses.push(`마감 D-${daysLeft}일 임박 (긴급 작성 필요)`);
      }
    }

    const scheduleScore = Math.round(schedRatio * weights.scheduleWeight * 10) / 10;
    breakdown.push({
      category: "SCHEDULE_READINESS",
      label: "일정 준비도 (Schedule Readiness)",
      score: scheduleScore,
      maxScore: weights.scheduleWeight,
      weight: weights.scheduleWeight,
      reason: `마감 잔여기간: ${daysLeft > 0 ? `D-${daysLeft}일` : "마감 초과"}`,
    });

    // 7. Risk Penalty
    let riskPenalty = 0;
    if (eligibility.overallStatus === "FAIL") {
      riskPenalty += 30; // severe penalty for eligibility fail
      weaknesses.push("지원자격 불충족(FAIL) 항목 존재");
    } else if (eligibility.unknownCount > 0) {
      riskPenalty += 10;
      weaknesses.push(`확인되지 않은 지원자격 요건 ${eligibility.unknownCount}건 존재`);
    }

    if (daysLeft < 5 && daysLeft >= 0) {
      riskPenalty += 5;
    }

    // Total Score Calculation (Clamped 0 ~ 100)
    const rawTotal =
      technicalScore +
      strategicScore +
      capabilityScore +
      evidenceScore +
      financialScore +
      scheduleScore -
      riskPenalty;

    const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

    // Recommendation logic
    let recommendation: OpportunityScoreResult["recommendation"] = "HOLD";

    if (eligibility.overallStatus === "FAIL" || totalScore < 50) {
      recommendation = "NO_GO";
    } else if (totalScore >= 80 && eligibility.overallStatus === "PASS") {
      recommendation = "GO";
    } else if (totalScore >= 65 && (eligibility.overallStatus === "PASS" || eligibility.overallStatus === "REVIEW_REQUIRED")) {
      recommendation = "GO_WITH_CONDITIONS";
    } else {
      recommendation = "HOLD";
    }

    const rationale = `RoboBid 기회점수 ${totalScore}점. 기술적합도(${technicalScore}점) 및 전략분야(${strategicScore}점)를 종합 반영하였으며, 추천 의사결정은 '${recommendation}'입니다. (주의: 본 점수는 수주 확률이 아닌 기회 적합성 지표입니다)`;

    return {
      opportunityId: opportunity.id,
      totalScore,
      technicalFit: technicalScore,
      strategicFit: strategicScore,
      capabilityFit: capabilityScore,
      evidenceReadiness: evidenceScore,
      financialFit: financialScore,
      scheduleReadiness: scheduleScore,
      riskPenalty,
      breakdown,
      recommendation,
      strengths,
      weaknesses,
      rationale,
      calculatedAt: currentDate.toISOString(),
    };
  }
}
