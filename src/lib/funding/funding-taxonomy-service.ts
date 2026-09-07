/**
 * RoboBid AI v3.0 — Funding Opportunity Taxonomy & Intelligence Service
 * KONEPS(조달) / Bizinfo(지원사업) / TIPA(R&D) / IRIS / 수동등록 데이터의 Funding Taxonomy 자동 매핑 및 조달/지원사업 분리
 */

import {
  Opportunity,
  FundingType,
  ApplicantStage,
  EarlySignalStage,
} from "@/types";

export class FundingTaxonomyService {
  /**
   * 공고 메타데이터(제목, 공고기관, BidType, ProviderID)를 분석하여 v3 15대 FundingType으로 자동 분류
   */
  public static mapToFundingType(item: {
    title: string;
    announcingAgency?: string;
    bidType?: string;
    providerId?: string;
  }): FundingType {
    const t = (item.title || "").toLowerCase();
    const a = (item.announcingAgency || "").toLowerCase();
    const p = (item.providerId || "").toLowerCase();
    const b = (item.bidType || "").toUpperCase();

    // 1. 창업 지원금
    if (
      t.includes("창업") ||
      t.includes("예비창업") ||
      t.includes("초기창업") ||
      t.includes("창업도약") ||
      t.includes("팁스") ||
      t.includes("tips") ||
      t.includes("스타트업")
    ) {
      return "STARTUP_GRANT";
    }

    // 2. 시제품 제작 지원
    if (t.includes("시제품") || t.includes("프로토타입") || t.includes("mockup") || t.includes("금형제작")) {
      return "PROTOTYPE_GRANT";
    }

    // 3. 실증 및 PoC 지원
    if (
      t.includes("실증") ||
      t.includes("테스트베드") ||
      t.includes("poc") ||
      t.includes("규제샌드박스") ||
      t.includes("현장적용")
    ) {
      return "VALIDATION_GRANT";
    }

    // 4. 경진대회 / 챌린지
    if (t.includes("경진") || t.includes("해커톤") || t.includes("챌린지") || t.includes("대회")) {
      return "COMPETITION";
    }

    // 5. 공모전
    if (t.includes("공모전") || t.includes("아이디어 공모")) {
      return "CONTEST";
    }

    // 6. 상금 사업
    if (t.includes("상금") || t.includes("어워드") || t.includes("시상")) {
      return "PRIZE";
    }

    // 7. 전시 지원
    if (t.includes("전시") || t.includes("박람회") || t.includes("엑스포") || t.includes("ces") || t.includes("부스")) {
      return "EXHIBITION";
    }

    // 8. 수출 지원
    if (t.includes("수출") || t.includes("해외진출") || t.includes("바이어") || t.includes("글로벌")) {
      return "EXPORT";
    }

    // 9. 판로 개척 지원
    if (t.includes("판로") || t.includes("마케팅지원") || t.includes("공공구매 매칭") || t.includes("유통망")) {
      return "SALES_SUPPORT";
    }

    // 10. 사업화 지원
    if (t.includes("사업화") || t.includes("스케일업") || t.includes("상용화") || t.includes("패키지")) {
      return "COMMERCIALIZATION";
    }

    // 11. 지자체 특화 R&D
    if (
      (t.includes("r&d") || t.includes("연구개발") || t.includes("기술개발")) &&
      (a.includes("도청") || a.includes("시청") || a.includes("테크노파크") || a.includes("tp") || a.includes("진흥원"))
    ) {
      return "LOCAL_RND";
    }

    // 12. 정부 R&D (중기부, 산자부, 과기부 등)
    if (
      t.includes("r&d") ||
      t.includes("연구개발") ||
      t.includes("기술개발") ||
      t.includes("혁신개발") ||
      a.includes("중소벤처기업부") ||
      a.includes("산업통상자원부") ||
      a.includes("과학기술정보통신부") ||
      a.includes("한국산업기술기획평가원") ||
      a.includes("keit") ||
      a.includes("정보통신기획평가원") ||
      a.includes("iitp") ||
      a.includes("중소기업기술정보진흥원") ||
      a.includes("tipa")
    ) {
      return "GOV_RND";
    }

    // 13. 나라장터 / 공공조달 구매
    if (
      (p === "koneps" || a.includes("조달청")) &&
      (b === "PROCUREMENT" || b === "PURCHASE" || b === "GOODS" || t.includes("구매") || t.includes("물품"))
    ) {
      return "PROCUREMENT";
    }

    // 14. 나라장터 / 공공조달 용역
    if (p === "koneps" && (b === "SERVICE" || t.includes("용역") || t.includes("수탁") || t.includes("위탁"))) {
      return "SERVICE_CONTRACT";
    }

    // 15. 기타
    if (p === "bizinfo") {
      return "GOV_RND"; // Bizinfo 기본은 정부지원금 R&D/보조금
    }

    return "OTHER";
  }

