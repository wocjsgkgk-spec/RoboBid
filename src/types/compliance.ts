import { z } from 'zod';

export type ComplianceStatus =
  | 'SATISFIED'
  | 'PARTIAL'
  | 'MISSING'
  | 'NOT_APPLICABLE'
  | 'REVIEW_REQUIRED';

export interface RequirementMatrixItem {
  id: string;
  proposalId: string;
  requirementCode: string;
  category: string;
  originalText: string;
  isMandatory: boolean;
  sourceLocation?: string | null;
  mappedSectionCode?: string | null;
  complianceStatus: ComplianceStatus;
  matchedTextSnippet?: string | null;
  evidenceNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceAuditSummary {
  totalCount: number;
  satisfiedCount: number;
  partialCount: number;
  missingCount: number;
  notApplicableCount: number;
  reviewRequiredCount: number;
  mandatoryMissingCount: number;
  complianceRatePercent: number; // 0 to 100
  canSubmit: boolean; // false if mandatoryMissingCount > 0
  blockingWarnings: string[];
}

export interface SubmissionChecklist {
  id: string;
  proposalId: string;
  allMandatorySatisfied: boolean;
  documentsReady: boolean;
  sealAndSignatureVerified: boolean;
  formatAndSizeVerified: boolean;
  submissionUrlVerified: boolean;
  submitterAssigned: boolean;
  finalFileName?: string | null;
  finalFileHash?: string | null; // SHA-256
  submissionUrl?: string | null;
  submitterName?: string | null;
  confirmedBy?: string | null;
  submittedAt?: string | null;
  submissionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionConfirmationPayload {
  proposalId: string;
  submitterName: string;
  submissionUrl?: string;
  finalFileName: string;
  finalFileHash: string;
  submissionNotes?: string;
  confirmedByUserId?: string;
}
