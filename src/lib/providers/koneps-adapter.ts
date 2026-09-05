import { BaseProviderAdapter } from "./base-adapter";
import {
  FetchOptions,
  FetchResult,
  NormalizedOpportunityPayload,
  ProviderHealthCheckResult,
  RawAttachment,
} from "./types";
import { BidType } from "@/types";

export class KonepsAdapter extends BaseProviderAdapter {
  readonly id = "koneps";
  readonly name = "조달청 나라장터 (KONEPS)";
  readonly sourceUrl = "https://www.data.go.kr/data/15058815/openapi.do";
  readonly defaultBidType: BidType = "PROCUREMENT";

  private getServiceKey(): string | undefined {
    return process.env.DATA_GO_KR_SERVICE_KEY;
  }

  async checkHealth(): Promise<ProviderHealthCheckResult> {
    const key = this.getServiceKey();
    const now = new Date().toISOString();

    if (!key) {
      return {
        status: "KEY_MISSING",
        message: "DATA_GO_KR_SERVICE_KEY 환경변수가 설정되지 않았습니다.",
        lastCheckedAt: now,
      };
    }

    try {
      const startTime = Date.now();
      // Test ping to open data endpoint with 1 row limit
      const endpoint = `http://apis.data.go.kr/1230000/PubDataOpnStdBidPblancInfo/getDataSetOpnStdBidPblancInfo?serviceKey=${this.safeEncodeServiceKey(
        key
      )}&numOfRows=1&pageNo=1&type=json`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;

      if (res.status === 429) {
        return {
          status: "RATE_LIMITED",
          message: "일일 호출 한도 초과 또는 Rate Limit에 도달했습니다.",
          latencyMs,
          lastCheckedAt: now,
        };
      }

      const resText = await res.text().catch(() => "");
      let data: any = null;
      try {
        data = JSON.parse(resText);
      } catch {
        // Not JSON
      }

      if (!res.ok) {
        const errorMsg = data?.OpenAPI_ServiceResponse?.cmmMsgHeader?.returnAuthMsg ||
                         data?.response?.header?.resultMsg;
        const reasonCode = data?.OpenAPI_ServiceResponse?.cmmMsgHeader?.returnReasonCode;

        if (reasonCode === "12" || resText.includes("NO_OPENAPI_SERVICE_ERROR") || resText.includes("오픈API 서비스가 없거나")) {
          return {
            status: "FAILED",
            message: "공공데이터포털(data.go.kr)에서 '조달청 나라장터 입찰공고' 오픈API 활용신청 및 승인 상태 확인이 필요합니다 (오류 12: 서비스 미신청 또는 키 불일치).",
            latencyMs,
            lastCheckedAt: now,
          };
        }

        if (reasonCode === "30" || resText.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")) {
          return {
            status: "FAILED",
            message: "등록되지 않은 공공데이터포털 인증키입니다. data.go.kr 마이페이지에서 일반 인증키(Encoding/Decoding)를 확인하세요.",
            latencyMs,
            lastCheckedAt: now,
          };
        }

        return {
          status: "FAILED",
          message: errorMsg || `HTTP 오류 발생: ${res.status} ${res.statusText}`,
          latencyMs,
          lastCheckedAt: now,
        };
      }

      if (!data || data.response?.header?.resultCode !== "00") {
        return {
          status: "DEGRADED",
          message: data?.response?.header?.resultMsg || "응답 스키마 불일치",
          latencyMs,
          lastCheckedAt: now,
        };
      }

      return {
        status: "CONNECTED",
        message: "나라장터 공공데이터 API 정상 응답 확인",
        latencyMs,
        lastCheckedAt: now,
      };
    } catch (err: any) {
      return {
        status: "FAILED",
        message: err.name === "AbortError" ? "API 요청 타임아웃 (5초 초과)" : err.message,
        lastCheckedAt: now,
      };
    }
  }

