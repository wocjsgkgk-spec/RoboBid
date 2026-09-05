import { BaseProviderAdapter } from "./base-adapter";
import {
  FetchOptions,
  FetchResult,
  NormalizedOpportunityPayload,
  ProviderHealthCheckResult,
} from "./types";
import { BidType } from "@/types";

export class BizinfoAdapter extends BaseProviderAdapter {
  readonly id = "bizinfo";
  readonly name = "기업마당 (중소벤처기업부)";
  readonly sourceUrl = "https://www.bizinfo.go.kr/uss/openapi/bizinfoApi.do";
  readonly defaultBidType: BidType = "SUBSIDY_SUPPORT";

  private getApiKey(): string | undefined {
    return process.env.BIZINFO_API_KEY || process.env.DATA_GO_KR_SERVICE_KEY;
  }

  async checkHealth(): Promise<ProviderHealthCheckResult> {
    const key = this.getApiKey();
    const now = new Date().toISOString();

    if (!key) {
      return {
        status: "KEY_MISSING",
        message: "BIZINFO_API_KEY (또는 DATA_GO_KR_SERVICE_KEY) 환경변수가 설정되지 않았습니다.",
        lastCheckedAt: now,
      };
    }

    try {
      const startTime = Date.now();
      const endpoint = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${this.safeEncodeServiceKey(
        key
      )}&dataType=json&searchCnt=1`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;

      if (res.status === 429) {
        return {
          status: "RATE_LIMITED",
          message: "Rate limit 도달",
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

      const json = await res.json().catch(() => null);
      if (json?.jsonArray && Array.isArray(json.jsonArray)) {
        return {
          status: "CONNECTED",
          message: `기업마당 실시간 지원사업 API 정상 연결 확인 (${json.jsonArray.length}건 응답)`,
          latencyMs,
          lastCheckedAt: now,
        };
      }

      return {
        status: "CONNECTED",
        message: "기업마당 API 정상 통신 확인",
        latencyMs,
        lastCheckedAt: now,
      };
    } catch (err: any) {
      return {
        status: "FAILED",
        message: err.name === "AbortError" ? "요청 타임아웃" : err.message,
        latencyMs: 0,
        lastCheckedAt: now,
      };
    }
  }

  async fetchRaw(options: FetchOptions = {}): Promise<FetchResult> {
    const key = this.getApiKey();
    if (!key) {
      return { items: [], totalCount: 0, pageNo: options.pageNo || 1, numOfRows: options.numOfRows || 20 };
    }

    const pageNo = options.pageNo || 1;
    const numOfRows = options.numOfRows || 20;

    const endpoint = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${this.safeEncodeServiceKey(
      key
    )}&dataType=json&searchCnt=${numOfRows}`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`기업마당 API Fetch 실패 (HTTP ${res.status})`);
    }

    const json = await res.json();
    const items = json?.jsonArray || json?.items || [];
    const totalCount = json?.totalCount || items.length;

    return {
      items: Array.isArray(items) ? items : [items],
      totalCount,
      pageNo,
      numOfRows,
    };
  }

  normalize(raw: any): NormalizedOpportunityPayload {
    const sourceId = String(raw.pblancId || raw.id || `BIZINFO-${Date.now()}`);
    const title = raw.pblancNm || raw.title || "무제 중소기업 지원사업";
    const announcingAgency = raw.jrsdInsttNm || "중소벤처기업부";
    const demandingAgency = raw.excInsttNm || announcingAgency;

    // Dates often in "YYYYMMDD ~ YYYYMMDD" or separate
    let postedAt = new Date().toISOString();
    let submissionDeadline = new Date(Date.now() + 14 * 86400000).toISOString();

    if (raw.reqstBeginEndDe) {
      const parts = raw.reqstBeginEndDe.split("~");
      if (parts[0]) postedAt = this.parseDateToIso(parts[0].trim());
      if (parts[1]) submissionDeadline = this.parseDateToIso(parts[1].trim());
    } else {
      if (raw.creatPnttm) postedAt = this.parseDateToIso(raw.creatPnttm);
      if (raw.reqstEndDe) submissionDeadline = this.parseDateToIso(raw.reqstEndDe);
    }

    const primaryDomain = this.classifyDomain(
      title,
      `${raw.bsnsSumry || ""} ${raw.indstry || ""}`
    );

    return {
      sourceId,
      title,
      announcingAgency,
      demandingAgency,
      bidType: "LOCAL_GOV",
      primaryDomain,
      postedAt,
      submissionDeadline,
      canonicalUrl: raw.pblancUrl || "https://www.bizinfo.go.kr",
      rawPayload: raw,
      attachments: [],
    };
  }
}
