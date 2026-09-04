import { BidType, ProviderStatus } from "@/types";

export interface ProviderHealthCheckResult {
  status: ProviderStatus;
  message?: string;
  latencyMs?: number;
  lastCheckedAt: string;
}

export interface RawAttachment {
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface NormalizedOpportunityPayload {
  sourceId: string;
  title: string;
  announcingAgency: string;
  demandingAgency?: string | null;
  bidType: BidType;
  primaryDomain: string; // e.g., "ROBOT", "AUTOMATION", "AI_ICT"
  allocatedBudget?: number | null;
  estimatedPrice?: number | null;
  postedAt: string; // ISO 8601
  submissionDeadline: string; // ISO 8601
  canonicalUrl?: string | null;
  rawPayload: Record<string, any>;
  attachments: RawAttachment[];
}

export interface FetchOptions {
  pageNo?: number;
  numOfRows?: number;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface FetchResult {
  items: any[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
}

export interface ProviderAdapter {
  readonly id: string;
  readonly name: string;
  readonly sourceUrl: string;
  readonly defaultBidType: BidType;

  checkHealth(): Promise<ProviderHealthCheckResult>;
  fetchRaw(options?: FetchOptions): Promise<FetchResult>;
  normalize(rawItem: any): NormalizedOpportunityPayload;
}
