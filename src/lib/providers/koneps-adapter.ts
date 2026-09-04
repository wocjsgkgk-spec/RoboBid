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
      const endpoint = `http://apis.data.go.kr/1230000/PubDataOpnStdBidPblancInfo/getDataSetOpnStdBidPblancInfo?serviceKey=${encodeURIComponent(
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

      if (!res.ok) {
        return {
          status: "FAILED",
          message: `HTTP 오류 발생: ${res.status} ${res.statusText}`,
          latencyMs,
          lastCheckedAt: now,
        };
      }

      const data = await res.json().catch(() => null);
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
    if (!key) {
      return { items: [], totalCount: 0, pageNo: options.pageNo || 1, numOfRows: options.numOfRows || 10 };
    }

    const pageNo = options.pageNo || 1;
    const numOfRows = options.numOfRows || 20;
    const keyword = options.keyword || "로봇";

    const endpoint = `http://apis.data.go.kr/1230000/PubDataOpnStdBidPblancInfo/getDataSetOpnStdBidPblancInfo?serviceKey=${encodeURIComponent(
      key
    )}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json&bidNtceNm=${encodeURIComponent(keyword)}`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`KONEPS API Fetch 실패 (HTTP ${res.status})`);
    }

    const json = await res.json();
    const items = json?.response?.body?.items || [];
    const totalCount = json?.response?.body?.totalCount || items.length;

    return {
      items: Array.isArray(items) ? items : [items],
      totalCount,
      pageNo,
      numOfRows,
    };
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
