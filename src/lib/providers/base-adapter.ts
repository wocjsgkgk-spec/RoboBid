import crypto from "crypto";
import {
  ProviderAdapter,
  ProviderHealthCheckResult,
  FetchOptions,
  FetchResult,
  NormalizedOpportunityPayload,
} from "./types";
import { BidType } from "@/types";

export abstract class BaseProviderAdapter implements ProviderAdapter {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly sourceUrl: string;
  abstract readonly defaultBidType: BidType;

  abstract checkHealth(): Promise<ProviderHealthCheckResult>;
  abstract fetchRaw(options?: FetchOptions): Promise<FetchResult>;
  abstract normalize(rawItem: any): NormalizedOpportunityPayload;

  /**
   * Safely encodes a public data portal API key avoiding double-encoding.
   * Public data portal keys may be provided as decoded or pre-encoded strings.
   */
  public safeEncodeServiceKey(key: string): string {
    if (!key) return "";
    try {
      // Decode first in case the user pasted an already URL-encoded key
      const decoded = decodeURIComponent(key);
      return encodeURIComponent(decoded);
    } catch {
      // If decoding fails, fallback to direct encodeURIComponent
      return encodeURIComponent(key);
    }
  }

  /**
   * Generates a deterministic SHA-256 content hash for change detection & deduplication.
   */
  public generateContentHash(data: Record<string, any>): string {
    const serialized = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Classifies primary domain based on PRD Section 4 rules.
   * Priority A: Robot
   * Priority B: Automation, Smart Farm, AI/ICT, Vision, Embedded, Special Hardware
   */
  public classifyDomain(title: string, content: string = ""): string {
    const text = `${title} ${content}`.toLowerCase();

    // Priority A: Robot
    const robotKeywords = [
      "로봇",
      "robot",
      "amr",
      "agv",
      "이동로봇",
      "협동로봇",
      "자율주행로봇",
      "서비스로봇",
      "산업용로봇",
      "특수목적로봇",
      "재난로봇",
      "농업로봇",
      "웨이퍼로봇",
      "배송로봇",
    ];
    if (robotKeywords.some((kw) => text.includes(kw))) {
      return "ROBOT";
    }

    // Priority B: Automation, Smart Farm, Hardware
    const automationKeywords = [
      "스마트팜",
      "스마트팩토리",
      "자동화",
      "공정자동화",
      "vision",
      "머신비전",
      "임베디드",
      "embedded",
      "센서",
      "iot",
      "특수목적",
      "무인이동체",
      "드론",
    ];
    if (automationKeywords.some((kw) => text.includes(kw))) {
      return "AUTOMATION_HARDWARE";
    }

    // Priority B: AI/ICT
    const aiKeywords = ["ai", "인공지능", "딥러닝", "빅데이터", "ict", "소프트웨어"];
    if (aiKeywords.some((kw) => text.includes(kw))) {
      return "AI_ICT";
    }

    return "GENERAL";
  }

  /**
   * Utility for safe date parsing into ISO 8601
   */
  protected parseDateToIso(dateStr: string | undefined | null, fallback: Date = new Date()): string {
    if (!dateStr) return fallback.toISOString();

    // Handle common Korean public date formats: YYYYMMDD, YYYYMMDDHHMM, YYYY-MM-DD HH:MM:SS
    const clean = dateStr.replace(/[^0-9]/g, "");
    if (clean.length === 8) {
      // YYYYMMDD
      const y = clean.substring(0, 4);
      const m = clean.substring(4, 6);
      const d = clean.substring(6, 8);
      return new Date(`${y}-${m}-${d}T00:00:00+09:00`).toISOString();
    }
    if (clean.length === 12) {
      // YYYYMMDDHHMM
      const y = clean.substring(0, 4);
      const m = clean.substring(4, 6);
      const d = clean.substring(6, 8);
      const h = clean.substring(8, 10);
      const min = clean.substring(10, 12);
      return new Date(`${y}-${m}-${d}T${h}:${min}:00+09:00`).toISOString();
    }
    if (clean.length >= 14) {
      // YYYYMMDDHHMMSS
      const y = clean.substring(0, 4);
      const m = clean.substring(4, 6);
      const d = clean.substring(6, 8);
      const h = clean.substring(8, 10);
      const min = clean.substring(10, 12);
      const s = clean.substring(12, 14);
      return new Date(`${y}-${m}-${d}T${h}:${min}:${s}+09:00`).toISOString();
    }

    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed.toISOString();
    } catch {
      // Fallback
    }

    return fallback.toISOString();
  }
}
