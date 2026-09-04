import crypto from "crypto";
import { NormalizedOpportunityPayload } from "../providers/types";

export interface DeduplicationResult {
  isDuplicate: boolean;
  isAmendment: boolean; // 수정공고 여부
  existingOpportunityId?: string;
  matchedBy?: "source_id" | "canonical_url" | "title_agency_dates" | "content_hash";
  newContentHash: string;
}

export interface ExistingOpportunitySummary {
  id: string;
  providerId: string;
  sourceId: string;
  title: string;
  announcingAgency: string;
  postedAt: string;
  submissionDeadline: string;
  canonicalUrl?: string | null;
  contentHash: string;
  currentVersion: number;
}

export class Deduplicator {
  /**
   * Deterministic SHA-256 hash generator
   */
  public static computeHash(payload: Record<string, any>): string {
    const keys = Object.keys(payload).sort();
    const sortedObj: Record<string, any> = {};
    for (const key of keys) {
      sortedObj[key] = payload[key];
    }
    return crypto.createHash("sha256").update(JSON.stringify(sortedObj)).digest("hex");
  }

  /**
   * Normalize strings for fuzzy comparison
   */
  public static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\[.*?\]|\(.*?\)/g, "") // remove brackets like [재공고], (긴급)
      .replace(/[^a-z0-9가-힣]/g, "") // remove punctuation and spaces
      .trim();
  }

  /**
   * Evaluate a candidate opportunity against existing records in DB/cache.
   */
  public static evaluate(
    candidate: NormalizedOpportunityPayload,
    providerId: string,
    existingList: ExistingOpportunitySummary[]
  ): DeduplicationResult {
    const newContentHash = this.computeHash(candidate.rawPayload);

    for (const existing of existingList) {
      // 1. Direct provider + source_id match
      if (existing.providerId === providerId && existing.sourceId === candidate.sourceId) {
        if (existing.contentHash === newContentHash) {
          // Exact same content -> completely duplicate, skip
          return {
            isDuplicate: true,
            isAmendment: false,
            existingOpportunityId: existing.id,
            matchedBy: "source_id",
            newContentHash,
          };
        } else {
          // Same source ID but different content or deadline -> Amendment!
          return {
            isDuplicate: false,
            isAmendment: true,
            existingOpportunityId: existing.id,
            matchedBy: "source_id",
            newContentHash,
          };
        }
      }

      // 2. Canonical URL match
      if (
        candidate.canonicalUrl &&
        existing.canonicalUrl &&
        candidate.canonicalUrl === existing.canonicalUrl
      ) {
        return {
          isDuplicate: existing.contentHash === newContentHash,
          isAmendment: existing.contentHash !== newContentHash,
          existingOpportunityId: existing.id,
          matchedBy: "canonical_url",
          newContentHash,
        };
      }

      // 3. Exact content hash match
      if (existing.contentHash === newContentHash) {
        return {
          isDuplicate: true,
          isAmendment: false,
          existingOpportunityId: existing.id,
          matchedBy: "content_hash",
          newContentHash,
        };
      }

      // 4. Normalized title + agency match
      const normCandidateTitle = this.normalizeText(candidate.title);
      const normExistingTitle = this.normalizeText(existing.title);
      const normCandidateAgency = this.normalizeText(candidate.announcingAgency);
      const normExistingAgency = this.normalizeText(existing.announcingAgency);

      if (
        normCandidateTitle.length > 5 &&
        normCandidateTitle === normExistingTitle &&
        normCandidateAgency === normExistingAgency
      ) {
        return {
          isDuplicate: true,
          isAmendment: false,
          existingOpportunityId: existing.id,
          matchedBy: "title_agency_dates",
          newContentHash,
        };
      }
    }

    // Brand new opportunity
    return {
      isDuplicate: false,
      isAmendment: false,
      newContentHash,
    };
  }
}
