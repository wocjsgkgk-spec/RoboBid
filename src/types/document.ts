import { z } from "zod";

export const ParseStatusSchema = z.enum([
  "PENDING",
  "PARSING",
  "PARSED",
  "FAILED",
  "UNSUPPORTED",
  "REVIEW_REQUIRED",
]);
export type ParseStatus = z.infer<typeof ParseStatusSchema>;

export const RequirementCategorySchema = z.enum([
  "TECHNICAL",
  "ELIGIBILITY",
  "FINANCIAL",
  "SUBMISSION",
  "SCHEDULE",
  "EVALUATION",
  "OTHER",
]);
export type RequirementCategory = z.infer<typeof RequirementCategorySchema>;

export interface RfpSection {
  id: string;
  title: string;
  content: string;
  pageNumber?: number;
  level: number;
}

export interface RfpTable {
  id: string;
  title?: string;
  headers: string[];
  rows: string[][];
  pageNumber?: number;
}

export interface RequirementCandidate {
  reqCode: string; // e.g. "REQ-TEC-001"
  title: string;
  description: string;
  category: RequirementCategory;
  isMandatory: boolean;
  weight?: number;
  citationPage?: number;
  citationSection?: string;
  citationQuote: string; // Exact evidence quote from RFP text
}

export interface ParsedDocumentResult {
  fileName: string;
  fileSizeBytes: number;
  contentHash: string; // SHA-256
  detectedMimeType: string;
  parseStatus: ParseStatus;
  rawText: string;
  sections: RfpSection[];
  tables: RfpTable[];
  requirementCandidates: RequirementCandidate[];
  metadata: {
    title?: string;
    author?: string;
    creationDate?: string;
    pageCount?: number;
    wordCount?: number;
    durationMs?: number;
    [key: string]: any;
  };
  errorMessage?: string;
}
