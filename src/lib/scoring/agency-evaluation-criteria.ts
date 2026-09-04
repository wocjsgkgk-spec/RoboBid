import { Capability } from "@/types/capability";
import { PublicAgencyType } from "../proposals/agency-templates";

export interface BonusPointItem {
  id: string;
  category: string;
  name: string;
  description: string;
  maxPoints: number;
  awardedPoints: number;
  isEligible: boolean;
  matchedEvidence?: string;
  agencyApplicability: PublicAgencyType[];
}

export interface AgencyEvaluationResult {
  agencyType: PublicAgencyType;
  agencyName: string;
  totalBonusPoints: number;
  maxAllowableBonus: number;
  effectiveBonusPoints: number; // Clamped by max allowable limit (typically 5.0 points)
  bonusItems: BonusPointItem[];
  evaluationSummary: string;
  technicalWeight: number; // e.g. 80%
  priceWeight: number; // e.g. 20%
}

export class AgencyEvaluationService {
  /**
   * Evaluates legal bonus points against the company's Capability Vault assets.
   */
  public static evaluateAgencyBonus(
    agencyType: PublicAgencyType,
    capabilities: Capability[]
  ): AgencyEvaluationResult {
    const isVenture = capabilities.some(
      (c) =>
        c.type === "CERTIFICATION" &&
        (c.title.includes("벤처기업") || c.description?.includes("벤처기업")) &&
        c.verificationStatus === "VERIFIED"
    );

    const isInnobiz = capabilities.some(
      (c) =>
        c.type === "CERTIFICATION" &&
        (c.title.includes("이노비즈") || c.title.includes("Inno-Biz") || c.title.includes("메인비즈")) &&
        c.verificationStatus === "VERIFIED"
    );

    const hasResearchLab = capabilities.some(
      (c) =>
        c.type === "CERTIFICATION" &&
        (c.title.includes("기업부설연구소") || c.title.includes("연구전담부서")) &&
        c.verificationStatus === "VERIFIED"
    );

    const validPatents = capabilities.filter(
      (c) => c.type === "PATENT" && c.verificationStatus === "VERIFIED"
    );

    const isRegionalSme = capabilities.some(
      (c) =>
        c.type === "COMPANY_PROFILE" &&
        c.metadata?.headquartersRegion &&
        !c.metadata.headquartersRegion.includes("서울") &&
        !c.metadata.headquartersRegion.includes("경기")
    );

    const bonusItems: BonusPointItem[] = [
      {
        id: "BONUS_VENTURE",
        category: "혁신형 기업 인증",
        name: "벤처기업 확인",
        description: "벤처기업육성에 관한 특별조치법에 따른 벤처기업 인증 보유 기업",
        maxPoints: 1.0,
        awardedPoints: isVenture ? 1.0 : 0,
        isEligible: isVenture,
        matchedEvidence: isVenture ? "벤처기업 확인서 (혁신성장유형)" : undefined,
        agencyApplicability: ["KONEPS", "NIPA_NIA", "TIPA_MSS", "IRIS_RND"],
      },
      {
        id: "BONUS_INNOBIZ",
        category: "기술 인증",
        name: "기술혁신형 중소기업(Inno-Biz)",
        description: "중소벤처기업부 지정 이노비즈 또는 경영혁신형 메인비즈 인증 보유",
        maxPoints: 1.0,
        awardedPoints: isInnobiz ? 1.0 : 0,
        isEligible: isInnobiz,
        matchedEvidence: isInnobiz ? "기술혁신형 중소기업(Inno-Biz) 인증서 (A등급)" : undefined,
        agencyApplicability: ["KONEPS", "NIPA_NIA", "TIPA_MSS", "IRIS_RND"],
      },
      {
        id: "BONUS_RESEARCH_LAB",
        category: "연구개발 역량",
        name: "기업부설연구소 또는 전담부서 인정",
        description: "한국산업기술진흥협회(KOITA) 공인 기업부설연구소 보유",
        maxPoints: 1.0,
        awardedPoints: hasResearchLab ? 1.0 : 0,
        isEligible: hasResearchLab,
        matchedEvidence: hasResearchLab ? "기업부설연구소 인정서 (KOITA)" : undefined,
        agencyApplicability: ["NIPA_NIA", "TIPA_MSS", "IRIS_RND"],
      },
      {
        id: "BONUS_PATENTS",
        category: "지식재산권(IP)",
        name: "등록 특허 보유 (최근 3년 이내)",
        description: "과제 관련 분야 공인 등록 특허 보유 (건당 0.5점, 최대 1.5점)",
        maxPoints: 1.5,
        awardedPoints: Math.min(validPatents.length * 0.5, 1.5),
        isEligible: validPatents.length > 0,
        matchedEvidence: validPatents.length > 0 ? `등록 특허 ${validPatents.length}건 보유 확인` : undefined,
        agencyApplicability: ["KONEPS", "NIPA_NIA", "TIPA_MSS", "IRIS_RND"],
      },
      {
        id: "BONUS_REGIONAL",
        category: "지역 균형발전",
        name: "비수도권(지방) 소재 기업 우대",
        description: "본사 소재지가 서울/경기/인천 외 비수도권 지역에 위치한 중소기업",
        maxPoints: 1.0,
        awardedPoints: isRegionalSme ? 1.0 : 0,
        isEligible: isRegionalSme,
        matchedEvidence: isRegionalSme ? "지방 소재 사업자등록증명원" : undefined,
        agencyApplicability: ["NIPA_NIA", "TIPA_MSS"],
      },
    ];

    // Filter items applicable to this agency
    const applicableItems = bonusItems.filter((item) =>
      item.agencyApplicability.includes(agencyType)
    );

    const totalCalculated = applicableItems.reduce((acc, cur) => acc + cur.awardedPoints, 0);
    const maxAllowable = agencyType === "KONEPS" ? 3.0 : 5.0;
    const effectiveBonus = Math.min(totalCalculated, maxAllowable);

    let agencyName = "조달청 나라장터";
    let technicalWeight = 80;
    let priceWeight = 20;

    if (agencyType === "NIPA_NIA") {
      agencyName = "NIPA / NIA (AI·ICT 바우처)";
      technicalWeight = 85;
      priceWeight = 15;
    } else if (agencyType === "TIPA_MSS") {
      agencyName = "중기부 / TIPA (중소기업 R&D)";
      technicalWeight = 90;
      priceWeight = 10;
    } else if (agencyType === "IRIS_RND") {
      agencyName = "범부처 IRIS (국가 R&D)";
      technicalWeight = 90;
      priceWeight = 10;
    }

    const eligibleCount = applicableItems.filter((i) => i.isEligible).length;

    return {
      agencyType,
      agencyName,
      totalBonusPoints: totalCalculated,
      maxAllowableBonus: maxAllowable,
      effectiveBonusPoints: effectiveBonus,
      bonusItems: applicableItems,
      evaluationSummary: `적용 가능 가점 ${applicableItems.length}개 항목 중 ${eligibleCount}개 충족, 유효 가점 +${effectiveBonus.toFixed(1)}점 확보 (상한 ${maxAllowable.toFixed(1)}점)`,
      technicalWeight,
      priceWeight,
    };
  }
}
