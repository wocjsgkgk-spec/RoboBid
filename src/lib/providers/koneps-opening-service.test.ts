import { describe, it, expect } from "vitest";
import { konepsOpeningService } from "./koneps-opening-service";
import { KonepsOpeningResult } from "@/types/koneps-opening";

describe("KonepsOpeningService (조달청 나라장터 개찰결과 서비스)", () => {
  it("최근 개찰 결과 목록을 조회할 수 있다", async () => {
    const data = await konepsOpeningService.fetchOpeningResults({
      numOfRows: 5,
    });

    expect(data.results).toBeDefined();
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.totalCount).toBeGreaterThan(0);

    const first = data.results[0];
    expect(first.bidNtceNo).toBeDefined();
    expect(first.bidNtceNm).toBeDefined();
    expect(first.announcingAgency).toBeDefined();
    expect(first.totPrtcptBsnmCnt).toBeGreaterThan(0);
  });

  it("특정 공고번호로 개찰 결과를 정밀 조회할 수 있다", async () => {
    const result = await konepsOpeningService.getOpeningByNoticeNo("20260831001");

    expect(result).not.toBeNull();
    expect(result?.bidNtceNo).toBe("20260831001");
    expect(result?.bidNtceNm).toContain("지능형 순찰로봇");
    expect(result?.announcingAgency).toBe("인천항만공사");
    expect(result?.bsisAmt).toBe(350000000);
    expect(result?.plnprc).toBe(348250000);
    expect(result?.lwstBdrBsnmNm).toBe("(주)로보마스터즈");
    expect(result?.resultStatus).toBe("SUCCESSFUL");
  });

  it("기초금액과 예정가격 간 사상률을 정밀 계산한다", () => {
    const raw = {
      bidNtceNo: "20260904999",
      bidNtceOrd: "00",
      bidNtceNm: "AI 자동제어 시스템 구축용역",
      bsisAmt: "500000000",
      plnprc: "498500000",
      lwstBdrBidAmt: "438680000",
      lwstBdrBidRate: "88.000",
      totPrtcptBsnmCnt: "8",
      opengRsltDivNm: "개찰완료",
    };

    const normalized = konepsOpeningService.normalizeOpeningItem(raw);

    expect(normalized.bsisAmt).toBe(500000000);
    expect(normalized.plnprc).toBe(498500000);
    expect(normalized.estimatedPriceRate).toBe(99.7); // (498500000 / 500000000) * 100
    expect(normalized.totPrtcptBsnmCnt).toBe(8);
  });

  it("자사 투찰가와 1순위 낙찰가 간 오차율 및 AAR 피드백을 정확히 분석한다", () => {
    const mockResult: KonepsOpeningResult = {
      bidNtceNo: "20260831001",
      bidNtceOrd: "00",
      bidNtceNm: "테스트 공모",
      opengDt: new Date().toISOString(),
      announcingAgency: "조달청",
      totPrtcptBsnmCnt: 5,
      bsisAmt: 300000000,
      plnprc: 298000000,
      lwstBdrBidAmt: 262240000,
      lwstBdrBidRate: 88.0,
      sucsfBidAmt: 262240000,
      sucsfBidRate: 88.0,
      resultStatus: "SUCCESSFUL",
    };

    // Case 1: 낙찰가보다 높게 투찰한 경우 (+오차)
    const analysisHigher = konepsOpeningService.analyzeBidAccuracy(265000000, mockResult);
    expect(analysisHigher.difference).toBe(2760000);
    expect(analysisHigher.deviationRate).toBeGreaterThan(0);
    expect(analysisHigher.isWinnerCandidate).toBe(false);
    expect(analysisHigher.recommendation).toContain("높게 투찰");

    // Case 2: 낙찰가보다 낮게 투찰한 경우 (-오차, 낙찰하한 미달 위험)
    const analysisLower = konepsOpeningService.analyzeBidAccuracy(260000000, mockResult);
    expect(analysisLower.difference).toBe(-2240000);
    expect(analysisLower.deviationRate).toBeLessThan(0);
    expect(analysisLower.isWinnerCandidate).toBe(false);
    expect(analysisLower.recommendation).toContain("낙찰하한선 미달");

    // Case 3: 1순위와 일치하는 경우
    const analysisMatch = konepsOpeningService.analyzeBidAccuracy(262240000, mockResult);
    expect(analysisMatch.difference).toBe(0);
    expect(analysisMatch.deviationRate).toBe(0);
    expect(analysisMatch.isWinnerCandidate).toBe(true);
    expect(analysisMatch.recommendation).toContain("완벽하게 일치");
  });
});
