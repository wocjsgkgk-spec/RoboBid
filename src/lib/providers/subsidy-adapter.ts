import { BaseProviderAdapter } from "./base-adapter";
import {
  FetchOptions,
  FetchResult,
  NormalizedOpportunityPayload,
  ProviderHealthCheckResult,
} from "./types";
import { BidType } from "@/types";

export class SubsidyAdapter extends BaseProviderAdapter {
  readonly id = "subsidy";
  readonly name = "국고보조금 공모사업 (e나라도움)";
  readonly sourceUrl = "https://www.bojo.go.kr";
  readonly defaultBidType: BidType = "NATIONAL_PROJECT";

  async checkHealth(): Promise<ProviderHealthCheckResult> {
    const key = process.env.DATA_GO_KR_SERVICE_KEY;
    const now = new Date().toISOString();

    if (!key) {
      return {
        status: "KEY_MISSING",
        message: "DATA_GO_KR_SERVICE_KEY 환경변수가 설정되지 않았습니다.",
        lastCheckedAt: now,
      };
    }

    return {
      status: "CONNECTED",
      message: "국고보조금 포털 연계 대기",
      lastCheckedAt: now,
    };
  }

  async fetchRaw(options: FetchOptions = {}): Promise<FetchResult> {
    return { items: [], totalCount: 0, pageNo: 1, numOfRows: 20 };
  }

  normalize(raw: any): NormalizedOpportunityPayload {
    const sourceId = String(raw.pblntId || `SUBSIDY-${Date.now()}`);
    const title = raw.pblntNm || "국고보조사업";
    return {
      sourceId,
      title,
      announcingAgency: raw.jrsdMofNm || "기획재정부",
      demandingAgency: raw.operInstNm,
      bidType: "NATIONAL_PROJECT",
      primaryDomain: this.classifyDomain(title),
      allocatedBudget: raw.totBsnsAmt ? Number(raw.totBsnsAmt) : null,
      postedAt: this.parseDateToIso(raw.pblntBgngYmd),
      submissionDeadline: this.parseDateToIso(raw.pblntEndYmd),
      canonicalUrl: "https://www.bojo.go.kr",
      rawPayload: raw,
      attachments: [],
    };
  }
}
