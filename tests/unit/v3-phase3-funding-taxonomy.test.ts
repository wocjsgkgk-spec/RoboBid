import { describe, it, expect, beforeEach } from "vitest";
import { FundingTaxonomyService } from "@/lib/funding/funding-taxonomy-service";
import { opportunityStore } from "@/lib/opportunities/opportunity-store";
import { Opportunity } from "@/types";

describe("RoboBid AI v3.0 — Phase 3 Funding Opportunity Taxonomy & Intelligence Model", () => {
  // 1. Funding Type 자동 분류 및 우선순위 검증
  it("공고 제목과 기관명을 기반으로 15대 FundingType을 정확히 매핑한다", () => {
    // R&D
    expect(
      FundingTaxonomyService.mapToFundingType({
        title: "2026 지능형 로봇 혁신 R&D 기술개발 과제 공고",
        announcingAgency: "한국산업기술기획평가원",
      })
    ).toBe("GOV_RND");

    // 창업 지원금
    expect(
      FundingTaxonomyService.mapToFundingType({
        title: "2026년도 초기창업패키지 로봇 창업기업 모집",
        announcingAgency: "창업진흥원",
      })
    ).toBe("STARTUP_GRANT");

    // 시제품 제작 지원
    expect(
      FundingTaxonomyService.mapToFundingType({
        title: "스마트 제조 로봇 시제품 및 Mockup 제작지원 사업",
        announcingAgency: "중소기업기술정보진흥원",
      })
    ).toBe("PROTOTYPE_GRANT");

    // 실증 및 PoC 지원
    expect(
      FundingTaxonomyService.mapToFundingType({
        title: "지능형 로봇 서비스 실증 및 규제샌드박스 테스트베드 지원",
        announcingAgency: "한국로봇산업진흥원",
      })
    ).toBe("VALIDATION_GRANT");

    // 해외 수출 지원
    expect(
      FundingTaxonomyService.mapToFundingType({
        title: "로봇 벤처기업 북미/유럽 시장 글로벌 수출 및 바이어 매칭 지원",
        announcingAgency: "KOTRA",
      })
    ).toBe("EXPORT");

    // 공공조달 구매 (KONEPS)
    expect(
      FundingTaxonomyService.mapToFundingType({
        title: "국립중앙박물관 안내해설 로봇 2대 제조구매 입찰",
        announcingAgency: "조달청",
        providerId: "koneps",
        bidType: "PURCHASE",
      })
    ).toBe("PROCUREMENT");

    // 공공조달 용역 (KONEPS)
    expect(
      FundingTaxonomyService.mapToFundingType({
        title: "공공청사 자율주행 방역 로봇 유지관리 위탁용역",
        announcingAgency: "서울시청",
        providerId: "koneps",
        bidType: "SERVICE",
      })
    ).toBe("SERVICE_CONTRACT");
  });

  // 2. 지원 대상 기업 단계 (ApplicantStage) 매핑 검증
  it("공고 내용으로부터 지원 가능 기업 단계를 정확히 도출한다", () => {
    const preStartup = FundingTaxonomyService.mapToApplicantStages({
      title: "2026 예비창업패키지 참여 예비창업자 모집",
    });
    expect(preStartup).toContain("PRE_STARTUP");

    const earlyStartup = FundingTaxonomyService.mapToApplicantStages({
      title: "창업 3년 이내 초기 로봇 스타트업 육성 지원사업",
    });
    expect(earlyStartup).toContain("STARTUP_UNDER_3Y");

    const ventureInnobiz = FundingTaxonomyService.mapToApplicantStages({
      title: "기술혁신형 이노비즈 및 벤처기업 전용 R&D 과제",
    });
    expect(ventureInnobiz).toContain("VENTURE");
    expect(ventureInnobiz).toContain("INNOBIZ");
  });

  // 3. Early Signal 단계 (신호 ➔ 사전예고 ➔ 접수 ➔ 마감임박 ➔ 마감) 검증
  it("공고 시점과 마감일에 따라 EarlySignalStage를 올바르게 판별한다", () => {
    // 1. 시행계획 신호
    expect(
      FundingTaxonomyService.mapToEarlySignalStage(undefined, undefined, "2026 범부처 로봇 R&D 종합시행계획 수립 안내")
    ).toBe("SIGNAL");

    // 2. 사전예고
    expect(
      FundingTaxonomyService.mapToEarlySignalStage(undefined, undefined, "[사전예고] 제조로봇 보급실증 사업 규격 의견수렴")
    ).toBe("PRE_ANNOUNCEMENT");

    // 3. 마감 임박 (D-3일)
    const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString();
    expect(
      FundingTaxonomyService.mapToEarlySignalStage(inThreeDays, new Date().toISOString(), "정상 공고")
    ).toBe("CLOSING");

    // 4. 마감 완료 (어제 마감)
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(
      FundingTaxonomyService.mapToEarlySignalStage(yesterday, new Date().toISOString(), "종료된 공고")
    ).toBe("CLOSED");
  });

  // 4. 정부지원사업 vs 공공조달 2대 대분류 분리 검증 (조달/지원사업 혼동 방지)
  it("조달과 지원사업을 명확히 구분하여 혼동을 원천 차단한다", () => {
    // 정부지원금 그룹
    expect(FundingTaxonomyService.getCategory("GOV_RND")).toBe("GOV_FUNDING");
    expect(FundingTaxonomyService.getCategory("STARTUP_GRANT")).toBe("GOV_FUNDING");
    expect(FundingTaxonomyService.getCategory("PROTOTYPE_GRANT")).toBe("GOV_FUNDING");
    expect(FundingTaxonomyService.getCategory("VALIDATION_GRANT")).toBe("GOV_FUNDING");
    expect(FundingTaxonomyService.getCategory("COMMERCIALIZATION")).toBe("GOV_FUNDING");

    // 공공조달 그룹
    expect(FundingTaxonomyService.getCategory("PROCUREMENT")).toBe("PROCUREMENT");
    expect(FundingTaxonomyService.getCategory("SERVICE_CONTRACT")).toBe("PROCUREMENT");
  });

  // 5. OpportunityStore 자동 보강 및 하위호환성 검증
  it("레거시 Opportunity를 조회할 때 Funding Taxonomy가 자동 주입되며 기존 데이터가 100% 보존된다", () => {
    const rawLegacyOpp: Opportunity = {
      id: "opp-legacy-koneps-001",
      organizationId: "00000000-0000-0000-0000-000000000001",
      providerId: "koneps",
      sourceId: "KONEPS-20260901-01",
      title: "조달청 스마트 순찰로봇 구매 입찰공고",
      announcingAgency: "조달청",
      bidType: "PROCUREMENT",
      primaryDomain: "ROBOT",
      allocatedBudget: 350000000,
      postedAt: "2026-09-01T00:00:00Z",
      submissionDeadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      status: "INBOX",
      contentHash: "hash-legacy-1",
      currentVersion: 1,
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    };

    opportunityStore.save(rawLegacyOpp);

    const fetched = opportunityStore.getById("opp-legacy-koneps-001");
    expect(fetched).toBeDefined();
    if (fetched) {
      // 신규 필드 자동 주입 확인
      expect(fetched.fundingType).toBe("PROCUREMENT");
      expect(fetched.originSource).toBe("KONEPS");
      expect(fetched.signalStage).toBe("OPEN");
      expect(fetched.applicantStages).toBeDefined();

      // 기존 필드 무손실 유지 확인
      expect(fetched.title).toBe("조달청 스마트 순찰로봇 구매 입찰공고");
      expect(fetched.allocatedBudget).toBe(350000000);
      expect(fetched.bidType).toBe("PROCUREMENT");
    }
  });
});
