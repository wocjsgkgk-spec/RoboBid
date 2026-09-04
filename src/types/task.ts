import { z } from "zod";

export const TaskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "WAITING", "REVIEW", "DONE"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export interface Task {
  id: string;
  title: string;
  description?: string;
  opportunityId?: string;
  opportunityTitle?: string;
  bidRoomId?: string;
  proposalId?: string;
  proposalSectionCode?: string;
  requirementCode?: string;
  submissionItemId?: string;
  assignee: string;
  reviewer?: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  category: "ELIGIBILITY" | "RFP_REVIEW" | "PROPOSAL_DRAFT" | "EVIDENCE_SUBMISSION" | "LEGAL_SIGN" | "GENERAL";
  comment?: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt: string;
}