  /**
   * 지원 대상 기업 단계 (ApplicantStage) 매핑
   */
  public static mapToApplicantStages(item: {
    title: string;
    announcingAgency?: string;
  }): ApplicantStage[] {
    const t = (item.title || "").toLowerCase();
    const stages: ApplicantStage[] = [];

    if (t.includes("예비창업") || t.includes("예비")) {
      stages.push("PRE_STARTUP");
    }
    if (
      t.includes("초기창업") ||
      t.includes("3년 미만") ||
      t.includes("3년미만") ||
      t.includes("3년 이내") ||
      t.includes("3년이내") ||
      (t.includes("초기") && t.includes("스타트업")) ||
      (t.includes("초기") && t.includes("창업"))
    ) {
      stages.push("STARTUP_UNDER_3Y");
    }
    if (
      t.includes("창업도약") ||
      t.includes("7년 미만") ||
      t.includes("7년미만") ||
      t.includes("7년 이내") ||
      t.includes("7년이내") ||
      (t.includes("도약") && t.includes("창업"))
    ) {
      stages.push("STARTUP_UNDER_7Y");
    }
    if (t.includes("벤처") || t.includes("스타트업")) {
      stages.push("VENTURE");
    }
    if (t.includes("이노비즈") || t.includes("기술혁신형")) {
      stages.push("INNOBIZ");
    }
    if (t.includes("연구소") || t.includes("전담부서")) {
      stages.push("CORPORATE_RESEARCH_CENTER");
    }
    if (t.includes("지역") || t.includes("테크노파크")) {
      stages.push("LOCAL_COMPANY");
    }
    if (t.includes("산학연") || t.includes("컨소시엄") || t.includes("공동연구")) {
      stages.push("CONSORTIUM");
    }

    // 기본값: 중소기업은 대부분의 공고에서 기본 대상
    if (stages.length === 0) {
      stages.push("SME", "VENTURE");
    }

    return stages;
  }

  /**
   * Early Signal 단계 (시행계획/사전예고 ➔ 공고 ➔ 접수 ➔ 마감임박 ➔ 마감)
   */
  public static mapToEarlySignalStage(
    deadlineStr?: string,
    postedAtStr?: string,
    title?: string
  ): EarlySignalStage {
    const t = (title || "").toLowerCase();
    if (t.includes("시행계획") || t.includes("신호") || t.includes("수요조사")) {
      return "SIGNAL";
    }
    if (t.includes("사전예고") || t.includes("사전규격")) {
      return "PRE_ANNOUNCEMENT";
    }

    if (!deadlineStr) return "ANNOUNCED";

    const now = Date.now();
    const deadline = new Date(deadlineStr).getTime();
    const posted = postedAtStr ? new Date(postedAtStr).getTime() : now;

    if (now > deadline) {
      return "CLOSED";
    }

    const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) {
      return "CLOSING"; // 마감 7일 이내
    }

    if (now >= posted) {
      return "OPEN";
    }

