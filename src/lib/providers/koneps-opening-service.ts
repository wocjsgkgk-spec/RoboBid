import { KonepsOpeningResult, OpeningResultQueryOptions } from "@/types/koneps-opening";

export class KonepsOpeningService {
  private static instance: KonepsOpeningService;

  private constructor() {}

  public static getInstance(): KonepsOpeningService {
    if (!KonepsOpeningService.instance) {
      KonepsOpeningService.instance = new KonepsOpeningService();
    }
    return KonepsOpeningService.instance;
  }

  private getServiceKey(): string | undefined {
    return process.env.DATA_GO_KR_SERVICE_KEY;
  }

  private safeEncodeKey(key: string): string {
    try {
      const decoded = decodeURIComponent(key);
      return encodeURIComponent(decoded);
    } catch {
      return encodeURIComponent(key);
    }
  }

  /**
   * 실시간 조달청 나라장터 개찰결과 API 호출 (용역/물품 통합)
   */
  public async fetchOpeningResults(
    options: OpeningResultQueryOptions = {}
  ): Promise<{ results: KonepsOpeningResult[]; totalCount: number; isMock: boolean }> {
    const key = this.getServiceKey();
    const pageNo = options.pageNo || 1;
    const numOfRows = options.numOfRows || 10;

    if (!key) {
      const mockResults = this.getSampleOpeningResults(options);
      return {
        results: mockResults.slice((pageNo - 1) * numOfRows, pageNo * numOfRows),
        totalCount: mockResults.length,
        isMock: true,
      };
    }

    try {
      const encodedKey = this.safeEncodeKey(key);
      let endpoint = `https://apis.data.go.kr/1230000/ScsbidInfoService/getOpengResultInfoListServc?serviceKey=${encodedKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json`;

      if (options.bidNtceNo) {
        endpoint += `&bidNtceNo=${encodeURIComponent(options.bidNtceNo)}`;
      }
      if (options.bidNtceNm) {
        endpoint += `&bidNtceNm=${encodeURIComponent(options.bidNtceNm)}`;
      }
      if (options.startDate) {
        endpoint += `&inqryBgnDate=${options.startDate.replace(/-/g, "")}`;
      }
      if (options.endDate) {
        endpoint += `&inqryEndDate=${options.endDate.replace(/-/g, "")}`;
      }

      const res = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        console.warn(`KONEPS Opening API HTTP ${res.status}, falling back to mock`);
        const mockResults = this.getSampleOpeningResults(options);
        return { results: mockResults, totalCount: mockResults.length, isMock: true };
      }

      const json = await res.json().catch(() => null);
      const items = json?.response?.body?.items;
      let rawList: any[] = [];
      if (Array.isArray(items)) {
        rawList = items;
      } else if (items?.item) {
        rawList = Array.isArray(items.item) ? items.item : [items.item];
      }

      const totalCount = json?.response?.body?.totalCount || rawList.length;

      if (rawList.length === 0 && options.bidNtceNm) {
        // Fallback to realistic mock if query returned empty on external API
        const mockResults = this.getSampleOpeningResults(options);
        return { results: mockResults, totalCount: mockResults.length, isMock: true };
      }

      const results: KonepsOpeningResult[] = rawList.map((raw) => this.normalizeOpeningItem(raw));

      return {
        results,
        totalCount,
        isMock: false,
      };
    } catch (err) {
      console.warn("KONEPS Opening API fetch failed:", err);
      const mockResults = this.getSampleOpeningResults(options);
      return { results: mockResults, totalCount: mockResults.length, isMock: true };
    }
  }

  /**
   * 단일 공고 번호로 개찰결과 정밀 조회
   */
  public async getOpeningByNoticeNo(
    bidNtceNo: string
  ): Promise<KonepsOpeningResult | null> {
    const { results } = await this.fetchOpeningResults({ bidNtceNo });
    return results[0] || null;
  }

  /**
   * 개찰 결과 정규화
   */
  public normalizeOpeningItem(raw: any): KonepsOpeningResult {
    const bsisAmt = raw.bsisAmt ? Number(raw.bsisAmt) : null;
    const plnprc = raw.plnprc ? Number(raw.plnprc) : null;
    const lwstBdrBidAmt = raw.lwstBdrBidAmt ? Number(raw.lwstBdrBidAmt) : null;
    const lwstBdrBidRate = raw.lwstBdrBidRate ? parseFloat(raw.lwstBdrBidRate) : null;
    const sucsfBidAmt = raw.sucsfBidAmt ? Number(raw.sucsfBidAmt) : lwstBdrBidAmt;
    const sucsfBidRate = raw.sucsfBidRate ? parseFloat(raw.sucsfBidRate) : lwstBdrBidRate;

    let resultStatus: "OPENED" | "SUCCESSFUL" | "REBID" | "FAILED" = "OPENED";
    if (raw.opengRsltDivNm?.includes("유찰") || raw.rbidDivNm === "Y") {
      resultStatus = "FAILED";
    } else if (raw.sucsfBdrBsnmNm || sucsfBidAmt) {
      resultStatus = "SUCCESSFUL";
    }

    let estimatedPriceRate: number | null = null;
    if (bsisAmt && plnprc && bsisAmt > 0) {
      estimatedPriceRate = Math.round((plnprc / bsisAmt) * 100000) / 1000;
    }

    return {
      bidNtceNo: raw.bidNtceNo || `KONEPS-${Date.now()}`,
      bidNtceOrd: raw.bidNtceOrd || "00",
      bidNtceNm: raw.bidNtceNm || "공공조달 용역",
      opengDt: raw.opengDt ? this.formatDate(raw.opengDt) : new Date().toISOString(),
      announcingAgency: raw.ntceInsttNm || raw.annAgency || "조달청",
      demandingAgency: raw.dminsttNm || raw.demandAgency,
      totPrtcptBsnmCnt: raw.totPrtcptBsnmCnt ? parseInt(raw.totPrtcptBsnmCnt, 10) : 0,
      bsisAmt,
      plnprc,
      lwstBdrBsnmNm: raw.lwstBdrBsnmNm || null,
      lwstBdrBidAmt,
      lwstBdrBidRate,
      sucsfBdrBsnmNm: raw.sucsfBdrBsnmNm || raw.lwstBdrBsnmNm || null,
      sucsfBidAmt,
      sucsfBidRate,
      resultStatus,
      estimatedPriceRate,
      notes: raw.opengRsltDivNm || "개찰 완료",
    };
  }

  /**
   * 투찰 적중률 및 오차 분석 (AAR 도구)
   */
  public analyzeBidAccuracy(
    ourBidPrice: number,
    openingResult: KonepsOpeningResult
  ): {
    ourBidPrice: number;
    winningBidPrice: number;
    difference: number;
    deviationRate: number; // 오차율 (%)
    isWinnerCandidate: boolean;
    recommendation: string;
  } {
    const targetPrice = openingResult.sucsfBidAmt || openingResult.lwstBdrBidAmt || 0;
    const diff = ourBidPrice - targetPrice;
    const deviationRate = targetPrice > 0 ? (diff / targetPrice) * 100 : 0;
    const isWinnerCandidate = Math.abs(deviationRate) < 0.1;

    let recommendation = "";
    if (diff > 0) {
      recommendation = `1순위 낙찰가보다 ${Math.abs(diff).toLocaleString()}원 (${deviationRate.toFixed(3)}%) 높게 투찰되었습니다. 복수예비가격 추첨 사상률(A값 반영)을 더 낮게 예측해야 합니다.`;
    } else if (diff < 0) {
      recommendation = `1순위 낙찰가보다 ${Math.abs(diff).toLocaleString()}원 (${Math.abs(deviationRate).toFixed(3)}%) 낮게 투찰되었습니다. 낙찰하한선 미달(덤핑 배제) 위험이 발생할 수 있으므로 보수적 투찰이 권장됩니다.`;
    } else {
      recommendation = "1순위 투찰가와 완벽하게 일치합니다. 최적의 투찰 전략이 수립되었습니다.";
    }

    return {
      ourBidPrice,
      winningBidPrice: targetPrice,
      difference: diff,
      deviationRate: Math.round(deviationRate * 1000) / 1000,
      isWinnerCandidate,
      recommendation,
    };
  }

  private formatDate(rawDt: string): string {
    if (!rawDt) return new Date().toISOString();
    // raw format: "20260901140000" or "2026-09-01 14:00"
    if (rawDt.length === 14) {
      return `${rawDt.slice(0, 4)}-${rawDt.slice(4, 6)}-${rawDt.slice(6, 8)}T${rawDt.slice(8, 10)}:${rawDt.slice(10, 12)}:00Z`;
    }
    return new Date(rawDt).toISOString();
  }

  /**
   * 실무용 고신뢰도 개찰결과 시뮬레이션 데이터
   */
  private getSampleOpeningResults(options: OpeningResultQueryOptions): KonepsOpeningResult[] {
    const all: KonepsOpeningResult[] = [
      {
        bidNtceNo: "20260831001",
        bidNtceOrd: "00",
        bidNtceNm: "2026년 지능형 순찰로봇 도입 및 통합관제 SW 구축용역",
        opengDt: "2026-09-02T15:30:00Z",
        announcingAgency: "인천항만공사",
        demandingAgency: "인천항만공사 보안관리처",
        totPrtcptBsnmCnt: 7,
        bsisAmt: 350000000,
        plnprc: 348250000,
        lwstBdrBsnmNm: "(주)로보마스터즈",
        lwstBdrBidAmt: 306286000,
        lwstBdrBidRate: 87.950,
        sucsfBdrBsnmNm: "(주)로보마스터즈",
        sucsfBidAmt: 306286000,
        sucsfBidRate: 87.950,
        resultStatus: "SUCCESSFUL",
        estimatedPriceRate: 99.500,
        notes: "적격심사 1순위 선정 완료 (통과예정)",
      },
      {
        bidNtceNo: "20260828005",
        bidNtceOrd: "01",
        bidNtceNm: "스마트 제조혁신 AI 솔루션 및 로봇 자동화 검사시스템 구매",
        opengDt: "2026-09-01T11:00:00Z",
        announcingAgency: "중소벤처기업진흥공단",
        demandingAgency: "스마트제조지원단",
        totPrtcptBsnmCnt: 12,
        bsisAmt: 420000000,
        plnprc: 421800000,
        lwstBdrBsnmNm: "인텔리비전(주)",
        lwstBdrBidAmt: 371184000,
        lwstBdrBidRate: 88.000,
        sucsfBdrBsnmNm: "인텔리비전(주)",
        sucsfBidAmt: 371184000,
        sucsfBidRate: 88.000,
        resultStatus: "SUCCESSFUL",
        estimatedPriceRate: 100.428,
        notes: "최저가 적격 1순위",
      },
      {
        bidNtceNo: "20260825010",
        bidNtceOrd: "00",
        bidNtceNm: "도시철도 역사 위험구역 자동탐지 로봇 실증 용역",
        opengDt: "2026-08-30T16:00:00Z",
        announcingAgency: "서울교통공사",
        demandingAgency: "철도기술연구원",
        totPrtcptBsnmCnt: 4,
        bsisAmt: 280000000,
        plnprc: 277900000,
        lwstBdrBsnmNm: "(주)케이로보틱스",
        lwstBdrBidAmt: 243859000,
        lwstBdrBidRate: 87.751,
        sucsfBdrBsnmNm: "(주)케이로보틱스",
        sucsfBidAmt: 243859000,
        sucsfBidRate: 87.751,
        resultStatus: "SUCCESSFUL",
        estimatedPriceRate: 99.250,
        notes: "A값 반영 투찰 하한선 통과",
      },
      {
        bidNtceNo: "20260820003",
        bidNtceOrd: "00",
        bidNtceNm: "인공지능 기반 공공시설물 안전점검 자동화 플랫폼 구축",
        opengDt: "2026-08-27T14:00:00Z",
        announcingAgency: "한국국토정보공사",
        demandingAgency: "공간정보연구원",
        totPrtcptBsnmCnt: 9,
        bsisAmt: 500000000,
        plnprc: 497500000,
        lwstBdrBsnmNm: "(유)스마트안전솔루션",
        lwstBdrBidAmt: 437800000,
        lwstBdrBidRate: 88.000,
        sucsfBdrBsnmNm: "(유)스마트안전솔루션",
        sucsfBidAmt: 437800000,
        sucsfBidRate: 88.000,
        resultStatus: "SUCCESSFUL",
        estimatedPriceRate: 99.500,
        notes: "개찰 완료",
      },
    ];

    if (options.bidNtceNo) {
      const match = all.filter((x) => x.bidNtceNo.includes(options.bidNtceNo!));
      if (match.length > 0) return match;
    }
    if (options.bidNtceNm) {
      const match = all.filter((x) => x.bidNtceNm.toLowerCase().includes(options.bidNtceNm!.toLowerCase()));
      if (match.length > 0) return match;
    }
    return all;
  }
}

export const konepsOpeningService = KonepsOpeningService.getInstance();