  async fetchRaw(options: FetchOptions = {}): Promise<FetchResult> {
    const key = this.getServiceKey();
    const pageNo = options.pageNo || 1;
    const numOfRows = options.numOfRows || 20;
    const keyword = options.keyword || "로봇";

    if (!key) {
      if (options.fallbackToMock) {
        const mockItems = this.getMockTenders(keyword);
        return {
          items: mockItems.slice((pageNo - 1) * numOfRows, pageNo * numOfRows),
          totalCount: mockItems.length,
          pageNo,
          numOfRows,
        };
      }
      return { items: [], totalCount: 0, pageNo, numOfRows };
    }

    try {
      const endpoint = `https://apis.data.go.kr/1230000/PubDataOpnStdBidPblancInfo/getDataSetOpnStdBidPblancInfo?serviceKey=${this.safeEncodeServiceKey(
        key
      )}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json&bidNtceNm=${encodeURIComponent(keyword)}`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        if (options.fallbackToMock) {
          const mockItems = this.getMockTenders(keyword);
          return { items: mockItems, totalCount: mockItems.length, pageNo, numOfRows };
        }
        throw new Error(`KONEPS API Fetch 실패 (HTTP ${res.status})`);
      }

      const json = await res.json().catch(() => null);
      const bodyItems = json?.response?.body?.items;
      let items: any[] = [];
      if (Array.isArray(bodyItems)) {
        items = bodyItems;
      } else if (bodyItems?.item) {
        items = Array.isArray(bodyItems.item) ? bodyItems.item : [bodyItems.item];
      }

      const totalCount = json?.response?.body?.totalCount || items.length;

      if (items.length === 0 && options.fallbackToMock) {
        const mockItems = this.getMockTenders(keyword);
        return { items: mockItems, totalCount: mockItems.length, pageNo, numOfRows };
      }

      return {
        items,
        totalCount,
        pageNo,
        numOfRows,
      };
    } catch (err: any) {
      if (options.fallbackToMock) {
        const mockItems = this.getMockTenders(keyword);
        return { items: mockItems, totalCount: mockItems.length, pageNo, numOfRows };
      }
      throw err;
    }
  }

  /**
   * 실시간 API 미연결 시 사용할 공공조달 표준 규격 샘플 데이터
   */
  private getMockTenders(keyword: string): any[] {
    const list = [
      {
        bidNtceNo: "20260904001",
        bidNtceOrd: "00",
        bidNtceNm: `2026년 지능형 ${keyword} 도입 및 관제시스템 구축용역`,
        ntceInsttNm: "조달청 (수요기관: 인천항만공사)",
        dminsttNm: "인천항만공사",
        asignBdgtAmt: "450000000",
        presmptPrce: "409090909",
        bidNtceDt: new Date().toISOString(),
        bidClseDt: new Date(Date.now() + 14 * 86400000).toISOString(),
        srvceDivNm: "용역",
        bidNtceDtlUrl: "https://www.g2b.go.kr",
        ntceSpecDocNm1: "제안요청서_과업지시서.hwp",
        ntceSpecDocUrl1: "https://www.g2b.go.kr/spec1",
      },
      {
        bidNtceNo: "20260904002",
        bidNtceOrd: "00",
        bidNtceNm: `공공시설물 안전점검 AI 자율주행 ${keyword} 실증 사업`,
        ntceInsttNm: "한국철도공사",
        dminsttNm: "철도안전연구원",
        asignBdgtAmt: "620000000",
        presmptPrce: "563636364",
        bidNtceDt: new Date().toISOString(),
        bidClseDt: new Date(Date.now() + 21 * 86400000).toISOString(),
        srvceDivNm: "용역",
        bidNtceDtlUrl: "https://www.g2b.go.kr",
        ntceSpecDocNm1: "과업규격서.pdf",
        ntceSpecDocUrl1: "https://www.g2b.go.kr/spec2",
      },
      {
        bidNtceNo: "20260904003",
        bidNtceOrd: "00",
        bidNtceNm: `제조물류 스마트 자동화 ${keyword} 구매 및 설치`,
        ntceInsttNm: "중소벤처기업진흥공단",
        dminsttNm: "스마트공장사업단",
        asignBdgtAmt: "380000000",
        presmptPrce: "345454545",
        bidNtceDt: new Date().toISOString(),
        bidClseDt: new Date(Date.now() + 10 * 86400000).toISOString(),
        srvceDivNm: "물품",
        bidNtceDtlUrl: "https://www.g2b.go.kr",
      },
    ];
    return list;
  }

  normalize(raw: any): NormalizedOpportunityPayload {
    const noticeNo = raw.bidNtceNo || raw.ntceNo || `KONEPS-${Date.now()}`;
    const noticeOrd = raw.bidNtceOrd || raw.ntceOrd || "00";
    const sourceId = `${noticeNo}-${noticeOrd}`;

    const title = raw.bidNtceNm || raw.ntceNm || "무제 공고";
    const announcingAgency = raw.ntceInsttNm || raw.annAgency || "조달청";
    const demandingAgency = raw.dminsttNm || raw.demandAgency || announcingAgency;

    const allocatedBudget = raw.asignBdgtAmt ? Number(raw.asignBdgtAmt) : null;
    const estimatedPrice = raw.presmptPrce ? Number(raw.presmptPrce) : null;

    const postedAt = this.parseDateToIso(raw.bidNtceDt || raw.ntceDt);
    const submissionDeadline = this.parseDateToIso(raw.bidClseDt || raw.clseDt);

    // Collect attachment documents if provided in API
    const attachments: RawAttachment[] = [];
    if (raw.ntceSpecDocUrl1) {
      attachments.push({
        fileName: raw.ntceSpecDocNm1 || "제안요청서/규격서 1",
        fileUrl: raw.ntceSpecDocUrl1,
      });
    }
    if (raw.ntceSpecDocUrl2) {
      attachments.push({
        fileName: raw.ntceSpecDocNm2 || "과업지시서/규격서 2",
        fileUrl: raw.ntceSpecDocUrl2,
      });
    }

    const primaryDomain = this.classifyDomain(title, `${announcingAgency} ${demandingAgency}`);

    return {
      sourceId,
      title,
      announcingAgency,
      demandingAgency,
      bidType: raw.srvceDivNm === "용역" ? "SERVICE" : "PROCUREMENT",
      primaryDomain,
      allocatedBudget,
      estimatedPrice,
      postedAt,
      submissionDeadline,
      canonicalUrl: raw.bidNtceDtlUrl || `https://www.g2b.go.kr:8081/ep/invitation/put/bidPblancListInfoServcPPSSrch.do?bidNtceNo=${noticeNo}`,
      rawPayload: raw,
      attachments,
    };
  }
}
