/**
 * RoboBid AI — 조달청 적격심사 종합 모의 진단기 (QualificationEvaluator)
 * 조달청 물품구매 적격심사 세부기준 및 중소기업자간 경쟁제품 계약이행능력 심사기준 준용
 */

export type CreditRatingGrade =
  | "AAA"
  | "AA+"
  | "AA"
  | "AA-"
  | "A+"
  | "A"
  | "A-"
  | "BBB+"
  | "BBB"
  | "BBB-"
  | "BB+"
  | "BB"
  | "BB-"
  | "B+"
  | "B"
  | "B-"
  | "CCC+"
  | "CCC"
  | "D";

export interface SocialBonusItem {
  id: string;
  name: string;
  points: number;
  category: "BONUS" | "PENALTY";
  checked: boolean;
}

export interface QualificationEvaluationInput {
  targetEstimatedPrice: number;     // 공고 추정가격 (원)
  companyTrackRecordTotal: number;  // 사내 최근 3~5년 인정 실적 누계액 (원)
  creditRating: CreditRatingGrade;  // 신용평가등급
  passScoreThreshold?: number;      // 적격심사 통과 기준 점수 (기본 85점 or 95점)
  selectedBonuses?: string[];       // 선택된 신인도 가감점 ID 목록
  isConsortium?: boolean;           // 공동수급체(컨소시엄) 여부
  consortiumShareRatio?: number;    // 주관사 지분율 (%, e.g. 70)
}

export interface QualificationEvaluationResult {
  totalScore: number;               // 종합 평점 (100점 만점 기준 + 가감점)
  isPassed: boolean;                // 통과 여부 (totalScore >= threshold)
  passThreshold: number;            // 통과 기준선
  managementScore: number;          // 경영상태 점수 (30점 만점)
  trackRecordScore: number;         // 이행실적 점수 (70점 만점)
  trackRecordRatio: number;         // 추정가격 대비 실적 비율 (%)
  reliabilityBonusScore: number;    // 신인도 가감점 합산 (+-5점 한도)
  activeBonuses: { name: string; points: number }[];
  recommendations: string[];        // 감점 극복 및 보강 가이드
}

export class QualificationEvaluator {
  public static readonly DEFAULT_BONUS_ITEMS: Omit<SocialBonusItem, "checked">[] = [
    { id: "SME_CERT", name: "소기업·소상공인 확인서 보유", points: 1.5, category: "BONUS" },
    { id: "FEMALE_BIZ", name: "여성기업 확인서", points: 1.0, category: "BONUS" },
    { id: "DISABLED_BIZ", name: "장애인기업 확인서", points: 1.5, category: "BONUS" },
    { id: "SOCIAL_BIZ", name: "사회적기업 인증", points: 1.5, category: "BONUS" },
    { id: "NEW_TECH_NET", name: "신기술(NET) / 신제품(NEP) 인증", points: 1.5, category: "BONUS" },
    { id: "YOUTH_HIRING", name: "청년고용 우수기업", points: 1.0, category: "BONUS" },
    { id: "INNOBIZ", name: "이노비즈 / 메인비즈 / 벤처기업 인증", points: 1.0, category: "BONUS" },
    { id: "SANCTION_PENALTY", name: "최근 1~2년 내 부정당업자 제재 이력", points: -2.0, category: "PENALTY" },
  ];

  /**
   * 신용평가등급에 따른 경영상태 점수 (30점 만점) 환산
   */
  public static getManagementScore(grade: CreditRatingGrade): number {
    switch (grade) {
      case "AAA":
      case "AA+":
      case "AA":
      case "AA-":
      case "A+":
      case "A":
      case "A-":
      case "BBB+":
      case "BBB":
      case "BBB-":
        return 30.0;
      case "BB+":
        return 29.5;
      case "BB":
        return 29.0;
      case "BB-":
        return 28.5;
      case "B+":
        return 28.0;
      case "B":
        return 27.5;
      case "B-":
        return 27.0;
      case "CCC+":
      case "CCC":
        return 24.0;
      case "D":
      default:
        return 20.0;
    }
  }

