import { BaseProviderAdapter } from "./base-adapter";
import {
  FetchOptions,
  FetchResult,
  NormalizedOpportunityPayload,
  ProviderHealthCheckResult,
} from "./types";
import { BidType } from "@/types";

export class IrisAdapter extends BaseProviderAdapter {
  readonly id = "iris";
  readonly name = "범부처통합연구지원시스템 (IRIS)";
  readonly sourceUrl = "https://www.iris.go.kr";
  readonly defaultBidType: BidType = "R_AND_D";

  async checkHealth(): Promise<ProviderHealthCheckResult> {
    // PRD Section 12 Policy: IRIS currently does not have an open public API.
    // Must strictly operate in MANUAL_ONLY mode until official API agreement.
    return {
      status: "MANUAL_ONLY",
      message: "공식 대외 Open API 미제공 (PRD 정책: 비인가 스크래핑 금지, 사용자 수동 등록 및 첨부파일 분석 모드로 운영)",
      lastCheckedAt: new Date().toISOString(),
    };
  }

  async fetchRaw(options: FetchOptions = {}): Promise<FetchResult> {
    // Automated scraping is explicitly forbidden by PRD rules.
    return { items: [], totalCount: 0, pageNo: 1, numOfRows: 0 };
  }

  normalize(raw: any): NormalizedOpportunityPayload {
    const sourceId = String(raw.noticeId || `IRIS-${Date.now()}`);
    const title = raw.title || "무제 R&D 공고";
    return {
      sourceId,
      title,
      announcingAgency: raw.agency || "한국연구재단/IRIS",
      demandingAgency: raw.demandAgency,
      bidType: "R_AND_D",
      primaryDomain: this.classifyDomain(title),
      allocatedBudget: raw.budget ? Number(raw.budget) : null,
      postedAt: this.parseDateToIso(raw.postedAt),
      submissionDeadline: this.parseDateToIso(raw.deadline),
      canonicalUrl: raw.url || "https://www.iris.go.kr",
      rawPayload: raw,
      attachments: raw.attachments || [],
    };
  }
}
