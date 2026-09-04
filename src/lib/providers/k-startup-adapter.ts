import { BaseProviderAdapter } from "./base-adapter";
import {
  FetchOptions,
  FetchResult,
  NormalizedOpportunityPayload,
  ProviderHealthCheckResult,
} from "./types";
import { BidType } from "@/types";

export class KStartupAdapter extends BaseProviderAdapter {
  readonly id = "k_startup";
  readonly name = "K-Startup (창업진흥원)";
  readonly sourceUrl = "https://www.data.go.kr/data/15083166/openapi.do";
  readonly defaultBidType: BidType = "SUBSIDY_SUPPORT";

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
      const endpoint = `http://apis.data.go.kr/B552735/k-startup-service/getAnnouncementInformation01?serviceKey=${encodeURIComponent(
        key
      )}&numOfRows=1&pageNo=1&returnType=json`;

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

      return {
        status: "CONNECTED",
        message: "K-Startup 공공데이터 API 정상 통신 확인",
        latencyMs,
        lastCheckedAt: now,
      };
    } catch (err: any) {
      return {
        status: "FAILED",
        message: err.name === "AbortError" ? "요청 타임아웃" : err.message,
        lastCheckedAt: now,
      };
    }
  }

  async fetchRaw(options: FetchOptions = {}): Promise<FetchResult> {
    const key = this.getServiceKey();
    if (!key) {
      return { items: [], totalCount: 0, pageNo: options.pageNo || 1, numOfRows: options.numOfRows || 20 };
    }

    const pageNo = options.pageNo || 1;
    const numOfRows = options.numOfRows || 20;

    const endpoint = `http://apis.data.go.kr/B552735/k-startup-service/getAnnouncementInformation01?serviceKey=${encodeURIComponent(
      key
    )}&pageNo=${pageNo}&numOfRows=${numOfRows}&returnType=json`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`K-Startup API Fetch 실패 (HTTP ${res.status})`);
    }

    const json = await res.json();
    const items = json?.data || json?.response?.body?.items || [];
    const totalCount = json?.totalCount || items.length;

    return {
      items: Array.isArray(items) ? items : [items],
      totalCount,
      pageNo,
      numOfRows,
    };
  }

  normalize(raw: any): NormalizedOpportunityPayload {
    const sourceId = String(raw.post_sn || raw.ann_id || `KSTARTUP-${Date.now()}`);
    const title = raw.biz_pbanc_nm || raw.title || "무제 창업지원사업";
    const announcingAgency = raw.pbanc_ntce_instt_nm || raw.agency || "창업진흥원";
    const demandingAgency = raw.supt_biz_instt_nm || announcingAgency;

    const postedAt = this.parseDateToIso(raw.pbanc_rcpt_bgng_dt || raw.start_date);
    const submissionDeadline = this.parseDateToIso(raw.pbanc_rcpt_end_dt || raw.end_date);

    const primaryDomain = this.classifyDomain(
      title,
      `${raw.supt_biz_clsfc || ""} ${raw.pbanc_ctnt || ""}`
    );

    return {
      sourceId,
      title,
      announcingAgency,
      demandingAgency,
      bidType: "SUBSIDY_SUPPORT",
      primaryDomain,
      allocatedBudget: raw.supt_scale ? Number(raw.supt_scale) : null,
      postedAt,
      submissionDeadline,
      canonicalUrl: raw.detl_pg_url || "https://www.k-startup.go.kr",
      rawPayload: raw,
      attachments: [],
    };
  }
}