    return "ANNOUNCED";
  }

  /**
   * 조달/지원사업 2대 대분류 판별 (조달/지원사업 혼동 방지)
   */
  public static getCategory(fundingType: string): "GOV_FUNDING" | "PROCUREMENT" {
    if (fundingType === "PROCUREMENT" || fundingType === "SERVICE_CONTRACT") {
      return "PROCUREMENT"; // 공공조달 (납품/용역)
    }
    return "GOV_FUNDING"; // 정부지원사업 (R&D, 출연금, 보조금, 바우처 등)
  }

  /**
   * 출처(Origin Source) 판별
   */
  public static getOriginSource(opp: { providerId?: string; sourceId?: string }): string {
    const p = (opp.providerId || "").toLowerCase();
    const s = (opp.sourceId || "").toUpperCase();

    if (p.includes("koneps") || s.includes("KONEPS")) return "KONEPS";
    if (p.includes("bizinfo") || s.includes("BIZINFO")) return "BIZINFO";
    if (p.includes("tipa") || s.includes("TIPA") || s.includes("SMTECH")) return "TIPA";
    if (p.includes("iris") || s.includes("IRIS")) return "IRIS";
    return "MANUAL";
  }

  /**
   * 기존 Opportunity에 v3 Funding Taxonomy 메타데이터를 주입 (하위호환성 100% 보장)
   */
  public static enrichOpportunity(opp: Opportunity): Opportunity {
    const mappedFundingType = opp.fundingType || this.mapToFundingType({
      title: opp.title,
      announcingAgency: opp.announcingAgency,
      bidType: opp.bidType,
      providerId: opp.providerId,
    });

    const mappedStages = (opp.applicantStages && opp.applicantStages.length > 0)
      ? opp.applicantStages
      : this.mapToApplicantStages({
          title: opp.title,
          announcingAgency: opp.announcingAgency,
        });

    const mappedOrigin = opp.originSource || this.getOriginSource(opp);

    const earlySignalStage = opp.signalStage || this.mapToEarlySignalStage(
      opp.submissionDeadline,
      opp.postedAt,
      opp.title
    );

    const isSignal = earlySignalStage === "SIGNAL" || earlySignalStage === "PRE_ANNOUNCEMENT";

    return {
      ...opp,
      fundingType: mappedFundingType,
      applicantStages: mappedStages,
      originSource: mappedOrigin,
      signalStage: earlySignalStage,
      isEarlySignal: opp.isEarlySignal ?? isSignal,
    };
  }

  // Label Formatter Helpers
  public static getFundingTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      GOV_RND: "정부 R&D (출연금)",
      LOCAL_RND: "지자체 R&D",
      STARTUP_GRANT: "창업지원금",
      PROTOTYPE_GRANT: "시제품제작지원",
      VALIDATION_GRANT: "실증/PoC사업",
      COMMERCIALIZATION: "사업화지원",
      COMPETITION: "경진대회/챌린지",
      CONTEST: "공모전",
      PRIZE: "상금/어워드",
      EXHIBITION: "전시지원",
      EXPORT: "수출지원",
      SALES_SUPPORT: "판로개척지원",
      PROCUREMENT: "공공조달 (물품구매)",
      SERVICE_CONTRACT: "공공조달 (일반용역)",
      OTHER: "기타 지원",
    };
    return labels[type] || type;
  }

  public static getApplicantStageLabel(stage: string): string {
    const labels: Record<string, string> = {
      PRE_STARTUP: "예비창업자",
      STARTUP_UNDER_3Y: "초기창업 (3년 미만)",
      STARTUP_UNDER_7Y: "도약창업 (7년 미만)",
      SME: "중소기업",
      VENTURE: "벤처기업",
      INNOBIZ: "이노비즈",
      CORPORATE_RESEARCH_CENTER: "기업부설연구소",
      LOCAL_COMPANY: "지역소재기업",
      RESEARCH_ORG: "연구기관/대학",
      CONSORTIUM: "산학연 컨소시엄",
      OTHER: "기타",
    };
    return labels[stage] || stage;
  }

  public static getEarlySignalLabel(stage: string): { label: string; color: string } {
    switch (stage) {
      case "SIGNAL":
        return { label: "정책 신호", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "EXPECTED":
        return { label: "공고 예상", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "PRE_ANNOUNCEMENT":
        return { label: "사전 예고", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "ANNOUNCED":
        return { label: "공고 게시", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "OPEN":
        return { label: "접수 중", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "CLOSING":
        return { label: "마감 임박 (D-7)", color: "bg-red-100 text-red-800 border-red-200" };
      case "CLOSED":
        return { label: "접수 마감", color: "bg-slate-100 text-slate-700 border-slate-200" };
      default:
        return { label: stage, color: "bg-muted text-muted-foreground" };
    }
  }
}