  /**
   * 최근 3~5년 실적 누계 대비 추정가격 비율에 따른 실적 점수 (70점 만점)
   */
  public static getTrackRecordScore(
    trackRecordTotal: number,
    targetEstimatedPrice: number
  ): { score: number; ratio: number } {
    if (targetEstimatedPrice <= 0) {
      return { score: 70.0, ratio: 100.0 };
    }

    const ratio = Number(((trackRecordTotal / targetEstimatedPrice) * 100).toFixed(2));

    if (ratio >= 100.0) {
      return { score: 70.0, ratio };
    } else if (ratio >= 70.0) {
      return { score: 66.5, ratio };
    } else if (ratio >= 50.0) {
      return { score: 63.0, ratio };
    } else if (ratio >= 30.0) {
      return { score: 56.0, ratio };
    } else {
      return { score: 49.0, ratio };
    }
  }

  /**
   * 종합 적격심사 평가 실행
   */
  public static evaluate(input: QualificationEvaluationInput): QualificationEvaluationResult {
    const threshold = input.passScoreThreshold || 85.0;

    // 1. 경영상태 평가 (30점)
    const managementScore = this.getManagementScore(input.creditRating);

    // 2. 이행실적 평가 (70점)
    let effectiveTrackRecord = input.companyTrackRecordTotal;
    if (input.isConsortium && input.consortiumShareRatio) {
      effectiveTrackRecord = (input.companyTrackRecordTotal * input.consortiumShareRatio) / 100;
    }
    const { score: trackRecordScore, ratio: trackRecordRatio } = this.getTrackRecordScore(
      effectiveTrackRecord,
      input.targetEstimatedPrice
    );

    // 3. 신인도 가감점 (최대 +5.0점 ~ -5.0점)
    const selectedBonuses = new Set(input.selectedBonuses || []);
    let rawBonus = 0;
    const activeBonuses: { name: string; points: number }[] = [];

    for (const item of this.DEFAULT_BONUS_ITEMS) {
      if (selectedBonuses.has(item.id)) {
        rawBonus += item.points;
        activeBonuses.push({ name: item.name, points: item.points });
      }
    }

    // 신인도 가산점은 규정상 최대 +5.0점 제한
    const reliabilityBonusScore = Number(Math.max(Math.min(rawBonus, 5.0), -5.0).toFixed(1));

    // 4. 종합 평점 계산
    const totalScore = Number(
      Math.min(100, managementScore + trackRecordScore + reliabilityBonusScore).toFixed(2)
    );
    const isPassed = totalScore >= threshold;

    // 5. 개선 권고사항 도출
    const recommendations: string[] = [];

    if (!isPassed) {
      const deficiency = Number((threshold - totalScore).toFixed(2));
      recommendations.push(
        `적격심사 통과 기준(${threshold}점) 대비 ${deficiency}점 부족합니다.`
      );
    }

    if (trackRecordRatio < 100) {
      recommendations.push(
        `납품 실적 인정 비율이 ${trackRecordRatio}%입니다. 실적 우수 기업과 공동도급(지분율 30~49%)을 체결하면 실적 만점(70점)을 확보할 수 있습니다.`
      );
    }

    if (managementScore < 30.0) {
      recommendations.push(
        `현재 신용평가등급(${input.creditRating})으로 인해 경영상태에서 ${(30.0 - managementScore).toFixed(1)}점 감점되었습니다. BBB- 이상 등급 갱신을 권장합니다.`
      );
    }

    if (reliabilityBonusScore < 2.0) {
      recommendations.push(
        `신인도 가점(${reliabilityBonusScore}점)이 여유가 있습니다. 소기업확인서, 여성/장애인기업 인증, 이노비즈 등록으로 최대 +5.0점까지 만회할 수 있습니다.`
      );
    }

    return {
      totalScore,
      isPassed,
      passThreshold: threshold,
      managementScore,
      trackRecordScore,
      trackRecordRatio,
      reliabilityBonusScore,
      activeBonuses,
      recommendations,
    };
  }
}
