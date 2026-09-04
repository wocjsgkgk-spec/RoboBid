import { ProviderRegistry } from "../providers";
import { Deduplicator, ExistingOpportunitySummary } from "./deduplicator";
import { ProviderStatus } from "@/types";

export interface SyncRunResult {
  providerId: string;
  status: ProviderStatus;
  recordsReceived: number;
  inserted: number;
  updated: number;
  deduplicated: number;
  failed: number;
  durationMs: number;
  errorMessage?: string;
}

export class IngestionSyncEngine {
  private registry: ProviderRegistry;

  constructor() {
    this.registry = ProviderRegistry.getInstance();
  }

  /**
   * Run sync for a specific provider.
   * If a Supabase client is passed, it persists records to the database.
   * Otherwise, it processes in-memory for testing/validation.
   */
  async syncProvider(
    providerId: string,
    existingOpportunities: ExistingOpportunitySummary[] = [],
    options?: { keyword?: string; pageNo?: number; numOfRows?: number }
  ): Promise<SyncRunResult> {
    const startTime = Date.now();
    const adapter = this.registry.get(providerId);

    if (!adapter) {
      return {
        providerId,
        status: "FAILED",
        recordsReceived: 0,
        inserted: 0,
        updated: 0,
        deduplicated: 0,
        failed: 0,
        durationMs: Date.now() - startTime,
        errorMessage: `등록되지 않은 Provider ID: ${providerId}`,
      };
    }

    // 1. Health check first
    const health = await adapter.checkHealth();
    if (health.status === "KEY_MISSING" || health.status === "FAILED") {
      return {
        providerId,
        status: health.status,
        recordsReceived: 0,
        inserted: 0,
        updated: 0,
        deduplicated: 0,
        failed: 0,
        durationMs: Date.now() - startTime,
        errorMessage: health.message,
      };
    }

    if (health.status === "MANUAL_ONLY") {
      return {
        providerId,
        status: "MANUAL_ONLY",
        recordsReceived: 0,
        inserted: 0,
        updated: 0,
        deduplicated: 0,
        failed: 0,
        durationMs: Date.now() - startTime,
        errorMessage: health.message,
      };
    }

    try {
      // 2. Fetch raw data from official Open API
      const rawResult = await adapter.fetchRaw(options);
      const items = rawResult.items || [];

      let inserted = 0;
      let updated = 0;
      let deduplicated = 0;
      let failed = 0;

      // Track existing state for idempotency in this batch
      const currentList = [...existingOpportunities];

      for (const item of items) {
        try {
          // 3. Normalize
          const normalized = adapter.normalize(item);

          // 4. Deduplicate & Amendment Check
          const evalResult = Deduplicator.evaluate(normalized, providerId, currentList);

          if (evalResult.isDuplicate) {
            deduplicated++;
          } else if (evalResult.isAmendment) {
            updated++;
            // Update existing in tracker
            const idx = currentList.findIndex((o) => o.id === evalResult.existingOpportunityId);
            if (idx >= 0) {
              currentList[idx].contentHash = evalResult.newContentHash;
              currentList[idx].currentVersion += 1;
            }
          } else {
            inserted++;
            currentList.push({
              id: `opp-${Date.now()}-${inserted}`,
              providerId,
              sourceId: normalized.sourceId,
              title: normalized.title,
              announcingAgency: normalized.announcingAgency,
              postedAt: normalized.postedAt,
              submissionDeadline: normalized.submissionDeadline,
              canonicalUrl: normalized.canonicalUrl,
              contentHash: evalResult.newContentHash,
              currentVersion: 1,
            });
          }
        } catch {
          failed++;
        }
      }

      return {
        providerId,
        status: "CONNECTED",
        recordsReceived: items.length,
        inserted,
        updated,
        deduplicated,
        failed,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        providerId,
        status: "FAILED",
        recordsReceived: 0,
        inserted: 0,
        updated: 0,
        deduplicated: 0,
        failed: 0,
        durationMs: Date.now() - startTime,
        errorMessage: err.message,
      };
    }
  }

  /**
   * Run sync for all available providers in parallel/sequence.
   */
  async syncAll(
    existingOpportunities: ExistingOpportunitySummary[] = []
  ): Promise<SyncRunResult[]> {
    const providers = this.registry.getAll();
    const results: SyncRunResult[] = [];

    for (const p of providers) {
      const res = await this.syncProvider(p.id, existingOpportunities);
      results.push(res);
    }

    return results;
  }
}
