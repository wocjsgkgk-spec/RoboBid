import { z } from "zod";

export const EvidenceCategorySchema = z.enum([
  "CORPORATE",       // 사업자등록증, 법인등기부등본, 중소기업확인서
  "PATENT",          // 특허등록증, 실용신안, 디자인등록
  "CERTIFICATE",     // 이노비즈, 벤처, 메인비즈, ISO9001
  "PERFORMANCE",     // 실적증명서, 납품완료확인서, 계약서
  "FINANCIAL",       // 재무제표증명원, 국세/지방세 완납증명서, 신용평가서
  "PRODUCT_TECH",    // 제품 카탈로그, 기술사양서, 시험성적서(KTL, KTR)
  "PROPOSAL_DRAFT",  // 기 제출 제안서, 발표자료
  "OTHER",
]);
export type EvidenceCategory = z.infer<typeof EvidenceCategorySchema>;

export interface EvidenceItem {
  id: string;
  name: string;
  category: EvidenceCategory;
  fileExtension: string; // pdf, hwp, docx, png
  fileSizeBytes: number;
  issueDate?: string;
  expiryDate?: string;
  isExpired?: boolean;
  securityLevel: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL";
  assignee: string;
  tags: string[];
  description?: string;
  linkedOpportunityIds: string[];
  linkedProposalIds: string[];
  reusableScore: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
}
