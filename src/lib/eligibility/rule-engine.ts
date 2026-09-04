import { Capability, CompanyProfileMetadata, FinancialProfileMetadata } from "@/types/capability";
import { RequirementCandidate } from "@/types/document";
import { EligibilityCheckItem, EligibilityGateResult, EligibilityStatus } from "@/types/eligibility";

export interface OpportunityEligibilityInput {
  id: string;
  title: string;
  announcingAgency: string;
  requirements: RequirementCandidate[];
  rawText?: string;
  submissionDeadline?: string;
}

export class EligibilityRuleEngine {
  /**
   * Deterministic Eligibility Gate Evaluation.
   * Evaluates company capabilities against RFP requirements.
   * STRICT PRINCIPLE: UNKNOWN NEVER AUTOMATICALLY CONVERTS TO PASS!
   */
  public static evaluate(
    opportunity: OpportunityEligibilityInput,
    capabilities: Capability[],
    evaluationDate: Date = new Date()
  ): EligibilityGateResult {
    const checks: EligibilityCheckItem[] = [];

    // Find profile & metadata
    const profileCap = capabilities.find((c) => c.type === "COMPANY_PROFILE");
    const profileMeta = (profileCap?.metadata || {}) as Partial<CompanyProfileMetadata>;

    const financialCap = capabilities.find((c) => c.type === "FINANCIAL_PROFILE");
    const financialMeta = (financialCap?.metadata || {}) as Partial<FinancialProfileMetadata>;

    const certifications = capabilities.filter(
      (c) => c.type === "CERTIFICATION" && c.verificationStatus !== "EXPIRED"
    );
    const technologies = capabilities.filter((c) => c.type === "TECHNOLOGY");
    const projectHistories = capabilities.filter((c) => c.type === "PROJECT_HISTORY");

    // Gather RFP texts & requirements
    const rfpEligibilityReqs = opportunity.requirements.filter(
      (r) => r.category === "ELIGIBILITY"
    );
    const combinedRfpText = `${opportunity.title} ${rfpEligibilityReqs.map((r) => r.description).join(" ")} ${opportunity.rawText || ""}`.toLowerCase();

    // ------------------------------------------------------------------------
    // Rule 1: 업력 (Business Age)
    // ------------------------------------------------------------------------
    const age7Regex = /7년\s*이내|창업\s*7년|초기창업|도약기/i;
    const age3Regex = /3년\s*이내|초기\s*3년/i;
    const isAgeRestricted7 = age7Regex.test(combinedRfpText);
    const isAgeRestricted3 = age3Regex.test(combinedRfpText);

    if (isAgeRestricted7 || isAgeRestricted3) {
      const maxYears = isAgeRestricted3 ? 3 : 7;
      const matchedCitation = rfpEligibilityReqs.find((r) =>
        age7Regex.test(r.description) || age3Regex.test(r.description)
      );

      if (!profileMeta.establishedDate) {
        checks.push({
          ruleCode: "RULE-AGE",
          ruleName: `업력 제한 (${maxYears}년 이내)`,
          status: "UNKNOWN",
          rfpRequirement: `창업 ${maxYears}년 이내 기업 대상 공모`,
          rfpCitationSection: matchedCitation?.citationSection || "신청자격",
          rfpCitationQuote: matchedCitation?.citationQuote || `공고일 기준 업력 ${maxYears}년 이내`,
          reason: "사내 회사 프로필(설립일자)이 등록되지 않아 업력 적합성을 판정할 수 없습니다. (UNKNOWN)",
          isMandatory: true,
        });
      } else {
        const estDate = new Date(profileMeta.establishedDate);
        const ageYears =
          (evaluationDate.getTime() - estDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

        if (ageYears <= maxYears) {
          checks.push({
            ruleCode: "RULE-AGE",
            ruleName: `업력 제한 (${maxYears}년 이내)`,
            status: "PASS",
            rfpRequirement: `창업 ${maxYears}년 이내 기업`,
            rfpCitationSection: matchedCitation?.citationSection || "신청자격",
            rfpCitationQuote: matchedCitation?.citationQuote,
            matchedCapabilityId: profileCap?.id,
            matchedCapabilityTitle: `회사 설립일: ${profileMeta.establishedDate} (현재 업력 약 ${ageYears.toFixed(1)}년)`,
            reason: `회사 설립일(${profileMeta.establishedDate}) 기준 업력 약 ${ageYears.toFixed(1)}년으로 ${maxYears}년 이내 요건을 충족합니다.`,
            isMandatory: true,
          });
        } else {
          checks.push({
            ruleCode: "RULE-AGE",
            ruleName: `업력 제한 (${maxYears}년 이내)`,
            status: "FAIL",
            rfpRequirement: `창업 ${maxYears}년 이내 기업`,
            rfpCitationSection: matchedCitation?.citationSection || "신청자격",
            rfpCitationQuote: matchedCitation?.citationQuote,
            matchedCapabilityId: profileCap?.id,
            matchedCapabilityTitle: `회사 설립일: ${profileMeta.establishedDate}`,
            reason: `회사 설립일(${profileMeta.establishedDate}) 기준 업력 약 ${ageYears.toFixed(1)}년으로 최대 허용 기간(${maxYears}년)을 초과하여 부적격합니다.`,
            isMandatory: true,
          });
        }
      }
    }

    // ------------------------------------------------------------------------
    // Rule 2: 지역 제한 (Regional Restriction)
    // ------------------------------------------------------------------------
    const regions = [
      { name: "대구", pattern: /대구광역시|대구\s*소재/i },
      { name: "경북", pattern: /경상북도|경북\s*소재/i },
      { name: "서울", pattern: /서울특별시|서울\s*소재/i },
      { name: "경기", pattern: /경기도|경기\s*소재/i },
      { name: "부산", pattern: /부산광역시|부산\s*소재/i },
    ];

    for (const reg of regions) {
      if (reg.pattern.test(combinedRfpText)) {
        const matchedCitation = rfpEligibilityReqs.find((r) => reg.pattern.test(r.description));

        if (!profileMeta.headquartersRegion) {
          checks.push({
            ruleCode: `RULE-REGION-${reg.name}`,
            ruleName: `소재지 제한 (${reg.name})`,
            status: "UNKNOWN",
            rfpRequirement: `${reg.name} 지역 소재 기업`,
            rfpCitationSection: matchedCitation?.citationSection || "지역제한",
            rfpCitationQuote: matchedCitation?.citationQuote,
            reason: "회사 본사/연구소 소재지가 등록되지 않아 지역 적격성을 확인할 수 없습니다.",
            isMandatory: true,
          });
        } else if (profileMeta.headquartersRegion.includes(reg.name)) {
          checks.push({
            ruleCode: `RULE-REGION-${reg.name}`,
            ruleName: `소재지 제한 (${reg.name})`,
            status: "PASS",
            rfpRequirement: `${reg.name} 지역 소재 기업`,
            rfpCitationSection: matchedCitation?.citationSection || "지역제한",
            rfpCitationQuote: matchedCitation?.citationQuote,
            matchedCapabilityId: profileCap?.id,
            matchedCapabilityTitle: `본사 소재지: ${profileMeta.headquartersRegion}`,
            reason: `회사 소재지(${profileMeta.headquartersRegion})가 요구 지역(${reg.name})과 일치합니다.`,
            isMandatory: true,
          });
        } else {
          checks.push({
            ruleCode: `RULE-REGION-${reg.name}`,
            ruleName: `소재지 제한 (${reg.name})`,
            status: "FAIL",
            rfpRequirement: `${reg.name} 지역 소재 기업`,
            rfpCitationSection: matchedCitation?.citationSection || "지역제한",
            rfpCitationQuote: matchedCitation?.citationQuote,
            matchedCapabilityId: profileCap?.id,
            matchedCapabilityTitle: `본사 소재지: ${profileMeta.headquartersRegion}`,
            reason: `회사 소재지(${profileMeta.headquartersRegion})가 공고 요구 지역(${reg.name})과 불일치합니다.`,
            isMandatory: true,
          });
        }
        break; // check primary target region
      }
    }

    // ------------------------------------------------------------------------
    // Rule 3: 기업 규모 (Company Scale)
    // ------------------------------------------------------------------------
    if (/중소기업|스타트업|소상공인/i.test(combinedRfpText)) {
      const isSme = profileMeta.companyScale === "SME" || profileMeta.companyScale === "STARTUP";
      if (!profileMeta.companyScale) {
        checks.push({
          ruleCode: "RULE-SCALE",
          ruleName: "기업규모 적격성",
          status: "UNKNOWN",
          rfpRequirement: "중소기업기본법상 중소기업 또는 스타트업",
          reason: "회사 규모 정보(중소기업/스타트업 여부)가 등록되지 않았습니다.",
          isMandatory: true,
        });
      } else if (isSme) {
        checks.push({
          ruleCode: "RULE-SCALE",
          ruleName: "기업규모 적격성",
          status: "PASS",
          rfpRequirement: "중소기업기본법상 중소기업",
          matchedCapabilityId: profileCap?.id,
          matchedCapabilityTitle: `기업규모: ${profileMeta.companyScale}`,
          reason: `회사 규모(${profileMeta.companyScale})가 중소기업 지원 대상 요건에 부합합니다.`,
          isMandatory: true,
        });
      } else {
        checks.push({
          ruleCode: "RULE-SCALE",
          ruleName: "기업규모 적격성",
          status: "FAIL",
          rfpRequirement: "중소기업기본법상 중소기업",
          matchedCapabilityId: profileCap?.id,
          matchedCapabilityTitle: `기업규모: ${profileMeta.companyScale}`,
          reason: `등록된 기업규모(${profileMeta.companyScale})가 중소기업 지원 요건을 충족하지 않습니다.`,
          isMandatory: true,
        });
      }
    }

    // ------------------------------------------------------------------------
    // Rule 4: 재무 건전성 (자본잠식 배제)
    // ------------------------------------------------------------------------
    if (/자본잠식|재무건전|부채비율/i.test(combinedRfpText)) {
      if (!financialCap) {
        checks.push({
          ruleCode: "RULE-FINANCIAL",
          ruleName: "재무 건전성 (자본잠식 여부)",
          status: "REVIEW_REQUIRED",
          rfpRequirement: "완전자본잠식 또는 부실기업 참여 제한",
          reason: "등록된 최신 재무제표 프로필이 없어 회계사 검토가 필요합니다.",
          isMandatory: true,
        });
      } else if (financialMeta.capitalImpairment) {
        checks.push({
          ruleCode: "RULE-FINANCIAL",
          ruleName: "재무 건전성 (자본잠식 여부)",
          status: "FAIL",
          rfpRequirement: "자본잠식 기업 지원 제외",
          matchedCapabilityId: financialCap.id,
          reason: "최근 결산 기준 자본잠식이 기록되어 있어 공모 지원 결격 사유에 해당합니다.",
          isMandatory: true,
        });
      } else {
        checks.push({
          ruleCode: "RULE-FINANCIAL",
          ruleName: "재무 건전성 (자본잠식 여부)",
          status: "PASS",
          rfpRequirement: "자본잠식 배제",
          matchedCapabilityId: financialCap.id,
          reason: "최근 결산 기준 자본잠식 없음이 확인되었습니다.",
          isMandatory: true,
        });
      }
    }

    // ------------------------------------------------------------------------
    // Rule 5: 필수 인증 요구 (Mandatory Certification)
    // ------------------------------------------------------------------------
    const certPatterns = [
      { name: "이노비즈", pattern: /이노비즈|innobiz/i },
      { name: "벤처기업", pattern: /벤처기업|venture/i },
      { name: "메인비즈", pattern: /메인비즈|mainbiz/i },
      { name: "기업부설연구소", pattern: /기업부설연구소|연구전담부서/i },
    ];

    for (const cp of certPatterns) {
      if (cp.pattern.test(combinedRfpText) && /필수|보유\s*기업/i.test(combinedRfpText)) {
        const found = certifications.find((c) => cp.pattern.test(c.title));
        if (found) {
          checks.push({
            ruleCode: `RULE-CERT-${cp.name}`,
            ruleName: `필수 인증 보유 (${cp.name})`,
            status: "PASS",
            rfpRequirement: `${cp.name} 인증 보유`,
            matchedCapabilityId: found.id,
            matchedCapabilityTitle: found.title,
            reason: `유효한 ${cp.name} 인증(${found.title})을 보유하고 있습니다.`,
            isMandatory: true,
          });
        } else {
          checks.push({
            ruleCode: `RULE-CERT-${cp.name}`,
            ruleName: `필수 인증 보유 (${cp.name})`,
            status: "FAIL",
            rfpRequirement: `${cp.name} 인증 보유 필수`,
            reason: `공모에서 요구하는 ${cp.name} 유효 인증이 사내 역량 저장소에 존재하지 않습니다.`,
            isMandatory: true,
          });
        }
      }
    }

    // Default Baseline Check if no explicit restrictions found
    if (checks.length === 0) {
      checks.push({
        ruleCode: "RULE-GENERAL-ELIGIBILITY",
        ruleName: "일반 참가자격 검토",
        status: "REVIEW_REQUIRED",
        rfpRequirement: "공고문 참가자격 세부 확인 요망",
        reason: "명시적인 자동 판정 룰 키워드가 감지되지 않아 담당자의 공고 원문 수동 검토가 필요합니다.",
        isMandatory: false,
      });
    }

    // ------------------------------------------------------------------------
    // Final Overall Status Determination
    // ------------------------------------------------------------------------
    const passCount = checks.filter((c) => c.status === "PASS").length;
    const failCount = checks.filter((c) => c.status === "FAIL").length;
    const reviewCount = checks.filter((c) => c.status === "REVIEW_REQUIRED").length;
    const unknownCount = checks.filter((c) => c.status === "UNKNOWN").length;

    let overallStatus: EligibilityStatus = "PASS";

    if (failCount > 0) {
      overallStatus = "FAIL";
    } else if (unknownCount > 0) {
      // PRD Section 17 Locked Rule: UNKNOWN NEVER AUTOMATICALLY BECOMES PASS!
      overallStatus = "UNKNOWN";
    } else if (reviewCount > 0) {
      overallStatus = "REVIEW_REQUIRED";
    } else {
      overallStatus = "PASS";
    }

    const canProceedToBidDecision = overallStatus === "PASS" || overallStatus === "REVIEW_REQUIRED";

    return {
      opportunityId: opportunity.id,
      overallStatus,
      passCount,
      failCount,
      reviewRequiredCount: reviewCount,
      unknownCount,
      checks,
      canProceedToBidDecision,
      evaluatedAt: evaluationDate.toISOString(),
    };
  }
}
